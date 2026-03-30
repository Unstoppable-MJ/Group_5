import { useState, useEffect } from "react";
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area } from "recharts";
import API from "../services/api";

export default function CryptoPortfolio() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [horizon, setHorizon] = useState(30);
    const [selectedAsset, setSelectedAsset] = useState("BTC-USD");
    const [selectedAlgorithm, setSelectedAlgorithm] = useState("RNN");
    const [predictionTable, setPredictionTable] = useState([]);
    const [backtestingResults, setBacktestingResults] = useState([]);
    const [loadingBacktest, setLoadingBacktest] = useState(true);

    const assetOptions = [
        { label: "BTC-USD (Bitcoin)", value: "BTC-USD" },
        { label: "ETH-USD (Ethereum)", value: "ETH-USD" },
        { label: "SOL-USD (Solana)", value: "SOL-USD" },
        { label: "BNB-USD (Binance)", value: "BNB-USD" },
    ];

    const algorithmOptions = [
        { label: "ARIMA (Time Series)", value: "ARIMA" },
        { label: "Linear Regression", value: "LINEAR" },
        { label: "RNN (Deep Learning)", value: "RNN" },
        { label: "CNN (Deep Learning)", value: "CNN" },
    ];

    const loadData = (selectedHorizon, asset, algorithm) => {
        setLoading(true);
        setPredictionTable([]);

        API.get(`crypto-ai/?horizon=${selectedHorizon}&symbol=${asset}&algorithm=${algorithm}`)
            .then(res => {
                setData(res.data);

                const forecastRows = res.data.data
                    .filter(d => d.predicted_price !== null && d.historical_price === null)
                    .map(row => ({
                        date: row.date,
                        price: row.predicted_price,
                        model: algorithm,
                        asset: asset,
                        timestamp: new Date().toLocaleString()
                    }));

                setPredictionTable(forecastRows);
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.error || "Failed to load forecasting data");
                setLoading(false);
            });
    };

    const fetchBacktestData = (asset) => {
        setLoadingBacktest(true);
        setBacktestingResults([]);

        API.get(`backtest/?ticker=${asset}`)
            .then(res => {
                setBacktestingResults(res.data.results || []);
                setLoadingBacktest(false);
            })
            .catch(err => {
                console.error("Backtest Fetch Error:", err);
                setLoadingBacktest(false);
            });
    };

    useEffect(() => {
        loadData(horizon, selectedAsset, selectedAlgorithm);
    }, [horizon, selectedAsset, selectedAlgorithm]);

    useEffect(() => {
        // Fetch backtesting separately when asset changes
        fetchBacktestData(selectedAsset);
    }, [selectedAsset]);

    if (error) {
        return (
            <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-8 bg-rose-500/5 border border-rose-500/20 rounded-3xl max-w-md">
                    <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">⚠️</div>
                    <p className="text-rose-400 font-bold mb-2">Forecasting Failed</p>
                    <p className="text-slate-500 text-sm">{error}</p>
                    <button
                        onClick={() => { setError(null); loadData(horizon, selectedAsset, selectedAlgorithm); }}
                        className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto">
            {/* Header section with segmented control */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-2">Predefined AI Portfolio</h2>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 text-balance">
                        {assetOptions.find(a => a.value === selectedAsset)?.label.split(' ')[0]} AI Forecasting
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Actively tracks real-time {assetOptions.find(a => a.value === selectedAsset)?.label} movements and leverages {selectedAlgorithm} Machine Learning to generate high-confidence forward-looking projections.
                    </p>
                </div>

                {/* Horizon Selector */}
                <div className="relative z-10 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800 flex items-center backdrop-blur-xl">
                    {[7, 30, 90].map((days) => (
                        <button
                            key={days}
                            onClick={() => setHorizon(days)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${horizon === days
                                ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            {days} Days
                        </button>
                    ))}
                </div>
            </div>

            {/* Forecasting Graph Cleanup */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl relative min-h-[500px]">

                {loading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-[2.5rem]">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                        </div>
                        <p className="text-white font-bold tracking-wide mt-6">Running {selectedAlgorithm} Model</p>
                        <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Calculating {horizon}-Day Horizon for {selectedAsset}</p>
                    </div>
                )}

                {/* Asset & Algorithm Selection */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Predictive Asset</label>
                            <select
                                value={selectedAsset}
                                onChange={(e) => setSelectedAsset(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-white text-sm font-bold py-3 px-5 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-900 min-w-[200px]"
                            >
                                {assetOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Intelligence Model</label>
                            <select
                                value={selectedAlgorithm}
                                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-white text-sm font-bold py-3 px-5 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-900 min-w-[200px]"
                            >
                                {algorithmOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {data && (
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{horizon}D Target Price</p>
                            <p className="text-3xl font-black text-indigo-400">
                                {selectedAsset === "BTC-USD" ? "$" : ""}
                                {Number(data.data[data.data.length - 1].predicted_price).toLocaleString(undefined, { maximumFractionDigits: selectedAsset === "BTC-USD" ? 0 : 2 })}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                            {assetOptions.find(a => a.value === selectedAsset)?.label} Predictive Trajectory
                        </h3>
                        <p className="text-slate-500 text-sm flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Historical Truth</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-dashed border-indigo-500"></span> AI Forecast</span>
                        </p>
                    </div>
                </div>

                <div className="h-[400px] w-full bg-slate-950/30 rounded-3xl border border-slate-800 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data?.data || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#475569"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={50}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                stroke="#475569"
                                fontSize={10}
                                tickFormatter={(val) => {
                                    if (val >= 1000) return `$${(val / 1000).toFixed(selectedAsset === "BTC-USD" ? 0 : 1)}k`;
                                    return `$${val.toFixed(2)}`;
                                }}
                                tickLine={false}
                                axisLine={false}
                                width={60}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem' }}
                                itemStyle={{ color: '#f8fafc' }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                                formatter={(value, name) => [
                                    `${selectedAsset === "BTC-USD" ? "$" : ""}${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                                    name === 'historical_price' ? 'Historical Price' : `${selectedAlgorithm} Prediction`
                                ]}
                            />

                            {/* Area to give the historical line some grounding */}
                            <Area type="monotone" dataKey="historical_price" fill="#fbbf24" fillOpacity={0.05} stroke="none" />

                            {/* The Solid Historical Line */}
                            <Line
                                type="monotone"
                                dataKey="historical_price"
                                stroke="#fbbf24"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: "#fbbf24", stroke: "#0f172a", strokeWidth: 2 }}
                            />

                            {/* The Dashed Predictive Line */}
                            <Line
                                type="monotone"
                                dataKey="predicted_price"
                                stroke="#6366f1"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                dot={false}
                                activeDot={{ r: 6, fill: "#6366f1", stroke: "#0f172a", strokeWidth: 2 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Model Backtesting Results */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-white mb-1">Model Backtesting Results</h3>
                        <p className="text-slate-500 text-sm">Statistical evaluation of {selectedAsset} modeling performance over historical 2-year window.</p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">Model</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">MAE</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">RMSE</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">MAPE</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">Accuracy (%)</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 text-right">Data Range</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loadingBacktest ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic text-sm">
                                        Calculating integrity metrics...
                                    </td>
                                </tr>
                            ) : backtestingResults.length > 0 ? (
                                backtestingResults.map((row, idx) => (
                                    <tr key={idx} className={`hover:bg-slate-800/20 transition-colors ${row.model === selectedAlgorithm || (row.model.includes("LSTM") && selectedAlgorithm === "RNN") ? 'bg-indigo-500/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${row.model === selectedAlgorithm || (row.model.includes("LSTM") && selectedAlgorithm === "RNN")
                                                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                                                : 'bg-slate-800/50 text-slate-400 border-slate-700'
                                                }`}>
                                                {row.model}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-300 font-mono">{row.mae.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-300 font-mono">{row.rmse.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-emerald-400 font-bold">{row.mape}%</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                                        style={{ width: `${row.accuracy}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-black text-white">{row.accuracy}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] text-slate-500 text-right font-bold uppercase tracking-widest">{row.data_range}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic text-sm">
                                        No metrics available for {selectedAsset}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Forecast Metrics Explorer */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-white mb-1">Forecast Metrics Explorer</h3>
                        <p className="text-slate-500 text-sm">Detailed breakdown of AI-generated price points and mathematical provenance.</p>
                    </div>
                    <button
                        onClick={() => setPredictionTable([])}
                        className="px-6 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold transition-all uppercase tracking-widest"
                    >
                        Remove Results
                    </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">Forecast Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">Predicted Price</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">Model</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">Asset</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 text-right">System Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {predictionTable.length > 0 ? (
                                predictionTable.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-indigo-400">{row.date}</td>
                                        <td className="px-6 py-4 font-bold text-white">
                                            {row.asset === "BTC-USD" ? "$" : ""}
                                            {Number(row.price).toLocaleString(undefined, { maximumFractionDigits: row.asset === "BTC-USD" ? 0 : 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-bold border border-indigo-500/20">
                                                {row.model}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">{row.asset}</td>
                                        <td className="px-6 py-4 text-[10px] text-slate-500 text-right">{row.timestamp}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic text-sm">
                                        No active forecasts. Select an asset or model to generate results.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

