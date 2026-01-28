import { useLanguage } from "../contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguagePicker() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 text-teal-700 transition">
        <Globe size={20} />
        <span className="uppercase font-semibold">{language}</span>
      </button>

      <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-lg border border-cyan-100 p-2 hidden group-hover:block z-50">
        <button
          onClick={() => setLanguage("en")}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
            language === "en" ? "bg-teal-50 text-teal-700 font-bold" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage("hi")}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
            language === "hi" ? "bg-teal-50 text-teal-700 font-bold" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          हिंदी (Hindi)
        </button>
        <button
          onClick={() => setLanguage("mr")}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
            language === "mr" ? "bg-teal-50 text-teal-700 font-bold" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          मराठी (Marathi)
        </button>
      </div>
    </div>
  );
}
