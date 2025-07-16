import React from "react";
import { FaBuilding, FaSuitcase, FaUsers, FaUserPlus } from "react-icons/fa";
import "./HomeModern.css";

const HeroSection = () => {
  const details = [
    {
      id: 1,
      title: "1,23,441",
      subTitle: "Live Job",
      icon: <FaSuitcase className="hero-modern-icon" />,
    },
    {
      id: 2,
      title: "91220",
      subTitle: "Companies",
      icon: <FaBuilding className="hero-modern-icon" />,
    },
    {
      id: 3,
      title: "2,34,200",
      subTitle: "Job Seekers",
      icon: <FaUsers className="hero-modern-icon" />,
    },
    {
      id: 4,
      title: "1,03,761",
      subTitle: "Employers",
      icon: <FaUserPlus className="hero-modern-icon" />,
    },
  ];
  return (
    <div className="hero-modern-container">
      <div style={{ flex: 2 }}>
        <div className="hero-modern-title">Find a Job That Suits</div>
        <div className="hero-modern-title">Your Interests and Skills</div>
        <div className="hero-modern-desc">
          Discover thousands of jobs, top companies, and career opportunities
          tailored for you.
        </div>
      </div>
      <div className="hero-modern-image">
        <img src="/heroS.jpg" alt="hero" />
      </div>
      <div className="hero-modern-details" style={{ width: "100%" }}>
        {details.map((element) => (
          <div className="hero-modern-card" key={element.id}>
            <div>{element.icon}</div>
            <div className="hero-modern-card-title">{element.title}</div>
            <div className="hero-modern-card-sub">{element.subTitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
