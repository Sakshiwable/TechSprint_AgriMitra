import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import HelpChatbot from "../components/HelpChatbot.jsx";
import bgVideo from "../assets/background.mp4";

const AppLayout = () => {
  return (
    <div className="relative min-h-screen">
      {/* Background video (covers entire app) */}
      <video
        className="fixed inset-0 w-full h-full object-cover -z-20"
        src={bgVideo}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />

      {/* Subtle tint for better readability */}
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-r from-white/20  via-white/60 to-white/20 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <Navbar />
        <div className="pt-16">
          {/* Content will be rendered here */}
          <Outlet />
        </div>
        {/* Help Chatbot - Available on all pages */}
        <HelpChatbot />
      </div>
    </div>
  );
};

export default AppLayout;
