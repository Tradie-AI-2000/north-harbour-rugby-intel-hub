import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  AlertTriangle, 
  Clock, 
  Users, 
  TrendingUp,
  Activity,
  Shield,
  Target,
  Eye,
  Plus
} from "lucide-react";
import type { HeadInjuryPlayerSummary } from "@shared/schema";

interface HeadInjurySummaryProps {
  onNewIncident?: () => void;
  onQuickAssessment?: () => void;
}

export default function HeadInjurySummary({ onNewIncident, onQuickAssessment }: HeadInjurySummaryProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'high_risk'>('all');

  // Mock data - replace with real API call
  const mockData: HeadInjuryPlayerSummary[] = [
    {
      playerId: "player_1",
      playerName: "Jake Thompson",
      position: "Hooker",
      currentStatus: "rtp_protocol",
      currentRtpStage: "stage_3",
      daysSinceIncident: 5,
      riskLevel: "moderate",
      totalConcussions: 2,
      concussionsLast24Months: 1,
      longestRecoveryDays: 12,
      lastIncidentDate: "2025-01-15T14:30:00Z",
      lastAssessmentDate: "2025-01-19T09:00:00Z",
      nextAssessmentDue: "2025-01-21T09:00:00Z",
      activeAlerts: ["Stage progression due"],
      flaggedForReview: false
    },
    {
      playerId: "player_2", 
      playerName: "Mike Wilson",
      position: "Flanker",
      currentStatus: "rtp_protocol",
      currentRtpStage: "stage_1",
      daysSinceIncident: 1,
      riskLevel: "high",
      totalConcussions: 4,
      concussionsLast24Months: 3,
      longestRecoveryDays: 28,
      lastIncidentDate: "2025-01-19T16:45:00Z",
      lastAssessmentDate: "2025-01-19T17:00:00Z",
      nextAssessmentDue: "2025-01-20T09:00:00Z",
      activeAlerts: ["High-risk player", "Multiple recent concussions"],
      flaggedForReview: true
    }
  ];

  // Filter players based on selected filter
  const filteredPlayers = mockData.filter(player => {
    if (selectedFilter === 'active') return player.currentStatus === 'rtp_protocol';
    if (selectedFilter === 'high_risk') return player.riskLevel === 'high' || player.riskLevel === 'critical';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'rtp_protocol': return 'bg-orange-500';
      case 'medical_hold': return 'bg-red-500';
      case 'cleared_pending': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-orange-600 bg-orange-50';
      case 'high': return 'text-red-600 bg-red-50';
      case 'critical': return 'text-red-800 bg-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStageDisplay = (stage?: string) => {
    const stageMap: Record<string, string> = {
      'stage_1': 'Rest',
      'stage_2': 'Light Aerobic',
      'stage_3': 'Sport-Specific', 
      'stage_4': 'Non-Contact',
      'stage_5': 'Full Contact',
      'stage_6': 'Return to Play'
    };
    return stage ? stageMap[stage] || stage : 'N/A';
  };

  const activeRTPCount = mockData.filter(p => p.currentStatus === 'rtp_protocol').length;
  const highRiskCount = mockData.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length;
  const alertsCount = mockData.reduce((sum, p) => sum + p.activeAlerts.length, 0);

  return (
    <div className="space-y-6" data-testid="head-injury-summary">
      {/* Header with Quick Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Head Injury Management</h2>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onQuickAssessment} data-testid="button-quick-assessment">
            <Eye className="h-4 w-4 mr-2" />
            Quick Assessment
          </Button>
          <Button size="sm" onClick={onNewIncident} data-testid="button-new-incident">
            <Plus className="h-4 w-4 mr-2" />
            Log Incident
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Active RTP</p>
                <p className="text-2xl font-bold">{activeRTPCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold">{highRiskCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold">{alertsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Recovery</p>
                <p className="text-2xl font-bold">14d</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Priority Alerts */}
      {highRiskCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{highRiskCount} high-risk player(s)</strong> require medical attention. 
            Multiple concussions or prolonged recovery detected.
          </AlertDescription>
        </Alert>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button 
          variant={selectedFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('all')}
          data-testid="filter-all"
        >
          All Players ({mockData.length})
        </Button>
        <Button 
          variant={selectedFilter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('active')}
          data-testid="filter-active"
        >
          Active RTP ({activeRTPCount})
        </Button>
        <Button 
          variant={selectedFilter === 'high_risk' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('high_risk')}
          data-testid="filter-high-risk"
        >
          High Risk ({highRiskCount})
        </Button>
      </div>

      {/* RTP Status Board */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Return-to-Play Status Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No players match the selected filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlayers.map((player) => (
                <div 
                  key={player.playerId} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  data-testid={`player-row-${player.playerId}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(player.currentStatus)}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player.playerName}</span>
                        <Badge variant="outline" className="text-xs">{player.position}</Badge>
                        {player.flaggedForReview && (
                          <Badge className="bg-red-100 text-red-800 text-xs">Review Required</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {player.currentStatus === 'rtp_protocol' && (
                          <>Stage {player.currentRtpStage?.split('_')[1]} - {getStageDisplay(player.currentRtpStage)} • </>
                        )}
                        {player.daysSinceIncident && `${player.daysSinceIncident} days since incident`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className={getRiskColor(player.riskLevel)}>
                        {player.riskLevel.charAt(0).toUpperCase() + player.riskLevel.slice(1)} Risk
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {player.totalConcussions} total • {player.concussionsLast24Months} in 24mo
                      </div>
                    </div>

                    {player.activeAlerts.length > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-orange-600">{player.activeAlerts.length}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {player.nextAssessmentDue ? 'Due today' : 'No assessment scheduled'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span>⚠️ High-risk thresholds: 3+ concussions in 24 months, 14+ day recovery</span>
        <span>🔄 Auto-progression enabled for all protocols unless manually overridden</span>
      </div>
    </div>
  );
}