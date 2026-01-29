import { useState, useEffect } from "react";
import { BookOpen, Search, ExternalLink, ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SchemesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/schemes");
        setSchemes(res.data);
      } catch (error) {
        console.error("Error fetching schemes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);
  
  const filteredSchemes = schemes.filter(s => 
    s.title.toLowerCase().includes(query.toLowerCase()) || 
    s.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-10 px-4 md:px-0 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-cyan-100 overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between text-white shadow-md">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => navigate("/dashboard")}
               className="p-2 hover:bg-white/20 rounded-full transition"
             >
               <ChevronLeft size={24} />
             </button>
             <div className="p-2 bg-white/20 rounded-full">
               <BookOpen size={24} className="text-white" />
             </div>
             <div>
               <h2 className="font-bold text-lg">Govt. Schemes</h2>
               <p className="text-xs text-purple-100 opacity-90">Find the right support</p>
             </div>
           </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-white z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading schemes...</div>
          ) : filteredSchemes.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No schemes found matching "{query}"
            </div>
          ) : (
            filteredSchemes.map((scheme) => (
              <motion.div
                key={scheme._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-md uppercase tracking-wide">
                    {scheme.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Deadline: {scheme.deadline}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg group-hover:text-purple-700 transition">
                  {scheme.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {scheme.description}
                </p>
                <div className="mt-4 flex justify-end">
                  {scheme.link && (
                    <a 
                      href={scheme.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-800 transition"
                    >
                      View Details <ChevronRight size={16} />
                    </a>
                   )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
