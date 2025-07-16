
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { User2, Mail, Phone, MapPin, Briefcase, Star, Globe, Linkedin, Github, FileText } from "lucide-react";

const ProfileView = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null); // For cover letter/resume
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    // Fetch user public profile
    axios
      .get(`/api/v1/user/profile/public/${userId}`, { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profile");
        setLoading(false);
      });
    // Fetch latest application for this user (for employer view)
    axios
      .get(`/api/v1/application/employer/getall`, { withCredentials: true })
      .then((res) => {
        // Find the latest application for this userId
        const apps = res.data.applications || [];
        const latestApp = apps.reverse().find(app => app.applicantId && app.applicantId.user === userId);
        setApplication(latestApp || null);
      })
      .catch(() => setApplication(null));
  }, [userId]);

  if (loading) return <div style={{ padding: 32 }}>Loading profile...</div>;
  if (error) return <div style={{ color: "#ef4444", padding: 32 }}>{error}</div>;
  if (!user) return null;

  return (
    <section style={{ maxWidth: 650, margin: "40px auto", background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: 32, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "#2563eb", overflow: 'hidden' }}>
          {user.avatar && user.avatar.url ? (
            <img src={user.avatar.url} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <User2 size={44} />
          )}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 28 }}>{user.name}</div>
          <div style={{ color: "#64748b", fontSize: 17 }}>{user.role}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, color: "#64748b", fontSize: 16, marginBottom: 18 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail size={16} /> {user.email}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Phone size={16} /> {user.phone}</span>
        {user.location && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={16} /> {user.location}</span>}
      </div>
      {user.bio && <div style={{ marginBottom: 18, color: "#334155", whiteSpace: 'pre-wrap' }}><b>Bio:</b> {user.bio}</div>}
      {user.skills && user.skills.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <b>Skills:</b>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {user.skills.map((skill, i) => (
              <span key={i} style={{ background: '#e0e7ff', color: '#3730a3', borderRadius: 8, padding: '4px 12px', fontSize: 15 }}>{skill}</span>
            ))}
          </div>
        </div>
      )}
      {/* Experience Section Modernized */}
      {user.experience && user.experience.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <b style={{ fontSize: 18, color: '#22223b' }}>Experience:</b>
          <div className="experience-list">
            {user.experience.map((exp, idx) => (
              <div key={idx} style={{ background: '#f3f4f6', borderRadius: 8, padding: 14, marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{exp.title} {exp.company && `@ ${exp.company}`}</div>
                <div style={{ color: '#64748b', fontSize: 15 }}>
                  {exp.from ? exp.from.substring(0,7) : ''} - {exp.current ? 'Present' : (exp.to ? exp.to.substring(0,7) : '')} {exp.location && `| ${exp.location}`}
                </div>
                {exp.description && <div style={{ color: '#64748b', fontSize: 15, marginTop: 4 }}>{exp.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Education Section Modernized */}
      {user.education && user.education.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <b style={{ fontSize: 18, color: '#22223b' }}>Education:</b>
          <div className="education-list">
            {user.education.map((edu, idx) => (
              <div key={idx} style={{ background: '#f3f4f6', borderRadius: 8, padding: 14, marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`} {edu.school && `@ ${edu.school}`}</div>
                <div style={{ color: '#64748b', fontSize: 15 }}>
                  {edu.from ? edu.from.substring(0,7) : ''} - {edu.current ? 'Present' : (edu.to ? edu.to.substring(0,7) : '')}
                </div>
                {edu.description && <div style={{ color: '#64748b', fontSize: 15, marginTop: 4 }}>{edu.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      {user.social && (
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          {user.social.linkedin && <a href={user.social.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={20} /></a>}
          {user.social.github && <a href={user.social.github} target="_blank" rel="noopener noreferrer"><Github size={20} /></a>}
          {user.social.website && <a href={user.social.website} target="_blank" rel="noopener noreferrer"><Globe size={20} /></a>}
        </div>
      )}
      {/* Application section for employer view */}
      {application && (
        <div style={{ marginTop: 32, padding: 20, background: '#f9fafb', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={20} /> Application Details
          </div>
          {application.coverLetter && (
            <div style={{ marginBottom: 12, whiteSpace: 'pre-wrap' }}>
              <b>Cover Letter:</b><br />{application.coverLetter}
            </div>
          )}
          {application.resume && application.resume.url && (
            <div style={{ marginBottom: 12 }}>
              <b>Resume:</b> <a href={application.resume.url} target="_blank" rel="noopener noreferrer">View Resume</a>
            </div>
          )}
          <div style={{ color: '#64748b', fontSize: 15 }}>
            <b>Application Status:</b> {application.status}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfileView;
