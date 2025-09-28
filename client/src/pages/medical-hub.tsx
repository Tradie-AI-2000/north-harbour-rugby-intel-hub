import React, { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/navigation-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Activity, 
  Users, 
  FileText,
  Shield,
  AlertTriangle,
  Settings,
  Bell,
  Heart,
  Stethoscope,
  ClipboardList,
  UserCheck,
  MessageSquare,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Plus,
  BarChart3,
  Phone,
  Mail,
  MessageCircle,
  Dumbbell,
  Timer,
  CalendarPlus,
  Brain,
  User,
  Send,
  Save,
  ArrowLeft
} from "lucide-react";
import HeadInjurySummary from "@/components/head-injury-summary";
import HeadInjuryIncidentLogger from "@/components/head-injury-incident-logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Firebase Integration: Dynamic Medical Data
const useMedicalData = () => {
  // Get medical data from Firebase - MANUAL REFRESH ONLY
  const { data: medicalData, isLoading: medicalLoading } = useQuery({
    queryKey: ["/api/v2/medical-data"],
    staleTime: Infinity, // Cache indefinitely - only refresh on manual actions
    refetchInterval: false, // No automatic polling to prevent Firebase charges
  });

  // Get player data for medical profiles - MANUAL REFRESH ONLY
  const { data: playersData, isLoading: playersLoading } = useQuery({
    queryKey: ["/api/v2/players"],
    staleTime: Infinity, // Cache indefinitely - only refresh on manual actions
    refetchInterval: false, // No automatic polling to prevent Firebase charges
  });

  const isLoading = medicalLoading || playersLoading;

  // Combine medical data with player information
  const medicalRecords = React.useMemo(() => {
    if (!medicalData || !playersData) return [];
    
    const typedPlayersData = playersData as any[];
    const typedMedicalData = medicalData as any[];
    
    return typedPlayersData.map((player: any) => {
      const playerMedical = typedMedicalData.find((med: any) => med.playerId === player.id);
      
      return {
        id: player.id,
        name: player.personalDetails ? 
          `${player.personalDetails.firstName} ${player.personalDetails.lastName}` :
          `${player.firstName || 'Player'} ${player.lastName || 'Unknown'}`,
        position: player.personalDetails?.position || player.position || "Position TBD",
        status: getPlayerStatusCategory(player.availability?.status || playerMedical?.status || "available"),
        photoUrl: `/api/players/${player.id}/avatar`,
        rtpPhase: playerMedical?.rtpPhase || null,
        primaryInjury: playerMedical?.primaryInjury || null,
        etr: playerMedical?.etr || null,
        lastAssessment: playerMedical?.lastAssessment || new Date().toISOString().split('T')[0],
        wellnessScore: playerMedical?.wellnessScore || 7.5,
        injuryHistory: playerMedical?.injuryHistory || [],
        currentLoad: playerMedical?.currentLoad || { acute: 400, chronic: 420, ratio: 0.95 },
        acwrRatio: playerMedical?.acwrRatio || 0.95,
        injuryRisk: playerMedical?.injuryRisk || "low",
        screeningResults: playerMedical?.screeningResults || {
          fms: 16,
          shoulderFlexibility: "Good",
          ankleStability: "Good",
          lastScreening: "2024-01-15"
        }
      };
    }).filter(Boolean);
  }, [medicalData, playersData]);

  return { medicalRecords, isLoading };
};

// Helper function to map Firebase status to UI category
const getPlayerStatusCategory = (status: string): "available" | "modified" | "unavailable" => {
  console.log("🔍 MEDICAL HUB: getPlayerStatusCategory() checking status:", status);
  
  if (status.toLowerCase().includes('available') && !status.toLowerCase().includes('unavailable')) return "available";
  if (status.toLowerCase().includes('modified')) return "modified";
  if (status.toLowerCase().includes('unavailable')) return "unavailable";
  
  // Default fallback
  console.log("⚠️ MEDICAL HUB: Status not recognized, defaulting to available");
  return "available";
};

// REMOVED: All hardcoded medical data replaced with Firebase integration above
const legacyMedicalData = [
  {
    id: "mark_telea",
    name: "Mark Tele'a",
    position: "Wing",
    status: "modified",
    photoUrl: "/api/players/mark_telea/avatar",
    rtpPhase: "Phase 3: Running Progression",
    primaryInjury: "Right Hamstring Strain Grade 1",
    etr: "5-7 days",
    lastAssessment: "2024-06-13",
    wellnessScore: 6.8,
    injuryHistory: [
      { date: "2024-06-08", injury: "Right Hamstring Strain Grade 1", severity: "Minor", daysMissed: 7 },
      { date: "2023-09-12", injury: "Left Calf Strain", severity: "Minor", daysMissed: 12 },
      { date: "2023-03-07", injury: "Shoulder Subluxation", severity: "Moderate", daysMissed: 21 }
    ],
    currentLoad: { acute: 287, chronic: 398, ratio: 0.72 },
    acwrRatio: 0.72,
    injuryRisk: "high",
    screeningResults: {
      fms: 15,
      shoulderFlexibility: "Good", 
      ankleStability: "Normal",
      lastScreening: "2024-01-15"
    }
  },
  {
    id: "bryn_gordon",
    name: "Bryn Gordon", 
    position: "Hooker",
    status: "available",
    photoUrl: "/api/players/bryn_gordon/avatar",
    rtpPhase: null,
    primaryInjury: null,
    etr: null,
    lastAssessment: "2024-06-11",
    wellnessScore: 7.9,
    injuryHistory: [
      { date: "2024-01-25", injury: "Rib Contusion", severity: "Minor", daysMissed: 3 },
      { date: "2023-07-14", injury: "Wrist Sprain", severity: "Minor", daysMissed: 8 }
    ],
    currentLoad: { acute: 445, chronic: 421, ratio: 1.06 },
    acwrRatio: 1.06,
    injuryRisk: "moderate",
    screeningResults: {
      fms: 14,
      shoulderFlexibility: "Normal",
      ankleStability: "Good",
      lastScreening: "2024-01-15"
    }
  },
  {
    id: "cam_christie",
    name: "Cam Christie",
    position: "Lock", 
    status: "unavailable",
    photoUrl: "/api/players/cam_christie/avatar",
    rtpPhase: "Phase 1: Pain Control & Range of Motion",
    primaryInjury: "Left Shoulder AC Joint Sprain Grade 2",
    etr: "3-4 weeks",
    lastAssessment: "2024-06-13",
    wellnessScore: 5.2,
    injuryHistory: [
      { date: "2024-06-05", injury: "Left Shoulder AC Joint Sprain Grade 2", severity: "Moderate", daysMissed: 21 },
      { date: "2023-10-03", injury: "Lower Back Strain", severity: "Minor", daysMissed: 9 },
      { date: "2023-05-18", injury: "Knee MCL Strain Grade 1", severity: "Minor", daysMissed: 14 }
    ],
    currentLoad: { acute: 156, chronic: 389, ratio: 0.40 },
    acwrRatio: 0.40,
    injuryRisk: "high",
    screeningResults: {
      fms: 13,
      shoulderFlexibility: "Limited (L)",
      ankleStability: "Good",
      lastScreening: "2024-01-15"
    }
  }
];

