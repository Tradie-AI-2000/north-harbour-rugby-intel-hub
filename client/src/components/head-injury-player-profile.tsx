import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  AlertTriangle, 
  Clock, 
  Target,
  Activity,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  ArrowRight,
  Calendar,
  Eye,
  Plus
} from "lucide-react";
import type { HeadInjuryIncident, ConcussionAssessment, RTPProtocol } from "@shared/schema";
import RTPProtocolManager from "@/components/rtp-protocol-manager";

interface HeadInjuryPlayerProfileProps {
  playerId: string;
  playerName: string;
  onLogIncident?: () => void;
}

export default function HeadInjuryPlayerProfile({ playerId, playerName, onLogIncident }: HeadInjuryPlayerProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data - replace with real API calls
  const mockIncidents: HeadInjuryIncident[] = [
    {
      id: "incident_1",
      playerId,
      dateTime: "2025-01-15T14:30:00Z",
      context: "game",
      contextDetails: "vs Auckland Blues - 2nd half",
      mechanismOfInjury: "head_to_shoulder",
      mechanismDescription: "Tackled by opposing player, head made contact with shoulder",
      immediateSymptoms: {
        lossOfConsciousness: false,
        seizure: false,
        confusion: true,
        unsteadiness: true,
        dizziness: true,
        nausea: false,
        headache: true,
        visualDisturbance: false
      },
      initialAction: {
        removedFromPlay: true,
        hiaAdministered: true,
        immediateAssessment: true,
        hospitalReferral: false
      },
      reportedBy: "dr_smith",
      createdAt: "2025-01-15T14:45:00Z",
      updatedAt: "2025-01-15T14:45:00Z"
    }
  ];

  const mockAssessments: ConcussionAssessment[] = [
    {
      id: "assessment_1",
      playerId,
      incidentId: "incident_1",
      assessmentType: "hia",
      assessmentDate: "2025-01-15T14:45:00Z",
      assessor: "dr_smith",
      maddocksQuestions: {
        whatGroundAreWeAt: true,
        whichHalfIsIt: true,
        whoScoredLast: false,
        whatDidYouPlayLastWeek: true,
        didYourTeamWinLastGame: true,
        totalCorrect: 4
      },
      outcome: "fail",
      notes: "Player failed HIA - confusion and memory issues noted",
      nextAssessmentDate: "2025-01-16T09:00:00Z",
      createdAt: "2025-01-15T14:45:00Z",
      updatedAt: "2025-01-15T14:45:00Z"
    }
  ];

  const mockRTPProtocol: RTPProtocol = {
    id: "rtp_1",
    playerId,
    incidentId: "incident_1",
    currentStage: "stage_3",
    stageStartDate: new Date(Date.now() - (25 * 60 * 60 * 1000)).toISOString(), // 25 hours ago (meets 24h minimum)
    stageHistory: [
      {
        stage: "stage_1",
        startDate: new Date(Date.now() - (4 * 24 * 60 * 60 * 1000)).toISOString(), // 4 days ago
        endDate: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(), // 3 days ago
        duration: 42,
        successful: true,
        notes: "Complete rest phase completed successfully",
        supervisionBy: "dr_smith"
      },
      {
        stage: "stage_2", 
        startDate: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(), // 3 days ago
        endDate: new Date(Date.now() - (25 * 60 * 60 * 1000)).toISOString(), // 25 hours ago
        duration: 48,
        successful: true,
        notes: "Light aerobic exercise tolerated well",
        supervisionBy: "physio_jones"
      }
    ],
    minimumDuration: 24,
    symptomFreeRequired: true,
    lastSymptomCheck: new Date(Date.now() - (1 * 60 * 60 * 1000)).toISOString(), // 1 hour ago
    autoProgressionEnabled: true,
    alerts: [
      {
        type: "prolonged_recovery",
        message: "Recovery taking longer than typical 7-10 day window",
        severity: "medium",
        timestamp: "2025-01-18T10:00:00Z",
        acknowledged: false
      }
    ],
    createdAt: "2025-01-15T15:00:00Z",
    updatedAt: "2025-01-19T09:00:00Z"
  };

  const rtpStages = [
    { key: 'stage_1', label: 'Rest', description: 'Complete physical and cognitive rest' },
    { key: 'stage_2', label: 'Light Aerobic', description: 'Walking, stationary cycling <70% max HR' },
    { key: 'stage_3', label: 'Sport-Specific', description: 'Running drills, no head impact activities' },
    { key: 'stage_4', label: 'Non-Contact', description: 'Passing, weight training, complex drills' },
    { key: 'stage_5', label: 'Full Contact', description: 'Normal training, medical clearance required' },
    { key: 'stage_6', label: 'Return to Play', description: 'Full medical clearance to play in games' }
  ];

  const getCurrentStageIndex = () => {
    return parseInt(mockRTPProtocol.currentStage.split('_')[1]) - 1;
  };

  const getProgressPercentage = () => {
    return (getCurrentStageIndex() / (rtpStages.length - 1)) * 100;
  };

  const getMechanismIcon = (mechanism: string) => {
    const iconMap: Record<string, string> = {
      'head_to_ground': '🏃➜🌍',
      'head_to_shoulder': '👥💥',
      'head_to_head': '👤➜👤',
      'head_to_knee': '👤➜🦵',
      'whiplash': '🌪️',
      'unknown': '❓',
      'other': '⚠️'
    };
    return iconMap[mechanism] || '❓';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const daysSinceIncident = Math.floor(
    (new Date().getTime() - new Date(mockIncidents[0]?.dateTime || 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6" data-testid="head-injury-player-profile">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Head Injury Profile - {playerName}</h2>
        </div>
        <div className="flex gap-2">
          <Button size="sm" data-testid="button-new-assessment">
            <Eye className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
          <Button size="sm" onClick={onLogIncident} data-testid="button-log-incident">
            <Plus className="h-4 w-4 mr-2" />
            Log Incident
          </Button>
        </div>
      </div>

      {/* Current Status Alert */}
      {mockRTPProtocol && (
        <Alert className="border-orange-200 bg-orange-50">
          <Activity className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Currently in RTP Stage {getCurrentStageIndex() + 1}</strong> ({rtpStages[getCurrentStageIndex()]?.label}) - 
            Day {daysSinceIncident} since incident. Next progression available in 
            {mockRTPProtocol.minimumDuration - Math.floor((new Date().getTime() - new Date(mockRTPProtocol.stageStartDate).getTime()) / (1000 * 60 * 60))} hours.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="rtp-protocol" data-testid="tab-rtp">RTP Protocol</TabsTrigger>
          <TabsTrigger value="assessments" data-testid="tab-assessments">Assessments</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Days Since Incident</p>
                    <p className="text-2xl font-bold">{daysSinceIncident}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">RTP Stage</p>
                    <p className="text-2xl font-bold">{getCurrentStageIndex() + 1}/6</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Concussions</p>
                    <p className="text-2xl font-bold">{mockIncidents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RTP Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recovery Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Stage {getCurrentStageIndex() + 1}: {rtpStages[getCurrentStageIndex()]?.label}</span>
                    <span>{Math.round(getProgressPercentage())}% Complete</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-2" />
                </div>
                <p className="text-sm text-gray-600">
                  {rtpStages[getCurrentStageIndex()]?.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Incident */}
          {mockIncidents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Most Recent Incident
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getMechanismIcon(mockIncidents[0].mechanismOfInjury)}</span>
                      <div>
                        <p className="font-medium">{mockIncidents[0].mechanismOfInjury.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-gray-600">{formatDate(mockIncidents[0].dateTime)}</p>
                      </div>
                    </div>
                    <Badge className={mockIncidents[0].initialAction.removedFromPlay ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {mockIncidents[0].initialAction.removedFromPlay ? 'Removed from Play' : 'Continued Playing'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{mockIncidents[0].mechanismDescription}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rtp-protocol" className="space-y-6">
          <RTPProtocolManager 
            rtpProtocol={mockRTPProtocol}
            playerId={playerId}
            playerName={playerName}
            onStageAdvanced={(newStage) => {
              console.log(`🎯 RTP Stage advanced to: ${newStage}`);
              // In real app, this would trigger a data refresh
            }}
            onProtocolCompleted={() => {
              console.log(`🏆 RTP Protocol completed for ${playerName}`);
              toast({
                title: "RTP Protocol Complete",
                description: `${playerName} has been cleared to return to play.`,
              });
            }}
          />
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Assessment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAssessments.map((assessment) => (
                  <div key={assessment.id} className="border rounded-lg p-4" data-testid={`assessment-${assessment.id}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={
                          assessment.outcome === 'pass' ? 'bg-green-100 text-green-800' :
                          assessment.outcome === 'fail' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }>
                          {assessment.assessmentType.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{formatDate(assessment.assessmentDate)}</span>
                      </div>
                      <Badge className={
                        assessment.outcome === 'pass' ? 'bg-green-500' :
                        assessment.outcome === 'fail' ? 'bg-red-500' :
                        'bg-orange-500'
                      }>
                        {assessment.outcome.toUpperCase()}
                      </Badge>
                    </div>

                    {assessment.maddocksQuestions && (
                      <div className="text-sm space-y-1">
                        <p><strong>Maddocks Questions:</strong> {assessment.maddocksQuestions.totalCorrect}/5 correct</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <span>Ground: {assessment.maddocksQuestions.whatGroundAreWeAt ? '✓' : '✗'}</span>
                          <span>Half: {assessment.maddocksQuestions.whichHalfIsIt ? '✓' : '✗'}</span>
                          <span>Last scorer: {assessment.maddocksQuestions.whoScoredLast ? '✓' : '✗'}</span>
                          <span>Last week: {assessment.maddocksQuestions.whatDidYouPlayLastWeek ? '✓' : '✗'}</span>
                        </div>
                      </div>
                    )}

                    {assessment.notes && (
                      <p className="text-sm text-gray-700 mt-2">{assessment.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Incident History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockIncidents.map((incident) => (
                  <div key={incident.id} className="border rounded-lg p-4" data-testid={`incident-${incident.id}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getMechanismIcon(incident.mechanismOfInjury)}</span>
                        <div>
                          <p className="font-medium">{incident.mechanismOfInjury.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-sm text-gray-600">{formatDate(incident.dateTime)}</p>
                        </div>
                      </div>
                      <Badge className={incident.context === 'game' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                        {incident.context.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{incident.mechanismDescription}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">Immediate Symptoms:</p>
                        <div className="space-y-1 text-xs">
                          {Object.entries(incident.immediateSymptoms).map(([symptom, present]) => (
                            <div key={symptom} className="flex justify-between">
                              <span>{symptom.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                              <span>{present ? '✓' : '✗'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Initial Actions:</p>
                        <div className="space-y-1 text-xs">
                          {Object.entries(incident.initialAction).map(([action, taken]) => (
                            <div key={action} className="flex justify-between">
                              <span>{action.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                              <span>{taken ? '✓' : '✗'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}