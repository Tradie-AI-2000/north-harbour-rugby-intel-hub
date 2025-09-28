import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Player } from "@shared/schema";

interface GameTimeChartProps {
  playerId: string;
  player?: Player;
}

export default function GameTimeChart({ playerId, player }: GameTimeChartProps) {
  if (!player || !player.gameStats.length) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No game data available</p>
        </div>
      </div>
    );
  }

  // Prepare chart data for the last two seasons
  const seasons = player.gameStats.slice(-2);
  const chartData = seasons.map(stats => ({
    season: stats.season,
    minutes: stats.minutesPlayed,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="season" 
            tick={{ fontSize: 12 }}
            className="text-slate-600"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            className="text-slate-600"
            label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value) => [`${value} minutes`, 'Minutes Played']}
          />
          <Bar 
            dataKey="minutes" 
            fill="hsl(207, 90%, 54%)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
