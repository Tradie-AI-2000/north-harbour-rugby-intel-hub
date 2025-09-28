import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  FileText, 
  Database, 
  Settings, 
  Upload,
  Eye,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  FileSpreadsheet,
  Code,
  Globe,
  Users,
  Shield,
  Zap,
  Trophy,
  GitBranch,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataTemplate {
  id: string;
  name: string;
  description: string;
  category: "players" | "matches" | "training" | "medical" | "cohesion" | "gps";
  format: "csv" | "json" | "api" | "config";
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    example: string;
  }>;
  sampleData: string;
  downloadUrl: string;
}

const dataTemplates: DataTemplate[] = [
  {
    id: "complete_player_profile",
    name: "Complete Player Profile Template",
    description: "Comprehensive player data matching the full system schema (60+ fields)",
    category: "players",
    format: "csv",
    fields: [
      // Personal Details
      { name: "player_id", type: "string", required: true, description: "Unique identifier for player", example: "tane_edmed" },
      { name: "first_name", type: "string", required: true, description: "Player's first name", example: "Tane" },
      { name: "last_name", type: "string", required: true, description: "Player's last name", example: "Edmed" },
      { name: "date_of_birth", type: "date", required: true, description: "Player's birth date (YYYY-MM-DD)", example: "1999-12-15" },
      { name: "email", type: "string", required: true, description: "Player's email address", example: "tane.edmed@northharbour.co.nz" },
      { name: "phone", type: "string", required: true, description: "Player's phone number", example: "+64 21 123 4567" },
      { name: "address", type: "string", required: true, description: "Player's residential address", example: "Albany, Auckland, New Zealand" },
      { name: "emergency_contact_name", type: "string", required: true, description: "Emergency contact full name", example: "Sarah Edmed" },
      { name: "emergency_contact_relationship", type: "string", required: true, description: "Relationship to player", example: "Mother" },
      { name: "emergency_contact_phone", type: "string", required: true, description: "Emergency contact phone", example: "+64 21 987 6543" },
      { name: "profile_image_url", type: "string", required: false, description: "URL to player's profile photo", example: "https://example.com/photos/tane_edmed.jpg" },
      
      // Rugby Profile
      { name: "jersey_number", type: "number", required: true, description: "Player's jersey number", example: "10" },
      { name: "primary_position", type: "string", required: true, description: "Primary playing position", example: "First-Five" },
      { name: "secondary_positions", type: "string", required: false, description: "Secondary positions (comma separated)", example: "Fullback,Centre" },
      { name: "playing_level", type: "string", required: true, description: "Current playing level", example: "Professional" },
      { name: "years_in_team", type: "number", required: true, description: "Years with current team", example: "3" },
      { name: "previous_clubs", type: "string", required: false, description: "Previous clubs (comma separated)", example: "Waratahs,Australian Schoolboys" },
      { name: "date_joined_club", type: "date", required: true, description: "Date joined current club", example: "2023-01-01" },
      { name: "representative_honours", type: "string", required: false, description: "Representative achievements", example: "Australia U20,NSW Waratahs" },
      
      // Physical Attributes (Current)
      { name: "height_cm", type: "number", required: true, description: "Height in centimeters", example: "180" },
      { name: "weight_kg", type: "number", required: true, description: "Weight in kilograms", example: "85" },
      { name: "body_fat_percent", type: "number", required: false, description: "Body fat percentage", example: "8.5" },
      { name: "lean_mass_kg", type: "number", required: false, description: "Lean muscle mass in kg", example: "77.8" },
      
      // Skills Assessment (1-10 scale)
      { name: "ball_handling_rating", type: "number", required: false, description: "Ball handling skill (1-10)", example: "9" },
      { name: "passing_rating", type: "number", required: false, description: "Passing skill (1-10)", example: "9" },
      { name: "kicking_rating", type: "number", required: false, description: "Kicking skill (1-10)", example: "10" },
      { name: "lineout_throwing_rating", type: "number", required: false, description: "Lineout throwing skill (1-10)", example: "3" },
      { name: "scrummaging_rating", type: "number", required: false, description: "Scrummaging skill (1-10)", example: "4" },
      { name: "rucking_rating", type: "number", required: false, description: "Rucking skill (1-10)", example: "7" },
      { name: "defense_rating", type: "number", required: false, description: "Defensive skill (1-10)", example: "8" },
      { name: "communication_rating", type: "number", required: false, description: "Communication skill (1-10)", example: "9" },
      { name: "vision_rating", type: "number", required: false, description: "Game vision skill (1-10)", example: "8" },
      { name: "game_management_rating", type: "number", required: false, description: "Game management skill (1-10)", example: "9" },
      
      // Current Season Statistics
      { name: "matches_played_2024", type: "number", required: false, description: "Matches played in 2024", example: "18" },
      { name: "minutes_played_2024", type: "number", required: false, description: "Total minutes played in 2024", example: "1440" },
      { name: "tries_2024", type: "number", required: false, description: "Tries scored in 2024", example: "6" },
      { name: "tackles_2024", type: "number", required: false, description: "Tackles made in 2024", example: "92" },
      { name: "penalties_2024", type: "number", required: false, description: "Penalties conceded in 2024", example: "4" },
      { name: "assists_2024", type: "number", required: false, description: "Try assists in 2024", example: "12" },
      { name: "carries_2024", type: "number", required: false, description: "Ball carries in 2024", example: "156" },
      { name: "metres_gained_2024", type: "number", required: false, description: "Metres gained in 2024", example: "1247" },
      { name: "pass_accuracy_2024", type: "number", required: false, description: "Pass accuracy percentage 2024", example: "94.2" },
      { name: "kicks_at_goal_2024", type: "number", required: false, description: "Kicks at goal attempted 2024", example: "45" },
      { name: "kicks_successful_2024", type: "number", required: false, description: "Successful kicks 2024", example: "38" },
      
      // Medical & Availability
      { name: "current_availability", type: "string", required: true, description: "Current availability status", example: "Available" },
      { name: "injury_status", type: "string", required: false, description: "Current injury status", example: "None" },
      { name: "medical_restrictions", type: "string", required: false, description: "Current medical restrictions", example: "None" },
      { name: "last_medical_check", type: "date", required: false, description: "Date of last medical assessment", example: "2024-01-15" },
      
      // Contract & Value
      { name: "contract_start_date", type: "date", required: false, description: "Contract start date", example: "2024-01-01" },
      { name: "contract_end_date", type: "date", required: false, description: "Contract end date", example: "2025-12-31" },
      { name: "contract_value", type: "number", required: false, description: "Annual contract value (NZD)", example: "150000" },
      { name: "performance_bonuses", type: "string", required: false, description: "Performance bonus structure", example: "Match fees, rep bonuses" },
      
      // AI Ratings
      { name: "ai_overall_rating", type: "number", required: false, description: "AI overall rating (1-100)", example: "88" },
      { name: "ai_physicality_rating", type: "number", required: false, description: "AI physicality rating (1-100)", example: "85" },
      { name: "ai_skillset_rating", type: "number", required: false, description: "AI skillset rating (1-100)", example: "92" },
      { name: "ai_game_impact_rating", type: "number", required: false, description: "AI game impact rating (1-100)", example: "89" },
      { name: "ai_potential_rating", type: "number", required: false, description: "AI potential rating (1-100)", example: "91" },
      
      // Status & Notes
      { name: "current_status", type: "string", required: true, description: "Current player status", example: "Active" },
      { name: "coaching_notes", type: "string", required: false, description: "Current coaching notes", example: "Excellent game management and tactical awareness" },
      { name: "last_updated", type: "date", required: true, description: "Date record was last updated", example: "2024-01-20" }
    ],
    sampleData: `player_id,first_name,last_name,date_of_birth,email,phone,address,emergency_contact_name,emergency_contact_relationship,emergency_contact_phone,profile_image_url,jersey_number,primary_position,secondary_positions,playing_level,years_in_team,previous_clubs,date_joined_club,representative_honours,height_cm,weight_kg,body_fat_percent,lean_mass_kg,ball_handling_rating,passing_rating,kicking_rating,lineout_throwing_rating,scrummaging_rating,rucking_rating,defense_rating,communication_rating,vision_rating,game_management_rating,matches_played_2024,minutes_played_2024,tries_2024,tackles_2024,penalties_2024,assists_2024,carries_2024,metres_gained_2024,pass_accuracy_2024,kicks_at_goal_2024,kicks_successful_2024,current_availability,injury_status,medical_restrictions,last_medical_check,contract_start_date,contract_end_date,contract_value,performance_bonuses,ai_overall_rating,ai_physicality_rating,ai_skillset_rating,ai_game_impact_rating,ai_potential_rating,current_status,coaching_notes,last_updated
tane_edmed,Tane,Edmed,1999-12-15,tane.edmed@northharbour.co.nz,+64 21 123 4567,"Albany, Auckland, New Zealand",Sarah Edmed,Mother,+64 21 987 6543,https://example.com/photos/tane_edmed.jpg,10,First-Five,"Fullback,Centre",Professional,3,"Waratahs,Australian Schoolboys",2023-01-01,"Australia U20,NSW Waratahs",180,85,8.5,77.8,9,9,10,3,4,7,8,9,8,9,18,1440,6,92,4,12,156,1247,94.2,45,38,Available,None,None,2024-01-15,2024-01-01,2025-12-31,150000,"Match fees, rep bonuses",88,85,92,89,91,Active,"Excellent game management and tactical awareness",2024-01-20
penaia_cakobau,Penaia,Cakobau,1998-05-10,penaia.cakobau@northharbour.co.nz,+64 21 234 5678,"North Shore, Auckland, New Zealand",Maria Cakobau,Mother,+64 21 876 5432,,2,Hooker,"Prop",Professional,2,"Fiji U20",2024-01-01,"Fiji U20",185,105,12.5,92.0,8,7,4,9,8,9,9,8,6,7,15,1200,1,87,3,5,89,234,88.5,0,0,Available,None,None,2024-01-10,2024-01-01,2025-12-31,120000,"Match fees",82,88,79,84,80,Active,"Strong set piece player with excellent lineout throwing",2024-01-20`,
    downloadUrl: "/api/templates/download/complete_player_profile.csv"
  },
  {
    id: "players_basic",
    name: "Basic Player Roster (Simplified)",
    description: "Simplified player roster for basic team setup",
    category: "players", 
    format: "csv",
    fields: [
      { name: "player_id", type: "string", required: true, description: "Unique identifier for player", example: "NH001" },
      { name: "first_name", type: "string", required: true, description: "Player's first name", example: "John" },
      { name: "last_name", type: "string", required: true, description: "Player's last name", example: "Smith" },
      { name: "date_of_birth", type: "date", required: true, description: "Player's birth date", example: "1995-03-15" },
      { name: "primary_position", type: "string", required: true, description: "Primary playing position", example: "Flanker" },
      { name: "jersey_number", type: "number", required: true, description: "Player's jersey number", example: "7" },
      { name: "height_cm", type: "number", required: false, description: "Height in centimeters", example: "185" },
      { name: "weight_kg", type: "number", required: false, description: "Weight in kilograms", example: "95" }
    ],
    sampleData: `player_id,first_name,last_name,date_of_birth,primary_position,jersey_number,height_cm,weight_kg
NH001,John,Smith,1995-03-15,Flanker,7,185,95
NH002,Mike,Johnson,1993-07-22,Prop,1,180,110
NH003,David,Wilson,1996-11-08,First-Five,10,175,85`,
    downloadUrl: "/api/templates/download/players_basic.csv"
  },
  {
    id: "match_performance",
    name: "Match Performance Template",
    description: "Individual player statistics for match analysis",
    category: "matches",
    format: "csv",
    fields: [
      { name: "match_id", type: "string", required: true, description: "Unique match identifier", example: "NPC2025_RD1" },
      { name: "player_id", type: "string", required: true, description: "Player identifier", example: "NH001" },
      { name: "minutes_played", type: "number", required: true, description: "Minutes on field", example: "80" },
      { name: "tries", type: "number", required: false, description: "Tries scored", example: "1" },
      { name: "assists", type: "number", required: false, description: "Try assists", example: "2" },
      { name: "tackles_made", type: "number", required: false, description: "Successful tackles", example: "12" },
      { name: "tackles_missed", type: "number", required: false, description: "Missed tackles", example: "2" },
      { name: "carries", type: "number", required: false, description: "Ball carries", example: "8" },
      { name: "metres_gained", type: "number", required: false, description: "Metres gained from carries", example: "45" },
      { name: "passes", type: "number", required: false, description: "Passes attempted", example: "25" },
      { name: "pass_accuracy", type: "number", required: false, description: "Pass completion percentage", example: "92.5" }
    ],
    sampleData: `match_id,player_id,minutes_played,tries,assists,tackles_made,tackles_missed,carries,metres_gained,passes,pass_accuracy
NPC2025_RD1,NH001,80,1,2,12,2,8,45,25,92.5
NPC2025_RD1,NH002,65,0,0,8,1,12,35,15,88.2
NPC2025_RD1,NH003,80,0,3,3,1,15,85,45,94.1`,
    downloadUrl: "/api/templates/download/match_performance.csv"
  },
  {
    id: "gps_training",
    name: "GPS Training Data Template",
    description: "GPS tracking data from training sessions",
    category: "gps",
    format: "csv",
    fields: [
      { name: "session_id", type: "string", required: true, description: "Training session identifier", example: "TRN_20250801" },
      { name: "player_id", type: "string", required: true, description: "Player identifier", example: "NH001" },
      { name: "total_distance", type: "number", required: true, description: "Total distance in meters", example: "4500" },
      { name: "high_speed_distance", type: "number", required: false, description: "Distance >15km/h in meters", example: "850" },
      { name: "sprint_distance", type: "number", required: false, description: "Distance >25km/h in meters", example: "125" },
      { name: "max_speed", type: "number", required: false, description: "Maximum speed in km/h", example: "28.5" },
      { name: "accelerations", type: "number", required: false, description: "Number of accelerations >2.5m/s²", example: "45" },
      { name: "decelerations", type: "number", required: false, description: "Number of decelerations >-2.5m/s²", example: "38" },
      { name: "impacts", type: "number", required: false, description: "Number of impacts >5G", example: "12" },
      { name: "training_load", type: "number", required: false, description: "Calculated training load", example: "285" }
    ],
    sampleData: `session_id,player_id,total_distance,high_speed_distance,sprint_distance,max_speed,accelerations,decelerations,impacts,training_load
TRN_20250801,NH001,4500,850,125,28.5,45,38,12,285
TRN_20250801,NH002,3800,650,95,26.2,38,32,8,245
TRN_20250801,NH003,4200,780,110,27.8,42,35,10,265`,
    downloadUrl: "/api/templates/download/gps_training.csv"
  },
  {
    id: "medical_tracking",
    name: "Medical & Injury Tracking",
    description: "Player medical status and injury management",
    category: "medical",
    format: "csv",
    fields: [
      { name: "player_id", type: "string", required: true, description: "Player identifier", example: "NH001" },
      { name: "date", type: "date", required: true, description: "Assessment date", example: "2025-01-15" },
      { name: "injury_type", type: "string", required: false, description: "Type of injury if applicable", example: "Hamstring strain" },
      { name: "injury_severity", type: "string", required: false, description: "Severity level", example: "Grade 1" },
      { name: "expected_return", type: "date", required: false, description: "Expected return date", example: "2025-01-29" },
      { name: "availability", type: "string", required: true, description: "Current availability status", example: "Available" },
      { name: "load_restriction", type: "number", required: false, description: "Training load restriction %", example: "80" },
      { name: "notes", type: "string", required: false, description: "Medical notes", example: "Progressing well, cleared for contact" }
    ],
    sampleData: `player_id,date,injury_type,injury_severity,expected_return,availability,load_restriction,notes
NH001,2025-01-15,,,Available,100,Cleared for full training
NH002,2025-01-15,Hamstring strain,Grade 1,2025-01-29,Injured,0,Rest and rehabilitation required
NH003,2025-01-15,,,Available,90,Return to play protocol`,
    downloadUrl: "/api/templates/download/medical_tracking.csv"
  },
  {
    id: "cohesion_markers",
    name: "Team Cohesion Markers",
    description: "Advanced cohesion analytics data structure",
    category: "cohesion",
    format: "json",
    fields: [
      { name: "game_id", type: "string", required: true, description: "Unique game identifier", example: "NPC2025_RD1" },
      { name: "TWI_Tight5", type: "number", required: true, description: "Team Work Index for Tight 5", example: "18.45" },
      { name: "TWI_AttackSpine", type: "number", required: true, description: "Team Work Index for Attack Spine", example: "22.34" },
      { name: "total_team_cohesion", type: "number", required: true, description: "Total team cohesion score", example: "389" },
      { name: "c_score", type: "number", required: true, description: "C-Score (churn indicator)", example: "4.2" },
      { name: "gaps_0_5", type: "number", required: true, description: "0-5 meter defensive gaps", example: "68" },
      { name: "gaps_0_10", type: "number", required: true, description: "0-10 meter defensive gaps", example: "89" }
    ],
    sampleData: `{
  "game_id": "NPC2025_RD1",
  "date": "2025-08-01",
  "opponent": "Manawatu",
  "cohesion_markers": {
    "TWI_Tight5": 18.45,
    "TWI_AttackSpine": 22.34,
    "total_team_cohesion": 389,
    "c_score": 4.2,
    "gaps_0_5": 68,
    "gaps_0_10": 89
  }
}`,
    downloadUrl: "/api/templates/download/cohesion_markers.json"
  }
];

