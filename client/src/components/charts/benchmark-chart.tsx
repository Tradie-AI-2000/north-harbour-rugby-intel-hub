import { Progress } from "@/components/ui/progress";
import type { Player } from "@shared/schema";

interface BenchmarkChartProps {
  playerId: string;
  player?: Player;
}

// Positional benchmarks (example data)
const BENCHMARKS = {
  'Flanker': {
    bench_press: 140,
    squat: 180,
    sprint_40m: 5.0,
    yo_yo: 19.0,
  },
  'Fly Half': {
    bench_press: 120,
    squat: 160,
    sprint_40m: 4.8,
    yo_yo: 20.0,
  },
  'Prop': {
    bench_press: 160,
    squat: 220,
    sprint_40m: 5.5,
    yo_yo: 16.0,
  },
  'Centre': {
    bench_press: 130,
    squat: 170,
    sprint_40m: 4.9,
    yo_yo: 19.5,
  },
};

export default function BenchmarkChart({ playerId, player }: BenchmarkChartProps) {
  if (!player) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No benchmark data available</p>
        </div>
      </div>
    );
  }

  const position = player.rugbyProfile.primaryPosition;
  const benchmarks = BENCHMARKS[position as keyof typeof BENCHMARKS];

  if (!benchmarks) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <p>No benchmarks available for position: {position}</p>
        </div>
      </div>
    );
  }

  // Get latest test results
  const latestTests = player.testResults.reduce((acc, test) => {
    if (!acc[test.testType] || new Date(test.date) > new Date(acc[test.testType].date)) {
      acc[test.testType] = test;
    }
    return acc;
  }, {} as Record<string, any>);

  const metrics = [
    {
      name: 'Bench Press 1RM',
      playerValue: latestTests.bench_press?.value || 0,
      benchmark: benchmarks.bench_press,
      unit: 'kg',
      higherIsBetter: true,
    },
    {
      name: 'Squat 1RM',
      playerValue: latestTests.squat?.value || 0,
      benchmark: benchmarks.squat,
      unit: 'kg',
      higherIsBetter: true,
    },
    {
      name: '40m Sprint',
      playerValue: latestTests.sprint_40m?.value || 0,
      benchmark: benchmarks.sprint_40m,
      unit: 's',
      higherIsBetter: false,
    },
    {
      name: 'Yo-Yo Test',
      playerValue: latestTests.yo_yo?.value || 0,
      benchmark: benchmarks.yo_yo,
      unit: 'level',
      higherIsBetter: true,
    },
  ];

  const calculatePercentage = (playerValue: number, benchmark: number, higherIsBetter: boolean) => {
    if (playerValue === 0) return 0;
    
    if (higherIsBetter) {
      return Math.min((playerValue / benchmark) * 100, 100);
    } else {
      // For metrics where lower is better (like sprint times)
      return Math.min((benchmark / playerValue) * 100, 100);
    }
  };

  const getColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-nh-green';
    if (percentage >= 75) return 'bg-nh-blue';
    if (percentage >= 60) return 'bg-nh-amber';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {metrics.map((metric) => {
        const percentage = calculatePercentage(metric.playerValue, metric.benchmark, metric.higherIsBetter);
        
        return (
          <div key={metric.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">{metric.name}</span>
              <div className="text-sm font-bold text-slate-900">
                {metric.playerValue > 0 ? `${metric.playerValue}${metric.unit}` : 'N/A'}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Progress 
                  value={percentage} 
                  className={`h-2 ${getColor(percentage)}`}
                />
              </div>
              <span className="text-xs text-slate-500 min-w-[60px]">
                Target: {metric.benchmark}{metric.unit}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {percentage > 0 ? `${Math.round(percentage)}% of benchmark` : 'No data'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
