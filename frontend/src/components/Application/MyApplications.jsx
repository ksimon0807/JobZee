// import React, { useContext, useEffect, useState } from "react";
// import { Context } from "../../main";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import ResumeModel from "./ResumeModel";

import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ResumePreview from "../Profile/ResumePreview";
import { User2, Search, Building2, Filter, Eye, Download, ChevronDown, Mail, Phone, MapPin, Briefcase, Star, CalendarClock, Users, CheckCircle, XCircle, ListChecks } from "lucide-react";
import { useNavigate as useRouterNavigate } from "react-router-dom";
import "./MyApplicationsModern.css";

const MyApplications = () => {
  const { user } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionOpen, setActionOpen] = useState(null); // id of open action dropdown
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();
  const routerNavigate = useRouterNavigate();

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

  // Fetch and show resume for a given userId
  const handlePreviewResume = async (userId) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/profile/resume/${userId}`,
        { withCredentials: true }
      );
      if (data.success && data.resume) {
        setResumeData({
          url: data.resume.url || data.resume.public_url,
          file_type: data.resume.file_type,
        });
        setModalOpen(true);
      } else {
        toast.error("No resume found for this user");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch resume");
    }
  };

  // Stats
  const statusCounts = applications.reduce((acc, app) => {
    const status = app.status || "Applied";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const filteredApps = applications.filter(app => {
    const matchesSearch = search === "" || (app.name && app.name.toLowerCase().includes(search.toLowerCase())) || (app.email && app.email.toLowerCase().includes(search.toLowerCase())) || (app.skills && app.skills.join(" ").toLowerCase().includes(search.toLowerCase()));
    const matchesPosition = positionFilter === "" || (app.jobId && (typeof app.jobId === 'object' ? app.jobId.title : app.jobId) === positionFilter);
    const matchesStatus = statusFilter === "" || (app.status || "Applied") === statusFilter;
    return matchesSearch && matchesPosition && matchesStatus;
  });

  // Update status handler
  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingStatusId(appId);
    try {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/update-status/${appId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(data.message || 'Status updated');
      setApplications(applications => applications.map(app => app._id === appId ? { ...app, status: newStatus } : app));
      setActionOpen(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Unique positions for filter dropdown
  const uniquePositions = Array.from(new Set(applications.map(app => app.jobId && (typeof app.jobId === 'object' ? app.jobId.title : app.jobId)).filter(Boolean)));
  const uniqueStatuses = ["Applied", "Viewed", "Shortlisted", "Rejected", "Interview", ...Array.from(new Set(applications.map(app => app.status).filter(Boolean)))].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <section className="my-applications-container" style={{ background: '#f8fafc', minHeight: '100vh', padding: 0 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 0 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <User2 size={36} style={{ background: '#2563eb', color: '#fff', borderRadius: 12, padding: 6 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 32, marginBottom: 2 }}>Job Applicants</div>
            <div style={{ color: '#64748b', fontSize: 18 }}>Review and manage candidates for your job postings</div>
          </div>
        </div>
        {/* Stats Row */}
        <div style={{ display: 'flex', gap: 18, margin: '32px 0 24px 0' }}>
          <StatCard label="Total" value={applications.length} icon={<Users size={28} color="#2563eb" />} />
          <StatCard label="New" value={statusCounts["Applied"] || 0} icon={<ListChecks size={28} color="#2563eb" />} />
          <StatCard label="Interviews" value={statusCounts["Interview"] || 0} icon={<CalendarClock size={28} color="#2563eb" />} />
          <StatCard label="Shortlisted" value={statusCounts["Shortlisted"] || 0} icon={<CheckCircle size={28} color="#2563eb" />} />
          <StatCard label="Rejected" value={statusCounts["Rejected"] || 0} icon={<XCircle size={28} color="#ef4444" />} />
        </div>
        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px' }}>
            <Search size={20} style={{ color: '#2563eb', marginRight: 6 }} />
            <input
              type="text"
              placeholder="Search by name, email, or skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 16, outline: 'none', padding: '10px 0' }}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px' }}>
            <Building2 size={20} style={{ color: '#2563eb', marginRight: 6 }} />
            <select value={positionFilter} onChange={e => setPositionFilter(e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 16, outline: 'none', padding: '10px 0' }}>
              <option value="">All Positions</option>
              {uniquePositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px' }}>
            <Filter size={20} style={{ color: '#2563eb', marginRight: 6 }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 16, outline: 'none', padding: '10px 0' }}>
              <option value="">All Status</option>
              {uniqueStatuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </div>
        {/* Applications List */}
        <div style={{ marginBottom: 32 }}>
          {filteredApps.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '1.1rem' }}>No Applications Found</div>
          ) : (
            filteredApps.map((element) => (
              <div key={element._id} className="my-applications-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 24, padding: 0, overflow: 'visible', border: '1.5px solid #e5e7eb' }}>
                <div style={{ padding: '24px 24px 18px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#2563eb' }}>
                      <User2 size={32} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 20 }}>{element.name} {element.status === 'Applied' && <span style={{ background: '#e0e7ff', color: '#2563eb', fontWeight: 500, fontSize: 13, borderRadius: 8, padding: '2px 10px', marginLeft: 8 }}>New</span>}</div>
                      <div style={{ color: '#64748b', fontSize: 15 }}>Applied for {element.jobId && (typeof element.jobId === 'object' ? element.jobId.title : element.jobId)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0' }}>
                        <Star size={16} color="#fbbf24" fill="#fbbf24" />
                        <span style={{ fontWeight: 500, color: '#fbbf24', fontSize: 15 }}>4.5/5</span>
                      </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setActionOpen(actionOpen === element._id ? null : element._id)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 500, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Action <ChevronDown size={18} />
                      </button>
                      {actionOpen === element._id && (
                        <div style={{ position: 'absolute', right: 0, top: 40, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', zIndex: 10, minWidth: 160 }}>
                          {uniqueStatuses.map(status => (
                            <div
                              key={status}
                              style={{
                                padding: '10px 18px',
                                cursor: (element.status || 'Applied') === status || updatingStatusId === element._id ? 'not-allowed' : 'pointer',
                                color: (element.status || 'Applied') === status ? '#2563eb' : '#1a2a36',
                                fontWeight: (element.status || 'Applied') === status ? 600 : 400,
                                background: (element.status || 'Applied') === status ? '#e0e7ff' : 'transparent',
                                opacity: updatingStatusId === element._id ? 0.6 : 1
                              }}
                              onClick={() => {
                                if ((element.status || 'Applied') !== status && updatingStatusId !== element._id) {
                                  handleStatusChange(element._id, status);
                                }
                              }}
                            >
                              {updatingStatusId === element._id && (element.status !== status) ? 'Updating...' : status}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, margin: '10px 0 0 0', color: '#64748b', fontSize: 15 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={16} /> {element.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={16} /> {element.phone}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {element.address}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={16} /> 5 years experience</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                    <button
                      onClick={() => {
                        if (user && user.role === 'Employer' && element.applicantId && element.applicantId.user) {
                          routerNavigate(`/profile/${element.applicantId.user}`);
                        } else {
                          toast('Profile view only available for employers.');
                        }
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
                    >
                      <Eye size={18} /> View Profile
                    </button>
                    <button onClick={() => { setResumeData({ url: element.resume.url, file_type: element.resume.file_type }); setModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}><Download size={18} /> Resume</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {modalOpen && resumeData && (
        <ResumePreview resume={resumeData} onClose={() => setModalOpen(false)} />
      )}
    </section>
  );
};

export default MyApplications;

// StatCard for summary row
function StatCard({ label, value, icon }) {
  return (
    <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '18px 0', textAlign: 'center', border: '1.5px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 24 }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: 15 }}>{label}</div>
    </div>
  );
}
