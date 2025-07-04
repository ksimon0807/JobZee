// import React, { useContext, useEffect, useState } from "react";
// import { Context } from "../../main";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import ResumeModel from "./ResumeModel";

// const MyApplications = () => {
//   const [applications, setApplications] = useState([]);
//   const [modelOpen, setModelOpen] = useState(false);
//   const [resumeImageUrl, setResumeImageUrl] = useState("");
//   const { user, isAuthorized } = useContext(Context);

//   const navigateTo = useNavigate();
//   useEffect(() => {
//     try {
//       if (user && user.role === "Employer") {
//         axios
//           .get("http://localhost:4000/api/v1/application/employer/getall", {
//             withCredentials: true,
//           })
//           .then((res) => {
//             setApplications(res.data.applications);
//           });
//       } else {
//         axios
//           .get("http://localhost:4000/api/v1/application/jobseeker/getall", {
//             withCredentials: true,
//           })
//           .then((res) => {
//             setApplications(res.data.applications);
//           });
//       }
//     } catch (error) {
//       toast.error(error.response.data.message);
//     }
//   }, [isAuthorized]);

//   if (!isAuthorized) {
//     navigateTo("/");
//   }

//   const deleteApplication = (id) => {
//     try {
//       axios
//         .delete(`http://localhost:4000/api/v1/application/delete/${id}`, {
//           withCredentials: true,
//         })
//         .then((res) => {
//           toast.success(res.data.message);
//           setApplications((prevApplication) =>
//             prevApplication.filter((application) => application._id !== id)
//           );
//         });
//     } catch (error) {
//       toast.error(error.response.data.message);
//     }
//   };

//   const openModel = (imageUrl) => {
//     setResumeImageUrl(imageUrl);
//     setModelOpen(true);
//   };

//   const closeModel = () => {
//     setModelOpen(false);
//   };

//   return (
//     <>
//       <section className="my_applications page">
//         {user && user.role === "Job seeker" ? (
//           <div className="container">
//             <h1>My Applications</h1>
//             {applications.map((element) => {
//               return (
//                 <JobSeekerCard
//                   element={element}
//                   key={element._id}
//                   deleteApplication={deleteApplication}
//                   openModel={openModel}
//                 />
//               );
//             })}
//           </div>
//         ) : (
//           <div className="container">
//             <h3>Applications From Job Seekers</h3>
//             {applications.map((element) => {
//               return (
//                 <EmployerCard
//                   element={element}
//                   key={element._id}
//                   openModel={openModel}
//                 />
//               );
//             })}
//           </div>
//         )}
//         {modelOpen && (
//           <ResumeModel imageUrl={resumeImageUrl} onClose={closeModel} />
//         )}
//       </section>
//     </>
//   );
// };

// export default MyApplications;

// const JobSeekerCard = ({ element, deleteApplication, openModel }) => {
//   return (
//     <>
//       <div className="job_seeker_card">
//         <div className="detail">
//           <p>
//             <span>Name: </span>
//             {element.name}
//           </p>
//           <p>
//             <span>Email: </span>
//             {element.email}
//           </p>
//           <p>
//             <span>Phone: </span>
//             {element.phone}
//           </p>
//           <p>
//             <span>Address: </span>
//             {element.address}
//           </p>
//           <p>
//             <span>CoverLetter: </span>
//             {element.coverLetter}
//           </p>
//         </div>
//         <div className="resume">
//           <img
//             src={element.resume.url}
//             alt="resume"
//             onClick={() => openModel(element.resume.url)}
//           />
//         </div>
//         <div className="btn_area">
//           <button onClick={() => deleteApplication(element._id)}>
//             Delete Application
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// const EmployerCard = () => {
//   return (
//     <>
//       <div className="job_seeker_card">
//         <div className="detail">
//           <p>
//             <span>Name: </span>
//             {element.name}
//           </p>
//           <p>
//             <span>Email: </span>
//             {element.email}
//           </p>
//           <p>
//             <span>Phone: </span>
//             {element.phone}
//           </p>
//           <p>
//             <span>Address: </span>
//             {element.address}
//           </p>
//           <p>
//             <span>CoverLetter: </span>
//             {element.coverLetter}
//           </p>
//         </div>
//         <div className="resume">
//           <img
//             src={element.resume.url}
//             alt="resume"
//             onClick={() => openModel(element.resume.url)}
//           />
//         </div>
//       </div>
//     </>
//   );
// };

