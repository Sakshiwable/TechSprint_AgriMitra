import { useState } from "react";
import { Upload, CheckCircle, AlertTriangle, Scan, X, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function CropAnalysisPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = () => {
    if (!selectedImage) return;
    setAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      setAnalyzing(false);
      // Mock result
      setResult({
        disease: "Leaf Rust",
        confidence: "94%",
        solutions: [
          "Apply fungicides containing triazoles.",
          "Ensure proper spacing between plants.",
          "Remove infected leaves immediately."
        ],
        healthy: false
      });
    }, 2500);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-10 px-4 md:px-0 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-cyan-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between text-white shadow-md">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => navigate("/dashboard")}
               className="p-2 hover:bg-white/20 rounded-full transition"
             >
               <ChevronLeft size={24} />
             </button>
             <div className="p-2 bg-white/20 rounded-full">
               <Scan size={24} className="text-white" />
             </div>
             <div>
               <h2 className="font-bold text-lg">Crop Doctor</h2>
               <p className="text-xs text-amber-100 opacity-90">Instant Disease Detection</p>
             </div>
           </div>
        </div>

        <div className="p-6">
          {!selectedImage ? (
             <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition cursor-pointer relative">
               <input 
                 type="file" 
                 accept="image/*"
                 onChange={handleImageUpload}
                 className="absolute inset-0 opacity-0 cursor-pointer"
               />
               <Upload size={48} className="mb-4 text-slate-400" />
               <p className="text-lg font-medium">Upload Crop Image</p>
               <p className="text-sm opacity-75">Click or drag and drop</p>
             </div>
          ) : (
            <div className="space-y-6">
               <div className="relative rounded-xl overflow-hidden border border-slate-200">
                 <img src={selectedImage} alt="Crop" className="w-full h-64 object-cover" />
                 
                 {analyzing && (
                   <motion.div 
                     initial={{ top: 0 }}
                     animate={{ top: "100%" }}
                     transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                     className="absolute left-0 w-full h-1 bg-amber-400 shadow-[0_0_10px_#f59e0b]"
                   />
                 )}

                 <button 
                   onClick={clearImage}
                   className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                 >
                   <X size={16} />
                 </button>
               </div>

               {!analyzing && !result && (
                 <button 
                   onClick={analyzeImage}
                   className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30 transition transform active:scale-95"
                 >
                   Analyze Image
                 </button>
               )}

               {analyzing && (
                  <div className="text-center py-4">
                    <p className="text-amber-600 font-semibold animate-pulse">Analyzing crop health...</p>
                  </div>
               )}

               <AnimatePresence>
                 {result && (
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-slate-50 rounded-xl p-5 border border-slate-200"
                   >
                     <div className="flex items-center gap-3 mb-4">
                       {result.healthy ? (
                         <CheckCircle className="text-green-500" size={28} />
                       ) : (
                         <AlertTriangle className="text-red-500" size={28} />
                       )}
                       <div>
                         <h3 className="text-xl font-bold text-slate-800">{result.disease}</h3>
                         <p className="text-sm text-slate-500">Confidence: <span className="font-semibold text-slate-700">{result.confidence}</span></p>
                       </div>
                     </div>

                     <div className="bg-white p-4 rounded-lg border border-slate-100">
                       <h4 className="font-semibold text-slate-700 mb-2">Recommended Solutions:</h4>
                       <ul className="space-y-2">
                         {result.solutions.map((sol, idx) => (
                           <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                             <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                             {sol}
                           </li>
                         ))}
                       </ul>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
