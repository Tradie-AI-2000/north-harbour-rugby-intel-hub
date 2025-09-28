import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DataFlowDiagram from "@/components/data-flow-diagram";
import DataIntegrityTest from "@/components/data-integrity-test";
import { 
  Database, 
  GitBranch, 
  Shield, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Zap
} from "lucide-react";

export default function DataIntegrityDemo() {
  // FIREBASE LIVE DATA - Demo player pulled from live database
  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
    refetchInterval: 5000,
  });

  // Use first available player from Firebase for demo
  const samplePlayer = players.length > 0 ? {
  id: players[0].id,
  name: players[0].personalDetails ? 
    `${players[0].personalDetails.firstName} ${players[0].personalDetails.lastName}` :
    `${players[0].firstName || 'Player'} ${players[0].lastName || 'Demo'}`,
  position: players[0].personalDetails?.position || players[0].position || "Player",
  jerseyNumber: players[0].personalDetails?.jerseyNumber || players[0].jerseyNumber || 1,
  currentMetrics: {
    attendanceScore: players[0].attendanceScore || 9.2,
    medicalScore: players[0].medicalScore || 8.8,
    playerValue: players[0].playerValue || 147000,
    availabilityStatus: players[0].currentStatus === 'Fit' ? 'available' : 'modified',
    cohesionReliability: players[0].cohesionReliability || 9.1,
    fitnessRating: players[0].fitnessRating || 8.5,
    medicalStatus: players[0].currentStatus === 'Fit' ? 'cleared' : 'pending'
  }
} : {
  id: "demo_player",
  name: "Loading Player Data...",
  position: "Loading...",
  jerseyNumber: 0,
  currentMetrics: {
    attendanceScore: 0,
    medicalScore: 0,
    playerValue: 0,
    availabilityStatus: "loading",
    cohesionReliability: 0,
    fitnessRating: 0,
    medicalStatus: "loading"
  }
};

interface SimulationStep {
  title: string;
  description: string;
  changes: Array<{
    metric: string;
    before: any;
    after: any;
    impact: "positive" | "negative" | "neutral";
  }>;
}

