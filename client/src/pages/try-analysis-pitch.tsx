import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw,
  Target,
  Trophy,
  MapPin,
  FileSpreadsheet,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  Eye,
  Clock,
  Activity
} from "lucide-react";

interface Try {
  id: string;
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  type: string;
  area: string;
  team: 'home' | 'away';
  minute?: number;
  player?: string;
  // New analytical metrics
  zone: 'attacking_22' | 'attacking_22m_halfway' | 'defending_22m_halfway' | 'defending_22';
  quarter: 1 | 2 | 3 | 4;
  phase: 'phase_1' | 'phase_2_3' | 'phase_4_6' | 'phase_7_plus';
  source: 'scrum' | 'lineout' | 'penalty' | 'kickoff' | 'turnover' | 'open_play' | 'restart';
}

interface AIPattern {
  id: string;
  type: 'hotspot' | 'weakness' | 'trend' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  affectedTries: string[];
}

interface PatternInsight {
  dominantType: string;
  hotspotZone: { x: number; y: number; radius: number };
  weaknessZone: { x: number; y: number; radius: number };
  teamBalance: number; // -1 to 1, negative favors away team
  fieldPositionTrend: 'attacking' | 'defensive' | 'balanced';
  opportunityScore: number; // 0-100
}

const tryTypes = [
  { value: "50m_restart_retained", label: "50m Restart Retained", color: "#10B981", icon: "●" },
  { value: "free_kick", label: "Free Kick", color: "#059669", icon: "●" },
  { value: "kick_return", label: "Kick Return", color: "#F59E0B", icon: "●" },
  { value: "lineout", label: "Lineout", color: "#DC2626", icon: "♦" },
  { value: "lineout_steal", label: "Lineout Steal", color: "#B91C1C", icon: "♦" },
  { value: "scrum", label: "Scrum", color: "#1E40AF", icon: "▲" },
  { value: "tap_penalty", label: "Tap Penalty", color: "#7C2D12", icon: "■" },
  { value: "turnover_won", label: "Turnover Won", color: "#BE185D", icon: "●" }
];

const fieldAreas = [
  "Own try line",
  "Own 5m",
  "Own 22m",
  "Own half",
  "Halfway line",
  "Attacking half",
  "Attacking 22m",
  "Attacking 5m",
  "Attacking try line"
];

