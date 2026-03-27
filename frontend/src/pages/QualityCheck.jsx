import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

const scoreColor = (score) => {
  if (score >= 75) return "text-emerald-400";
  if (score >= 60) return "text-amber-300";
  return "text-rose-400";
};

const sentimentColor = (label) => {
  if (label === "Positive") return "text-emerald-400";
  if (label === "Neutral") return "text-amber-300";
  if (label === "Negative") return "text-rose-400";
  return "text-slate-400";
};

export default function QualityCheck() {
  const { portfolioId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    API.get(`quality-check/?portfolio_id=${portfolioId}`)
      .then((res) => {
        if (!mounted) return;
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.response?.data?.error || "Failed to load quality analysis.");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [portfolioId]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(`/portfolio/${portfolioId}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Portfolio
          </button>
          <h1 className="text-4xl font-black tracking-tight text-white">Quality Analysis</h1>
          <p className="text-slate-400 mt-2 max-w-3xl">
            This page ranks your portfolio’s strongest 3 stocks using a realistic composite of valuation
            quality, discount from highs, news sentiment, and cluster strength. The scoring workflow is
            orchestrated with LangGraph on the backend.
          </p>
        </div>
      </div>

      {loading && (
        <div className="grid gap-6 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-80 rounded-[2rem] border border-slate-800 bg-slate-900/40 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      {!loading && data && (
        <>
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3 rounded-[2rem] border border-slate-800 bg-slate-900/40 p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300 mb-3">Portfolio Focus</p>
              <h2 className="text-3xl font-black text-white">{data.portfolio_name}</h2>
              <p className="text-slate-400 mt-3">
                Evaluated {data.evaluated_count} stocks. Top 3 are selected by a weighted quality score using
                low-P/E preference, stronger discount setup, healthier sentiment, and better cluster fit.
              </p>
            </div>
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/40 p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-3">Method</p>
              <p className="text-2xl font-black text-white">{data.methodology?.engine || "LangGraph"}</p>
              <div className="mt-4 text-sm text-slate-400 space-y-2">
                <p>P/E: 35%</p>
                <p>Discount: 25%</p>
                <p>Sentiment: 25%</p>
                <p>Cluster: 15%</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {data.top_stocks?.map((stock, index) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-[2rem] border border-slate-800 bg-slate-900/40 p-6 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-2">
                      Rank #{index + 1}
                    </p>
                    <h3 className="text-2xl font-black text-white">{stock.symbol.replace(".NS", "")}</h3>
                    <p className="text-slate-400 mt-1">{stock.company_name}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mt-3">
                      {stock.sector}
                    </p>
                  </div>
                  <div className={`text-right ${scoreColor(stock.quality_score)}`}>
                    <p className="text-xs font-black uppercase tracking-[0.2em]">Quality</p>
                    <p className="text-3xl font-black">{stock.quality_score}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">P/E Ratio</p>
                    <p className="text-xl font-black text-white mt-2">
                      {stock.pe_ratio ? stock.pe_ratio.toFixed(2) : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Discount</p>
                    <p className="text-xl font-black text-emerald-400 mt-2">
                      {Number(stock.discount_level || 0).toFixed(2)}%
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Sentiment</p>
                    <p className={`text-xl font-black mt-2 ${sentimentColor(stock.sentiment_label)}`}>
                      {stock.sentiment_label}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cluster Fit</p>
                    <p className="text-xl font-black text-amber-300 mt-2">
                      {Math.round((stock.cluster_quality || 0) * 100)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                      <span>P/E Quality</span>
                      <span>{Math.round((stock.pe_quality || 0) * 100)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-400" style={{ width: `${Math.round((stock.pe_quality || 0) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                      <span>Discount Quality</span>
                      <span>{Math.round((stock.discount_quality || 0) * 100)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${Math.round((stock.discount_quality || 0) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                      <span>Sentiment Quality</span>
                      <span>{Math.round((stock.sentiment_quality || 0) * 100)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-300" style={{ width: `${Math.round((stock.sentiment_quality || 0) * 100)}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Why It Made Top 3</p>
                  <p className="text-sm leading-6 text-slate-300">{stock.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