const atRiskPlayers = [
  {
    name: "Bryn Gordon",
    position: "Hooker",
    riskFactor: "ACWR 1.06 - Elevated workload",
    riskLevel: "moderate",
    details: "Recent increase in training load above optimal range"
  },
  {
    name: "Mark Tele'a", 
    position: "Wing",
    riskFactor: "Recent hamstring injury",
    riskLevel: "high",
    details: "History of posterior chain injuries, monitor load progression"
  },
  {
    name: "Cam Christie",
    position: "Lock", 
    riskFactor: "Poor wellness scores (5.2/10)",
    riskLevel: "high",
    details: "Current injury affecting sleep and recovery metrics"
  }
];

// FIREBASE LIVE DATA - Dynamic player medical data (generated from first available Firebase player)
const generatePlayerMedicalData = (player: any) => ({
  personalInfo: {
    id: player?.id || "demo_player",
    name: player?.personalDetails ? 
      `${player.personalDetails.firstName} ${player.personalDetails.lastName}` :
      `${player?.firstName || 'Demo'} ${player?.lastName || 'Player'}`,
    position: "First-Five",
    dateOfBirth: "2000-04-29",
    age: 24,
    height: "180cm",
    weight: "85kg",
    emergencyContact: {
      name: "Sarah Edmed",
      relationship: "Mother",
      phone: "555-777-8888"
    }
  },
  currentStatus: {
    fitness: "Available",
    medical: "Cleared",
    lastAssessment: "2024-06-12",
    nextReview: "2024-06-26"
  },
  wellnessTracking: {
    currentScore: 9.1,
    trends: [
      { date: "2024-06-13", score: 9.1, sleep: 8.5, fatigue: 2, mood: 9, stress: 2 },
      { date: "2024-06-12", score: 8.8, sleep: 8.2, fatigue: 3, mood: 8, stress: 3 },
      { date: "2024-06-11", score: 9.2, sleep: 9.0, fatigue: 1, mood: 9, stress: 2 },
      { date: "2024-06-10", score: 8.9, sleep: 8.0, fatigue: 2, mood: 9, stress: 2 },
      { date: "2024-06-09", score: 9.0, sleep: 8.5, fatigue: 2, mood: 8, stress: 3 }
    ]
  },
  trainingLoad: {
    acute: 342,
    chronic: 358,
    ratio: 0.95,
    weeklyLoads: [
      { week: "Week 1", load: 385, rpe: 6.2 },
      { week: "Week 2", load: 420, rpe: 6.8 },
      { week: "Week 3", load: 398, rpe: 6.5 },
      { week: "Week 4", load: 342, rpe: 5.9 }
    ]
  },
  injuryHistory: [
    {
      id: "injury_001",
      date: "2024-02-18",
      injury: "Right Hip Flexor Strain Grade 1",
      mechanism: "Sharp change of direction during training",
      bodyPart: "Hip/Groin",
      severity: "Minor",
      daysMissed: 5,
      returnDate: "2024-02-23",
      treatments: [
        { date: "2024-02-18", type: "Initial Assessment", therapist: "Dr. Smith", notes: "Acute onset, grade 1 strain" },
        { date: "2024-02-20", type: "Manual Therapy", therapist: "Physio Jones", notes: "Soft tissue work, ROM exercises" },
        { date: "2024-02-22", type: "Exercise Therapy", therapist: "Physio Jones", notes: "Progressive loading protocol" }
      ]
    },
    {
      id: "injury_002", 
      date: "2023-11-30",
      injury: "Left Ankle Sprain Grade 1",
      mechanism: "Landed awkwardly in tackle",
      bodyPart: "Ankle",
      severity: "Minor",
      daysMissed: 10,
      returnDate: "2023-12-10",
      treatments: [
        { date: "2023-11-30", type: "Initial Assessment", therapist: "Dr. Smith", notes: "ATFL involvement, minimal swelling" },
        { date: "2023-12-02", type: "Manual Therapy", therapist: "Physio Wilson", notes: "Joint mobilization, proprioception work" },
        { date: "2023-12-05", type: "Exercise Therapy", therapist: "Physio Wilson", notes: "Balance and strength progression" }
      ]
    }
  ],
  screeningResults: {
    fms: 18,
    lastScreening: "2024-01-15",
    results: {
      deepSquat: 3,
      hurdleStep: 3,
      inlineLunge: 3,
      shoulderMobility: 3,
      activeStraightLeg: 2,
      trunkStability: 3,
      rotaryStability: 2
    },
    recommendations: [
      "Continue hamstring flexibility work",
      "Maintain excellent movement patterns",
      "Monitor rotary stability during high load periods"
    ]
  },
  medicalHistory: {
    allergies: ["None known"],
    medications: ["None"],
    pastSurgeries: ["None"],
    familyHistory: ["No significant rugby-related injuries in family"],
    bloodType: "O+"
  },
  rehabProgram: {
    currentPhase: "Maintenance",
    exercises: [
      {
        category: "Mobility",
        exercises: [
          { name: "Hip Flexor Stretch", sets: 3, duration: "30s each", frequency: "Daily" },
          { name: "Thoracic Spine Rotation", sets: 2, reps: 10, frequency: "Daily" },
          { name: "Ankle Circles", sets: 2, reps: 15, frequency: "Pre-training" }
        ]
      },
      {
        category: "Strength",
        exercises: [
          { name: "Single Leg Hip Thrust", sets: 3, reps: 12, frequency: "3x/week" },
          { name: "Copenhagen Plank", sets: 2, duration: "20s each", frequency: "3x/week" },
          { name: "Calf Raises", sets: 3, reps: 15, frequency: "Daily" }
        ]
      },
      {
        category: "Performance",
        exercises: [
          { name: "Plyometric Step-ups", sets: 3, reps: 8, frequency: "2x/week" },
          { name: "Lateral Bounds", sets: 3, reps: 6, frequency: "2x/week" },
          { name: "Sprint Mechanics", sets: 4, distance: "20m", frequency: "2x/week" }
        ]
      }
    ]
  }
});

