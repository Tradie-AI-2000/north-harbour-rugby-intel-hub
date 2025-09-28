import { useState } from "react";
import { Users, TrendingUp, Award, Target, BarChart3, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import type { Player } from "@shared/schema";

interface PlayerComparisonProps {
  playerId: string;
  player?: Player;
}

export default function PlayerComparison({ playerId, player }: PlayerComparisonProps) {
  const [comparisonPlayer, setComparisonPlayer] = useState<string>("");
  const [benchmarkType, setBenchmarkType] = useState<string>("position");

  if (!player) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500">No comparison data available</p>
      </div>
    );
  }

  // Sample players for comparison
  const availablePlayers = [
    { id: "player-2", name: "Sam Wilson", position: "Hooker" },
    { id: "player-3", name: "Mike Davis", position: "Hooker" },
    { id: "player-4", name: "Tom Brown", position: "Lock" },
    { id: "player-5", name: "Jack Taylor", position: "Flanker" },
  ];

  // Sample comparison data
  const skillsComparison = [
    { skill: 'Lineout Throwing', player1: 92, player2: 85, benchmark: 80 },
    { skill: 'Scrum Technique', player1: 88, player2: 90, benchmark: 82 },
    { skill: 'Ball Handling', player1: 84, player2: 87, benchmark: 75 },
    { skill: 'Passing', player1: 89, player2: 82, benchmark: 78 },
    { skill: 'Rucking', player1: 86, player2: 88, benchmark: 81 },
    { skill: 'Defense', player1: 91, player2: 85, benchmark: 83 },
  ];

  const physicalComparison = [
    { metric: 'Speed (km/h)', player1: 28.5, player2: 27.2, benchmark: 26.8 },
    { metric: 'Endurance (km)', player1: 9.2, player2: 8.8, benchmark: 8.5 },
    { metric: 'Strength (kg)', player1: 145, player2: 152, benchmark: 140 },
    { metric: 'Agility (s)', player1: 4.2, player2: 4.5, benchmark: 4.8 },
  ];

  const performanceTrends = [
    { month: 'Jan', player1: 82, player2: 78, benchmark: 75 },
    { month: 'Feb', player1: 85, player2: 80, benchmark: 76 },
    { month: 'Mar', player1: 87, player2: 83, benchmark: 77 },
    { month: 'Apr', player1: 89, player2: 85, benchmark: 78 },
    { month: 'May', player1: 92, player2: 87, benchmark: 79 },
  ];

  const benchmarkData = {
    position: {
      name: "Hooker Position Benchmark",
      stats: [
        { metric: "Lineout Success", value: 85, playerValue: 92, unit: "%" },
        { metric: "Scrum Stability", value: 82, playerValue: 88, unit: "%" },
        { metric: "Tackles per Game", value: 12, playerValue: 15, unit: "" },
        { metric: "Carries per Game", value: 8, playerValue: 11, unit: "" },
        { metric: "Meters Gained", value: 45, playerValue: 67, unit: "m" },
      ]
    },
    team: {
      name: "North Harbour Team Average",
      stats: [
        { metric: "Fitness Score", value: 78, playerValue: 89, unit: "/100" },
        { metric: "Skills Rating", value: 76, playerValue: 87, unit: "/100" },
        { metric: "Leadership", value: 72, playerValue: 94, unit: "/100" },
        { metric: "Game Impact", value: 74, playerValue: 89, unit: "/100" },
      ]
    },
    league: {
      name: "NPC League Standard",
      stats: [
        { metric: "Professional Rating", value: 72, playerValue: 89, unit: "/100" },
        { metric: "Match Performance", value: 68, playerValue: 85, unit: "/100" },
        { metric: "Consistency", value: 70, playerValue: 87, unit: "/100" },
        { metric: "Development Rate", value: 65, playerValue: 82, unit: "/100" },
      ]
    }
  };

  const selectedPlayer = availablePlayers.find(p => p.id === comparisonPlayer);
  const currentBenchmark = benchmarkData[benchmarkType as keyof typeof benchmarkData];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-nh-navy">Player Comparison & Benchmarking</h2>
          <p className="text-slate-600">Compare performance against teammates and industry standards</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Compare with Player
          </label>
          <Select value={comparisonPlayer} onValueChange={setComparisonPlayer}>
            <SelectTrigger>
              <SelectValue placeholder="Select a player to compare" />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.position})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Benchmark Type
          </label>
          <Select value={benchmarkType} onValueChange={setBenchmarkType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="position">Position Average</SelectItem>
              <SelectItem value="team">Team Average</SelectItem>
              <SelectItem value="league">League Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-gray-200 p-1 rounded-xl shadow-sm gap-1 h-10">
          <TabsTrigger 
            value="skills"
            className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
          >
            Skills Comparison
          </TabsTrigger>
          <TabsTrigger 
            value="physical"
            className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
          >
            Physical Metrics
          </TabsTrigger>
          <TabsTrigger 
            value="benchmarks"
            className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
          >
            Benchmarks
          </TabsTrigger>
          <TabsTrigger 
            value="trends"
            className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
          >
            Performance Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-6">
          {comparisonPlayer ? (
            <>
              {/* Player vs Player Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-nh-blue rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">
                          {player.personalDetails.firstName[0]}{player.personalDetails.lastName[0]}
                        </span>
                      </div>
                      <h3 className="font-bold text-nh-navy">
                        {player.personalDetails.firstName} {player.personalDetails.lastName}
                      </h3>
                      <p className="text-slate-600">{player.rugbyProfile.primaryPosition}</p>
                      <Badge className="bg-nh-blue text-white mt-2">Current Player</Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">
                          {selectedPlayer?.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <h3 className="font-bold text-nh-navy">{selectedPlayer?.name}</h3>
                      <p className="text-slate-600">{selectedPlayer?.position}</p>
                      <Badge variant="outline" className="mt-2">Comparison</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-nh-blue" />
                    Skills Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={skillsComparison}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar 
                        name={`${player.personalDetails.firstName} ${player.personalDetails.lastName}`} 
                        dataKey="player1" 
                        stroke="#1f2937" 
                        fill="#3b82f6" 
                        fillOpacity={0.3} 
                        strokeWidth={2} 
                      />
                      <Radar 
                        name={selectedPlayer?.name} 
                        dataKey="player2" 
                        stroke="#ef4444" 
                        fill="#ef4444" 
                        fillOpacity={0.2} 
                        strokeWidth={2} 
                      />
                      <Radar 
                        name="Benchmark" 
                        dataKey="benchmark" 
                        stroke="#10b981" 
                        fill="transparent" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Detailed Skills Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Skills Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillsComparison.map((skill, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="font-medium text-nh-navy">{skill.skill}</div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-nh-blue">{skill.player1}</div>
                          <div className="text-xs text-slate-600">You</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-600">{skill.player2}</div>
                          <div className="text-xs text-slate-600">{selectedPlayer?.name.split(' ')[0]}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{skill.benchmark}</div>
                          <div className="text-xs text-slate-600">Benchmark</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-nh-navy mb-2">Select a Player to Compare</h3>
                <p className="text-slate-600">Choose a teammate from the dropdown above to see detailed comparisons</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="physical" className="space-y-6">
          {comparisonPlayer ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-nh-blue" />
                    Physical Performance Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={physicalComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="player1" fill="#3b82f6" name={`${player.personalDetails.firstName} ${player.personalDetails.lastName}`} />
                      <Bar dataKey="player2" fill="#ef4444" name={selectedPlayer?.name} />
                      <Bar dataKey="benchmark" fill="#10b981" name="Benchmark" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {physicalComparison.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 text-center">
                      <h4 className="font-medium text-nh-navy mb-3">{metric.metric}</h4>
                      <div className="space-y-2">
                        <div className="p-2 bg-blue-50 rounded">
                          <div className="text-lg font-bold text-nh-blue">{metric.player1}</div>
                          <div className="text-xs text-slate-600">You</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded">
                          <div className="text-lg font-bold text-slate-600">{metric.player2}</div>
                          <div className="text-xs text-slate-600">{selectedPlayer?.name.split(' ')[0]}</div>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <div className="text-lg font-bold text-green-600">{metric.benchmark}</div>
                          <div className="text-xs text-slate-600">Benchmark</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-nh-navy mb-2">Physical Metrics Comparison</h3>
                <p className="text-slate-600">Select a player to compare physical performance metrics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-nh-blue" />
                {currentBenchmark.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentBenchmark.stats.map((stat, index) => {
                  const percentage = ((stat.playerValue - stat.value) / stat.value) * 100;
                  const isAbove = percentage > 0;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-nh-navy">{stat.metric}</h4>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="text-center">
                            <div className="text-lg font-bold text-nh-blue">{stat.playerValue}{stat.unit}</div>
                            <div className="text-xs text-slate-600">Your Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-slate-600">{stat.value}{stat.unit}</div>
                            <div className="text-xs text-slate-600">Benchmark</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={isAbove ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {isAbove ? "+" : ""}{percentage.toFixed(1)}%
                        </Badge>
                        <div className="text-xs text-slate-600 mt-1">
                          {isAbove ? "Above" : "Below"} benchmark
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-nh-blue" />
                Performance Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="player1" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    name={`${player.personalDetails.firstName} ${player.personalDetails.lastName}`}
                  />
                  {comparisonPlayer && (
                    <Line 
                      type="monotone" 
                      dataKey="player2" 
                      stroke="#ef4444" 
                      strokeWidth={3} 
                      name={selectedPlayer?.name}
                    />
                  )}
                  <Line 
                    type="monotone" 
                    dataKey="benchmark" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    name="Benchmark"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 text-green-600" />
                <div className="text-2xl font-bold text-nh-navy">+7.2%</div>
                <div className="text-sm text-slate-600">Performance Growth</div>
                <div className="text-xs text-green-600 mt-1">vs last month</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 mx-auto mb-3 text-nh-blue" />
                <div className="text-2xl font-bold text-nh-navy">#2</div>
                <div className="text-sm text-slate-600">Team Ranking</div>
                <div className="text-xs text-nh-blue mt-1">in position</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                <div className="text-2xl font-bold text-nh-navy">92%</div>
                <div className="text-sm text-slate-600">Goal Achievement</div>
                <div className="text-xs text-purple-600 mt-1">this season</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}