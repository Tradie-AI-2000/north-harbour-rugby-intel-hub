import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import type { Player } from "@shared/schema";

interface TrendsChartProps {
  playerId: string;
  player?: Player;
}

export default function TrendsChart({ playerId, player }: TrendsChartProps) {
  if (!player || !player.physicalAttributes.length) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No physical data available</p>
          <p className="text-sm">Physical attributes will appear here once recorded</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = player.physicalAttributes
    .slice(-12) // Last 12 entries
    .map(attr => ({
      date: format(new Date(attr.date), 'MMM yyyy'),
      weight: attr.weight,
      bodyFat: attr.bodyFat,
      leanMass: attr.leanMass,
    }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            className="text-slate-600"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            className="text-slate-600"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="hsl(207, 90%, 54%)"
            strokeWidth={2}
            dot={{ fill: 'hsl(207, 90%, 54%)', strokeWidth: 2, r: 4 }}
            name="Weight (kg)"
          />
          <Line 
            type="monotone" 
            dataKey="bodyFat" 
            stroke="hsl(0, 84%, 60%)"
            strokeWidth={2}
            dot={{ fill: 'hsl(0, 84%, 60%)', strokeWidth: 2, r: 4 }}
            name="Body Fat (%)"
          />
          <Line 
            type="monotone" 
            dataKey="leanMass" 
            stroke="hsl(142, 76%, 36%)"
            strokeWidth={2}
            dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, r: 4 }}
            name="Lean Mass (kg)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
