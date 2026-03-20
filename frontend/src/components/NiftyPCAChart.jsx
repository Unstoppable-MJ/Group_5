import { useState, useEffect } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Legend } from "recharts";
import API from "../services/api";

const CLUSTER_COLORS = ["#818cf8", "#34d399", "#f472b6", "#fbbf24", "#60a5fa", "#a78bfa"];

// Custom shape to draw an emphasized dot
const CustomDot = (props) => {
    const { cx, cy, fill } = props;
    return (
        <circle cx={cx} cy={cy} r={6} stroke="#1e293b" strokeWidth={1} fill={fill} />
    );
};

// Custom shape for Centroids (a cross over a large circle)
const CentroidDot = (props) => {
    const { cx, cy, fill } = props;
    return (
        <g transform={`translate(${cx},${cy})`}>
            <circle cx={0} cy={0} r={8} fill={fill} stroke="#ffffff" strokeWidth={2} />
            <path d="M -5 0 L 5 0 M 0 -5 L 0 5" stroke="#ffffff" strokeWidth={2} />
        </g>
    );
};

export default function NiftyPCAChart() {
    const [k, setK] = useState(4);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCluster, setActiveCluster] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        setActiveCluster(null);
        // The API fetches ~50 stocks recursively via yfinance which takes time.
        API.get(`nifty50-pca/?k=${k}`)
            .then(res => {
                if (res.data.clusters) {
                    // Flatten the response and exact centroids
                    const flattened = [];
                    const centroids = [];
                    res.data.clusters.forEach(cluster => {
                        centroids.push({
                            pc1: cluster.centroid_pc1,
                            pc2: cluster.centroid_pc2,
                            clusterIndex: cluster.cluster_index,
                            isCentroid: true
                        });
                        cluster.stocks.forEach(stock => {
                            flattened.push({
                                ...stock,
                                clusterIndex: cluster.cluster_index
                            });
                        });
                    });

                    setData({
                        ...res.data,
                        flattened,
                        centroids
                    });
                } else {
                    setError("Received malformed PCA data.");
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.error || "Failed to load NIFTY 50 PCA map");
                setLoading(false);
            });
    }, [k]);

    return (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] group-hover:bg-indigo-500/10 transition-all duration-700" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                        <span className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400 text-sm">N50</span>
                        NIFTY 50 PCA Clustering
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Dimensionality reduction (PC1 vs PC2) on returns, volatility, P/E, price, and opportunity.</p>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clusters (K)</label>
                    <input
                        type="range"
                        min="2"
                        max="6"
                        value={k}
                        onChange={(e) => setK(parseInt(e.target.value))}
                        className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        disabled={loading}
                    />
                    <span className="text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">{k}</span>
                </div>
            </div>

            {loading ? (
                <div className="h-[550px] flex items-center justify-center relative z-10">
                    <div className="flex flex-col items-center gap-6 p-8 bg-slate-950/50 border border-slate-800 rounded-3xl backdrop-blur-md">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                        </div>
                        <div className="text-center">
                            <p className="text-white font-bold tracking-wide">Compiling NIFTY 50 Data Matrix</p>
                            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Fetching Live Data • Calculating PCA</p>
                        </div>
                    </div>
                </div>
            ) : error ? (
                <div className="h-[400px] flex flex-col items-center justify-center">
                    <div className="text-center p-8 bg-rose-500/5 border border-rose-500/20 rounded-3xl max-w-md">
                        <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">⚠️</div>
                        <p className="text-rose-400 font-bold mb-2">PCA Analysis Failed</p>
                        <p className="text-slate-500 text-sm">{error}</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-950/30 p-4 rounded-2xl border border-slate-800 shadow-inner">
                        <div className="flex gap-2 items-center">
                            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                            Variance PC1: <span className="text-white">{data?.variance_explained_pc1}%</span>
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                            Variance PC2: <span className="text-white">{data?.variance_explained_pc2}%</span>
                        </div>
                        <div className="flex gap-2 items-center ml-auto text-indigo-400">
                            Evaluated {data?.flattened?.length} Tickers
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
                        {/* 1. Raw PCA Dataset Visualization */}
                        <div className="flex flex-col gap-4">
                            <h4 className="text-xl font-bold text-white ml-2 flex items-center gap-2">
                                <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
                                PCA-Reduced Dataset
                            </h4>
                            <div className="h-[500px] w-full bg-slate-950/30 rounded-3xl border border-slate-800 p-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 30, right: 30, bottom: 40, left: 30 }}>
                                        <CartesianGrid strokeDasharray="4 4" stroke="#334155" opacity={0.6} vertical={true} horizontal={true} />
                                        <XAxis
                                            type="number"
                                            dataKey="pc1"
                                            name="Principal Component 1"
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            label={{ value: 'Principal Component 1 (PC1)', position: 'insideBottom', offset: -30, fill: '#94a3b8', fontSize: 13, fontWeight: 700 }}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="pc2"
                                            name="Principal Component 2"
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            label={{ value: 'Principal Component 2 (PC2)', angle: -90, position: 'insideLeft', offset: -10, fill: '#94a3b8', fontSize: 13, style: { textAnchor: 'middle' }, fontWeight: 700 }}
                                        />
                                        <Tooltip
                                            cursor={{ strokeDasharray: '3 3' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const stock = payload[0].payload;
                                                    return (
                                                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-2xl z-50 min-w-[200px]">
                                                            <div className="mb-3 pb-2 border-b border-slate-800 flex flex-col gap-1">
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <span className="text-sm font-black text-white leading-tight">{stock.company_name || stock.symbol}</span>
                                                                </div>
                                                                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{stock.symbol}</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3 mt-2">
                                                                <div className="flex flex-col gap-1 bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">PC1 (X-Axis)</span>
                                                                    <span className="text-xs font-black text-slate-200">{stock.pc1.toFixed(3)}</span>
                                                                </div>
                                                                <div className="flex flex-col gap-1 bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">PC2 (Y-Axis)</span>
                                                                    <span className="text-xs font-black text-slate-200">{stock.pc2.toFixed(3)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        {/* Single generic color for the unclustered PCA dataset */}
                                        <Scatter data={data?.flattened} fill="#6366f1" shape={<CustomDot />} />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* 2. K-Means Clustering Results Visualization */}
                        <div className="flex flex-col gap-4">
                            <h4 className="text-xl font-bold text-white ml-2 flex items-center gap-2">
                                <span className="bg-fuchsia-500/20 text-fuchsia-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                                K-Means Clustering Result
                            </h4>
                            <div className="h-[500px] w-full bg-slate-950/30 rounded-3xl border border-slate-800 p-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 30, right: 30, bottom: 40, left: 30 }}>
                                        <CartesianGrid strokeDasharray="4 4" stroke="#334155" opacity={0.6} vertical={true} horizontal={true} />
                                        <XAxis
                                            type="number"
                                            dataKey="pc1"
                                            name="Principal Component 1"
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            label={{ value: 'Principal Component 1 (PC1)', position: 'insideBottom', offset: -30, fill: '#94a3b8', fontSize: 13, fontWeight: 700 }}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="pc2"
                                            name="Principal Component 2"
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            label={{ value: 'Principal Component 2 (PC2)', angle: -90, position: 'insideLeft', offset: -10, fill: '#94a3b8', fontSize: 13, style: { textAnchor: 'middle' }, fontWeight: 700 }}
                                        />
                                        <Tooltip
                                            cursor={{ strokeDasharray: '3 3' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const stock = payload[0].payload;

                                                    // Handle Centroid Hover
                                                    if (stock.isCentroid) {
                                                        return (
                                                            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl shadow-2xl z-50">
                                                                <div className="text-sm font-black text-white flex gap-2 items-center">
                                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[stock.clusterIndex % CLUSTER_COLORS.length] }}></div>
                                                                    Cluster {stock.clusterIndex + 1} Centroid
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-2xl z-50 min-w-[200px]">
                                                            <div className="mb-3 pb-2 border-b border-slate-800 flex flex-col gap-1">
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <span className="text-sm font-black text-white leading-tight">{stock.company_name || stock.symbol}</span>
                                                                    <span className="text-[10px] text-white font-bold px-2 py-1 rounded-md mt-0.5 whitespace-nowrap" style={{ backgroundColor: CLUSTER_COLORS[stock.clusterIndex % CLUSTER_COLORS.length] }}>
                                                                        Cluster {stock.clusterIndex + 1}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{stock.symbol}</span>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3 mt-2">
                                                                <div className="flex flex-col gap-1 bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">PC1 (X-Axis)</span>
                                                                    <span className="text-xs font-black text-slate-200">{stock.pc1.toFixed(3)}</span>
                                                                </div>
                                                                <div className="flex flex-col gap-1 bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">PC2 (Y-Axis)</span>
                                                                    <span className="text-xs font-black text-slate-200">{stock.pc2.toFixed(3)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />

                                        {/* Mapping distinct Scatter components per cluster enables automatic Legends */}
                                        {data?.clusters?.map((cluster, i) => (
                                            <Scatter
                                                key={`cluster-scatter-${i}`}
                                                name={`Cluster ${i + 1}`}
                                                data={cluster.stocks.map(s => ({ ...s, clusterIndex: i }))}
                                                fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]}
                                                shape={<CustomDot />}
                                                opacity={activeCluster === null || activeCluster === i ? 1 : 0.05}
                                            />
                                        ))}

                                        {/* Overlay Centroids */}
                                        <Scatter
                                            name="Centroids"
                                            data={data?.centroids}
                                            shape={<CentroidDot />}
                                            legendType="none" // Hide centroids from legend
                                        >
                                            {data?.centroids?.map((entry, index) => (
                                                <Cell
                                                    key={`centroid-cell-${index}`}
                                                    fill={CLUSTER_COLORS[entry.clusterIndex % CLUSTER_COLORS.length]}
                                                    opacity={activeCluster === null || activeCluster === entry.clusterIndex ? 1 : 0.05}
                                                />
                                            ))}
                                        </Scatter>

                                        <Legend
                                            verticalAlign="top"
                                            height={50}
                                            onClick={(e) => {
                                                const name = e.value || e.dataKey;
                                                if (name && typeof name === 'string') {
                                                    const match = name.match(/Cluster (\d+)/);
                                                    if (match) {
                                                        const clusterIdx = parseInt(match[1]) - 1;
                                                        setActiveCluster(activeCluster === clusterIdx ? null : clusterIdx);
                                                    }
                                                }
                                            }}
                                            wrapperStyle={{ cursor: 'pointer', opacity: 0.9 }}
                                            formatter={(value, entry, index) => {
                                                return <span className="text-slate-200 font-bold hover:text-white transition-colors">{value}</span>;
                                            }}
                                        />

                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