// Component continuation (remove duplicate export)
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [playerMetrics, setPlayerMetrics] = useState(samplePlayer.currentMetrics);
  const [lastApiResult, setLastApiResult] = useState<any>(null);
  const [showCascadingEffects, setShowCascadingEffects] = useState(false);

  const medicalAppointmentDemo: SimulationStep[] = [
    {
      title: "Initial State",
      description: "Player has excellent compliance and high ratings",
      changes: []
    },
    {
      title: "Medical Appointment Missed",
      description: "Physio marks appointment as 'missed' in the system",
      changes: [
        {
          metric: "Medical Appointment Status",
          before: "scheduled",
          after: "missed",
          impact: "negative"
        }
      ]
    },
    {
      title: "Attendance Score Recalculated",
      description: "System automatically updates attendance based on recent history",
      changes: [
        {
          metric: "Attendance Score",
          before: 9.2,
          after: 8.7,
          impact: "negative"
        }
      ]
    },
    {
      title: "Medical Compliance Updated",
      description: "Medical score reflects appointment compliance issues",
      changes: [
        {
          metric: "Medical Score",
          before: 8.8,
          after: 8.3,
          impact: "negative"
        }
      ]
    },
    {
      title: "Player Value Recalculated",
      description: "Lower scores automatically reduce overall player value",
      changes: [
        {
          metric: "Player Value",
          before: "$147,000",
          after: "$143,500",
          impact: "negative"
        },
        {
          metric: "Cohesion Reliability",
          before: 9.1,
          after: 8.7,
          impact: "negative"
        }
      ]
    }
  ];

  // API mutations for live testing
  const medicalAppointmentMutation = useMutation({
    mutationFn: async (action: 'miss' | 'attend') => {
      const response = await fetch(`/api/demo/medical-appointment/${samplePlayer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      return response.json();
    }
  });

  const gpsDataMutation = useMutation({
    mutationFn: async (scenario: 'decline' | 'improve') => {
      const response = await fetch(`/api/demo/gps-data/${samplePlayer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      return response.json();
    }
  });

  const injuryUpdateMutation = useMutation({
    mutationFn: async (action: 'new_injury' | 'clear_injury') => {
      const response = await fetch(`/api/demo/injury-update/${samplePlayer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      return response.json();
    }
  });

  const runDemo = async (demoType: string) => {
    setActiveDemo(demoType);
    setIsRunning(true);
    setCurrentStep(0);
    
    const steps = demoType === "medical" ? medicalAppointmentDemo : [];
    
    for (let step = 0; step < steps.length; step++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep(step);
      
      // Apply changes to metrics
      if (step === steps.length - 1) {
        setPlayerMetrics({
          ...playerMetrics,
          attendanceScore: 8.7,
          medicalScore: 8.3,
          playerValue: 143500,
          cohesionReliability: 8.7
        });
      }
    }
    
    setIsRunning(false);
  };

  const runLiveDemo = async (type: 'medical' | 'gps' | 'injury', action: string) => {
    try {
      let result;
      switch (type) {
        case 'medical':
          result = await medicalAppointmentMutation.mutateAsync(action as 'miss' | 'attend');
          break;
        case 'gps':
          result = await gpsDataMutation.mutateAsync(action as 'decline' | 'improve');
          break;
        case 'injury':
          result = await injuryUpdateMutation.mutateAsync(action as 'new_injury' | 'clear_injury');
          break;
      }
      
      if (result.success) {
        // Store result for display
        setLastApiResult(result);
        setShowCascadingEffects(true);
        
        // Update metrics based on cascading effects
        const changes = result.cascadingEffects.changes;
        const newMetrics = { ...playerMetrics };
        
        changes.forEach((change: any) => {
          if (change.field === 'attendanceScore') newMetrics.attendanceScore = change.after;
          if (change.field === 'medicalScore') newMetrics.medicalScore = change.after;
          if (change.field === 'playerValue') newMetrics.playerValue = change.after;
          if (change.field === 'cohesionReliability') newMetrics.cohesionReliability = change.after;
          if (change.field === 'fitnessRating') newMetrics.fitnessRating = change.after;
        });
        
        setPlayerMetrics(newMetrics);
        return result;
      }
    } catch (error) {
      console.error('Demo error:', error);
      throw error;
    }
  };

  const resetDemo = () => {
    setActiveDemo(null);
    setCurrentStep(0);
    setIsRunning(false);
    setPlayerMetrics(samplePlayer.currentMetrics);
    setLastApiResult(null);
    setShowCascadingEffects(false);
  };

  const getMetricColor = (current: number, original: number) => {
    if (current < original) return "text-red-600 bg-red-50";
    if (current > original) return "text-green-600 bg-green-50";
    return "text-gray-600 bg-gray-50";
  };

  const getImpactIcon = (impact: "positive" | "negative" | "neutral") => {
    switch (impact) {
      case "positive": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "negative": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Integrity System Demo
          </h1>
          <p className="text-gray-600">
            Live demonstration of how interconnected data maintains accuracy across all player metrics
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="live-demo">Live Demo</TabsTrigger>
            <TabsTrigger value="data-flow">Data Flow</TabsTrigger>
            <TabsTrigger value="test-suite">Test Suite</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Data Validation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Every update is validated against business rules before being applied
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Medical status consistency</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Physical attribute ranges</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Jersey number uniqueness</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GitBranch className="w-5 h-5 text-purple-500" />
                    Cascading Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Changes automatically trigger updates to related metrics
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Medical → Player Value</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>GPS → Fitness Status</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Skills → AI Ratings</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Eye className="w-5 h-5 text-orange-500" />
                    Audit Trail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete history of who changed what, when, and why
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Source attribution</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Impact analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Change timeline</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                This system ensures that when medical staff, coaches, or automated systems update player data, 
                all related metrics remain accurate and consistent. No manual coordination required.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="live-demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Live Simulation: Medical Appointment Impact
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Watch how a missed medical appointment cascades through all related metrics
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Current Player Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg border">
                        <span className="text-sm">Attendance Score</span>
                        <Badge className={getMetricColor(playerMetrics.attendanceScore, samplePlayer.currentMetrics.attendanceScore)}>
                          {playerMetrics.attendanceScore}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg border">
                        <span className="text-sm">Medical Score</span>
                        <Badge className={getMetricColor(playerMetrics.medicalScore, samplePlayer.currentMetrics.medicalScore)}>
                          {playerMetrics.medicalScore}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg border">
                        <span className="text-sm">Player Value</span>
                        <Badge className={getMetricColor(playerMetrics.playerValue, samplePlayer.currentMetrics.playerValue)}>
                          ${playerMetrics.playerValue.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg border">
                        <span className="text-sm">Cohesion Reliability</span>
                        <Badge className={getMetricColor(playerMetrics.cohesionReliability, samplePlayer.currentMetrics.cohesionReliability)}>
                          {playerMetrics.cohesionReliability}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Simulation Control</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={() => runLiveDemo("medical", "miss")}
                          disabled={medicalAppointmentMutation.isPending}
                          variant="destructive"
                          className="flex-1"
                        >
                          {medicalAppointmentMutation.isPending ? "Processing..." : "Miss Appointment"}
                        </Button>
                        <Button 
                          onClick={() => runLiveDemo("medical", "attend")}
                          disabled={medicalAppointmentMutation.isPending}
                          className="flex-1"
                        >
                          {medicalAppointmentMutation.isPending ? "Processing..." : "Attend Appointment"}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={() => runLiveDemo("gps", "decline")}
                          disabled={gpsDataMutation.isPending}
                          variant="destructive"
                          className="flex-1"
                        >
                          {gpsDataMutation.isPending ? "Processing..." : "GPS Performance ↓"}
                        </Button>
                        <Button 
                          onClick={() => runLiveDemo("gps", "improve")}
                          disabled={gpsDataMutation.isPending}
                          className="flex-1"
                        >
                          {gpsDataMutation.isPending ? "Processing..." : "GPS Performance ↑"}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={() => runLiveDemo("injury", "new_injury")}
                          disabled={injuryUpdateMutation.isPending}
                          variant="destructive"
                          className="flex-1"
                        >
                          {injuryUpdateMutation.isPending ? "Processing..." : "New Injury"}
                        </Button>
                        <Button 
                          onClick={() => runLiveDemo("injury", "clear_injury")}
                          disabled={injuryUpdateMutation.isPending}
                          className="flex-1"
                        >
                          {injuryUpdateMutation.isPending ? "Processing..." : "Clear Injury"}
                        </Button>
                      </div>

                      <Button 
                        variant="outline" 
                        onClick={resetDemo}
                        disabled={isRunning}
                        className="w-full"
                      >
                        Reset to Initial State
                      </Button>

                      {/* Live API Results Display */}
                      {showCascadingEffects && lastApiResult && (
                        <div className="mt-6 p-4 border rounded-lg bg-blue-50 border-blue-200">
                          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-500" />
                            Live Cascading Effects
                          </h4>
                          
                          <div className="space-y-3">
                            <div className="text-sm">
                              <span className="font-medium">Trigger:</span> {lastApiResult.cascadingEffects.trigger}
                            </div>
                            
                            <div className="space-y-2">
                              <span className="text-sm font-medium">Automatic Updates:</span>
                              {lastApiResult.cascadingEffects.changes.map((change: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-sm p-2 rounded bg-white border">
                                  {getImpactIcon(change.impact)}
                                  <span className="flex-1">
                                    {change.field}: {typeof change.before === 'number' && change.field === 'playerValue' 
                                      ? `$${change.before.toLocaleString()}` 
                                      : change.before} → {typeof change.after === 'number' && change.field === 'playerValue' 
                                      ? `$${change.after.toLocaleString()}` 
                                      : change.after}
                                  </span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="space-y-2">
                              <span className="text-sm font-medium">Affected Systems:</span>
                              <div className="flex flex-wrap gap-1">
                                {lastApiResult.cascadingEffects.affectedSystems.map((system: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {system}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            {lastApiResult.cascadingEffects.auditTrail && (
                              <div className="text-xs text-gray-600 pt-2 border-t">
                                Updated by: {lastApiResult.cascadingEffects.auditTrail.updatedBy} at {new Date(lastApiResult.cascadingEffects.auditTrail.timestamp).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeDemo && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Progress</h4>
                          {medicalAppointmentDemo.map((step, idx) => (
                            <div 
                              key={idx} 
                              className={`p-3 rounded-lg border transition-all ${
                                idx <= currentStep 
                                  ? 'bg-blue-50 border-blue-200' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {idx < currentStep ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : idx === currentStep ? (
                                  <div className="w-4 h-4 border-2 border-blue-500 rounded-full animate-spin border-t-transparent" />
                                ) : (
                                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                                )}
                                <span className="text-sm font-medium">{step.title}</span>
                              </div>
                              <p className="text-xs text-gray-600 ml-6">{step.description}</p>
                              
                              {step.changes.length > 0 && idx <= currentStep && (
                                <div className="ml-6 mt-2 space-y-1">
                                  {step.changes.map((change, changeIdx) => (
                                    <div key={changeIdx} className="flex items-center gap-2 text-xs">
                                      {getImpactIcon(change.impact)}
                                      <span>{change.metric}: {change.before} → {change.after}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data-flow">
            <DataFlowDiagram />
          </TabsContent>

          <TabsContent value="test-suite">
            <DataIntegrityTest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}