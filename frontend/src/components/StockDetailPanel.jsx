import { useState, useEffect } from "react";
import API from "../services/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import StockPredictionChart from "./StockPredictionChart";

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

export default function StockDetailPanel({ symbol, allStocks = [], portfolioId, onSymbolChange }) {
    const [preview, setPreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [historyData, setHistoryData] = useState({});
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Fetch focus stock preview
    useEffect(() => {
        if (symbol) {
            let isMounted = true;
            setLoadingPreview(true);
            const safeSymbol = symbol.includes(".NS") ? symbol : `${symbol}.NS`;
            API.get(`stock-preview/?symbol=${safeSymbol}`)
                .then((res) => {
                    if (isMounted) {
                        setPreview(res.data);
                        setLoadingPreview(false);
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        setPreview(null);
                        setLoadingPreview(false);
                    }
                });
            return () => { isMounted = false; };
        } else {
            setPreview(null);
        }
    }, [symbol]);

    // Fetch portfolio-wide history for charts
    useEffect(() => {
        if (portfolioId) {
            let isMounted = true;
            setLoadingHistory(true);
            API.get(`portfolio-history/?portfolio_id=${portfolioId}`)
                .then((res) => {
                    if (isMounted) {
                        setHistoryData(res.data);
                        setLoadingHistory(false);
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        setHistoryData({});
                        setLoadingHistory(false);
                    }
                });
            return () => { isMounted = false; };
        }
    }, [portfolioId]);

    const metrics = [
        { label: "Symbol", key: "symbol", color: "text-white" },
        { label: "Company Name", key: "company_name", color: "text-emerald-400" },
        { label: "Current Price", key: "current_price", format: (v) => `₹${v?.toLocaleString("en-IN")}`, color: "text-white font-bold" },
        { label: "Max Price (52W)", key: "max_price", format: (v) => v ? `₹${v.toLocaleString("en-IN")}` : "N/A", color: "text-slate-300" },
        { label: "P/E Ratio", key: "pe_ratio", format: (v) => v || "N/A", color: "text-white" },
        { label: "Discount Level", key: "discount_level", format: (v) => v != null ? `${v.toFixed(2)}%` : "N/A", color: "text-purple-400" },
        { label: "Opportunity Score", key: "opportunity", format: (v) => v != null ? `${v.toFixed(2)}%` : "N/A", color: "text-orange-400" },

    ];

    if (allStocks.length === 0 && !loadingPreview && !loadingHistory) {
        return (
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                        <span className="text-3xl text-slate-400">📊</span>
                    </div>
                    <p className="text-slate-400 font-medium tracking-wide">Add stocks to your portfolio to view the comparative analysis and charts.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white">Portfolio Analytics Table</h2>
                            <p className="text-sm text-slate-400">Comparative metrics across <span className="text-indigo-400 font-bold">{allStocks.length}</span> assets</p>
                        </div>
                    </div>

                    {symbol && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Selected: {symbol}
                        </motion.div>
                    )}
                </div>

                {/* 📊 Comparative Table */}
                <div className="bg-slate-950/40 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl mb-8">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                            <thead className="bg-slate-900/80 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] w-48 sticky left-0 bg-slate-900 z-10 border-r border-slate-800 font-black">
                                        Metric
                                    </th>
                                    {allStocks.map((stock) => (
                                        <th key={stock.id} className={`px-6 py-4 font-black text-center border-l border-slate-800/50 min-w-[180px] ${symbol === stock.symbol.replace(".NS", "") ? "bg-indigo-500/10 text-indigo-400" : "text-white"}`}>
                                            {stock.symbol.replace(".NS", "")}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {metrics.map((metric) => (
                                    <tr key={metric.key} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4 text-slate-400 font-bold sticky left-0 bg-slate-900 z-10 border-r border-slate-800 group-hover:text-slate-200 transition-colors">
                                            {metric.label}
                                        </td>
                                        {allStocks.map((stock) => {
                                            const val = stock[metric.key];
                                            const isSelected = symbol === stock.symbol.replace(".NS", "");
                                            return (
                                                <td key={`${stock.id}-${metric.key}`} className={`px-6 py-4 text-center border-l border-slate-800/20 ${metric.color} ${isSelected ? "bg-indigo-500/5" : ""}`}>
                                                    {metric.format ? metric.format(val) : val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 🔮 Trend Forecast (Now fully aligned and integrated) */}
                <StockPredictionChart
                    symbol={symbol}
                    allStocks={allStocks}
                    onSymbolChange={onSymbolChange}
                />
            </div>
        </div>
    );
}
