import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ScatterChart,
  Scatter
} from "recharts";
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Target,
  Activity,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Clock,
  Home,
  Plane,
  Zap,
  Shield,
  GitBranch
} from "lucide-react";

// Game Day Cohesion Data Structure based on technical instructions
interface GameDayCohesionData {
  gameId: string;
  date: string;
  opponent: string;
  homeAway: "HOME" | "AWAY";
  venue: string;
  predictedOutcome: string;
  teamPerformance: {
    northHarbour: {
      cohesionMarkers: {
        TWI_Tight5: number;
        TWI_AttackSpine: number;
        games: number;
        TRS: number;
        totalTight5: number;
        totalAttackSpine: number;
        totalTeam: number;
        recency: number;
        gaps_0_5: number;
        gaps_0_10: number;
        gaps_0_Tight5: number;
        gaps_0_AttackSpine: number;
        gaps_0_Team: number;
        cScore: number;
      };
      markerProgression: {
        totalTeamCohesion: string;
        defensiveGaps: string;
        cScoreImpact: string;
        gapsTracking: string;
      };
      heatMapRelationships: Array<{
        unit: string;
        players: string[];
        strength: "Weak" | "Moderate" | "Good" | "Strong";
      }>;
    };
    opponent: {
      cohesionMarkers: {
        TWI_Tight5: number | null;
        TWI_AttackSpine: number | null;
        games: number;
        TRS: number;
        totalTight5: number;
        totalAttackSpine: number;
        totalTeam: number;
        recency: number;
        gaps_0_5: number;
        gaps_0_10: number;
        gaps_0_Tight5: number;
        gaps_0_AttackSpine: number;
        gaps_0_Team: number;
      };
      heatMapRelationships: Array<{
        unit: string;
        players: string[];
        strength: "Weak" | "Moderate" | "Good" | "Strong";
      }>;
    };
  };
  gameProgressionData: Array<{
    gameNum: number;
    totalCohesion: number;
    recencyCohesion: number;
    gaps_0_5: number;
    gaps_0_10: number;
    gaps_0: number;
    cScore: number;
  }>;
  aiInsights: {
    gameSummary: string;
    keyStrengths: string[];
    vulnerabilities: string[];
    recommendations: string[];
    drillSuggestions: string[];
  };
}

