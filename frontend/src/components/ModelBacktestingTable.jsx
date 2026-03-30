import { useState, useEffect } from "react";
import API from "../services/api";

export default function ModelBacktestingTable({ symbol, selectedAlgorithm }) {
    const [backtestingResults, setBacktestingResults] = useState([]);
    const [loadingBacktest, setLoadingBacktest] = useState(true);
    const [actualTicker, setActualTicker] = useState(symbol);

    const fetchBacktestData = (asset) => {
        if (!asset) return;
        setLoadingBacktest(true);
        setBacktestingResults([]);

        const safeAsset = asset.includes(".NS") ? asset : `${asset}.NS`;
        API.get(`backtest/?ticker=${safeAsset}`)
            .then(res => {
                setBacktestingResults(res.data.results || []);
                setActualTicker(res.data.ticker || asset);
                setLoadingBacktest(false);
            })
            .catch(err => {
                console.error("Universal Backtest Fetch Error:", err);
                setLoadingBacktest(false);
            });
    };

    useEffect(() => {
        fetchBacktestData(symbol);
    }, [symbol]);

    return (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl relative mt-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-2xl font-black text-white mb-1">Universal Model Evaluation Engine</h3>
                    <p className="text-slate-500 text-sm">
                        Real-time mathematical backtesting of predictive architectures on <span className="font-bold text-indigo-400">{actualTicker}</span> over a 2-year horizon window.
                    </p>
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
                                    Executing deep mathematical integrity metrics for {symbol}...
                                </td>
                            </tr>
                        ) : backtestingResults.length > 0 ? (
                            backtestingResults.map((row, idx) => (
                                <tr key={idx} className={`hover:bg-slate-800/20 transition-colors ${row.model === selectedAlgorithm || (row.model.includes("LSTM") && selectedAlgorithm === "RNN") || (row.model.includes(selectedAlgorithm?.split(' ')[0])) ? 'bg-indigo-500/5' : ''}`}>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${row.model === selectedAlgorithm || (row.model.includes("LSTM") && selectedAlgorithm === "RNN") || (row.model.includes(selectedAlgorithm?.split(' ')[0]))
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
                                    No statistical backtesting metrics available for {actualTicker}.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
