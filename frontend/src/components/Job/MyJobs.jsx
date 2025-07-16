import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Context } from "../../main";
import { useNavigate } from "react-router-dom";
import { Briefcase, Users, Eye, Edit, Trash2, Search, Filter, PlusCircle, MapPin } from "lucide-react";
import "./MyJobsList.css";

const MyJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [editingMode, setEditingMode] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  // Calculated values
  const totalJobs = myJobs?.length || 0;
  const activeJobs = myJobs?.filter(job => job.status === "Active").length || 0;
  const pausedJobs = myJobs?.filter(job => job.status === "Paused").length || 0;
  const totalApplicants = myJobs?.reduce((total, job) => total + (job.applicantsCount || 0), 0) || 0;
  const totalViews = myJobs?.reduce((total, job) => total + (job.views || 0), 0) || 0;
  
  // Filtered jobs
  const filteredJobs = myJobs?.filter(job => {
    const matchesSearch = search === "" || 
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.category?.toLowerCase().includes(search.toLowerCase()) ||
      job.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "" || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/job/getmyjobs`,
          { withCredentials: true }
        );
        setMyJobs(data.myJobs);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch jobs");
        setMyJobs([]);
      }
    };
    fetchJobs();
  }, []);

  // Handle input changes
  const handleInputChange = (jobId, field, value) => {
    setMyJobs(prevJobs =>
      prevJobs.map(job =>
        job._id === jobId ? { ...job, [field]: value } : job
      )
    );
  };

  // Enable edit mode
  const handleEnableEdit = (jobId) => {
    setEditingMode(jobId);
  };

  // Disable edit mode
  const handleDisableEdit = () => {
    setEditingMode(null);
  };

  // Update job
  const handleUpdateJob = async (jobId) => {
    try {
      const jobToUpdate = myJobs.find(job => job._id === jobId);
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/job/update/${jobId}`,
        jobToUpdate,
        { withCredentials: true }
      );
      toast.success(data.message || "Job updated successfully");
      setEditingMode(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update job");
    }
  };

  // Delete job
  const handleJobDelete = async (jobId) => {
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/job/delete/${jobId}`,
        { withCredentials: true }
      );
      toast.success(data.message || "Job deleted successfully");
      setMyJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete job");
    }
  };

  return (
    <>
      <section className="myjobs-list-container">
        <div className="myjobs-list-title">My Posted Jobs</div>
        <div className="myjobs-list-subtitle">Manage and track your job postings</div>
        {/* Summary cards */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', margin: '24px 0' }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{totalJobs}</div>
            <div style={{ color: '#64748b', fontWeight: 500 }}>Total Jobs</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>{activeJobs}</div>
            <div style={{ color: '#64748b', fontWeight: 500 }}>Active</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e42' }}>{pausedJobs}</div>
            <div style={{ color: '#64748b', fontWeight: 500 }}>Paused</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb' }}>{totalApplicants}</div>
            <div style={{ color: '#64748b', fontWeight: 500 }}>Total Applicants</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{totalViews}</div>
            <div style={{ color: '#64748b', fontWeight: 500 }}>Total Views</div>
          </div>
        </div>
        {/* Search and filter */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', maxWidth: 900, margin: '0 auto 24px auto' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}
            />
          </div>
          <div style={{ minWidth: 180, position: 'relative' }}>
            <Filter size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
          <button style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigateTo('/job/post')}>
            <PlusCircle size={18} /> Post New Job
          </button>
        </div>
        {/* Job list */}
        <div className="myjobs-list-grid">
          {filteredJobs && filteredJobs.length > 0 ? (
            filteredJobs.map((element) => (
              <div className="myjobs-list-card" key={element._id}>
                {editingMode === element._id ? (
                  <div>
                    <input
                      className="myjobs-list-job-title"
                      type="text"
                      value={element.title}
                      onChange={e => handleInputChange(element._id, 'title', e.target.value)}
                      style={{ marginBottom: 6 }}
                    />
                    <input
                      className="myjobs-list-job-meta"
                      type="text"
                      value={element.city}
                      onChange={e => handleInputChange(element._id, 'city', e.target.value)}
                      placeholder="City"
                    />
                    <input
                      className="myjobs-list-job-meta"
                      type="text"
                      value={element.location}
                      onChange={e => handleInputChange(element._id, 'location', e.target.value)}
                      placeholder="Location"
                    />
                    <select
                      className="myjobs-list-job-meta"
                      value={element.category}
                      onChange={e => handleInputChange(element._id, 'category', e.target.value)}
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
                    <input
                      className="myjobs-list-job-meta"
                      type="number"
                      value={element.fixedSalary || ''}
                      onChange={e => handleInputChange(element._id, 'fixedSalary', e.target.value)}
                      placeholder="Fixed Salary"
                    />
                    <textarea
                      className="myjobs-list-job-meta"
                      value={element.description}
                      onChange={e => handleInputChange(element._id, 'description', e.target.value)}
                      placeholder="Description"
                    />
                    <select
                      className="myjobs-list-job-meta"
                      value={element.expired}
                      onChange={e => handleInputChange(element._id, 'expired', e.target.value)}
                    >
                      <option value="true">TRUE</option>
                      <option value="false">FALSE</option>
                    </select>
                    <select
                      className="myjobs-list-job-meta"
                      value={element.status}
                      onChange={e => handleInputChange(element._id, 'status', e.target.value)}
                      style={{ background: element.status === 'Active' ? '#d1fae5' : '#fef3c7', color: element.status === 'Active' ? '#059669' : '#b45309', fontWeight: 600 }}
                    >
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                    </select>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => handleUpdateJob(element._id)}>Save</button>
                      <button style={{ background: '#f3f4f6', color: '#22223b', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={handleDisableEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 20, color: '#22223b' }}>{element.title}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ background: element.expired === "true" || element.expired === true ? '#fee2e2' : '#f3f4f6', color: element.expired === "true" || element.expired === true ? '#b91c1c' : '#4b5563', borderRadius: 8, padding: '4px 10px', fontWeight: 600, fontSize: 14 }}>
                          {element.expired === "true" || element.expired === true ? "Expired" : "Not Expired"}
                        </span>
                        <span style={{ background: element.status === 'Active' ? '#d1fae5' : '#fef3c7', color: element.status === 'Active' ? '#059669' : '#b45309', borderRadius: 8, padding: '4px 14px', fontWeight: 600, fontSize: 15 }}>{element.status}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, color: '#64748b', fontSize: 15, marginBottom: 8 }}>
                      <span><Briefcase size={15} style={{ marginRight: 4 }} /> {element.category}</span>
                      <span><MapPin size={15} style={{ marginRight: 4 }} /> {element.city || element.location}</span>
                      <span>Posted {element.createdAt ? new Date(element.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ color: '#059669', fontWeight: 600, fontSize: 16 }}>{element.salaryFrom && element.salaryTo ? `₹${element.salaryFrom} - ₹${element.salaryTo}` : ''}</span>
                      <span style={{ color: '#64748b', fontSize: 15 }}><Users size={15} style={{ marginRight: 3 }} /> {element.applicantsCount || 0} applicants</span>
                      <span style={{ color: '#64748b', fontSize: 15 }}><Eye size={15} style={{ marginRight: 3 }} /> {element.views || 0} views</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button style={{ background: '#f3f4f6', color: '#22223b', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => navigateTo(`/job/${element._id}`)}><Eye size={16} /> View</button>
                      <button style={{ background: '#e0e7ff', color: '#3730a3', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => handleEnableEdit(element._id)}><Edit size={16} /> Edit</button>
                      <button style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => handleJobDelete(element._id)}><Trash2 size={16} /> Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: 18, marginTop: 40 }}>No jobs found.</div>
          )}
        </div>
      </section>
    </>
  );
};

export default MyJobs;

