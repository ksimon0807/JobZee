import React, { useEffect, useContext, useCallback, useState } from "react";
import "./App.css";
import { Context } from "./main";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import NavBar from "./components/Layout/NavBar";
import Footer from "./components/Layout/Footer";
import Home from "./components/Home/Home";
import Jobs from "./components/Job/Jobs";
import JobDetails from "./components/Job/JobDetails";
import MyJobs from "./components/Job/MyJobs";
import PostJob from "./components/Job/PostJob";
import Application from "./components/Application/Application";
import MyApplications from "./components/Application/MyApplications";
import NotFound from "./components/NotFound/NotFound";
import Profile from "./components/Profile/Profile";
import ProfileView from "./components/Profile/ProfileView";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import OAuthCallback from "./components/Auth/OAuthCallback";
import axios from "axios";
import { Toaster } from "react-hot-toast";

axios.defaults.withCredentials = true;

const App = () => {
  const { setIsAuthorized, setUser, isAuthorized } = useContext(Context);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    console.log('Fetching user data, current auth state:', isAuthorized);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/getuser`,
        { withCredentials: true }
      );

      console.log('User data response:', response.data);
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        setIsAuthorized(true);
        localStorage.setItem('isAuthorized', 'true');
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        console.log('Invalid user data, clearing auth state');
        throw new Error('Invalid user data');
      }
    } catch (error) {
      console.error("Fetch user error:", error.response?.data?.message || error.message);
      setIsAuthorized(false);
      setUser({});
      localStorage.removeItem('isAuthorized');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, [setIsAuthorized, setUser, isAuthorized]);

  // Function to get cookie by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking auth state on mount/navigation');
      console.log('Current cookies:', document.cookie);
      
      try {
        // Always try to fetch user data first - this will work if cookie auth is valid
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/getuser`,
            { withCredentials: true }
          );
          
          if (response.data.success && response.data.user) {
            console.log('Successfully fetched user data from API:', response.data.user);
            setUser(response.data.user);
            setIsAuthorized(true);
            localStorage.setItem('isAuthorized', 'true');
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setLoading(false);
            return; // Exit early if API auth worked
          }
        } catch (apiError) {
          console.log('API auth check failed, falling back to localStorage:', apiError.message);
          // Continue to localStorage check
        }
        
        // Fallback to localStorage if API call fails
        const savedAuth = localStorage.getItem('isAuthorized');
        const token = getCookie('token');
        
        console.log('Auth check:', { 
          savedAuth, 
          hasToken: !!token,
          allCookies: document.cookie 
        });

        if (savedAuth === 'true') {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            console.log('Using saved user data from localStorage');
            setUser(JSON.parse(savedUser));
            setIsAuthorized(true);
          } else {
            throw new Error('No user data in localStorage');
          }
        } else {
          console.log('No authentication found, clearing auth state');
          setIsAuthorized(false);
          setUser({});
          localStorage.removeItem('isAuthorized');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthorized(false);
        setUser({});
        localStorage.removeItem('isAuthorized');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    // Run auth check on mount
    checkAuth();
  }, [fetchUser, setIsAuthorized, setUser]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#333'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <NavBar />
      <Routes>
        {/* Guest Routes */}
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Register />}
        />

        {/* OAuth Callback */}
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job/getall"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job/:id"
          element={
            <ProtectedRoute>
              <JobDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job/post"
          element={
            <ProtectedRoute requiredRole="Employer">
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job/me"
          element={
            <ProtectedRoute>
              <MyJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/application/:id"
          element={
            <ProtectedRoute>
              <Application />
            </ProtectedRoute>
          }
        />
        <Route
          path="/application/me"
          element={
            <ProtectedRoute>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute requiredRole="Employer">
              <ProfileView />
            </ProtectedRoute>
          }
        />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <Toaster />
    </Router>
  );
};

export default App;
