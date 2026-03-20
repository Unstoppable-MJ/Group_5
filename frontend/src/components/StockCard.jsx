import { motion, AnimatePresence } from "framer-motion";

export default function StockCard({ stock, index, isExpanded, onToggle, onRemoveStock }) {
  if (!stock) return null;

  const profit = stock.current_value - stock.investment_value;
  const isProfitable = profit >= 0;

  // Define some color mappings for common sectors
  const getSectorColor = (sector) => {
    switch (sector) {
      case "Technology": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Healthcare": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Financial Services": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Consumer Cyclical": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Communication Services": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "Industrials": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Energy": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: { duration: 0.4, type: "spring", stiffness: 200, damping: 25 },
        opacity: { duration: 0.2 }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`bg-slate-900/40 backdrop-blur-md rounded-[1.5rem] border overflow-hidden flex flex-col transition-all cursor-pointer relative ${isExpanded ? "border-indigo-500 shadow-[0_20px_40px_rgba(0,0,0,0.4)] z-20 scale-[1.02]" : "border-slate-700/50 shadow-lg hover:border-slate-500/50"
        }`}
    >
      {/* Decorative Gradient Line */}
      <div className={`h-1 w-full ${isProfitable ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-rose-500 to-red-400"}`} />

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tighter uppercase">{stock.symbol.replace(".NS", "")}</h2>
              {isExpanded && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />
              )}
            </div>
            {!isExpanded && (
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{stock.sector || "Asset"}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="text-sm font-black text-white">₹{(stock.current_value / stock.quantity).toLocaleString("en-IN")}</div>
            <motion.div
              layout
              className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${isProfitable ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"}`}
            >
              {isProfitable ? "▲" : "▼"} {Math.abs(((profit / stock.investment_value) * 100)).toFixed(2)}%
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4 border-t border-slate-800/50 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-bold">Buy Price</p>
                    <p className="text-sm font-bold text-slate-200">₹{(stock.investment_value / stock.quantity).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-bold">Quantity</p>
                    <p className="text-sm font-bold text-white">{stock.quantity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-bold">P/E Ratio</p>
                    <p className="text-sm font-bold text-white">{stock.pe_ratio || "N/A"}</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-bold">Discount</p>
                    <p className="text-sm font-bold text-emerald-400">{stock.discount_level?.toFixed(2)}%</p>
                  </div>
                </div>

                <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/20 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-black">Holdings Profit</p>
                    <p className={`text-xl font-black ${isProfitable ? "text-emerald-400" : "text-rose-400"}`}>
                      ₹{Math.abs(profit).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveStock(stock.id, stock.symbol.replace(".NS", ""));
                      }}
                      className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white flex items-center justify-center transition-all border border-rose-500/20 shadow-lg hover:shadow-rose-500/30 group"
                      title="Remove stock from portfolio"
                    >
                      <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isProfitable ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {isProfitable ? "📈" : "📉"}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isExpanded && (
          <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500 pt-3 border-t border-slate-800/50 font-bold uppercase tracking-widest">
            <span>P/E: <span className="text-slate-300">{stock.pe_ratio}</span></span>
            <span>Disc: <span className="text-slate-300">{stock.discount_level.toFixed(1)}%</span></span>
          </div>
        )}
      </div>
    </motion.div>
  );
}