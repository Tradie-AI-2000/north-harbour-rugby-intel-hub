import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowLeft,
  Calendar,
  Activity,
  FileText,
  Stethoscope,
  ClipboardList,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Heart,
  Target,
  TrendingUp,
  Plus,
  Send,
  Clock,
  Phone,
  Mail,
  User,
  Shield,
  AlertCircle,
  Zap,
  Save,
  Eye
} from "lucide-react";

interface MedicalAppointment {
  id: string;
  playerId: string;
  type: 'routine_checkup' | 'injury_assessment' | 'treatment' | 'clearance';
  date: string;
  scheduledTime: string;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  provider: string;
  notes?: string;
  outcome?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

interface TreatmentNote {
  id: string;
  date: string;
  provider: string;
  type: 'assessment' | 'treatment' | 'progress_note' | 'clearance' | 'communication';
  content: string;
  recommendations?: string;
  followUp?: string;
  flaggedForCoach?: boolean;
  urgency: 'low' | 'medium' | 'high';
}

interface InjuryRecord {
  id: string;
  date: string;
  type: string;
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  status: 'active' | 'recovering' | 'cleared';
  expectedReturn?: string;
  actualReturn?: string;
  treatmentPlan?: string;
  rtpProtocol?: string;
}

export default function MedicalPlayerRecord() {
  const [match, params] = useRoute("/medical/player/:playerId");
  const playerId = params?.playerId;
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [showNewInjury, setShowNewInjury] = useState(false);
  const [showCommunication, setShowCommunication] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [appointmentForm, setAppointmentForm] = useState({
    type: '',
    date: '',
    time: '',
    provider: '',
    notes: ''
  });

  const [noteForm, setNoteForm] = useState({
    type: '',
    content: '',
    recommendations: '',
    followUp: '',
    flaggedForCoach: false,
    urgency: 'low'
  });

  const [injuryForm, setInjuryForm] = useState({
    type: '',
    severity: '',
    description: '',
    expectedReturn: '',
    treatmentPlan: ''
  });

  const [communicationForm, setCommunicationForm] = useState({
    recipient: '',
    subject: '',
    message: '',
    priority: 'normal'
  });

  // Fetch player data
  const { data: player, isLoading: playerLoading } = useQuery({
    queryKey: ["/api/players", playerId],
    enabled: !!playerId,
  });

  // Fetch medical appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/medical/appointments", playerId],
    enabled: !!playerId,
  });

  // Fetch treatment notes
  const { data: treatmentNotes = [] } = useQuery({
    queryKey: ["/api/medical/notes", playerId],
    enabled: !!playerId,
  });

  // Fetch injury records
  const { data: injuryRecords = [] } = useQuery({
    queryKey: ["/api/medical/injuries", playerId],
    enabled: !!playerId,
  });

  // Mutations for creating medical records
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await fetch(`/api/medical/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...appointmentData,
          playerId,
          id: `appointment_${Date.now()}`
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical/appointments", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/players", playerId] });
      setShowNewAppointment(false);
      setAppointmentForm({ type: '', date: '', time: '', provider: '', notes: '' });
      toast({
        title: "Appointment Scheduled",
        description: "Medical appointment has been added successfully.",
      });
    }
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: any) => {
      const response = await fetch(`/api/medical/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...noteData,
          playerId,
          id: `note_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          provider: 'Dr. Smith' // Would come from auth context
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical/notes", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/players", playerId] });
      setShowNewNote(false);
      setNoteForm({ type: '', content: '', recommendations: '', followUp: '', flaggedForCoach: false, urgency: 'low' });
      toast({
        title: "Treatment Note Added",
        description: "Medical note has been recorded successfully.",
      });
    }
  });

  const createInjuryMutation = useMutation({
    mutationFn: async (injuryData: any) => {
      const response = await fetch(`/api/medical/injuries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...injuryData,
          playerId,
          id: `injury_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          status: 'active'
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical/injuries", playerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/players", playerId] });
      setShowNewInjury(false);
      setInjuryForm({ type: '', severity: '', description: '', expectedReturn: '', treatmentPlan: '' });
      toast({
        title: "Injury Recorded",
        description: "Injury has been documented and will update player status.",
      });
    }
  });

  const sendCommunicationMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch(`/api/medical/communication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...messageData,
          playerId,
          timestamp: new Date().toISOString(),
          sender: 'Dr. Smith' // Would come from auth context
        })
      });
      return response.json();
    },
    onSuccess: () => {
      setShowCommunication(false);
      setCommunicationForm({ recipient: '', subject: '', message: '', priority: 'normal' });
      toast({
        title: "Message Sent",
        description: "Communication has been sent successfully.",
      });
    }
  });

  if (!match) return null;

  if (playerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading player medical record...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Player Not Found</h2>
          <p className="text-gray-600">Unable to locate medical records for this player.</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "modified": return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "unavailable": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Medical Hub
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Medical Record: {player.personalDetails?.firstName} {player.personalDetails?.lastName}
              </h1>
              <p className="text-gray-600">
                {player.rugbyProfile?.primaryPosition} • Jersey #{player.rugbyProfile?.jerseyNumber}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {getStatusIcon(player.status?.medical || "available")}
            <Badge variant={player.status?.medical === "available" ? "default" : "destructive"}>
              {player.status?.medical || "Available"}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Medical Status</p>
                  <p className="text-lg font-semibold text-green-600">
                    {player.status?.medical || "Available"}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Injuries</p>
                  <p className="text-lg font-semibold text-red-600">
                    {injuryRecords.filter((injury: any) => injury.status === 'active').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming Appointments</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {appointments.filter((apt: any) => 
                      apt.status === 'scheduled' && new Date(apt.date) > new Date()
                    ).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last Assessment</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {treatmentNotes[0] ? new Date(treatmentNotes[0].date).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <Stethoscope className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="treatment">Treatment Notes</TabsTrigger>
            <TabsTrigger value="injuries">Injury History</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Player Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Player Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                      <p className="text-sm">{player.personalDetails?.dateOfBirth}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Age</label>
                      <p className="text-sm">
                        {new Date().getFullYear() - new Date(player.personalDetails?.dateOfBirth).getFullYear()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                      <p className="text-sm">{player.personalDetails?.emergencyContact?.name}</p>
                      <p className="text-xs text-gray-500">{player.personalDetails?.emergencyContact?.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Relationship</label>
                      <p className="text-sm">{player.personalDetails?.emergencyContact?.relationship}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Medical Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {treatmentNotes.slice(0, 5).map((note: any) => (
                      <div key={note.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <FileText className="h-4 w-4 text-gray-500 mt-1" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{note.type.replace('_', ' ')}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(note.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {note.content.length > 100 
                              ? `${note.content.substring(0, 100)}...` 
                              : note.content}
                          </p>
                          {note.flaggedForCoach && (
                            <Badge variant="outline" className="mt-2">
                              <Shield className="h-3 w-3 mr-1" />
                              Flagged for Coach
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common medical tasks and communications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    onClick={() => setShowNewAppointment(true)}
                    className="h-20 flex-col space-y-2"
                  >
                    <Calendar className="h-6 w-6" />
                    <span>Schedule Appointment</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setShowNewNote(true)}
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                  >
                    <FileText className="h-6 w-6" />
                    <span>Add Treatment Note</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setShowNewInjury(true)}
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                  >
                    <AlertTriangle className="h-6 w-6" />
                    <span>Record Injury</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setShowCommunication(true)}
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                  >
                    <MessageSquare className="h-6 w-6" />
                    <span>Send Message</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Medical Appointments</h3>
              <Button onClick={() => setShowNewAppointment(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>

            <div className="grid gap-4">
              {appointments.map((appointment: any) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          appointment.status === 'completed' ? 'bg-green-500' :
                          appointment.status === 'scheduled' ? 'bg-blue-500' :
                          appointment.status === 'missed' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                        <div>
                          <h4 className="font-medium">{appointment.type.replace('_', ' ')}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.scheduledTime}
                          </p>
                          <p className="text-sm text-gray-600">Provider: {appointment.provider}</p>
                        </div>
                      </div>
                      <Badge variant={
                        appointment.status === 'completed' ? 'default' :
                        appointment.status === 'scheduled' ? 'secondary' :
                        appointment.status === 'missed' ? 'destructive' : 'outline'
                      }>
                        {appointment.status}
                      </Badge>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-700 mt-3 pl-7">{appointment.notes}</p>
                    )}
                    {appointment.outcome && (
                      <div className="mt-3 pl-7">
                        <p className="text-sm font-medium text-gray-700">Outcome:</p>
                        <p className="text-sm text-gray-600">{appointment.outcome}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Treatment Notes Tab */}
          <TabsContent value="treatment" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Treatment Notes</h3>
              <Button onClick={() => setShowNewNote(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>

            <div className="grid gap-4">
              {treatmentNotes.map((note: any) => (
                <Card key={note.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getUrgencyColor(note.urgency)}>
                            {note.urgency} priority
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {note.type.replace('_', ' ')} • {new Date(note.date).toLocaleDateString()}
                          </span>
                          {note.flaggedForCoach && (
                            <Badge variant="outline">
                              <Shield className="h-3 w-3 mr-1" />
                              Coach Flagged
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium mb-2">Dr. {note.provider}</h4>
                        <p className="text-sm text-gray-700 mb-3">{note.content}</p>
                        
                        {note.recommendations && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700">Recommendations:</p>
                            <p className="text-sm text-gray-600">{note.recommendations}</p>
                          </div>
                        )}
                        
                        {note.followUp && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Follow-up Required:</p>
                            <p className="text-sm text-gray-600">{note.followUp}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Injuries Tab */}
          <TabsContent value="injuries" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Injury History</h3>
              <Button onClick={() => setShowNewInjury(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Record Injury
              </Button>
            </div>

            <div className="grid gap-4">
              {injuryRecords.map((injury: any) => (
                <Card key={injury.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{injury.type}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(injury.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant={
                          injury.severity === 'severe' ? 'destructive' :
                          injury.severity === 'moderate' ? 'secondary' : 'outline'
                        }>
                          {injury.severity}
                        </Badge>
                        <Badge variant={
                          injury.status === 'active' ? 'destructive' :
                          injury.status === 'recovering' ? 'secondary' : 'default'
                        }>
                          {injury.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{injury.description}</p>
                    
                    {injury.expectedReturn && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Expected Return:</span>
                          <p className="text-gray-600">{new Date(injury.expectedReturn).toLocaleDateString()}</p>
                        </div>
                        {injury.actualReturn && (
                          <div>
                            <span className="font-medium text-gray-700">Actual Return:</span>
                            <p className="text-gray-600">{new Date(injury.actualReturn).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {injury.treatmentPlan && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Treatment Plan:</p>
                        <p className="text-sm text-gray-600">{injury.treatmentPlan}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Communication Center</h3>
              <Button onClick={() => setShowCommunication(true)}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Player</p>
                        <p className="text-xs text-gray-600">{player.personalDetails?.phone}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Emergency Contact</p>
                        <p className="text-xs text-gray-600">{player.personalDetails?.emergencyContact?.phone}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Coach Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      Medical updates automatically sync with coaching staff through the data integrity system. 
                      Flagged notes and status changes will appear in coach dashboards immediately.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Medical Impact Analysis
                  </CardTitle>
                  <CardDescription>
                    How medical status affects performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      All medical updates automatically cascade through:
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Player availability status</li>
                        <li>• Team selection metrics</li>
                        <li>• Performance analysis algorithms</li>
                        <li>• Cohesion reliability scores</li>
                        <li>• Player value assessments</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Real-time Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm font-medium">Coach Dashboard</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm font-medium">Team Selection</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm font-medium">Performance Analytics</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm font-medium">Player Value System</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs for creating new records */}
        {/* New Appointment Dialog */}
        <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Medical Appointment</DialogTitle>
              <DialogDescription>
                Add a new appointment for {player.personalDetails?.firstName} {player.personalDetails?.lastName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Appointment Type</label>
                <Select value={appointmentForm.type} onValueChange={(value) => 
                  setAppointmentForm(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine_checkup">Routine Checkup</SelectItem>
                    <SelectItem value="injury_assessment">Injury Assessment</SelectItem>
                    <SelectItem value="treatment">Treatment Session</SelectItem>
                    <SelectItem value="clearance">Medical Clearance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input
                    type="time"
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Provider</label>
                <Input
                  value={appointmentForm.provider}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, provider: e.target.value }))}
                  placeholder="Dr. Smith"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewAppointment(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createAppointmentMutation.mutate(appointmentForm)}
                disabled={!appointmentForm.type || !appointmentForm.date || !appointmentForm.time}
              >
                <Save className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Treatment Note Dialog */}
        <Dialog open={showNewNote} onOpenChange={setShowNewNote}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Treatment Note</DialogTitle>
              <DialogDescription>
                Record medical assessment or treatment details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Note Type</label>
                  <Select value={noteForm.type} onValueChange={(value) => 
                    setNoteForm(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="treatment">Treatment</SelectItem>
                      <SelectItem value="progress_note">Progress Note</SelectItem>
                      <SelectItem value="clearance">Clearance</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={noteForm.urgency} onValueChange={(value) => 
                    setNoteForm(prev => ({ ...prev, urgency: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Assessment findings, treatment details, or observations..."
                  rows={4}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Recommendations</label>
                <Textarea
                  value={noteForm.recommendations}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, recommendations: e.target.value }))}
                  placeholder="Treatment recommendations or modifications..."
                  rows={2}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Follow-up Required</label>
                <Input
                  value={noteForm.followUp}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, followUp: e.target.value }))}
                  placeholder="Follow-up instructions or timeline..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="flagForCoach"
                  checked={noteForm.flaggedForCoach}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, flaggedForCoach: e.target.checked }))}
                />
                <label htmlFor="flagForCoach" className="text-sm font-medium">
                  Flag for coaching staff
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewNote(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createNoteMutation.mutate(noteForm)}
                disabled={!noteForm.type || !noteForm.content}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Injury Dialog */}
        <Dialog open={showNewInjury} onOpenChange={setShowNewInjury}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Record New Injury</DialogTitle>
              <DialogDescription>
                Document injury details and treatment plan
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Injury Type</label>
                  <Input
                    value={injuryForm.type}
                    onChange={(e) => setInjuryForm(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="e.g., Hamstring strain"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <Select value={injuryForm.severity} onValueChange={(value) => 
                    setInjuryForm(prev => ({ ...prev, severity: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={injuryForm.description}
                  onChange={(e) => setInjuryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the injury..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Expected Return Date</label>
                <Input
                  type="date"
                  value={injuryForm.expectedReturn}
                  onChange={(e) => setInjuryForm(prev => ({ ...prev, expectedReturn: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Treatment Plan</label>
                <Textarea
                  value={injuryForm.treatmentPlan}
                  onChange={(e) => setInjuryForm(prev => ({ ...prev, treatmentPlan: e.target.value }))}
                  placeholder="Treatment approach and rehabilitation plan..."
                  rows={3}
                />
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Recording this injury will automatically update player availability status and notify coaching staff.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewInjury(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createInjuryMutation.mutate(injuryForm)}
                disabled={!injuryForm.type || !injuryForm.severity || !injuryForm.description}
              >
                <Save className="h-4 w-4 mr-2" />
                Record Injury
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Communication Dialog */}
        <Dialog open={showCommunication} onOpenChange={setShowCommunication}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
              <DialogDescription>
                Communicate with player, coaches, or medical staff
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Recipient</label>
                  <Select value={communicationForm.recipient} onValueChange={(value) => 
                    setCommunicationForm(prev => ({ ...prev, recipient: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="player">Player</SelectItem>
                      <SelectItem value="head_coach">Head Coach</SelectItem>
                      <SelectItem value="assistant_coach">Assistant Coach</SelectItem>
                      <SelectItem value="medical_team">Medical Team</SelectItem>
                      <SelectItem value="emergency_contact">Emergency Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={communicationForm.priority} onValueChange={(value) => 
                    setCommunicationForm(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={communicationForm.subject}
                  onChange={(e) => setCommunicationForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Message subject..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={communicationForm.message}
                  onChange={(e) => setCommunicationForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Your message..."
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCommunication(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => sendCommunicationMutation.mutate(communicationForm)}
                disabled={!communicationForm.recipient || !communicationForm.message}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}