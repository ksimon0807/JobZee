import React, { useContext, useState } from "react";
import { Context } from "../../main";
import { Navigate } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa";
import { FaPhoneFlip } from "react-icons/fa6";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { RiLock2Fill } from "react-icons/ri";
import { Link } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/register`,
        { name, email, password, phone, role },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast.success(data.message);
      setName("");
      setEmail("");
      setPhone("");
      setRole("");
      setPassword("");
      setUser(data.user);
      setIsAuthorized(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  const handleGoogleRegister = () => {
    // Check if role is selected
    if (!role) {
      toast.error("Please select a role before signing up with Google");
      return;
    }

    // Generate Google OAuth URL dynamically
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${import.meta.env.VITE_BACKEND_URL}/auth/google/callback`;
    const responseType = "code";
    const scope = "profile email openid";

    // Encode role for safe transmission in URL
    const encodedRole = encodeURIComponent(role);
    console.log('Sending role in OAuth:', encodedRole);
    
    // Add role as state parameter
    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&prompt=consent&access_type=offline&state=${encodedRole}`;

    // Redirect user to Google OAuth URL
    window.location.href = googleOAuthUrl;
  };

  if (isAuthorized) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <div className="authPage">
        <div className="container">
          <div className="header">
            <img src="/JobZeelogo.png" alt="logo" />
            <h3>Create Your Account</h3>
          </div>
          <form onSubmit={handleRegister}>
            <div className="inputTag">
              <label>Register as</label>
              <div>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="">Select Role</option>
                  <option value="Employer">Employer</option>
                  <option value="Job seeker">Job Seeker</option>
                </select>
                <FaRegUser />
              </div>
            </div>

            <div className="inputTag">
              <label>Name</label>
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                />
                <FaPencilAlt />
              </div>
            </div>

            <div className="inputTag">
              <label>Email</label>
              <div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ujjawal@gmail.com"
                />
                <MdOutlineMailOutline />
              </div>
            </div>

            <div className="inputTag">
              <label>Phone</label>
              <div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="1234567890"
                />
                <FaPhoneFlip />
              </div>
            </div>

            <div className="inputTag">
              <label>Password</label>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
                <RiLock2Fill />
              </div>
            </div>
            <button onClick={handleRegister} type="submit">
              Register
            </button>

            <div className="or-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              className="google-btn"
              style={{
                backgroundColor: "#4285f4",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                width: "100%",
                fontSize: "16px",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              <FaGoogle /> Sign up with Google
            </button>

            <Link to={"/login"}>Already have an account? Login</Link>
          </form>
        </div>
        <div className="banner">
          <img src="/register.png" alt="register" />
        </div>
      </div>
    </>
  );
};

export default Register;
