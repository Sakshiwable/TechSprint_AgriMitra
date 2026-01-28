// src/pages/EditProfile.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Save, ArrowLeft, User, Mail, Image as ImageIcon, Instagram } from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    avatar: "",
    instagram: "",
  });

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

      const raw = res.data.user || res.data;
      const userData = {
        name: raw.name || "",
        email: raw.email || "",
        bio: raw.bio || "",
        avatar: raw.avatar || raw.profilePic || "",
        instagram: raw.instagram || "",
      };

      setUser(userData);
      setFormData(userData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Failed to load profile");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}/auth/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err?.response?.data?.error || "Failed to update profile");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-cyan-50 to-teal-50">
        <p className="text-teal-700 font-semibold">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-cyan-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate("/profile")}
                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-extrabold text-white">
                Edit Profile
              </h1>
            </div>
            <p className="text-white/90 text-sm">
              Update your profile information
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-teal-700 mb-2">
                <User size={16} />
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-teal-700 mb-2">
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-teal-700 mb-2">
                <User size={16} />
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 rounded-lg border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-none"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-teal-700 mb-2">
                <ImageIcon size={16} />
                Profile Picture URL
              </label>
              <input
                type="url"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                placeholder="https://example.com/your-image.jpg"
              />
              {formData.avatar && (
                <div className="mt-3">
                  <img
                    src={formData.avatar}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-cyan-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Instagram */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-teal-700 mb-2">
                <Instagram size={16} />
                Instagram Username
              </label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                placeholder="@username"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-1 px-6 py-3 rounded-lg border border-cyan-300 text-teal-700 font-semibold hover:bg-cyan-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}


