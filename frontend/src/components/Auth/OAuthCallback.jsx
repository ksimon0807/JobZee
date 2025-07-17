import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Context } from "../../main";
import toast from "react-hot-toast";
import axios from 'axios';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setIsAuthorized, setUser } = useContext(Context);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const error = searchParams.get('error');

        // Either we have an error param or we should check for auth
        // No need for success param as OAuth callback is only called on success
        if (error) {
            toast.error(decodeURIComponent(error));
            navigate('/login');
            return;
        }
        
        const getUserDetails = async () => {
            try {
                console.log('OAuth callback - attempting to get user data');
                // Get user data from the server
                const { data } = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/getuser`,
                    { withCredentials: true }
                );
                
                if (data.success && data.user) {
                    console.log('OAuth callback - user data retrieved:', data.user);
                    
                    // Store the user data in context
                    setUser(data.user);
                    setIsAuthorized(true);
                    
                    // Also store in localStorage as fallback
                    localStorage.setItem('isAuthorized', 'true');
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // If we can extract the token from cookies, save it in localStorage too
                    const getCookie = (name) => {
                        const value = `; ${document.cookie}`;
                        const parts = value.split(`; ${name}=`);
                        if (parts.length === 2) return parts.pop().split(';').shift();
                        return null;
                    };
                    
                    const token = getCookie('token');
                    if (token) {
                        localStorage.setItem('token', token);
                        console.log('OAuth callback - saved token to localStorage');
                    }
                    
                    // Show success message
                    toast.success('Successfully logged in with Google!');
                    
                    // Navigate to the home page
                    navigate('/');
                } else {
                    throw new Error('Failed to get user details');
                }
            } catch (error) {
                console.error('OAuth callback - error fetching user details:', error);
                toast.error('Failed to complete login: ' + (error.response?.data?.message || error.message));
                navigate('/login');
            }
        };

        getUserDetails();
    }, [location, navigate, setIsAuthorized, setUser]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div className="loading-spinner"></div>
            <div>Completing login...</div>
        </div>
    );
};

export default OAuthCallback;
