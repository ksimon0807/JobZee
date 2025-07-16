
import React, { useContext, useEffect, useState } from "react";
import { Building2, MapPin, DollarSign, CalendarClock, Search, Filter, Heart, Clock } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import "./JobsList.css";


const jobTypes = ["Full Time", "Part Time", "Remote", "Contract"];
const datePostedOptions = [
  { label: "Last 24 hours", value: 1 },
  { label: "Last 3 days", value: 3 },
  { label: "Last week", value: 7 },
  { label: "Last month", value: 30 },
];

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [salaryRange, setSalaryRange] = useState([0, 200000]);
  const [datePosted, setDatePosted] = useState(null);
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/");
    }
  }, [isAuthorized, navigateTo]);


  // Fetch jobs with filters from backend
  const fetchJobs = () => {
    const params = new URLSearchParams();
    if (selectedTypes.length === 1) params.append('jobType', selectedTypes[0]);
    if (salaryRange[0] > 0 || salaryRange[1] < 200000) {
      params.append('salaryFrom', salaryRange[0]);
      params.append('salaryTo', salaryRange[1]);
    }
    if (datePosted) params.append('datePosted', datePosted);
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/job/getall?${params.toString()}`, {
        withCredentials: true,
      })
      .then((res) => {
        setJobs(res.data.jobs || []);
        setFilteredJobs(res.data.jobs || []);
      })
      .catch(() => {
        setJobs([]);
        setFilteredJobs([]);
      });
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, [selectedTypes, salaryRange, datePosted]);

  // Filtering logic (frontend) for searchTitle and searchLocation only
  useEffect(() => {
    let result = jobs;
    if (searchTitle.trim()) {
      result = result.filter((job) =>
        job.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
        (job.company && job.company.toLowerCase().includes(searchTitle.toLowerCase()))
      );
    }
    if (searchLocation.trim()) {
      result = result.filter((job) =>
        (job.location && job.location.toLowerCase().includes(searchLocation.toLowerCase())) ||
        (job.country && job.country.toLowerCase().includes(searchLocation.toLowerCase()))
      );
    }
    setFilteredJobs(result);
  }, [searchTitle, searchLocation, jobs]);

  // For location dropdown
  const uniqueLocations = Array.from(new Set(jobs.map(j => j.location || j.country).filter(Boolean)));

  // Handler to clear all filters
  const clearFilters = () => {
    setSearchTitle("");
    setSearchLocation("");
    setSelectedTypes([]);
    setSalaryRange([0, 200000]);
    setDatePosted(null);
  };

  return (
    <section className="jobs-list-container">
      <div className="jobs-list-title">Find Your Perfect Job</div>
      <div className="jobs-list-subtitle">
        Browse through {jobs.length}+ opportunities from top companies
      </div>
      {/* Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center',
        margin: '32px 0 24px 0',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        padding: '18px 16px 10px 16px',
        maxWidth: 1100,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 2, minWidth: 220, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px', marginRight: 8 }}>
          <Search size={20} style={{ color: '#2563eb', marginRight: 6 }} />
          <input
            type="text"
            placeholder="Job title, keywords, or company"
            value={searchTitle}
            onChange={e => setSearchTitle(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 16,
              outline: 'none',
              padding: '10px 0',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 160, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px', marginRight: 8 }}>
          <MapPin size={20} style={{ color: '#2563eb', marginRight: 6 }} />
          <input
            type="text"
            placeholder="City, state, or remote"
            value={searchLocation}
            onChange={e => setSearchLocation(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 16,
              outline: 'none',
              padding: '10px 0',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 120, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', padding: '0 10px', marginRight: 8 }}>
          <Building2 size={20} style={{ color: '#2563eb', marginRight: 6 }} />
          <select
            value={selectedTypes[0] || ''}
            onChange={e => setSelectedTypes(e.target.value ? [e.target.value] : [])}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 16,
              outline: 'none',
              padding: '10px 0',
            }}
          >
            <option value="">All Types</option>
            {jobTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <button
          onClick={fetchJobs}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 28px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search size={20} style={{ marginRight: 6 }} />
          Search Jobs
        </button>
        <button
          onClick={clearFilters}
          style={{
            background: '#e5e7eb',
            color: '#1a2a36',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            fontWeight: 500,
            fontSize: 15,
            cursor: 'pointer',
            marginLeft: 8,
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Filter size={18} style={{ marginRight: 6 }} />
          Clear Filters
        </button>
      </div>

      {/* Filters and Jobs List */}
      <div style={{
        display: 'flex',
        gap: 32,
        maxWidth: 1100,
        margin: '0 auto',
        alignItems: 'flex-start',
      }}>
        {/* Filters */}
        <div style={{
          minWidth: 220,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          padding: '18px 16px',
          marginBottom: 32,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ fontWeight: 600, fontSize: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={18} style={{ color: '#2563eb' }} />
              Filters
            </span>
            {/* Filter icon button for clearing filters */}
            <button
              onClick={clearFilters}
              title="Clear all filters"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                marginLeft: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 24,
                width: 24,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5c0 .4-.16.78-.44 1.06l-4.56 4.56V16a1 1 0 0 1-2 0v-4.88l-4.56-4.56A1.5 1.5 0 0 1 3 5.5Z" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          {/* Job Type */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 500, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={16} style={{ color: '#2563eb' }} />
              Job Type
            </div>
            {jobTypes.map(type => (
              <div key={type} style={{ marginBottom: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedTypes([...selectedTypes, type]);
                      } else {
                        setSelectedTypes(selectedTypes.filter(t => t !== type));
                      }
                    }}
                  />
                  {type}
                </label>
              </div>
            ))}
          </div>
          {/* Location */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 500, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={16} style={{ color: '#2563eb' }} />
              Location
            </div>
            <select
              value={searchLocation}
              onChange={e => setSearchLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 15,
                outline: 'none',
              }}
            >
              <option value="">Select location</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          {/* Salary Range */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 500, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <DollarSign size={16} style={{ color: '#2563eb' }} />
              Salary Range
            </div>
            <input
              type="range"
              min={0}
              max={200000}
              step={10000}
              value={salaryRange[0]}
              onChange={e => setSalaryRange([parseInt(e.target.value), salaryRange[1]])}
              style={{ width: '100%' }}
            />
            <input
              type="range"
              min={0}
              max={200000}
              step={10000}
              value={salaryRange[1]}
              onChange={e => setSalaryRange([salaryRange[0], parseInt(e.target.value)])}
              style={{ width: '100%', marginTop: 4 }}
            />
            <div style={{ fontSize: 14, color: '#2563eb', marginTop: 2 }}>
              ${salaryRange[0] / 1000}k+ - ${salaryRange[1] / 1000}k+
            </div>
          </div>
          {/* Date Posted */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 500, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} style={{ color: '#2563eb' }} />
              Date Posted
            </div>
            {datePostedOptions.map(opt => (
              <div key={opt.value} style={{ marginBottom: 2 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="radio"
                    name="datePosted"
                    checked={datePosted === opt.value}
                    onChange={() => setDatePosted(opt.value)}
                  />
                  {opt.label}
                </label>
              </div>
            ))}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="radio"
                  name="datePosted"
                  checked={datePosted === null}
                  onChange={() => setDatePosted(null)}
                />
                Any time
              </label>
            </div>
          </div>
        </div>
        {/* Jobs List */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18 }}>
            {filteredJobs.length} Jobs Found {filteredJobs.length === 0 && <span style={{ color: '#2563eb', fontWeight: 400, fontSize: 15 }}>No jobs match your filters.</span>}
          </div>
          <div className="jobs-list-grid">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((element) => (
                <div className="jobs-list-card" key={element._id} style={{padding: 0, overflow: 'visible', border: '1.5px solid #e5e7eb', boxShadow: '0 4px 18px rgba(37,99,235,0.04)'}}>
                  <div style={{padding: '24px 24px 18px 24px', display: 'flex', flexDirection: 'column', gap: 8}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                        <Building2 size={28} style={{ color: '#2563eb', background: '#e5e7eb', borderRadius: 6 }} />
                        <span className="jobs-list-job-title" style={{margin: 0, fontSize: '1.18rem'}}>{element.title}</span>
                      </div>
                      {element.jobType && (
                        <span style={{ background: '#f1f5ff', color: '#2563eb', fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '4px 12px', letterSpacing: 0.2 }}>{element.jobType}</span>
                      )}
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10, color: '#6b7280', fontSize: 15, marginBottom: 2}}>
                      <MapPin size={16} style={{ color: '#2563eb' }} />
                      <span>{element.location || element.city}, {element.country}</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10, color: '#16a34a', fontWeight: 500, fontSize: 15}}>
                      <DollarSign size={16} style={{ color: '#16a34a' }} />
                      {typeof element.fixedSalary === 'number' && !isNaN(element.fixedSalary) ? (
                        <span>${element.fixedSalary.toLocaleString()}</span>
                      ) : (typeof element.salaryFrom === 'number' && typeof element.salaryTo === 'number' ? (
                        <span>${element.salaryFrom.toLocaleString()} - ${element.salaryTo.toLocaleString()}</span>
                      ) : null)}
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10, color: '#6b7280', fontSize: 14}}>
                      <CalendarClock size={16} style={{ color: '#2563eb' }} />
                      {element.jobPostedOn && (() => {
                        const diff = (new Date() - new Date(element.jobPostedOn)) / (1000 * 60 * 60 * 24);
                        if (diff < 1) return 'Today';
                        if (diff < 2) return '1 day ago';
                        if (diff < 7) return `${Math.floor(diff)} days ago`;
                        if (diff < 30) return `${Math.floor(diff / 7)} week${Math.floor(diff / 7) > 1 ? 's' : ''} ago`;
                        return `${Math.floor(diff / 30)} month${Math.floor(diff / 30) > 1 ? 's' : ''} ago`;
                      })()}
                    </div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0 0 0'}}>
                      {element.category && <span style={{background: '#f3f4f6', color: '#2563eb', fontWeight: 500, fontSize: 13, borderRadius: 6, padding: '3px 10px'}}>{element.category}</span>}
                    </div>
                  </div>
                  <div style={{padding: '0 24px 18px 24px'}}>
                    <Link
                      to={`/job/${element._id}`}
                      className="jobs-list-job-link"
                      style={{marginTop: 0, fontWeight: 600, fontSize: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(37,99,235,0.08)'}}>
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: "1.1rem",
                }}
              >
                No jobs found.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Jobs;