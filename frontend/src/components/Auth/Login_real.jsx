import React, { useContext, useState, useEffect, useCallback } from "react";
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

  const handleGoogleResponse = useCallback(async (response) => {
    try {
      // Check if role is selected
      if (!role) {
        toast.error("Please select a role before signing in with Google");
        return;
      }

      // Decode the JWT token from Google
      const credential = response.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      const googleData = {
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        imageUrl: payload.picture,
      };

      // Try to login with Google
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/google/login`,
          { 
            email: googleData.email,
            googleId: googleData.googleId,
            role: role 
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        
        toast.success(data.message);
        setIsAuthorized(true);
        setUser(data.user);
      } catch (error) {
        // If login fails, try to register
        if (error.response && error.response.status === 404) {
          try {
            const { data } = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/google/register`,
              { 
                name: googleData.name,
                email: googleData.email, 
                role: role,
                googleId: googleData.googleId 
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
                withCredentials: true,
              }
            );
            
            toast.success(data.message);
            setIsAuthorized(true);
            setUser(data.user);
          } catch (registerError) {
            toast.error(registerError.response?.data?.message || "Registration failed");
          }
        } else {
          toast.error(error.response?.data?.message || "Login failed");
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error("Google login failed. Please try again.");
    }
  }, [role, setIsAuthorized, setUser]);

  // Load Google Identity Services
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com',
          callback: handleGoogleResponse,
        });
      }
    };

    // Check if Google Identity Services is already loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for Google Identity Services to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          initializeGoogleSignIn();
          clearInterval(checkGoogle);
        }
      }, 100);

      // Clear interval after 10 seconds to prevent infinite loop
      setTimeout(() => clearInterval(checkGoogle), 10000);
    }
  }, [handleGoogleResponse]);

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

  const handleGoogleLogin = () => {
    // Check if role is selected
    if (!role) {
      toast.error("Please select a role before signing in with Google");
      return;
    }

    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      toast.error("Google Sign-In is not available. Please try again.");
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
              onClick={handleGoogleLogin}
              className="google-btn"
            >
              <FaGoogle /> Continue with Google
            </button>
            
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
