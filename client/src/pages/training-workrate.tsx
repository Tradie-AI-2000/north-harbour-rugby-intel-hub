import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Activity, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Play,
  Pause,
  Calendar,
  MapPin,
  Thermometer,
  Wind,
  Search,
  Filter,
  Download,
  Eye,
  Target,
  Zap,
  Heart,
  Timer,
  BarChart3,
  LineChart,
  PieChart,
  Edit3,
  Save,
  Trophy,
  Shield,
  FileText,
  Brain,
  CloudRain,
  Sun,
  Gauge,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  CheckCircle,
  XCircle,
  Circle,
  MessageSquare,
  Send,
  Camera,
  Share2,
  Flag,
  Lightbulb,
  TrendingDown as TrendDown,
  RefreshCw,
  BarChart,
  Cpu
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import NavigationHeader from "@/components/navigation-header";
import { SeasonOverviewDashboard } from "@/components/SeasonOverviewDashboard";
import { WeeklyFocusDashboard } from "@/components/WeeklyFocusDashboard";
import { GPSDeepDiveDashboard } from "@/components/GPSDeepDiveDashboard";

// Training Session Context Interface
interface TrainingSession {
  id: string;
  date: string;
  time: string;
  title: string;
  week: number;
  day: number;
  type: "Training" | "Match Prep" | "Recovery" | "Skills";
  location: string;
  duration: number; // minutes
  weather: {
    temperature: number;
    conditions: string;
    wind: string;
    fieldConditions: string;
  };
  participants: number;
  status: "Active" | "Completed" | "Scheduled";
  intensity: "Low" | "Medium" | "High";
  rpe: number; // Rate of Perceived Exertion 1-10
  notes: {
    objective: string;
    intendedExertion: string;
    fieldWeatherConditions: string;
  };
}

// Team Summary Metrics Interface
interface TeamSummaryMetrics {
  totalDistance: {
    average: number;
    range: { min: number; max: number };
    trend: "up" | "down" | "stable";
  };
  highSpeedRunning: {
    average: number;
    range: { min: number; max: number };
    trend: "up" | "down" | "stable";
  };
  playerLoad: {
    average: number;
    range: { min: number; max: number };
    trend: "up" | "down" | "stable";
  };
  maxVelocity: {
    average: number;
    range: { min: number; max: number };
    trend: "up" | "down" | "stable";
  };
}

// StatSports SONRA Player Workrate Data Interface
interface PlayerWorkrate {
  playerId: string;
  playerName: string;
  position: string;
  photoUrl?: string;
  
  // Volume Metrics
  totalDistance: number; // metres
  metresPerMinute: number; // m/min work rate intensity
  
  // Intensity & Speed Metrics
  highSpeedRunningDistance: number; // metres (>5.5 m/s)
  sprintDistance: number; // metres (>7 m/s)
  maxVelocity: number; // m/s
  
  // Explosive Efforts & Load
  accelerations: {
    moderate: number; // >2m/s²
    high: number; // >3m/s²
    total: number;
  };
  decelerations: {
    moderate: number; // >2m/s²
    high: number; // >3m/s²
    total: number;
  };
  dynamicStressLoad: number; // StatSports proprietary DSL metric
  impacts: number; // collisions/impacts
  
  // Rugby-Specific Workrate Metrics
  highMetabolicLoadDistance: number; // HMLD - high-intensity distance
  involvements: number; // key action involvements (if available)
  
  // Load Management
  acwr: number; // Acute:Chronic Workload Ratio
  personalDSLAverage: number; // player's personal DSL average
  positionalDSLAverage: number; // positional DSL average
  
  // Status Indicators
  loadStatus: "green" | "amber" | "red"; // traffic light ACWR status
  performanceStatus: "Excellent" | "Good" | "Moderate" | "Concern" | "Risk";
  availability: "Available" | "Modified" | "Injured";
}

// Mock data for current session
const currentSession: TrainingSession = {
  id: "TR_2025_01_23_001",
  date: "2025-01-23",
  time: "10:00 AM",
  title: "High Intensity Contact",
  week: 5,
  day: 1,
  type: "Training",
  location: "QBE Stadium Training Ground",
  duration: 90,
  weather: {
    temperature: 22,
    conditions: "Heavy Rain",
    wind: "15 km/h SW",
    fieldConditions: "Soft Ground"
  },
  participants: 28,
  status: "Active",
  intensity: "High",
  rpe: 9,
  notes: {
    objective: "Focus on defensive system under fatigue",
    intendedExertion: "High (9/10 RPE) - 'Bust a Gut' day",
    fieldWeatherConditions: "Field 2, Heavy Rain, Soft Ground"
  }
};

