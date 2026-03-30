import { useState, useEffect } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Cell, BarChart, Bar } from "recharts";
import API from "../services/api";

const CustomDot = (props) => {
    const { cx, cy, fill } = props;
    return <circle cx={cx} cy={cy} r={6} stroke="#1e293b" strokeWidth={1} fill={fill || "#fbbf24"} />;
};

export default function PreciousMetalsPortfolio() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        API.get(`precious-metals/`)
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.error || "Failed to load Precious Metals AI analysis");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-6 p-8 bg-slate-900 border border-slate-800 rounded-3xl backdrop-blur-md">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                        <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin" />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-bold tracking-wide">Synthesizing Precious Metals Matrix</p>
                        <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Fetching Data • Building SHAP/LIME ML Models</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-8 bg-rose-500/5 border border-rose-500/20 rounded-3xl max-w-md">
                    <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">⚠️</div>
                    <p className="text-rose-400 font-bold mb-2">Analysis Failed</p>
                    <p className="text-slate-500 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto">
            {/* Header section */}
            <div className="bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-500/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-sm font-bold tracking-widest text-amber-500 uppercase mb-2">Predefined AI Portfolio</h2>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                        Precious Metals ML Analysis
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        An actively tracked portfolio of global Gold and Silver assets. Evaluated using Random Forest predictors, SHAP global feature importances, and LIME local explanations.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* 1. Portfolio Growth Graph */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-2 flex justify-between items-center">
                        1-Year Equal-Weighted Growth
                        <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full">$10k Base</span>
                    </h3>
                    <p className="text-slate-500 text-sm mb-6">Aggregate portfolio performance over time across all tracked assets.</p>

                    <div className="h-[300px] w-full bg-slate-950/30 rounded-3xl border border-slate-800 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.portfolio_growth_series}>
                                <defs>
                                    <linearGradient id="growthColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#475569" fontSize={10} minTickGap={30} tickLine={false} axisLine={false} />
                                <YAxis domain={['auto', 'auto']} stroke="#475569" fontSize={10} tickFormatter={(val) => `₹${(val).toLocaleString()}`} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem' }}
                                    formatter={(value) => [`₹${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Portfolio Value']}
                                    labelStyle={{ color: '#94a3b8' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#growthColor)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Value Matrix Graph */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-2">Value Matrix</h3>
                    <p className="text-slate-500 text-sm mb-6">Scatter plot identifying undervalued precious metals assets (P/E vs Opportunity).</p>

                    <div className="h-[300px] w-full bg-slate-950/30 rounded-3xl border border-slate-800 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                                <XAxis
                                    type="number" dataKey="pe_ratio" name="P/E Ratio" stroke="#64748b" fontSize={10}
                                    label={{ value: 'P/E Ratio', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 10 }}
                                />
                                <YAxis
                                    type="number" dataKey="opportunity" name="Opportunity Score" stroke="#64748b" fontSize={10}
                                    label={{ value: 'Opportunity Score', angle: -90, position: 'insideLeft', offset: -10, fill: '#94a3b8', fontSize: 10 }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const stock = payload[0].payload;
                                            return (
                                                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl">
                                                    <p className="font-bold text-white mb-1">{stock.company_name} ({stock.symbol})</p>
                                                    <p className="text-xs text-slate-400">P/E: <span className="text-white">{stock.pe_ratio.toFixed(2)}</span></p>
                                                    <p className="text-xs text-slate-400">Opp: <span className="text-white">{stock.opportunity.toFixed(2)}</span></p>
                                                    <p className="text-xs text-slate-400 mt-1">Price: ₹{stock.current_price.toLocaleString()}</p>
                                                </div>
                                            )
                                        }
                                        return null;
                                    }}
                                />
                                <Scatter data={data?.value_matrix_data} shape={<CustomDot fill="#f43f5e" />} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. SHAP Explainability */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-2">SHAP Global Importance</h3>
                    <p className="text-slate-500 text-sm mb-6">Global feature weight inside the Random Forest predictive model.</p>

                    <div className="h-[300px] w-full bg-slate-950/30 rounded-3xl border border-slate-800 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.shap_data} layout="vertical" margin={{ left: 100, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                                <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} hide />
                                <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={11} tick={{ fill: "#cbd5e1" }} tickLine={false} axisLine={false} width={100} />
                                <Tooltip
                                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                    formatter={(value) => [Number(value).toFixed(2), 'Impact Weight']}
                                />
                                <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                                    {data?.shap_data?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={["#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. LIME Explainability */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-2">LIME Local Explanations</h3>
                    <p className="text-slate-500 text-sm mb-6">Individual feature contributions driving the prediction for <span className="font-bold text-amber-400">{data?.lime_data?.asset}</span>.</p>

                    <div className="h-[300px] w-full bg-slate-950/30 rounded-3xl border border-slate-800 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.lime_data?.explanations} layout="vertical" margin={{ left: 100, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                                <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} hide />
                                <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={11} tick={{ fill: "#cbd5e1" }} tickLine={false} axisLine={false} width={100} />
                                <Tooltip
                                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                    formatter={(value) => [Number(value).toFixed(2), 'Contribution']}
                                />
                                <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                                    {data?.lime_data?.explanations?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.contribution > 0 ? "#10b981" : "#ef4444"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
