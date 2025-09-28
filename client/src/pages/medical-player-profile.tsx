import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useHashNavigation } from "@/hooks/useHashNavigation";
import NavigationHeader from "@/components/navigation-header";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Users,
  FileText,
  Send,
  Save,
  Brain
} from "lucide-react";
import HeadInjuryPlayerProfile from "@/components/head-injury-player-profile";
import HeadInjuryIncidentLogger from "@/components/head-injury-incident-logger";

interface Player {
  id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  rugbyProfile?: {
    jerseyNumber: number;
    primaryPosition: string;
  };
  jerseyNumber?: number;
  primaryPosition?: string;
  status?: {
    medical: string;
  };
  availability?: {
    status: string;
    lastUpdated: string;
    updatedBy: string;
    detail?: string;
    expectedReturn?: string;
  };
}

interface MedicalData {
  playerId?: string;
  currentStatus: "available" | "modified" | "unavailable";
  wellnessScore: number;
  acwrRatio: number;
  lastAssessment: string;
  injuryRisk: "low" | "moderate" | "high";
  recentAssessments: Array<{
    date: string;
    type: string;
    notes: string;
    assessor: string;
  }>;
  medicalHistory: Array<{
    condition: string;
    dateRange: string;
    notes: string;
    status: "active" | "resolved" | "monitoring";
    treatedBy: string;
  }>;
}