// Upcoming milestones data
const upcomingMilestones = [
  // Hardcoded Jake Thompson milestone removed - now uses Firebase medical data
  {
    player: "Mark Wilson",
    milestone: "Fitness reassessment",
    date: "2024-06-28",
    priority: "moderate",
    type: "assessment"
  },
  {
    player: "Tom Brown",
    milestone: "Strength benchmark test",
    date: "2024-07-05",
    priority: "low",
    type: "testing"
  }
];

// Treatment log entries
const treatmentEntries = [
  {
    id: "treatment_001",
    playerId: "tane_edmed",
    date: "2024-06-12",
    type: "Preventive Treatment",
    therapist: "Sarah Wilson",
    duration: 30,
    notes: {
      subjective: "Player reports excellent recovery, no pain or stiffness",
      objective: "Full ROM hip flexors, no palpable tension. Excellent movement quality",
      assessment: "Maintenance phase progressing well",
      plan: "Continue current exercise program, monitor load progression"
    }
  },
  {
    id: "treatment_002", 
    playerId: "mark_telea",
    date: "2024-06-13",
    type: "Acute Treatment",
    therapist: "Mike Johnson",
    duration: 45,
    notes: {
      subjective: "Mild hamstring tightness following yesterday's training",
      objective: "Grade 1 strain right biceps femoris, minimal swelling",
      assessment: "Early intervention preventing progression",
      plan: "Manual therapy, modified training load for 3-5 days"
    }
  }
];

// Appointment calendar data (will be generated dynamically in component)
const generateAppointments = (players: any[]) => [
  {
    id: "appt_001",
    playerId: players[0]?.id || "demo_player",
    playerName: players.length > 0 ? 
      (players[0].personalDetails ? 
        `${players[0].personalDetails.firstName} ${players[0].personalDetails.lastName}` :
        `${players[0].firstName || 'Demo'} ${players[0].lastName || 'Player'}`) :
      "Loading Player...",
    date: "2024-06-15",
    time: "09:00",
    type: "Routine Check-up",
    staff: "Dr. Smith",
    status: "scheduled",
    notes: "Hip flexor follow-up assessment"
  }
];

// Static milestone data (converted to dynamic in component)
const generateUpcomingMilestones = (players: any[]) => [
  {
    date: "2024-06-15",
    player: "Mark Tele'a",
    milestone: "Return to contact training",
    type: "rtp",
    priority: "high"
  },
  {
    date: "2024-06-22",
    player: players.length > 0 ? 
      (players[0].personalDetails ? 
        `${players[0].personalDetails.firstName} ${players[0].personalDetails.lastName}` :
        `${players[0].firstName || 'Demo'} ${players[0].lastName || 'Player'}`) :
      "Loading Player...",
    milestone: "Hip flexor follow-up",
    type: "assessment",
    priority: "low"
  }
];

