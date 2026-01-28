// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import {
  Users,
  Map,
  Mail,
  UserPlus,
  Compass,
  AlertTriangle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import io from "socket.io-client";

const API_URL = "http://localhost:4000/api";
const SOCKET_URL = "http://localhost:4000";

export default function Dashboard() {
  const [sosAlerts, setSosAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/"); // redirect to auth page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });

    socket.on("sosAlert", (alert) => {
      setSosAlerts((prev) => [alert, ...prev]);
      toast.error(`🚨 SOS Alert: ${alert.userName} needs help!`, {
        duration: 10000,
        icon: "🚨",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCreateGroup = () => navigate("/create-group");
  const handleLiveMap = () => navigate("/live-map");

  const dismissAlert = (alertId) => {
    setSosAlerts((prev) => prev.filter((a) => a.alertId !== alertId));
  };

  return (
    <div className="min-h-screen">
      {/* SOS Alerts */}
      <AnimatePresence>
        {sosAlerts.length > 0 && (
          <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
            {sosAlerts.map((alert) => (
              <motion.div
                key={alert.alertId}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="bg-red-600 text-white p-4 rounded-lg shadow-2xl border-2 border-red-700"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={24}
                    className="animate-pulse flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">🚨 SOS Alert</h3>
                    <p className="text-sm mb-1">
                      <strong>{alert.userName}</strong> needs immediate help!
                    </p>
                    {alert.message && (
                      <p className="text-xs opacity-90 mb-2">{alert.message}</p>
                    )}
                    {alert.location && (
                      <p className="text-xs opacity-75">
                        Location: {alert.location.lat.toFixed(4)},{" "}
                        {alert.location.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.alertId)}
                    className="text-white hover:text-red-200 transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <header className=" py-24 px-6 md:px-20  mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="max-w-2xl ">
          <motion.h2
            className="text-3xl md:text-5xl font-extrabold"
            style={{ color: "#064e4b" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Discover.Share.Track
          </motion.h2>

          <motion.p
            className="mt-4 text-lg text-slate-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            TravelSync makes group travel effortless. Share your real-time
            location with friends, plan meet-ups, and explore new places with
            confidence. With live maps and in-app coordination tools, everyone
            stays in sync — no more calling, texting, or wondering “Where are
            you?”
          </motion.p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={handleCreateGroup}
              className="px-5 py-3 rounded-full font-semibold text-white shadow-lg"
              style={{
                background: "linear-gradient(90deg,#0ea5a4,#06b6d4)",
              }}
            >
              Create Group
            </button>

            <button
              onClick={handleLiveMap}
              className="px-5 py-3 rounded-full font-semibold border text-[#0ea5a4] bg-white/90"
            >
              View Live Map
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-tr from-cyan-100 to-teal-50">
                <Users className="text-cyan-700" />
              </div>
              <div>
                <div className="text-sm font-semibold">Groups</div>
                <div className="text-sm text-slate-600">Organize trips</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-tr from-cyan-100 to-teal-50">
                <Map className="text-cyan-700" />
              </div>
              <div>
                <div className="text-sm font-semibold">Live Map</div>
                <div className="text-sm text-slate-600">
                  Real-time locations
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated image stack */}
        <div className="relative w-full max-w-2xl">
          <motion.img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=0b915a49d121b1d8780c1d0f1ae1b6be"
            alt="friends traveling"
            className="rounded-xl shadow-2xl w-full object-cover"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{ border: "4px solid rgba(14,165,164,0.08)" }}
          />

          <motion.div
            className="absolute -top-6 -right-6 w-40 h-28 rounded-lg overflow-hidden shadow-md"
            style={{
              background:
                "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(14,165,164,0.08))",
              border: "2px solid rgba(6,182,212,0.12)",
            }}
            initial={{ x: 20, y: -10, rotate: 6, opacity: 0 }}
            animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ delay: 0.25, type: "spring" }}
          >
            <img
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=bd1d1f5d3a8f7b8c6b1a7a9a46c9e7a9"
              alt="map snapshot"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            className="absolute -bottom-6 -left-6 w-36 h-24 rounded-lg overflow-hidden shadow-md"
            style={{
              background:
                "linear-gradient(135deg, rgba(14,165,164,0.12), rgba(6,182,212,0.08))",
              border: "2px solid rgba(6,182,212,0.12)",
            }}
            initial={{ x: -20, y: 12, rotate: -6, opacity: 0 }}
            animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ delay: 0.35, type: "spring" }}
          >
            <img
              src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=4f2e6d0f46b9c2d1d2a8d5b1a3f6c9c8"
              alt="friends"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </header>
      {/* ================== FEATURES SECTION (White Theme) ================== */}
      <section className="px-6 md:px-24 py-20 relative overflow-hidden rounded-4xl mx-20">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl text-cyan-950 font-extrabold text-center mb-14"
        >
          What <span className="text-cyan-600">TravelSync</span> Offers ?
        </motion.h3>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.2 },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {[
            {
              iconBg: "bg-cyan-100 text-cyan-600",
              title: "Live location sharing",
              desc: "View your friends’ live location on a dynamic map.",
              icon: <Map />,
            },
            {
              iconBg: "bg-emerald-100 text-emerald-600",
              title: "Easy invites",
              desc: "Share group invites in one tap and plan faster.",
              icon: <UserPlus />,
            },
            {
              iconBg: "bg-blue-100 text-blue-600",
              title: "Meetups & routing",
              desc: "TravelSync suggests the best midpoint automatically.",
              icon: <Compass />,
            },
          ].map(({ iconBg, title, desc, icon }, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 50 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 120 },
                },
              }}
              whileHover={{
                y: -8,
                scale: 1.03,
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                rotateX: 4,
                rotateY: -4,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-5">
                <div
                  className={`p-4 rounded-xl ${iconBg} text-xl flex justify-center items-center`}
                >
                  {icon}
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">
                    {title}
                  </h4>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </div>

              {/* Gradient underline animation */}
              <div className="mt-6 h-1 w-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full group-hover:w-full transition-all duration-500"></div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA banner */}
      <section
        className="mx-6 md:mx-20 my-10 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between"
        style={{
          background: "linear-gradient(90deg,#06b6d4,#0ea5a4)",
          color: "white",
        }}
      >
        <div>
          <div className="text-lg font-bold">
            Ready to sync up with your group?
          </div>
          <div className="text-sm opacity-90">
            Create a group and start sharing live locations in seconds.
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <button
            onClick={handleCreateGroup}
            className="px-5 py-3 rounded-full font-semibold bg-white text-[#0ea5a4]"
          >
            Create your first group
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
