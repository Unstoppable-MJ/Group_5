import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function SentimentPortfolioSelect() {
    const [portfolios, setPortfolios] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        if (!userId) {
            navigate("/");
            return;
        }

        API.get(`portfolios/?user_id=${userId}`)
            .then((res) => {
                setPortfolios(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch portfolios:", err);
                setLoading(false);
            });
    }, [userId, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Sentiment Analysis</h2>
                    <p className="text-slate-400 mt-1">Step 1: Select a portfolio to analyze</p>
                </div>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    ← Back to Dashboard
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map((portfolio, index) => (
                    <motion.div
                        key={portfolio.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        onClick={() => navigate(`/sentiment/${portfolio.id}`)}
                        className="group cursor-pointer bg-[#0f172a] border border-white/5 hover:border-blue-500/50 p-6 rounded-2xl shadow-xl transition-all relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform">
                                {portfolio.type === "ai_builtin" || portfolio.type === "ai_custom" ? "✨" : "📁"}
                            </div>
                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                {portfolio.name}
                            </h3>
                            <p className="text-slate-400 text-sm mt-2 line-clamp-2 min-h-[40px]">
                                {portfolio.description || "No description available."}
                            </p>

                            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        {portfolio.type.replace("_", " ")}
                                    </span>
                                    <span className="text-sm font-bold text-white mt-1">
                                        {portfolio.stock_count} {portfolio.stock_count === 1 ? 'Stock' : 'Stocks'}
                                    </span>
                                </div>
                                <span className="text-blue-400 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Select →
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {portfolios.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-[#0f172a] rounded-3xl border border-dashed border-white/10">
                        <p className="text-slate-500">No portfolios found. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
