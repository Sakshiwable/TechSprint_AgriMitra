import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, PlusCircle, Mail, MapPin, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState(null);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || !destination.trim()) {
      return toast.error("Please provide group name and destination");
    }
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:4000/api/groups/create",
        { groupName, destination },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Group created successfully");
      setCreatedGroup(res.data.group);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create group. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdGroup) return;
    const inviteUrl = `${window.location.origin}/invite-friend?groupId=${createdGroup._id}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invite link copied to clipboard");
    } catch {
      toast.error("Copy failed — please copy manually");
    }
  };

  return (
    <div className="pt-10 w-screen flex items-center justify-center ">
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
      />

      <div className="w-full max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-8 items-center">
          {/* Illustration / Promo */}
          <div className="md:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/70 border border-cyan-100 shadow-xl">
              <div className="absolute -left-6 -top-6 w-20 h-20 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-400 opacity-20 blur-xl" />
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-400 text-white shadow-2xl">
                  <PlusCircle size={36} />
                </div>
              </div>

              <h3 className="text-2xl font-extrabold text-teal-700 text-center mb-2">
                Create a group. Sync locations instantly.
              </h3>
              <p className="text-sm text-slate-600 text-center mb-6">
                Invite friends, share live locations and coordinate meetups with
                a single link.
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">
                      Destination-first
                    </div>
                    <div className="text-xs text-slate-500">
                      Set a destination and keep everyone on the same page.
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">
                      Fast invites
                    </div>
                    <div className="text-xs text-slate-500">
                      Share a one-click invite link with your group.
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Form Card */}
          <div className="md:col-span-6">
            <div className="relative bg-white rounded-2xl shadow-2xl border border-cyan-100 p-8">
      

              {!createdGroup ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-3xl font-extrabold text-teal-700">
                      Create a new group
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Start a trip and invite friends to share live locations.
                    </p>
                  </div>

                  <form onSubmit={handleCreate} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-teal-700 mb-2">
                        Group Name
                      </label>
                      <div className="flex items-center gap-3 bg-white border border-cyan-100 rounded-xl px-3 py-2">
                        <div className="text-cyan-500">
                          <UsersIconPlaceholder />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Goa Weekend Trip"
                          className="w-full outline-none text-slate-800 bg-transparent"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-teal-700 mb-2">
                        Destination
                      </label>
                      <div className="flex items-center gap-3 bg-white border border-cyan-100 rounded-xl px-3 py-2">
                        <MapPin className="text-cyan-500" size={18} />
                        <input
                          type="text"
                          placeholder="City, landmark or place (e.g. Baga Beach, Goa)"
                          className="w-full outline-none text-slate-800 bg-transparent"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full text-white font-semibold shadow-md transition ${
                          loading
                            ? "opacity-75 cursor-not-allowed"
                            : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:scale-[1.01]"
                        }`}
                      >
                        <PlusCircle size={18} />
                        {loading ? "Creating..." : "Create Group"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setGroupName("");
                          setDestination("");
                        }}
                        className="px-4 py-3 rounded-full bg-white border border-cyan-100 text-cyan-600 hover:bg-cyan-50 transition"
                      >
                        Reset
                      </button>
                    </div>

                    <div className="text-xs text-slate-500">
                      By creating a group you agree to share basic location data
                      with group members during the trip.
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg mb-4">
                    <PlusCircle size={32} />
                  </div>

                  <h3 className="text-2xl font-semibold text-teal-700 mb-1">
                    Group created
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    <span className="font-medium text-slate-800">
                      {createdGroup.groupName}
                    </span>{" "}
                    — {createdGroup.destination}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 justify-center">
                      <button
                        onClick={() =>
                          navigate(
                            `/invite-friend?groupId=${
                              createdGroup._id
                            }&groupName=${encodeURIComponent(
                              createdGroup.groupName
                            )}`
                          )
                        }
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-white border border-cyan-100 text-teal-700 hover:bg-cyan-50 transition"
                      >
                        <Mail size={16} /> Invite by email
                      </button>

                      <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:opacity-95 transition"
                      >
                        <Copy size={16} /> Copy invite link
                      </button>
                    </div>

                    <div className="text-xs text-slate-500">
                      Share this link with friends to let them join the group
                      and share locations in real-time.
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={() =>
                          navigate(`/invite-friend?groupId=${createdGroup._id}`)
                        }
                        className="px-4 py-2 rounded-lg bg-white border border-cyan-100 text-slate-800"
                      >
                        Manage invites
                      </button>

                      <button
                        onClick={() => navigate("/dashboard")}
                        className="px-4 py-2 rounded-lg bg-teal-50 text-teal-700"
                      >
                        Back to dashboard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small visual placeholder component using inline SVG to avoid extra imports.
   Keeps file self-contained while providing a subtle icon inside the input. */
function UsersIconPlaceholder() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="text-cyan-500"
    >
      <path
        d="M16 11c1.6569 0 3-1.3431 3-3s-1.3431-3-3-3-3 1.3431-3 3 1.3431 3 3 3z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 11c1.6569 0 3-1.3431 3-3S7.6569 5 6 5 3 6.3431 3 8s1.3431 3 3 3z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 20c0-2.5 2-4 7-4s7 1.5 7 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