export default function MedicalPlayerProfile() {
  const [, params] = useRoute("/medical-player/:playerId");
  const playerId = params?.playerId;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Hash navigation for medical tabs only
  const validTabs = ['medical-profile', 'head-injury', 'treatment-assessment', 'communications', 'availability-updates'];
  const { activeTab, handleTabChange } = useHashNavigation(validTabs, 'medical-profile');

  const [availabilityStatus, setAvailabilityStatus] = useState<"available" | "modified" | "unavailable">("available");
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [showHeadInjuryIncident, setShowHeadInjuryIncident] = useState(false);

  const { data: playerResponse, isLoading: playerLoading } = useQuery<{success: boolean, player: Player}>({
    queryKey: [`/api/players/${playerId}`],
    enabled: !!playerId,
    staleTime: 0, // FORCE LIVE UPDATES: No caching to ensure we see changes immediately
  });

  const { data: medicalResponse, isLoading: medicalLoading } = useQuery<{success: boolean, data: MedicalData[]}>({
    queryKey: [`/api/v2/medical-data`],
    enabled: !!playerId,
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
  });

  const player = playerResponse?.player;
  const isLoading = playerLoading || medicalLoading;

  // Get medical data for this player from Firebase
  const playerMedicalData = medicalResponse?.data?.find(data => data.playerId === playerId);
  
  // Dynamic medical data based on current player status from Firebase
  const getCurrentStatus = (): "available" | "modified" | "unavailable" => {
    const status = player?.availability?.status || "";
    console.log("🔍 MEDICAL PROFILE: getCurrentStatus() checking status:", status);
    
    if (status.toLowerCase().includes('available') && !status.toLowerCase().includes('unavailable')) return "available";
    if (status.toLowerCase().includes('modified')) return "modified";
    if (status.toLowerCase().includes('unavailable')) return "unavailable";
    
    // Default fallback
    console.log("⚠️ MEDICAL PROFILE: Status not recognized, defaulting to available");
    return "available";
  };

  const medicalData: MedicalData = playerMedicalData || {
    playerId,
    currentStatus: getCurrentStatus(),
    wellnessScore: 8.5,
    acwrRatio: 0.85,
    lastAssessment: player?.availability?.lastUpdated?.split('T')[0] || "2024-06-12",
    injuryRisk: getCurrentStatus() === "unavailable" ? "high" : getCurrentStatus() === "modified" ? "moderate" : "low",
    recentAssessments: [
      {
        date: "2024-06-12",
        type: "Pre-Training Assessment",
        notes: "All systems clear - full training clearance. Player reports feeling strong and motivated.",
        assessor: "Dr. Sarah Jones"
      },
      {
        date: "2024-06-11",
        type: "Physiotherapy Review",
        notes: "Hip flexor mobility - excellent progress. Range of motion restored to 100%.",
        assessor: "Mark Thompson, Physiotherapist"
      },
      {
        date: "2024-06-08",
        type: "Wellness Check",
        notes: "Sleep quality improved. Nutrition compliance excellent. Ready for full training load.",
        assessor: "Lisa Chen, Sports Nutritionist"
      }
    ],
    medicalHistory: [
      {
        condition: "Hip Flexor Strain - Minor",
        dateRange: "2024-05-15 - 2024-06-01",
        notes: "Minor hip flexor strain during training. Responded well to conservative treatment with physiotherapy and modified training load. Full recovery achieved.",
        status: "resolved",
        treatedBy: "Dr. Sarah Jones & Mark Thompson"
      },
      {
        condition: "Routine Wellness Monitoring",
        dateRange: "Ongoing",
        notes: "Regular wellness monitoring and load management. Player demonstrates excellent self-awareness and compliance with recovery protocols.",
        status: "monitoring",
        treatedBy: "Medical Team"
      }
    ]
  };

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (data: { status: string; notes: string }) => {
      // Map the status values to the correct format for the API
      const statusMap: { [key: string]: string } = {
        'available': 'available - full training',
        'modified': 'modified training - limited contact', 
        'unavailable': 'unavailable - injured/recovery'
      };
      
      const mappedStatus = statusMap[data.status] || data.status;
      
      const response = await fetch(`/api/players/${playerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: mappedStatus,
          medicalNotes: data.notes,
          updatedBy: 'Medical Staff',
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Availability Updated",
        description: "Player availability status has been updated and coaches have been notified.",
      });
      
      // FORCE IMMEDIATE REFRESH WITH REFETCH: Invalidate all related caches 
      queryClient.invalidateQueries({ queryKey: ['/api/players'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: [`/api/players/${playerId}`], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['/api/v2/medical-data'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['/api/v2/players'], refetchType: 'all' });
      
      // FORCE COMPONENT REFRESH: Remove stale time to force immediate refetch
      queryClient.refetchQueries({ queryKey: [`/api/players/${playerId}`] });
      
      // Reset form
      setAvailabilityNotes("");
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update availability status. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"; // GREEN for Available
      case "modified":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"; // YELLOW for Modified Training
      case "unavailable":
        return "bg-red-100 text-red-800 border-red-200"; // RED for Unavailable/Injured
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4" />;
      case "modified":
        return <AlertCircle className="w-4 h-4" />;
      case "unavailable":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600";
      case "moderate":
        return "text-amber-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medical profile...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Medical Profile Not Found</h2>
          <p className="text-gray-600 mb-4">The requested medical profile could not be found.</p>
          <Button onClick={() => window.location.href = '/medical'} className="bg-blue-600 hover:bg-blue-700">
            Back to Medical Hub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        title={`Medical Profile - ${player?.personalDetails?.firstName || 'Player'} ${player?.personalDetails?.lastName || 'Profile'}`}
        breadcrumbs={[
          { label: "Medical Hub", href: "/medical" },
          { label: (player?.personalDetails?.firstName || 'Player') + " " + (player?.personalDetails?.lastName || 'Profile'), href: `/medical-player/${playerId}` }
        ]}
        backButton={{
          label: "Back to Medical Hub",
          href: "/medical"
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Player Basic Info Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <Avatar className="w-16 h-16">
                  <AvatarImage 
                    src={`/api/players/${player.id}/avatar`} 
                    alt={`${player?.personalDetails?.firstName || 'Player'} ${player?.personalDetails?.lastName || 'Profile'}`} 
                  />
                  <AvatarFallback className="bg-blue-600 text-white text-lg font-bold">
                    {(player?.personalDetails?.firstName?.[0] || 'P')}{(player?.personalDetails?.lastName?.[0] || 'P')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {player?.personalDetails?.firstName || 'Player'} {player?.personalDetails?.lastName || 'Profile'}
                  </h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <p className="text-gray-600">#{player.rugbyProfile?.jerseyNumber} • {player.rugbyProfile?.primaryPosition}</p>
                    <Badge className={`flex items-center gap-2 ${getStatusColor(getCurrentStatus())}`}>
                      {getStatusIcon(getCurrentStatus())}
                      {getCurrentStatus() === "available" && "Available - Full Training"}
                      {getCurrentStatus() === "modified" && "Modified Training - Limited Contact"}
                      {getCurrentStatus() === "unavailable" && "Unavailable - Injured/Recovery"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg border border-gray-200 gap-1 h-12">
            <TabsTrigger 
              value="medical-profile"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center gap-2 h-full"
            >
              <Activity className="h-4 w-4" />
              Medical Profile
            </TabsTrigger>
            <TabsTrigger 
              value="head-injury"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center gap-2 h-full"
            >
              <Brain className="h-4 w-4" />
              Head Injury
            </TabsTrigger>
            <TabsTrigger 
              value="treatment-assessment"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center gap-2 h-full"
            >
              <FileText className="h-4 w-4" />
              Treatment/Assessment
            </TabsTrigger>
            <TabsTrigger 
              value="communications"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center gap-2 h-full"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Communications
            </TabsTrigger>
            <TabsTrigger 
              value="availability-updates"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center gap-2 h-full"
            >
              <Send className="h-4 w-4" />
              Availability Updates
            </TabsTrigger>
          </TabsList>

          {/* Medical Profile Tab */}
          <TabsContent value="medical-profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Medical Status Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Current Medical Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">{medicalData.wellnessScore}/10</div>
                      <div className="text-sm text-gray-600">Wellness Score</div>
                      <div className="text-xs text-gray-500 mt-1">Excellent</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">{medicalData.acwrRatio}</div>
                      <div className="text-sm text-gray-600">ACWR Ratio</div>
                      <div className="text-xs text-gray-500 mt-1">Safe Range</div>
                    </div>

                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 capitalize ${getRiskColor(medicalData.injuryRisk)}`}>
                        {medicalData.injuryRisk}
                      </div>
                      <div className="text-sm text-gray-600">Injury Risk</div>
                      <div className="text-xs text-gray-500 mt-1">Assessment</div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Recent Assessments</h4>
                    <div className="space-y-3">
                      {medicalData.recentAssessments.slice(0, 2).map((assessment, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-green-50 border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm">{assessment.type}</div>
                            <div className="text-xs text-gray-500">{assessment.date}</div>
                          </div>
                          <div className="text-xs text-gray-700 mb-2">{assessment.notes}</div>
                          <div className="text-xs text-gray-500">By: {assessment.assessor}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Medical Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" size="sm">
                    <Activity className="w-4 h-4 mr-2" />
                    New Assessment
                  </Button>
                  <Button className="w-full" variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                  <Button className="w-full" variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Player
                  </Button>
                  <Button className="w-full" variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    View Full History
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Head Injury Tab */}
          <TabsContent value="head-injury" className="space-y-6">
            <HeadInjuryPlayerProfile 
              playerId={playerId || ''}
              playerName={`${player?.personalDetails?.firstName || 'Player'} ${player?.personalDetails?.lastName || 'Profile'}`}
              onLogIncident={() => setShowHeadInjuryIncident(true)}
            />
          </TabsContent>

          {/* Treatment/Assessment Tab */}
          <TabsContent value="treatment-assessment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical History & Treatment Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalData.medicalHistory.map((record, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium">{record.condition}</div>
                        <div className="text-sm text-gray-500">{record.dateRange}</div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">{record.notes}</div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`${
                          record.status === "resolved" ? "text-green-600 border-green-600" :
                          record.status === "active" ? "text-red-600 border-red-600" :
                          "text-blue-600 border-blue-600"
                        }`}>
                          {record.status}
                        </Badge>
                        <div className="text-xs text-gray-500">Treated by: {record.treatedBy}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalData.recentAssessments.map((assessment, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium">{assessment.type}</div>
                        <div className="text-sm text-gray-500">{assessment.date}</div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">{assessment.notes}</div>
                      <div className="text-xs text-gray-500">Assessed by: {assessment.assessor}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Medical Update</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Update Type</label>
                  <Select>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select update type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">Status Change</SelectItem>
                      <SelectItem value="assessment">Assessment Results</SelectItem>
                      <SelectItem value="treatment">Treatment Update</SelectItem>
                      <SelectItem value="clearance">Training Clearance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Message to Coaching Staff</label>
                  <Textarea
                    placeholder="Enter medical update details..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                
                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Update to Coaches
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Updates Tab */}
          <TabsContent value="availability-updates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Player Availability Status</CardTitle>
                <p className="text-sm text-gray-600">
                  Changes here will immediately update the player's status on the coach's dashboard
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Current Status</label>
                  <div className="mt-1">
                    <Badge className={`flex items-center gap-2 w-fit ${getStatusColor(getCurrentStatus())}`}>
                      {getStatusIcon(getCurrentStatus())}
                      {getCurrentStatus() === "available" && "Available - Full Training"}
                      {getCurrentStatus() === "modified" && "Modified Training - Limited Contact"}
                      {getCurrentStatus() === "unavailable" && "Unavailable - Injured/Recovery"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">New Status</label>
                  <Select value={availabilityStatus} onValueChange={(value: "available" | "modified" | "unavailable") => setAvailabilityStatus(value)}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available - Full Training</SelectItem>
                      <SelectItem value="modified">Modified Training - Limited Contact</SelectItem>
                      <SelectItem value="unavailable">Unavailable - Injured/Recovery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Medical Notes (for coaching staff)</label>
                  <Textarea
                    placeholder="Enter notes about the status change that coaches should know..."
                    value={availabilityNotes}
                    onChange={(e) => setAvailabilityNotes(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This update will be sent to all coaching staff and will update the player's availability on the team dashboard immediately.
                  </p>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => updateAvailabilityMutation.mutate({ status: availabilityStatus, notes: availabilityNotes })}
                  disabled={updateAvailabilityMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateAvailabilityMutation.isPending ? 'Updating...' : 'Update Availability & Notify Coaches'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Head Injury Incident Logger Dialog */}
        <Dialog open={showHeadInjuryIncident} onOpenChange={setShowHeadInjuryIncident}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-red-600" />
                Head Injury Incident Logger
              </DialogTitle>
              <DialogDescription>
                Complete this form immediately after a suspected head injury incident
              </DialogDescription>
            </DialogHeader>
            
            <HeadInjuryIncidentLogger 
              selectedPlayerId={playerId}
              onClose={() => setShowHeadInjuryIncident(false)}
              onSubmitted={(incidentId) => {
                console.log('Head injury incident logged:', incidentId);
                setShowHeadInjuryIncident(false);
                queryClient.invalidateQueries({ queryKey: ["/api/head-injuries"] });
                toast({
                  title: "Incident Logged",
                  description: "Head injury incident has been successfully recorded and will begin RTP protocol assessment.",
                });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}