import React from 'react';
import { FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import './ResumePreview.css';

const ResumePreview = ({ resume, onClose }) => (
  <div className="resume-preview-overlay">
    <div className="resume-preview-container">
      <div className="resume-preview-header">
        <h3>Resume Preview</h3>
        <div className="resume-preview-actions">
          <button 
            className="resume-action-button close-button" 
            onClick={onClose}
            title="Close Preview"
          >
            <FaTimes />
          </button>
        </div>
      </div>
      <div className="resume-preview-content" style={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {resume?.url ? (
          <>
            <div style={{ margin: '32px 0', textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: 16 }}>
                Due to storage security, preview is not available.<br />
                <b>Click below to view your resume:</b>
              </p>
              <a 
                href={resume.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="resume-file-link" 
                style={{ 
                  fontSize: '1.1rem', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  padding: '12px 24px', 
                  background: '#007bff', 
                  color: 'white', 
                  borderRadius: 6, 
                  textDecoration: 'none', 
                  fontWeight: 500 
                }}
              >
                <FaExternalLinkAlt /> Open Resume in New Tab
              </a>
            </div>
          </>
        ) : (
          <div>No resume available</div>
        )}
      </div>
    </div>
  </div>
);

export default ResumePreview;
