import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-xl">
        <p className="text-sm font-bold text-slate-200 border-b border-slate-700 pb-2 mb-2">
          {data.symbol.replace(".NS", "")}
        </p>
        <div className="space-y-1">
          <p className="text-sm text-slate-300">P/E Ratio: <span className="font-semibold">{data.pe.toFixed(2)}</span></p>
          <p className="text-sm text-slate-300">Discount Level: <span className="font-semibold">{data.discount.toFixed(2)}%</span></p>
          <p className="text-sm text-orange-400">Opportunity Score: <span className="font-semibold">{data.opportunity.toFixed(2)}</span></p>
        </div>
      </div>
    );
  }
  return null;
};

export default function PEAnalysisChart({ stocks }) {
  if (!stocks.length) return null;

  const chartData = stocks.map((s) => ({
    symbol: s.symbol,
    pe: Number(s.pe_ratio) || 0,
    discount: Number(s.discount_level) || 0,
    opportunity: Number(s.opportunity) || 5
  }));

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">Value Matrix</h2>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

            <XAxis
              type="number"
              dataKey="pe"
              name="P/E Ratio"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: 'P/E Ratio', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 12 }}
            />

            <YAxis
              type="number"
              dataKey="discount"
              name="Discount Level"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Discount Level (%)', angle: -90, position: 'insideLeft', offset: -10, fill: '#94a3b8', fontSize: 12, style: { textAnchor: 'middle' } }}
            />

            <ZAxis
              type="number"
              dataKey="opportunity"
              range={[100, 800]}
            />

            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />

            <Scatter
              data={chartData}
              fill="#f97316"
              fillOpacity={0.6}
              stroke="#ea580c"
              strokeWidth={2}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}