const apiIntegrations = [
  {
    name: "StatSports API",
    description: "GPS tracking data integration",
    endpoint: "/api/statsports/sync",
    authentication: "API Key",
    status: "configured"
  },
  {
    name: "Google Sheets",
    description: "Spreadsheet data synchronization",
    endpoint: "/api/google-sheets/sync",
    authentication: "Service Account",
    status: "configured"
  },
  {
    name: "GAIN LINE Analytics",
    description: "Cohesion analytics integration",
    endpoint: "/api/gainline/cohesion",
    authentication: "OAuth 2.0",
    status: "pending"
  }
];

const configurationSettings = [
  {
    category: "Team Setup",
    settings: [
      { name: "Team Name", value: "North Harbour Rugby", type: "text" },
      { name: "Season", value: "2025 NPC", type: "text" },
      { name: "Home Venue", value: "North Harbour Stadium", type: "text" },
      { name: "Competition", value: "NPC Championship", type: "select" }
    ]
  },
  {
    category: "Performance Thresholds",
    settings: [
      { name: "High Speed Threshold", value: "15", type: "number", unit: "km/h" },
      { name: "Sprint Threshold", value: "25", type: "number", unit: "km/h" },
      { name: "Target C-Score", value: "3.0", type: "number", unit: "" },
      { name: "Tackle Success Target", value: "90", type: "number", unit: "%" }
    ]
  },
  {
    category: "Data Sync",
    settings: [
      { name: "Auto Sync GPS Data", value: "true", type: "boolean" },
      { name: "Sync Frequency", value: "daily", type: "select" },
      { name: "Data Retention", value: "24", type: "number", unit: "months" }
    ]
  }
];

