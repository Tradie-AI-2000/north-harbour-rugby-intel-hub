import { useState, useEffect, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { 
  Plus, 
  Download, 
  RotateCcw,
  Target,
  MapPin,
  TrendingUp,
  Brain,
  Eye,
  Clock,
  Activity,
  Zap,
  Edit,
  ArrowLeft
} from "lucide-react";

// Match data for context
const matchData = {
  "nh_vs_auckland_2024": { homeTeam: "North Harbour", awayTeam: "Auckland", venue: "North Harbour Stadium", date: "Saturday 1 June 2024" },
  "canterbury_vs_nh_2024": { homeTeam: "Canterbury", awayTeam: "North Harbour", venue: "Orangetheory Stadium", date: "Friday 7 June 2024" },
  "nh_vs_wellington_2024": { homeTeam: "North Harbour", awayTeam: "Wellington", venue: "North Harbour Stadium", date: "Saturday 14 June 2024" },
  "otago_vs_nh_2024": { homeTeam: "Otago", awayTeam: "North Harbour", venue: "Forsyth Barr Stadium", date: "Friday 21 June 2024" },
  "nh_vs_tasman_2024": { homeTeam: "North Harbour", awayTeam: "Tasman", venue: "North Harbour Stadium", date: "Saturday 28 June 2024" }
};

interface Try {
  id: string;
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  type: string;
  team: 'home' | 'away';
  // New analytical metrics
  zone: 'attacking_22' | 'attacking_22m_halfway' | 'defending_22m_halfway' | 'defending_22';
  quarter: 1 | 2 | 3 | 4;
  phase: 'phase_1' | 'phase_2_3' | 'phase_4_6' | 'phase_7_plus';
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

interface TryAnalysisProps {
  embedded?: boolean;
  matchId?: string;
}

function TryAnalysisSimplified(props: TryAnalysisProps = {}) {
  const { embedded = false, matchId: propMatchId } = props;
  // Get match ID from URL params or props
  const [match, params] = useRoute("/match-performance/:matchId/try-analysis");
  const matchId = propMatchId || params?.matchId || "nh_vs_auckland_2024";
  const currentMatch = matchData[matchId as keyof typeof matchData] || matchData["nh_vs_auckland_2024"];
  
  // Determine team names based on match context
  const isNorthHarbourHome = currentMatch.homeTeam === "North Harbour";
  const northHarbourLabel = "North Harbour";
  const oppositionLabel = isNorthHarbourHome ? currentMatch.awayTeam : currentMatch.homeTeam;

  // Firebase OPTA data integration for real try data
  const { data: optaData = [], isLoading: optaLoading } = useQuery({
    queryKey: ["/api/firebase/opta-data"],
    refetchInterval: 10000,
  });

  const [tries, setTries] = useState<Try[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");

  // Extract try data from Firebase OPTA data
  useEffect(() => {
    if (optaData && optaData.length > 0) {
      const matchOptaData = optaData.find((match: any) => 
        match.matchId === matchId || 
        match.match?.includes(currentMatch.homeTeam) || 
        match.match?.includes(currentMatch.awayTeam)
      );
      
      if (matchOptaData && matchOptaData.tries) {
        // Convert OPTA try data to our try format
        const convertedTries = matchOptaData.tries.map((tryData: any, index: number) => ({
          id: `opta_try_${index}`,
          x: tryData.x_position || Math.random() * 100,
          y: tryData.y_position || Math.random() * 100,
          type: tryData.source || "lineout",
          team: tryData.team === "North Harbour" ? 'home' : 'away',
          zone: tryData.zone || 'attacking_22',
          quarter: tryData.quarter || 1,
          phase: tryData.phase || 'phase_1'
        }));
        setTries(convertedTries);
      }
    }
  }, [optaData, matchId, currentMatch]);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [isPlacingTry, setIsPlacingTry] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  
  // Editing state for try details
  const [editingTry, setEditingTry] = useState<Try | null>(null);
  const [editQuarter, setEditQuarter] = useState<string>("");
  const [editPhase, setEditPhase] = useState<string>("");
  
  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingViewChange, setPendingViewChange] = useState<'home' | 'away' | null>(null);
  
  // Multi-team data management
  const [homeTeamTries, setHomeTeamTries] = useState<Try[]>([]);
  const [awayTeamTries, setAwayTeamTries] = useState<Try[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'away'>('home');
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [pendingView, setPendingView] = useState<'home' | 'away' | null>(null);

  // Chart colors
  const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  // Function to detect zone based on Y coordinate
  const detectZone = (y: number): 'attacking_22' | 'attacking_22m_halfway' | 'defending_22m_halfway' | 'defending_22' => {
    if (y >= 80) return 'attacking_22'; // Bottom 20% of pitch
    if (y >= 50) return 'attacking_22m_halfway'; // 50-80%
    if (y >= 20) return 'defending_22m_halfway'; // 20-50%
    return 'defending_22'; // Top 20%
  };

  // Get current team's tries based on view
  const currentTries = currentView === 'home' ? homeTeamTries : awayTeamTries;
  
  // Calculate analytical metrics for current team
  const zoneData = useMemo(() => {
    const zones = ['attacking_22', 'attacking_22m_halfway', 'defending_22m_halfway', 'defending_22'];
    return zones.map(zone => ({
      name: zone.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: currentTries.filter(t => t.zone === zone).length,
      percentage: currentTries.length > 0 ? Math.round((currentTries.filter(t => t.zone === zone).length / currentTries.length) * 100) : 0
    }));
  }, [currentTries]);

  const quarterData = useMemo(() => {
    const quarters = [1, 2, 3, 4];
    return quarters.map(quarter => ({
      name: `Q${quarter}`,
      value: currentTries.filter(t => t.quarter === quarter).length,
      percentage: currentTries.length > 0 ? Math.round((currentTries.filter(t => t.quarter === quarter).length / currentTries.length) * 100) : 0
    }));
  }, [currentTries]);

  const phaseData = useMemo(() => {
    const phases = ['phase_1', 'phase_2_3', 'phase_4_6', 'phase_7_plus'];
    const phaseLabels = ['Phase 1', 'Phase 2-3', 'Phase 4-6', 'Phase 7+'];
    return phases.map((phase, index) => ({
      name: phaseLabels[index],
      value: currentTries.filter(t => t.phase === phase).length,
      percentage: currentTries.length > 0 ? Math.round((currentTries.filter(t => t.phase === phase).length / currentTries.length) * 100) : 0
    }));
  }, [currentTries]);

  const sourceData = useMemo(() => {
    const sources = tryTypes.map(t => t.value);
    return sources.map(source => ({
      name: tryTypes.find(t => t.value === source)?.label || source,
      value: currentTries.filter(t => t.type === source).length,
      percentage: currentTries.length > 0 ? Math.round((currentTries.filter(t => t.type === source).length / currentTries.length) * 100) : 0
    })).filter(item => item.value > 0);
  }, [currentTries]);

  const handleMouseMove = (event: React.MouseEvent<SVGElement>) => {
    if (!isPlacingTry) {
      setMousePosition(null);
      return;
    }

    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const svgX = (mouseX / rect.width) * 400;
    const svgY = (mouseY / rect.height) * 600;
    
    setMousePosition({ x: svgX, y: svgY });
  };

  const handlePitchClick = (event: React.MouseEvent<SVGElement>) => {
    if (!isPlacingTry || !selectedType) return;

    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    const svgX = (clickX / rect.width) * 400;
    const svgY = (clickY / rect.height) * 600;
    
    const x = (svgX / 400) * 100;
    const y = (svgY / 600) * 100;

    const detectedZone = detectZone(y);

    const newTry: Try = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      type: selectedType,
      team: selectedTeam,
      zone: detectedZone,
      quarter: 1, // Default, will be edited
      phase: 'phase_1' // Default, will be edited
    };

    // Add to the appropriate team's data
    if (currentView === 'home') {
      setHomeTeamTries([...homeTeamTries, newTry]);
    } else {
      setAwayTeamTries([...awayTeamTries, newTry]);
    }
    
    setIsPlacingTry(false);
    setMousePosition(null);
  };

  const handleTryClick = (tryItem: Try, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingTry(tryItem);
    setEditQuarter(tryItem.quarter.toString());
    setEditPhase(tryItem.phase);
  };

  const saveTryEdit = () => {
    if (!editingTry) return;
    
    const updatedTry = {
      ...editingTry,
      quarter: parseInt(editQuarter) as 1 | 2 | 3 | 4,
      phase: editPhase as 'phase_1' | 'phase_2_3' | 'phase_4_6' | 'phase_7_plus'
    };

    if (currentView === 'home') {
      setHomeTeamTries(homeTeamTries.map(t => t.id === editingTry.id ? updatedTry : t));
    } else {
      setAwayTeamTries(awayTeamTries.map(t => t.id === editingTry.id ? updatedTry : t));
    }
    
    setEditingTry(null);
    setEditQuarter("");
    setEditPhase("");
  };

  const deleteTry = (id: string) => {
    if (currentView === 'home') {
      setHomeTeamTries(homeTeamTries.filter(t => t.id !== id));
    } else {
      setAwayTeamTries(awayTeamTries.filter(t => t.id !== id));
    }
  };

  const clearAll = () => {
    if (currentView === 'home') {
      setHomeTeamTries([]);
    } else {
      setAwayTeamTries([]);
    }
  };

  // Handle team view switching with immediate save prompt
  const handleTeamViewChange = (newView: 'home' | 'away') => {
    if (newView === currentView) return;
    
    const currentTeamHasData = currentView === 'home' ? homeTeamTries.length > 0 : awayTeamTries.length > 0;
    
    // Always show save prompt when switching teams if there's data
    if (currentTeamHasData) {
      setPendingView(newView);
      setShowSavePrompt(true);
    } else {
      // No data, switch immediately
      setCurrentView(newView);
      setSelectedTeam(newView);
    }
  };

  const confirmTeamSwitch = (saveData: boolean) => {
    if (saveData) {
      // Data is already saved in state, just switch views
      const teamName = currentView === 'home' 
        ? (isNorthHarbourHome ? northHarbourLabel : oppositionLabel)
        : (isNorthHarbourHome ? oppositionLabel : northHarbourLabel);
      console.log(`Data saved for ${teamName}`);
    }
    
    // Switch to the pending view
    if (pendingView) {
      setCurrentView(pendingView);
      setSelectedTeam(pendingView);
      setPendingView(null);
    }
    setShowSavePrompt(false);
  };

  const getTryTypeConfig = (type: string) => {
    return tryTypes.find(t => t.value === type) || tryTypes[0];
  };

  const exportData = () => {
    const csv = [
      'Team,Try Type,Zone,Quarter,Phase,X Position,Y Position',
      ...tries.map(t => `${t.team},${t.type},${t.zone},${t.quarter},${t.phase},${t.x.toFixed(2)},${t.y.toFixed(2)}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'try-analysis.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // AI Analysis function with comparative data
  const generateAIAnalysis = async () => {
    const hasCurrentData = currentTries.length > 0;
    const hasOppositionData = currentView === 'home' ? awayTeamTries.length > 0 : homeTeamTries.length > 0;
    
    if (!hasCurrentData) return;
    
    setIsAnalyzing(true);
    try {
      const oppositionTries = currentView === 'home' ? awayTeamTries : homeTeamTries;
      
      // Determine if current view is North Harbour or opposition
      const currentTeamName = currentView === 'home' 
        ? (isNorthHarbourHome ? northHarbourLabel : oppositionLabel)
        : (isNorthHarbourHome ? oppositionLabel : northHarbourLabel);
      
      const isCurrentTeamNorthHarbour = currentTeamName === "North Harbour";
      const analysisPerspective = isCurrentTeamNorthHarbour ? 'attacking' : 'defensive';
      
      const analysisData = {
        currentTeam: {
          name: currentTeamName,
          totalTries: currentTries.length,
          zoneBreakdown: zoneData,
          quarterBreakdown: quarterData,
          phaseBreakdown: phaseData,
          sourceBreakdown: sourceData,
          rawData: currentTries,
          isNorthHarbour: isCurrentTeamNorthHarbour
        },
        oppositionTeam: hasOppositionData ? {
          name: currentView === 'home' 
            ? (isNorthHarbourHome ? oppositionLabel : northHarbourLabel)
            : (isNorthHarbourHome ? northHarbourLabel : oppositionLabel),
          totalTries: oppositionTries.length,
          rawData: oppositionTries,
          isNorthHarbour: (currentView === 'home' 
            ? (isNorthHarbourHome ? oppositionLabel : northHarbourLabel)
            : (isNorthHarbourHome ? northHarbourLabel : oppositionLabel)) === "North Harbour"
        } : null,
        comparative: hasOppositionData,
        analysisFrom: 'north_harbour', // Always analyze from North Harbour perspective
        analysisPerspective: analysisPerspective, // 'attacking' when NH scoring, 'defensive' when opposition scoring
        matchContext: {
          homeTeam: currentMatch.homeTeam,
          awayTeam: currentMatch.awayTeam,
          venue: currentMatch.venue,
          date: currentMatch.date
        }
      };

      const response = await fetch('/api/ai/try-analysis-comparative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI analysis');
      }

      const result = await response.json();
      setAiAnalysis(result.analysis);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      setAiAnalysis('Unable to generate AI analysis at this time. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save try analysis data
  const saveTryAnalysisData = async (clearAfterSave = false) => {
    const currentTeamName = currentView === 'home' 
      ? (isNorthHarbourHome ? northHarbourLabel : oppositionLabel)
      : (isNorthHarbourHome ? oppositionLabel : northHarbourLabel);
    
    const isCurrentTeamNorthHarbour = currentTeamName === "North Harbour";
    const analysisPerspective = isCurrentTeamNorthHarbour ? 'attacking' : 'defensive';

    setIsSaving(true);
    try {
      const response = await fetch('/api/try-analysis/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          teamName: currentTeamName,
          isNorthHarbour: isCurrentTeamNorthHarbour,
          analysisPerspective,
          tries: currentTries,
          zoneBreakdown: zoneData,
          quarterBreakdown: quarterData,
          phaseBreakdown: phaseData,
          sourceBreakdown: sourceData,
          aiAnalysis
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save try analysis data');
      }

      const result = await response.json();
      setLastSaved(new Date().toLocaleTimeString());
      setHasUnsavedChanges(false);
      
      // Clear data if requested (for team switching)
      if (clearAfterSave) {
        setHomeTeamTries([]);
        setAwayTeamTries([]);
        setAiAnalysis("");
      }
      
      // Complete pending view change if any
      if (pendingViewChange) {
        setCurrentView(pendingViewChange);
        setPendingViewChange(null);
      }
      
      // Show success message briefly
      setTimeout(() => setLastSaved(null), 3000);
    } catch (error) {
      console.error('Error saving try analysis data:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle team view switching with save prompt
  const handleViewChange = (newView: 'home' | 'away') => {
    if (newView === currentView) return;
    
    // Check if there are unsaved changes
    if (hasUnsavedChanges && currentTries.length > 0) {
      const currentTeamName = currentView === 'home' 
        ? (isNorthHarbourHome ? northHarbourLabel : oppositionLabel)
        : (isNorthHarbourHome ? oppositionLabel : northHarbourLabel);
      
      const proceed = window.confirm(
        `You have unsaved data for ${currentTeamName}. Would you like to save it before switching teams?`
      );
      
      if (proceed) {
        setPendingViewChange(newView);
        saveTryAnalysisData(true); // Save and clear
      } else {
        // Switch without saving, clear current data
        setHomeTeamTries([]);
        setAwayTeamTries([]);
        setAiAnalysis("");
        setCurrentView(newView);
        setHasUnsavedChanges(false);
      }
    } else {
      // No unsaved changes, switch directly
      setCurrentView(newView);
    }
  };

  // Track unsaved changes when tries are added/modified
  useEffect(() => {
    if (currentTries.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [currentTries]);

  // Auto-generate analysis when data changes (with debounce)
  useEffect(() => {
    if (currentTries.length > 0) {
      const timeoutId = setTimeout(() => {
        generateAIAnalysis();
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
    } else {
      setAiAnalysis("");
    }
  }, [currentTries, homeTeamTries, awayTeamTries, currentView]);

  return (
    <div className={embedded ? "" : "min-h-screen bg-gray-50 p-6"}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - only show when not embedded */}
        {!embedded && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/match-performance/${matchId}`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Match
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Try Analysis - {currentMatch.homeTeam} vs {currentMatch.awayTeam}</h1>
                <p className="text-gray-600 mt-2">
                  Interactive rugby pitch with zone detection and analytical insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Team View Selector */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Viewing:</Label>
              <div className="flex rounded-lg border">
                <Button
                  variant={currentView === 'home' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewChange('home')}
                  className="rounded-r-none"
                >
                  {isNorthHarbourHome ? northHarbourLabel : oppositionLabel} ({homeTeamTries.length})
                </Button>
                <Button
                  variant={currentView === 'away' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewChange('away')}
                  className="rounded-l-none"
                >
                  {isNorthHarbourHome ? oppositionLabel : northHarbourLabel} ({awayTeamTries.length})
                </Button>
              </div>
            </div>
            <Badge variant="outline">{currentTries.length} tries plotted</Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowControls(!showControls)}
              >
                {showControls ? 'Hide' : 'Show'} Controls
              </Button>
            </div>
          </div>
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
                    <Label>Team (Who scored the try?)</Label>
                    <Select value={selectedTeam} onValueChange={(value: 'home' | 'away') => setSelectedTeam(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">
                          <div className="flex items-center gap-2">
                            <span>{isNorthHarbourHome ? northHarbourLabel : oppositionLabel}</span>
                            {(isNorthHarbourHome ? northHarbourLabel : oppositionLabel) === "North Harbour" && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Us</Badge>
                            )}
                          </div>
                        </SelectItem>
                        <SelectItem value="away">
                          <div className="flex items-center gap-2">
                            <span>{isNorthHarbourHome ? oppositionLabel : northHarbourLabel}</span>
                            {(isNorthHarbourHome ? oppositionLabel : northHarbourLabel) === "North Harbour" && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Us</Badge>
                            )}
                          </div>
                        </SelectItem>
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

                  <Button 
                    onClick={() => saveTryAnalysisData()}
                    disabled={currentTries.length === 0 || isSaving}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Save Data
                      </>
                    )}
                  </Button>

                  {lastSaved && (
                    <div className="text-xs text-green-600 text-center">
                      Saved at {lastSaved}
                    </div>
                  )}
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
                    
                    {/* Zone Markings */}
                    {/* Defending 22 (0-20%) */}
                    <rect x="50" y="50" width="300" height="70" fill="rgba(239, 68, 68, 0.1)" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="2" strokeDasharray="5,5" />
                    <text x="200" y="90" textAnchor="middle" fill="rgba(239, 68, 68, 0.8)" fontSize="12" fontWeight="bold">Defending 22</text>
                    
                    {/* Defending 22m-Halfway (20-50%) */}
                    <rect x="50" y="120" width="300" height="180" fill="rgba(251, 146, 60, 0.1)" stroke="rgba(251, 146, 60, 0.3)" strokeWidth="2" strokeDasharray="5,5" />
                    <text x="200" y="210" textAnchor="middle" fill="rgba(251, 146, 60, 0.8)" fontSize="12" fontWeight="bold">Defending 22m-Halfway</text>
                    
                    {/* Attacking 22m-Halfway (50-80%) */}
                    <rect x="50" y="300" width="300" height="180" fill="rgba(34, 197, 94, 0.1)" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="2" strokeDasharray="5,5" />
                    <text x="200" y="390" textAnchor="middle" fill="rgba(34, 197, 94, 0.8)" fontSize="12" fontWeight="bold">Attacking 22m-Halfway</text>
                    
                    {/* Attacking 22 (80-100%) */}
                    <rect x="50" y="480" width="300" height="70" fill="rgba(59, 130, 246, 0.1)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" strokeDasharray="5,5" />
                    <text x="200" y="520" textAnchor="middle" fill="rgba(59, 130, 246, 0.8)" fontSize="12" fontWeight="bold">Attacking 22</text>
                    
                    {/* Pitch Lines */}
                    <line x1="50" y1="50" x2="50" y2="550" stroke="white" strokeWidth="3" />
                    <line x1="350" y1="50" x2="350" y2="550" stroke="white" strokeWidth="3" />
                    <line x1="50" y1="50" x2="350" y2="50" stroke="white" strokeWidth="3" />
                    <line x1="50" y1="550" x2="350" y2="550" stroke="white" strokeWidth="3" />
                    <line x1="50" y1="300" x2="350" y2="300" stroke="white" strokeWidth="2" />
                    <line x1="50" y1="120" x2="350" y2="120" stroke="white" strokeWidth="2" />
                    <line x1="50" y1="480" x2="350" y2="480" stroke="white" strokeWidth="2" />

                    {/* Mouse crosshair preview */}
                    {isPlacingTry && mousePosition && selectedType && (
                      <g opacity="0.8">
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
                    {currentTries.map(tryItem => {
                      const config = getTryTypeConfig(tryItem.type);
                      const x = (tryItem.x / 100) * 400;
                      const y = (tryItem.y / 100) * 600;
                      
                      return (
                        <g key={tryItem.id}>
                          <circle
                            cx={x}
                            cy={y}
                            r="10"
                            fill={config.color}
                            stroke={currentView === 'home' ? '#1E40AF' : '#DC2626'}
                            strokeWidth="2"
                            className="cursor-pointer hover:opacity-80"
                            onClick={(e) => handleTryClick(tryItem, e)}
                          />
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
                          <circle
                            cx={x + 12}
                            cy={y - 12}
                            r="6"
                            fill="rgba(0,0,0,0.7)"
                            className="cursor-pointer"
                            onClick={(e) => handleTryClick(tryItem, e)}
                          />
                          <Edit
                            x={x + 9}
                            y={y - 15}
                            width="6"
                            height="6"
                            fill="white"
                            className="pointer-events-none"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>Click on a try marker to edit Quarter and Phase details. Total tries: {currentTries.length}</p>
                  {isPlacingTry && (
                    <p className="text-blue-600 font-medium">
                      Click anywhere on the pitch to place a {getTryTypeConfig(selectedType).label} try
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytical Metrics Charts */}
        {currentTries.length > 0 && (
          <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Zone Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Tries by Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={zoneData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [value, 'Tries']}
                        labelFormatter={(label) => `Zone: ${label}`}
                      />
                      <Bar dataKey="value" fill={CHART_COLORS[0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quarter Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Tries by Quarter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Tooltip 
                        formatter={(value: any, name: any) => [value, 'Tries']}
                      />
                      <Legend />
                      <Pie
                        data={quarterData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }: any) => `${name}: ${percentage}%`}
                      >
                        {quarterData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Phase Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Tries by Phase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={phaseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [value, 'Tries']}
                        labelFormatter={(label) => `Phase: ${label}`}
                      />
                      <Bar dataKey="value" fill={CHART_COLORS[1]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Source Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Tries by Source
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Tooltip 
                        formatter={(value: any, name: any) => [value, 'Tries']}
                      />
                      <Legend />
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }: any) => `${name}: ${percentage}%`}
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Save Prompt Dialog */}
        <Dialog open={showSavePrompt} onOpenChange={setShowSavePrompt}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Current Data?</DialogTitle>
              <DialogDescription>
                You have {currentView === 'home' ? homeTeamTries.length : awayTeamTries.length} tries plotted for {currentView === 'home' ? 'Us' : 'Opposition'}. 
                Would you like to save this data before switching to {pendingView === 'home' ? 'Us' : 'Opposition'}?
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={() => confirmTeamSwitch(true)} 
                className="flex-1"
              >
                Save & Switch
              </Button>
              <Button 
                variant="outline" 
                onClick={() => confirmTeamSwitch(false)} 
                className="flex-1"
              >
                Switch Without Saving
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSavePrompt(false);
                  setPendingView(null);
                }} 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Analysis Section */}
        {currentTries.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Analysis - Try Patterns & Trends
                  {isAnalyzing && (
                    <Badge variant="secondary" className="ml-auto">
                      Analyzing...
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Generating AI insights...</span>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-4">
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {aiAnalysis}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={generateAIAnalysis}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Refresh Analysis
                      </Button>
                      <Badge variant="outline" className="ml-auto">
                        Powered by Gemini AI
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>AI analysis will appear here once try data is available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Try Dialog */}
        {editingTry && (
          <Dialog open={!!editingTry} onOpenChange={() => setEditingTry(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Try Details</DialogTitle>
                <DialogDescription>
                  Update the quarter and phase information for this try
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Quarter</Label>
                  <Select value={editQuarter} onValueChange={setEditQuarter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Q1 (0-20min)</SelectItem>
                      <SelectItem value="2">Q2 (20-40min)</SelectItem>
                      <SelectItem value="3">Q3 (40-60min)</SelectItem>
                      <SelectItem value="4">Q4 (60-80min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Phase</Label>
                  <Select value={editPhase} onValueChange={setEditPhase}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phase_1">Phase 1</SelectItem>
                      <SelectItem value="phase_2_3">Phase 2-3</SelectItem>
                      <SelectItem value="phase_4_6">Phase 4-6</SelectItem>
                      <SelectItem value="phase_7_plus">Phase 7+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveTryEdit} className="flex-1">Save</Button>
                  <Button variant="outline" onClick={() => deleteTry(editingTry.id)} className="flex-1">Delete</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

// Wrapper component for routing compatibility
export default function TryAnalysisWrapper() {
  return <TryAnalysisSimplified />;
}

// Export the main component for embedding
export { TryAnalysisSimplified };