import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import KPISection from "../components/KPISection";
import AdvancedChart from "../components/AdvancedChart";
import PEAnalysisChart from "../components/PEAnalysisChart";
import StockDetailPanel from "../components/StockDetailPanel";
import StockPredictionChart from "../components/StockPredictionChart";
import EditPortfolioModal from "../components/EditPortfolioModal";
import { motion } from "framer-motion";

export default function Dashboard({ activePortfolio: propPortfolio, portfolios }) {
  const { portfolioId } = useParams();
  const activePortfolio = portfolioId || propPortfolio;
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!activePortfolio) return;

    API.get(`portfolio-stocks/?portfolio_id=${activePortfolio}`)
      .then((res) => {
        setStocks(res.data);
        if (res.data.length > 0) {
          const pureSymbol = res.data[0].symbol.replace(".NS", "");
          setSelectedSymbol(pureSymbol);
        } else {
          setSelectedSymbol(null);
        }
      })
      .catch((err) => console.log(err));
  }, [activePortfolio]);

  const handleDeletePortfolio = () => {
    if (!activePortfolio) return;
    if (window.confirm("Are you sure you want to delete this Entire Portfolio? All assets within it will be removed.")) {
      API.delete(`portfolios/?id=${activePortfolio}`)
        .then(() => {
          window.location.reload();
        })
        .catch(err => console.error(err));
    }
  };

  const handlePortfolioUpdated = (updatedPortfolio) => {
    window.location.reload();
  };

  const totalInvestment = stocks.reduce(
    (acc, s) => acc + (s.investment_value || 0),
    0
  );

  const totalCurrent = stocks.reduce(
    (acc, s) => acc + (s.current_value || 0),
    0
  );

  const totalProfit = totalCurrent - totalInvestment;

  return (
    <div className="space-y-8 pb-12">

      {/* 🔵 Hero Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 p-8 md:p-10 rounded-[2rem] border border-slate-800 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-slate-400 font-medium tracking-wide uppercase text-sm">
                Portfolio Performance
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700/50"
                  title="Edit Portfolio"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDeletePortfolio}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400/80 hover:text-rose-400 transition-all border border-rose-500/20"
                  title="Delete Portfolio"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              ₹{totalCurrent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex gap-8 text-right bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
            <div>
              <p className="text-slate-500 text-sm mb-1">Invested</p>
              <p className="font-semibold text-lg text-slate-300">₹{totalInvestment.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm mb-1">Total Returns</p>
              <p className={`font-bold text-lg flex items-center gap-1 ${totalProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {totalProfit >= 0 ? "▲" : "▼"}
                ₹{Math.abs(totalProfit).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🟢 KPI Cards */}
      <KPISection stocks={stocks} />

      {/* 📈 Charts Section */}
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <AdvancedChart
            portfolioId={activePortfolio}
            refreshTrigger={stocks.length}
          />
        </div>
        <div className="lg:col-span-2">
          <PEAnalysisChart stocks={stocks} />
        </div>
      </div>

      {/* 🔍 Individual Stock Analytics & 🔮 Prediction */}
      <div className="flex flex-col gap-6 mt-8 mb-4">
        <StockDetailPanel
          symbol={selectedSymbol}
          allStocks={stocks}
          portfolioId={activePortfolio}
          onSymbolChange={setSelectedSymbol}
        />

        <div className="flex justify-center mt-2 pb-6">
          <button
            onClick={() => navigate(`/portfolio/${activePortfolio}`)}
            className="bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold py-4 px-12 rounded-2xl shadow-[0_10px_20px_rgba(99,102,241,0.2)] hover:shadow-[0_15px_30px_rgba(99,102,241,0.4)] transition-all flex items-center gap-3 w-full justify-center group"
          >
            View Portfolio Details
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      <EditPortfolioModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onPortfolioUpdated={handlePortfolioUpdated}
        portfolio={activePortfolio ? { id: activePortfolio, name: "", description: "" } : null}
      />
    </div>
  );
}