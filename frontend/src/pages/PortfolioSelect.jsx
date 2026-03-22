import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function PortfolioSelect({ portfolios }) {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const standardPortfolios = portfolios.filter(p => p.type === 'standard');
    const aiPortfolios = portfolios.filter(p => p.type === 'ai_builtin' || p.type === 'ai_custom');

    const PortfolioCard = ({ portfolio }) => {
        let displayIcon = "📁";
        let isAI = false;
        if (portfolio.type.includes("ai")) {
            isAI = true;
            if (portfolio.name.includes("NIFTY 50")) displayIcon = "⚡";
            else if (portfolio.name.includes("Precious Metals")) displayIcon = "🥇";
            else if (portfolio.name.includes("Crypto")) displayIcon = "🪙";
            else displayIcon = "✨";
        }

        const handlePortfolioClick = () => {
            if (portfolio.type === 'ai_builtin') {
                const name = portfolio.name.toUpperCase();
                if (name.includes('NIFTY 50')) {
                    navigate('/nifty50-pca');
                    return;
                } else if (name.includes('PRECIOUS METAL')) {
                    navigate('/precious-metals');
                    return;
                } else if (name.includes('CRYPTO')) {
                    navigate('/crypto-ai');
                    return;
                }
            }
            navigate(`/dashboard/${portfolio.id}`);
        };

        return (
            <motion.div
                variants={cardVariants}
                whileHover={{
                    scale: 1.02,
                    boxShadow: isAI
                        ? "0 0 30px rgba(16, 185, 129, 0.2)"
                        : "0 0 30px rgba(59, 130, 246, 0.2)"
                }}
                className={`relative group bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden ${isAI ? 'border-emerald-500/20 hover:border-emerald-500/50' : 'border-slate-800 hover:border-blue-500/50'
                    }`}
                onClick={handlePortfolioClick}
            >
                {/* Background Glow */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${isAI ? 'bg-emerald-500' : 'bg-blue-500'
                    }`} />

                <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${isAI
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-400 shadow-emerald-500/20'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20'
                        }`}>
                        <span className="text-2xl">{displayIcon}</span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                        {portfolio.name}
                    </h3>

                    <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-2 h-10">
                        {portfolio.description || (isAI ? "Advanced AI-powered financial forecasting and portfolio tracking." : "A personalized portfolio to track your assets and growth.")}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-800/50">
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${isAI ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {isAI ? 'AI Powered' : 'Standard'}
                            </span>
                            <span className="text-white font-semibold">
                                {portfolio.stock_count || 0} Stocks
                            </span>
                        </div>

                        <div className={`flex items-center gap-2 font-bold text-sm transition-all group-hover:gap-3 ${isAI ? 'text-emerald-400' : 'text-blue-400'}`}>
                            Select <span className="text-lg">→</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-[80vh] py-12 px-4 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    Select Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Portfolio</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Choose a workspace to dive into AI-driven analytics, live tracking, and smart financial insights.
                </p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {aiPortfolios.length > 0 && (
                    <>
                        {aiPortfolios.map(p => (
                            <PortfolioCard key={p.id} portfolio={p} />
                        ))}
                    </>
                )}

                {standardPortfolios.length > 0 && (
                    <>
                        {standardPortfolios.map(p => (
                            <PortfolioCard key={p.id} portfolio={p} />
                        ))}
                    </>
                )}

                {/* Create New Card */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.02 }}
                    className="relative group bg-slate-900/20 border-2 border-dashed border-slate-800 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center transition-all hover:bg-slate-900/40 hover:border-slate-700 cursor-pointer min-h-[320px]"
                >
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-slate-700 transition-colors">
                        <span className="text-3xl text-slate-500 group-hover:text-slate-300">+</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-300 mb-2">Create Portfolio</h3>
                    <p className="text-slate-500 text-sm">Add a new workspace to your wealth journey</p>
                </motion.div>
            </motion.div>

            {portfolios.length === 0 && (
                <div className="text-center py-20 bg-slate-900/20 rounded-[3rem] border border-slate-800 mt-8">
                    <p className="text-slate-500 italic">No portfolios found. Start by creating your first one!</p>
                </div>
            )}
        </div>
    );
}
