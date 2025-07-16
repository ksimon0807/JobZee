import React, { useContext, useState } from "react";
import { Context } from "../../main";
import { Navigate, useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();
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

      if (data.success) {
        // Update context with user data
        setUser(data.user);
        setIsAuthorized(true);

        // Clear form
        setEmail("");
        setRole("");
        setPassword("");

        // Show success message
        toast.success(data.message);

        // Navigate to home
        navigate("/");
      }
    } catch (error) {
      setIsAuthorized(false);
      setUser({});
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Generate Google OAuth URL dynamically
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${import.meta.env.VITE_BACKEND_URL}/auth/google/callback`;
    const responseType = "code";
    const scope = "profile email";

    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

    // Redirect user to Google OAuth URL
    window.location.href = googleOAuthUrl;
  };

  // If already logged in, redirect to home
  if (isAuthorized) {
    return <Navigate to="/" />;
  }
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
              toast.error(registerError.response.data.message);
            }
          } else {
            toast.error(error.response.data.message);
          }
        }
      } catch (error) {
        console.error('Google login error:', error);
        toast.error("Google login failed. Please try again.");
      }
    };

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
  }, [role, setIsAuthorized, setUser]);



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
      toast.error(error.response.data.message);
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
            <h3>Login to Your Account</h3>
          </div>
          <form onSubmit={handleLogin}>
            <div className="inputTag">
              <label>Login as</label>
              <div>
                <select value={role} onChange={(e) => setRole(e.target.value)} required>
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

            <Link to={"/register"}>Don't have an account? Register</Link>
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
