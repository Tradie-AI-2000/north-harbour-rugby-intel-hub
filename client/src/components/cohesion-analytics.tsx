import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, Target, Clock, Award, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, Legend } from "recharts";

interface CohesionAnalyticsProps {
  playerId: string;
  playerName: string;
}

interface TWIData {
  twiScore: number;
  ageDifferential: number;
  experienceDifferential: number;
  ageOfSigning: number;
  averageSquadAge: number;
  internalExperience: number;
  externalExperience: number;
  trend: "increasing" | "decreasing" | "stable";
}

interface CohesionMarkers {
  total: number;
  tight5: number;
  attackSpine: number;
  gaps0to5: number;
  gaps0to10: number;
  zeroGaps: number;
  matchDate: string;
  opponent: string;
  result: "win" | "loss" | "draw";
}

interface PositionGroup {
  name: string;
  positions: number[];
  cohesionStrength: number;
  workingGaps: number;
  players: string[];
}

export default function CohesionAnalytics({ playerId, playerName }: CohesionAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("season");

  const { data: twiData, isLoading: twiLoading } = useQuery({
    queryKey: ['/api/cohesion/twi', playerId],
    enabled: !!playerId,
  });

  const { data: cohesionMarkers, isLoading: markersLoading } = useQuery({
    queryKey: ['/api/cohesion/markers', playerId, selectedTimeframe],
    enabled: !!playerId,
  });

  const { data: positionGroups } = useQuery({
    queryKey: ['/api/cohesion/position-groups', playerId],
    enabled: !!playerId,
  });

  const { data: competitionAverage } = useQuery({
    queryKey: ['/api/cohesion/competition-average'],
  });

  if (twiLoading || markersLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const twi = twiData as TWIData;
  const markers = cohesionMarkers as CohesionMarkers[];
  const groups = positionGroups as PositionGroup[];
  const compAvg = competitionAverage as any;

  const getTWIStatus = (score: number) => {
    if (score >= 40) return { label: "Excellent", color: "bg-green-500", textColor: "text-green-800" };
    if (score >= 30) return { label: "Good", color: "bg-blue-500", textColor: "text-blue-800" };
    if (score >= 20) return { label: "Average", color: "bg-yellow-500", textColor: "text-yellow-800" };
    return { label: "Developing", color: "bg-red-500", textColor: "text-red-800" };
  };

  const getCohesionTrend = (current: number, previous: number) => {
    if (current > previous) return { icon: TrendingUp, color: "text-green-600", label: "Improving" };
    if (current < previous) return { icon: TrendingDown, color: "text-red-600", label: "Declining" };
    return { icon: Target, color: "text-gray-600", label: "Stable" };
  };

  const latestMarkers = markers?.[0];
  const previousMarkers = markers?.[1];
  const status = getTWIStatus(twi?.twiScore || 0);
  const trend = latestMarkers && previousMarkers ? getCohesionTrend(latestMarkers.total, previousMarkers.total) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-nh-navy">Cohesion Analytics</h2>
          <p className="text-gray-600">GAIN LINE Analytics Team Work Index & Key Cohesion Markers</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={selectedTimeframe === "season" ? "default" : "outline"}
            onClick={() => setSelectedTimeframe("season")}
            size="sm"
          >
            Season
          </Button>
          <Button 
            variant={selectedTimeframe === "month" ? "default" : "outline"}
            onClick={() => setSelectedTimeframe("month")}
            size="sm"
          >
            Month
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="twi">Team Work Index</TabsTrigger>
          <TabsTrigger value="markers">Cohesion Markers</TabsTrigger>
          <TabsTrigger value="positions">Position Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">TWI Score</p>
                    <p className="text-2xl font-bold">{twi?.twiScore?.toFixed(1) || '0.0'}%</p>
                    <Badge className={`${status.textColor} bg-opacity-20 mt-1`}>
                      {status.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Team Cohesion</p>
                    <p className="text-2xl font-bold">{latestMarkers?.total || 0}</p>
                    {trend && (
                      <div className={`flex items-center gap-1 mt-1 ${trend.color}`}>
                        <trend.icon className="w-4 h-4" />
                        <span className="text-sm">{trend.label}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Working Gaps</p>
                    <p className="text-2xl font-bold">{latestMarkers?.gaps0to5 || 0}</p>
                    <p className="text-xs text-gray-500">0-5 Gaps</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age Differential</p>
                    <p className="text-2xl font-bold">{twi?.ageDifferential?.toFixed(1) || '0.0'}</p>
                    <p className="text-xs text-gray-500">Years Together</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cohesion Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Season Cohesion Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={markers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="matchDate" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8B1538" 
                    strokeWidth={2}
                    name="Team Total"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tight5" 
                    stroke="#1E3A5F" 
                    strokeWidth={2}
                    name="Tight 5"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attackSpine" 
                    stroke="#FFD700" 
                    strokeWidth={2}
                    name="Attack Spine"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="twi" className="space-y-6">
          {/* TWI Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Work Index Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Age Differential</span>
                    <span className="font-semibold">{twi?.ageDifferential?.toFixed(1) || '0.0'}</span>
                  </div>
                  <Progress value={(twi?.ageDifferential || 0) * 20} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Experience Differential</span>
                    <span className="font-semibold">{twi?.experienceDifferential || 0}</span>
                  </div>
                  <Progress value={Math.max(0, (twi?.experienceDifferential || 0) + 100)} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Internal Experience</span>
                    <span className="font-semibold">{twi?.internalExperience || 0}</span>
                  </div>
                  <Progress value={(twi?.internalExperience || 0) / 10} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Squad Profile Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Average Signing Age</p>
                    <p className="text-2xl font-bold">{twi?.ageOfSigning?.toFixed(1) || '0.0'}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Squad Average Age</p>
                    <p className="text-2xl font-bold">{twi?.averageSquadAge?.toFixed(1) || '0.0'}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Strategy Assessment</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Build Strategy</span>
                      <Progress value={(twi?.internalExperience || 0) * 2} className="flex-1 mx-3 h-2" />
                      <span className="text-sm">Buy Strategy</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Competition Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Competition Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { name: 'Team TWI', value: twi?.twiScore || 0, fill: '#8B1538' },
                  { name: 'Competition Avg', value: compAvg?.averageTWI || 25, fill: '#94A3B8' },
                  { name: 'Top Performer', value: compAvg?.topTWI || 45, fill: '#10B981' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="markers" className="space-y-6">
          {/* Match-by-Match Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>In-Season Cohesion Markers</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={markers?.map(m => ({
                  cohesionStrength: m.total,
                  workingGaps: m.gaps0to5,
                  result: m.result,
                  opponent: m.opponent,
                  date: m.matchDate
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cohesionStrength" name="Cohesion Strength" />
                  <YAxis dataKey="workingGaps" name="Working Gaps" />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-semibold">{data.opponent}</p>
                            <p>Date: {data.date}</p>
                            <p>Cohesion: {data.cohesionStrength}</p>
                            <p>Gaps: {data.workingGaps}</p>
                            <p>Result: {data.result}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter dataKey="cohesionStrength" fill="#8B1538" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gap Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">0-5 Gaps</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-red-600">{latestMarkers?.gaps0to5 || 0}</div>
                <p className="text-sm text-gray-600 mt-2">Critical Gaps</p>
                <Progress value={100 - (latestMarkers?.gaps0to5 || 0)} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">0-10 Gaps</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-orange-600">{latestMarkers?.gaps0to10 || 0}</div>
                <p className="text-sm text-gray-600 mt-2">Moderate Gaps</p>
                <Progress value={100 - (latestMarkers?.gaps0to10 || 0)} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Zero Gaps</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-green-600">{latestMarkers?.zeroGaps || 0}</div>
                <p className="text-sm text-gray-600 mt-2">No Experience</p>
                <Progress value={100 - (latestMarkers?.zeroGaps || 0)} className="mt-3" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          {/* Position Group Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groups?.map((group) => (
              <Card key={group.name}>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Cohesion Strength</span>
                      <span className="text-2xl font-bold">{group.cohesionStrength}</span>
                    </div>
                    <Progress value={group.cohesionStrength / 10} className="h-3" />
                    
                    <div className="flex justify-between items-center">
                      <span>Working Gaps</span>
                      <span className="text-lg font-semibold text-red-600">{group.workingGaps}</span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Key Players:</p>
                      <div className="flex flex-wrap gap-2">
                        {group.players.map((player) => (
                          <Badge key={player} variant="outline">{player}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Formation Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Formation Cohesion Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="inline-block">
                  {/* Rugby formation visualization */}
                  <svg width="400" height="300" viewBox="0 0 400 300" className="border rounded">
                    {/* Forward positions */}
                    <g>
                      <circle cx="50" cy="150" r="15" fill="#8B1538" />
                      <text x="50" y="155" textAnchor="middle" fill="white" fontSize="12">1</text>
                      
                      <circle cx="100" cy="150" r="15" fill="#8B1538" />
                      <text x="100" y="155" textAnchor="middle" fill="white" fontSize="12">2</text>
                      
                      <circle cx="150" cy="150" r="15" fill="#8B1538" />
                      <text x="150" y="155" textAnchor="middle" fill="white" fontSize="12">3</text>
                    </g>
                    
                    {/* Back positions */}
                    <g>
                      <circle cx="250" cy="150" r="15" fill="#1E3A5F" />
                      <text x="250" y="155" textAnchor="middle" fill="white" fontSize="12">9</text>
                      
                      <circle cx="300" cy="150" r="15" fill="#1E3A5F" />
                      <text x="300" y="155" textAnchor="middle" fill="white" fontSize="12">10</text>
                    </g>
                    
                    {/* Connection lines showing cohesion strength */}
                    <line x1="50" y1="150" x2="100" y2="150" stroke="#10B981" strokeWidth="3" />
                    <line x1="100" y1="150" x2="150" y2="150" stroke="#F59E0B" strokeWidth="2" />
                    <line x1="250" y1="150" x2="300" y2="150" stroke="#10B981" strokeWidth="4" />
                  </svg>
                  
                  <div className="mt-4 flex justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-green-500"></div>
                      <span className="text-sm">Strong Connection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-yellow-500"></div>
                      <span className="text-sm">Moderate Connection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-red-500"></div>
                      <span className="text-sm">Weak Connection</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}