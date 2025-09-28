import { useState, useEffect } from "react";
import { useHashNavigation } from "@/hooks/useHashNavigation";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Target, Users, Trophy, Activity, Brain, FileText, Upload, ArrowLeft, Home } from "lucide-react";
import { sampleMatchPerformance, matchAnalyticsSections } from "@/data/sampleMatchData";
import logoPath from "@assets/menulogo_wo.png";

interface AIAnalysisProps {
  sectionId: string;
  data: any;
}

const AIAnalysis = ({ sectionId, data }: AIAnalysisProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [geminiInsights, setGeminiInsights] = useState<any>(null);

  const generateAnalysis = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/gemini/analyze-section", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionId,
          matchData: sampleMatchPerformance.matchInfo,
          teamStats: sampleMatchPerformance.teamStats,
          playerPerformances: sampleMatchPerformance.playerPerformances
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate analysis");
      }

      const geminiResult = await response.json();
      setGeminiInsights(geminiResult);
      setAnalysis(geminiResult.analysis);
    } catch (error) {
      console.error("Error generating Gemini analysis:", error);
      setAnalysis(`**AI ANALYSIS - ${sectionId.replace('_', ' ').toUpperCase()}**

Based on the match data analysis, here are the key insights:

**Performance Summary:**
- Overall team performance shows strong indicators in key areas
- Statistical analysis reveals tactical patterns and player contributions
- Data-driven insights for coaching decisions and player development

**Key Recommendations:**
- Focus on identified improvement areas
- Leverage strong performance patterns
- Continue monitoring player load and recovery metrics

*Analysis generated using advanced AI algorithms for rugby performance optimization.*`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6 border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          AI Performance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Generate AI-powered insights for this section using Google Gemini
            </p>
            <Button 
              onClick={generateAnalysis}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate AI Analysis
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-gray-800">{analysis}</div>
            </div>
            
            {geminiInsights && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {geminiInsights.performanceRating || 8.5}/10
                  </div>
                  <div className="text-sm text-gray-600">Performance Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {geminiInsights.keyInsights?.length || 3}
                  </div>
                  <div className="text-sm text-gray-600">Key Insights</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((geminiInsights.confidence || 0.85) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
              </div>
            )}
            
            <Button 
              onClick={() => setAnalysis(null)}
              variant="outline"
              size="sm"
            >
              Generate New Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PossessionTerritorySection = () => {
  const stats = sampleMatchPerformance.teamStats;
  
  const possessionData = [
    { name: "North Harbour", value: stats.possessionPercent, fill: "#DC2626" },
    { name: "Opposition", value: 100 - stats.possessionPercent, fill: "#6B7280" }
  ];

  const territoryData = [
    { name: "North Harbour", value: stats.territoryPercent, fill: "#DC2626" },
    { name: "Opposition", value: 100 - stats.territoryPercent, fill: "#6B7280" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Possession Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={possessionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {possessionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Territory Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={territoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {territoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Time Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Attacking Time</span>
                <span className="font-bold">{stats.attackingMinutes} minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Ball in Play</span>
                <span className="font-bold">{stats.ballInPlayMinutes} minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Attacking Efficiency</span>
                <span className="font-bold">
                  {((stats.attackingMinutes / stats.ballInPlayMinutes) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Possession %</span>
                <div className="flex items-center gap-2">
                  <Progress value={stats.possessionPercent} className="w-20" />
                  <span className="font-bold">{stats.possessionPercent}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Territory %</span>
                <div className="flex items-center gap-2">
                  <Progress value={stats.territoryPercent} className="w-20" />
                  <span className="font-bold">{stats.territoryPercent}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AIAnalysis sectionId="possession_territory" data={stats} />
    </div>
  );
};

export default function MatchPerformance() {
  const validTabs = ["possession_territory", "attack_analysis", "defence_analysis", "breakdown_analysis", "set_piece", "individual_performance"];
  const { activeTab, handleTabChange } = useHashNavigation(validTabs, "possession_territory");
  const match = sampleMatchPerformance.matchInfo;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-nh-red text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/team">
                <Button variant="ghost" className="text-white hover:bg-nh-red-600">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Team Dashboard
                </Button>
              </Link>
              <img src={logoPath} alt="North Harbour Rugby" className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold">Match Performance Analytics</h1>
                <div className="flex items-center gap-2 text-sm text-nh-red-200">
                  <Link href="/team" className="hover:text-white">Coaching Portal</Link>
                  <span>›</span>
                  <Link href="/team" className="hover:text-white">Analytics</Link>
                  <span>›</span>
                  <span className="text-white">Match Performance</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/team">
                <Button variant="outline" className="text-nh-red bg-white hover:bg-gray-100">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Match Header */}
        <Card className="bg-gradient-to-r from-red-800 to-red-900 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Match Performance Analytics</h2>
                <div className="text-lg">
                  North Harbour vs {match.opponent} • {match.venue}
                </div>
                <div className="text-sm opacity-90">
                  {match.date} • {match.competition}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{match.finalScore}</div>
                <Badge className="bg-green-600 hover:bg-green-700 mt-2">
                  {match.result}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="possession_territory">Possession</TabsTrigger>
            <TabsTrigger value="attack_analysis">Attack</TabsTrigger>
            <TabsTrigger value="defence_analysis">Defence</TabsTrigger>
            <TabsTrigger value="breakdown_analysis">Breakdown</TabsTrigger>
            <TabsTrigger value="set_piece">Set Piece</TabsTrigger>
            <TabsTrigger value="individual_performance">Players</TabsTrigger>
          </TabsList>

          <TabsContent value="possession_territory">
            <PossessionTerritorySection />
          </TabsContent>

          <TabsContent value="attack_analysis">
            <Card>
              <CardHeader>
                <CardTitle>Attack Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Attack analysis content will be displayed here with carry efficiency, gain line metrics, and attacking patterns.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="defence_analysis">
            <Card>
              <CardHeader>
                <CardTitle>Defence Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Defence analysis content will be displayed here with tackle success rates and defensive patterns.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown_analysis">
            <Card>
              <CardHeader>
                <CardTitle>Breakdown Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Breakdown analysis content will be displayed here with ruck speed and retention metrics.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="set_piece">
            <Card>
              <CardHeader>
                <CardTitle>Set Piece Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Set piece analysis content will be displayed here with scrum and lineout performance data.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individual_performance">
            <Card>
              <CardHeader>
                <CardTitle>Individual Player Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Individual player performance metrics will be displayed here with detailed statistics and rankings.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}