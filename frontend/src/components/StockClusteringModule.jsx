import { useState, useEffect } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import API from "../services/api";

const CLUSTER_COLORS = ["#818cf8", "#34d399", "#f472b6", "#fbbf24", "#60a5fa", "#a78bfa"];

export default function StockClusteringModule({ portfolioId, refreshTrigger }) {
    const [k, setK] = useState(3);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!portfolioId) return;

        setLoading(true);
        setError(null);
        API.get(`stock-clustering/?portfolio_id=${portfolioId}&k=${k}`)
            .then(res => {
                if (res.data.pairs && res.data.pairs.length > 0) {
                    const processedPairs = res.data.pairs.map(pair => {
                        const flattened = [];
                        pair.clusters.forEach(cluster => {
                            cluster.stocks.forEach(stock => {
                                flattened.push({
                                    ...stock,
                                    clusterIndex: cluster.cluster_index
                                });
                            });
                        });
                        return { ...pair, flattened };
                    });

                    setData({
                        ...res.data,
                        pairs: processedPairs
                    });
                } else {
                    setError("Failed to generate clustering combinations.");
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.error || "Failed to cluster assets");
                setLoading(false);
            });
    }, [portfolioId, k, refreshTrigger]);

    if (loading && !data) return <div className="h-[400px] flex items-center justify-center text-slate-500">Running K-Means Analysis...</div>;

    const bestPair = data?.pairs?.[data?.best_pair_idx] || data?.pairs?.[0];
    const otherPairs = data?.pairs?.filter((_, idx) => idx !== data?.best_pair_idx) || [];

    // Reusable Scatter Chart Component
    const ClusterScatterPlot = ({ pair }) => (
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis
                    type="number"
                    dataKey="x"
                    name={pair.x_label}
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: pair.x_label, position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 10 }}
                />
                <YAxis
                    type="number"
                    dataKey="y"
                    name={pair.y_label}
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: pair.y_label, angle: -90, position: 'insideLeft', offset: -5, fill: '#64748b', fontSize: 10, style: { textAnchor: 'middle' } }}
                />
                <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const stock = payload[0].payload;
                            return (
                                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl z-50">
                                    <p className="text-xs font-bold text-white mb-1">{stock.symbol}</p>
                                    <div className="flex flex-col gap-1 text-[10px]">
                                        <span className="text-slate-400">{pair.x_label}: <b className="text-slate-200">{stock.x.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</b></span>
                                        <span className="text-slate-400">{pair.y_label}: <b className="text-emerald-400">{stock.y.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</b></span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[stock.clusterIndex % CLUSTER_COLORS.length] }} />
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cluster {stock.clusterIndex + 1}</span>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Scatter data={pair.flattened} fill="#8884d8">
                    {pair.flattened?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CLUSTER_COLORS[entry.clusterIndex % CLUSTER_COLORS.length]} />
                    ))}
                </Scatter>
            </ScatterChart>
        </ResponsiveContainer>
    );

    return (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-all duration-700" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                        <span className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400 text-sm">AI</span>
                        Asset Clustering
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Multidimensional similarity grouping using K-Means</p>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clusters (K)</label>
                    <input
                        type="range"
                        min="2"
                        max="6"
                        value={k}
                        onChange={(e) => setK(parseInt(e.target.value))}
                        className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">{k}</span>
                </div>
            </div>

            {error ? (
                <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                        <p className="text-rose-400 font-medium mb-2">{error}</p>
                        <p className="text-slate-500 text-xs text-balance">Add more unique stocks to your portfolio to enable clustering analysis.</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-12 relative z-10">
                    {/* BEST CLUSTER REPRESENTATION */}
                    {bestPair && (
                        <div className="bg-slate-950/40 border border-emerald-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
                            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6 relative z-10">
                                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="text-emerald-400">✨</span> Best Cluster Representation
                                </h4>
                                <div className="text-right">
                                    <div className="text-emerald-400 font-bold text-lg">{bestPair.score.toFixed(3)}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Silhouette Score</div>
                                </div>
                            </div>

                            <div className="h-[350px] w-full">
                                <ClusterScatterPlot pair={bestPair} />
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2 justify-center border-t border-slate-800/50 pt-4">
                                {bestPair.clusters.map((cluster) => (
                                    <div key={cluster.cluster_index} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[cluster.cluster_index % CLUSTER_COLORS.length] }} />
                                        <span className="text-xs font-bold text-slate-300">Cluster {cluster.cluster_index + 1}</span>
                                        <span className="text-[10px] text-slate-500">({cluster.stocks.length})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* REMAINING CLUSTER GRAPHS */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Alternative Feature Spaces</h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherPairs.map((pair, idx) => (
                                <div key={idx} className="bg-slate-950/20 border border-slate-800/50 rounded-2xl p-4 hover:bg-slate-900/40 transition-colors">
                                    <div className="flex justify-between items-center mb-4">
                                        <h5 className="text-xs font-bold text-slate-300">
                                            {pair.x_label} <span className="text-slate-600 font-normal">vs</span> {pair.y_label}
                                        </h5>
                                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-medium">
                                            Score: {pair.score.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="h-[200px] w-full">
                                        <ClusterScatterPlot pair={pair} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
