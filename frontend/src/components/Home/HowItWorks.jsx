import React from "react";
import { FaUserPlus } from "react-icons/fa";
import { MdFindInPage } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import "./HomeSectionsModern.css";

const HowItWorks = () => {
  const steps = [
    {
      icon: <FaUserPlus className="howitworks-modern-icon" />,
      title: "Create Account",
      desc: "Sign up and set up your profile to get started.",
    },
    {
      icon: <MdFindInPage className="howitworks-modern-icon" />,
      title: "Find a Job/Post a Job",
      desc: "Browse jobs or post new opportunities easily.",
    },
    {
      icon: <IoMdSend className="howitworks-modern-icon" />,
      title: "Apply/Recruit",
      desc: "Apply for jobs or recruit the best candidates.",
    },
  ];
  return (
    <div className="howitworks-modern-section">
      <div className="howitworks-modern-title">How CareerNest Works</div>
      <div className="howitworks-modern-grid">
        {steps.map((step, idx) => (
          <div className="howitworks-modern-card" key={idx}>
            {step.icon}
            <div className="howitworks-modern-card-title">{step.title}</div>
            <div className="howitworks-modern-card-desc">{step.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;