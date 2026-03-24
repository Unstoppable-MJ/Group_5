import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import AddStockModal from "./AddStockModal";
import AddPortfolioModal from "./AddPortfolioModal";
import { motion, AnimatePresence } from "framer-motion";

const PortfolioDropdown = ({ portfolios, activePortfolio, setActivePortfolio, navigate, location }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentValue = location.pathname === '/nifty50-pca' ? 'nifty50-ai' : location.pathname === '/precious-metals' ? 'precious-metals-ai' : location.pathname === '/crypto-ai' ? 'crypto-ai' : (activePortfolio || "");

  const handleSelect = (val) => {
    setIsOpen(false);

    // Check if the selected val is actually a string route directly
    if (val === 'nifty50-ai') {
      navigate('/nifty50-pca');
      return;
    } else if (val === 'precious-metals-ai') {
      navigate('/precious-metals');
      return;
    } else if (val === 'crypto-ai') {
      navigate('/crypto-ai');
      return;
    }

    // Otherwise, check if it's an AI Built-in portfolio coming from DB
    const selectedPortfolio = portfolios.find(p => p.id === val || p.id === parseInt(val));
    if (selectedPortfolio && selectedPortfolio.type === 'ai_builtin') {
      const name = selectedPortfolio.name.toUpperCase();
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

    // Standard fallback for regular user folders
    setActivePortfolio(val);
    if (['/nifty50-pca', '/precious-metals', '/crypto-ai'].includes(location.pathname)) {
      navigate('/dashboard');
    }
  };

  const standardPortfolios = portfolios.filter(p => p.type === 'standard');
  const aiPortfolios = portfolios.filter(p => p.type === 'ai_builtin' || p.type === 'ai_custom');

  let currentLabel = "Select Portfolio";
  let currentIcon = "📁";
  if (currentValue === 'nifty50-ai') { currentLabel = "NIFTY 50 AI Portfolio"; currentIcon = "⚡"; }
  else if (currentValue === 'precious-metals-ai') { currentLabel = "Precious Metals AI"; currentIcon = "🥇"; }
  else if (currentValue === 'crypto-ai') { currentLabel = "Crypto AI Portfolio"; currentIcon = "🪙"; }
  else if (currentValue) {
    const found = portfolios.find(p => p.id === currentValue || p.id === parseInt(currentValue));
    if (found) currentLabel = found.name;
  }

  return (
    <div className="relative z-[1000]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between min-w-[220px] max-w-[280px] h-10 px-4 bg-[#0b1220] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-xl text-sm transition-all duration-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[#e2e8f0]"
        title={currentLabel}
      >
        <div className="flex items-center truncate font-medium w-full">
          <span className="mr-2 shrink-0 inline-flex items-center justify-center">{currentIcon}</span>
          <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap">Portfolio: {currentLabel}</span>
        </div>
        <svg className={`shrink-0 ml-3 w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-full min-w-[240px] rounded-[12px] overflow-hidden bg-[#0b1220] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="py-2">
              <div className="px-4 py-1.5 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Standard Portfolios</div>
              {standardPortfolios.map(p => {
                const isSelected = currentValue === p.id || currentValue === String(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    className={`w-[calc(100%-16px)] mx-2 flex items-center text-left px-3 py-2 text-sm font-medium transition duration-200 group ${isSelected ? 'bg-[#2563eb] text-[#ffffff] rounded-lg' : 'text-[#e2e8f0] hover:bg-[#1e293b] hover:text-[#ffffff] rounded-lg'}`}
                  >
                    <span className="mr-2 inline-flex items-center justify-center">📁</span>
                    <span className="truncate">{p.name}</span>
                  </button>
                );
              })}
              {standardPortfolios.length === 0 && <div className="px-4 py-2 text-sm text-slate-500 italic">No Portfolios</div>}

              <div className="h-px w-full my-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}></div>

              <div className="px-4 py-1.5 text-[10px] font-bold tracking-widest text-slate-500 uppercase mt-1">AI Portfolios</div>
              {aiPortfolios.map(ai => {
                const isSelected = currentValue === ai.id || currentValue === String(ai.id);
                // Assign a dynamic icon based on builtin names or default to ✨ for custom AI portfolios.
                let displayIcon = "✨";
                if (ai.name.includes("NIFTY 50")) displayIcon = "⚡";
                else if (ai.name.includes("Precious Metals")) displayIcon = "🥇";
                else if (ai.name.includes("Crypto")) displayIcon = "🪙";

                return (
                  <button
                    key={ai.id}
                    onClick={() => handleSelect(ai.id)}
                    className={`w-[calc(100%-16px)] mx-2 flex items-center text-left px-3 py-2 text-sm font-medium transition duration-200 group ${isSelected ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 rounded-lg font-bold shadow-md' : 'text-[#e2e8f0] hover:bg-[#1e293b] hover:text-[#ffffff] rounded-lg'}`}
                  >
                    <span className="mr-2 inline-flex items-center justify-center">{displayIcon}</span>
                    <span className="truncate">{ai.name}</span>
                  </button>
                );
              })}
              {aiPortfolios.length === 0 && <div className="px-4 py-2 text-sm text-slate-500 italic">No AI Portfolios</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Navbar({ refreshData, portfolios, activePortfolio, setActivePortfolio, fetchPortfolios }) {
  const [showAddStock, setShowAddStock] = useState(false);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userName = localStorage.getItem("username") || "User";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ background: "#0b1220", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        className="sticky top-0 z-40 w-full px-6 py-4 flex justify-between items-center"
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-inner">
            <span className="text-xl">📊</span>
          </div>
          <div className="hidden sm:flex flex-col justify-center">
            <h1 className="text-xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              ChatSense
            </h1>
            {/* <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              whileHover={{ opacity: 0.85 }}
              transition={{ duration: 0.4 }}
              className="text-[11px] italic font-medium tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 cursor-default"
            >
              Powered by @Unstoppable-Mukteshwar
            </motion.span> */}
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/portfolios')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-all shadow-sm ${location.pathname === '/portfolios'
                ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/20'
                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <span className="text-base">💼</span>
            <span className="hidden lg:inline">Portfolios</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/sentiment')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-all shadow-sm ${location.pathname.startsWith('/sentiment')
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/20'
                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <span className="text-base">🎭</span>
            <span className="hidden lg:inline">Sentiment</span>
          </motion.button>
        </div>

        {/* Right: Actions and User Menu */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mobile Navigation Icons */}
          <div className="flex md:hidden items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/portfolios')}
              className="w-10 h-10 flex items-center justify-center bg-slate-800/50 border border-slate-700 rounded-xl text-lg"
              title="Portfolios"
            >
              💼
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/sentiment')}
              className="w-10 h-10 flex items-center justify-center bg-slate-800/50 border border-slate-700 rounded-xl text-lg"
              title="Sentiment Analysis"
            >
              🎭
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowAddPortfolio(true)}
            className="text-slate-300 border border-slate-700 hover:bg-slate-800 font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors"
          >
            <span>+</span> <span className="hidden sm:inline">Portfolio</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowAddStock(true)}
            disabled={!activePortfolio && !location.pathname.includes('/dashboard/')}
            className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-semibold px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span>+</span> <span className="hidden sm:inline">Asset</span>
          </motion.button>

          <div className="relative ml-2 pl-4 border-l border-white/10 flex items-center gap-4">
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1.5 rounded-lg transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userName}&backgroundColor=transparent`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-medium text-slate-200 hidden lg:block">User: <span className="text-emerald-400">{userName}</span></span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-full mt-3 w-48 bg-[#0b1220] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                >
                  <button onClick={() => { setShowUserMenu(false); navigate('/profile'); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2">
                    <span className="text-slate-400">👤</span> Profile
                  </button>
                  <button onClick={() => { setShowUserMenu(false); navigate('/settings'); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2">
                    <span className="text-slate-400">⚙️</span> Settings
                  </button>
                  <div className="h-px bg-white/10 my-1"></div>
                  <button
                    onClick={() => { setShowUserMenu(false); handleLogout(); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors flex items-center gap-2 font-medium"
                  >
                    <span>🚪</span> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {showAddStock && createPortal(
        <AddStockModal
          onClose={() => setShowAddStock(false)}
          onSuccess={refreshData}
          activePortfolio={activePortfolio}
        />,
        document.body
      )
      }

      {
        showAddPortfolio && createPortal(
          <AddPortfolioModal
            isOpen={showAddPortfolio}
            onClose={() => setShowAddPortfolio(false)}
            onPortfolioAdded={(newPortfolio) => {
              fetchPortfolios();
              setActivePortfolio(newPortfolio.id);
              // Open Add Asset immediately after creating portfolio
              setTimeout(() => setShowAddStock(true), 300);
            }}
          />,
          document.body
        )
      }
    </>
  );
}