// Sample game data based on the technical instructions format
const getGameData = (gameId: string): GameDayCohesionData => {
  return {
    gameId: `NPC_2025_RD${gameId}`,
    date: "2025-08-01",
    opponent: "Manawatū",
    homeAway: "AWAY",
    venue: "Central Energy Trust Arena",
    predictedOutcome: "Close Contest",
    teamPerformance: {
      northHarbour: {
        cohesionMarkers: {
          TWI_Tight5: 18.45,
          TWI_AttackSpine: 22.34,
          games: 734,
          TRS: 1125,
          totalTight5: 28,
          totalAttackSpine: 65,
          totalTeam: 389,
          recency: 278,
          gaps_0_5: 68,
          gaps_0_10: 89,
          gaps_0_Tight5: 4,
          gaps_0_AttackSpine: 9,
          gaps_0_Team: 22,
          cScore: 4.2
        },
        markerProgression: {
          totalTeamCohesion: "Positive development - strong pre-season integration with key combinations maintained from previous season",
          defensiveGaps: "Moderate gaps identified in defensive transitions - focus area for early season preparation",
          cScoreImpact: "C-Score slightly above optimal due to two new signings integration - expected to improve by Round 3",
          gapsTracking: "0-5 Gaps tracking within acceptable range for season opener - emphasis on quick phase play communication"
        },
        heatMapRelationships: [
          { unit: "Tight 5", players: ["1-2-3", "4-5"], strength: "Good" },
          { unit: "Attack Spine", players: ["9-10", "12-13"], strength: "Strong" },
          { unit: "Back 3", players: ["11-14-15"], strength: "Moderate" }
        ]
      },
      opponent: {
        cohesionMarkers: {
          TWI_Tight5: 16.2,
          TWI_AttackSpine: 19.8,
          games: 542,
          TRS: 1456,
          totalTight5: 31,
          totalAttackSpine: 158,
          totalTeam: 523,
          recency: 387,
          gaps_0_5: 78,
          gaps_0_10: 95,
          gaps_0_Tight5: 6,
          gaps_0_AttackSpine: 12,
          gaps_0_Team: 18
        },
        heatMapRelationships: [
          { unit: "Tight 5", players: ["1-2-3", "4-5"], strength: "Moderate" },
          { unit: "Attack Spine", players: ["9-10", "12-13"], strength: "Good" },
          { unit: "Back 3", players: ["11-14-15"], strength: "Weak" }
        ]
      }
    },
    gameProgressionData: [
      { gameNum: 1, totalCohesion: 389, recencyCohesion: 278, gaps_0_5: 68, gaps_0_10: 89, gaps_0: 22, cScore: 4.2 }
    ],
    aiInsights: {
      gameSummary: "North Harbour enters Round 1 with solid cohesion markers despite two new signings. The Attack Spine shows exceptional relationship strength while the Tight 5 maintains good continuity from last season.",
      keyStrengths: [
        "Attack Spine (9-10-12-13) showing strong cohesion - leverage for structured play",
        "Tight 5 continuity from previous season provides set-piece stability",
        "Overall TWI markers above NPC average for season openers"
      ],
      vulnerabilities: [
        "Back 3 cohesion moderate due to new fullback integration",
        "C-Score above optimal indicating adjustment period for new combinations",
        "0-5 Defensive Gaps slightly elevated in transition phases"
      ],
      recommendations: [
        "Focus on quick phase play to exploit Attack Spine strength",
        "Target Manawatū's weaker Back 3 relationships with kicks and aerial contests",
        "Emphasize set-piece dominance leveraging Tight 5 cohesion advantage"
      ],
      drillSuggestions: [
        "Back 3 communication drills for defensive positioning",
        "9-10-12 quick phase transition patterns",
        "Lineout variation practice targeting opposition weaknesses"
      ]
    }
  };
};

interface CohesionHeatMapProps {
  relationships: Array<{
    unit: string;
    players: string[];
    strength: "Weak" | "Moderate" | "Good" | "Strong";
  }>;
  team: string;
}

