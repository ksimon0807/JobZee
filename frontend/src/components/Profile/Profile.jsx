import React, { useState, useContext, useEffect } from 'react';
import { Context } from '../../main';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User2, Mail, Phone, MapPin, Linkedin, Github, Globe, FileText, FileUp, Eye, Trash2, Edit3 } from 'lucide-react';
import ResumePreview from './ResumePreview';
import './Profile.css';
import "./ProfileModern.css";
import "./ProfileMatchApplications.css";

const Profile = () => {
  const { user, setUser } = useContext(Context);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: '',
    linkedin: '',
    github: '',
    website: '',
    education: [{ school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false, description: '' }],
    experience: [{ title: '', company: '', location: '', from: '', to: '', current: false, description: '' }]
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        skills: user.skills ? user.skills.join(', ') : '',
        linkedin: user.social?.linkedin || '',
        github: user.social?.github || '',
        website: user.social?.website || '',
        education: user.education || [{ school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false, description: '' }],
        experience: user.experience || [{ title: '', company: '', location: '', from: '', to: '', current: false, description: '' }]
      });
    }
  }, [user]);

  // Fetch resume data when component mounts
  useEffect(() => {
    if (user?._id) {
      fetchResumeData();
    }
  }, [user]);

  const fetchResumeData = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/profile/resume`,
        { withCredentials: true }
      );
      
      if (data.success && data.resume) {
        setResumeData(data.resume);
      } else {
        setResumeData(null);
        toast('No resume found. Please upload your resume.', { icon: '📄' });
      }
    } catch (error) {
      setResumeData(null);
      if (error.response && error.response.status === 404) {
        toast('No resume found. Please upload your resume.', { icon: '📄' });
      } else {
        toast.error('Failed to fetch resume data.');
        console.error("Failed to fetch resume data:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e, type) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      
      // Increase size limits for uploads
      const maxSize = type === 'resume' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      const maxSizeDisplay = type === 'resume' ? '10MB' : '5MB';
      
      if (file.size > maxSize) {
        toast.error(`File size should be less than ${maxSizeDisplay}`);
        return;
      }
      
      setLoading(true);
      console.log(`Uploading ${type}:`, file.name, file.type, `${Math.round(file.size/1024)}KB`);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append(type, file);
      
      // Get token from localStorage as fallback
      const token = localStorage.getItem('token');
      
      // For file uploads, we should NOT set Content-Type header
      // Axios will automatically set the correct Content-Type with boundary
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log(`Adding token to ${type} upload request`);
      } else {
        console.warn(`No token available for ${type} upload`);
      }
      
      console.log(`Making upload request to: ${import.meta.env.VITE_BACKEND_URL}/api/v1/user/profile/${type}`);
      
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/profile/${type}`,
        formData,
        { 
          withCredentials: true,
          headers
        }
      );
      
      if (data.success) {
        if (type === 'avatar') {
          setUser(prev => ({
            ...prev,
            avatar: {
              public_id: data.avatar.public_id,
              url: data.avatar.url
            }
          }));
          toast.success("Profile picture updated successfully");
        } else if (type === 'resume') {
          setResumeData(data.resume);
          setUser(prev => ({
            ...prev,
            resume: {
              public_id: data.resume.public_id,
              url: data.resume.url
            }
          }));
          toast.success("Resume uploaded successfully");
        }
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      
      // Detailed error information
      if (error.response) {
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);
        toast.error(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error('Request error:', error.request);
        toast.error(`Network error: Could not connect to server`);
      } else {
        console.error('Error message:', error.message);
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewResume = () => {
    setShowResumePreview(true);
  };
  
  const handleDeleteResume = async () => {
    try {
      if (!resumeData?.id) {
        toast.error("No resume to delete");
        return;
      }
      
      setLoading(true);
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/profile/resume/${resumeData.id}`,
        { withCredentials: true }
      );

      if (data.success) {
        setResumeData(null);
        setUser(prev => ({
          ...prev,
          resume: null
        }));
        toast.success("Resume deleted successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete resume");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const updatedUser = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
        social: {
          linkedin: formData.linkedin,
          github: formData.github,
          website: formData.website
        },
        education: formData.education,
        experience: formData.experience
      };
      
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/profile/update`,
        updatedUser,
        { withCredentials: true }
      );
      
      if (data.success) {
        setUser(data.user);
        toast.success("Profile updated successfully");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ maxWidth: 700, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 32, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
      <div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          <div style={{ width: 124, height: 124, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, color: '#2563eb', overflow: 'hidden' }}>
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="avatar" style={{ width: 124, height: 124, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <User2 size={74} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 30 }}>{user?.name}</div>
            <div style={{ color: '#64748b', fontSize: 18 }}>{user?.role}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, color: '#64748b', fontSize: 16, marginTop: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={16} /> {user?.email}</span>
              {user?.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={16} /> {user.phone}</span>}
              {user?.location && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {user.location}</span>}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              {(user?.resume?.url || resumeData?.public_url) && (
                <button onClick={handleViewResume} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <Eye size={18} /> View Resume
                </button>
              )}
              {isEditing && (user?.resume?.url || resumeData?.public_url) && (
                <button onClick={handleDeleteResume} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} disabled={loading}>
                  <Trash2 size={18} /> Delete Resume
                </button>
              )}
            </div>
          </div>
          <button onClick={() => setIsEditing(!isEditing)} style={{ background: isEditing ? '#64748b' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 16, cursor: 'pointer', minWidth: 120 }}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
          {isEditing && (
            <label
              htmlFor="avatar"
              style={{
                position: 'absolute',
                left: 124 - 32,
                top: 124 - 32,
                background: '#2563eb',
                color: '#fff',
                borderRadius: '50%',
                padding: 4,
                width: 28,
                height: 28,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37,99,235,0.18)',
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s, color 0.2s',
                zIndex: 2,
                opacity: 1,
              }}
              title="Change Profile Picture"
              onMouseOver={e => { e.currentTarget.style.background = '#1e40af'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#2563eb'; }}
            >
              <Edit3 size={16} />
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'avatar')}
                style={{ display: 'none' }}
                tabIndex={isEditing ? 0 : -1}
              />
            </label>
          )}
        </div>
        
        {/* Resume Preview Modal */}
        {showResumePreview && (
          <ResumePreview
            resume={{
              url: user?.resume?.url || resumeData?.public_url,
              file_type: resumeData?.file_type
            }}
            onClose={() => setShowResumePreview(false)}
          />
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 10 }}>Basic Information</div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required disabled={user?.googleId} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16, background: user?.googleId ? '#f1f5f9' : '#fff' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 10 }}>Resume</div>
                <div style={{ background: '#f8fafc', borderRadius: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', padding: 20, marginBottom: 18, border: '1px solid #e5e7eb', position: 'relative' }}>
                  <label htmlFor="resume" style={{ fontWeight: 500, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: '#22223b' }}><FileUp size={20} /> Upload Resume</label>
                  <input type="file" id="resume" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'resume')} style={{ marginBottom: 10, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15, background: '#fff', width: '100%' }} />
                  <div style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>Supports PDF, JPG, JPEG, PNG (max 5MB)</div>
                  {(user?.resume?.url || resumeData?.public_url) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#2563eb', fontWeight: 500, background: '#e0e7ff', borderRadius: 8, padding: '8px 14px', marginTop: 6 }}>
                      <FileText size={18} /> Current resume available
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 600, fontSize: 20, margin: '32px 0 10px 0' }}>About</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} maxLength={500} rows={4} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>Skills (comma-separated)</label>
              <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} placeholder="e.g., JavaScript, React, Node.js" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 20, margin: '32px 0 10px 0' }}>Social Links</div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 18 }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}><Linkedin size={16} /> LinkedIn</label>
                <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="LinkedIn profile URL" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}><Github size={16} /> GitHub</label>
                <input type="url" name="github" value={formData.github} onChange={handleInputChange} placeholder="GitHub profile URL" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}><Globe size={16} /> Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="Personal website URL" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
              </div>
            </div>
            <div style={{ fontWeight: 600, fontSize: 20, margin: '32px 0 10px 0' }}>Education</div>
            {formData.education.map((edu, idx) => (
              <div key={idx} style={{ background: '#f8fafc', borderRadius: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', padding: 20, marginBottom: 18, position: 'relative', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                  <input type="text" placeholder="School" value={edu.school} onChange={e => {
                    const updated = [...formData.education]; updated[idx].school = e.target.value; setFormData(f => ({ ...f, education: updated }));
                  }} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 }} />
                  <input type="text" placeholder="Degree" value={edu.degree} onChange={e => {
                    const updated = [...formData.education]; updated[idx].degree = e.target.value; setFormData(f => ({ ...f, education: updated }));
                  }} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 }} />
                  <input type="text" placeholder="Field of Study" value={edu.fieldOfStudy} onChange={e => {
                    const updated = [...formData.education]; updated[idx].fieldOfStudy = e.target.value; setFormData(f => ({ ...f, education: updated }));
                  }} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <input type="text" placeholder="From (YYYY-MM)" value={edu.from ? edu.from.substring(0,7) : ''} onChange={e => {
                    const updated = [...formData.education]; updated[idx].from = e.target.value; setFormData(f => ({ ...f, education: updated }));
                  }} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 }} />
                  <input type="text" placeholder="To (YYYY-MM or blank)" value={edu.to ? edu.to.substring(0,7) : ''} onChange={e => {
                    const updated = [...formData.education]; updated[idx].to = e.target.value; setFormData(f => ({ ...f, education: updated }));
                  }} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 15 }}>
                    <input type="checkbox" checked={edu.current} onChange={e => {
                      const updated = [...formData.education]; updated[idx].current = e.target.checked; setFormData(f => ({ ...f, education: updated }));
                    }} /> Current
                  </label>
                </div>
                <textarea placeholder="Description" value={edu.description} onChange={e => {
                  const updated = [...formData.education]; updated[idx].description = e.target.value; setFormData(f => ({ ...f, education: updated }));
                }} style={{ width: '100%', marginTop: 8, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15, minHeight: 38 }} />
                {formData.education.length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button type="button" style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 16, padding: '4px 16px', fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#fecaca'} onMouseOut={e => e.currentTarget.style.background='#fee2e2'} onClick={() => {
                      setFormData(f => ({ ...f, education: f.education.filter((_, i) => i !== idx) }));
                    }}>Remove</button>
                  </div>
                )}
              </div>
            ))}
            <button type="button" style={{ background: '#e0e7ff', color: '#3730a3', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 600, fontSize: 16, marginTop: 10, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} onClick={() => setFormData(f => ({ ...f, education: [...f.education, { school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false, description: '' }] }))}>Add Education</button>
            <div style={{ fontWeight: 600, fontSize: 20, margin: '32px 0 10px 0' }}>Experience</div>
            {formData.experience.map((exp, idx) => (
              <div key={idx} style={{ background: '#f8fafc', borderRadius: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', padding: 20, marginBottom: 18, position: 'relative', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                  <input type="text" placeholder="Title" value={exp.title} onChange={e => {
                    const updated = [...formData.experience]; updated[idx].title = e.target.value; setFormData(f => ({ ...f, experience: updated }));
                  }} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 }} />
                  <input type="text" placeholder="Company" value={exp.company} onChange={e => {
                    const updated = [...formData.experience]; updated[idx].company = e.target.value; setFormData(f => ({ ...f, experience: updated }));
                  }} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 }} />
                  <input type="text" placeholder="Location" value={exp.location} onChange={e => {
                    const updated = [...formData.experience]; updated[idx].location = e.target.value; setFormData(f => ({ ...f, experience: updated }));
                  }} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <input type="text" placeholder="From (YYYY-MM)" value={exp.from ? exp.from.substring(0,7) : ''} onChange={e => {
                    const updated = [...formData.experience]; updated[idx].from = e.target.value; setFormData(f => ({ ...f, experience: updated }));
                  }} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 }} />
                  <input type="text" placeholder="To (YYYY-MM or blank)" value={exp.to ? exp.to.substring(0,7) : ''} onChange={e => {
                    const updated = [...formData.experience]; updated[idx].to = e.target.value; setFormData(f => ({ ...f, experience: updated }));
                  }} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15 }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 15 }}>
                    <input type="checkbox" checked={exp.current} onChange={e => {
                      const updated = [...formData.experience]; updated[idx].current = e.target.checked; setFormData(f => ({ ...f, experience: updated }));
                    }} /> Current
                  </label>
                </div>
                <textarea placeholder="Description" value={exp.description} onChange={e => {
                  const updated = [...formData.experience]; updated[idx].description = e.target.value; setFormData(f => ({ ...f, experience: updated }));
                }} style={{ width: '100%', marginTop: 8, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 15, minHeight: 38 }} />
                {formData.experience.length > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button type="button" style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 16, padding: '4px 16px', fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#fecaca'} onMouseOut={e => e.currentTarget.style.background='#fee2e2'} onClick={() => {
                      setFormData(f => ({ ...f, experience: f.experience.filter((_, i) => i !== idx) }));
                    }}>Remove</button>
                  </div>
                )}
              </div>
            ))}
            <button type="button" style={{ background: '#e0e7ff', color: '#3730a3', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 600, fontSize: 16, marginTop: 10, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} onClick={() => setFormData(f => ({ ...f, experience: [...f.experience, { title: '', company: '', location: '', from: '', to: '', current: false, description: '' }] }))}>Add Experience</button>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(90deg, #2563eb 60%, #1e40af 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px 44px',
                  fontWeight: 700,
                  fontSize: 20,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
                  cursor: 'pointer',
                  minWidth: 220,
                  letterSpacing: 0.5,
                  transition: 'background 0.2s, box-shadow 0.2s',
                  outline: 'none',
                }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <>
            {user?.bio && (
              <div style={{ marginBottom: 18, color: '#334155', whiteSpace: 'pre-wrap' }}><b>Bio:</b> {user.bio}</div>
            )}
            {user?.skills && user.skills.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <b>Skills:</b>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {user.skills.map((skill, i) => (
                    <span key={i} style={{ background: '#e0e7ff', color: '#3730a3', borderRadius: 8, padding: '4px 12px', fontSize: 15 }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {user?.education && user.education.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 10, color: '#1e293b' }}>Education</div>
                {user.education.map((edu, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', padding: 16, marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 17 }}>{edu.degree} {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}</div>
                    <div style={{ fontSize: 16 }}>{edu.school}</div>
                    <div style={{ color: '#64748b', fontSize: 15 }}>
                      {edu.from && edu.from.substring(0, 7)} - {edu.current ? 'Present' : (edu.to && edu.to.substring(0, 7))}
                    </div>
                    {edu.description && (
                      <div style={{ marginTop: 8, color: '#334155', fontSize: 15 }}>{edu.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {user?.experience && user.experience.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 10, color: '#1e293b' }}>Experience</div>
                {user.experience.map((exp, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', padding: 16, marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 17 }}>{exp.title}</div>
                    <div style={{ fontSize: 16 }}>{exp.company}{exp.location && `, ${exp.location}`}</div>
                    <div style={{ color: '#64748b', fontSize: 15 }}>
                      {exp.from && exp.from.substring(0, 7)} - {exp.current ? 'Present' : (exp.to && exp.to.substring(0, 7))}
                    </div>
                    {exp.description && (
                      <div style={{ marginTop: 8, color: '#334155', fontSize: 15 }}>{exp.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {user?.social && (user.social.linkedin || user.social.github || user.social.website) && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 10, color: '#1e293b' }}>Connect</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
                  {user.social.linkedin && (
                    <a href={user.social.linkedin} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0077b5', textDecoration: 'none', fontWeight: 500 }}>
                      <Linkedin size={20} /> LinkedIn
                    </a>
                  )}
                  {user.social.github && (
                    <a href={user.social.github} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#333', textDecoration: 'none', fontWeight: 500 }}>
                      <Github size={20} /> GitHub
                    </a>
                  )}
                  {user.social.website && (
                    <a href={user.social.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                      <Globe size={20} /> Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Profile;
