import React from "react";
import { FaMicrosoft, FaApple } from "react-icons/fa";
import { SiTesla } from "react-icons/si";
import "./HomeSectionsModern.css";

const PopularCompanies = () => {
  const companies = [
    {
      id: 1,
      title: "Microsoft",
      location: "MNNIT teliyarganj Campus",
      openPositions: 10,
      icon: <FaMicrosoft className="companies-modern-icon" />,
    },
    {
      id: 2,
      title: "Tesla",
      location: "MNNIT teliyarganj Campus",
      openPositions: 5,
      icon: <SiTesla className="companies-modern-icon" />,
    },
    {
      id: 3,
      title: "Apple",
      location: "MNNIT teliyarganj Campus",
      openPositions: 20,
      icon: <FaApple className="companies-modern-icon" />,
    },
  ];
  return (
    <div className="companies-modern-section">
      <div className="companies-modern-title">Top Companies</div>
      <div className="companies-modern-grid">
        {companies.map((element) => (
          <div className="companies-modern-card" key={element.id}>
            <div className="companies-modern-icon">{element.icon}</div>
            <div className="companies-modern-card-title">{element.title}</div>
            <div className="companies-modern-card-sub">{element.location}</div>
            <button className="companies-modern-btn">
              Open Positions {element.openPositions}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularCompanies;