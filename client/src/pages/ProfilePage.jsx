// src/pages/ProfilePage.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Edit,
  LogOut,
  Users,
  MapPin,
  Calendar,
  User,
  Navigation,
} from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in!");
        navigate("/");
        return;
      }

      const res = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Accept either { user } or flat user object responses
      const raw = res.data.user || res.data;
      // normalize fields used by the UI
      const normalized = {
        id: raw._id || raw.id,
        name: raw.name || "",
        email: raw.email || "",
        avatar: raw.avatar || raw.profilePic || "",
        bio: raw.bio || "",
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        defaultLocation: raw.defaultLocation || null,
        currentLocation: raw.currentLocation || null,
        groups: raw.groups || [],
        groupsCount:
          raw.groupsCount ??
          (Array.isArray(raw.groups) ? raw.groups.length : 0),
        friendsCount: raw.friendsCount || 0,
      };

      setUser(normalized);
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to load profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Logged out");
    navigate("/");
  };

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-cyan-50 to-teal-50">
        <p className="text-teal-700 font-semibold">Loading profile...</p>
      </div>
    );

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "—";
  const lastActive = user.updatedAt
    ? new Date(user.updatedAt).toLocaleString()
    : "—";
  const groupsCount = user.groupsCount ?? 0;
  const friendsCount = user.friendsCount ?? 0;

  const formatLocation = (location) => {
    if (!location || location.lat == null || location.lng == null)
      return "Not set";
    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
  };

  const defaultLocationStr = formatLocation(user.defaultLocation);
  const currentLocationStr = formatLocation(user.currentLocation);

  return (
    <div className=" w-screen b text-slate-800">
      <main className="max-w-6xl mx-auto px-6 py-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36 }}
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-cyan-100"
        >
          {/* Top decorative header */}
          <div className="h-32 bg-gradient-to-r from-teal-500 to-cyan-500 p-6">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={
                    user.avatar ||
                    "https://i.pinimg.com/736x/18/29/0d/18290d41f79704b228279b717ff30bf6.jpg"
                  }
                  alt="avatar"
                  className="w-20 h-20 rounded-full bg-white/20 ring-4 ring-white object-cover shadow-lg"
                />

                <div className="text-white">
                  <h1 className="text-2xl font-extrabold leading-tight">
                    {user.name || "Unknown User"}
                  </h1>
                  <p className="text-sm opacity-90 mt-1">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white border border-white/10 hover:brightness-110 transition"
                >
                  <Edit size={16} /> Edit
                </button>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-teal-700 hover:bg-white/90 transition shadow-sm"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8">
            {/* Left: Profile card */}
            <div className="md:col-span-1 bg-white rounded-xl border border-cyan-50 shadow-sm p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={
                    user.avatar ||
                    "https://i.pinimg.com/736x/18/29/0d/18290d41f79704b228279b717ff30bf6.jpg"
                  }
                  alt="avatar"
                  className="w-28 h-28 rounded-full mb-4 ring-4 ring-cyan-50 object-cover"
                />
                <h2 className="text-lg font-semibold text-teal-700">
                  {user.name || "Unknown"}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{user.email}</p>

                {/* Bio Section */}
                {user.bio && (
                  <div className="mt-4 w-full bg-teal-200/50 p-3 rounded-lg">
                  
                    <p className="text-sm text-teal-700 leading-relaxed text-left">
                      {user.bio}
                    </p>
                  </div>
                )}

                <div className="mt-6 w-full grid grid-cols-3 gap-3">
                  <div className="py-3 px-2 rounded-lg bg-gradient-to-tr from-cyan-50 to-teal-50 text-center">
                    <div className="text-sm text-teal-700 font-semibold">
                      {groupsCount}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Groups</div>
                  </div>

                  <div className="py-3 px-2 rounded-lg bg-cyan-50 text-center">
                    <div className="text-sm text-teal-700 font-semibold">—</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Live Shares
                    </div>
                  </div>

                  <div className="py-3 px-2 rounded-lg bg-teal-50 text-center">
                    <div className="text-sm text-teal-900 font-semibold">
                      {friendsCount}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Friends</div>
                  </div>
                </div>

                <div className="mt-6 w-full">
                  <button
                    onClick={() => navigate("/friends")}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold"
                  >
                    <Users size={14} /> View Friends
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-cyan-50 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-teal-700 mb-3">
                  Account details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Joined</div>
                      <div className="font-medium text-slate-800">{joined}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Last active</div>
                      <div className="font-medium text-slate-800">
                        {lastActive}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">
                        Default location
                      </div>
                      <div className="font-medium text-slate-800 text-sm">
                        {defaultLocationStr}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                      <Navigation size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">
                        Current location
                      </div>
                      <div className="font-medium text-slate-800 text-sm">
                        {currentLocationStr}
                      </div>
                      {user.currentLocation?.updatedAt && (
                        <div className="text-xs text-slate-400 mt-1">
                          Updated:{" "}
                          {new Date(
                            user.currentLocation.updatedAt
                          ).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Groups</div>
                      <div className="font-medium text-slate-800">
                        {groupsCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Groups List */}
              {user.groups && user.groups.length > 0 && (
                <div className="bg-white rounded-xl border border-cyan-50 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-teal-700 mb-4 flex items-center gap-2">
                    <Users size={20} />
                    My Groups ({user.groups.length})
                  </h3>
                  <div className="space-y-3">
                    {user.groups.map((group) => (
                      <div
                        key={group._id || group.id}
                        className="p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-100 hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-teal-800">
                              {group.groupName || group.name || "Unnamed Group"}
                            </h4>
                            {group.destination?.name && (
                              <p className="text-sm text-slate-600 mt-1">
                                Destination: {group.destination.name}
                              </p>
                            )}
                            {group.status && (
                              <span
                                className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  group.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {group.status}
                              </span>
                            )}
                          </div>
                          {group.createdAt && (
                            <div className="text-xs text-slate-500">
                              {new Date(group.createdAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-cyan-50 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-md font-semibold text-teal-700">
                    Privacy & sharing
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Control how and when your location is shared with groups.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/settings")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-cyan-100 text-teal-700 hover:bg-cyan-50 transition"
                  >
                    Manage settings
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(user.email || "");
                      toast.success("Email copied");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white"
                  >
                    Copy email
                  </button>
                </div>
              </div>

              <div className="text-sm text-slate-500">
                Need more help? Contact support at{" "}
                <span className="font-medium text-slate-800">
                  {import.meta.env.VITE_SUPPORT_EMAIL ||
                    "support@travelsync.app"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
