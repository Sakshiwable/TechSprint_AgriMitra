import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Calendar, Users, FileText } from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const res = await axios.get("http://localhost:4000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-600 text-lg">Failed to load profile.</div>
        <button onClick={() => navigate("/")} className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition">
          Go to Login
        </button>
      </div>
    );
  }

  const { user, stats, communities, consultations, history } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-4 ring-teal-100">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{user.name}</h1>
              <p className="text-slate-500 mb-3 capitalize">
                {user.role} • {user.district ? `${user.district}, ` : ""}{user.state || "Location Not Set"}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {user.cropType && (
                  <span className="px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-100">
                    🌾 {user.cropType}
                  </span>
                )}
                {user.landSize ? (
                  <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                    📏 {user.landSize} Acres
                  </span>
                ) : null}
                {user.category && (
                  <span className="px-4 py-1.5 rounded-full bg-orange-50 text-orange-700 text-sm font-medium border border-orange-100">
                    {user.category}
                  </span>
                )}
              </div>
            </div>
            
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all font-medium"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-50 rounded-xl">
                <Users className="text-teal-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stats.communitiesJoined}</div>
                <div className="text-sm text-slate-500">Communities</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-xl">
                <FileText className="text-orange-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stats.pendingRequests}</div>
                <div className="text-sm text-slate-500">Pending Requests</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{consultations.length}</div>
                <div className="text-sm text-slate-500">Total Requests</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* My Journey */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="text-purple-600" size={20} />
              <h3 className="text-lg font-bold text-slate-800">📅 My Journey</h3>
            </div>
            
            <div className="space-y-4 relative pl-4 border-l-2 border-slate-100">
              {history.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-white"></div>
                  <p className="text-sm font-medium text-slate-700">{item.action}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Communities & Requests */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* My Communities */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Users className="text-teal-600" size={20} />
                <h3 className="text-lg font-bold text-slate-800">🌱 My Communities</h3>
              </div>
              
              {communities.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">You haven't joined any communities yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {communities.map(comm => (
                    <Link 
                      to="/communities"
                      key={comm.id}
                      className="group p-4 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-800 group-hover:text-teal-700">{comm.name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 capitalize border border-teal-200">
                          {comm.topic}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Joined {new Date(comm.joinedAt).toLocaleDateString()}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Consultation Requests */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <FileText className="text-orange-600" size={20} />
                <h3 className="text-lg font-bold text-slate-800">📩 Consultation Requests</h3>
              </div>
              
              {consultations.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">No active consultation requests.</p>
              ) : (
                <div className="space-y-3">
                  {consultations.map(req => (
                    <div 
                      key={req._id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-800 text-sm">Expert Consultation</h4>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          req.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          req.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' : 
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      {req.message && (
                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">"{req.message}"</p>
                      )}
                      <p className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
