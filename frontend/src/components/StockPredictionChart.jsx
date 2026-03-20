import { useState, useEffect, useMemo, useRef } from "react";
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Area } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import ModelBacktestingTable from "./ModelBacktestingTable";

const MODEL_OPTIONS = {
    "Regression": ["Linear Regression", "Ridge Regression", "Lasso Regression", "Elastic Net Regression"],
    "Time Series": ["ARIMA", "SARIMA", "Prophet", "Exponential Smoothing"],
    "Deep Learning": ["RNN (Recurrent Neural Network)", "LSTM", "GRU", "CNN Time Series Model"],
    "Hybrid": ["Hybrid ARIMA + LSTM", "Hybrid Regression + RNN"]
};

// Custom Dropdown Component for that premium Bloomberg/TradingView feel
const GlassDropdown = ({ label, value, options, onChange, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between min-w-[180px] bg-slate-900/60 backdrop-blur-md border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/80 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.05)] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] ${isOpen ? 'ring-2 ring-indigo-500/50' : ''}`}
            >
                <div className="flex items-center gap-2 truncate">
                    <span className="text-indigo-400">{icon}</span>
                    <span className="truncate max-w-[130px]">{value || label}</span>
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-50 mt-2 w-full min-w-[220px] bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl py-2 overflow-hidden"
                    >
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => { onChange(option); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-indigo-500/20 hover:text-indigo-300 ${value === option ? 'bg-indigo-500/10 text-indigo-400 font-semibold border-l-2 border-indigo-500' : 'text-slate-300'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default function StockPredictionChart({ symbol, allStocks = [], onSymbolChange }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [horizon, setHorizon] = useState("7"); // days

    // New Model Selection State
    const [modelCategory, setModelCategory] = useState("Deep Learning");
    const [modelName, setModelName] = useState("LSTM");

    // Get unique stocks for the dropdown selector
    const uniqueStocks = useMemo(() => {
        const unique = [];
        const seen = new Set();
        allStocks.forEach(s => {
            const sym = s.stock?.symbol || s.symbol;
            if (!sym) return;

            if (!seen.has(sym)) {
                seen.add(sym);
                unique.push({
                    name: s.stock?.name || s.name || sym,
                    symbol: sym.replace(".NS", ""),
                    rawSymbol: sym
                });
            }
        });
        return unique;
    }, [allStocks]);

    const currentStock = uniqueStocks.find(s => s.symbol === symbol) || { name: symbol, symbol: symbol };

    // When category changes, reset the sub-model automatically to the first option
    useEffect(() => {
        const defaultModel = MODEL_OPTIONS[modelCategory][0];
        if (!MODEL_OPTIONS[modelCategory].includes(modelName)) {
            setModelName(defaultModel);
        }
    }, [modelCategory]);

    const fetchPrediction = () => {
        if (!symbol) return;
        setLoading(true);
        setError(null);

        // Map UI category to API expected param
        const categoryMap = {
            "Regression": "regression",
            "Time Series": "time_series",
            "Deep Learning": "deep_learning",
            "Hybrid": "hybrid"
        };
        const apiModelType = categoryMap[modelCategory] || "regression";

        API.get(`stock-prediction/?ticker=${symbol}&forecast_days=${horizon}&model_type=${apiModelType}&model_name=${encodeURIComponent(modelName)}`)
            .then(res => {
                const historyData = res.data.history.map(d => ({
                    date: d.date,
                    historical: d.price,
                    predicted: null
                }));
                const predictionsData = res.data.predictions.map(d => ({
                    date: d.date,
                    historical: null,
                    predicted: d.price,
                    // Area chart bounds
                    confidenceBounds: [d.lower_bound, d.upper_bound],
                    lower_bound: d.lower_bound,
                    upper_bound: d.upper_bound
                }));

                // Connect the lines seamlessly by anchoring the predicted line to the final historical node 
                if (historyData.length > 0 && predictionsData.length > 0) {
                    const lastIndex = historyData.length - 1;
                    historyData[lastIndex].predicted = historyData[lastIndex].historical;
                    historyData[lastIndex].confidenceBounds = [historyData[lastIndex].historical, historyData[lastIndex].historical];
                    historyData[lastIndex].lower_bound = historyData[lastIndex].historical;
                    historyData[lastIndex].upper_bound = historyData[lastIndex].historical;
                }

                const combined = [...historyData, ...predictionsData];
                setData(combined);
                setLoading(false);
            })
            .catch(err => {
                console.error("Prediction Error:", err);
                setError(err.message || "Could not load advanced prediction data");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPrediction();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol, horizon, modelCategory, modelName]);

    // Custom Tooltip for detailed analytical view
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dateStr = new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return (
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-4 rounded-xl shadow-2xl shadow-indigo-500/10 min-w-[200px]">
                    <p className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider border-b border-slate-800 pb-2">{dateStr}</p>

                    {payload.map((entry, index) => {
                        // Skip the tuple array (confidence bounds) from standard rendering to avoid weird outputs
                        if (entry.dataKey === "confidenceBounds") return null;

                        return (
                            <div key={`item-${index}`} className="flex justify-between items-center my-1.5">
                                <span className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                    {entry.name}
                                </span>
                                <span className="font-mono font-bold text-white tracking-tight">
                                    ₹{Number(entry.value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        );
                    })}

                    {/* Render Confidence Interval if it exists for this point */}
                    {payload[0] && payload[0].payload && payload[0].payload.lower_bound != null && (
                        <div className="mt-3 pt-2 border-t border-slate-800">
                            <p className="text-[10px] text-slate-500 mb-1">95% CONFIDENCE INTERVAL</p>
                            <div className="flex justify-between text-xs font-mono text-indigo-400/70">
                                <span>₹{Number(payload[0].payload.lower_bound).toLocaleString("en-IN", { maximumFractionDigits: 1 })}</span>
                                <span>-</span>
                                <span>₹{Number(payload[0].payload.upper_bound).toLocaleString("en-IN", { maximumFractionDigits: 1 })}</span>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    if (allStocks && allStocks.length === 0) {
        return (
            <div className="bg-slate-950/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-2xl flex items-center justify-center min-h-[550px]">
                <div className="text-center p-8 max-w-md">
                    <div className="w-20 h-20 bg-slate-900/80 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-xl shadow-slate-900">
                        <span className="text-4xl">📉</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">No Stocks Found</h3>
                    <p className="text-slate-400 font-medium">No stocks available in portfolio. Please add a stock to run the AI forecast.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-950/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-2xl relative overflow-visible flex flex-col min-h-[550px]">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8 relative z-20">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg 
                        shadow-[0_0_15px_rgba(99,102,241,0.2)]">📈</span>
                        AI Trend Forecast {currentStock.name && `for ${currentStock.name}`}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 font-medium">
                        Advanced algorithmic projections {" "}
                        <span className="text-indigo-400 font-semibold">{currentStock.symbol && `(${currentStock.symbol})`}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-slate-900/40 p-2 border border-slate-800/80 rounded-2xl shadow-inner">
                    {/* Level 0: Stock Selector */}
                    <GlassDropdown
                        label="Select Stock"
                        value={`${currentStock.name || currentStock.symbol} (${currentStock.symbol})`}
                        options={uniqueStocks.map(s => `${s.name} (${s.rawSymbol})`)}
                        onChange={(selectedString) => {
                            // Extract rawSymbol from the formatted string e.g. "Reliance (RELIANCE.NS)"
                            const match = selectedString.match(/\(([^)]+)\)$/);
                            if (match && match[1] && onSymbolChange) {
                                onSymbolChange(match[1]);
                            }
                        }}
                        icon="🏦"
                    />

                    <div className="h-4 w-px bg-slate-700 mx-1 hidden lg:block"></div>

                    {/* Level 1: Category */}
                    <GlassDropdown
                        label="Category"
                        value={modelCategory}
                        options={Object.keys(MODEL_OPTIONS)}
                        onChange={setModelCategory}
                        icon="🗂️"
                    />

                    {/* Level 2: Specific Model */}
                    <GlassDropdown
                        label="Model"
                        value={modelName}
                        options={MODEL_OPTIONS[modelCategory]}
                        onChange={setModelName}
                        icon="🤖"
                    />

                    {/* Horizon Selector */}
                    <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block"></div>
                    <select
                        value={horizon}
                        onChange={(e) => setHorizon(e.target.value)}
                        className="bg-transparent text-indigo-300 text-sm font-bold px-3 py-2 cursor-pointer focus:outline-none appearance-none"
                    >
                        <option value="7">7 Days</option>
                        <option value="15">15 Days</option>
                        <option value="30">30 Days</option>
                    </select>

                </div>
            </div>

            {/* Chart Legend */}
            <div className="flex gap-6 text-xs items-center mb-4 ml-2">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <span className="w-3 h-3 rounded-full bg-slate-500"></span>
                    Historical Price
                </div>
                <div className="flex items-center gap-2 text-indigo-300 font-medium">
                    <span className="w-3 h-1 bg-indigo-500 border-t-2 border-dashed"></span>
                    {modelName} Forecast
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                    <span className="w-3 h-3 bg-indigo-500/20 rounded-sm border border-indigo-500/40"></span>
                    95% Confidence Interval
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-grow w-full relative min-h-[350px]">
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-xl border border-indigo-500/20"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 uppercase tracking-[0.2em]">Executing Model...</span>
                        </div>
                    </motion.div>
                )}

                {error && !loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-xl border border-rose-500/20">
                        <div className="text-center p-6 text-rose-400 font-medium flex flex-col text-sm items-center gap-2">
                            <span className="text-2xl">⚠️</span>
                            {error}
                        </div>
                    </div>
                )}

                {data && !error && (
                    <ResponsiveContainer width="100%" height={420}>
                        <ComposedChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#475569" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                                {/* Pattern for confidence bounds to make it look technical */}
                                <pattern id="stripePattern" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                                    <line x1="0" y="0" x2="0" y2="6" stroke="#4f46e5" strokeWidth="1" strokeOpacity="0.15" />
                                </pattern>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={40}
                                padding={{ left: 10, right: 10 }}
                                tickFormatter={(tick) => {
                                    const d = new Date(tick);
                                    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                                }}
                            />
                            <YAxis
                                domain={['dataMin - (dataMin * 0.05)', 'dataMax + (dataMax * 0.05)']}
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                                orientation="right"
                                tickFormatter={(val) => `₹${val.toLocaleString()}`}
                                width={80}
                            />

                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '5 5' }} />

                            {/* Confidence Interval shaded region */}
                            <Area
                                type="monotone"
                                dataKey="confidenceBounds"
                                stroke="none"
                                fill="url(#stripePattern)"
                                animationDuration={1000}
                                connectNulls
                            />

                            <Area
                                type="monotone"
                                dataKey="historical"
                                stroke="none"
                                fill="url(#colorHistorical)"
                                connectNulls
                            />

                            <Line
                                name="Historical"
                                type="monotone"
                                dataKey="historical"
                                stroke="#94a3b8"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: "#94a3b8", stroke: "#0f172a", strokeWidth: 3 }}
                                animationDuration={1500}
                                connectNulls
                            />

                            <Line
                                name="Predicted"
                                type="monotone"
                                dataKey="predicted"
                                stroke="#6366f1"
                                strokeWidth={3}
                                strokeDasharray="6 6"
                                dot={false}
                                activeDot={{ r: 8, fill: "#6366f1", stroke: "#0f172a", strokeWidth: 3 }}
                                animationDuration={2500}
                                animationEasing="ease-in-out"
                                connectNulls
                            />

                            {/* Vertical cutoff line separating history and future */}
                            <ReferenceLine
                                x={data.filter(d => d.historical).slice(-1)[0]?.date}
                                stroke="#64748b"
                                strokeDasharray="3 3"
                                label={{ position: 'insideTopLeft', value: 'TODAY', fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Universal Model Backtesting Execution Injection */}
            {symbol && (
                <ModelBacktestingTable symbol={currentStock.rawSymbol || symbol} selectedAlgorithm={modelName} />
            )}

        </div>
    );
}