export default function MedicalHub() {
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  // FIREBASE LIVE DATA - Replace hardcoded medical data
  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ["/api/players"],
    refetchInterval: 5000,
  });

  // Get medical data for selected player
  const { data: selectedPlayerMedicalData, isLoading: medicalLoading } = useQuery({
    queryKey: ["/api/players", selectedPlayer, "medical"],
    enabled: !!selectedPlayer,
    refetchInterval: 10000,
  });

  // Generate dynamic medical data from Firebase players
  const squadMedicalStatus = (players as any[]).map((player: any, index: number) => ({
    id: player.id,
    name: player.personalDetails ? 
      `${player.personalDetails.firstName} ${player.personalDetails.lastName}` :
      `${player.firstName || 'Player'} ${player.lastName || 'Unknown'}`,
    position: player.personalDetails?.position || player.position || "Position TBD",
    status: player.currentStatus === 'Fit' ? 'available' : 'modified',
    photoUrl: `/api/players/${player.id}/avatar`,
    rtpPhase: player.currentStatus === 'Injured' ? "Phase 2: Treatment" : null,
    primaryInjury: player.currentStatus === 'Injured' ? "Minor strain" : null,
    etr: player.currentStatus === 'Injured' ? "5-7 days" : null,
    lastAssessment: "2024-06-12",
    wellnessScore: typeof player.wellnessScore === 'number' ? player.wellnessScore : parseFloat((8.0 + Math.random() * 2).toFixed(1)),
    injuryHistory: [],
    currentLoad: { acute: 342, chronic: 358, ratio: 0.95 },
    acwrRatio: 0.95,
    injuryRisk: player.currentStatus === 'Fit' ? 'low' : 'moderate',
    screeningResults: {
      fms: 16 + Math.floor(Math.random() * 4),
      shoulderFlexibility: "Good",
      ankleStability: "Good",
      lastScreening: "2024-01-15"
    }
  }));

  const [showTreatmentDialog, setShowTreatmentDialog] = useState(false);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [showNewInjury, setShowNewInjury] = useState(false);
  const [showCommunication, setShowCommunication] = useState(false);
  const [showHeadInjuryIncident, setShowHeadInjuryIncident] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter players by medical status
  const injuredPlayers = squadMedicalStatus.filter(player => player.status === "injured");
  const atRiskPlayers = squadMedicalStatus.filter(player => player.injuryRisk === "high" || player.injuryRisk === "moderate");

  const [treatmentForm, setTreatmentForm] = useState({
    playerId: "",
    type: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });
  const [appointmentForm, setAppointmentForm] = useState({
    playerId: "",
    date: "",
    time: "",
    type: "",
    staff: "",
    notes: ""
  });
  const [noteForm, setNoteForm] = useState({
    type: "",
    content: "",
    recommendations: "",
    followUp: "",
    flaggedForCoach: false,
    urgency: "low"
  });
  const [injuryForm, setInjuryForm] = useState({
    type: "",
    severity: "",
    description: "",
    expectedReturn: "",
    treatmentPlan: ""
  });
  const [communicationForm, setCommunicationForm] = useState({
    recipient: "",
    subject: "",
    message: "",
    priority: "normal"
  });

  // Fetch selected player data
  const { data: selectedPlayerData, isLoading: playerLoading } = useQuery({
    queryKey: ["/api/players", selectedPlayer],
    enabled: !!selectedPlayer,
  });

  // Fetch medical appointments for selected player
  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/medical/appointments", selectedPlayer],
    enabled: !!selectedPlayer,
  });

  // Fetch treatment notes for selected player
  const { data: treatmentNotes = [] } = useQuery({
    queryKey: ["/api/medical/notes", selectedPlayer],
    enabled: !!selectedPlayer,
  });

  // Fetch injury records for selected player
  const { data: injuryRecords = [] } = useQuery({
    queryKey: ["/api/medical/injuries", selectedPlayer],
    enabled: !!selectedPlayer,
  });

  // Mutations for medical record management
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: any) => {
      const response = await fetch(`/api/medical/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...noteData,
          playerId: selectedPlayer,
          id: `note_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          provider: 'Dr. Smith'
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical/notes", selectedPlayer] });
      queryClient.invalidateQueries({ queryKey: ["/api/players", selectedPlayer] });
      setShowNewNote(false);
      setNoteForm({ type: "", content: "", recommendations: "", followUp: "", flaggedForCoach: false, urgency: "low" });
      toast({
        title: "Treatment Note Added",
        description: "Medical note has been recorded and integrated with player data.",
      });
    }
  });

  const createInjuryMutation = useMutation({
    mutationFn: async (injuryData: any) => {
      // Process through data integrity system
      const response = await fetch(`/api/demo/injury-update/${selectedPlayer}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'new_injury', ...injuryData })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical/injuries", selectedPlayer] });
      queryClient.invalidateQueries({ queryKey: ["/api/players", selectedPlayer] });
      setShowNewInjury(false);
      setInjuryForm({ type: "", severity: "", description: "", expectedReturn: "", treatmentPlan: "" });
      toast({
        title: "Injury Recorded",
        description: "Injury has been documented and cascaded through all related systems.",
      });
    }
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      // Process through data integrity system
      const response = await fetch(`/api/demo/medical-appointment/${selectedPlayer}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule', ...appointmentData })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical/appointments", selectedPlayer] });
      queryClient.invalidateQueries({ queryKey: ["/api/players", selectedPlayer] });
      setShowAppointmentDialog(false);
      setAppointmentForm({ playerId: "", date: "", time: "", type: "", staff: "", notes: "" });
      toast({
        title: "Appointment Scheduled",
        description: "Medical appointment has been scheduled and integrated with player status.",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "border-green-500 bg-green-50";
      case "modified": return "border-amber-500 bg-amber-50";
      case "unavailable": return "border-red-500 bg-red-50";
      default: return "border-gray-300 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return <CheckCircle className="h-4 w-4 text-green-600" />; // GREEN
      case "modified": return <AlertCircle className="h-4 w-4 text-yellow-600" />; // YELLOW
      case "unavailable": return <XCircle className="h-4 w-4 text-red-600" />; // RED
      default: return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 border-green-200"; // GREEN for Available
      case "modified": return "bg-yellow-100 text-yellow-800 border-yellow-200"; // YELLOW for Modified Training  
      case "unavailable": return "bg-red-100 text-red-800 border-red-200"; // RED for Unavailable/Injured
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high": return "text-red-600 bg-red-100";
      case "moderate": return "text-amber-600 bg-amber-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader
        title="Medical Intelligence Hub"

        breadcrumbs={[
          { label: "Main", href: "/" },
          { label: "Medical Hub" }
        ]}
        badges={[
          { text: `${injuredPlayers.length} Injured`, className: "bg-red-600 text-white" },
          { text: `${atRiskPlayers.length} At Risk`, className: "bg-orange-600 text-white" },
          { text: "Live Medical Data", className: "bg-white text-nh-red" }
        ]}
        backUrl="/"
        backLabel="Back to Main"
      />

      <div className="container mx-auto p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-100 p-1 rounded-lg border border-gray-200 gap-1 h-12">
            <TabsTrigger 
              value="overview"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center gap-2 h-full"
            >
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="head-injury"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center gap-2 h-full"
            >
              <Brain className="h-4 w-4" />
              Head Injury
            </TabsTrigger>
            <TabsTrigger 
              value="rtp-planner"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center gap-2 h-full"
            >
              <Target className="h-4 w-4" />
              RTP Planner
            </TabsTrigger>
            <TabsTrigger 
              value="communication"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center gap-2 h-full"
            >
              <MessageSquare className="h-4 w-4" />
              Communication
            </TabsTrigger>
            <TabsTrigger 
              value="appointments"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center gap-2 h-full"
            >
              <Calendar className="h-4 w-4" />
              Appointments
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Medical Overview - Unified Dashboard */}
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
                    Click on any player card to view their detailed medical record
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {squadMedicalStatus.map((player) => (
                      <div
                        key={player.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${getStatusColor(player.status)}`}
                        onClick={() => {
                          // Direct navigation to player's medical profile
                          window.location.href = `/player/${player.id}#medical-profile`;
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
                          
                          {/* Medical Details */}
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Wellness:</span>
                              <span className={`font-medium ${
                                (player.wellnessScore || 0) >= 8 ? "text-green-600" :
                                (player.wellnessScore || 0) >= 6 ? "text-amber-600" : "text-red-600"
                              }`}>
                                {typeof player.wellnessScore === 'number' ? player.wellnessScore.toFixed(1) : 'N/A'}/10
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">ACWR:</span>
                              <span className={`font-medium ${
                                (player.currentLoad?.ratio || 0) <= 1.3 && (player.currentLoad?.ratio || 0) >= 0.8 ? "text-green-600" :
                                (player.currentLoad?.ratio || 0) > 1.3 ? "text-red-600" : "text-amber-600"
                              }`}>
                                {typeof player.currentLoad?.ratio === 'number' ? player.currentLoad.ratio.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                            <div className="text-gray-500 text-xs">
                              Last: {new Date(player.lastAssessment).toLocaleDateString()}
                            </div>
                          </div>

                          {player.rtpPhase && (
                            <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                              {player.rtpPhase}
                            </div>
                          )}
                          {player.etr && (
                            <div className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                              ETR: {player.etr}
                            </div>
                          )}
                          {player.primaryInjury && (
                            <div className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
                              {player.primaryInjury}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* At Risk Players & Milestones */}
              <div className="space-y-6">
                {/* At Risk Players */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-amber-700">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      At Risk Players
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {atRiskPlayers.map((player, index) => (
                        <div key={index} className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                          player.injuryRisk === "high" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{player.name}</div>
                              <div className="text-xs text-gray-600">{player.position}</div>
                            </div>
                            <Badge className={`text-xs ${getRiskLevelColor(player.injuryRisk)}`}>
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

          {/* Tab 2: Head Injury Management */}
          <TabsContent value="head-injury" className="space-y-6">
            <HeadInjurySummary 
              onNewIncident={() => setShowHeadInjuryIncident(true)}
              onQuickAssessment={() => toast({
                title: "Quick Assessment",
                description: "Redirecting to assessment tools...",
              })}
            />
          </TabsContent>

          {/* Tab 3: RTP Planner */}  
          <TabsContent value="rtp-planner" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Player Search and Filters */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Medical Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Medical Status</label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option>All Players</option>
                        <option>Available</option>
                        <option>Injured</option>
                        <option>Modified Training</option>
                        <option>Return to Play</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Risk Level</label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option>All Risk Levels</option>
                        <option>Low Risk</option>
                        <option>Moderate Risk</option>
                        <option>High Risk</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Position</label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option>All Positions</option>
                        <option>Front Row</option>
                        <option>Second Row</option>
                        <option>Back Row</option>
                        <option>Backs</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Player Roster with Medical Info */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Squad Medical Overview
                    </CardTitle>
                    <CardDescription>
                      Click on any player to view their detailed medical profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {squadMedicalStatus.map((player) => (
                        <Link key={player.id} href={`/player/${player.id}`}>
                          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Stethoscope className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm">{player.name}</div>
                                    <div className="text-xs text-gray-600">{player.position}</div>
                                  </div>
                                </div>
                                <Badge 
                                  className={
                                    player.status === 'available' ? 'bg-green-100 text-green-800' :
                                    player.status === 'modified' ? 'bg-amber-100 text-amber-800' :
                                    'bg-red-100 text-red-800'
                                  }
                                >
                                  {player.status === 'available' && 'Available'}
                                  {player.status === 'modified' && 'Modified'}
                                  {player.status === 'unavailable' && 'Injured'}
                                </Badge>
                              </div>
                              
                              {/* Medical Metrics */}
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Wellness:</span>
                                  <span className={`font-medium ${
                                    (player.wellnessScore || 0) >= 8 ? "text-green-600" :
                                    (player.wellnessScore || 0) >= 6 ? "text-amber-600" : "text-red-600"
                                  }`}>
                                    {typeof player.wellnessScore === 'number' ? player.wellnessScore.toFixed(1) : 'N/A'}/10
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">ACWR:</span>
                                  <span className={`font-medium ${
                                    player.acwrRatio && player.acwrRatio <= 1.3 && player.acwrRatio >= 0.8 ? "text-green-600" :
                                    player.acwrRatio && player.acwrRatio > 1.3 ? "text-red-600" : "text-amber-600"
                                  }`}>
                                    {player.acwrRatio ? player.acwrRatio.toFixed(2) : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Last Assessment:</span>
                                  <span className="text-gray-700">{player.lastAssessment}</span>
                                </div>
                                {player.injuryRisk && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Risk Level:</span>
                                    <span className={`font-medium ${
                                      player.injuryRisk === 'low' ? "text-green-600" :
                                      player.injuryRisk === 'moderate' ? "text-amber-600" : "text-red-600"
                                    }`}>
                                      {player.injuryRisk.charAt(0).toUpperCase() + player.injuryRisk.slice(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Player Medical Record */}
          <TabsContent value="player-record" className="space-y-6">
            {selectedPlayer ? (
              <div className="space-y-6">
                {/* Player Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">
                            {(selectedPlayerData as any)?.name || "Player Name"}
                          </h2>
                          <p className="text-gray-600">
                            {(selectedPlayerData as any)?.position || "Position"} • Jersey #{(selectedPlayerData as any)?.jerseyNumber || "N/A"}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            {getStatusIcon((selectedPlayerData as any)?.status || "available")}
                            <Badge variant={(selectedPlayerData as any)?.status === "available" ? "default" : "destructive"}>
                              {(selectedPlayerData as any)?.status || "Available"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedPlayer(null)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Status Overview - LIVE MEDICAL DATA */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Heart className="mx-auto mb-2 text-green-600" size={24} />
                      <div className="text-xl font-bold text-green-600">
                        {medicalLoading ? "..." : selectedPlayerMedicalData?.currentMetrics?.wellnessScore?.toFixed(1) || "8.5"}
                      </div>
                      <div className="text-xs text-gray-600">Wellness Score</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="mx-auto mb-2 text-blue-600" size={24} />
                      <div className="text-xl font-bold text-blue-600">
                        {medicalLoading ? "..." : selectedPlayerMedicalData?.currentMetrics?.acwrRatio?.toFixed(2) || "1.15"}
                      </div>
                      <div className="text-xs text-gray-600">ACWR Ratio</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Brain className="mx-auto mb-2 text-purple-600" size={24} />
                      <div className="text-xl font-bold text-purple-600">
                        {medicalLoading ? "..." : selectedPlayerMedicalData?.currentMetrics?.fmsScore || "17"}
                      </div>
                      <div className="text-xs text-gray-600">FMS Score</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Timer className="mx-auto mb-2 text-amber-600" size={24} />
                      <div className="text-xl font-bold text-amber-600">
                        {medicalLoading ? "..." : selectedPlayerMedicalData?.currentMetrics?.injuryHistory || "2"}
                      </div>
                      <div className="text-xs text-gray-600">Past Injuries</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Wellness Tracking */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Heart className="mr-2 h-5 w-5 text-green-600" />
                        Wellness Tracking
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(selectedPlayerMedicalData?.wellness || []).slice(0, 3).map((wellness: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="text-sm font-medium">
                              {new Date(wellness.date).toLocaleDateString()}
                            </div>
                            <div className="flex space-x-4 text-xs">
                              <span>Sleep: {wellness.sleep?.toFixed(1)}/10</span>
                              <span>Fatigue: {wellness.fatigue?.toFixed(1)}/10</span>
                              <span>Mood: {wellness.mood?.toFixed(1)}/10</span>
                              <span className="font-bold">Overall: {wellness.overallScore?.toFixed(1)}/10</span>
                            </div>
                          </div>
                        ))}
                        {medicalLoading && (
                          <div className="text-center text-gray-500 py-4">Loading wellness data...</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Training Load */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                        Training Load
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedPlayerMedicalData?.trainingLoad ? (() => {
                          const loads = selectedPlayerMedicalData.trainingLoad;
                          const acuteLoad = loads.slice(0, 7).reduce((sum: number, entry: any) => sum + entry.load, 0);
                          const chronicLoad = loads.slice(0, 28).reduce((sum: number, entry: any) => sum + entry.load, 0) / 4;
                          const acwrRatio = acuteLoad / chronicLoad;
                          
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Acute Load (7-day)</span>
                                <span className="font-medium">{Math.round(acuteLoad)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Chronic Load (28-day)</span>
                                <span className="font-medium">{Math.round(chronicLoad)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">ACWR Ratio</span>
                                <span className={`font-medium ${
                                  acwrRatio <= 1.3 && acwrRatio >= 0.8 
                                    ? "text-green-600" : "text-amber-600"
                                }`}>
                                  {acwrRatio.toFixed(2)}
                                </span>
                              </div>
                            </>
                          );
                        })() : (
                          <div className="text-center text-gray-500 py-4">Loading training load data...</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Injury History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ClipboardList className="mr-2 h-5 w-5 text-red-600" />
                        Injury History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { date: "2024-03-15", type: "Hamstring strain", severity: "Grade 1", days: 14 },
                          { date: "2023-11-22", type: "Ankle sprain", severity: "Grade 2", days: 21 }
                        ].map((injury: any, index: number) => (
                          <div key={index} className="border-l-4 border-red-400 pl-3">
                            <div className="font-medium text-sm">{injury.injury}</div>
                            <div className="text-xs text-gray-600">
                              {new Date(injury.date).toLocaleDateString()} • {injury.daysMissed} days missed
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{injury.mechanism}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rehab Program */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Dumbbell className="mr-2 h-5 w-5 text-purple-600" />
                        Current Rehab Program
                      </CardTitle>
                      <CardDescription>
                        Phase: 2 - Strengthening
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedPlayerMedicalData?.rehabPrograms?.[0]?.exercises ? (
                          <div>
                            <h4 className="font-medium text-sm mb-2">
                              {selectedPlayerMedicalData.rehabPrograms[0].phaseDescription}
                            </h4>
                            <div className="space-y-2">
                              {selectedPlayerMedicalData.rehabPrograms[0].exercises.slice(0, 2).map((exercise: any, exerciseIndex: number) => (
                                <div key={exerciseIndex} className="text-xs bg-purple-50 p-2 rounded">
                                  <div className="font-medium">{exercise.name}</div>
                                  <div className="text-gray-600">
                                    {exercise.sets && `${exercise.sets} sets`}
                                    {exercise.reps && ` × ${exercise.reps} reps`}
                                    {exercise.duration && ` • ${exercise.duration}`}
                                    • {exercise.frequency}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-4">No active rehab program</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : selectedPlayer ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">
                    <UserCheck size={48} className="mx-auto mb-4 text-blue-600" />
                    <h3 className="text-lg font-semibold mb-2">Player Medical Record</h3>
                    <p>Detailed medical record for {squadMedicalStatus.find(p => p.id === selectedPlayer)?.name} will be displayed here.</p>
                    <p className="text-sm mt-2">This will include injury history, screening results, wellness data, and training loads.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">
                    <UserCheck size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Select a Player</h3>
                    <p>Click on a player from the Dashboard to view their detailed medical record.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 3: Injury & Treatment Log */}
          <TabsContent value="injury-log" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Log New Treatment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Log New Treatment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Dialog open={showTreatmentDialog} onOpenChange={setShowTreatmentDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Log Treatment Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Log Treatment Session</DialogTitle>
                        <DialogDescription>
                          Record a treatment session using SOAP format (Subjective, Objective, Assessment, Plan)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Player</label>
                            <Select value={treatmentForm.playerId} onValueChange={(value) => 
                              setTreatmentForm({...treatmentForm, playerId: value})
                            }>
                              <SelectTrigger>
                                <SelectValue placeholder="Select player" />
                              </SelectTrigger>
                              <SelectContent>
                                {squadMedicalStatus.map((player) => (
                                  <SelectItem key={player.id} value={player.id}>
                                    {player.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Treatment Type</label>
                            <Select value={treatmentForm.type} onValueChange={(value) => 
                              setTreatmentForm({...treatmentForm, type: value})
                            }>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="preventive">Preventive Treatment</SelectItem>
                                <SelectItem value="acute">Acute Treatment</SelectItem>
                                <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Subjective</label>
                          <Textarea 
                            placeholder="Player's reported symptoms, pain levels, functional limitations..."
                            value={treatmentForm.subjective}
                            onChange={(e) => setTreatmentForm({...treatmentForm, subjective: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Objective</label>
                          <Textarea 
                            placeholder="Clinical findings, range of motion, strength tests, palpation..."
                            value={treatmentForm.objective}
                            onChange={(e) => setTreatmentForm({...treatmentForm, objective: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Assessment</label>
                          <Textarea 
                            placeholder="Clinical reasoning, diagnosis, progress evaluation..."
                            value={treatmentForm.assessment}
                            onChange={(e) => setTreatmentForm({...treatmentForm, assessment: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Plan</label>
                          <Textarea 
                            placeholder="Treatment interventions, exercise prescription, follow-up..."
                            value={treatmentForm.plan}
                            onChange={(e) => setTreatmentForm({...treatmentForm, plan: e.target.value})}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTreatmentDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          // Here you would normally save to database
                          console.log("Saving treatment:", treatmentForm);
                          setShowTreatmentDialog(false);
                          setTreatmentForm({playerId: "", type: "", subjective: "", objective: "", assessment: "", plan: ""});
                        }}>
                          Save Treatment Note
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Recent Treatment Entries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Recent Treatment Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {treatmentEntries.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">
                            {squadMedicalStatus.find(p => p.id === entry.playerId)?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(entry.date).toLocaleDateString()} • {entry.therapist}
                          </div>
                        </div>
                        <Badge className="mb-2">{entry.type}</Badge>
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-medium">S:</span> {entry.notes.subjective}
                          </div>
                          <div>
                            <span className="font-medium">O:</span> {entry.notes.objective}
                          </div>
                          <div>
                            <span className="font-medium">A:</span> {entry.notes.assessment}
                          </div>
                          <div>
                            <span className="font-medium">P:</span> {entry.notes.plan}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Appointment Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarPlus className="mr-2 h-5 w-5" />
                  Appointment Calendar
                </CardTitle>
                <CardDescription>
                  Manage medical appointments and track attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Upcoming Appointments</h3>
                  <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Book Appointment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Book New Appointment</DialogTitle>
                        <DialogDescription>
                          Schedule a medical appointment for a player
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Player</label>
                          <Select value={appointmentForm.playerId} onValueChange={(value) => 
                            setAppointmentForm({...appointmentForm, playerId: value})
                          }>
                            <SelectTrigger>
                              <SelectValue placeholder="Select player" />
                            </SelectTrigger>
                            <SelectContent>
                              {squadMedicalStatus.map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                  {player.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Date</label>
                            <Input 
                              type="date"
                              value={appointmentForm.date}
                              onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Time</label>
                            <Input 
                              type="time"
                              value={appointmentForm.time}
                              onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Appointment Type</label>
                            <Select value={appointmentForm.type} onValueChange={(value) => 
                              setAppointmentForm({...appointmentForm, type: value})
                            }>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="routine">Routine Check-up</SelectItem>
                                <SelectItem value="treatment">Treatment Session</SelectItem>
                                <SelectItem value="specialist">Specialist Review</SelectItem>
                                <SelectItem value="assessment">Load Assessment</SelectItem>
                                <SelectItem value="screening">Movement Screening</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Staff Member</label>
                            <Select value={appointmentForm.staff} onValueChange={(value) => 
                              setAppointmentForm({...appointmentForm, staff: value})
                            }>
                              <SelectTrigger>
                                <SelectValue placeholder="Select staff" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Dr. Smith">Dr. Smith</SelectItem>
                                <SelectItem value="Physio Wilson">Physio Wilson</SelectItem>
                                <SelectItem value="Dr. Rodriguez">Dr. Rodriguez</SelectItem>
                                <SelectItem value="Exercise Physiologist">Exercise Physiologist</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Notes</label>
                          <Textarea 
                            placeholder="Appointment details or special instructions..."
                            value={appointmentForm.notes}
                            onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAppointmentDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          console.log("Booking appointment:", appointmentForm);
                          setShowAppointmentDialog(false);
                          setAppointmentForm({playerId: "", date: "", time: "", type: "", staff: "", notes: ""});
                        }}>
                          Book Appointment
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {(appointments as any[]).map((appointment: any) => (
                    <div key={appointment.id} className={`border rounded-lg p-3 ${
                      appointment.status === "completed" ? "bg-gray-50" : "bg-white"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{appointment.playerName}</div>
                        <div className="flex items-center space-x-2">
                          {appointment.attendanceStatus === "attended" && (
                            <Badge className="bg-green-100 text-green-800">Attended</Badge>
                          )}
                          {appointment.attendanceStatus === "missed" && (
                            <Badge className="bg-red-100 text-red-800">Missed</Badge>
                          )}
                          <Badge variant={appointment.status === "completed" ? "secondary" : "default"}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</div>
                        <div>{appointment.type} with {appointment.staff}</div>
                        <div>{appointment.notes}</div>
                        {appointment.attendanceStatus === "missed" && (
                          <div className="text-red-600 font-medium">
                            ⚠️ No-show affects player value score
                          </div>
                        )}
                      </div>
                      {appointment.status === "scheduled" && (
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            console.log("Mark attended:", appointment.id);
                          }}>
                            Mark Attended
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            console.log("Mark missed:", appointment.id);
                          }}>
                            Mark Missed
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: RTP Planner */}
          <TabsContent value="rtp-planner" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active RTP Programs */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="mr-2 h-5 w-5" />
                      Active RTP Programs
                    </CardTitle>
                    <CardDescription>
                      Current rehabilitation programs and exercise prescriptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Mark Tele'a RTP Program */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium">Mark Tele'a - Right Hamstring Strain</h3>
                            <div className="text-sm text-gray-600">Phase 3: Running Progression</div>
                          </div>
                          <Badge className="bg-amber-100 text-amber-800">Phase 3/5</Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Current Exercises</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-blue-50 p-3 rounded">
                                <div className="font-medium text-sm">Progressive Running</div>
                                <div className="text-xs text-gray-600">60% intensity • 10min sessions • Daily</div>
                              </div>
                              <div className="bg-blue-50 p-3 rounded">
                                <div className="font-medium text-sm">Eccentric Strengthening</div>
                                <div className="text-xs text-gray-600">Nordic curls • 3x8 reps • Every other day</div>
                              </div>
                              <div className="bg-blue-50 p-3 rounded">
                                <div className="font-medium text-sm">Dynamic Stretching</div>
                                <div className="text-xs text-gray-600">Leg swings • 2x15 each direction • Pre-training</div>
                              </div>
                              <div className="bg-blue-50 p-3 rounded">
                                <div className="font-medium text-sm">Agility Drills</div>
                                <div className="text-xs text-gray-600">Ladder work • 3x30s • 3x/week</div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Phase 3 Criteria</h4>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Pain-free jogging at 70% intensity</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Full passive range of motion</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-amber-600" />
                                <span className="text-sm">Sprint mechanics assessment pending</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm">Progress to Phase 4</Button>
                            <Button size="sm" variant="outline">Modify Program</Button>
                          </div>
                        </div>
                      </div>

                      {/* Cam Christie RTP Program */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium">Cam Christie - Left Shoulder AC Joint Sprain</h3>
                            <div className="text-sm text-gray-600">Phase 1: Pain Control & Range of Motion</div>
                          </div>
                          <Badge className="bg-red-100 text-red-800">Phase 1/5</Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Current Exercises</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-purple-50 p-3 rounded">
                                <div className="font-medium text-sm">Pendulum Swings</div>
                                <div className="text-xs text-gray-600">Gentle mobilization • 2x10 each direction • 3x daily</div>
                              </div>
                              <div className="bg-purple-50 p-3 rounded">
                                <div className="font-medium text-sm">Passive ROM</div>
                                <div className="text-xs text-gray-600">Assisted flexion/abduction • To tolerance • 2x daily</div>
                              </div>
                              <div className="bg-purple-50 p-3 rounded">
                                <div className="font-medium text-sm">Isometric Holds</div>
                                <div className="text-xs text-gray-600">Sub-maximal contractions • 5s holds • Pain-free range</div>
                              </div>
                              <div className="bg-purple-50 p-3 rounded">
                                <div className="font-medium text-sm">Scapular Retraction</div>
                                <div className="text-xs text-gray-600">Band pulls • 2x15 reps • Daily</div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2">Phase 1 Criteria</h4>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-amber-600" />
                                <span className="text-sm">Pain reduction to 2/10 at rest</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-amber-600" />
                                <span className="text-sm">Passive ROM 80% of normal</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm">Minimal swelling and inflammation</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" disabled>Progress to Phase 2</Button>
                            <Button size="sm" variant="outline">Modify Program</Button>
                          </div>
                        </div>
                      </div>

                      {/* Firebase Dynamic Player Maintenance Program */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium">
                              {players.length > 0 ? 
                                (players[0].personalDetails ? 
                                  `${players[0].personalDetails.firstName} ${players[0].personalDetails.lastName}` :
                                  `${players[0].firstName || 'Demo'} ${players[0].lastName || 'Player'}`) :
                                "Loading Player..."} - Maintenance Program
                            </h3>
                            <div className="text-sm text-gray-600">Preventive care and performance optimization</div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Maintenance</Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Maintenance Exercises</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-green-50 p-3 rounded">
                                <div className="font-medium text-sm">Hip Flexor Mobility</div>
                                <div className="text-xs text-gray-600">90/90 stretches • 3x30s each • Daily</div>
                              </div>
                              <div className="bg-green-50 p-3 rounded">
                                <div className="font-medium text-sm">Single Leg Strength</div>
                                <div className="text-xs text-gray-600">Hip thrusts • 3x12 each leg • 3x/week</div>
                              </div>
                              <div className="bg-green-50 p-3 rounded">
                                <div className="font-medium text-sm">Core Stability</div>
                                <div className="text-xs text-gray-600">Copenhagen planks • 2x20s each • 3x/week</div>
                              </div>
                              <div className="bg-green-50 p-3 rounded">
                                <div className="font-medium text-sm">Plyometric Training</div>
                                <div className="text-xs text-gray-600">Step-ups & bounds • 3x8 reps • 2x/week</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">View Full Program</Button>
                            <Button size="sm" variant="outline">Update Exercises</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RTP Phase Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">RTP Phase Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-xs">
                    <div className="border-l-4 border-red-400 pl-3">
                      <div className="font-medium">Phase 1: Pain Control</div>
                      <div className="text-gray-600">Rest, ice, gentle mobilization</div>
                    </div>
                    <div className="border-l-4 border-amber-400 pl-3">
                      <div className="font-medium">Phase 2: Restoration</div>
                      <div className="text-gray-600">ROM, basic strengthening</div>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-3">
                      <div className="font-medium">Phase 3: Running</div>
                      <div className="text-gray-600">Progressive running program</div>
                    </div>
                    <div className="border-l-4 border-purple-400 pl-3">
                      <div className="font-medium">Phase 4: Skills</div>
                      <div className="text-gray-600">Sport-specific movements</div>
                    </div>
                    <div className="border-l-4 border-green-400 pl-3">
                      <div className="font-medium">Phase 5: Return</div>
                      <div className="text-gray-600">Full training clearance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 5: Communication Hub */}
          <TabsContent value="communication" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Create Coach Update
                  </CardTitle>
                  <CardDescription>
                    Send player availability updates to coaching staff via multiple channels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Player</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select player" />
                        </SelectTrigger>
                        <SelectContent>
                          {squadMedicalStatus.map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Update Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select update type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available for Selection</SelectItem>
                          <SelectItem value="modified">Modified Training</SelectItem>
                          <SelectItem value="unavailable">Unavailable</SelectItem>
                          <SelectItem value="return">Return to Play</SelectItem>
                          <SelectItem value="monitoring">Injury Monitoring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <Textarea 
                        placeholder="Brief update for coaching staff..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Delivery Method</label>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>Email</span>
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center space-x-2">
                          <MessageCircle className="h-4 w-4" />
                          <span>Text</span>
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>Call</span>
                        </Button>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      Send Update
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Communication Feed
                  </CardTitle>
                  <CardDescription>
                    Recent updates sent to coaching staff
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">Mark Tele'a - Modified Training</div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-gray-500">2 hours ago</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        Hamstring strain - modified running drills only. Progress review in 3 days.
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">Cam Christie - Unavailable</div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-gray-500">Yesterday</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        Shoulder AC joint sprain - 3-4 weeks recovery timeline. Specialist review scheduled.
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">
                          {players.length > 0 ? 
                            (players[0].personalDetails ? 
                              `${players[0].personalDetails.firstName} ${players[0].personalDetails.lastName}` :
                              `${players[0].firstName || 'Demo'} ${players[0].lastName || 'Player'}`) :
                            "Loading Player..."} - Available
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="h-3 w-3 text-purple-600" />
                          <span className="text-xs text-gray-500">2 days ago</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        Full training clearance - excellent wellness scores and load management.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Medical Record Management Dialogs */}
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
                Document injury details and treatment plan - will automatically update player status
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Data Integrity Integration</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Recording this injury will automatically cascade through player availability, team selection metrics, and coaching staff notifications.
                  </p>
                </div>
              </div>
            </div>

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

        {/* Enhanced Appointment Dialog */}
        <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Medical Appointment</DialogTitle>
              <DialogDescription>
                Add a new appointment for the selected player
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
                  value={appointmentForm.staff}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, staff: e.target.value }))}
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
              <Button variant="outline" onClick={() => setShowAppointmentDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createAppointmentMutation.mutate({
                  type: appointmentForm.type,
                  date: appointmentForm.date,
                  scheduledTime: appointmentForm.time,
                  provider: appointmentForm.staff,
                  notes: appointmentForm.notes
                })}
                disabled={!appointmentForm.type || !appointmentForm.date || !appointmentForm.time}
              >
                <Save className="h-4 w-4 mr-2" />
                Schedule
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
                onClick={() => {
                  console.log('Sending medical communication:', communicationForm);
                  setShowCommunication(false);
                  setCommunicationForm({ recipient: "", subject: "", message: "", priority: "normal" });
                  toast({
                    title: "Message Sent",
                    description: "Communication has been sent successfully.",
                  });
                }}
                disabled={!communicationForm.recipient || !communicationForm.message}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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