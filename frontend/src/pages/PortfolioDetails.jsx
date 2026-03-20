import { useEffect, useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import StockCard from "../components/StockCard";
import StockClusteringModule from "../components/StockClusteringModule";

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

export default function PortfolioDetails({ activePortfolio }) {
    const navigate = useNavigate();
    const [stocks, setStocks] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [stockToDelete, setStockToDelete] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const [preview, setPreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [historyData, setHistoryData] = useState({});
    const [loadingHistory, setLoadingHistory] = useState(false);

    // 1. Fetch Current Portfolio Stocks
    useEffect(() => {
        if (!activePortfolio) return;

        API.get(`portfolio-stocks/?portfolio_id=${activePortfolio}`)
            .then((res) => {
                setStocks(res.data);
                if (res.data.length > 0) {
                    setSelectedSymbol(res.data[0].symbol.replace(".NS", ""));
                } else {
                    setSelectedSymbol(null);
                }
            })
            .catch((err) => console.log(err));
    }, [activePortfolio]);

    const toggleExpand = (id, symbol) => {
        setExpandedCardId(prev => (prev === id ? null : id));
        setSelectedSymbol(symbol.replace(".NS", ""));
    };

    const handleRemoveRequest = (stockId, symbol) => {
        setStockToDelete({ id: stockId, symbol });
    };

    const confirmDelete = () => {
        if (!stockToDelete) return;

        API.delete(`portfolio/delete-stock/`, {
            data: { portfolio_id: activePortfolio, stock_id: stockToDelete.id }
        })
            .then(res => {
                setStocks(prev => prev.filter(s => s.id !== stockToDelete.id));
                setStockToDelete(null);
                setToastMessage(`Stock ${stockToDelete.symbol} removed successfully`);
                setTimeout(() => setToastMessage(null), 3000);

                if (selectedSymbol === stockToDelete.symbol) {
                    setSelectedSymbol(null);
                    setPreview(null);
                }
            })
            .catch(err => {
                console.error("Delete error:", err);
                setStockToDelete(null);
                setToastMessage("Failed to remove stock from portfolio.");
                setTimeout(() => setToastMessage(null), 3000);
            });
    };

    // 2. Group stocks by sector for "Your Holdings"
    const groupedStocks = useMemo(() => {
        const groups = {};
        stocks.forEach(stock => {
            const sector = stock.sector || "Other/Unknown";
            if (!groups[sector]) groups[sector] = [];
            groups[sector].push(stock);
        });

        const sortedSectors = Object.keys(groups).sort((a, b) => {
            if (a === "Other/Unknown") return 1;
            if (b === "Other/Unknown") return -1;
            return a.localeCompare(b);
        });

        return { groups, sortedSectors };
    }, [stocks]);

    // 3. Fetch focus stock preview
    useEffect(() => {
        if (selectedSymbol) {
            setLoadingPreview(true);
            API.get(`stock-preview/?symbol=${selectedSymbol}`)
                .then((res) => {
                    setPreview(res.data);
                    setLoadingPreview(false);
                })
                .catch(() => {
                    setPreview(null);
                    setLoadingPreview(false);
                });
        } else {
            setPreview(null);
        }
    }, [selectedSymbol]);

    // 4. Fetch portfolio-wide history for Performance Grid charts
    useEffect(() => {
        if (activePortfolio) {
            setLoadingHistory(true);
            API.get(`portfolio-history/?portfolio_id=${activePortfolio}`)
                .then((res) => {
                    setHistoryData(res.data);
                    setLoadingHistory(false);
                })
                .catch(() => {
                    setHistoryData({});
                    setLoadingHistory(false);
                });
        }
    }, [activePortfolio]);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Portfolio Details</h1>
                    <p className="text-slate-400">Deep dive into your assets, performance grids, and individual sector holdings.</p>
                </div>
            </div>

            {stocks.length === 0 && !loadingPreview && !loadingHistory ? (
                <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                            <span className="text-3xl text-slate-400">📊</span>
                        </div>
                        <p className="text-slate-400 font-medium tracking-wide">Add stocks to your portfolio on the dashboard to view detailed analysis.</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* 📈 Portfolio Performance Grid container */}
                    <div className="bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Portfolio Performance Grid</h3>
                            <div className="h-px flex-grow bg-slate-800" />
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">1-Month Overviews</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {loadingHistory ? (
                                [...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-slate-950/20 h-40 rounded-3xl border border-slate-800/50 animate-pulse shadow-inner" />
                                ))
                            ) : (
                                stocks.map((stock) => {
                                    const sym = stock.symbol;
                                    const isFocused = selectedSymbol === sym.replace(".NS", "");
                                    const chartData = historyData[sym] || [];

                                    return (
                                        <motion.div
                                            key={stock.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            onClick={() => setSelectedSymbol(sym.replace(".NS", ""))}
                                            className={`bg-slate-950/40 p-5 rounded-[2rem] border transition-all duration-300 relative group cursor-pointer overflow-hidden ${isFocused ? "border-indigo-500 shadow-[0_20px_40px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50" : "border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-700 shadow-xl"}`}
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isFocused ? "text-indigo-400" : "text-slate-500"}`}>{stock.sector || "Asset"}</p>
                                                    <h4 className={`text-lg font-black tracking-tighter ${isFocused ? "text-white" : "text-slate-200"}`}>{sym.replace(".NS", "")}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-white">₹{stock.current_price?.toLocaleString("en-IN")}</p>
                                                    <p className={`text-[10px] font-bold ${stock.discount_level > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                                        {stock.discount_level > 0 ? "+" : ""}{stock.discount_level?.toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="h-24 w-full relative z-10">
                                                {chartData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={chartData}>
                                                            <defs>
                                                                <linearGradient id={`detail-color-${sym}`} x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor={isFocused ? "#6366f1" : "#10b981"} stopOpacity={0.4} />
                                                                    <stop offset="95%" stopColor={isFocused ? "#6366f1" : "#10b981"} stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <XAxis dataKey="date" hide />
                                                            <YAxis domain={['auto', 'auto']} hide />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="close"
                                                                stroke={isFocused ? "#6366f1" : "#10b981"}
                                                                strokeWidth={3}
                                                                fill={`url(#detail-color-${sym})`}
                                                                animationDuration={1000}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-[10px] text-slate-700 font-bold uppercase tracking-widest bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">No Data available</div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* 🎯 Massive Focus Chart */}
                    <AnimatePresence mode="wait">
                        {selectedSymbol && preview && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[3rem] border border-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden group mt-8"
                            >
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />

                                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full border border-indigo-500/20 uppercase tracking-[0.2em] shadow-inner">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,1)]" />
                                            Detailed Focus Analysis
                                        </div>
                                        <div>
                                            <h2 className="text-5xl font-black text-white tracking-tighter mb-2 leading-none uppercase">{preview.company_name}</h2>
                                            <div className="flex items-center gap-4 text-slate-400 font-bold uppercase tracking-widest text-xs">
                                                <span>{selectedSymbol}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                                <span>{preview.sector}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/60 p-8 rounded-[2rem] border border-slate-800 shadow-2xl backdrop-blur-md min-w-[280px] group-hover:border-indigo-500/30 transition-colors">
                                        <p className="text-slate-500 text-[10px] mb-2 uppercase tracking-[0.3em] font-black">Market Valuation</p>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-5xl font-black text-white">₹{preview.current_price?.toLocaleString("en-IN")}</span>
                                            <span className={`text-sm font-bold ${preview.discount_level > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                                {preview.discount_level > 0 ? "▲" : "▼"} {Math.abs(preview.discount_level)?.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[450px] w-full relative z-10">
                                    {preview.history?.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={preview.history}>
                                                <defs>
                                                    <linearGradient id="colorCloseFull" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="date" hide />
                                                <YAxis domain={['auto', 'auto']} hide />
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                    cursor={{ stroke: '#818cf8', strokeDasharray: '6 6', strokeWidth: 1.5 }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="close"
                                                    stroke="#818cf8"
                                                    strokeWidth={6}
                                                    fill="url(#colorCloseFull)"
                                                    animationDuration={2000}
                                                    animationEasing="ease-out"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-600 bg-slate-950/40 rounded-[2.5rem] border-2 border-slate-800 border-dashed italic uppercase tracking-[0.2em] font-black">Historical Data Sync in Progress...</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 🧩 Semantic Asset Clustering */}
                    <div className="mt-8 mb-12">
                        <StockClusteringModule
                            portfolioId={activePortfolio}
                            refreshTrigger={stocks.length}
                        />
                    </div>

                    {/* 📦 Stock Holdings (Grouped by Sector) */}
                    <div className="mt-8">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                            <span>💼</span> Your Holdings
                        </h3>
                        <p className="text-slate-400 mb-6 text-sm">Expand individual holdings to see detailed metrics and actions.</p>

                        {groupedStocks.sortedSectors.length > 0 ? (
                            <div className="space-y-10">
                                {groupedStocks.sortedSectors.map((sector) => (
                                    <div key={sector}>
                                        <h4 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            {sector}
                                            <span className="text-sm font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full ml-2">
                                                {groupedStocks.groups[sector].length}
                                            </span>
                                        </h4>
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
                                            {groupedStocks.groups[sector].map((stock, index) => (
                                                <StockCard
                                                    key={stock.id}
                                                    stock={stock}
                                                    index={index}
                                                    isExpanded={expandedCardId === stock.id}
                                                    onToggle={() => toggleExpand(stock.id, stock.symbol)}
                                                    onRemoveStock={handleRemoveRequest}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-8 text-center text-slate-500">
                                No holdings found.
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* CONFIRMATION MODAL */}
            <AnimatePresence>
                {stockToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0b1220] border border-slate-700/50 rounded-2xl p-6 max-w-sm w-full shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
                        >
                            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mb-4 text-xl border border-rose-500/30">
                                🗑️
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Remove Stock</h3>
                            <p className="text-slate-400 mb-6 text-sm">
                                Are you sure you want to remove <span className="text-white font-bold">{stockToDelete.symbol}</span> from this portfolio? This action will permanently sever the link.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setStockToDelete(null)}
                                    className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors font-medium border border-transparent hover:border-slate-700/50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold transition-all shadow-[0_4px_14px_rgba(225,29,72,0.4)]"
                                >
                                    Delete Stock
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl border shadow-2xl z-50 font-medium flex items-center gap-3 backdrop-blur-md ${toastMessage.includes("Failed") ? "bg-rose-950/80 border-rose-500/50 text-rose-300" : "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                            }`}
                    >
                        {toastMessage.includes("Failed") ? (
                            <span className="text-xl">❌</span>
                        ) : (
                            <span className="text-xl">✅</span>
                        )}
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
