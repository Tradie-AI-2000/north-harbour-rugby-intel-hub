import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Users, Target, Award, AlertTriangle, BarChart3, LineChart, PieChart } from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, PieChart as RechartsPieChart, Cell } from "recharts";
import nhLogo from "@assets/menulogo_wo.png";

interface TWIProgression {
  year: string;
  twiScore: number;
  inSeasonCohesion: number;
  competitionAverage: number;
}

interface CohesionGaps {
  zeroGaps: number;
  attackSpineZeroGaps: number;
  defensiveGaps0to5: number;
  competitionPoints: number;
  pointsFor: number;
  pointsAgainst: number;
}

interface SquadProfile {
  ageDifferential: number;
  averageSquadAge: number;
  averageSigningAge: number;
  experienceDifferential: number;
  internalExperience: number;
  externalExperience: number;
}

interface AgeSigningData {
  ageRange: string;
  playerCount: number;
}

interface TenureData {
  tenureYears: string;
  playerCount: number;
}

interface PerformanceCorrelation {
  cohesionScore: number;
  performanceMetric: number;
  matchDate: string;
  opponent: string;
  result: "win" | "loss" | "draw";
}

export default function TeamCohesionDashboard() {
  const [selectedSeason, setSelectedSeason] = useState("2024");
  const [benchmarkTeam, setBenchmarkTeam] = useState("crusaders");

  const { data: twiProgression, isLoading: twiLoading } = useQuery({
    queryKey: ['/api/team/cohesion/twi-progression', selectedSeason],
  });

  const { data: cohesionGaps } = useQuery({
    queryKey: ['/api/team/cohesion/gaps-analysis', selectedSeason],
  });

  const { data: squadProfile } = useQuery({
    queryKey: ['/api/team/cohesion/squad-profile', selectedSeason],
  });

  const { data: ageSigningProfile } = useQuery({
    queryKey: ['/api/team/cohesion/age-signing-profile', selectedSeason],
  });

  const { data: tenureBreakdown } = useQuery({
    queryKey: ['/api/team/cohesion/tenure-breakdown', selectedSeason],
  });

  const { data: performanceCorrelation } = useQuery({
    queryKey: ['/api/team/cohesion/performance-correlation', selectedSeason],
  });

  const { data: squadStability } = useQuery({
    queryKey: ['/api/team/cohesion/squad-stability', selectedSeason],
  });

  const { data: benchmarkData } = useQuery({
    queryKey: ['/api/team/cohesion/benchmark', benchmarkTeam],
  });

  if (twiLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const progression = twiProgression as TWIProgression[];
  const gaps = cohesionGaps as CohesionGaps;
  const profile = squadProfile as SquadProfile;
  const ageProfile = ageSigningProfile as AgeSigningData[];
  const tenure = tenureBreakdown as TenureData[];
  const correlation = performanceCorrelation as PerformanceCorrelation[];
  const stability = squadStability as any;
  const benchmark = benchmarkData as any;

  const currentTWI = progression?.[progression.length - 1]?.twiScore || 0;
  const currentCohesion = progression?.[progression.length - 1]?.inSeasonCohesion || 0;

  const getTWIStatus = (score: number) => {
    if (score >= 40) return { label: "Excellent", color: "bg-green-500", textColor: "text-green-800" };
    if (score >= 30) return { label: "Good", color: "bg-blue-500", textColor: "text-blue-800" };
    if (score >= 20) return { label: "Average", color: "bg-yellow-500", textColor: "text-yellow-800" };
    return { label: "Developing", color: "bg-red-500", textColor: "text-red-800" };
  };

  const status = getTWIStatus(currentTWI);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-nh-red text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={nhLogo} alt="North Harbour Rugby" className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold">Team Cohesion Analytics</h1>
              <p className="text-nh-red-200">GAIN LINE Analytics - Coach Dashboard</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="w-32 bg-white text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Select value={benchmarkTeam} onValueChange={setBenchmarkTeam}>
              <SelectTrigger className="w-40 bg-white text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crusaders">Crusaders</SelectItem>
                <SelectItem value="chiefs">Chiefs</SelectItem>
                <SelectItem value="blues">Blues</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overall Cohesion Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Team Work Index</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentTWI.toFixed(1)}%</div>
              <Badge className={`${status.textColor} bg-opacity-20 mt-2`}>
                {status.label}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">In-Season Cohesion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentCohesion}</div>
              <div className="text-sm text-gray-500 mt-1">Current Score</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Zero Gaps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{gaps?.zeroGaps || 0}</div>
              <div className="text-sm text-gray-500 mt-1">Critical Areas</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Squad Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stability?.changeScore?.toFixed(1) || '0.0'}</div>
              <div className="text-sm text-gray-500 mt-1">Avg per Game</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="gaps">Gaps Analysis</TabsTrigger>
            <TabsTrigger value="profile">Squad Profile</TabsTrigger>
            <TabsTrigger value="correlation">Performance</TabsTrigger>
            <TabsTrigger value="stability">Stability</TabsTrigger>
            <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            {/* Historical Cohesion Trends */}
            <Card>
              <CardHeader>
                <CardTitle>TWI & Cohesion Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsLineChart data={progression}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="twiScore" 
                      stroke="#8B1538" 
                      strokeWidth={3}
                      name="TWI Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="inSeasonCohesion" 
                      stroke="#1E3A5F" 
                      strokeWidth={3}
                      name="In-Season Cohesion"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="competitionAverage" 
                      stroke="#94A3B8" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Competition Average"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gaps" className="space-y-6">
            {/* Cohesion Gaps Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Zero Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-red-600 mb-2">{gaps?.zeroGaps || 0}</div>
                  <p className="text-sm text-gray-600">Players with no shared experience</p>
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-700">
                      High zero gaps indicate limited team understanding and coordination
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    Attack Spine Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-orange-600 mb-2">{gaps?.attackSpineZeroGaps || 0}</div>
                  <p className="text-sm text-gray-600">Critical playmaker connections</p>
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs text-orange-700">
                      Attack spine cohesion is crucial for offensive execution
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Defensive Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{gaps?.defensiveGaps0to5 || 0}</div>
                  <p className="text-sm text-gray-600">0-5 defensive understanding gaps</p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      Lower gaps indicate better defensive coordination
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {/* Squad Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Age of Signing Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ageProfile}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="ageRange" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="playerCount" fill="#8B1538" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      Left-shifted profile indicates better long-term cohesion development
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Internal Tenure Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tenure}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tenureYears" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="playerCount" fill="#1E3A5F" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      Flatter distribution reduces gaps and improves squad transitions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Experience Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile?.ageDifferential?.toFixed(1) || '0.0'}</div>
                    <p className="text-sm text-gray-600">Age Differential</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile?.internalExperience || 0}</div>
                    <p className="text-sm text-gray-600">Internal Experience</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile?.externalExperience || 0}</div>
                    <p className="text-sm text-gray-600">External Experience</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-6">
            {/* Performance Correlation */}
            <Card>
              <CardHeader>
                <CardTitle>Cohesion vs Performance Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={correlation}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohesionScore" name="Cohesion Score" />
                    <YAxis dataKey="performanceMetric" name="Competition Points" />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow">
                              <p className="font-semibold">{data.opponent}</p>
                              <p>Date: {data.matchDate}</p>
                              <p>Cohesion: {data.cohesionScore}</p>
                              <p>Points: {data.performanceMetric}</p>
                              <p>Result: {data.result}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter dataKey="cohesionScore" fill="#8B1538" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stability" className="space-y-6">
            {/* Squad Stability */}
            <Card>
              <CardHeader>
                <CardTitle>Squad Stability Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Change Score Analysis</h4>
                    <div className="text-4xl font-bold mb-2">{stability?.changeScore?.toFixed(2) || '0.00'}</div>
                    <p className="text-sm text-gray-600 mb-4">Average lineup changes per game</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Optimal Range:</span>
                        <span className="text-sm font-medium">0.5 - 1.5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Current Score:</span>
                        <span className="text-sm font-medium">{stability?.changeScore?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Stability Impact</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                          <strong>Low Change Score:</strong> Better cohesion development, consistent understanding
                        </p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>High Change Score:</strong> Disrupted cohesion, limited shared understanding
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benchmark" className="space-y-6">
            {/* Benchmark Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Benchmark Comparison: {benchmarkTeam.charAt(0).toUpperCase() + benchmarkTeam.slice(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">North Harbour Rugby</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-nh-red bg-opacity-10 rounded-lg">
                        <span>TWI Score</span>
                        <span className="font-bold">{currentTWI.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-100 rounded-lg">
                        <span>In-Season Cohesion</span>
                        <span className="font-bold">{currentCohesion}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-100 rounded-lg">
                        <span>Zero Gaps</span>
                        <span className="font-bold">{gaps?.zeroGaps || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-4">{benchmarkTeam.charAt(0).toUpperCase() + benchmarkTeam.slice(1)}</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-green-100 rounded-lg">
                        <span>TWI Score</span>
                        <span className="font-bold">{benchmark?.twiScore?.toFixed(1) || '45.2'}%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-100 rounded-lg">
                        <span>In-Season Cohesion</span>
                        <span className="font-bold">{benchmark?.inSeasonCohesion || 650}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-100 rounded-lg">
                        <span>Zero Gaps</span>
                        <span className="font-bold">{benchmark?.zeroGaps || 3}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">Performance Gap Analysis</h5>
                  <p className="text-sm text-blue-700">
                    {benchmarkTeam.charAt(0).toUpperCase() + benchmarkTeam.slice(1)} demonstrates 
                    significant competitive advantage through superior cohesion metrics. 
                    Focus areas for improvement include reducing zero gaps and increasing 
                    internal experience development.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}