export default function TryAnalysisPitch() {
  const [tries, setTries] = useState<Try[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [isPlacingTry, setIsPlacingTry] = useState(false);
  
  // Editing state for try details
  const [editingTry, setEditingTry] = useState<string | null>(null);
  const [editQuarter, setEditQuarter] = useState<string>("");
  const [editPhase, setEditPhase] = useState<string>("");
  const [showControls, setShowControls] = useState(true);
  const [aiPatterns, setAiPatterns] = useState<AIPattern[]>([]);
  const [patternInsights, setPatternInsights] = useState<PatternInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIOverlay, setShowAIOverlay] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Chart colors for consistency
  const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  // Function to detect zone based on Y coordinate
  const detectZone = (y: number): 'attacking_22' | 'attacking_22m_halfway' | 'defending_22m_halfway' | 'defending_22' => {
    if (y >= 80) return 'attacking_22'; // Bottom 20% of pitch
    if (y >= 50) return 'attacking_22m_halfway'; // 50-80%
    if (y >= 20) return 'defending_22m_halfway'; // 20-50%
    return 'defending_22'; // Top 20%
  };

  // Calculate analytical metrics
  const zoneData = useMemo(() => {
    const zones = ['attacking_22', 'attacking_22m_halfway', 'defending_22m_halfway', 'defending_22'];
    return zones.map(zone => ({
      name: zone.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: tries.filter(t => t.zone === zone).length,
      percentage: tries.length > 0 ? Math.round((tries.filter(t => t.zone === zone).length / tries.length) * 100) : 0
    }));
  }, [tries]);

  const quarterData = useMemo(() => {
    const quarters = [1, 2, 3, 4];
    return quarters.map(quarter => ({
      name: `Q${quarter}`,
      value: tries.filter(t => t.quarter === quarter).length,
      percentage: tries.length > 0 ? Math.round((tries.filter(t => t.quarter === quarter).length / tries.length) * 100) : 0
    }));
  }, [tries]);

  const phaseData = useMemo(() => {
    const phases = ['phase_1', 'phase_2_3', 'phase_4_6', 'phase_7_plus'];
    const phaseLabels = ['Phase 1', 'Phase 2-3', 'Phase 4-6', 'Phase 7+'];
    return phases.map((phase, index) => ({
      name: phaseLabels[index],
      value: tries.filter(t => t.phase === phase).length,
      percentage: tries.length > 0 ? Math.round((tries.filter(t => t.phase === phase).length / tries.length) * 100) : 0
    }));
  }, [tries]);

  const sourceData = useMemo(() => {
    const sources = ['scrum', 'lineout', 'penalty', 'kickoff', 'turnover', 'open_play', 'restart'];
    return sources.map(source => ({
      name: source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: tries.filter(t => t.source === source).length,
      percentage: tries.length > 0 ? Math.round((tries.filter(t => t.source === source).length / tries.length) * 100) : 0
    })).filter(item => item.value > 0); // Only show sources with tries
  }, [tries]);

  const analyzePatterns = async () => {
    if (tries.length < 3) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calculate pattern insights
    const insights = calculatePatternInsights(tries);
    setPatternInsights(insights);
    
    // Generate AI pattern recommendations
    const patterns = generateAIPatterns(tries, insights);
    setAiPatterns(patterns);
    
    setIsAnalyzing(false);
  };

  const calculatePatternInsights = (tryData: Try[]): PatternInsight => {
    // Calculate dominant try type
    const typeCount: Record<string, number> = {};
    tryData.forEach(t => {
      typeCount[t.type] = (typeCount[t.type] || 0) + 1;
    });
    const dominantType = Object.entries(typeCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    // Find hotspot zone (area with most tries)
    const avgX = tryData.reduce((sum, t) => sum + t.x, 0) / tryData.length;
    const avgY = tryData.reduce((sum, t) => sum + t.y, 0) / tryData.length;
    
    // Calculate team balance
    const homeCount = tryData.filter(t => t.team === 'home').length;
    const awayCount = tryData.filter(t => t.team === 'away').length;
    const teamBalance = (homeCount - awayCount) / tryData.length;

    // Determine field position trend
    const attackingTries = tryData.filter(t => t.y > 70).length; // Bottom third
    const defensiveTries = tryData.filter(t => t.y < 30).length; // Top third
    let fieldPositionTrend: 'attacking' | 'defensive' | 'balanced' = 'balanced';
    if (attackingTries > defensiveTries * 1.5) fieldPositionTrend = 'attacking';
    else if (defensiveTries > attackingTries * 1.5) fieldPositionTrend = 'defensive';

    // Calculate opportunity score based on try diversity and positioning
    const typeVariety = Object.keys(typeCount).length / tryTypes.length;
    const positionSpread = calculatePositionSpread(tryData);
    const opportunityScore = Math.round((typeVariety * 50) + (positionSpread * 50));

    return {
      dominantType,
      hotspotZone: { x: avgX, y: avgY, radius: 15 },
      weaknessZone: findWeaknessZone(tryData),
      teamBalance,
      fieldPositionTrend,
      opportunityScore
    };
  };

  const calculatePositionSpread = (tryData: Try[]): number => {
    if (tryData.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < tryData.length; i++) {
      for (let j = i + 1; j < tryData.length; j++) {
        const dx = tryData[i].x - tryData[j].x;
        const dy = tryData[i].y - tryData[j].y;
        totalDistance += Math.sqrt(dx * dx + dy * dy);
      }
    }
    
    const maxPossibleDistance = Math.sqrt(100 * 100 + 100 * 100);
    const averageDistance = totalDistance / (tryData.length * (tryData.length - 1) / 2);
    return Math.min(averageDistance / maxPossibleDistance, 1);
  };

  const findWeaknessZone = (tryData: Try[]): { x: number; y: number; radius: number } => {
    // Find area with fewest tries (weakness)
    const grid = 4; // 4x4 grid
    const cellSize = 100 / grid;
    const cellCounts: number[][] = Array(grid).fill(null).map(() => Array(grid).fill(0));
    
    tryData.forEach(t => {
      const cellX = Math.min(Math.floor(t.x / cellSize), grid - 1);
      const cellY = Math.min(Math.floor(t.y / cellSize), grid - 1);
      cellCounts[cellY][cellX]++;
    });
    
    let minCount = Infinity;
    let weakestCell = { x: 0, y: 0 };
    
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        if (cellCounts[y][x] < minCount) {
          minCount = cellCounts[y][x];
          weakestCell = { x, y };
        }
      }
    }
    
    return {
      x: (weakestCell.x * cellSize) + (cellSize / 2),
      y: (weakestCell.y * cellSize) + (cellSize / 2),
      radius: cellSize / 2
    };
  };

  const generateAIPatterns = (tryData: Try[], insights: PatternInsight): AIPattern[] => {
    const patterns: AIPattern[] = [];
    
    // Dominant pattern analysis
    const dominantConfig = getTryTypeConfig(insights.dominantType);
    patterns.push({
      id: 'dominant-pattern',
      type: 'trend',
      title: `${dominantConfig.label} Dominance`,
      description: `${dominantConfig.label} accounts for the majority of scoring patterns`,
      confidence: 85,
      severity: 'medium',
      recommendations: [
        `Continue exploiting ${dominantConfig.label} opportunities`,
        'Develop counter-strategies for opponents',
        'Train alternative scoring methods for unpredictability'
      ],
      affectedTries: tryData.filter(t => t.type === insights.dominantType).map(t => t.id)
    });

    // Hotspot analysis
    if (tryData.length >= 5) {
      patterns.push({
        id: 'scoring-hotspot',
        type: 'hotspot',
        title: 'Scoring Concentration Zone',
        description: 'High concentration of tries in specific field area',
        confidence: 92,
        severity: 'high',
        recommendations: [
          'Focus attacking plays on identified hotspot',
          'Develop plays to exploit this area consistently',
          'Study defensive weaknesses in this zone'
        ],
        affectedTries: tryData.filter(t => {
          const distance = Math.sqrt(
            Math.pow(t.x - insights.hotspotZone.x, 2) + 
            Math.pow(t.y - insights.hotspotZone.y, 2)
          );
          return distance <= insights.hotspotZone.radius;
        }).map(t => t.id)
      });
    }

    // Team balance analysis
    if (Math.abs(insights.teamBalance) > 0.3) {
      const favoredTeam = insights.teamBalance > 0 ? 'home' : 'away';
      patterns.push({
        id: 'team-dominance',
        type: 'trend',
        title: `${favoredTeam === 'home' ? 'Home' : 'Away'} Team Scoring Advantage`,
        description: `${favoredTeam === 'home' ? 'Home' : 'Away'} team showing superior scoring efficiency`,
        confidence: Math.round(Math.abs(insights.teamBalance) * 100),
        severity: Math.abs(insights.teamBalance) > 0.5 ? 'high' : 'medium',
        recommendations: [
          favoredTeam === 'home' ? 'Maintain home advantage strategies' : 'Study away team tactics',
          'Analyze why one team is more effective',
          'Develop counter-strategies for balanced competition'
        ],
        affectedTries: tryData.filter(t => t.team === favoredTeam).map(t => t.id)
      });
    }

    // Opportunity analysis
    if (insights.opportunityScore < 40) {
      patterns.push({
        id: 'limited-variety',
        type: 'weakness',
        title: 'Limited Scoring Variety',
        description: 'Try scoring patterns show limited tactical diversity',
        confidence: 78,
        severity: 'medium',
        recommendations: [
          'Diversify attacking strategies',
          'Practice alternative scoring methods',
          'Exploit underutilized areas of the field'
        ],
        affectedTries: []
      });
    }

    return patterns;
  };

  useEffect(() => {
    if (tries.length >= 3) {
      analyzePatterns();
    } else {
      setAiPatterns([]);
      setPatternInsights(null);
    }
  }, [tries]);

  const handleMouseMove = (event: React.MouseEvent<SVGElement>) => {
    if (!isPlacingTry) {
      setMousePosition(null);
      return;
    }

    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    // Get precise mouse position
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Convert to SVG coordinates
    const svgX = (mouseX / rect.width) * 400;
    const svgY = (mouseY / rect.height) * 600;
    
    setMousePosition({ x: svgX, y: svgY });
  };

  const handlePitchClick = (event: React.MouseEvent<SVGElement>) => {
    if (!isPlacingTry || !selectedType) return;

    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    // Get the exact click position relative to the SVG element
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Convert to SVG coordinate system (400x600 viewBox) with precise mapping
    const svgX = (clickX / rect.width) * 400;
    const svgY = (clickY / rect.height) * 600;
    
    // Store coordinates as SVG values directly, then convert to percentage
    const x = (svgX / 400) * 100;
    const y = (svgY / 600) * 100;

    // Auto-detect zone based on Y position
    const detectedZone = detectZone(y);

    const newTry: Try = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      type: selectedType,
      area: selectedArea || detectedZone,
      team: selectedTeam,
      zone: detectedZone,
      quarter: 1, // Default, will be edited later
      phase: 'phase_1', // Default, will be edited later
      source: selectedType as any // Use try type as source for now
    };

    setTries([...tries, newTry]);
    setIsPlacingTry(false);
    setMousePosition(null);
  };

  const deleteTry = (id: string) => {
    setTries(tries.filter(t => t.id !== id));
  };

  const clearAll = () => {
    setTries([]);
  };

  const getTryTypeConfig = (type: string) => {
    return tryTypes.find(t => t.value === type) || tryTypes[0];
  };

  const getTeamStats = (team: 'home' | 'away') => {
    return tries.filter(t => t.team === team);
  };

  const getTypeStats = () => {
    const stats: Record<string, number> = {};
    tries.forEach(t => {
      stats[t.type] = (stats[t.type] || 0) + 1;
    });
    return stats;
  };

  const exportData = () => {
    const csv = [
      'Team,Try Type,Field Area,X Position,Y Position',
      ...tries.map(t => `${t.team},${t.type},${t.area},${t.x.toFixed(2)},${t.y.toFixed(2)}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'try-analysis.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Try Analysis Pitch</h1>
            <p className="text-gray-600 mt-2">
              Interactive rugby pitch visualization with AI-powered pattern recognition
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{tries.length} tries plotted</Badge>
            {aiPatterns.length > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Brain className="h-3 w-3 mr-1" />
                {aiPatterns.length} AI insights
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAIOverlay(!showAIOverlay)}
              disabled={!patternInsights}
            >
              <Eye className="h-4 w-4 mr-1" />
              {showAIOverlay ? 'Hide' : 'Show'} AI Overlay
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowControls(!showControls)}
            >
              {showControls ? 'Hide' : 'Show'} Controls
            </Button>
          </div>
        </div>

        {/* AI Analysis Status */}
        {isAnalyzing && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-800">AI Pattern Analysis in Progress</h3>
                  <p className="text-sm text-blue-600">Analyzing try scoring patterns and generating tactical insights...</p>
                  <Progress value={66} className="mt-2 h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Section: Controls and Rugby Pitch */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Controls Panel */}
          {showControls && (
            <div className="xl:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Try
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Team</Label>
                    <Select value={selectedTeam} onValueChange={(value: 'home' | 'away') => setSelectedTeam(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Us</SelectItem>
                        <SelectItem value="away">Opposition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Try Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select try type" />
                      </SelectTrigger>
                      <SelectContent>
                        {tryTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <span style={{ color: type.color }}>{type.icon}</span>
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => setIsPlacingTry(true)}
                    disabled={!selectedType || isPlacingTry}
                  >
                    {isPlacingTry ? 'Click on pitch to place' : 'Place Try on Pitch'}
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearAll} className="flex-1">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportData} className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Export CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Legend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Try Types Legend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tryTypes.map(type => (
                    <div key={type.value} className="flex items-center gap-2 text-sm">
                      <span style={{ color: type.color, fontSize: '16px' }}>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="font-medium text-blue-800">Home</div>
                      <div className="text-blue-600">{getTeamStats('home').length} tries</div>
                    </div>
                    <div className="p-2 bg-red-50 rounded">
                      <div className="font-medium text-red-800">Away</div>
                      <div className="text-red-600">{getTeamStats('away').length} tries</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {Object.entries(getTypeStats()).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-xs">
                        <span>{getTryTypeConfig(type).label}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Rugby Pitch */}
          <div className={showControls ? "xl:col-span-3" : "xl:col-span-4"}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Rugby Pitch - Try Origins
                  {isPlacingTry && (
                    <Badge variant="secondary" className="ml-auto">
                      Click to place {getTryTypeConfig(selectedType).label}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-green-600 rounded-lg overflow-hidden">
                  <svg
                    viewBox="0 0 400 600"
                    className={`w-full h-auto ${isPlacingTry ? 'cursor-crosshair' : 'cursor-default'}`}
                    onClick={handlePitchClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setMousePosition(null)}
                    style={{ maxHeight: '80vh', display: 'block' }}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Pitch Background */}
                    <rect width="400" height="600" fill="#4ADE80" />
                    
                    {/* Pitch Lines */}
                    {/* Sidelines */}
                    <line x1="50" y1="50" x2="50" y2="550" stroke="white" strokeWidth="2" />
                    <line x1="350" y1="50" x2="350" y2="550" stroke="white" strokeWidth="2" />
                    
                    {/* Try lines */}
                    <line x1="50" y1="50" x2="350" y2="50" stroke="white" strokeWidth="3" />
                    <line x1="50" y1="550" x2="350" y2="550" stroke="white" strokeWidth="3" />
                    
                    {/* 5m lines */}
                    <line x1="50" y1="80" x2="350" y2="80" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="50" y1="520" x2="350" y2="520" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
                    
                    {/* 22m lines */}
                    <line x1="50" y1="182" x2="350" y2="182" stroke="white" strokeWidth="2" />
                    <line x1="50" y1="418" x2="350" y2="418" stroke="white" strokeWidth="2" />
                    
                    {/* Halfway line */}
                    <line x1="50" y1="300" x2="350" y2="300" stroke="white" strokeWidth="2" />
                    
                    {/* 10m lines from halfway */}
                    <line x1="50" y1="240" x2="350" y2="240" stroke="white" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="50" y1="360" x2="350" y2="360" stroke="white" strokeWidth="1" strokeDasharray="3,3" />
                    
                    {/* Goal posts */}
                    <rect x="195" y="45" width="10" height="15" fill="white" />
                    <rect x="195" y="540" width="10" height="15" fill="white" />
                    
                    {/* In-goal areas */}
                    <rect x="50" y="30" width="300" height="20" fill="none" stroke="white" strokeWidth="1" />
                    <rect x="50" y="550" width="300" height="20" fill="none" stroke="white" strokeWidth="1" />
                    
                    {/* Centre circle */}
                    <circle cx="200" cy="300" r="10" fill="none" stroke="white" strokeWidth="1" />
                    
                    {/* Field markings labels */}
                    <text x="30" y="55" fill="white" fontSize="10" textAnchor="middle">TL</text>
                    <text x="30" y="85" fill="white" fontSize="8" textAnchor="middle">5m</text>
                    <text x="30" y="187" fill="white" fontSize="8" textAnchor="middle">22m</text>
                    <text x="30" y="305" fill="white" fontSize="8" textAnchor="middle">50m</text>
                    <text x="30" y="423" fill="white" fontSize="8" textAnchor="middle">22m</text>
                    <text x="30" y="525" fill="white" fontSize="8" textAnchor="middle">5m</text>
                    <text x="30" y="555" fill="white" fontSize="10" textAnchor="middle">TL</text>

                    {/* AI Pattern Overlays */}
                    {showAIOverlay && patternInsights && (
                      <g opacity="0.7">
                        {/* Hotspot zone */}
                        <circle
                          cx={(patternInsights.hotspotZone.x / 100) * 400}
                          cy={(patternInsights.hotspotZone.y / 100) * 600}
                          r={(patternInsights.hotspotZone.radius / 100) * 200}
                          fill="rgba(255, 0, 0, 0.2)"
                          stroke="rgba(255, 0, 0, 0.6)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                        <text
                          x={(patternInsights.hotspotZone.x / 100) * 400}
                          y={(patternInsights.hotspotZone.y / 100) * 600 - patternInsights.hotspotZone.radius - 10}
                          fill="red"
                          fontSize="12"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          HOTSPOT
                        </text>

                        {/* Weakness zone */}
                        <circle
                          cx={(patternInsights.weaknessZone.x / 100) * 400}
                          cy={(patternInsights.weaknessZone.y / 100) * 600}
                          r={(patternInsights.weaknessZone.radius / 100) * 200}
                          fill="rgba(0, 0, 255, 0.2)"
                          stroke="rgba(0, 0, 255, 0.6)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                        <text
                          x={(patternInsights.weaknessZone.x / 100) * 400}
                          y={(patternInsights.weaknessZone.y / 100) * 600 - patternInsights.weaknessZone.radius - 10}
                          fill="blue"
                          fontSize="12"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          OPPORTUNITY
                        </text>
                      </g>
                    )}

                    {/* Mouse crosshair preview */}
                    {isPlacingTry && mousePosition && selectedType && (
                      <g opacity="0.8">
                        {/* Crosshair lines */}
                        <line
                          x1={mousePosition.x - 15}
                          y1={mousePosition.y}
                          x2={mousePosition.x + 15}
                          y2={mousePosition.y}
                          stroke="yellow"
                          strokeWidth="2"
                        />
                        <line
                          x1={mousePosition.x}
                          y1={mousePosition.y - 15}
                          x2={mousePosition.x}
                          y2={mousePosition.y + 15}
                          stroke="yellow"
                          strokeWidth="2"
                        />
                        {/* Preview try marker */}
                        <circle
                          cx={mousePosition.x}
                          cy={mousePosition.y}
                          r="8"
                          fill={getTryTypeConfig(selectedType).color}
                          stroke={selectedTeam === 'home' ? '#1E40AF' : '#DC2626'}
                          strokeWidth="2"
                          opacity="0.7"
                        />
                        <text
                          x={mousePosition.x}
                          y={mousePosition.y + 2}
                          fill="white"
                          fontSize="10"
                          textAnchor="middle"
                          opacity="0.9"
                        >
                          {getTryTypeConfig(selectedType).icon}
                        </text>
                      </g>
                    )}

                    {/* Try markers */}
                    {tries.map(tryItem => {
                      const config = getTryTypeConfig(tryItem.type);
                      // Ensure precise coordinate mapping
                      const x = (tryItem.x / 100) * 400;
                      const y = (tryItem.y / 100) * 600;
                      
                      return (
                        <g key={tryItem.id}>
                          {/* Try marker */}
                          <circle
                            cx={x}
                            cy={y}
                            r="8"
                            fill={config.color}
                            stroke={tryItem.team === 'home' ? '#1E40AF' : '#DC2626'}
                            strokeWidth="2"
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTry(tryItem.id);
                            }}
                          />
                          {/* Try type icon */}
                          <text
                            x={x}
                            y={y + 2}
                            fill="white"
                            fontSize="10"
                            textAnchor="middle"
                            className="pointer-events-none"
                          >
                            {config.icon}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>Click on a try marker to delete it. Total tries: {tries.length}</p>
                  {isPlacingTry && (
                    <p className="text-blue-600 font-medium">
                      Click anywhere on the pitch to place a {getTryTypeConfig(selectedType).label} try
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Try List */}
            {tries.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Try Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {tries.map(tryItem => {
                      const config = getTryTypeConfig(tryItem.type);
                      return (
                        <div key={tryItem.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-3">
                            <span style={{ color: config.color, fontSize: '16px' }}>{config.icon}</span>
                            <div>
                              <div className="font-medium text-sm">{config.label}</div>
                              <div className="text-xs text-gray-500">
                                {tryItem.area} • {tryItem.team === 'home' ? 'Home' : 'Away'} team
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTry(tryItem.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* AI Insights Panel */}
        {aiPatterns.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pattern Insights */}
            {patternInsights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Pattern Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">Dominant Pattern</div>
                      <div className="text-lg font-bold text-blue-900">
                        {getTryTypeConfig(patternInsights.dominantType).label}
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">Opportunity Score</div>
                      <div className="text-lg font-bold text-green-900">
                        {patternInsights.opportunityScore}/100
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-purple-800">Field Trend</div>
                      <div className="text-lg font-bold text-purple-900 capitalize">
                        {patternInsights.fieldPositionTrend}
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm font-medium text-orange-800">Team Balance</div>
                      <div className="text-lg font-bold text-orange-900">
                        {patternInsights.teamBalance > 0.1 ? 'Home Favored' : 
                         patternInsights.teamBalance < -0.1 ? 'Away Favored' : 'Balanced'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiPatterns.map(pattern => (
                    <div key={pattern.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {pattern.type === 'hotspot' && <TrendingUp className="h-4 w-4 text-red-500" />}
                          {pattern.type === 'weakness' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                          {pattern.type === 'trend' && <BarChart3 className="h-4 w-4 text-blue-500" />}
                          {pattern.type === 'opportunity' && <Zap className="h-4 w-4 text-green-500" />}
                          <span className="font-medium text-sm">{pattern.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant={pattern.severity === 'high' ? 'destructive' : 
                                   pattern.severity === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {pattern.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{pattern.description}</p>
                      <div className="space-y-1">
                        {pattern.recommendations.slice(0, 2).map((rec, index) => (
                          <div key={index} className="flex items-start gap-2 text-xs">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Getting Started Message */}
        {tries.length === 0 && (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Adding Tries</h3>
              <p className="text-gray-600 mb-4">
                Add at least 3 tries to unlock AI-powered pattern recognition and tactical insights.
              </p>
              <Badge variant="outline" className="text-sm">
                AI analysis activates automatically
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}