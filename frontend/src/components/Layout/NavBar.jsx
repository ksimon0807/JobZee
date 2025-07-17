import React, { useContext, useState } from "react";
import { Context } from "../../main";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./NavBarModernDark.css";

const NavBar = () => {
  const [show, setShow] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { isAuthorized, setIsAuthorized, user, setUser } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`,
        { withCredentials: true }
      );
      // Clear cookie manually in addition to server clearing it
      const isProduction = import.meta.env.MODE === 'production';
      
      // Clear cookie with proper options for all environments
      document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${isProduction ? 'secure; samesite=None;' : ''}`;
      
      // Clear ALL authentication data from localStorage
      localStorage.removeItem('isAuthorized');
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // This was missing!
      setIsAuthorized(false);
      setUser({});
      toast.success(response.data.message);
      navigateTo("/login");
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if the server call fails, we still want to clear local data
      localStorage.removeItem('isAuthorized');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      toast.error(error.response?.data?.message || "Logout failed");
      setIsAuthorized(false);
      setUser({});
      navigateTo("/login");
    } finally {
      setLoggingOut(false);
      setShow(false);
    }
  };

  const toggleMenu = () => setShow(!show);
  const closeMenu = () => setShow(false);

  return (
    <>
      <nav className={isAuthorized ? "navbarShow" : "navbarHide"}>
        <div className="container">
          <div className="logo">
            <Link to="/" onClick={closeMenu} tabIndex={0} aria-label="Home">
              <img src="/JobZee-logos__white.png" alt="JobZee logo" />
            </Link>
          </div>
          {/* Desktop Menu */}
          <ul className="desktop-menu">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/job/getall">All Jobs</Link></li>
            <li>
              <Link to="/application/me">
                {user?.role === "Employer" ? "Applicant's Applications" : "My Applications"}
              </Link>
            </li>
            {user?.role === "Employer" && (
              <>
                <li><Link to="/job/post">Post New Job</Link></li>
                <li><Link to="/job/me">View Your Jobs</Link></li>
              </>
            )}
            <li><Link to="/profile">Profile</Link></li>
            <li>
              <button onClick={handleLogout} disabled={loggingOut} className="logout-btn">
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </li>
          </ul>
          {/* Hamburger Button */}
          <button className={`hamburger-btn${show ? ' open' : ''}`} onClick={toggleMenu} aria-label="Open menu" aria-expanded={show}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
      {/* Mobile Sidebar Overlay */}
      {show && (
        <div className="mobile-sidebar-overlay" onClick={closeMenu}>
          <div className="mobile-sidebar" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="mobile-sidebar-header">
              <img src="/JobZee-logos__white.png" alt="logo" />
              <button onClick={closeMenu} className="mobile-sidebar-close">×</button>
            </div>
            {/* Navigation Links */}
            <div className="mobile-sidebar-links">
              <Link to="/" onClick={closeMenu}>Home</Link>
              <Link to="/job/getall" onClick={closeMenu}>All Jobs</Link>
              <Link to="/application/me" onClick={closeMenu}>
                {user?.role === "Employer" ? "Applicant's Applications" : "My Applications"}
              </Link>
              {user?.role === "Employer" && (
                <>
                  <Link to="/job/post" onClick={closeMenu}>Post New Job</Link>
                  <Link to="/job/me" onClick={closeMenu}>View Your Jobs</Link>
                </>
              )}
              <Link to="/profile" onClick={closeMenu}>Profile</Link>
            </div>
            {/* Logout Button */}
            <div className="mobile-sidebar-logout">
              <button onClick={() => { handleLogout(); closeMenu(); }} disabled={loggingOut} className={loggingOut ? 'logout-btn animating' : 'logout-btn'}>
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
