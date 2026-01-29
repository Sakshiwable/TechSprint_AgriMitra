import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import HelpChatbot from "../components/HelpChatbot.jsx";
import bgVideo from "../assets/Agri_Background1.mp4";
import bgImg from "../assets/image.png";

const AppLayout = () => {
  return (
    <div className="relative min-h-screen  ">
  

      {/* Subtle tint for better readability */}
      <div
        className="fixed inset-0 -z-10 "
        aria-hidden="true"
      />

      <div className="relative z-10">
        <Navbar />
        <div className="pt-16">
          {/* Content will be rendered here */}
          <Outlet />
        </div>
      
      </div>
    </div>
  );
};

export default AppLayout;
