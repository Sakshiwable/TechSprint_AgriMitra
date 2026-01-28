import { useState } from "react";
import { Users, Upload, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function RequestCommunity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", topic: "", description: "", image: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:4000/api/communities/request", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Request submitted! Waiting for Admin approval.");
      navigate("/communities");
    } catch (error) {
      toast.error("Failed to submit request.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 px-4 md:px-0 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-cyan-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/communities")}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="font-bold text-lg">New Community</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Start a Movement</h3>
            <p className="text-sm text-slate-500">Create a space for farmers to discuss {form.topic || "a topic"}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Community Name</label>
              <input 
                required
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="e.g. Organic Wheat Growers"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Topic / Crop</label>
              <input 
                required
                value={form.topic}
                onChange={(e) => setForm({...form, topic: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="e.g. Wheat, Pest Control, Market"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                required
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="What is this community about?"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image (URL for now)</label>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  value={form.image}
                  onChange={(e) => setForm({...form, image: e.target.value})}
                  className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 hover:bg-teal-700 transition active:scale-95 disabled:opacity-70"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
