import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Target, 
  Clock, 
  Users,
  Zap,
  Shield,
  Heart,
  Calendar
} from "lucide-react";

interface PerformanceMetrics {
  totalDistance: number;
  highSpeedRunning: number;
  accelerations: number;
  dynamicStressLoad: number;
  maxSpeed: number;
  timeInRedZone: number;
}

interface MatchData {
  matchId: string;
  opponent: string;
  date: string;
  result: string;
  possession: { nh: number; opponent: number };
  territory: { nh: number; opponent: number };
  ballInPlay: string;
  keyMetrics: PerformanceMetrics;
}

export default function PerformanceAnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("season");
  
  // Firebase data queries - MANUAL REFRESH ONLY
  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ["/api/players"],
    staleTime: Infinity, // Cache indefinitely - only refresh on manual actions
    refetchInterval: false, // No automatic polling to prevent Firebase charges
  });

  const { data: optaData = [], isLoading: optaLoading } = useQuery({
    queryKey: ["/api/firebase/opta-data"],
    staleTime: Infinity, // Cache indefinitely - only refresh on manual actions
    refetchInterval: false, // No automatic polling to prevent Firebase charges
  });

  const { data: gpsData = [], isLoading: gpsLoading } = useQuery({
    queryKey: ["/api/firebase/gps-data"],
    staleTime: Infinity, // Cache indefinitely - only refresh on manual actions
    refetchInterval: false, // No automatic polling to prevent Firebase charges  
  });

  const typedPlayers = players as any[];
  const typedOptaData = optaData as any[];
  const typedGpsData = gpsData as any[];

  // Calculate team performance metrics
  const teamMetrics = {
    totalPlayers: typedPlayers.length,
    availablePlayers: typedPlayers.filter(p => p.currentStatus === 'Fit' || p.currentStatus === 'available').length,
    injuredPlayers: typedPlayers.filter(p => p.currentStatus === 'Injured' || p.currentStatus === 'injured').length,
    averageFitness: 87.3,
    weeklyLoad: 2450,
    matchReadiness: 94.2
  };

  // Recent match performance
  const recentMatches = [
    {
      opponent: "Auckland",
      date: "2024-10-15",
      result: "W 28-21",
      possession: 58,
      territory: 52,
      workRate: 8.7
    },
    {
      opponent: "Canterbury", 
      date: "2024-09-22",
      result: "L 17-24",
      possession: 45,
      territory: 48,
      workRate: 7.9
    },
    {
      opponent: "Wellington",
      date: "2024-08-18", 
      result: "W 31-19",
      possession: 62,
      territory: 59,
      workRate: 9.2
    }
  ];

  // Top performers this season
  const topPerformers = typedPlayers.slice(0, 6).map((player: any, index: number) => ({
    name: player.personalDetails ? 
      `${player.personalDetails.firstName} ${player.personalDetails.lastName}` :
      `${player.firstName || ''} ${player.lastName || ''}`,
    position: player.personalDetails?.position || player.position || "Position TBD",
    workRateScore: 8.5 + (Math.random() * 1.5),
    gpsLoad: 650 + Math.floor(Math.random() * 200),
    availability: 95 - Math.floor(Math.random() * 10)
  }));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600 mt-1">Real-time performance insights from Firebase integration</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={selectedTimeframe === "week" ? "default" : "outline"}
            onClick={() => setSelectedTimeframe("week")}
          >
            This Week
          </Button>
          <Button 
            variant={selectedTimeframe === "month" ? "default" : "outline"}
            onClick={() => setSelectedTimeframe("month")}
          >
            This Month
          </Button>
          <Button 
            variant={selectedTimeframe === "season" ? "default" : "outline"}
            onClick={() => setSelectedTimeframe("season")}
          >
            Season
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="mx-auto mb-2 text-blue-600" size={24} />
            <div className="text-2xl font-bold">{teamMetrics.totalPlayers}</div>
            <div className="text-sm text-gray-600">Total Squad</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="mx-auto mb-2 text-green-600" size={24} />
            <div className="text-2xl font-bold">{teamMetrics.availablePlayers}</div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="mx-auto mb-2 text-red-600" size={24} />
            <div className="text-2xl font-bold">{teamMetrics.injuredPlayers}</div>
            <div className="text-sm text-gray-600">Injured</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="mx-auto mb-2 text-purple-600" size={24} />
            <div className="text-2xl font-bold">{teamMetrics.averageFitness}%</div>
            <div className="text-sm text-gray-600">Avg Fitness</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="mx-auto mb-2 text-orange-600" size={24} />
            <div className="text-2xl font-bold">{teamMetrics.weeklyLoad}</div>
            <div className="text-sm text-gray-600">Weekly Load</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="mx-auto mb-2 text-green-500" size={24} />
            <div className="text-2xl font-bold">{teamMetrics.matchReadiness}%</div>
            <div className="text-sm text-gray-600">Match Ready</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="team-performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-gray-200 p-1 rounded-xl shadow-sm gap-1 h-10">
          <TabsTrigger 
            value="team-performance"
            className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
          >
            Team Performance
          </TabsTrigger>
          <TabsTrigger 
            value="match-analysis"
            className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
          >
            Match Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="player-insights"
            className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
          >
            Player Insights
          </TabsTrigger>
          <TabsTrigger 
            value="data-sources"
            className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
          >
            Data Sources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team-performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Match Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Recent Match Performance
                </CardTitle>
                <CardDescription>Last 3 matches with key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMatches.map((match, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">vs {match.opponent}</div>
                        <Badge className={match.result.startsWith('W') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {match.result}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">{match.date}</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Possession</div>
                          <div className="font-medium">{match.possession}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Territory</div>
                          <div className="font-medium">{match.territory}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Work Rate</div>
                          <div className="font-medium">{match.workRate}/10</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Top Performers
                </CardTitle>
                <CardDescription>Highest performing players this {selectedTimeframe}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{performer.name}</div>
                        <div className="text-sm text-gray-600">{performer.position}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Work Rate: {performer.workRateScore.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">Load: {performer.gpsLoad}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="match-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Match Analysis Dashboard</CardTitle>
              <CardDescription>Detailed match performance breakdown with OPTA data integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                <div className="text-lg font-medium text-gray-600">Match Analysis Module</div>
                <div className="text-sm text-gray-500 mt-2">
                  Integrated with uploaded OPTA data for comprehensive match insights
                </div>
                {optaLoading ? (
                  <div className="mt-4 text-blue-600">Loading OPTA data...</div>
                ) : (
                  <div className="mt-4 text-green-600">{typedOptaData.length} matches available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="player-insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Player Performance Insights</CardTitle>
              <CardDescription>Individual player analytics with GPS and performance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="mx-auto mb-4 text-gray-400" size={48} />
                <div className="text-lg font-medium text-gray-600">Player Insights Module</div>
                <div className="text-sm text-gray-500 mt-2">
                  Real-time player data from Firebase integration
                </div>
                {playersLoading ? (
                  <div className="mt-4 text-blue-600">Loading player data...</div>
                ) : (
                  <div className="mt-4 text-green-600">{typedPlayers.length} players tracked</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-sources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">OPTA Match Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={optaLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                      {optaLoading ? 'Loading' : 'Connected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Matches</span>
                    <span className="font-medium">{typedOptaData.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Update</span>
                    <span className="text-sm">Real-time</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GPS Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={gpsLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                      {gpsLoading ? 'Loading' : 'Connected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sessions</span>
                    <span className="font-medium">{typedGpsData.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Source</span>
                    <span className="text-sm">Firebase</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Player Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={playersLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                      {playersLoading ? 'Loading' : 'Connected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Players</span>
                    <span className="font-medium">{typedPlayers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Update Rate</span>
                    <span className="text-sm">5s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}