// Team Summary Metrics
const teamSummaryMetrics: TeamSummaryMetrics = {
  totalDistance: {
    average: 3960,
    range: { min: 3200, max: 4800 },
    trend: "up"
  },
  highSpeedRunning: {
    average: 753,
    range: { min: 420, max: 1100 },
    trend: "up"
  },
  playerLoad: {
    average: 387,
    range: { min: 280, max: 520 },
    trend: "stable"
  },
  maxVelocity: {
    average: 29.8,
    range: { min: 25.2, max: 33.4 },
    trend: "stable"
  }
};

// StatSports SONRA player workrate data - now served from Firebase
const playerWorkrateData: PlayerWorkrate[] = [
  // Hardcoded legacy players removed - system now uses Firebase GPS data
  {
    playerId: "daniel_collins",
    playerName: "Daniel Collins",
    position: "Scrum-half",
    photoUrl: "/api/placeholder/player-photos/daniel_collins.jpg",
    
    // Volume Metrics
    totalDistance: 3650,
    metresPerMinute: 40.6,
    
    // Intensity & Speed Metrics
    highSpeedRunningDistance: 650,
    sprintDistance: 320,
    maxVelocity: 8.3, // m/s (29.8 km/h)
    
    // Explosive Efforts & Load
    accelerations: { moderate: 35, high: 18, total: 53 },
    decelerations: { moderate: 32, high: 15, total: 47 },
    dynamicStressLoad: 350,
    impacts: 8,
    
    // Rugby-Specific Workrate
    highMetabolicLoadDistance: 980,
    involvements: 42,
    
    // Load Management
    acwr: 1.35,
    personalDSLAverage: 340,
    positionalDSLAverage: 320,
    
    // Status
    loadStatus: "amber",
    performanceStatus: "Good",
    availability: "Modified"
  },
  {
    playerId: "ryan_patel",
    playerName: "Ryan Patel",
    position: "Wing",
    photoUrl: "/api/placeholder/player-photos/ryan_patel.jpg",
    
    // Volume Metrics
    totalDistance: 3420,
    metresPerMinute: 38.0,
    
    // Intensity & Speed Metrics
    highSpeedRunningDistance: 1240,
    sprintDistance: 450,
    maxVelocity: 9.2, // m/s (33.1 km/h)
    
    // Explosive Efforts & Load
    accelerations: { moderate: 18, high: 12, total: 30 },
    decelerations: { moderate: 16, high: 8, total: 24 },
    dynamicStressLoad: 285,
    impacts: 4,
    
    // Rugby-Specific Workrate
    highMetabolicLoadDistance: 820,
    involvements: 18,
    
    // Load Management
    acwr: 0.95,
    personalDSLAverage: 300,
    positionalDSLAverage: 290,
    
    // Status
    loadStatus: "green",
    performanceStatus: "Good",
    availability: "Available"
  }
  // Additional legacy hardcoded players (marcus_wilson, ethan_blackadder) removed
  // System now uses Firebase GPS data from StatSports API
];

// Helper function to create radial gauge value
const calculateGaugePercentage = (current: number, average: number, max?: number) => {
  if (max) {
    return Math.min((current / max) * 100, 100);
  }
  return Math.min((current / average) * 50 + 50, 100);
};

// Helper function to get load status color
const getLoadStatusColor = (status: "green" | "amber" | "red") => {
  switch (status) {
    case "green": return "text-green-600 border-green-300 bg-green-50";
    case "amber": return "text-yellow-600 border-yellow-300 bg-yellow-50";
    case "red": return "text-red-600 border-red-300 bg-red-50";
  }
};

// RadialGauge Component
const RadialGauge = ({ value, max, label, color = "blue" }: { 
  value: number; 
  max: number; 
  label: string; 
  color?: string; 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`text-${color}-600 transition-all duration-1000 ease-out`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs font-bold">{Math.round(percentage)}%</div>
        </div>
      </div>
    </div>
  );
};

