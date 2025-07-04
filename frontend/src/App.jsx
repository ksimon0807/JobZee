import React, { useEffect, useContext } from "react";
import "./App.css";
import { Context } from "./main";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
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
import axios from "axios";
import { Toaster } from "react-hot-toast";

axios.defaults.withCredentials = true;

const App = () => {
  const {  setIsAuthorized, setUser } = useContext(Context);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await axios.get("http://localhost:4000/api/v1/user/getuser",
  //         {
  //           withCredentials: true
  //         });
  //       setUser(response.data.user);
  //       setIsAuthorized(true);
  //     } catch (error) {
  //       console.log(error)
  //       setIsAuthorized(false);
  //     }
  //   };
  //   fetchUser();
  // }, [isAuthorized]);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await axios.get(
  //         "http://localhost:4000/api/v1/user/getuser",
  //         {
  //           withCredentials: true,
  //         }
  //       );
  //       setUser(response.data.user);
  //       setIsAuthorized(true);
  //     } catch (error) {
  //       setIsAuthorized(false);
  //     }
  //   };
  //   fetchUser();
  // }, [isAuthorized]);

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/getuser`,
        { withCredentials: true }
      );
      setUser(response.data.user);
      setIsAuthorized(true);
    } catch (error) {
      console.error("Fetch user error:", error.response ? error.response.data : error.message);
      setIsAuthorized(false);
    }
  };

  // Only try to fetch user if token is present in cookies
  if (document.cookie.includes("token=")) {
    fetchUser();
  } else {
    setIsAuthorized(false);
  }
}, []); // Only once on mount


  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/getuser`,
  //         {
  //           withCredentials: true,
  //         }
  //       );
  //       setUser(response.data.user);
  //       setIsAuthorized(true);
  //     } catch (error) {
  //       console.error("Fetch user error:", error.response ? error.response.data : error.message);
  //       setIsAuthorized(false);
  //     }
  //   };
  //   fetchUser();
  // }, []); // Remove isAuthorized from dependencies

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/getuser`,
  //         { withCredentials: true }
  //       );
  //       setUser(response.data.user);
  //       setIsAuthorized(true);
  //     } catch (error) {
  //       console.error(
  //         "Fetch user error:",
  //         error.response ? error.response.data : error.message
  //       );
  //       setIsAuthorized(false);
  //     }
  //   };

  //   // Only fetch user if a token exists in the cookies.
  //   if (document.cookie.includes("token=")) {
  //     fetchUser();
  //   } else {
  //     setIsAuthorized(false);
  //   }
  // }, []); // Run only once on mount

  return (
    <>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/job/getall" element={<Jobs />} />
          <Route path="/job/:id" element={<JobDetails />} />
          <Route path="/job/post" element={<PostJob />} />
          <Route path="/job/me" element={<MyJobs />} />
          <Route path="/application/:id" element={<Application />} />
          <Route path="/application/me" element={<MyApplications />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <Toaster />
      </Router>
    </>
  );
};

export default App;
