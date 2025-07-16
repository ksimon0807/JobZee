import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./ApplicationForm.css";

const Application = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [resume, setResume] = useState(null);
  const [useProfile, setUseProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);

  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();
  const { id } = useParams();
  const fileInputRef = React.useRef();

  // Fetch job details first
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/job/${id}`,
          { withCredentials: true }
        );
        if (data.success && data.job) {
          setJob(data.job);
        } else {
          toast.error("Job not found");
          navigateTo("/job/getall");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch job details");
        navigateTo("/job/getall");
      } finally {
        setLoadingJob(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id, navigateTo]);

  useEffect(() => {
    if (user && useProfile) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCoverLetter(user.bio || "");
      setAddress(user.location || "");
    }
  }, [user, useProfile]);

  const handleUseProfile = (e) => {
    setUseProfile(e.target.checked);
    if (e.target.checked && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCoverLetter(user.bio || "");
      setAddress(user.location || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setCoverLetter("");
      setAddress("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or image file (PNG, JPG, WEBP)');
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setResume(file);
    }
  };

  const handleApplication = async (e) => {
    e.preventDefault();
    
    if (!job) {
      toast.error("Job information is not available");
      return;
    }

    if (!id) {
      toast.error("Job ID is missing");
      return;
    }

    console.log("Submitting application for job:", id);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("coverLetter", coverLetter);
      formData.append("jobId", id);
      
      // Only append resume if a new file is selected
      if (resume) {
        formData.append("resume", resume);
      }

      // Log form data contents
      console.log("Form data contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/post`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(data.message);
      navigateTo("/job/getall");
      
      // Clear form
      setName("");
      setEmail("");
      setCoverLetter("");
      setPhone("");
      setAddress("");
      setResume(null);
    } catch (error) {
      console.error("Application Error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthorized || (user && user.role === "Employer")) {
      navigateTo("/");
    }
  }, [isAuthorized, user, navigateTo]);

  if (loadingJob) {
    return (
      <div className="page-loader">
        <div>Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <section style={{ background: "#f4f6fa", minHeight: "100vh", padding: "32px 0" }}>
      <div className="application-form-container">
        <div className="application-form-title">Application Form</div>
        <div className="application-form-subtitle">
          <span style={{ fontWeight: 600 }}>{job.title}</span> at <span style={{ color: '#1a7f5a', fontWeight: 500 }}>{job.company}</span><br />
          <span style={{ fontSize: '1rem', color: '#6b7280' }}>{job.location}</span>
        </div>
        <form onSubmit={handleApplication} autoComplete="off">
          <div className="application-form-row">
            <div style={{ flex: 1 }}>
              <div className="application-form-label">Name</div>
              <input className="application-form-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" required />
            </div>
            <div style={{ flex: 1 }}>
              <div className="application-form-label">Email</div>
              <input className="application-form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your Email" required />
            </div>
          </div>
          <div className="application-form-row">
            <div style={{ flex: 1 }}>
              <div className="application-form-label">Phone</div>
              <input className="application-form-input" type="number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your Phone Number" required />
            </div>
            <div style={{ flex: 1 }}>
              <div className="application-form-label">Address</div>
              <input className="application-form-input" type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Your Address" required />
            </div>
          </div>
          <div>
            <div className="application-form-label">Cover Letter</div>
            <textarea className="application-form-textarea" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Write a short cover letter..." required />
          </div>
          <div className="application-form-label" style={{ marginBottom: 4 }}>Resume</div>
          <div className="application-form-resume-box">
            {resume ? (
              <>
                <span className="application-form-resume-filename">{resume.name}</span>
                <button type="button" className="application-form-resume-edit" onClick={() => fileInputRef.current.click()}>Change</button>
              </>
            ) : user?.resume ? (
              <>
                <a
                  href={user.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="application-form-resume-filename"
                  style={{ textDecoration: 'underline', cursor: 'pointer' }}
                >
                  {user.resume.fileName || user.resume.url.split('/').pop()}
                </a>
                <button type="button" className="application-form-resume-edit" onClick={() => fileInputRef.current.click()}>Change</button>
              </>
            ) : (
              <>
                <span>Upload your Resume*</span>
              </>
            )}
          </div>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="application-form-file"
            id="resume-upload"
            required={!user?.resume}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <div className="application-form-actions">
            <button type="submit" className="application-form-submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Application;
