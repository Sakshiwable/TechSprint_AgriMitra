import { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Check, X, RefreshCw, Link } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function InvitesList() {
  const [invites, setInvites] = useState([]);
  const [loadingMap, setLoadingMap] = useState({});
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4000/api/friends/invites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvites(res.data.invites ?? res.data ?? []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load invites");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setLoadingMap((m) => ({ ...m, [requestId]: true }));
      await axios.post(
        "http://localhost:4000/api/groups/accept",
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("You joined the group");
      setInvites((prev) => prev.filter((i) => i._id !== requestId));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error accepting invite");
    } finally {
      setLoadingMap((m) => ({ ...m, [requestId]: false }));
    }
  };

  const handleIgnore = (requestId) => {
    setInvites((prev) => prev.filter((i) => i._id !== requestId));
    toast("Invite ignored", { icon: "🙈" });
  };

  const handleCopyLink = async (groupId) => {
    if (!groupId) return toast("No link available", { icon: "ℹ️" });
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
    <div className="min-h-[60vh] w-full max-w-3xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
            <Mail size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-teal-700">
              Pending Invites
            </h1>
            <p className="text-sm text-slate-500">
              Accept invites to join groups and share live locations.
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
      </header>

      {loading ? (
        <div className="bg-white border border-cyan-100 rounded-xl p-8 text-center text-slate-600 shadow-sm">
          Loading invites...
        </div>
      ) : invites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-cyan-100 rounded-xl p-12 text-center text-slate-600 shadow-sm"
        >
          <div className="text-4xl mb-3">📭</div>
          <div className="text-lg font-medium">No pending invites</div>
          <div className="text-sm mt-2">
            Invite notifications will appear here.
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {invites.map((invite) => {
            const id = invite._id;
            const from = invite.fromUserId || {};
            const group = invite.groupId || {};
            const loadingItem = !!loadingMap[id];
            const initials = (from.name || group.groupName || "U")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={id}
                className="flex items-center justify-between gap-4 bg-white border border-cyan-100 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
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
                    onClick={() => handleCopyLink(group._id)}
                    className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-cyan-100 text-cyan-700 hover:bg-cyan-50 transition"
                    title="Copy invite link"
                  >
                    <Link size={14} /> Link
                  </button>

                  <button
                    onClick={() => handleIgnore(id)}
                    className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-cyan-100 text-slate-700 hover:bg-slate-50 transition"
                    title="Ignore"
                  >
                    <X size={14} /> Ignore
                  </button>

                  <button
                    onClick={() => handleAccept(id)}
                    disabled={loadingItem}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold shadow ${
                      loadingItem
                        ? "opacity-70 cursor-not-allowed bg-gradient-to-r from-teal-300 to-cyan-300"
                        : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-105"
                    }`}
                  >
                    <Check size={14} />
                    {loadingItem ? "Joining..." : "Accept"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
