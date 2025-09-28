import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Activity, 
  Users, 
  Target, 
  Shield, 
  Swords, 
  MapPin,
  Brain,
  Eye,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface RealTimeMatchAnalyticsProps {
  matchId: string;
  isLive?: boolean;
}

export default function RealTimeMatchAnalytics({ matchId, isLive = true }: RealTimeMatchAnalyticsProps) {
  const [currentTime, setCurrentTime] = useState(73);
  const [isPlaying, setIsPlaying] = useState(isLive);

  useEffect(() => {
    if (isPlaying && isLive) {
      const interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 60000); // Update every minute for live match
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, isLive]);

  // Live player positioning data for heat map
  const livePlayerPositions = [
    { id: 1, name: "Prop", x: 25, y: 45, intensity: 85, jersey: 1, recent_actions: ["Scrum", "Ruck"] },
    { id: 2, name: "Hooker", x: 30, y: 45, intensity: 92, jersey: 2, recent_actions: ["Lineout", "Ruck", "Tackle"] },
    { id: 3, name: "Prop", x: 35, y: 45, intensity: 78, jersey: 3, recent_actions: ["Scrum", "Maul"] },
    { id: 4, name: "Lock", x: 28, y: 35, intensity: 65, jersey: 4, recent_actions: ["Lineout", "Ruck"] },
    { id: 5, name: "Lock", x: 32, y: 35, intensity: 71, jersey: 5, recent_actions: ["Lineout", "Tackle"] },
    { id: 6, name: "Blindside", x: 40, y: 40, intensity: 88, jersey: 6, recent_actions: ["Tackle", "Ruck", "Carry"] },
    { id: 7, name: "Openside", x: 45, y: 50, intensity: 95, jersey: 7, recent_actions: ["Tackle", "Turnover", "Ruck"] },
    { id: 8, name: "8th Man", x: 35, y: 55, intensity: 82, jersey: 8, recent_actions: ["Carry", "Ruck", "Tackle"] },
    { id: 9, name: "Scrum Half", x: 50, y: 45, intensity: 76, jersey: 9, recent_actions: ["Pass", "Kick", "Ruck"] },
    { id: 10, name: "Fly Half", x: 55, y: 45, intensity: 69, jersey: 10, recent_actions: ["Pass", "Kick", "Tackle"] },
    { id: 11, name: "Left Wing", x: 65, y: 20, intensity: 58, jersey: 11, recent_actions: ["Run", "Tackle"] },
    { id: 12, name: "Inside Centre", x: 60, y: 40, intensity: 74, jersey: 12, recent_actions: ["Pass", "Tackle", "Carry"] },
    { id: 13, name: "Outside Centre", x: 65, y: 50, intensity: 73, jersey: 13, recent_actions: ["Pass", "Tackle", "Run"] },
    { id: 14, name: "Right Wing", x: 70, y: 70, intensity: 61, jersey: 14, recent_actions: ["Run", "Catch"] },
    { id: 15, name: "Full Back", x: 75, y: 45, intensity: 55, jersey: 15, recent_actions: ["Catch", "Kick", "Run"] }
  ];

  // Heat zones based on player activity
  const heatZones = [
    { x: 30, y: 45, radius: 15, intensity: 90, label: "Ruck Area" },
    { x: 50, y: 45, radius: 12, intensity: 75, label: "Breakdown" },
    { x: 25, y: 30, radius: 8, intensity: 85, label: "Lineout" },
    { x: 60, y: 45, radius: 10, intensity: 65, label: "Midfield" }
  ];

  // Enhanced AI-powered heat map data for coaching roles
  const heatMapData = {
    lineoutAnalysis: {
      oppositionThrows: [
        { position: "5m", success: 85, attempts: 12, pattern: "Quick throw to front" },
        { position: "15m", success: 92, attempts: 8, pattern: "Middle pod targeting" },
        { position: "22m", success: 67, attempts: 6, pattern: "Back of lineout throws" }
      ],
      aiInsights: [
        "Opposition struggling with 22m lineout throws (67% success)",
        "Increase pressure on middle pod - highest success rate (92%)",
        "Front ball effectiveness has dropped 18% in second half"
      ]
    },
    kickingPatterns: {
      oppositionKicking: [
        { zone: "Left 22m", frequency: 45, success: 78, avgDistance: 42 },
        { zone: "Center Field", frequency: 38, success: 89, avgDistance: 38 },
        { zone: "Right Touch", frequency: 23, success: 67, avgDistance: 45 }
      ],
      aiRecommendations: [
        "89% of kicks targeting center field - adjust back 3 positioning",
        "Right touch kicks showing 67% success - pressure opportunity",
        "Average kick distance 38m center field - rush defense effective"
      ]
    },
    attackPatterns: {
      oppositionPhases: [
        { phase: "1-3", frequency: 24, successRate: 78, gainLine: 65 },
        { phase: "4-6", frequency: 18, successRate: 62, gainLine: 45 },
        { phase: "7+", frequency: 8, successRate: 33, gainLine: 22 }
      ],
      weaknesses: [
        "Phase 7+ success drops to 33% - force extended phases",
        "Gain line success 22% after phase 7 - defensive opportunity",
        "Right side attack 28% less effective than left side"
      ]
    },
    defensivePatterns: {
      lineSpeed: [
        { minute: 65, speed: 88, accuracy: 92 },
        { minute: 70, speed: 85, accuracy: 89 },
        { minute: 75, speed: 82, accuracy: 85 }
      ],
      aiAlerts: [
        "Line speed dropping 6% over last 10 minutes",
        "Accuracy down to 85% - fatigue factor detected",
        "Right wing channel showing defensive gaps"
      ]
    }
  };

  // Role-specific live tactical data
  const tacticalliveData = {
    forwardsCoach: {
      scrumDominance: 78,
      lineoutSuccess: 89,
      alerts: [
        "Scrum pressure advantage - use platform for attack",
        "Lineout throwing accuracy 89% - maintain rhythm",
        "Opposition hooker tired - target lineout pressure"
      ]
    },
    backsCoach: {
      passingAccuracy: 84,
      linebreaks: 7,
      alerts: [
        "Passing accuracy 84% - maintain ball speed",
        "7 line breaks achieved - continue wide attacks",
        "Opposition 13 channel showing weakness"
      ]
    },
    defensiveCoach: {
      tackleSuccess: 91,
      turnoversBon: 4,
      alerts: [
        "Tackle success 91% - excellent defensive work",
        "4 turnovers won - continue breakdown pressure",
        "Line speed coordination critical next 10 minutes"
      ]
    }
  };

  // Set piece analysis data
  const setPlayAnalysis = {
    scrumStats: {
      own: { won: 8, lost: 2 },
      opposition: { won: 6, lost: 4 },
      aiInsights: [
        "Scrum dominance 80% - use as attacking platform",
        "Opposition struggling with hooker accuracy",
        "Tight head prop showing fatigue - maintain pressure"
      ]
    },
    lineoutStats: {
      own: { won: 12, lost: 1 },
      opposition: { won: 8, lost: 5 }
    }
  };

  // Tactical analysis data for attack and defence
  const tacticalAnalysis = {
    defence: {
      lineoutDefence: {
        successRate: 78,
        weaknesses: [
          "Middle pod targeting showing 67% success against us",
          "Quick lineout throws causing defensive line issues",
          "Back lineout lifting inconsistent under pressure"
        ],
        recommendations: [
          "Increase pressure on opposition hooker",
          "Adjust middle pod defensive positioning",
          "Focus on disrupting lifting pods early"
        ]
      },
      scrumDefence: {
        patterns: [
          "Opposition favoring right side off scrum (72%)",
          "Blind side attacks 43% success rate",
          "Scrum half taking quick ball 68% of time"
        ],
        weaknesses: [
          "Right flank coverage showing gaps",
          "Slow line speed off defensive scrums",
          "Missing tackles on scrum half breaks"
        ]
      }
    },
    attack: {
      lineoutTrends: {
        opponentPatterns: [
          "Front ball 85% success but predictable timing",
          "Middle pod throws accurate but slow ball",
          "Back ball 67% success - opportunity for pressure"
        ],
        opportunities: [
          "Target 22m lineouts - lowest success rate",
          "Quick lineout options when available",
          "Maul opportunities off middle ball"
        ]
      },
      tacticalKicking: {
        analysis: [
          "Box kicks 78% effective in opposition 22m",
          "Cross field kicks finding space right side",
          "Up and unders working against fullback"
        ]
      },
      attackPatterns: {
        fromScrum: [
          "Right side attacks 67% gain line success",
          "Blind side options effective with overlap",
          "Quick ball crucial - target 3 second delivery"
        ]
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Match Timer and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Live Match Analytics</h2>
          <Badge variant={isLive ? "default" : "secondary"}>
            {isLive ? "LIVE" : "REPLAY"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-lg font-mono bg-nh-red text-white px-3 py-1 rounded">
            {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live">Live Performance</TabsTrigger>
          <TabsTrigger value="defence">AI Defence Analysis</TabsTrigger>
          <TabsTrigger value="attack">AI Attack Analysis</TabsTrigger>
          <TabsTrigger value="heatmap">Live Heat Map</TabsTrigger>
        </TabsList>

        {/* Live Performance Tab */}
        <TabsContent value="live" className="space-y-6">
          {/* Live metrics and player performance cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-nh-red" />
                  Live Player Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {livePlayerPositions.slice(0, 5).map((player) => (
                    <div key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-nh-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {player.jersey}
                        </div>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-gray-600">{player.recent_actions[0]}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{player.intensity}%</div>
                        <div className="text-xs text-gray-500">Activity</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Match Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Possession</span>
                    <span className="font-bold">58%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Territory</span>
                    <span className="font-bold">62%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Line Breaks</span>
                    <span className="font-bold">7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Turnovers Won</span>
                    <span className="font-bold">4</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                  AI Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded border-l-4 border-amber-400">
                    <p className="font-medium text-amber-800">Fatigue Alert</p>
                    <p className="text-sm text-amber-700">
                      Forward pack showing 12% drop in intensity. Consider rotation.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                    <p className="font-medium text-green-800">Tactical Opportunity</p>
                    <p className="text-sm text-green-700">
                      Opposition lineout 67% success on 22m. Increase pressure.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Defence Analysis */}
        <TabsContent value="defence" className="space-y-6">
          <Card className="border-2 border-purple-500 bg-purple-50">
            <CardContent className="p-4 text-center">
              <Target className="mx-auto mb-2 text-purple-600" size={24} />
              <div className="font-bold text-sm">Defence Coach Analytics</div>
              <div className="text-xs text-gray-600">Line Speed & Structure Analysis</div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  Live Defensive Line Speed
                </CardTitle>
                <div className="text-sm text-gray-600">Real-time tracking with AI alerts</div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={heatMapData.defensivePatterns.lineSpeed}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="minute" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="speed" stroke="#DC2626" strokeWidth={2} />
                      <Line type="monotone" dataKey="accuracy" stroke="#059669" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 space-y-2">
                  {heatMapData.defensivePatterns.aiAlerts.map((alert, index) => (
                    <div key={index} className="p-2 bg-amber-50 rounded border-l-4 border-amber-400">
                      <div className="text-sm text-amber-800">⚠️ {alert}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  AI Defence Insights
                </CardTitle>
                <div className="text-sm text-gray-600">Real-time tactical recommendations</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded">
                      <div className="text-2xl font-bold text-red-600">{tacticalliveData.defensiveCoach.tackleSuccess}%</div>
                      <div className="text-xs text-gray-600">Tackle Success</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-2xl font-bold text-purple-600">{tacticalliveData.defensiveCoach.turnoversBon}</div>
                      <div className="text-xs text-gray-600">Turnovers Won</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {tacticalliveData.defensiveCoach.alerts.map((alert, index) => (
                      <div key={index} className="text-sm p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                        {alert}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-nh-red" />
                  Lineout Defence Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-2xl font-bold text-nh-red">{tacticalAnalysis.defence.lineoutDefence.successRate}%</span>
                </div>

                <div>
                  <h4 className="font-medium text-red-800 mb-2">⚠️ Identified Weaknesses</h4>
                  <ul className="space-y-2">
                    {tacticalAnalysis.defence.lineoutDefence.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm p-2 bg-red-50 rounded border-l-4 border-red-400">
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-green-800 mb-2">💡 AI Recommendations</h4>
                  <ul className="space-y-2">
                    {tacticalAnalysis.defence.lineoutDefence.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm p-2 bg-green-50 rounded border-l-4 border-green-400">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-nh-red" />
                  Scrum Defence Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">📊 Opposition Patterns</h4>
                  <ul className="space-y-2">
                    {tacticalAnalysis.defence.scrumDefence.patterns.map((pattern, index) => (
                      <li key={index} className="text-sm p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-red-800 mb-2">🎯 Defensive Gaps</h4>
                  <ul className="space-y-2">
                    {tacticalAnalysis.defence.scrumDefence.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm p-2 bg-red-50 rounded border-l-4 border-red-400">
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Attack Analysis */}
        <TabsContent value="attack" className="space-y-6">
          <Card className="border-2 border-green-500 bg-green-50">
            <CardContent className="p-4 text-center">
              <Swords className="mx-auto mb-2 text-green-600" size={24} />
              <div className="font-bold text-sm">Backs Coach Analytics</div>
              <div className="text-xs text-gray-600">Attack Patterns & Opportunities</div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Opposition Lineout Analysis
                </CardTitle>
                <div className="text-sm text-gray-600">AI Analysis: Throw Success Patterns</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {heatMapData.lineoutAnalysis.oppositionThrows.map((throw_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${
                          throw_.success >= 90 ? 'bg-red-500' :
                          throw_.success >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <div className="font-medium">{throw_.position} Line</div>
                          <div className="text-xs text-gray-600">{throw_.pattern}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{throw_.success}%</div>
                        <div className="text-xs text-gray-500">{throw_.attempts} throws</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">AI Insights</h4>
                  <ul className="space-y-1">
                    {heatMapData.lineoutAnalysis.aiInsights.map((insight, index) => (
                      <li key={index} className="text-sm text-blue-700">• {insight}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-green-600" />
                  AI Attack Insights
                </CardTitle>
                <div className="text-sm text-gray-600">Real-time tactical recommendations</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">{tacticalliveData.backsCoach.passingAccuracy}%</div>
                      <div className="text-xs text-gray-600">Passing Accuracy</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <div className="text-2xl font-bold text-yellow-600">{tacticalliveData.backsCoach.linebreaks}</div>
                      <div className="text-xs text-gray-600">Line Breaks</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {tacticalliveData.backsCoach.alerts.map((alert, index) => (
                      <div key={index} className="text-sm p-2 bg-green-50 rounded border-l-4 border-green-400">
                        {alert}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-nh-red" />
                  Opposition Lineout Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">📈 Patterns Identified</h4>
                  <ul className="space-y-2">
                    {tacticalAnalysis.attack.lineoutTrends.opponentPatterns.map((pattern, index) => (
                      <li key={index} className="text-sm p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-green-800 mb-2">🎯 Attack Opportunities</h4>
                  <ul className="space-y-2">
                    {tacticalAnalysis.attack.lineoutTrends.opportunities.map((opp, index) => (
                      <li key={index} className="text-sm p-2 bg-green-50 rounded border-l-4 border-green-400">
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Swords className="h-5 w-5 mr-2 text-nh-red" />
                  Tactical Kicking Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-purple-800 mb-2">🥾 Kicking Intelligence</h4>
                  <ul className="space-y-2">
                    {tacticalAnalysis.attack.tacticalKicking.analysis.map((insight, index) => (
                      <li key={index} className="text-sm p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-orange-800 mb-2">🏃‍♂️ Attack Patterns from Scrum</h4>
                  <ul className="space-y-2">
                    {tacticalAnalysis.attack.attackPatterns.fromScrum.map((pattern, index) => (
                      <li key={index} className="text-sm p-2 bg-orange-50 rounded border-l-4 border-orange-400">
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Heat Map */}
        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-nh-red" />
                Live Player Positioning Heat Map
              </CardTitle>
              <div className="text-sm text-gray-600">Real-time player tracking with activity intensity</div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-green-200 rounded-lg p-8 min-h-[500px]">
                <div className="absolute inset-4 border-4 border-white rounded bg-green-100">
                  {/* Rugby field representation */}
                  <div className="w-full h-full relative overflow-hidden">
                    {/* Field markings */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-white"></div>
                    <div className="absolute top-1/4 left-0 right-0 h-px bg-white opacity-70"></div>
                    <div className="absolute top-3/4 left-0 right-0 h-px bg-white opacity-70"></div>
                    <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white opacity-50"></div>
                    <div className="absolute left-3/4 top-0 bottom-0 w-px bg-white opacity-50"></div>
                    
                    {/* Heat zones (background) */}
                    {heatZones.map((zone, index) => (
                      <div
                        key={index}
                        className="absolute rounded-full opacity-30"
                        style={{
                          left: `${zone.x}%`,
                          top: `${zone.y}%`,
                          width: `${zone.radius * 2}px`,
                          height: `${zone.radius * 2}px`,
                          backgroundColor: zone.intensity >= 85 ? '#ef4444' : zone.intensity >= 70 ? '#f59e0b' : '#10b981',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
                          {zone.label}
                        </div>
                      </div>
                    ))}
                    
                    {/* Player positions with intensity */}
                    {livePlayerPositions.map((player) => (
                      <div
                        key={player.id}
                        className="absolute group cursor-pointer"
                        style={{
                          left: `${player.x}%`,
                          top: `${player.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg ${
                            player.intensity >= 85 ? 'bg-red-500' :
                            player.intensity >= 70 ? 'bg-yellow-500' : 
                            player.intensity >= 55 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                        >
                          {player.jersey}
                        </div>
                        
                        {/* Player tooltip */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white p-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          <div className="font-bold">{player.name} ({player.jersey})</div>
                          <div>Intensity: {player.intensity}%</div>
                          <div>Recent: {player.recent_actions.slice(0, 2).join(', ')}</div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Field labels */}
                    <div className="absolute top-2 left-2 text-xs font-bold text-gray-700">North Harbour Try Line</div>
                    <div className="absolute bottom-2 right-2 text-xs font-bold text-gray-700">Opposition Try Line</div>
                    <div className="absolute top-1/2 left-2 transform -translate-y-1/2 text-xs font-bold text-gray-700 rotate-90">Halfway</div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span>High Activity (85%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span>Medium Activity (70-84%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span>Moderate Activity (55-69%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>Low Activity (Below 55%)</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Most Active Players</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {livePlayerPositions
                        .sort((a, b) => b.intensity - a.intensity)
                        .slice(0, 5)
                        .map((player, index) => (
                        <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-nh-red text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {player.jersey}
                            </div>
                            <div>
                              <div className="font-medium">{player.name}</div>
                              <div className="text-xs text-gray-600">{player.recent_actions[0]}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{player.intensity}%</div>
                            <div className="text-xs text-gray-500">Activity</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Heat Zone Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {heatZones.map((zone, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${
                              zone.intensity >= 85 ? 'bg-red-500' : 
                              zone.intensity >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                            <div>
                              <div className="font-medium">{zone.label}</div>
                              <div className="text-xs text-gray-600">High contact area</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{zone.intensity}%</div>
                            <div className="text-xs text-gray-500">Intensity</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}