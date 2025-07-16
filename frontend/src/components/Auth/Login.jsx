import React, { useContext, useState } from "react";
import { Context } from "../../main";
import { Navigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { RiLock2Fill } from "react-icons/ri";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/login`,
        { email, password, role },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast.success(data.message);
      setEmail("");
      setRole("");
      setPassword("");
      setIsAuthorized(true);
      setUser(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!role) {
      toast.error("Please select a role before signing in with Google");
      return;
    }

    // Generate Google OAuth URL dynamically
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${import.meta.env.VITE_BACKEND_URL}/auth/google/callback`;
    const responseType = "code";
    const scope = "profile email";

    // Encode role for safe transmission in URL
    const encodedRole = encodeURIComponent(role);
    console.log('Sending role in OAuth:', encodedRole);
    
    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${encodedRole}`;

    // Redirect user to Google OAuth URL
    window.location.href = googleOAuthUrl;
  };

  if (isAuthorized) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <div className="authPage">
        <div className="container">
          <div className="header">
            <img src="/JobZeelogo.png" alt="logo" />
            <h3>Login to your Account</h3>
          </div>
          <form onSubmit={handleLogin}>
            <div className="inputTag">
              <label>Login as</label>
              <div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Employer">Employer</option>
                  <option value="Job seeker">Job Seeker</option>
                </select>
                <FaRegUser />
              </div>
            </div>

            <div className="inputTag">
              <label>Email</label>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
                <MdOutlineMailOutline />
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
                  required
                />
                <RiLock2Fill />
              </div>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="or-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="google-btn"
              disabled={loading}
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
              <FaGoogle /> Sign in with Google
            </button>

            <Link to="/register">Don't have an account? Register</Link>
          </form>
        </div>
        <div className="banner">
          <img src="/login.png" alt="login" />
        </div>
      </div>
    </>
  );
};

export default Login;
