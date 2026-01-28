import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Send, Copy, Link } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const API_URL = "http://localhost:4000/api";

export default function InviteFriend() {
  const [friendEmail, setFriendEmail] = useState("");
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitePreview, setInvitePreview] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-fill group name from URL (if present)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const name = params.get("groupName");
    if (name) {
      const decoded = decodeURIComponent(name);
      setGroupName(decoded);
      setInvitePreview(buildInviteLink(params.get("groupId") || "", decoded));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  function buildInviteLink(groupId, name) {
    if (!groupId) return "";
    const u = new URL(window.location.origin);
    u.pathname = "/invite-friend";
    u.searchParams.set("groupId", groupId);
    if (name) u.searchParams.set("groupName", name);
    return u.toString();
  }

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!friendEmail.trim() || !groupName.trim()) {
      return toast.error("Please provide friend's email and group name");
    }
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/groups/invite`,
        { email: friendEmail, groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Invite sent successfully");
      setFriendEmail("");
      // update preview if groupId in URL is present
      const params = new URLSearchParams(location.search);
      const preview = buildInviteLink(params.get("groupId") || "", groupName);
      setInvitePreview(preview);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send invite. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!invitePreview) {
      toast("No invite link to copy", { icon: "ℹ️" });
      return;
    }
    try {
      await navigator.clipboard.writeText(invitePreview);
      toast.success("Invite link copied");
    } catch {
      toast.error("Copy failed — please copy manually");
    }
  };

  return (
    <div className="  flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36 }}
        className="relative w-full max-w-xl"
      >
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-200 to-teal-200 blur-3xl opacity-30 pointer-events-none" />

        <div className="relative bg-white backdrop-blur-sm rounded-2xl shadow-2xl border border-cyan-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-cyan-50">
            <button
              onClick={() => navigate("/dashboard")}
              aria-label="Back to dashboard"
              className="flex items-center gap-2 text-teal-700 hover:text-teal-900"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-teal-700">
                Invite a friend
              </h2>
              <p className="text-sm text-slate-500">
                Send a secure invite link so friends can join your group and
                share locations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-100">
                <Link size={14} /> Invite link
              </div>
            </div>
          </div>

          <form onSubmit={handleInvite} className="px-6 py-6">
            <div className="grid grid-cols-1 gap-4">
              <label className="text-sm text-teal-700 font-medium">
                Friend's email
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-cyan-200 transition"
                required
              />

              <label className="text-sm text-teal-700 font-medium">
                Group name
              </label>
              <input
                type="text"
                placeholder="e.g. Weekend in Goa"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  // keep preview in sync if groupId present
                  const params = new URLSearchParams(location.search);
                  const preview = buildInviteLink(
                    params.get("groupId") || "",
                    e.target.value
                  );
                  setInvitePreview(preview);
                }}
                className="w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-cyan-200 transition"
                required
              />

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full text-white font-semibold shadow-md transition ${
                    loading
                      ? "opacity-70 cursor-not-allowed bg-gradient-to-r from-teal-300 to-cyan-300"
                      : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-105"
                  }`}
                >
                  <Send size={16} />
                  {loading ? "Sending..." : "Send Invite"}
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white border border-cyan-100 text-teal-700 hover:bg-cyan-50 transition"
                >
                  <Copy size={14} />
                  Copy link
                </button>
              </div>

              {/* Invite preview */}
              <div className="mt-2 p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-sm text-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">Invite preview</div>
                    <div className="break-words mt-1 text-sm font-medium text-slate-800">
                      {invitePreview ||
                        "No invite link available. Create the group or open it to get the invite link."}
                    </div>
                  </div>
                  {invitePreview && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="ml-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-cyan-100 text-cyan-700"
                    >
                      <Copy size={14} /> Copy
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Tip: You can paste the invite link in messages, WhatsApp or
                email. Recipients will join the group and start sharing
                locations.
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
