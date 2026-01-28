import { motion } from "framer-motion";

export default function DashboardCard({ title, description, icon: Icon, onClick, colorClass }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 rounded-2xl border bg-white shadow-sm cursor-pointer transition-all hover:shadow-lg ${colorClass}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
          <Icon size={28} className="text-current opacity-90" />
        </div>
        <h3 className="text-xl font-bold opacity-90">{title}</h3>
      </div>
      <p className="text-sm opacity-75 font-medium leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
