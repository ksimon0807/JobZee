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

  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);

  const handleLogin = async (e) => {
    e.preventDefault();
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
    }
  };

  // Mock Google Login for Development
  const handleMockGoogleLogin = async () => {
    // Check if role is selected
    if (!role) {
      toast.error("Please select a role before signing in with Google");
      return;
    }

    // Create mock Google user data
    const mockGoogleData = {
      googleId: `mock_${Date.now()}`,
      name: "Demo User",
      email: "demo@gmail.com",
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
      
      toast.success("Demo Google login successful!");
      setIsAuthorized(true);
      setUser(data.user);
    } catch (error) {
      // If registration fails because user exists, try to login
      if (error.response && error.response.status === 400 && 
          error.response.data.message.includes("already exists")) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/google/login`,
            { 
              email: mockGoogleData.email,
              googleId: mockGoogleData.googleId,
              role: role 
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );
          
          toast.success("Demo Google login successful!");
          setIsAuthorized(true);
          setUser(data.user);
        } catch (loginError) {
          toast.error(loginError.response?.data?.message || "Login failed");
        }
      } else {
        toast.error(error.response?.data?.message || "Registration failed");
      }
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
            <h3>Login to your Account</h3>
          </div>
          <form>
            <div className="inputTag">
              <label>Login as</label>
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
            <button onClick={handleLogin} type="submit">
              Login
            </button>
            
            <div className="or-divider">
              <span>OR</span>
            </div>
            
            <button 
              type="button" 
              onClick={handleMockGoogleLogin}
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
              <FaGoogle /> Demo Google Login
            </button>
            <small style={{ fontSize: '12px', color: '#666', textAlign: 'center', display: 'block' }}>
              (Demo mode - creates test user for development)
            </small>
            
            <Link to={"/register"}>Register Now</Link>
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
