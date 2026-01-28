import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import { Mail, Check, X, RefreshCw, Link } from "lucide-react";
import { motion } from "framer-motion";

const API_URL = "http://localhost:4000/api";

export default function InvitesPage() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState({});
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchInvites = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/friends/invites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvites(res.data.invites ?? res.data ?? []);
    } catch (err) {
      console.error("Invites fetch error:", err);
      setError(err.response?.data?.message || "Failed to load invites");
      toast.error(err.response?.data?.message || "Failed to load invites");
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (inviteId, groupId) => {
    try {
      setLoadingMap((m) => ({ ...m, [inviteId]: true }));
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/groups/accept`,
        { inviteId, groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Joined group");
      // optimistic UI update
      setInvites((prev) => prev.filter((i) => i._id !== inviteId));
    } catch (err) {
      console.error("Accept invite error:", err);
      toast.error(err.response?.data?.message || "Failed to accept invite");
    } finally {
      setLoadingMap((m) => ({ ...m, [inviteId]: false }));
    }
  };

  const handleIgnore = (inviteId) => {
    setInvites((prev) => prev.filter((i) => i._id !== inviteId));
    toast("Invite ignored", { icon: "🙈" });
  };

  const copyInviteLink = async (groupId) => {
    if (!groupId) {
      toast("No link available", { icon: "ℹ️" });
      return;
    }
    const url = `${window.location.origin}/invite-friend?groupId=${groupId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied");
    } catch {
      toast.error("Copy failed — please copy manually");
    }
  };

  useEffect(() => {
    fetchInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className=" w-screen  text-slate-800">
   

      <main className="max-w-4xl mx-auto px-4 py-10">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
              <Mail size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-teal-700">
                Pending Invites
              </h1>
              <p className="text-sm text-slate-500">
                Invitations to join groups. Accept to start sharing and
                coordinating.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchInvites}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-cyan-100 text-cyan-700 hover:bg-cyan-50 transition"
              title="Refresh"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </motion.header>

        <section>
          {loading ? (
            <div className="bg-white border border-cyan-100 rounded-xl p-8 text-center text-slate-600 shadow-sm">
              Loading invites...
            </div>
          ) : error ? (
            <div className="bg-white border border-red-100 rounded-xl p-6 text-center text-red-700 shadow-sm">
              <div className="font-semibold mb-2">Failed to load invites</div>
              <div className="text-sm mb-4">{error}</div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={fetchInvites}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                >
                  Retry
                </button>
                <button
                  onClick={() => setError(null)}
                  className="px-4 py-2 rounded-full bg-white border border-cyan-100 text-cyan-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : invites.length === 0 ? (
            <div className="bg-white border border-cyan-100 rounded-xl p-12 text-center text-slate-600 shadow-sm">
              <div className="text-4xl mb-3">📭</div>
              <div className="text-lg font-medium">No pending invites</div>
              <div className="text-sm mt-2">
                When someone invites you, it will appear here.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => {
                const id = invite._id;
                const from = invite.fromUserId || {};
                const group = invite.groupId || {};
                const isLoading = !!loadingMap[id];
                const initials = (from.name || group.groupName || "G")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ translateY: -2 }}
                    className="flex items-center justify-between gap-4 bg-white border border-cyan-100 rounded-xl p-4 shadow"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-100 to-teal-50 flex items-center justify-center text-teal-700 font-semibold">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">
                          {group.groupName || "Group"}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          Invited by{" "}
                          <span className="font-medium text-slate-700">
                            {from.name || "Someone"}
                          </span>
                        </div>
                        {invite.createdAt && (
                          <div className="text-[11px] text-slate-400 mt-1">
                            {new Date(invite.createdAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyInviteLink(group._id)}
                        className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-cyan-100 text-cyan-700 hover:bg-cyan-50 transition"
                        title="Copy invite link"
                      >
                        <Link size={14} /> Link
                      </button>

                      <button
                        onClick={() => handleIgnore(id)}
                        className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-cyan-100 text-slate-700 hover:bg-slate-50 transition"
                      >
                        <X size={14} /> Ignore
                      </button>

                      <button
                        onClick={() => acceptInvite(id, group._id)}
                        disabled={isLoading}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold shadow ${
                          isLoading
                            ? "opacity-70 cursor-not-allowed bg-gradient-to-r from-teal-300 to-cyan-300"
                            : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-105"
                        }`}
                      >
                        <Check size={14} />
                        {isLoading ? "Joining..." : "Accept"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
