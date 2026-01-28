import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { UserCircle, Menu, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import NotificationPanel from "./NotificationPanel";

const API_URL = "http://localhost:4000/api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { name: "Groups", path: "/groups" },
    { name: "Create", path: "/create-group" },
    { name: "Requests", path: "/invites" },
    { name: "Friends", path: "/friends" },
    { name: "Invite", path: "/invite-friend" },
  ];

  const isActive = (path) => location.pathname === path;

  // Variants for profile hover: parent scales, text slides right and expands
  const profileButtonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
  };

  const handleSOS = async () => {
    if (
      !window.confirm(
        "Send SOS alert to all your groups and friends? This will notify everyone about your emergency."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in!");
        return;
      }

      // Get user's current location if available
      let location = null;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            sendSOSAlert(token, location);
          },
          () => {
            // If location access denied, send SOS without location
            sendSOSAlert(token, null);
          }
        );
      } else {
        sendSOSAlert(token, null);
      }
    } catch (err) {
      console.error("Error sending SOS:", err);
      toast.error("Failed to send SOS alert");
    }
  };

  const sendSOSAlert = async (token, location) => {
    try {
      await axios.post(
        `${API_URL}/alerts/sos`,
        { location },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("SOS alert sent! Help is on the way.");
    } catch (err) {
      console.error("Error sending SOS:", err);
      toast.error(err?.response?.data?.error || "Failed to send SOS alert");
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 z-50 w-screen py-2 bg-cyan-100/20 px-20 flex flex-row justify-between backdrop-blur-xl"
      style={{
        borderBottom: "1px solid rgba(6,182,212,0.08)",
      }}
    >
      <div className=" px-6 py-2  gap-10">
        {/* Brand Logo */}
        <h1
          className="text-2xl my-auto font-bold tracking-wide cursor-pointer"
          style={{ color: "#0ea5a4" }} // teal
          onClick={() => navigate("/dashboard")}
        >
          TravelSync
        </h1>
      </div>
      <div className="flex flex-row gap-10">
        {/* Desktop Navigation */}
        <div
          className="hidden md:flex shadow-sm shadow-cyan-900/50 items-center gap-10 px-3 py-1 rounded-full  border"
          style={{
            background: "linear-gradient(90deg, #06b6d4, #0ea5a4)", // cyan -> teal
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          {navLinks.map((link) => (
            <motion.button
              key={link.name}
              onClick={() => navigate(link.path)}
              className={`px-3 py-1 rounded-full font-semibold  relative overflow-hidden
      ${
        isActive(link.path) ? "text-white shadow-lg" : "text-white opacity-90"
      }`}
              style={
                isActive(link.path)
                  ? {
                      background: "radial-gradient(circle, #06b6d4)", // active cyan
                    }
                  : {}
              }
              whileHover={{
                background: "radial-gradient(circle, #f8f8f8, #f8f8f8)", // hover cyan->teal
                boxShadow: "0 0 12px rgba(6,182,212,0.25)",
                color: "#0ea5a4",
              }}
            >
              {link.name}
            </motion.button>
          ))}
        </div>

        {/* Notification Panel */}
        <div className="hidden md:flex items-center">
          <NotificationPanel />
        </div>

        {/* SOS Button */}
        <motion.button
          className="hidden md:flex items-center h-10 cursor-pointer my-auto p-3 rounded-full font-semibold text-white animate-pulse"
          style={{
            background: "linear-gradient(90deg, #ef4444, #dc2626)", // red gradient for emergency
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSOS}
          title="Send SOS Alert"
        >
          <AlertTriangle size={22} />
        </motion.button>

        {/* Profile Button */}
        <motion.button
          className="hidden md:flex items-center h-10 cursor-pointer my-auto p-3  rounded-full font-semibold text-white"
          style={{
            background: "linear-gradient(90deg, #0ea5a4, #06b6d4)", // teal -> cyan
          }}
          variants={profileButtonVariants}
          initial="rest"
          whileHover="hover"
          onClick={() => navigate("/profile")}
        >
          <UserCircle className="hover:animate-bounce duration-500" size={22} />
        </motion.button>
      </div>

      {/* Mobile menu */}
      <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
        {open ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Mobile Dropdown */}
      {open && (
        <motion.div
          className="md:hidden flex flex-col items-center gap-4 py-6"
          style={{
            background: "linear-gradient(#06b6d4, #0ea5a4)", // cyan -> teal
          }}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                navigate(link.path);
                setOpen(false);
              }}
              className={`px-6 py-2 text-lg font-semibold rounded-full ${
                isActive(link.path)
                  ? "bg-white text-[#0ea5a4]" // active: white bg with teal text
                  : "text-white opacity-95"
              }`}
            >
              {link.name}
            </button>
          ))}

          {/* Notification Panel (Mobile) */}
          <div className="w-full px-6">
            <NotificationPanel />
          </div>

          {/* SOS Button */}
          <button
            onClick={() => {
              setOpen(false);
              handleSOS();
            }}
            className="px-6 py-3 text-lg font-semibold rounded-full bg-red-600 text-white animate-pulse"
          >
            🚨 SOS Alert
          </button>

          {/* Profile Button */}
          <button
            onClick={() => {
              navigate("/profile");
              setOpen(false);
            }}
            className="px-6 py-3 text-lg font-semibold rounded-full bg-white text-[#0ea5a4]"
          >
            Profile
          </button>
        </motion.div>
      )}
    </nav>
  );
}
