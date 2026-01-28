import { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle, Plus, Trash, BookOpen, Users, List } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:4000/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("communities");
  const [stats, setStats] = useState({ pendingCommunities: 0, pendingExperts: 0 });

  // Data States
  const [pendingCommunities, setPendingCommunities] = useState([]);
  const [pendingExperts, setPendingExperts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  
  // New Scheme Form
  const [newScheme, setNewScheme] = useState({ title: "", description: "", category: "", link: "", deadline: "" });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === "communities") {
        const res = await axios.get(`${API_URL}/communities/admin/pending`, { headers });
        setPendingCommunities(res.data);
      } else if (activeTab === "experts") {
        const res = await axios.get(`${API_URL}/experts/pending`, { headers });
        setPendingExperts(res.data);
      } else if (activeTab === "schemes") {
        const res = await axios.get(`${API_URL}/schemes`);
        setSchemes(res.data);
      }
    } catch (error) {
      console.error("Error fetching admin data", error);
    }
  };

  const approveCommunity = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/communities/admin/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Community Approved!");
      fetchData();
    } catch (error) {
      toast.error("Failed to approve");
    }
  };

  const approveExpert = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/experts/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Expert Approved & Role Updated!");
      fetchData();
    } catch (error) {
      toast.error("Failed to approve expert");
    }
  };

  const addScheme = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/schemes`, newScheme, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Scheme Added!");
      setNewScheme({ title: "", description: "", category: "", link: "", deadline: "" });
      fetchData();
    } catch (error) {
      toast.error("Failed to add scheme");
    }
  };

  const deleteScheme = async (id) => {
    try {
     const token = localStorage.getItem("token");
     await axios.delete(`${API_URL}/schemes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
     toast.success("Scheme Deleted");
     fetchData();
    } catch (error) {
      toast.error("Failed to delete scheme");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 px-4 md:px-10 pb-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Shield className="text-teal-600" /> Admin Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 mb-6">
          <button 
            onClick={() => setActiveTab("communities")}
            className={`pb-3 px-2 font-medium transition ${activeTab === "communities" ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-500"}`}
          >
            Pending Communities
          </button>
          <button 
            onClick={() => setActiveTab("experts")}
            className={`pb-3 px-2 font-medium transition ${activeTab === "experts" ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-500"}`}
          >
            Pending Experts
          </button>
          <button 
            onClick={() => setActiveTab("schemes")}
            className={`pb-3 px-2 font-medium transition ${activeTab === "schemes" ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-500"}`}
          >
            Manage Schemes
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
          
          {/* COMMUNITIES TAB */}
          {activeTab === "communities" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-700">Pending Community Requests</h2>
              {pendingCommunities.length === 0 ? (
                <p className="text-slate-500">No pending requests.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingCommunities.map((c) => (
                    <div key={c._id} className="border p-4 rounded-lg flex justify-between items-start bg-slate-50">
                      <div>
                        <h3 className="font-bold text-lg">{c.name}</h3>
                        <p className="text-sm text-slate-500">Topic: {c.topic}</p>
                        <p className="text-sm mt-1">{c.description}</p>
                        <div className="mt-2 text-xs font-semibold text-teal-600">
                          Requested by: {c.createdBy?.name || "Unknown"}
                        </div>
                      </div>
                      <button 
                        onClick={() => approveCommunity(c._id)}
                        className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-teal-700 flex items-center gap-1"
                      >
                         <CheckCircle size={16} /> Approve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXPERTS TAB */}
          {activeTab === "experts" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-700">Pending Expert Verifications</h2>
              {pendingExperts.length === 0 ? (
                <p className="text-slate-500">No pending expert requests.</p>
              ) : (
                <div className="space-y-4">
                  {pendingExperts.map((e) => (
                    <div key={e._id} className="border p-4 rounded-lg flex justify-between items-center bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                           {e.userId?.name?.[0] || "U"}
                        </div>
                        <div>
                          <h3 className="font-bold">{e.userId?.name} <span className="text-xs font-normal text-slate-500">({e.userId?.email || e.userId?.mobile})</span></h3>
                          <p className="text-sm text-slate-600">{e.specialty} • {e.experience} Exp</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => approveExpert(e._id)}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
                      >
                         <Shield size={16} /> Verify
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SCHEMES TAB */}
          {activeTab === "schemes" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-700">Government Schemes</h2>
              
              {/* Add Form */}
              <form onSubmit={addScheme} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-slate-500">Add New Scheme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input value={newScheme.title} onChange={e => setNewScheme({...newScheme, title: e.target.value})} placeholder="Scheme Title" className="p-2 border rounded-lg" required />
                  <input value={newScheme.category} onChange={e => setNewScheme({...newScheme, category: e.target.value})} placeholder="Category" className="p-2 border rounded-lg" required />
                  <input value={newScheme.deadline} onChange={e => setNewScheme({...newScheme, deadline: e.target.value})} placeholder="Deadline (e.g., Dec 31, 2024)" className="p-2 border rounded-lg" required />
                  <input value={newScheme.link} onChange={e => setNewScheme({...newScheme, link: e.target.value})} placeholder="Official Link (URL)" className="p-2 border rounded-lg" />
                </div>
                <textarea value={newScheme.description} onChange={e => setNewScheme({...newScheme, description: e.target.value})} placeholder="Description" className="w-full p-2 border rounded-lg mb-3" rows="2" required />
                <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 flex items-center gap-1">
                  <Plus size={18} /> Add Scheme
                </button>
              </form>

              {/* List */}
              <div className="space-y-3">
                 {schemes.map((s) => (
                   <div key={s._id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0">
                     <div>
                       <h4 className="font-bold text-slate-800">{s.title}</h4>
                       <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{s.category}</span>
                       <p className="text-sm text-slate-500 mt-1">{s.description}</p>
                       <a href={s.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block">{s.link}</a>
                     </div>
                     <button onClick={() => deleteScheme(s._id)} className="text-red-400 hover:text-red-600 p-2">
                       <Trash size={18} />
                     </button>
                   </div>
                 ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
