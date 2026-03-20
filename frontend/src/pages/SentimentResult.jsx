import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function SentimentResult() {
    const { portfolioId, stockSymbol } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // AI Review State
    const [aiResult, setAiResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        API.post("sentiment/", { symbol: stockSymbol })
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Sentiment analysis failed:", err);
                setError(err.response?.data?.error || "Analysis failed. Please try again.");
                setLoading(false);
            });
    }, [stockSymbol]);

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case "Positive": return "from-emerald-500 to-teal-400 text-emerald-400";
            case "Negative": return "from-rose-500 to-red-400 text-rose-400";
            default: return "from-blue-500 to-indigo-400 text-blue-400";
        }
    };

    const getSentimentIcon = (sentiment) => {
        switch (sentiment) {
            case "Positive": return "🚀";
            case "Negative": return "⚠️";
            default: return "⚖️";
        }
    };

    const generateAIReview = () => {
        setAiLoading(true);
        setAiError(null);
        API.post("ai-review/", {
            stock: stockSymbol,
            sentiment: data?.sentiment,
            confidence: data?.confidence_score,
            headlines: data?.headlines,
            score: data?.score
        })
            .then((res) => {
                setAiResult(res.data);
                setAiLoading(false);
            })
            .catch((err) => {
                console.error("AI Review failed:", err);
                setAiError(err.response?.data?.error || "AI Review failed. Please check your API key.");
                setAiLoading(false);
            });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">
                        🧠
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 italic">Analyzing Market Sentiment...</h2>
                <p className="text-slate-400 animate-pulse">Scanning news headlines and social trends for {stockSymbol}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-rose-500/10 p-6 rounded-3xl border border-rose-500/20 max-w-md">
                    <span className="text-4xl mb-4 block">❌</span>
                    <h2 className="text-xl font-bold text-white mb-2">Analysis Failed</h2>
                    <p className="text-rose-400/80 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(`/sentiment/${portfolioId}`)}
                        className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors"
                    >
                        Try Another Stock
                    </button>
                </div>
            </div>
        );
    }

    const colorClasses = getSentimentColor(data.sentiment);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header section remains similar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                        {getSentimentIcon(data.sentiment)}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            {stockSymbol} <span className="text-slate-500 font-medium ml-2">Market Intelligence</span>
                        </h2>
                        <p className="text-slate-400 mt-1">Real-time sentiment and news-driven insights</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/sentiment/${portfolioId}`)}
                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    ← Change Stock
                </button>
            </div>

            {/* Step 1-3: Sentiment Results Displayed Immediately */}
            {data.sentiment === "No Data" ? (
                <div className="bg-rose-500/5 border border-rose-500/20 p-12 rounded-[38px] text-center space-y-4">
                    <div className="text-5xl mb-4">📭</div>
                    <h2 className="text-2xl font-bold text-rose-400">Insufficient News Data</h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                        We couldn't find enough recent news for <strong>{stockSymbol}</strong> to perform a reliable sentiment analysis.
                    </p>
                    <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all">Try Refreshing</button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Main Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 p-10 rounded-[48px] shadow-2xl relative overflow-hidden`}
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className={`w-32 h-32 md:w-40 md:h-40 ${colorClasses.split(' ').slice(0, 2).join(' ')} rounded-[40px] flex items-center justify-center text-6xl shadow-2xl`}>
                                {getSentimentIcon(data.sentiment)}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{data.sentiment}</h2>
                                    <span className="bg-white/5 px-4 py-1 rounded-full text-[10px] font-black uppercase text-slate-400 border border-white/10">SENTIMENT</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Confidence Score</p>
                                        <p className={`text-2xl font-black ${colorClasses.split(' ')[2]}`}>{data.confidence}%</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Polarity Score</p>
                                        <p className={`text-2xl font-black ${data.score >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {data.score > 0 ? '+' : ''}{data.score.toFixed(3)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Step 3.5: Headlines Used */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#0f172a] border border-white/5 p-8 rounded-[38px] shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <span className="text-blue-400">🗞️</span> Recent News Headlines Analyzed
                            </h3>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{data.headlines?.length || 0} Sources</span>
                        </div>
                        <div className="space-y-3">
                            {data.headlines?.map((h, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                    <span className="text-slate-600 font-bold text-sm mt-1">{i + 1}.</span>
                                    <p className="text-slate-300 text-sm group-hover:text-white transition-colors">{h}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Step 4: AI Review Button (Delayed Action) */}
                    <div className="pt-8 border-t border-white/5">
                        {!aiResult && !aiLoading && (
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-slate-400 text-sm italic">Want a deeper analysis? Generate an AI Review powered by the headlines above.</p>
                                <button
                                    onClick={generateAIReview}
                                    className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-3xl transition-all shadow-2xl shadow-blue-500/40 flex items-center gap-4 overflow-hidden"
                                >
                                    <span className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 -translate-x-full" />
                                    <span className="text-2xl">✨</span>
                                    GENERATE AI INVESTMENT REVIEW
                                </button>
                            </div>
                        )}

                        {aiLoading && (
                            <div className="bg-[#0f172a] border border-blue-500/20 p-12 rounded-[48px] flex flex-col items-center text-center space-y-6">
                                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <div className="space-y-2">
                                    <h4 className="text-white font-bold text-xl uppercase tracking-tighter">Analyzing Market Trends</h4>
                                    <p className="text-blue-400/60 font-medium italic">Gemini is processing {data.headlines?.length} headlines for {stockSymbol}...</p>
                                </div>
                            </div>
                        )}

                        {aiResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 p-10 rounded-[48px] shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl">🤖</div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white tracking-tight">AI Investment Insight</h3>
                                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Ground by real news data</p>
                                            </div>
                                        </div>
                                        <button onClick={generateAIReview} className="p-3 text-slate-500 hover:text-white bg-white/5 rounded-xl transition-all" title="Regenerate">
                                            <span className="text-xl">🔄</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                        <div className="md:col-span-2 space-y-8">
                                            <div>
                                                <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-3">Market Context</h4>
                                                <p className="text-slate-200 leading-relaxed text-xl font-medium italic">"{aiResult.analysis}"</p>
                                            </div>
                                            <div className="bg-white/5 p-8 rounded-[32px] border border-white/5">
                                                <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">Evidence-Based Reasoning</h4>
                                                <p className="text-slate-300 text-base whitespace-pre-line leading-relaxed">{aiResult.reasoning}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                                <p className="text-slate-500 font-black uppercase text-[10px] mb-3">Risk Assessment</p>
                                                <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-tighter shadow-lg inline-block ${aiResult.risk === 'Low' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                                        aiResult.risk === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    }`}>{aiResult.risk || 'Medium'} Risk</span>
                                            </div>
                                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                                <p className="text-slate-500 font-black uppercase text-[10px] mb-3">Recommendation</p>
                                                <p className={`text-4xl font-black italic tracking-tighter ${aiResult.recommendation === 'Buy' ? 'text-emerald-400' :
                                                        aiResult.recommendation === 'Avoid' ? 'text-rose-400' : 'text-blue-400'
                                                    }`}>{aiResult.recommendation}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                            Data Verfied • {stockSymbol}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
