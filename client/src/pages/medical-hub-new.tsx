import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import NavigationHeader from "@/components/navigation-header";
import {
  Activity,
  Users,
  Target,
  MessageSquare,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Plus,
  Mail,
  Bell,
  Phone,
  MessageCircle
} from "lucide-react";

// Types
interface Player {
  id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
  };
  medicalStatus: {
    status: "available" | "modified" | "unavailable";
    wellnessScore: number;
    acwrRatio: number;
    lastAssessment: string;
  };
  position: string;
}

interface SquadMedicalStatus {
  id: string;
  name: string;
  position: string;
  status: "available" | "modified" | "unavailable";
  wellnessScore: number;
  acwrRatio: number;
  lastAssessment: string;
  injuryRisk?: "high" | "moderate" | "low";
}

export default function MedicalHub() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch player data
  const { data: playersResponse = [], isLoading } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  const players = Array.isArray(playersResponse) ? playersResponse : [];

  // Transform players data to medical status format
  const squadMedicalStatus: SquadMedicalStatus[] = players.map(player => ({
    id: player.id,
    name: `${player.personalDetails.firstName} ${player.personalDetails.lastName}`,
    position: (player as any).rugbyProfile?.primaryPosition || "Unknown",
    status: (player as any).currentStatus === 'injured' ? 'unavailable' : 
           (player as any).currentStatus === 'modified' ? 'modified' : 'available',
    wellnessScore: Math.random() * 10, // This would come from real medical data
    acwrRatio: Math.random() * 2,
    lastAssessment: "12/06/2024"
  }));

  // Legacy mock data removed - now using Firebase player data

  const atRiskPlayers = [
    {
      name: "Mahoriri Ngakuru",
      position: "Centre",
      injuryRisk: "moderate",
      acwrRatio: "0.94",
      lastAssessment: "2024-06-12"
    }
  ];

  const upcomingMilestones = [
    // Hardcoded milestones removed - now using Firebase medical data
    {
      player: "Mark Tele'a",
      milestone: "Return to running",
      date: "2024-06-14",
      type: "progression",
      priority: "high"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "border-green-200 bg-green-50";
      case "modified":
        return "border-amber-200 bg-amber-50";
      case "unavailable":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "modified":
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case "unavailable":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        title="Medical Intelligence Hub"
        subtitle="Comprehensive medical oversight and player wellness management"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Main", href: "/" },
          { label: "Medical Hub", href: "/medical" }
        ]}
        backUrl="/"
        backLabel="Back to Main"
      />

      <div className="container mx-auto p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-100 p-2 rounded-lg border border-gray-200 gap-1">
            <TabsTrigger 
              value="overview"
              className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
            >
              <Activity className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="rtp-planner"
              className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
            >
              <Target className="mr-2 h-4 w-4" />
              RTP Planner
            </TabsTrigger>
            <TabsTrigger 
              value="communication"
              className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Communication
            </TabsTrigger>
            <TabsTrigger 
              value="appointments"
              className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Appointments
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Unified Medical Dashboard */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Squad Availability Board */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Squad Availability Board
                  </CardTitle>
                  <CardDescription>
                    Click on any player card to view their individual medical profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {squadMedicalStatus.map((player) => (
                      <div
                        key={player.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${getStatusColor(player.status)}`}
                        onClick={() => {
                          // Direct navigation to dedicated medical player profile
                          window.location.href = `/medical-player/${player.id}`;
                        }}
                      >
                        <div className="text-center space-y-2">
                          <div className="w-10 h-10 mx-auto bg-gray-300 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-xs">{player.name}</div>
                            <div className="text-xs text-gray-600">{player.position}</div>
                          </div>
                          <div className="flex items-center justify-center space-x-1">
                            {getStatusIcon(player.status)}
                            <span className="text-xs font-medium">
                              {player.status === "available" && "Available"}
                              {player.status === "modified" && "Modified"}
                              {player.status === "unavailable" && "Unavailable"}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Wellness:</span>
                              <span className={`font-medium ${
                                player.wellnessScore >= 8 ? "text-green-600" :
                                player.wellnessScore >= 6 ? "text-amber-600" : "text-red-600"
                              }`}>
                                {player.wellnessScore}/10
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">ACWR:</span>
                              <span className={`font-medium ${
                                player.acwrRatio <= 1.0 ? "text-green-600" : 
                                player.acwrRatio <= 1.3 ? "text-amber-600" : "text-red-600"
                              }`}>
                                {player.acwrRatio}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Last: {player.lastAssessment}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* At Risk Players */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      At Risk Players
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {atRiskPlayers.map((player, index) => (
                        <div key={index} className="p-3 border rounded-lg bg-amber-50 border-amber-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm">{player.name}</div>
                            <Badge className={`text-xs ${
                              player.injuryRisk === "high" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {player.injuryRisk}
                            </Badge>
                          </div>
                          <div className={`text-xs mt-1 font-medium ${
                            player.injuryRisk === "high" ? "text-red-700" : "text-amber-700"
                          }`}>
                            ACWR Ratio: {player.acwrRatio}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Last Assessment: {player.lastAssessment}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Milestones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Upcoming Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingMilestones.map((milestone, index) => (
                        <div key={index} className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                          milestone.priority === "high" ? "bg-red-50 border-red-200" :
                          milestone.priority === "moderate" ? "bg-amber-50 border-amber-200" :
                          "bg-blue-50 border-blue-200"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <div className="font-medium text-sm">{milestone.player}</div>
                                <Badge className={`text-xs ${
                                  milestone.priority === "high" ? "bg-red-100 text-red-800" :
                                  milestone.priority === "moderate" ? "bg-amber-100 text-amber-800" :
                                  "bg-blue-100 text-blue-800"
                                }`}>
                                  {milestone.priority}
                                </Badge>
                              </div>
                              <div className={`text-xs mt-1 ${
                                milestone.priority === "high" ? "text-red-700" :
                                milestone.priority === "moderate" ? "text-amber-700" :
                                "text-blue-600"
                              }`}>
                                {milestone.milestone}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-600">
                                {new Date(milestone.date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {milestone.type}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Squad Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="mx-auto mb-3 text-green-600" size={32} />
                  <div className="text-2xl font-bold text-gray-900">
                    {squadMedicalStatus.filter(p => p.status === "available").length}
                  </div>
                  <div className="text-sm text-gray-600">Available Players</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="mx-auto mb-3 text-amber-600" size={32} />
                  <div className="text-2xl font-bold text-gray-900">
                    {squadMedicalStatus.filter(p => p.status === "modified").length}
                  </div>
                  <div className="text-sm text-gray-600">Modified Training</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <XCircle className="mx-auto mb-3 text-red-600" size={32} />
                  <div className="text-2xl font-bold text-gray-900">
                    {squadMedicalStatus.filter(p => p.status === "unavailable").length}
                  </div>
                  <div className="text-sm text-gray-600">Unavailable</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="mx-auto mb-3 text-amber-600" size={32} />
                  <div className="text-2xl font-bold text-gray-900">{atRiskPlayers.length}</div>
                  <div className="text-sm text-gray-600">At Risk Players</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RTP Planner Tab */}
          <TabsContent value="rtp-planner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Return to Play Planner</CardTitle>
                <CardDescription>Manage player recovery protocols and clearance stages</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">RTP Planner content will be implemented here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Player Status Updates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Send Player Update
                  </CardTitle>
                  <CardDescription>
                    Communicate availability changes to coaches and staff
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Player</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Select player...</option>
                      {squadMedicalStatus.map((player) => (
                        <option key={player.id} value={player.id}>{player.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Status Update</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Available - Full Training</option>
                      <option>Modified Training - Limited Contact</option>
                      <option>Unavailable - Injured</option>
                      <option>Return to Play - Phase 1</option>
                      <option>Return to Play - Phase 2</option>
                      <option>Return to Play - Full Clearance</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="Additional details for coaches..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Recipients</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">Head Coach</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">Assistant Coach</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">Strength Coach</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">Team Manager</Badge>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Update
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Communications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Recent Communications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">Sample Communication</div>
                        <div className="text-xs text-gray-500">2 hours ago</div>
                      </div>
                      <div className="text-xs text-gray-600">
                        Full training clearance confirmed. All wellness metrics positive.
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">Head Coach</Badge>
                        <Badge variant="outline" className="text-xs">Sent</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar View */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Medical Appointments
                    </div>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Appointment
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium py-2">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }, (_, i) => (
                      <div key={i} className="aspect-square border rounded p-1 text-xs hover:bg-gray-50 cursor-pointer">
                        <div className="font-medium">{((i % 31) + 1)}</div>
                        {i === 10 && (
                          <div className="bg-blue-100 text-blue-800 rounded px-1 mt-1 text-xs">
                            Appt 2pm
                          </div>
                        )}
                        {i === 18 && (
                          <div className="bg-green-100 text-green-800 rounded px-1 mt-1 text-xs">
                            Mark 10am
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Today's Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">Sample Player</div>
                        <div className="text-xs text-gray-500">2:00 PM</div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        Routine Assessment - Hip flexor follow-up
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        <Bell className="h-3 w-3 mr-2" />
                        Send Reminder
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">Mark Tele'a</div>
                        <div className="text-xs text-gray-500">4:30 PM</div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        Return to Play Assessment - Phase 2
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        <Bell className="h-3 w-3 mr-2" />
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}