import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ResumeModel from "./ResumeModel";

const MyApplications = () => {
  const { user } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");

  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/");
    }
  }, [isAuthorized, navigateTo]);

  useEffect(() => {
    try {
      if (user && user.role === "Employer") {
        axios
          .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/application/employer/getall`, {
            withCredentials: true,
          })
          .then((res) => {
            setApplications(res.data.applications);
          });
      } else if (user && user.role === "Job seeker") {
        axios
          .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/application/jobseeker/getall`, {
            withCredentials: true,
          })
          .then((res) => {
            setApplications(res.data.applications);
          });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching applications');
    }
  }, [isAuthorized, user]);

  const deleteApplication = (id) => {
    try {
      axios
        .delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/application/delete/${id}`, {
          withCredentials: true,
        })
        .then((res) => {
          toast.success(res.data.message);
          setApplications((prevApplication) =>
            prevApplication.filter((application) => application._id !== id)
          );
        });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const openModal = (imageUrl) => {
    setResumeImageUrl(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <section className="my_applications page">
      {user && user.role === "Job seeker" ? (
        <div className="container">
          <h1>My Applications</h1>
          {applications.length <= 0 ? (
            <>
              {" "}
              <h4>No Applications Found</h4>{" "}
            </>
          ) : (
            applications.map((element) => {
              return (
                <JobSeekerCard
                  element={element}
                  key={element._id}
                  deleteApplication={deleteApplication}
                  openModal={openModal}
                />
              );
            })
          )}
        </div>
      ) : (
        <div className="container">
          <h1>Applications From Job Seekers</h1>
          {applications.length <= 0 ? (
            <>
              <h4>No Applications Found</h4>
            </>
          ) : (
            applications.map((element) => {
              return (
                <EmployerCard
                  element={element}
                  key={element._id}
                  openModal={openModal}
                />
              );
            })
          )}
        </div>
      )}
      {modalOpen && (
        <ResumeModel imageUrl={resumeImageUrl} onClose={closeModal} />
      )}
    </section>
  );
};

export default MyApplications;

const JobSeekerCard = ({ element, deleteApplication, openModal }) => {
  return (
    <>
      <div className="job_seeker_card">
        <div className="detail">
          <p>
            <span>Name:</span> {element.name}
          </p>
          <p>
            <span>Email:</span> {element.email}
          </p>
          <p>
            <span>Phone:</span> {element.phone}
          </p>
          <p>
            <span>Address:</span> {element.address}
          </p>
          <p>
            <span>CoverLetter:</span> {element.coverLetter}
          </p>
        </div>
        <div className="resume">
          <img
            src={element.resume.url}
            alt="resume"
            onClick={() => openModal(element.resume.url)}
          />
        </div>
        <div className="btn_area">
          <button onClick={() => deleteApplication(element._id)}>
            Delete Application
          </button>
        </div>
      </div>
    </>
  );
};

const EmployerCard = ({ element, openModal }) => {
  return (
    <>
      <div className="job_seeker_card">
        <div className="detail">
          <p>
            <span>Name:</span> {element.name}
          </p>
          <p>
            <span>Email:</span> {element.email}
          </p>
          <p>
            <span>Phone:</span> {element.phone}
          </p>
          <p>
            <span>Address:</span> {element.address}
          </p>
          <p>
            <span>CoverLetter:</span> {element.coverLetter}
          </p>
        </div>
        <div className="resume">
          <img
            src={element.resume.url}
            alt="resume"
            onClick={() => openModal(element.resume.url)}
          />
        </div>
      </div>
    </>
  );
};
