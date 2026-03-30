import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import API from "../services/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length >= 2) {
    // Determine the color based on if Current > Investment
    const current = payload.find(p => p.dataKey === "Current")?.value || 0;
    const invested = payload.find(p => p.dataKey === "Investment")?.value || 0;
    const isProfitable = current >= invested;

    return (
      <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-xl min-w-[150px]">
        <p className="text-xs font-bold text-slate-400 mb-3 border-b border-slate-700 pb-2">{label}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm text-slate-400">Current</span>
            <span className={`text-sm font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{current.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm text-slate-400">Invested</span>
            <span className="text-sm font-bold text-blue-400">
              ₹{invested.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function AdvancedChart({ portfolioId, refreshTrigger }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!portfolioId) return;

    setLoading(true);
    API.get(`portfolio-growth/?portfolio_id=${portfolioId}`)
      .then(res => {
        setChartData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load growth data:", err);
        setLoading(false);
      });
  }, [portfolioId, refreshTrigger]);

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl h-[450px] relative overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Portfolio Growth</h2>
          <p className="text-xs text-slate-500 mt-0.5">Historical 30-Day Investment vs Real Value</p>
        </div>
      </div>

      <div className="flex-grow w-full relative min-h-0">
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-xl">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {chartData.length > 0 && !loading && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                }}
              />
              <YAxis
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '3 3' }} />

              <Area
                type="monotone"
                dataKey="Investment"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorInvest)"
                activeDot={{ r: 4, strokeWidth: 0, fill: '#3b82f6' }}
              />
              <Area
                type="monotone"
                dataKey="Current"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorCurrent)"
                activeDot={{ r: 4, strokeWidth: 0, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartData.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
            Add assets to your portfolio to track historical growth.
          </div>
        )}
      </div>
    </div>
  );
}