// Staff Notes Component for Player Cards
const PlayerNotesDialog = ({ player, onSaveNote }: { player: PlayerWorkrate; onSaveNote: (playerId: string, note: string) => void }) => {
  const [note, setNote] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSaveNote(player.playerId, note);
    setNote("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="h-3 w-3 mr-1" />
          Add Note
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Session Note - {player.playerName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Performance Note</label>
            <Textarea
              placeholder="e.g., 'Looked fatigued in final drill' or 'Excellent explosive efforts today'"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Note</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Snapshot Generation Component
const SnapshotGenerator = ({ player, sessionData }: { player: PlayerWorkrate; sessionData: any }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSnapshot = async () => {
    setIsGenerating(true);
    try {
      // API call to generate snapshot
      await apiRequest("/api/training-workrate/snapshot", {
        method: "POST",
        body: { playerId: player.playerId, sessionId: sessionData.sessionId }
      });
    } catch (error) {
      console.error("Failed to generate snapshot:", error);
    }
    setIsGenerating(false);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={generateSnapshot}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
      ) : (
        <Camera className="h-3 w-3 mr-1" />
      )}
      Send to Coach
    </Button>
  );
};

// AI Insights Panel Component
const AIInsightsPanel = ({ sessionData, playerData, isLoading }: { 
  sessionData: any; 
  playerData: PlayerWorkrate[]; 
  isLoading: boolean;
}) => {
  const [analysisType, setAnalysisType] = useState("anomalies");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const { data: aiInsights, refetch: generateInsights } = useQuery({
    queryKey: ["/api/ai/training-insights", analysisType, sessionData?.sessionId],
    enabled: false, // Manual trigger only
  });

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await generateInsights();
    } catch (error) {
      console.error("AI analysis failed:", error);
    }
    setIsAnalyzing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading session data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Performance Analysis Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anomalies">Identify Anomalies</SelectItem>
                <SelectItem value="session-intent">Session Intent Match</SelectItem>
                <SelectItem value="trends">Trend Analysis</SelectItem>
                <SelectItem value="positional">Positional Benchmarking</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={runAIAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Cpu className="h-4 w-4 mr-2" />
              )}
              Run Analysis
            </Button>
          </div>

          {/* Analysis Results */}
          {aiInsights && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.anomalies?.map((anomaly: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Flag className="h-4 w-4 text-red-600" />
                        <span className="font-semibold text-red-800">Anomaly Detected</span>
                      </div>
                      <p className="text-sm text-gray-700">{anomaly.description}</p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {anomaly.player} - {anomaly.metric}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {aiInsights.insights?.map((insight: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-800">AI Insight</span>
                      </div>
                      <p className="text-sm text-gray-700">{insight.description}</p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Confidence: {Math.round(insight.confidence * 100)}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {aiInsights.recommendations?.map((rec: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowRight className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-800">Recommendation</span>
                      </div>
                      <p className="text-sm text-gray-700">{rec.description}</p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Priority: {rec.priority}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Team Distance</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">3,960m</p>
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                +8% from last session
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">High Speed Running</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">753m</p>
              <p className="text-xs text-orange-600 flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                +12% from last session
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Player Load</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">387</p>
              <p className="text-xs text-purple-600 flex items-center gap-1">
                <Circle className="h-3 w-3" />
                Stable trend
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Max Velocity</span>
              </div>
              <p className="text-2xl font-bold text-green-900">29.8 km/h</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Circle className="h-3 w-3" />
                Within expected range
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Intent Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Session Intent vs. Actual Output
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-l-yellow-500">
              <div>
                <h4 className="font-semibold text-yellow-800">Intent Analysis</h4>
                <p className="text-sm text-yellow-700">
                  Team's m/min was 15% lower than expected for 'High Intensity' session. 
                  Likely due to heavy rain and soft ground conditions.
                </p>
              </div>
              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                Moderate Match
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h5 className="font-semibold text-gray-900">Intended RPE</h5>
                <p className="text-3xl font-bold text-blue-600">9/10</p>
                <p className="text-sm text-gray-500">High Intensity</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h5 className="font-semibold text-gray-900">Actual Output</h5>
                <p className="text-3xl font-bold text-orange-600">7.6/10</p>
                <p className="text-sm text-gray-500">Moderate-High</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h5 className="font-semibold text-gray-900">Weather Impact</h5>
                <p className="text-3xl font-bold text-gray-600">-15%</p>
                <p className="text-sm text-gray-500">Heavy Rain</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function TrainingWorkrate() {
  // 3-Tier Dashboard Architecture State
  const [currentView, setCurrentView] = useState<"season" | "weekly" | "gps">("season");
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  
  // Hash navigation for 3-tier system
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('week')) {
        const [weekPart, sessionPart] = hash.split('#');
        setSelectedWeek(weekPart);
        if (sessionPart && sessionPart.startsWith('statsports')) {
          setSelectedSession(sessionPart);
          setCurrentView("gps");
        } else {
          setCurrentView("weekly");
        }
      } else {
        setCurrentView("season");
        setSelectedWeek(null);
        setSelectedSession(null);
      }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [selectedTab, setSelectedTab] = useState("team-overview");
  const [searchFilter, setSearchFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Position group mappings based on database schema
  const positionGroups = {
    "Forwards": ["Prop", "Hooker", "Lock", "Flanker", "Number 8"],
    "Backs": ["Scrum-half", "Fly-half", "Centre", "Winger", "Fullback"]
  };

  // Sub-unit mappings for more granular filtering
  const subUnits = {
    "Forwards": {
      "Tight 5": ["Prop", "Hooker", "Lock"],
      "Props": ["Prop"],
      "Hookers": ["Hooker"],
      "Locks": ["Lock"],
      "Loose Forwards": ["Flanker", "Number 8"]
    },
    "Backs": {
      "Halfback": ["Scrum-half"],
      "1st5": ["Fly-half"],
      "Midfield": ["Centre"],
      "Outside Backs": ["Winger", "Fullback"]
    }
  };

  // Get available sub-units based on selected position filter
  const getAvailableSubUnits = () => {
    if (positionFilter === "all") return [];
    if (positionFilter === "Forwards") return Object.keys(subUnits.Forwards);
    if (positionFilter === "Backs") return Object.keys(subUnits.Backs);
    return [];
  };

  // Reset sub-unit filter when position filter changes
  const handlePositionFilterChange = (value: string) => {
    setPositionFilter(value);
    setUnitFilter("all"); // Reset sub-unit when main position changes
  };

  // Calculate top performers based on filtered players
  const calculateTopPerformers = (playersToAnalyze: PlayerWorkrate[]) => {
    if (playersToAnalyze.length === 0) {
      return {
        distanceLeader: null,
        speedLeader: null,
        sprintLeader: null,
        loadLeader: null
      };
    }

    // Distance Leader (highest totalDistance)
    const distanceLeader = playersToAnalyze.reduce((prev: PlayerWorkrate, current: PlayerWorkrate) => 
      (current.totalDistance > prev.totalDistance) ? current : prev
    );

    // Speed Leader (highest maxVelocity)
    const speedLeader = playersToAnalyze.reduce((prev: PlayerWorkrate, current: PlayerWorkrate) => 
      (current.maxVelocity > prev.maxVelocity) ? current : prev
    );

    // Sprint Leader (highest sprintDistance)
    const sprintLeader = playersToAnalyze.reduce((prev: PlayerWorkrate, current: PlayerWorkrate) => 
      (current.sprintDistance > prev.sprintDistance) ? current : prev
    );

    // Load Leader (highest dynamicStressLoad)
    const loadLeader = playersToAnalyze.reduce((prev: PlayerWorkrate, current: PlayerWorkrate) => 
      (current.dynamicStressLoad > prev.dynamicStressLoad) ? current : prev
    );

    return {
      distanceLeader,
      speedLeader,
      sprintLeader,
      loadLeader
    };
  };

  // API Integration for StatSports Database (Stage 3 Complete)
  const { data: workrateData, isLoading } = useQuery({
    queryKey: ["/api/v2/training-workrate/latest"],
    refetchInterval: false, // Only refresh on upload, not automatic polling
    staleTime: Infinity, // Cache indefinitely until manual refresh
  });

  // Extract data from API response with fallback
  const currentSessionData = workrateData?.session || currentSession;
  const playerWorkrateDataLive = workrateData?.playerData || playerWorkrateData;
  const [sessionNotes, setSessionNotes] = useState(currentSessionData.notes);
  const queryClient = useQueryClient();

  // Staff functionality state
  const [playerNotes, setPlayerNotes] = useState<Record<string, string>>({});

  // Staff Actions
  const savePlayerNote = async (playerId: string, note: string) => {
    try {
      await apiRequest("/api/training-workrate/player-notes", {
        method: "POST",
        body: { playerId, note, sessionId: currentSessionData.sessionId }
      });
      setPlayerNotes(prev => ({ ...prev, [playerId]: note }));
    } catch (error) {
      console.error("Failed to save player note:", error);
    }
  };

  const saveSessionNotes = async () => {
    try {
      await apiRequest("/api/training-workrate/session-notes", {
        method: "POST",
        body: { sessionId: currentSessionData.sessionId, notes: sessionNotes }
      });
      setIsEditingNotes(false);
    } catch (error) {
      console.error("Failed to save session notes:", error);
    }
  };

  // Enhanced filtering logic with cascading dropdowns
  const filteredPlayers = playerWorkrateDataLive.filter((player: PlayerWorkrate) => {
    const matchesSearch = player.playerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         player.position.toLowerCase().includes(searchFilter.toLowerCase());
    
    // First level: Position group filtering
    let matchesPosition = positionFilter === "all";
    if (positionFilter === "Forwards") {
      matchesPosition = positionGroups.Forwards.includes(player.position);
    } else if (positionFilter === "Backs") {
      matchesPosition = positionGroups.Backs.includes(player.position);
    }
    
    // Second level: Sub-unit filtering (only if position filter is active and sub-unit is selected)
    let matchesUnit = unitFilter === "all";
    if (unitFilter !== "all" && positionFilter !== "all") {
      if (positionFilter === "Forwards" && subUnits.Forwards[unitFilter as keyof typeof subUnits.Forwards]) {
        matchesUnit = subUnits.Forwards[unitFilter as keyof typeof subUnits.Forwards].includes(player.position);
      } else if (positionFilter === "Backs" && subUnits.Backs[unitFilter as keyof typeof subUnits.Backs]) {
        matchesUnit = subUnits.Backs[unitFilter as keyof typeof subUnits.Backs].includes(player.position);
      }
    }
    
    return matchesSearch && matchesPosition && matchesUnit;
  });

  // Calculate top performers using filtered players
  const topPerformers = calculateTopPerformers(filteredPlayers);

  // 3-Tier Dashboard Navigation Functions
  const handleWeekSelect = (weekId: string) => {
    setSelectedWeek(weekId);
    setCurrentView("weekly");
  };

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSession(sessionId);
    setCurrentView("gps");
  };

  const handleBackToSeason = () => {
    setCurrentView("season");
    setSelectedWeek(null);
    setSelectedSession(null);
    window.location.hash = "";
  };

  const handleBackToWeekly = () => {
    setCurrentView("weekly");
    setSelectedSession(null);
    window.location.hash = selectedWeek || "";
  };

  // Render appropriate dashboard based on current view
  if (currentView === "season") {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader
          title="StatSports Training Command Center"
          breadcrumbs={[
            { label: "Main", href: "/" },
            { label: "S&C Portal", href: "/sc-portal" },
            { label: "Season Overview" }
          ]}
          backButton={{
            label: "Back to S&C Portal",
            href: "/sc-portal"
          }}
        />
        <div className="p-6">
          <SeasonOverviewDashboard onWeekSelect={handleWeekSelect} />
        </div>
      </div>
    );
  }

  if (currentView === "weekly" && selectedWeek) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader
          title={`${selectedWeek.replace('week', 'Week ')} Training Focus`}
          breadcrumbs={[
            { label: "Main", href: "/" },
            { label: "S&C Portal", href: "/sc-portal" },
            { label: "Season Overview", href: "/training-workrate" },
            { label: selectedWeek.replace('week', 'Week ') }
          ]}
        />
        <div className="p-6">
          <WeeklyFocusDashboard 
            weekId={selectedWeek} 
            onBackToSeason={handleBackToSeason}
            onSessionSelect={handleSessionSelect}
          />
        </div>
      </div>
    );
  }

  if (currentView === "gps" && selectedWeek && selectedSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader
          title="GPS Deep-Dive Analysis"
          breadcrumbs={[
            { label: "Main", href: "/" },
            { label: "S&C Portal", href: "/sc-portal" },
            { label: "Season Overview", href: "/training-workrate" },
            { label: selectedWeek.replace('week', 'Week '), href: `#${selectedWeek}` },
            { label: "GPS Analysis" }
          ]}
        />
        <div className="p-6">
          <GPSDeepDiveDashboard 
            weekId={selectedWeek}
            sessionId={selectedSession}
            onBackToWeekly={handleBackToWeekly}
          />
        </div>
      </div>
    );
  }

  // Fallback to legacy interface if no valid view state
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        title="Training Workrate Monitor"
        breadcrumbs={[
          { label: "Main", href: "/" },
          { label: "S&C Portal", href: "/sc-portal" },
          { label: "Training Workrate" }
        ]}
        backButton={{
          label: "Back to S&C Portal",
          href: "/sc-portal"
        }}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
              <Play className="h-3 w-3 mr-1" />
              Session Active
            </Badge>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-nh-red-600">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        }
      />

      {/* Enhanced Session Context Card */}
      <div className="p-6">
        <Card className="mb-6 border-l-4 border-l-nh-red shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {currentSessionData.date}: Week {currentSessionData.week}, Day {currentSessionData.day} - {currentSessionData.title}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Training Session Analysis & Monitoring</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={currentSession.status === "Active" ? "default" : "secondary"}
                  className={currentSession.status === "Active" ? "bg-green-600 text-white" : ""}
                >
                  <Play className="h-3 w-3 mr-1" />
                  {currentSession.status}
                </Badge>
                <Badge variant="outline" className="border-nh-red text-nh-red">
                  RPE {currentSession.rpe}/10
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Basic Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                  <p className="font-semibold">{currentSession.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Time</p>
                  <p className="font-semibold">{currentSession.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                  <p className="font-semibold text-sm">{currentSession.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Participants</p>
                  <p className="font-semibold">{currentSession.participants} players</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Weather</p>
                  <p className="font-semibold">{currentSession.weather.temperature}°C, {currentSession.weather.conditions}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                  <p className="font-semibold">{currentSession.duration} min</p>
                </div>
              </div>
            </div>

            {/* Session Notes - Editable by S&C Staff */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Session Notes
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                  className="flex items-center gap-2"
                >
                  {isEditingNotes ? (
                    <>
                      <Save className="h-4 w-4" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Session Objective</label>
                  {isEditingNotes ? (
                    <Textarea
                      value={sessionNotes.objective}
                      onChange={(e) => setSessionNotes({...sessionNotes, objective: e.target.value})}
                      className="min-h-[80px]"
                      placeholder="e.g., Focus on defensive system under fatigue"
                    />
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg border min-h-[80px]">
                      <p className="text-sm">{sessionNotes.objective}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Intended Exertion</label>
                  {isEditingNotes ? (
                    <Textarea
                      value={sessionNotes.intendedExertion}
                      onChange={(e) => setSessionNotes({...sessionNotes, intendedExertion: e.target.value})}
                      className="min-h-[80px]"
                      placeholder="e.g., High (9/10 RPE) - 'Bust a Gut' day"
                    />
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg border min-h-[80px]">
                      <p className="text-sm">{sessionNotes.intendedExertion}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Field/Weather Conditions</label>
                  {isEditingNotes ? (
                    <Textarea
                      value={sessionNotes.fieldWeatherConditions}
                      onChange={(e) => setSessionNotes({...sessionNotes, fieldWeatherConditions: e.target.value})}
                      className="min-h-[80px]"
                      placeholder="e.g., Field 2, Heavy Rain, Soft Ground"
                    />
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg border min-h-[80px]">
                      <p className="text-sm">{sessionNotes.fieldWeatherConditions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Summary Infometrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Distance</p>
                  <p className="text-2xl font-bold text-gray-900">{teamSummaryMetrics.totalDistance.average.toLocaleString()}m</p>
                  <p className="text-xs text-gray-600">
                    Range: {teamSummaryMetrics.totalDistance.range.min.toLocaleString()}m - {teamSummaryMetrics.totalDistance.range.max.toLocaleString()}m
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className={`h-3 w-3 ${teamSummaryMetrics.totalDistance.trend === 'up' ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-xs text-green-600">↑ 12% vs last session</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">High-Speed Running</p>
                  <p className="text-2xl font-bold text-gray-900">{teamSummaryMetrics.highSpeedRunning.average}m</p>
                  <p className="text-xs text-gray-600">
                    Range: {teamSummaryMetrics.highSpeedRunning.range.min}m - {teamSummaryMetrics.highSpeedRunning.range.max}m
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className={`h-3 w-3 ${teamSummaryMetrics.highSpeedRunning.trend === 'up' ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-xs text-green-600">↑ 8% vs last session</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Player Load</p>
                  <p className="text-2xl font-bold text-gray-900">{teamSummaryMetrics.playerLoad.average}</p>
                  <p className="text-xs text-gray-600">
                    Range: {teamSummaryMetrics.playerLoad.range.min} - {teamSummaryMetrics.playerLoad.range.max}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-600">Stable vs last session</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Max Velocity</p>
                  <p className="text-2xl font-bold text-gray-900">{teamSummaryMetrics.maxVelocity.average} km/h</p>
                  <p className="text-xs text-gray-600">
                    Range: {teamSummaryMetrics.maxVelocity.range.min} - {teamSummaryMetrics.maxVelocity.range.max} km/h
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-600">Stable vs last session</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers Leaderboard */}
        <Card className="mb-6 border-l-4 border-l-yellow-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Top Performers
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={positionFilter} onValueChange={handlePositionFilterChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Forwards">Forwards</SelectItem>
                    <SelectItem value="Backs">Backs</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={unitFilter} 
                  onValueChange={setUnitFilter}
                  disabled={positionFilter === "all"}
                >
                  <SelectTrigger className={`w-40 ${positionFilter === "all" ? "opacity-50" : ""}`}>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {getAvailableSubUnits().map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Distance Leader */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Distance Leader</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-800">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {topPerformers.distanceLeader ? topPerformers.distanceLeader.playerName : "No data"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {topPerformers.distanceLeader ? `${topPerformers.distanceLeader.totalDistance.toLocaleString()}m` : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Speed Leader */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Speed Leader</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-800">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {topPerformers.speedLeader ? topPerformers.speedLeader.playerName : "No data"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {topPerformers.speedLeader ? `${(topPerformers.speedLeader.maxVelocity * 3.6).toFixed(1)} km/h` : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sprint Leader */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Sprint Leader</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-800">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {topPerformers.sprintLeader ? topPerformers.sprintLeader.playerName : "No data"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {topPerformers.sprintLeader ? `${topPerformers.sprintLeader.sprintDistance}m sprints` : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Load Leader */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Load Leader</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-800">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {topPerformers.loadLeader ? topPerformers.loadLeader.playerName : "No data"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {topPerformers.loadLeader ? `${topPerformers.loadLeader.dynamicStressLoad} load` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Interface with Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white border-2 border-gray-200 p-1 rounded-xl shadow-sm gap-1 h-10">
              <TabsTrigger 
                value="team-overview" 
                className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1 h-full"
              >
                <Users className="h-4 w-4" />
                Team Overview
              </TabsTrigger>
              <TabsTrigger 
                value="positional-analysis" 
                className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1 h-full"
              >
                <Shield className="h-4 w-4" />
                Positional Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="load-management" 
                className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1 h-full"
              >
                <AlertTriangle className="h-4 w-4" />
                Load Management
              </TabsTrigger>
              <TabsTrigger 
                value="ai-insights" 
                className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1 h-full"
              >
                <Brain className="h-4 w-4" />
                AI Insights
              </TabsTrigger>
            </TabsList>

            {/* Search and Filter Controls */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search players..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Team Overview Tab - Default */}
          <TabsContent value="team-overview" className="space-y-6">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Player Performance Monitor</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "kanban" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("kanban")}
                  >
                    Kanban Cards
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                  >
                    Table View
                  </Button>
                </div>
                <p className="text-sm text-gray-500">{filteredPlayers.length} players active</p>
              </div>
            </div>

            {/* StatSports Kanban Cards */}
            {viewMode === "kanban" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map((player) => (
                  <Card key={player.playerId} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-nh-red">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Player Photo/Avatar */}
                          <div className="h-12 w-12 bg-gradient-to-br from-nh-red to-red-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="font-bold text-white text-sm">
                              {player.playerName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{player.playerName}</h4>
                            <p className="text-sm text-gray-600">{player.position}</p>
                          </div>
                        </div>
                        {/* Load Status Traffic Light */}
                        <div className="flex flex-col items-center gap-1">
                          <div className={`h-3 w-3 rounded-full ${
                            player.loadStatus === "green" ? "bg-green-500" :
                            player.loadStatus === "amber" ? "bg-yellow-500" :
                            "bg-red-500"
                          }`}></div>
                          <span className="text-xs text-gray-500">ACWR</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* DSL Gauge - Main Output */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Gauge className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">Dynamic Stress Load</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <RadialGauge
                              value={player.dynamicStressLoad}
                              max={Math.max(player.personalDSLAverage * 1.5, player.positionalDSLAverage * 1.5)}
                              label="DSL"
                              color="purple"
                            />
                            <div className="text-sm">
                              <p className="font-bold text-lg">{player.dynamicStressLoad}</p>
                              <p className="text-gray-500">Personal: {player.personalDSLAverage}</p>
                              <p className="text-gray-500">Position: {player.positionalDSLAverage}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key StatSports Metrics */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <Target className="h-3 w-3 text-blue-600" />
                            <span className="text-blue-800 font-medium">Distance</span>
                          </div>
                          <p className="font-bold">{player.totalDistance.toLocaleString()}m</p>
                          <p className="text-xs text-gray-600">{player.metresPerMinute} m/min</p>
                        </div>

                        <div className="bg-orange-50 p-2 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <Zap className="h-3 w-3 text-orange-600" />
                            <span className="text-orange-800 font-medium">HSR</span>
                          </div>
                          <p className="font-bold">{player.highSpeedRunningDistance}m</p>
                          <p className="text-xs text-gray-600">Sprint: {player.sprintDistance}m</p>
                        </div>

                        <div className="bg-green-50 p-2 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <ArrowUp className="h-3 w-3 text-green-600" />
                            <span className="text-green-800 font-medium">Accelerations</span>
                          </div>
                          <p className="font-bold">{player.accelerations.total}</p>
                          <p className="text-xs text-gray-600">High: {player.accelerations.high}</p>
                        </div>

                        <div className="bg-red-50 p-2 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <Activity className="h-3 w-3 text-red-600" />
                            <span className="text-red-800 font-medium">Impacts</span>
                          </div>
                          <p className="font-bold">{player.impacts}</p>
                          <p className="text-xs text-gray-600">Max: {player.maxVelocity.toFixed(1)} m/s</p>
                        </div>
                      </div>

                      {/* Rugby-Specific Metrics */}
                      <div className="border-t pt-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">HMLD</span>
                            <p className="font-semibold">{player.highMetabolicLoadDistance}m</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Involvements</span>
                            <p className="font-semibold">{player.involvements}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">ACWR</span>
                            <p className={`font-semibold ${
                              player.acwr < 1.0 ? "text-blue-600" :
                              player.acwr > 1.3 ? "text-red-600" :
                              "text-green-600"
                            }`}>{player.acwr.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Status</span>
                            <Badge 
                              variant={
                                player.performanceStatus === "Excellent" ? "default" :
                                player.performanceStatus === "Good" ? "secondary" :
                                player.performanceStatus === "Moderate" ? "outline" :
                                "destructive"
                              }
                              className={`text-xs ${
                                player.performanceStatus === "Excellent" ? "bg-green-600" :
                                player.performanceStatus === "Good" ? "bg-blue-600" : ""
                              }`}
                            >
                              {player.performanceStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Availability Status */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge 
                          variant="outline" 
                          className={
                            player.availability === "Available" ? "border-green-300 text-green-700 bg-green-50" :
                            player.availability === "Modified" ? "border-yellow-300 text-yellow-700 bg-yellow-50" :
                            "border-red-300 text-red-700 bg-red-50"
                          }
                        >
                          {player.availability === "Available" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {player.availability === "Modified" && <Circle className="h-3 w-3 mr-1" />}
                          {player.availability === "Injured" && <XCircle className="h-3 w-3 mr-1" />}
                          {player.availability}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View Details
                        </Button>
                      </div>

                      {/* Staff Actions - Stage 4 */}
                      <div className="flex items-center gap-2 pt-3 border-t bg-gray-50 -mx-6 px-6 -mb-6 pb-4">
                        <PlayerNotesDialog 
                          player={player} 
                          onSaveNote={savePlayerNote} 
                        />
                        <SnapshotGenerator 
                          player={player} 
                          sessionData={currentSessionData} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-4 font-medium">Player</th>
                          <th className="text-left p-4 font-medium">DSL</th>
                          <th className="text-left p-4 font-medium">Distance</th>
                          <th className="text-left p-4 font-medium">HSR</th>
                          <th className="text-left p-4 font-medium">Sprint</th>
                          <th className="text-left p-4 font-medium">Accelerations</th>
                          <th className="text-left p-4 font-medium">Impacts</th>
                          <th className="text-left p-4 font-medium">ACWR</th>
                          <th className="text-left p-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPlayers.map((player) => (
                          <tr key={player.playerId} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-gradient-to-br from-nh-red to-red-600 rounded-full flex items-center justify-center">
                                  <span className="font-bold text-white text-xs">
                                    {player.playerName.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{player.playerName}</p>
                                  <p className="text-xs text-gray-500">{player.position}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${
                                  player.loadStatus === "green" ? "bg-green-500" :
                                  player.loadStatus === "amber" ? "bg-yellow-500" :
                                  "bg-red-500"
                                }`}></div>
                                <span className="font-medium">{player.dynamicStressLoad}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-medium">{player.totalDistance.toLocaleString()}m</span>
                              <div className="text-xs text-gray-500">{player.metresPerMinute} m/min</div>
                            </td>
                            <td className="p-4">
                              <span className="font-medium">{player.highSpeedRunningDistance}m</span>
                            </td>
                            <td className="p-4">
                              <span className="font-medium">{player.sprintDistance}m</span>
                            </td>
                            <td className="p-4">
                              <span className="font-medium">{player.accelerations.total}</span>
                              <div className="text-xs text-gray-500">High: {player.accelerations.high}</div>
                            </td>
                            <td className="p-4">
                              <span className="font-medium">{player.impacts}</span>
                            </td>
                            <td className="p-4">
                              <span className={`font-medium ${
                                player.acwr < 1.0 ? "text-blue-600" :
                                player.acwr > 1.3 ? "text-red-600" :
                                "text-green-600"
                              }`}>{player.acwr.toFixed(2)}</span>
                            </td>
                            <td className="p-4">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  player.availability === "Available" ? "border-green-300 text-green-700" :
                                  player.availability === "Modified" ? "border-yellow-300 text-yellow-700" :
                                  "border-red-300 text-red-700"
                                }`}
                              >
                                {player.availability}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Positional Analysis Tab */}
          <TabsContent value="positional-analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Positional Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Position-Based Analytics</h3>
                  <p className="text-gray-500">Forwards vs Backs comparison, positional averages, and unit-specific insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Load Management Tab */}
          <TabsContent value="load-management" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Acute:Chronic Workload Ratio (ACWR) Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Load Management Dashboard</h3>
                  <p className="text-gray-500">ACWR calculations, injury risk flags, and load trend analysis</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab - Stage 4 Complete */}
          <TabsContent value="ai-insights" className="space-y-6">
            <AIInsightsPanel 
              sessionData={currentSessionData}
              playerData={playerWorkrateDataLive}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}