const CohesionHeatMap = ({ relationships, team }: CohesionHeatMapProps) => {
  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "Strong": return "#10B981";
      case "Good": return "#3B82F6";
      case "Moderate": return "#F59E0B";
      case "Weak": return "#EF4444";
      default: return "#6B7280";
    }
  };

  const getStrengthScore = (strength: string) => {
    switch (strength) {
      case "Strong": return 4;
      case "Good": return 3;
      case "Moderate": return 2;
      case "Weak": return 1;
      default: return 0;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          {team} Unit Cohesion Heat Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relationships.map((relationship, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getStrengthColor(relationship.strength) }}
                />
                <div>
                  <div className="font-medium">{relationship.unit}</div>
                  <div className="text-sm text-gray-500">{relationship.players.join(", ")}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  style={{ 
                    borderColor: getStrengthColor(relationship.strength),
                    color: getStrengthColor(relationship.strength)
                  }}
                >
                  {relationship.strength}
                </Badge>
                <div className="w-20">
                  <Progress 
                    value={getStrengthScore(relationship.strength) * 25} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface CohesionRadarProps {
  northHarbour: GameDayCohesionData['teamPerformance']['northHarbour']['cohesionMarkers'];
  opponent: GameDayCohesionData['teamPerformance']['opponent']['cohesionMarkers'];
  opponentName: string;
}

const CohesionRadar = ({ northHarbour, opponent, opponentName }: CohesionRadarProps) => {
  const radarData = [
    {
      metric: 'TWI Tight5',
      northHarbour: northHarbour.TWI_Tight5,
      opponent: opponent.TWI_Tight5 || 0,
    },
    {
      metric: 'TWI Attack',
      northHarbour: northHarbour.TWI_AttackSpine,
      opponent: opponent.TWI_AttackSpine || 0,
    },
    {
      metric: 'Total Team',
      northHarbour: Math.min(northHarbour.totalTeam / 10, 50), // Scale for radar
      opponent: Math.min(opponent.totalTeam / 10, 50),
    },
    {
      metric: 'Recency',
      northHarbour: Math.min(northHarbour.recency / 10, 50),
      opponent: Math.min(opponent.recency / 10, 50),
    },
    {
      metric: 'Gap Efficiency',
      northHarbour: Math.max(0, 50 - northHarbour.gaps_0_Team),
      opponent: Math.max(0, 50 - opponent.gaps_0_Team),
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Cohesion Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 50]} />
              <Radar
                name="North Harbour"
                dataKey="northHarbour"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
              <Radar
                name={opponentName}
                dataKey="opponent"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default function GameDayAnalysis() {
  const [match, params] = useRoute("/game-day/:id");
  const gameId = params?.id || "1";
  const [gameData, setGameData] = useState<GameDayCohesionData | null>(null);

  useEffect(() => {
    // Load game data based on ID
    const data = getGameData(gameId);
    setGameData(data);
  }, [gameId]);

  if (!gameData) {
    return <div>Loading game analysis...</div>;
  }

  const handleBackToFixtures = () => {
    window.location.href = "/team-cohesion";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToFixtures}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fixtures
          </Button>
        </div>

        {/* Game Info Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold">North Harbour vs {gameData.opponent}</h1>
                  <Badge variant={gameData.homeAway === "HOME" ? "default" : "secondary"}>
                    {gameData.homeAway === "HOME" ? <Home className="h-3 w-3 mr-1" /> : <Plane className="h-3 w-3 mr-1" />}
                    {gameData.homeAway}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{gameData.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{gameData.venue}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">AI Prediction</div>
                <div className="text-lg font-semibold">{gameData.predictedOutcome}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different analysis views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cohesion">Cohesion Analysis</TabsTrigger>
            <TabsTrigger value="comparison">Team Comparison</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Cohesion Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">TWI Tight 5</p>
                      <p className="text-2xl font-bold">{gameData.teamPerformance.northHarbour.cohesionMarkers.TWI_Tight5}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">TWI Attack Spine</p>
                      <p className="text-2xl font-bold">{gameData.teamPerformance.northHarbour.cohesionMarkers.TWI_AttackSpine}</p>
                    </div>
                    <Zap className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">C-Score</p>
                      <p className="text-2xl font-bold">{gameData.teamPerformance.northHarbour.cohesionMarkers.cScore}</p>
                      <p className="text-xs text-gray-500">Target: {"<"}3.0</p>
                    </div>
                    <Activity className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">0-5 Gaps</p>
                      <p className="text-2xl font-bold">{gameData.teamPerformance.northHarbour.cohesionMarkers.gaps_0_5}</p>
                      <p className="text-xs text-gray-500">Lower is better</p>
                    </div>
                    <Shield className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Cohesion Heat Maps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CohesionHeatMap 
                relationships={gameData.teamPerformance.northHarbour.heatMapRelationships}
                team="North Harbour"
              />
              <CohesionHeatMap 
                relationships={gameData.teamPerformance.opponent.heatMapRelationships}
                team={gameData.opponent}
              />
            </div>
          </TabsContent>

          <TabsContent value="cohesion" className="space-y-6">
            <CohesionRadar 
              northHarbour={gameData.teamPerformance.northHarbour.cohesionMarkers}
              opponent={gameData.teamPerformance.opponent.cohesionMarkers}
              opponentName={gameData.opponent}
            />

            {/* Marker Progression Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Cohesion Marker Progression Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Total Team Cohesion</h4>
                    <p className="text-sm text-gray-600">{gameData.teamPerformance.northHarbour.markerProgression.totalTeamCohesion}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Defensive Gaps</h4>
                    <p className="text-sm text-gray-600">{gameData.teamPerformance.northHarbour.markerProgression.defensiveGaps}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">C-Score Impact</h4>
                    <p className="text-sm text-gray-600">{gameData.teamPerformance.northHarbour.markerProgression.cScoreImpact}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Gaps Tracking</h4>
                    <p className="text-sm text-gray-600">{gameData.teamPerformance.northHarbour.markerProgression.gapsTracking}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {/* Detailed comparison charts and analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cohesion Metrics Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Cohesion Metrics Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            metric: 'TWI Tight5',
                            northHarbour: gameData.teamPerformance.northHarbour.cohesionMarkers.TWI_Tight5,
                            opponent: gameData.teamPerformance.opponent.cohesionMarkers.TWI_Tight5 || 0,
                          },
                          {
                            metric: 'TWI Attack',
                            northHarbour: gameData.teamPerformance.northHarbour.cohesionMarkers.TWI_AttackSpine,
                            opponent: gameData.teamPerformance.opponent.cohesionMarkers.TWI_AttackSpine || 0,
                          },
                          {
                            metric: 'C-Score',
                            northHarbour: gameData.teamPerformance.northHarbour.cohesionMarkers.cScore,
                            opponent: 3.8, // Example opponent C-Score
                          }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="northHarbour" fill="#3B82F6" name="North Harbour" />
                        <Bar dataKey="opponent" fill="#EF4444" name={gameData.opponent} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Gaps Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Defensive Gaps Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            area: 'Tight 5',
                            northHarbour: gameData.teamPerformance.northHarbour.cohesionMarkers.gaps_0_Tight5,
                            opponent: gameData.teamPerformance.opponent.cohesionMarkers.gaps_0_Tight5,
                          },
                          {
                            area: 'Attack Spine',
                            northHarbour: gameData.teamPerformance.northHarbour.cohesionMarkers.gaps_0_AttackSpine,
                            opponent: gameData.teamPerformance.opponent.cohesionMarkers.gaps_0_AttackSpine,
                          },
                          {
                            area: 'Total Team',
                            northHarbour: gameData.teamPerformance.northHarbour.cohesionMarkers.gaps_0_Team,
                            opponent: gameData.teamPerformance.opponent.cohesionMarkers.gaps_0_Team,
                          }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="area" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="northHarbour" fill="#3B82F6" name="North Harbour" />
                        <Bar dataKey="opponent" fill="#EF4444" name={gameData.opponent} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* AI Generated Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Game Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{gameData.aiInsights.gameSummary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {gameData.aiInsights.keyStrengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Vulnerabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {gameData.aiInsights.vulnerabilities.map((vulnerability, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{vulnerability}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Training Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {gameData.aiInsights.drillSuggestions.map((drill, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{drill}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6">
            {/* Strategic Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Strategic Game Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h4 className="font-semibold">Recommended Approach</h4>
                  <ul className="space-y-2">
                    {gameData.aiInsights.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* What-if Scenarios */}
            <Card>
              <CardHeader>
                <CardTitle>What-If Scenario Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium">If C-Score improves to 3.0</h5>
                      <p className="text-sm text-gray-600 mt-2">Expected 15% improvement in defensive efficiency</p>
                      <Badge variant="outline" className="mt-2">+8% Win Probability</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium">If 0-5 Gaps reduce by 25%</h5>
                      <p className="text-sm text-gray-600 mt-2">Reduced points conceded by 3-5 per game</p>
                      <Badge variant="outline" className="mt-2">+12% Win Probability</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium">If TWI Attack Spine increases to 25+</h5>
                      <p className="text-sm text-gray-600 mt-2">Enhanced structured play effectiveness</p>
                      <Badge variant="outline" className="mt-2">+6% Win Probability</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}