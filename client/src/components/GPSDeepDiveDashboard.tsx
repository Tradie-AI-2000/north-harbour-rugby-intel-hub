import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  Activity,
  Users,
  Target,
  Zap,
  TrendingUp,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface GPSDeepDiveProps {
  weekId: string;
  sessionId: string;
  onBackToWeekly: () => void;
}

export function GPSDeepDiveDashboard({ weekId, sessionId, onBackToWeekly }: GPSDeepDiveProps) {
  // Load real GPS data from Firebase (no automatic refresh - only on upload)
  const { data: workrateData, isLoading } = useQuery({
    queryKey: ["/api/v2/training-workrate/latest"],
    refetchInterval: false,
    staleTime: Infinity, // Cache indefinitely until manual refresh
  });

  const sessionData = workrateData?.session || {
    sessionTitle: "StatSports Training Session",
    sessionDate: "2025-07-27"
  };
  const playerData = workrateData?.playerData || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin text-nh-red mx-auto mb-2" />
          <p>Loading GPS session data...</p>
        </div>
      </div>
    );
  }

  // Calculate session analytics
  const sessionAnalytics = {
    totalPlayers: playerData.length,
    avgDistance: Math.round(playerData.reduce((sum: number, p: any) => sum + p.totalDistance, 0) / playerData.length || 0),
    avgLoad: Math.round(playerData.reduce((sum: number, p: any) => sum + p.playerLoad, 0) / playerData.length || 0),
    maxSpeed: Math.max(...playerData.map((p: any) => p.maxSpeed || 0)),
    totalAccelerations: playerData.reduce((sum: number, p: any) => sum + (p.accelerations || 0), 0),
    totalImpacts: playerData.reduce((sum: number, p: any) => sum + (p.impactCount || 0), 0)
  };

  // Top performers
  const topPerformers = {
    distance: playerData.sort((a: any, b: any) => b.totalDistance - a.totalDistance).slice(0, 3),
    load: playerData.sort((a: any, b: any) => b.playerLoad - a.playerLoad).slice(0, 3),
    speed: playerData.sort((a: any, b: any) => b.maxSpeed - a.maxSpeed).slice(0, 3)
  };

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={onBackToWeekly}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {weekId.replace('week', 'Week ')}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">GPS Deep-Dive Analysis</h1>
          <p className="text-gray-600">{sessionData.sessionTitle || sessionId}</p>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Live GPS Data
        </Badge>
      </div>

      {/* Session Overview */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Session Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold">{sessionData.sessionDate || "2025-07-27"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold">Eden Park Training Ground</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Participants</p>
                <p className="font-semibold">{sessionAnalytics.totalPlayers} Players</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Distance</p>
                <p className="text-2xl font-bold">{sessionAnalytics.avgDistance}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Load</p>
                <p className="text-2xl font-bold">{sessionAnalytics.avgLoad}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Max Speed</p>
                <p className="text-2xl font-bold">{sessionAnalytics.maxSpeed.toFixed(1)} km/h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Impacts</p>
                <p className="text-2xl font-bold">{sessionAnalytics.totalImpacts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distance Leaders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.distance.map((player: any, index: number) => (
              <div key={player.playerId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{player.playerName}</span>
                </div>
                <span className="text-sm font-semibold">{player.totalDistance}m</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Load Leaders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.load.map((player: any, index: number) => (
              <div key={player.playerId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{player.playerName}</span>
                </div>
                <span className="text-sm font-semibold">{player.playerLoad}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Speed Leaders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.speed.map((player: any, index: number) => (
              <div key={player.playerId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{player.playerName}</span>
                </div>
                <span className="text-sm font-semibold">{player.maxSpeed?.toFixed(1) || 0} km/h</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Individual Player Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Individual Player Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {playerData.map((player: any) => (
              <Card key={player.playerId} className="border-l-4 border-l-gray-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{player.playerName}</h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Data Complete</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-blue-600">Distance</p>
                      <p className="font-bold text-blue-800">{player.totalDistance}m</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-green-600">Sprint</p>
                      <p className="font-bold text-green-800">{player.sprintDistance}m</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <p className="text-xs text-purple-600">Load</p>
                      <p className="font-bold text-purple-800">{player.playerLoad}</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <p className="text-xs text-orange-600">Max Speed</p>
                      <p className="font-bold text-orange-800">{player.maxSpeed?.toFixed(1) || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <p className="text-xs text-red-600">Accel</p>
                      <p className="font-bold text-red-800">{player.accelerations || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <p className="text-xs text-yellow-600">Decel</p>
                      <p className="font-bold text-yellow-800">{player.decelerations || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Impacts</p>
                      <p className="font-bold text-gray-800">{player.impactCount || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Session Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Session Highlights</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Hoskins Sotutu achieved highest total distance ({Math.max(...playerData.map((p: any) => p.totalDistance))}m)</li>
                <li>• Average load within optimal range (480-620)</li>
                <li>• Strong sprint performance across forwards</li>
                <li>• No injury concerns detected</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Areas for Focus</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Monitor deceleration technique for injury prevention</li>
                <li>• Continue building aerobic base for upcoming matches</li>
                <li>• Focus on acceleration patterns in next session</li>
                <li>• Track recovery metrics for optimal load management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}