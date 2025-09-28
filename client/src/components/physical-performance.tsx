import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TrendsChart from "@/components/charts/trends-chart";
import BenchmarkChart from "@/components/charts/benchmark-chart";
import type { Player } from "@shared/schema";

interface PhysicalPerformanceProps {
  playerId: string;
  player?: Player;
}

export default function PhysicalPerformance({ playerId, player }: PhysicalPerformanceProps) {
  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No player data available</p>
      </div>
    );
  }

  const currentPhysical = player.physicalAttributes[player.physicalAttributes.length - 1];
  const previousPhysical = player.physicalAttributes[player.physicalAttributes.length - 2];

  const getChange = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    const change = current - previous;
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      percentage: Math.abs((change / previous) * 100)
    };
  };

  const weightChange = getChange(currentPhysical?.weight || 0, previousPhysical?.weight);
  const bodyFatChange = getChange(currentPhysical?.bodyFat || 0, previousPhysical?.bodyFat);
  const leanMassChange = getChange(currentPhysical?.leanMass || 0, previousPhysical?.leanMass);

  // Get latest test results
  const latestTests = player.testResults.reduce((acc, test) => {
    if (!acc[test.testType] || new Date(test.date) > new Date(acc[test.testType].date)) {
      acc[test.testType] = test;
    }
    return acc;
  }, {} as Record<string, any>);

  const vo2Test = latestTests.vo2_max;

  return (
    <div className="space-y-8">
      {/* Current Physical Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-nh-navy">
              {currentPhysical?.weight || 'N/A'}kg
            </div>
            <div className="text-sm text-slate-600">Current Weight</div>
            {weightChange && (
              <div className={`text-xs mt-1 flex items-center justify-center ${
                weightChange.direction === 'up' ? 'text-nh-green' : 'text-red-500'
              }`}>
                {weightChange.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {weightChange.value}kg from last month
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-nh-navy">
              {currentPhysical?.bodyFat?.toFixed(1) || 'N/A'}%
            </div>
            <div className="text-sm text-slate-600">Body Fat</div>
            {bodyFatChange && (
              <div className={`text-xs mt-1 flex items-center justify-center ${
                bodyFatChange.direction === 'down' ? 'text-nh-green' : 'text-red-500'
              }`}>
                {bodyFatChange.direction === 'down' ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 mr-1" />
                )}
                {bodyFatChange.value.toFixed(1)}% from last month
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-nh-navy">
              {currentPhysical?.leanMass?.toFixed(1) || 'N/A'}kg
            </div>
            <div className="text-sm text-slate-600">Lean Mass</div>
            {leanMassChange && (
              <div className={`text-xs mt-1 flex items-center justify-center ${
                leanMassChange.direction === 'up' ? 'text-nh-green' : 'text-red-500'
              }`}>
                {leanMassChange.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {leanMassChange.value.toFixed(1)}kg from last month
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-nh-navy">
              {vo2Test?.value?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-sm text-slate-600">VO2 Max</div>
            <div className="text-xs text-nh-green mt-1 flex items-center justify-center">
              <Activity className="h-3 w-3 mr-1" />
              From last test
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-nh-blue" />
            Physical Attributes Trends (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrendsChart playerId={playerId} player={player} />
        </CardContent>
      </Card>

      {/* Benchmark Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Strength vs Positional Benchmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <BenchmarkChart playerId={playerId} player={player} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Results Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>Performance Timeline</p>
                <p className="text-sm">Key metrics progression</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
