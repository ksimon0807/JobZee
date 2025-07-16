import React from "react";
import {
  MdOutlineDesignServices,
  MdOutlineWebhook,
  MdAccountBalance,
  MdOutlineAnimation,
} from "react-icons/md";
import { TbAppsFilled } from "react-icons/tb";
import { FaReact } from "react-icons/fa";
import { GiArtificialIntelligence } from "react-icons/gi";
import { IoGameController } from "react-icons/io5";
import "./HomeSectionsModern.css";

const PopularCategories = () => {
  const categories = [
    {
      id: 1,
      title: "Graphics & Design",
      subTitle: "305 Open Positions",
      icon: <MdOutlineDesignServices className="categories-modern-icon" />,
    },
    {
      id: 2,
      title: "Mobile App Development",
      subTitle: "500 Open Positions",
      icon: <TbAppsFilled className="categories-modern-icon" />,
    },
    {
      id: 3,
      title: "Frontend Web Development",
      subTitle: "200 Open Positions",
      icon: <MdOutlineWebhook className="categories-modern-icon" />,
    },
    {
      id: 4,
      title: "MERN STACK Development",
      subTitle: "1000+ Open Postions",
      icon: <FaReact className="categories-modern-icon" />,
    },
    {
      id: 5,
      title: "Account & Finance",
      subTitle: "150 Open Positions",
      icon: <MdAccountBalance className="categories-modern-icon" />,
    },
    {
      id: 6,
      title: "Artificial Intelligence",
      subTitle: "867 Open Positions",
      icon: <GiArtificialIntelligence className="categories-modern-icon" />,
    },
    {
      id: 7,
      title: "Video Animation",
      subTitle: "50 Open Positions",
      icon: <MdOutlineAnimation className="categories-modern-icon" />,
    },
    {
      id: 8,
      title: "Game Development",
      subTitle: "80 Open Positions",
      icon: <IoGameController className="categories-modern-icon" />,
    },
  ];
  return (
    <div className="categories-modern-section">
      <div className="categories-modern-title">Popular Categories</div>
      <div className="categories-modern-grid">
        {categories.map((cat) => (
          <div className="categories-modern-card" key={cat.id}>
            {cat.icon}
            <div className="categories-modern-card-title">{cat.title}</div>
            <div className="categories-modern-card-sub">{cat.subTitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularCategories;