import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Brain, TrendingUp, Target, Activity, Clock, Zap } from "lucide-react";

interface SeasonData {
  id: number;
  season: string;
  teamName: string;
  totalMatches: number;
  totalTries: number;
  aggregatedZones: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  aggregatedQuarters: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  aggregatedPhases: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  aggregatedSources: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  seasonAiAnalysis?: string;
  lastUpdated: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function SeasonTryOverview() {
  const [seasonData, setSeasonData] = useState<SeasonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'North Harbour' | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  useEffect(() => {
    fetchSeasonData();
  }, []);

  const fetchSeasonData = async () => {
    try {
      const response = await fetch('/api/try-analysis/season/2024');
      if (response.ok) {
        const data = await response.json();
        setSeasonData(data);
        
        // Find North Harbour data if available
        const nhData = data.find((d: SeasonData) => d.teamName === "North Harbour");
        if (nhData) {
          setSelectedTeam("North Harbour");
          setAiAnalysis(nhData.seasonAiAnalysis || "");
        }
      }
    } catch (error) {
      console.error('Error fetching season data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSeasonAnalysis = async () => {
    if (!selectedTeam) return;
    
    setIsGeneratingAnalysis(true);
    try {
      const response = await fetch('/api/try-analysis/season-ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          season: "2024",
          teamName: selectedTeam
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAiAnalysis(result.analysis);
      }
    } catch (error) {
      console.error('Error generating season analysis:', error);
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  // Handle case where seasonData might be an object instead of array
  const seasonArray = Array.isArray(seasonData) ? seasonData : [];
  const nhData = seasonArray.find(d => d.teamName === "North Harbour");
  const oppositionData = seasonArray.filter(d => d.teamName !== "North Harbour");

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Season Try Analysis Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading season data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (seasonData.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Season Try Analysis Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Try Analysis Data</h3>
            <p className="text-gray-600 mb-4">
              Start analyzing match try patterns to build season insights
            </p>
            <Badge variant="outline" className="text-sm">
              Use the try analysis tool in individual match pages
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-6 space-y-6">
      {/* Season Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nhData && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                North Harbour Attacking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Matches Analyzed</span>
                  <Badge variant="outline">{nhData.totalMatches}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Tries Scored</span>
                  <span className="font-bold text-lg text-green-600">{nhData.totalTries}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Avg: {nhData.totalMatches > 0 ? (nhData.totalTries / nhData.totalMatches).toFixed(1) : 0} tries/match
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              Opposition Defensive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Opposition Teams</span>
                <Badge variant="outline">{oppositionData.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tries Conceded</span>
                <span className="font-bold text-lg text-red-600">
                  {oppositionData.reduce((sum, team) => sum + team.totalTries, 0)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Defense analysis across {oppositionData.reduce((sum, team) => sum + team.totalMatches, 0)} matches
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Analysis Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generateSeasonAnalysis}
              disabled={!nhData || isGeneratingAnalysis}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white mb-3"
            >
              {isGeneratingAnalysis ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Season Insights
                </>
              )}
            </Button>
            {nhData?.seasonAiAnalysis && (
              <Badge variant="secondary" className="text-xs">
                Last updated: {new Date(nhData.lastUpdated).toLocaleDateString()}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {nhData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Zone Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Try Zone Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={nhData.aggregatedZones}>
                  <CartesianGrid strokeDasharray="3,3" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quarter Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quarter Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={nhData.aggregatedQuarters}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({name, percentage}) => `${name}: ${percentage}%`}
                  >
                    {nhData.aggregatedQuarters.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Phase Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Phase Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nhData.aggregatedPhases.map((phase, index) => (
                  <div key={phase.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{phase.name}</span>
                      <span className="font-medium">{phase.value} tries ({phase.percentage}%)</span>
                    </div>
                    <Progress value={phase.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Source Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Try Source Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nhData.aggregatedSources.map((source, index) => (
                  <div key={source.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{source.name}</span>
                      <span className="font-medium">{source.value} tries ({source.percentage}%)</span>
                    </div>
                    <Progress value={source.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Analysis Section */}
      {aiAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Season AI Analysis - Tactical Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {aiAnalysis}
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t mt-4">
              <Button variant="outline" size="sm" onClick={generateSeasonAnalysis}>
                <Brain className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}