export default function DataTemplatesHub() {
  const [selectedTemplate, setSelectedTemplate] = useState<DataTemplate | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownloadTemplate = async (template: DataTemplate) => {
    try {
      // Create a blob with the sample data
      const blob = new Blob([template.sampleData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.toLowerCase().replace(/\s+/g, '_')}.${template.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Template Downloaded",
        description: `${template.name} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the template.",
        variant: "destructive",
      });
    }
  };

  const handleCopyField = (fieldName: string, example: string) => {
    navigator.clipboard.writeText(example);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    
    toast({
      title: "Copied",
      description: `Example value for ${fieldName} copied to clipboard.`,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "players": return <Users className="h-4 w-4" />;
      case "matches": return <Trophy className="h-4 w-4" />;
      case "training": return <Zap className="h-4 w-4" />;
      case "medical": return <Shield className="h-4 w-4" />;
      case "cohesion": return <Globe className="h-4 w-4" />;
      case "gps": return <Database className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "players": return "bg-blue-500";
      case "matches": return "bg-green-500";
      case "training": return "bg-purple-500";
      case "medical": return "bg-red-500";
      case "cohesion": return "bg-orange-500";
      case "gps": return "bg-indigo-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Templates Hub</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive data management templates and configuration for rugby analytics
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {dataTemplates.length} Templates Available
          </Badge>
        </div>

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Data Templates</TabsTrigger>
            <TabsTrigger value="integrations">API Integrations</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Template List */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold">Available Templates</h3>
                {dataTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                          {getCategoryIcon(template.category)}
                          <span className="sr-only">{template.category}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{template.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {template.format.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {template.fields.length} fields
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Template Details */}
              <div className="lg:col-span-2">
                {selectedTemplate ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {getCategoryIcon(selectedTemplate.category)}
                          {selectedTemplate.name}
                        </CardTitle>
                        <Button onClick={() => handleDownloadTemplate(selectedTemplate)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Template
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-gray-600">{selectedTemplate.description}</p>

                      {/* Field Definitions */}
                      <div>
                        <h4 className="font-semibold mb-3">Field Definitions</h4>
                        <div className="space-y-2">
                          {selectedTemplate.fields.map((field) => (
                            <div 
                              key={field.name}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{field.name}</span>
                                  <Badge variant={field.required ? "destructive" : "secondary"} className="text-xs">
                                    {field.required ? "Required" : "Optional"}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {field.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {field.example}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyField(field.name, field.example)}
                                  className="h-8 w-8 p-0"
                                >
                                  {copiedField === field.name ? (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sample Data Preview */}
                      <div>
                        <h4 className="font-semibold mb-3">Sample Data Preview</h4>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                          <pre className="text-sm whitespace-pre-wrap">
                            {selectedTemplate.sampleData}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a template to view details and download</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiIntegrations.map((integration, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {integration.name}
                      <Badge variant={integration.status === 'configured' ? 'default' : 'secondary'}>
                        {integration.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{integration.description}</p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Endpoint: </span>
                        <code className="bg-gray-100 px-2 py-1 rounded">{integration.endpoint}</code>
                      </div>
                      <div>
                        <span className="font-medium">Auth: </span>
                        <span>{integration.authentication}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            {configurationSettings.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{section.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.settings.map((setting, settingIndex) => (
                      <div key={settingIndex} className="space-y-2">
                        <label className="text-sm font-medium">{setting.name}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type={setting.type === 'boolean' ? 'checkbox' : setting.type}
                            defaultValue={setting.type === 'boolean' ? undefined : setting.value}
                            defaultChecked={setting.type === 'boolean' ? setting.value === 'true' : undefined}
                            className="flex-1 p-2 border rounded-md"
                          />
                          {setting.unit && (
                            <span className="text-sm text-gray-500">{setting.unit}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="documentation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Quick Start Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-medium">Download Templates</p>
                        <p className="text-sm text-gray-600">Choose and download the appropriate CSV templates for your data type</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-medium">Populate Data</p>
                        <p className="text-sm text-gray-600">Fill in your data following the field definitions and examples provided</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-medium">Upload & Sync</p>
                        <p className="text-sm text-gray-600">Upload your completed files or configure API integrations for automatic sync</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Consistent Data Format</p>
                        <p className="text-sm text-gray-600">Always use the same date format (YYYY-MM-DD) and naming conventions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Regular Backups</p>
                        <p className="text-sm text-gray-600">Export your data regularly and maintain local backups</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Data Validation</p>
                        <p className="text-sm text-gray-600">Review data quality reports and fix any validation errors promptly</p>
                      </div>
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