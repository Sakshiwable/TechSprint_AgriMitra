import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Calendar, FileText, CheckCircle, Award } from "lucide-react";

export default function SchemeDetails() {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/schemes/${id}`);
        setScheme(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching scheme details:", error);
        setLoading(false);
      }
    };
    fetchScheme();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!scheme) return <div className="p-10 text-center">Scheme not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/schemes" className="inline-flex items-center text-slate-500 hover:text-teal-600 mb-6 transition">
          <ArrowLeft size={20} className="mr-2" /> Back to Schemes
        </Link>
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-cyan-100">
           {/* Header */}
            <div className="bg-gradient-to-br from-teal-600 to-cyan-700 p-8 md:p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-10 -translate-y-10">
                    <FileText size={200} />
                </div>
                <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-3 border border-white/30">
                        {scheme.category}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{scheme.title}</h1>
                    <div className="flex items-center gap-6 mt-6 text-cyan-100 text-sm">
                        <div className="flex items-center gap-2">
                             <Calendar size={18} />
                             <span>Deadline: {scheme.deadline}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-10 space-y-8">
                
                {/* Description */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center">
                        Description
                    </h2>
                    <p className="text-slate-600 leading-relaxed text-lg">
                        {scheme.description}
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Benefits */}
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                        <h2 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                            <Award className="mr-2" /> Benefits
                        </h2>
                        <p className="text-green-700 font-medium">
                            {scheme.benefits || "See official documents for details."}
                        </p>
                    </div>

                    {/* Eligibility */}
                     <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                            <CheckCircle className="mr-2" /> Eligibility
                        </h2>
                         <p className="text-blue-700">
                            {scheme.eligibility}
                        </p>
                    </div>
                </div>

                {/* Docs */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Required Documents</h2>
                    <div className="flex flex-wrap gap-3">
                        {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 ? (
                            scheme.requiredDocuments.map((doc, idx) => (
                                <span key={idx} className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-medium text-sm border border-slate-200">
                                    {doc}
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-500">No specific documents listed.</span>
                        )}
                    </div>
                </section>

                {/* Application Process */}
                <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Application Process</h2>
                    <div className="prose text-slate-600 whitespace-pre-line">
                        {scheme.applicationProcess}
                    </div>
                </section>

                {/* Action */}
                <div className="flex justify-center pt-6">
                    {scheme.link && (
                         <a 
                            href={scheme.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        >
                            Apply Now <ExternalLink size={20} />
                        </a>
                    )}
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}
