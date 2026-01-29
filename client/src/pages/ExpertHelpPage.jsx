import { useState, useEffect } from "react";
import { Stethoscope, Video, MessageCircle, Star, Phone, ChevronLeft, Shield, X, UserCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import ChatWindow from "../components/ChatWindow";

export default function ExpertHelpPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [experts, setExperts] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [requests, setRequests] = useState([]); // Incoming for experts
  const [loading, setLoading] = useState(true);
  
  // View State
  const [activeChat, setActiveChat] = useState(null); // If set, shows chat window
  const [activeTab, setActiveTab] = useState("find"); // 'find', 'consultations', 'requests' (expert only)
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [expertForm, setExpertForm] = useState({ specialty: "", experience: "" });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
        const token = localStorage.getItem("token");
        // 1. Get User Profile to know role
        const userRes = await axios.get("http://localhost:4000/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const userData = userRes.data.user; // Correctly access user object
        setCurrentUser(userData);

        // 2. Load Data based on role
        if (userData.role === "expert") {
            setActiveTab("requests");
            fetchExpertDashboardData(token);
        } else {
            fetchFarmerData(token);
        }
    } catch (err) {
        console.error("Init Error", err);
        setLoading(false);
    }
  };

  const fetchFarmerData = async (token) => {
      try {
          const [expRes, consRes] = await Promise.all([
              axios.get("http://localhost:4000/api/experts"),
              axios.get("http://localhost:4000/api/experts/consult/my-consultations", { headers: { Authorization: `Bearer ${token}` } })
          ]);
          setExperts(expRes.data);
          setConsultations(consRes.data);
      } finally {
          setLoading(false);
      }
  };

  const fetchExpertDashboardData = async (token) => {
      try {
          const [reqRes, consRes] = await Promise.all([
              axios.get("http://localhost:4000/api/experts/consult/requests", { headers: { Authorization: `Bearer ${token}` } }),
              axios.get("http://localhost:4000/api/experts/consult/my-consultations", { headers: { Authorization: `Bearer ${token}` } })
          ]);
          setRequests(reqRes.data);
          setConsultations(consRes.data);
      } finally {
          setLoading(false);
      }
  };

  const handleConnect = async (expertId) => {
    try {
        const token = localStorage.getItem("token");
        await axios.post("http://localhost:4000/api/experts/consult/request", { expertId }, {
             headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Consultation request sent!");
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleRequestAction = async (requestId, status) => {
      try {
          const token = localStorage.getItem("token");
          await axios.put(`http://localhost:4000/api/experts/consult/request/${requestId}`, { status }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          toast.success(`Request ${status}`);
          fetchExpertDashboardData(token); // Refresh
      } catch (err) {
          toast.error("Failed to update status");
      }
  };

  const submitExpertRequest = async () => {
    try {
       const token = localStorage.getItem("token");
       await axios.post("http://localhost:4000/api/experts/request", expertForm, {
         headers: { Authorization: `Bearer ${token}` } 
       });
       toast.success("Expert request submitted! Wait for admin approval.");
       setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    }
  };

  // Render Logic
  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading modules...</div>;

  // View: Chat Window
  if (activeChat) {
      const otherUser = currentUser.role === 'expert' ? activeChat.farmerId : activeChat.expertId.userId;
      return (
          <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50">
              <ChatWindow 
                  currentUser={currentUser} 
                  otherUser={otherUser} 
                  onClose={() => setActiveChat(null)}
              />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-10 px-4 md:px-0 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-cyan-100 overflow-hidden flex flex-col min-h-[85vh] relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 flex flex-col md:flex-row md:items-center justify-between text-white shadow-md">
           <div className="flex items-center gap-4 mb-4 md:mb-0">
             <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-white/20 rounded-full transition"><ChevronLeft size={24} /></button>
             <div>
               <h2 className="font-bold text-2xl flex items-center gap-2">
                   <Stethoscope size={28} /> {currentUser.role === 'expert' ? 'Expert Dashboard' : 'Expert Help'}
               </h2>
               <p className="text-sm text-rose-100 opacity-90">
                   {currentUser.role === 'expert' ? 'manage your consultations' : 'Consult with top agronomists'}
               </p>
             </div>
           </div>
           
           {/* Role Toggle / Tabs */}
           <div className="flex bg-black/20 p-1 rounded-xl">
               {currentUser.role === 'expert' ? (
                   <>
                     <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab==='requests' ? 'bg-white text-rose-600' : 'text-white/80 hover:bg-white/10'}`}>Requests ({requests.length})</button>
                     <button onClick={() => setActiveTab('consultations')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab==='consultations' ? 'bg-white text-rose-600' : 'text-white/80 hover:bg-white/10'}`}>My Chats</button>
                   </>
               ) : (
                   <>
                     <button onClick={() => setActiveTab('find')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab==='find' ? 'bg-white text-rose-600' : 'text-white/80 hover:bg-white/10'}`}>Find Experts</button>
                     <button onClick={() => setActiveTab('consultations')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab==='consultations' ? 'bg-white text-rose-600' : 'text-white/80 hover:bg-white/10'}`}>My Consultations</button>
                   </>
               )}
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-50/50 p-6 overflow-y-auto">
            
            {/* 1. Find Experts (Farmer) */}
            {activeTab === 'find' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {experts.map(exp => (
                        <motion.div key={exp._id} whileHover={{y:-5}} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden">
                                        {exp.userId?.avatar ? <img src={exp.userId.avatar} className="object-cover w-full h-full"/> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{exp.userId?.name?.[0]}</div>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{exp.userId?.name}</h3>
                                        <p className="text-xs text-rose-500 font-semibold uppercase">{exp.specialty}</p>
                                    </div>
                                </div>
                                {exp.isOnline && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Online</span>}
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-50 pt-4">
                                <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-yellow-400"/> {exp.rating || "New"}</span>
                                <span>•</span>
                                <span>{exp.experience} Experience</span>
                            </div>
                            <button onClick={() => handleConnect(exp._id)} className="w-full mt-4 bg-slate-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-200">
                                Send Request
                            </button>
                        </motion.div>
                    ))}
                    {currentUser.role !== 'expert' && (
                        <div className="col-span-full mt-8 text-center">
                            <button onClick={() => setShowModal(true)} className="text-rose-500 text-sm font-semibold hover:underline">Want to become an expert? Join us.</button>
                        </div>
                    )}
                </div>
            )}

            {/* 2. My Consultations (Both) */}
            {activeTab === 'consultations' && (
                <div className="space-y-4">
                    {consultations.length === 0 ? <p className="text-center text-slate-500 py-10">No active consultations.</p> : consultations.map(c => {
                        const otherPerson = currentUser.role === 'expert' ? c.farmerId : c.expertId.userId;
                        return (
                            <motion.div key={c._id} layout className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                                        {otherPerson.avatar ? <img src={otherPerson.avatar} className="object-cover w-full h-full"/> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{otherPerson.name?.[0]}</div>}
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-slate-800">{otherPerson.name}</h4>
                                         <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">Active Protocol</span>
                                     </div>
                                </div>
                                <button onClick={() => setActiveChat(c)} className="bg-rose-500 text-white p-3 rounded-full hover:bg-rose-600 transition shadow-lg shadow-rose-200">
                                    <MessageCircle size={20}/>
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* 3. Requests (Expert Only) */}
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    {requests.length === 0 ? <p className="text-center text-slate-500 py-10">No pending requests.</p> : requests.map(req => (
                         <div key={req._id} className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                                        {req.farmerId.avatar ? <img src={req.farmerId.avatar} className="object-cover w-full h-full"/> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{req.farmerId.name?.[0]}</div>}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{req.farmerId.name}</h4>
                                        <p className="text-xs text-slate-500">Requested a consultation</p>
                                    </div>
                              </div>
                              <div className="flex gap-3">
                                  <button onClick={() => handleRequestAction(req._id, "rejected")} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">Decline</button>
                                  <button onClick={() => handleRequestAction(req._id, "approved")} className="px-4 py-2 rounded-lg bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 shadow-lg shadow-rose-200">Accept</button>
                              </div>
                         </div>
                    ))}
                </div>
            )}

        </div>

        {/* Modal: Join Expert */}
        <AnimatePresence>
          {showModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }} 
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm"
              >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">Become an Expert</h3>
                    <button onClick={() => setShowModal(false)}><X className="text-slate-400" /></button>
                  </div>
                  
                  <div className="space-y-5">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Specialty</label>
                       <input 
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                         placeholder="e.g. Soil Science"
                         value={expertForm.specialty}
                         onChange={(e) => setExpertForm({...expertForm, specialty: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Experience</label>
                       <input 
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                         placeholder="e.g. 5 years"
                         value={expertForm.experience}
                         onChange={(e) => setExpertForm({...expertForm, experience: e.target.value})}
                       />
                     </div>
                     <button 
                       onClick={submitExpertRequest}
                       className="w-full bg-rose-600 text-white font-bold py-3.5 rounded-xl hover:bg-rose-700 transition shadow-xl shadow-rose-200"
                     >
                        Submit Application
                     </button>
                  </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
