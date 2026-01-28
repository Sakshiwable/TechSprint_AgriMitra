import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import HelpChatbot from "../components/HelpChatbot.jsx";
import bgVideo from "../assets/Agri_Background1.mp4";
import bgImg from "../assets/image.png";

const AppLayout = () => {
  return (
    <div className="relative min-h-screen  ">
      {/* Background video (covers entire app) */}
      <img
        className="fixed inset-0 w-full bg-white  h-full object-cover -z-20"
        src={bgImg}
        aria-hidden="true"
      />

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
