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
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (success === 'true') {
            const getUserDetails = async () => {
                try {
                    // Get user data from the server
                    const { data } = await axios.get(
                        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/getuser`,
                        { withCredentials: true }
                    );
                    
                    if (data.success) {
                        console.log('User data retrieved:', data.user);
                        
                        // Store the user data in context
                        setUser(data.user);
                        setIsAuthorized(true);
                        
                        // Show success message
                        toast.success('Successfully logged in with Google!');
                        
                        // Navigate to the appropriate page based on role
                        navigate('/');
                    } else {
                        throw new Error('Failed to get user details');
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                    toast.error('Failed to complete login');
                    navigate('/login');
                }
            };

            getUserDetails();
        } else if (error) {
            toast.error(error);
            navigate('/login');
        }
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
