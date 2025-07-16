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

  // Mock Google Register for Development
  const handleMockGoogleRegister = async () => {
    // Check if role is selected
    if (!role) {
      toast.error("Please select a role before signing up with Google");
      return;
    }

    // Create mock Google user data with random email to avoid conflicts
    const randomId = Math.floor(Math.random() * 10000);
    const mockGoogleData = {
      googleId: `mock_${Date.now()}_${randomId}`,
      name: `Demo User ${randomId}`,
      email: `demo${randomId}@gmail.com`,
      imageUrl: "https://via.placeholder.com/150",
    };

    try {
      // Try to register with mock Google data
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/google/register`,
        { 
          name: mockGoogleData.name,
          email: mockGoogleData.email, 
          role: role,
          googleId: mockGoogleData.googleId 
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      
      toast.success("Demo Google registration successful!");
      setIsAuthorized(true);
      setUser(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
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
            <h3>Create a new Account</h3>
          </div>
          <form>
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
                  placeholder="Ujjawal"
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
              <label>Phone Number</label>
              <div>
                <input
                  type="number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0123456789"
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
            <button onClick={handleRegister} type="submit">Register</button>
            
            <div className="or-divider">
              <span>OR</span>
            </div>
            
            <button 
              type="button" 
              onClick={handleMockGoogleRegister}
              className="google-btn"
              style={{
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              <FaGoogle /> Demo Google Register
            </button>
            <small style={{ fontSize: '12px', color: '#666', textAlign: 'center', display: 'block' }}>
              (Demo mode - creates test user for development)
            </small>
            
            <Link to={'/login'}>Login Now</Link>
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
