import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, ArrowRight, Sprout, ShieldCheck, Banknote } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext.jsx";

export default function SchemesPage() {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSchemes();
    fetchRecommendations();
  }, []);

  const fetchSchemes = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/schemes");
      setSchemes(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching schemes:", error);
      setLoading(false);
    }
  };

  const refreshLiveSchemes = async () => {
    try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const res = await axios.post("http://localhost:4000/api/schemes/refresh", {}, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(res.data.message);
        fetchSchemes();
    } catch (err) {
        console.error("Failed to refresh", err);
        alert("Failed to refresh. Make sure Python service is running.");
        setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.post(
        "http://localhost:4000/api/schemes/recommend", {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecommendations(res.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch = scheme.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || scheme.category?.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getIcon = (category) => {
    if (category?.toLowerCase().includes("financial")) return <Banknote className="text-green-500" />;
    if (category?.toLowerCase().includes("insurance")) return <ShieldCheck className="text-blue-500" />;
    return <Sprout className="text-teal-500" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-teal-600 to-cyan-600 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">Government Schemes</h1>
          <p className="text-cyan-100">Explore financial aid, insurance, and subsidies tailored for you.</p>
        </div>
        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/20 text-center flex flex-col items-center gap-2">
            <div>
                 <div className="text-2xl font-bold">{schemes.length}</div>
                 <div className="text-xs text-cyan-100">Total Schemes</div>
            </div>
            <button 
                onClick={refreshLiveSchemes}
                className="text-xs bg-white text-teal-600 px-3 py-1 rounded-full font-bold hover:bg-teal-50 transition"
            >
                ↻ Sync Live
            </button>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sprout className="text-teal-600" />
            <h2 className="text-xl font-bold text-slate-800">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((scheme) => (
              <Link to={`/schemes/${scheme._id}`} key={scheme._id} className="group">
                <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-teal-100" />
                  
                  <div className="mb-4 p-3 bg-teal-50 w-fit rounded-xl group-hover:bg-teal-100 transition-colors">
                    {getIcon(scheme.category)}
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2">{scheme.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-grow">{scheme.description}</p>
                  
                  <div className="flex items-center text-teal-600 font-semibold text-sm mt-auto group-hover:gap-2 transition-all">
                    View Details <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Schemes with Filters */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-slate-800">All Schemes</h2>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search schemes..." 
                className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Filter Dropdown */}
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-full border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              <option value="Financial">Financial</option>
              <option value="Insurance">Insurance</option>
              <option value="Subsidy">Subsidy</option>
            </select>
          </div>
        </div>

        {loading ? (
             <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <Link to={`/schemes/${scheme._id}`} key={scheme._id} className="group">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all h-full flex flex-col hover:border-teal-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-teal-50 transition-colors">
                             {getIcon(scheme.category)}
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">{scheme.category}</span>
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2">{scheme.title}</h3>
                     <p className="text-slate-500 text-sm mb-4 line-clamp-2 px-1">{scheme.description}</p>
                    
                     <div className="mt-auto border-t border-slate-100 pt-4 flex justify-between items-center">
                        <span className="text-xs text-slate-400">Deadline: <span className="text-slate-600">{scheme.deadline}</span></span>
                        <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
                             <ArrowRight size={16} />
                        </div>
                     </div>
                  </div>
              </Link>
            ))}
          </div>
        )}

      </section>
    </div>
  );
}
