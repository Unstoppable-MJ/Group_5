import { motion } from "framer-motion";

export default function KPISection({ stocks }) {
  const avgPE = stocks.length
    ? stocks.reduce((acc, s) => acc + s.pe_ratio, 0) / stocks.length
    : 0;

  const avgDiscount = stocks.length
    ? stocks.reduce((acc, s) => acc + s.discount_level, 0) / stocks.length
    : 0;

  const avgOpportunity = stocks.length
    ? stocks.reduce((acc, s) => acc + s.opportunity, 0) / stocks.length
    : 0;

  const kpis = [
    { title: "Average P/E", value: avgPE.toFixed(1), icon: "⚖️", color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Avg Discount", value: `${avgDiscount.toFixed(1)}%`, icon: "🏷️", color: "text-purple-400", bg: "bg-purple-500/10" },
    { title: "Opportunity Score", value: `${avgOpportunity.toFixed(1)}%`, icon: "🔥", color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 shadow-lg flex items-center gap-4 transition-all"
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${kpi.bg}`}>
            {kpi.icon}
          </div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">{kpi.title}</h3>
            <h2 className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</h2>
          </div>
        </motion.div>
      ))}
    </div>
  );
}