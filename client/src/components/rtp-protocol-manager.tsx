import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Flag,
  Shield,
  Calendar
} from "lucide-react";
import type { RTPProtocol } from "@shared/schema";

interface RTPProtocolManagerProps {
  rtpProtocol: RTPProtocol;
  playerId: string;
  playerName: string;
  onStageAdvanced?: (newStage: string) => void;
  onProtocolCompleted?: () => void;
}

export default function RTPProtocolManager({ 
  rtpProtocol, 
  playerId, 
  playerName,
  onStageAdvanced,
  onProtocolCompleted
}: RTPProtocolManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [isAdvancing, setIsAdvancing] = useState(false);
  
  // Local state to track current RTP stage for UI updates
  const [currentRTPStage, setCurrentRTPStage] = useState(rtpProtocol.currentStage);
  const [stageStartTime, setStageStartTime] = useState(rtpProtocol.stageStartDate);

  const rtpStages = [
    { 
      key: 'stage_1', 
      label: 'Rest', 
      description: 'Complete physical and cognitive rest',
      activities: 'No physical activity, limit screen time, adequate sleep',
      minimumHours: 24,
      progressCriteria: 'Symptom-free for 24+ hours'
    },
    { 
      key: 'stage_2', 
      label: 'Light Aerobic', 
      description: 'Walking, stationary cycling <70% max HR',
      activities: '15-20 min light aerobic exercise, no resistance training',
      minimumHours: 24,
      progressCriteria: 'Tolerate exercise without symptom return'
    },
    { 
      key: 'stage_3', 
      label: 'Sport-Specific', 
      description: 'Running drills, no head impact activities',
      activities: 'Running, cutting, position-specific drills, moderate intensity',
      minimumHours: 24,
      progressCriteria: 'Complete training without symptoms'
    },
    { 
      key: 'stage_4', 
      label: 'Non-Contact', 
      description: 'Passing, weight training, complex drills',
      activities: 'Full training except contact/collision activities',
      minimumHours: 24,
      progressCriteria: 'Normal training capacity restored'
    },
    { 
      key: 'stage_5', 
      label: 'Full Contact', 
      description: 'Normal training, medical clearance required',
      activities: 'Unrestricted training, full contact practice',
      minimumHours: 24,
      progressCriteria: 'Medical clearance + normal function assessment'
    },
    { 
      key: 'stage_6', 
      label: 'Return to Play', 
      description: 'Full medical clearance to play in games',
      activities: 'Available for match selection',
      minimumHours: 0,
      progressCriteria: 'Final medical sign-off completed'
    }
  ];

  const getCurrentStageIndex = () => {
    return parseInt(currentRTPStage.split('_')[1]) - 1;
  };

  const getCurrentStage = () => {
    return rtpStages[getCurrentStageIndex()];
  };

  const getProgressPercentage = () => {
    return (getCurrentStageIndex() / (rtpStages.length - 1)) * 100;
  };

  const getTimeInCurrentStage = () => {
    const stageStart = new Date(stageStartTime).getTime();
    const currentTime = new Date().getTime();
    return Math.floor((currentTime - stageStart) / (1000 * 60 * 60)); // hours
  };

  const canAdvanceStage = () => {
    const timeInStage = getTimeInCurrentStage();
    const currentStage = getCurrentStage();
    
    console.log("🔍 CAN ADVANCE CHECK:", {
      timeInStage,
      minimumRequired: currentStage.minimumHours,
      canAdvance: timeInStage >= currentStage.minimumHours,
      symptomFreeRequired: rtpProtocol.symptomFreeRequired
    });
    
    // Must meet minimum time requirement
    if (timeInStage < currentStage.minimumHours) {
      return false;
    }

    // Must be symptom-free if required
    if (rtpProtocol.symptomFreeRequired) {
      // In real app, check latest symptom assessment
      return true; // Mock: assume symptom-free
    }

    return true;
  };

  const advanceStage = useMutation({
    mutationFn: async ({ notes }: { notes: string }) => {
      // In real app, this would POST to /api/rtp-protocols/{id}/advance
      console.log("Advancing RTP stage:", {
        protocolId: rtpProtocol.id,
        currentStage: currentRTPStage,
        notes
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const currentIndex = getCurrentStageIndex();
      const nextStage = rtpStages[currentIndex + 1];
      
      return {
        success: true,
        newStage: nextStage?.key || 'cleared',
        newStageIndex: currentIndex + 1,
        message: `Advanced to ${nextStage?.label || 'Cleared'}`
      };
    },
    onSuccess: (response) => {
      // Update local state immediately for UI feedback
      setCurrentRTPStage(response.newStage);
      setStageStartTime(new Date().toISOString());
      
      toast({
        title: "Stage Advanced",
        description: response.message,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/rtp-protocols"] });
      queryClient.invalidateQueries({ queryKey: ["/api/head-injuries"] });
      
      if (onStageAdvanced) {
        onStageAdvanced(response.newStage);
      }
      
      if (response.newStage === 'cleared' && onProtocolCompleted) {
        onProtocolCompleted();
      }
      
      setNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to advance stage. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAdvanceStage = async () => {
    console.log("🔘 BUTTON CLICKED - Handle Advance Stage called!");
    console.log("🚀 ATTEMPTING TO ADVANCE STAGE:", {
      currentStage: currentRTPStage,
      currentIndex: getCurrentStageIndex(),
      canAdvance: canAdvanceStage(),
      timeInStage: getTimeInCurrentStage(),
      minimumRequired: getCurrentStage().minimumHours
    });
    
    if (!canAdvanceStage()) {
      toast({
        title: "Cannot Advance",
        description: "Stage requirements not yet met.",
        variant: "destructive",
      });
      return;
    }

    setIsAdvancing(true);
    try {
      await advanceStage.mutateAsync({ notes });
      console.log("✅ STAGE ADVANCEMENT SUCCESSFUL");
    } catch (error) {
      console.log("❌ STAGE ADVANCEMENT FAILED:", error);
    } finally {
      setIsAdvancing(false);
    }
  };

  const resetProtocol = useMutation({
    mutationFn: async ({ reason }: { reason: string }) => {
      // In real app, this would POST to /api/rtp-protocols/{id}/reset
      console.log("Resetting RTP protocol:", { protocolId: rtpProtocol.id, reason });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, message: "Protocol reset to Stage 1" };
    },
    onSuccess: () => {
      toast({
        title: "Protocol Reset",
        description: "Player returned to Stage 1 due to symptom return.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/rtp-protocols"] });
    }
  });

  const daysSinceIncident = Math.floor(
    (new Date().getTime() - new Date(rtpProtocol.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const timeInStage = getTimeInCurrentStage();
  const currentStage = getCurrentStage();
  const currentIndex = getCurrentStageIndex();
  
  console.log("🔍 RTP RENDER STATE:", {
    currentRTPStage,
    currentIndex,
    timeInStage,
    stageStartTime
  });

  return (
    <div className="space-y-6" data-testid="rtp-protocol-manager">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">RTP Protocol - {playerName}</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Day {daysSinceIncident} since incident</span>
        </div>
      </div>

      {/* Current Status Alert */}
      <Alert className="border-orange-200 bg-orange-50">
        <Target className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex justify-between items-center">
            <div>
              <strong>Stage {currentIndex + 1}: {currentStage.label}</strong> - 
              {timeInStage}h/{currentStage.minimumHours}h minimum
            </div>
            <Badge className={canAdvanceStage() ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
              {canAdvanceStage() ? 'Ready to Advance' : 'In Progress'}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(getProgressPercentage())}% Complete</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-3" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded">
                <p className="font-medium text-blue-800">Current Stage</p>
                <p className="text-2xl font-bold text-blue-600">{currentIndex + 1}/6</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <p className="font-medium text-green-800">Time in Stage</p>
                <p className="text-2xl font-bold text-green-600">{timeInStage}h</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <p className="font-medium text-purple-800">Est. Completion</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.max(0, 6 - currentIndex)} days
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Progression */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Stage Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rtpStages.map((stage, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isPending = index > currentIndex;
              const history = rtpProtocol.stageHistory.find(h => h.stage === stage.key);

              return (
                <div 
                  key={stage.key}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCurrent ? 'border-orange-200 bg-orange-50' :
                    isCompleted ? 'border-green-200 bg-green-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                  data-testid={`rtp-stage-${index + 1}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-orange-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? <CheckCircle className="h-6 w-6" /> :
                       isCurrent ? <Play className="h-6 w-6" /> :
                       <Pause className="h-6 w-6" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">Stage {index + 1}: {stage.label}</h4>
                        {isCurrent && <Badge className="bg-orange-100 text-orange-800">Current</Badge>}
                        {isCompleted && <Badge className="bg-green-100 text-green-800">Completed</Badge>}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{stage.description}</p>
                      <p className="text-xs text-gray-600 mb-2">
                        <strong>Activities:</strong> {stage.activities}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Criteria:</strong> {stage.progressCriteria}
                      </p>

                      {/* Stage timing info */}
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Min: {stage.minimumHours}h</span>
                        </div>
                        
                        {history && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>Completed in {history.duration}h</span>
                          </div>
                        )}
                        
                        {isCurrent && (
                          <div className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 text-orange-500" />
                            <span>In progress: {timeInStage}h</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isCurrent && (
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm"
                          onClick={handleAdvanceStage}
                          disabled={!canAdvanceStage() || isAdvancing}
                          data-testid={`advance-stage-${index + 1}`}
                        >
                          {isAdvancing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Advance
                            </>
                          )}
                        </Button>
                        
                        {!canAdvanceStage() && (
                          <Badge variant="outline" className="text-xs">
                            {timeInStage < stage.minimumHours ? 
                              `${stage.minimumHours - timeInStage}h remaining` :
                              'Assessment needed'
                            }
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stage Advancement Notes */}
      {currentIndex < rtpStages.length - 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Stage Advancement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Progress Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document player's progress, any observations, or assessment results..."
                className="mt-1"
                data-testid="textarea-progress-notes"
              />
            </div>
            
            <Button 
              onClick={handleAdvanceStage}
              disabled={!canAdvanceStage() || isAdvancing}
              className="w-full"
              data-testid="button-advance-stage"
            >
              {isAdvancing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Advancing Stage...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Advance to Stage {currentIndex + 2}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {rtpProtocol.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rtpProtocol.alerts.map((alert, index) => (
                <Alert 
                  key={index}
                  className={`border-${alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'orange' : 'yellow'}-200 bg-${alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'orange' : 'yellow'}-50`}
                >
                  <AlertTriangle className={`h-4 w-4 text-${alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'orange' : 'yellow'}-600`} />
                  <AlertDescription className={`text-${alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'orange' : 'yellow'}-800`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <strong>{alert.type.replace('_', ' ').toUpperCase()}</strong>
                        <p>{alert.message}</p>
                        <p className="text-xs mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                      </div>
                      <Badge className={`bg-${alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'orange' : 'yellow'}-100`}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Actions */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Shield className="h-5 w-5" />
            Emergency Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => resetProtocol.mutate({ reason: "Symptom return" })}
              disabled={resetProtocol.isPending}
              data-testid="button-reset-protocol"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Stage 1
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600 border-red-200"
              data-testid="button-medical-hold"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Medical Hold
            </Button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Use only if symptoms return or medical concerns arise
          </p>
        </CardContent>
      </Card>
    </div>
  );
}