import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PostJobModern.css";

const PostJob = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [fixedSalary, setFixedSalary] = useState("");
  const [salaryType, setSalaryType] = useState("default");
  const [jobType, setJobType] = useState("");

  const { isAuthorized, user } = useContext(Context);

  const handleJobPost = async (e) => {
    e.preventDefault();
    if (salaryType === "Fixed Salary") {
      setSalaryFrom("");
      setSalaryTo("");
    } else if (salaryType === "Ranged Salary") {
      setFixedSalary("");
    } else {
      setSalaryFrom("");
      setSalaryTo("");
      setFixedSalary("");
    }
    await axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/job/post`,
        fixedSalary.length >= 4
          ? {
              title,
              description,
              category,
              country,
              city,
              location,
              fixedSalary: Number(fixedSalary),
              jobType,
            }
          : {
              title,
              description,
              category,
              country,
              city,
              location,
              salaryFrom: Number(salaryFrom),
              salaryTo: Number(salaryTo),
              jobType,
            },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        toast.success(res.data.message);
        setTimeout(() => {
          navigateTo("/job/me");
        }, 800);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  const navigateTo = useNavigate();

  useEffect(() => {
    // Removed direct navigateTo call from render body and moved to useEffect for React best practices.
    if (!isAuthorized || (user && user.role !== "Employer")) {
      navigateTo("/");
    }
  }, [isAuthorized, user, navigateTo]);

  return (
    <section className="myjobs-list-container" style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 0' }}>
      <div className="myjobs-list-title">Post a New Job</div>
      <div className="myjobs-list-subtitle">Fill out the details below to create a new job posting</div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
        <form className="postjob-form" onSubmit={handleJobPost} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 36, minWidth: 350, maxWidth: 480, width: '100%' }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: '#22223b', textAlign: 'center' }}>Job Details</div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Job Title"
            required
            style={{ marginBottom: 14 }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={{ marginBottom: 14 }}
          >
            <option value="">Select Category</option>
            <option value="Graphics & Design">Graphics & Design</option>
            <option value="Mobile App Development">Mobile App Development</option>
            <option value="Frontend Web Development">Frontend Web Development</option>
            <option value="MERN Stack Development">MERN STACK Development</option>
            <option value="Account & Finance">Account & Finance</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Video Animation">Video Animation</option>
            <option value="MEAN Stack Development">MEAN STACK Development</option>
            <option value="MEVN Stack Development">MEVN STACK Development</option>
            <option value="Data Entry Operator">Data Entry Operator</option>
          </select>
          {/* Job Type */}
          <select
            value={jobType}
            onChange={e => setJobType(e.target.value)}
            required
            style={{ marginBottom: 14 }}
          >
            <option value="">Select Job Type</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Remote">Remote</option>
            <option value="Contract">Contract</option>
          </select>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            required
            style={{ marginBottom: 14 }}
          />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            required
            style={{ marginBottom: 14 }}
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            required
            style={{ marginBottom: 14 }}
          />
          <select
            value={salaryType}
            onChange={(e) => setSalaryType(e.target.value)}
            required
            style={{ marginBottom: 14 }}
          >
            <option value="default">Select Salary Type</option>
            <option value="Fixed Salary">Fixed Salary</option>
            <option value="Ranged Salary">Ranged Salary</option>
          </select>
          {salaryType === "default" ? (
            <p style={{ color: '#e94235', fontSize: '0.98rem', margin: 0, marginBottom: 14 }}>Please Provide Salary Type *</p>
          ) : salaryType === "Fixed Salary" ? (
            <input
              type="number"
              placeholder="Enter Fixed Salary"
              value={fixedSalary}
              onChange={(e) => setFixedSalary(e.target.value)}
              required
              style={{ marginBottom: 14 }}
            />
          ) : (
            <div style={{ display: 'flex', gap: '10px', marginBottom: 14 }}>
              <input
                type="number"
                placeholder="Salary From"
                value={salaryFrom}
                onChange={(e) => setSalaryFrom(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Salary To"
                value={salaryTo}
                onChange={(e) => setSalaryTo(e.target.value)}
                required
              />
            </div>
          )}
          <textarea
            rows="6"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Job Description"
            required
            style={{ marginBottom: 18 }}
          />
          <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 600, fontSize: 17, width: '100%', marginTop: 8, boxShadow: '0 1px 4px rgba(37,99,235,0.08)' }}>Create Job</button>
        </form>
      </div>
    </section>
  );
};

export default PostJob;

// import React, { useContext, useEffect, useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import { Context } from "../../main";
// const PostJob = () => {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [category, setCategory] = useState("");
//   const [country, setCountry] = useState("");
//   const [city, setCity] = useState("");
//   const [location, setLocation] = useState("");
//   const [salaryFrom, setSalaryFrom] = useState("");
//   const [salaryTo, setSalaryTo] = useState("");
//   const [fixedSalary, setFixedSalary] = useState("");
//   const [salaryType, setSalaryType] = useState("default");

//   const { isAuthorized, user } = useContext(Context);

//   const handleJobPost = async (e) => {
//     e.preventDefault();
//     if (salaryType === "Fixed Salary") {
//       setSalaryFrom("");
//       setSalaryTo("");
//     } else if (salaryType === "Ranged Salary") {
//       setFixedSalary("");
    
//     } else {
//       setSalaryFrom("");
//       setSalaryTo("");
//       setFixedSalary("");
//     }

//     console.log({
//       title,
//       description,
//       category,
//       country,
//       city,
//       location,
//       salaryFrom,
//       salaryTo,
//       fixedSalary,
//     });

//     await axios
//       .post(
//         "http://localhost:4000/api/v1/job/post",
//         fixedSalary.length >= 4
//           ? {
//               title,
//               description,
//               category,
//               country,
//               city,
//               location,
//               fixedSalary,
//             }
//           : {
//               title,
//               description,
//               category,
//               country,
//               city,
//               location,
//               salaryFrom,
//               salaryTo,
//             },
//         {
//           withCredentials: true,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       )
//       .then((res) => {
//         toast.success(res.data.message);
//       })
//       .catch((err) => {
//         toast.error(err.response.data.message);
//       });
//   };

//   // const navigateTo = useNavigate();
//   // if (!isAuthorized || (user && user.role !== "Employer")) {
//   //   navigateTo("/");
//   // }

//   const navigateTo = useNavigate();

//   useEffect(() => {
//     if (!isAuthorized || (user && user.role !== "Employer")) {
//       navigateTo("/");
//     }
//   }, [isAuthorized, user, navigateTo]);

//   return (
//     <>
//       <div className="job_post page">
//         <div className="container">
//           <h3>POST NEW JOB</h3>
//           <form onSubmit={handleJobPost}>
//             <div className="wrapper">
//               <input
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Job Title"
//               />
//               <select
//                 value={category}
//                 onChange={(e) => setCategory(e.target.value)}
//               >
//                 <option value="">Select Category</option>
//                 <option value="Graphics & Design">Graphics & Design</option>
//                 <option value="Mobile App Development">
//                   Mobile App Development
//                 </option>
//                 <option value="Frontend Web Development">
//                   Frontend Web Development
//                 </option>
//                 <option value="MERN Stack Development">
//                   MERN STACK Development
//                 </option>
//                 <option value="Account & Finance">Account & Finance</option>
//                 <option value="Artificial Intelligence">
//                   Artificial Intelligence
//                 </option>
//                 <option value="Video Animation">Video Animation</option>
//                 <option value="MEAN Stack Development">
//                   MEAN STACK Development
//                 </option>
//                 <option value="MEVN Stack Development">
//                   MEVN STACK Development
//                 </option>
//                 <option value="Data Entry Operator">Data Entry Operator</option>
//               </select>
//             </div>
//             <div className="wrapper">
//               <input
//                 type="text"
//                 value={country}
//                 onChange={(e) => setCountry(e.target.value)}
//                 placeholder="Country"
//               />
//               <input
//                 type="text"
//                 value={city}
//                 onChange={(e) => setCity(e.target.value)}
//                 placeholder="City"
//               />
//             </div>
//             <input
//               type="text"
//               value={location}
//               onChange={(e) => setLocation(e.target.value)}
//               placeholder="Location"
//             />
//             <div className="salary_wrapper">
//               <select
//                 value={salaryType}
//                 onChange={(e) => setSalaryType(e.target.value)}
//               >
//                 <option value="default">Select Salary Type</option>
//                 <option value="Fixed Salary">Fixed Salary</option>
//                 <option value="Ranged Salary">Ranged Salary</option>
//               </select>
//               <div>
//                 {salaryType === "default" ? (
//                   <p>Please provide Salary Type *</p>
//                 ) : salaryType === "Fixed Salary" ? (
//                   <input
//                     type="number"
//                     placeholder="Enter Fixed Salary"
//                     value={fixedSalary}
//                     onChange={(e) => setFixedSalary(e.target.value)}
//                   />
//                 ) : (
//                   <div className="ranged_salary">
//                     <input
//                       type="number"
//                       placeholder="Salary From"
//                       value={salaryFrom}
//                       onChange={(e) => setSalaryFrom(e.target.value)}
//                     />
//                     <input
//                       type="number"
//                       placeholder="Salary To"
//                       value={salaryTo}
//                       onChange={(e) => setSalaryTo(e.target.value)}
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//             <textarea
//               rows="10"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Job Description"
//             />
//             <button type="submit">Create Job</button>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default PostJob;
