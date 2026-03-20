import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function SentimentStockSelect() {
    const { portfolioId } = useParams();
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        API.get(`portfolio/${portfolioId}/stocks/`)
            .then((res) => {
                setStocks(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch stocks:", err);
                setLoading(false);
            });
    }, [portfolioId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Sentiment Analysis</h2>
                    <p className="text-slate-400 mt-1">Step 2: Select a stock to analyze</p>
                </div>
                <button
                    onClick={() => navigate("/sentiment")}
                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    ← Back to Portfolios
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stocks.map((stock, index) => (
                    <motion.div
                        key={stock.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => navigate(`/sentiment/${portfolioId}/${stock.symbol.split('.')[0]}`)}
                        className="group cursor-pointer bg-[#0f172a] border border-white/5 hover:border-emerald-500/50 p-5 rounded-2xl shadow-lg transition-all"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                {stock.symbol.split('.')[0]}
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                📈
                            </div>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-white font-bold group-hover:text-emerald-400 transition-colors truncate">
                                {stock.name}
                            </h3>
                            <p className="text-slate-400 text-xs mt-1">{stock.sector}</p>
                        </div>

                        <div className="mt-6 flex items-end justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Current Price</p>
                                <p className="text-xl font-bold text-white">₹{stock.current_price}</p>
                            </div>
                            <div className="h-8 w-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                                →
                            </div>
                        </div>
                    </motion.div>
                ))}

                {stocks.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-[#0f172a] rounded-3xl border border-dashed border-white/10">
                        <p className="text-slate-500">No stocks found in this portfolio.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
