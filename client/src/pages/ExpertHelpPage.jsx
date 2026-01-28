import { useState, useEffect } from "react";
import { Stethoscope, Video, MessageCircle, Star, Phone, ChevronLeft, Shield, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function ExpertHelpPage() {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(null);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [expertForm, setExpertForm] = useState({ specialty: "", experience: "" });

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/experts");
        setExperts(res.data);
      } catch (error) {
        console.error("Error fetching experts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperts();
  }, []);

  const handleConnect = (expertId, type) => {
    setConnecting(expertId);
    toast.loading(`Connecting to expert via ${type}...`, { id: "connect" });

    setTimeout(() => {
      setConnecting(null);
      toast.success("Request sent! Expert will join shortly.", { id: "connect" });
    }, 2000);
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

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10 px-4 md:px-0 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-cyan-100 overflow-hidden flex flex-col h-[85vh] relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-4 flex items-center justify-between text-white shadow-md">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => navigate("/dashboard")}
               className="p-2 hover:bg-white/20 rounded-full transition"
             >
               <ChevronLeft size={24} />
             </button>
             <div className="p-2 bg-white/20 rounded-full">
               <Stethoscope size={24} className="text-white" />
             </div>
             <div>
               <h2 className="font-bold text-lg">Expert Help</h2>
               <p className="text-xs text-rose-100 opacity-90">Consult with top agronomists</p>
             </div>
           </div>
           
           {/* CTA */}
           <button onClick={() => setShowModal(true)} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition">
             Are you an Expert?
           </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {loading ? (
             <div className="text-center py-10 text-slate-500">Loading experts...</div>
          ) : experts.length === 0 ? (
             <div className="text-center py-10 text-slate-500">
               No experts found. Be the first to join!
             </div>
          ) : (
            experts.map((exp) => (
              <motion.div
                key={exp._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center relative overflow-hidden"
              >
                {/* Online status indicator */}
                <div className={`absolute top-0 left-0 w-1 h-full ${exp.isOnline ? "bg-green-500" : "bg-slate-300"}`} />

                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 flex-shrink-0 border-2 border-slate-100 shadow-sm">
                  {exp.userId?.avatar ? (
                     <img src={exp.userId.avatar} alt={exp.userId.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                     exp.userId?.name?.[0]
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-lg">{exp.userId?.name}</h3>
                    {exp.isOnline && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Online
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-600">{exp.specialty}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" /> {exp.rating || "New"}
                    </span>
                    <span>•</span>
                    <span>{exp.experience} Exp.</span>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <button 
                    onClick={() => handleConnect(exp._id, "chat")}
                    disabled={connecting === exp._id}
                    className="flex-1 sm:flex-none p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition flex justify-center items-center"
                    title="Chat"
                  >
                    <MessageCircle size={20} />
                  </button>
                  <button 
                    onClick={() => handleConnect(exp._id, "video")}
                    disabled={connecting === exp._id}
                    className="flex-1 sm:flex-none py-2 px-4 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600 shadow-md shadow-rose-200 transition flex items-center justify-center gap-2"
                  >
                    <Video size={18} />
                    <span>Consult</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }} 
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm"
              >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">Become an Expert</h3>
                    <button onClick={() => setShowModal(false)}><X className="text-slate-400" /></button>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Specialty</label>
                       <input 
                         className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-rose-500"
                         placeholder="e.g. Soil Science, Pest Control"
                         value={expertForm.specialty}
                         onChange={(e) => setExpertForm({...expertForm, specialty: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Experience (Years)</label>
                       <input 
                         className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-rose-500"
                         placeholder="e.g. 5 years"
                         value={expertForm.experience}
                         onChange={(e) => setExpertForm({...expertForm, experience: e.target.value})}
                       />
                     </div>
                     <button 
                       onClick={submitExpertRequest}
                       className="w-full bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-700 transition"
                     >
                        Submit Request
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
