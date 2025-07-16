import { StrictMode, useState, createContext, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

export const Context = createContext({ isAuthorized: false });

const AppWrapper = () => {
  const [isAuthorized, setIsAuthorized] = useState(() => {
    // Initialize from localStorage on component creation
    const savedAuth = localStorage.getItem('isAuthorized');
    return savedAuth === 'true';
  });
  
  const [user, setUser] = useState(() => {
    // Initialize from localStorage on component creation
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : {};
  });

  const [loading, setLoading] = useState(true);

  // Handle auth state changes
  const updateAuthState = (isAuth, userData = null) => {
    console.log('Updating auth state:', { isAuth, userData });
    setIsAuthorized(isAuth);
    if (userData) {
      setUser(userData);
    } else if (!isAuth) {
      setUser({});
    }
  };

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    console.log('Auth state changed:', { isAuthorized, user });
    if (isAuthorized && Object.keys(user).length > 0) {
      localStorage.setItem('isAuthorized', 'true');
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('isAuthorized');
      localStorage.removeItem('user');
    }
  }, [isAuthorized, user]);

  return (
    <Context.Provider value={{ isAuthorized, setIsAuthorized, user, setUser }}>
      <App />
    </Context.Provider>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
