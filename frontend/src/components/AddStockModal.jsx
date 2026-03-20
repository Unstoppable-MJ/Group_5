import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 shadow-xl">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-emerald-400">
          ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function AddStockModal({ onClose, onSuccess, activePortfolio }) {
  const [symbol, setSymbol] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  // 🔍 Click Outside Suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔍 Suggestions Fetch
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (symbol.length > 0) {
        try {
          const res = await API.get(`stock-search/?q=${symbol}`);
          setSuggestions(res.data);
          setShowSuggestions(true);
        } catch (err) {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [symbol]);

  // 🔍 Live Preview Fetch
  useEffect(() => {
    const fetchPreview = async () => {
      if (symbol.length > 2 && !showSuggestions) {
        setLoading(true);

        try {
          const res = await API.get(`stock-preview/?symbol=${symbol}`);
          setPreview(res.data);
        } catch (err) {
          setPreview(null);
        } finally {
          setLoading(false);
        }
      } else {
        setPreview(null);
      }
    };

    // Debounce the API call by 600ms
    const delayDebounceFn = setTimeout(() => {
      fetchPreview();
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [symbol]);

  // ➕ Add Stock
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activePortfolio) {
      alert("Please select or create a portfolio first.");
      return;
    }

    try {
      await API.post("add-stock/", {
        symbol,
        quantity: 1, // Quantity is now implicitly 1
        portfolio: activePortfolio,
      });

      onSuccess();
      onClose();
    } catch (err) {
      alert("Error adding stock");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
        {/* Blurred Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-slate-900/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl w-full max-w-2xl text-slate-100 border border-slate-700/50 shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "90vh" }}
        >
          {/* Decorative Top Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-teal-400" />

          {/* Header (Sticky) */}
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              Add New Asset
            </h2>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800/50 p-2 rounded-xl">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">

              {/* SYMBOL INPUT */}
              <div className="relative" ref={suggestionRef}>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Stock Symbol</label>
                <input
                  type="text"
                  placeholder="e.g. RELIANCE"
                  value={symbol}
                  onChange={(e) => {
                    setSymbol(e.target.value.toUpperCase());
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium placeholder-slate-600 uppercase"
                />

                {/* Autocomplete Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                    >
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSymbol(s.symbol);
                            setShowSuggestions(false);
                            setSuggestions([]);
                          }}
                          className="w-full px-5 py-4 text-left hover:bg-slate-800/50 transition-all flex justify-between items-center group border-b border-slate-800 last:border-0"
                        >
                          <div>
                            <span className="block text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase">
                              {s.symbol}
                            </span>
                            <span className="block text-[10px] text-slate-500 font-medium">
                              {s.name}
                            </span>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 🔍 LOADING */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Analyzing asset metrics and historical data...</span>
                </motion.div>
              )}

              {/* 📊 PREVIEW BOX */}
              <AnimatePresence>
                {preview && !loading && (
                  <motion.div
                    key="preview-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-6"
                  >
                    {/* Chart Area */}
                    {preview.history && preview.history.length > 0 && (
                      <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-400 mb-4">1-Month Price History</h3>
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={preview.history}>
                              <defs>
                                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" hide />
                              <YAxis domain={['auto', 'auto']} hide />
                              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeDasharray: '3 3' }} />
                              <Area type="monotone" dataKey="close" stroke="#10b981" strokeWidth={3} fill="url(#colorClose)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Metrics Table */}
                    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/50 border-b border-slate-700/50">
                          <tr>
                            <th className="px-4 py-3 font-medium text-slate-400">Metric</th>
                            <th className="px-4 py-3 font-medium text-slate-400 text-right">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          <tr className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-4 py-3 text-slate-300">Symbol</td>
                            <td className="px-4 py-3 font-semibold text-white text-right">{preview.symbol}</td>
                          </tr>
                          <tr className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-4 py-3 text-slate-300">Company Name</td>
                            <td className="px-4 py-3 font-semibold text-emerald-400 text-right">{preview.company_name}</td>
                          </tr>
                          <tr className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-4 py-3 text-slate-300">Current Price</td>
                            <td className="px-4 py-3 font-semibold text-white text-right">₹{preview.current_price?.toLocaleString("en-IN")}</td>
                          </tr>
                          <tr className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-4 py-3 text-slate-300">Max Price (52W)</td>
                            <td className="px-4 py-3 font-semibold text-slate-300 text-right">₹{preview.max_price?.toLocaleString("en-IN")}</td>
                          </tr>
                          <tr className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-4 py-3 text-slate-300">P/E Ratio</td>
                            <td className="px-4 py-3 font-semibold text-white text-right">{preview.pe_ratio}</td>
                          </tr>
                          <tr className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-4 py-3 text-slate-300">Discount Level</td>
                            <td className="px-4 py-3 font-semibold text-purple-400 text-right">{preview.discount_level?.toFixed(2)}%</td>
                          </tr>
                          <tr className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-4 py-3 text-slate-300">Opportunity Score</td>
                            <td className="px-4 py-3 font-semibold text-orange-400 text-right">{preview.opportunity?.toFixed(2)}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Spacer so content doesn't sit exactly on the button border edge when scrolled to bottom */}
              <div className="h-2"></div>

            </div>

            {/* Sticky Footer BUTTONS */}
            <div className="shrink-0 pt-6 mt-2 flex gap-4 border-t border-slate-700/50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl transition-colors font-medium text-slate-300"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!preview || loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold p-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Asset
              </motion.button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}