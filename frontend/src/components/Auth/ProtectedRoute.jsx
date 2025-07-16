import React, { useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Context } from '../../main';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {"auth" | "guest"} [props.authType="auth"] - Whether route requires auth or no auth
 * @param {"Employer" | "Job seeker"} [props.requiredRole] - Optional role requirement
 */
const ProtectedRoute = ({ children, authType = "auth", requiredRole }) => {
  const { isAuthorized, user } = useContext(Context);
  const location = useLocation();
  const [initialCheck, setInitialCheck] = useState(false);
  
  // Function to get cookie by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const hasToken = !!getCookie('token');
  const hasLocalAuth = localStorage.getItem('isAuthorized') === 'true';

  useEffect(() => {
    // Set initialCheck to true after the first render
    const timer = setTimeout(() => setInitialCheck(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  console.log('ProtectedRoute state:', {
    path: location.pathname,
    isAuthorized,
    hasToken,
    hasLocalAuth,
    initialCheck,
    authType,
    userRole: user?.role,
    requiredRole
  });

  // Show loading during initial check or when we have auth indicators but not confirmed
  if (!initialCheck || (!isAuthorized && (hasToken || hasLocalAuth))) {
    console.log('Showing loading state');
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

  // Handle guest-only routes (login, register)
  if (authType === "guest" && isAuthorized) {
    console.log('Authorized user trying to access guest route, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Handle auth-required routes
  if (authType === "auth") {
    if (!isAuthorized) {
      console.log('Unauthorized user trying to access protected route, redirecting to login');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If a specific role is required, check it
    if (requiredRole && user?.role !== requiredRole) {
      console.log('User lacks required role, redirecting to home');
      return <Navigate to="/" replace />;
    }
  }

  console.log('Rendering protected route content');
  return children;
};

export default ProtectedRoute;
