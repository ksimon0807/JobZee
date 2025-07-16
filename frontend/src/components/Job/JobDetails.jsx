import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Context } from "../../main";
import axios from "axios";
import "./JobDetailsModern.css";

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState({});
  const navigateTo = useNavigate();
  const { isAuthorized, user } = useContext(Context);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        setJob(res.data.job);
      })
      .catch((err) => {
        console.log(err.response.data.message);
        navigateTo("/notfound");
      });
  }, [id, navigateTo]);

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/login");
    }
  }, [isAuthorized, navigateTo]);

  if (!job || !job.title) return null;

  return (
    <section style={{ background: "#f4f6fa", minHeight: "100vh", padding: "32px 0" }}>
      <div className="job-details-container">
        <div className="job-details-title">{job.title}</div>
        <div className="job-details-meta">{job.company} &bull; {job.location}</div>
        <div className="job-details-row">
          <span className="job-details-label">Category:</span>
          <span className="job-details-value">{job.category}</span>
        </div>
        <div className="job-details-row">
          <span className="job-details-label">Country:</span>
          <span className="job-details-value">{job.country}</span>
        </div>
        <div className="job-details-row">
          <span className="job-details-label">City:</span>
          <span className="job-details-value">{job.city}</span>
        </div>
        <div className="job-details-row">
          <span className="job-details-label">Posted On:</span>
          <span className="job-details-value">{job.jobPostedOn}</span>
        </div>
        <div className="job-details-row">
          <span className="job-details-label">Salary:</span>
          <span className="job-details-value">
            {job.fixedSalary ? job.fixedSalary : `${job.salaryFrom} - ${job.salaryTo}`}
          </span>
        </div>
        <div className="job-details-label" style={{marginTop: 10}}>Description:</div>
        <div className="job-details-description">{job.description}</div>
        {user && user.role === "Employer" ? null : (
          <Link to={`/application/${job._id}`} className="job-details-apply-btn">Apply Now</Link>
        )}
      </div>
    </section>
  );
};

export default JobDetails;
