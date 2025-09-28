import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  GitBranch, 
  Users, 
  Activity, 
  FileText, 
  Heart, 
  Trophy, 
  Zap,
  ArrowRight,
  Eye,
  Search,
  Filter
} from "lucide-react";

interface DataField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example: string;
  category: string;
  relatesTo: string[];
  affects: string[];
}

interface DataStructure {
  section: string;
  description: string;
  icon: React.ElementType;
  color: string;
  fields: DataField[];
  relationships: string[];
}

const playerDataStructure: DataStructure[] = [
  {
    section: "Personal Details",
    description: "Basic identification and contact information",
    icon: Users,
    color: "bg-blue-500",
    fields: [
      { name: "player_id", type: "string", required: true, description: "Unique system identifier", example: "tane_edmed", category: "core", relatesTo: ["all_sections"], affects: ["system_wide"] },
      { name: "firstName", type: "string", required: true, description: "Player's first name", example: "Tane", category: "identity", relatesTo: ["communications"], affects: ["display_name"] },
      { name: "lastName", type: "string", required: true, description: "Player's last name", example: "Edmed", category: "identity", relatesTo: ["communications"], affects: ["display_name"] },
      { name: "dateOfBirth", type: "date", required: true, description: "Birth date for age calculations", example: "1999-12-15", category: "demographics", relatesTo: ["eligibility", "physical_development"], affects: ["age_group", "contract_eligibility"] },
      { name: "email", type: "string", required: true, description: "Primary communication email", example: "tane.edmed@northharbour.co.nz", category: "contact", relatesTo: ["communications"], affects: ["notification_delivery"] },
      { name: "phone", type: "string", required: true, description: "Mobile phone number", example: "+64 21 123 4567", category: "contact", relatesTo: ["emergency_procedures"], affects: ["emergency_contact"] },
      { name: "address", type: "string", required: true, description: "Residential address", example: "Albany, Auckland, New Zealand", category: "location", relatesTo: ["logistics"], affects: ["travel_arrangements"] },
      { name: "emergencyContact", type: "object", required: true, description: "Emergency contact details", example: "{name: 'Sarah Edmed', relationship: 'Mother', phone: '+64 21 987 6543'}", category: "safety", relatesTo: ["medical_procedures"], affects: ["emergency_protocols"] }
    ],
    relationships: ["Rugby Profile", "Medical Records", "Communications"]
  },
  {
    section: "Rugby Profile",
    description: "Position, experience, and career information",
    icon: Trophy,
    color: "bg-green-500",
    fields: [
      { name: "jerseyNumber", type: "number", required: true, description: "Unique field identifier", example: "10", category: "identification", relatesTo: ["team_selection", "match_stats"], affects: ["field_position", "tactical_setup"] },
      { name: "primaryPosition", type: "string", required: true, description: "Main playing position", example: "First-Five", category: "tactical", relatesTo: ["skills_weighting", "team_strategy"], affects: ["selection_algorithm", "training_focus"] },
      { name: "secondaryPositions", type: "array", required: false, description: "Alternative positions", example: "['Fullback', 'Centre']", category: "versatility", relatesTo: ["tactical_options"], affects: ["squad_flexibility"] },
      { name: "playingLevel", type: "string", required: true, description: "Current competition level", example: "Professional", category: "status", relatesTo: ["contract_terms"], affects: ["eligibility_rules"] },
      { name: "yearsInTeam", type: "number", required: true, description: "Tenure with current club", example: "3", category: "experience", relatesTo: ["cohesion_metrics"], affects: ["leadership_weighting", "twi_calculation"] },
      { name: "previousClubs", type: "array", required: false, description: "Career history", example: "['Waratahs', 'Australian Schoolboys']", category: "history", relatesTo: ["experience_calculation"], affects: ["recruitment_value"] },
      { name: "dateJoinedClub", type: "date", required: true, description: "Club joining date", example: "2023-01-01", category: "tenure", relatesTo: ["cohesion_analytics"], affects: ["experience_differential"] },
      { name: "representativeHonours", type: "array", required: false, description: "Higher level achievements", example: "['Australia U20', 'NSW Waratahs']", category: "achievements", relatesTo: ["player_value"], affects: ["recruitment_profile"] }
    ],
    relationships: ["Skills Assessment", "Team Selection", "Cohesion Analytics"]
  },
  {
    section: "Physical Attributes",
    description: "Body composition and physical measurements",
    icon: Activity,
    color: "bg-purple-500",
    fields: [
      { name: "height", type: "number", required: true, description: "Height in centimeters", example: "180", category: "anthropometric", relatesTo: ["position_suitability"], affects: ["lineout_ability", "scrum_mechanics"] },
      { name: "weight", type: "number", required: true, description: "Body weight in kilograms", example: "85", category: "anthropometric", relatesTo: ["power_calculations", "injury_risk"], affects: ["collision_safety", "speed_potential"] },
      { name: "bodyFat", type: "number", required: false, description: "Body fat percentage", example: "8.5", category: "composition", relatesTo: ["fitness_status"], affects: ["power_to_weight_ratio"] },
      { name: "leanMass", type: "number", required: false, description: "Lean muscle mass", example: "77.8", category: "composition", relatesTo: ["strength_potential"], affects: ["power_generation", "injury_resilience"] }
    ],
    relationships: ["Fitness Data", "Injury Risk", "Performance Metrics"]
  },
  {
    section: "Skills Assessment",
    description: "Technical and tactical skill ratings (1-10 scale)",
    icon: Zap,
    color: "bg-yellow-500",
    fields: [
      { name: "ballHandling", type: "number", required: false, description: "Ball handling skill rating", example: "9", category: "technical", relatesTo: ["position_weighting"], affects: ["selection_score"] },
      { name: "passing", type: "number", required: false, description: "Passing accuracy and technique", example: "9", category: "technical", relatesTo: ["playmaker_role"], affects: ["tactical_role"] },
      { name: "kicking", type: "number", required: false, description: "Kicking ability (all types)", example: "10", category: "technical", relatesTo: ["tactical_value"], affects: ["goal_kicking_duties"] },
      { name: "lineoutThrowing", type: "number", required: false, description: "Lineout throwing accuracy", example: "3", category: "specialist", relatesTo: ["set_piece_role"], affects: ["hooker_capability"] },
      { name: "scrummaging", type: "number", required: false, description: "Scrum technique and power", example: "4", category: "specialist", relatesTo: ["forward_pack_role"], affects: ["scrum_selection"] },
      { name: "rucking", type: "number", required: false, description: "Ruck technique and effectiveness", example: "7", category: "contact", relatesTo: ["breakdown_role"], affects: ["loose_forward_capability"] },
      { name: "defense", type: "number", required: false, description: "Defensive technique and positioning", example: "8", category: "defensive", relatesTo: ["defensive_system"], affects: ["defensive_role"] },
      { name: "communication", type: "number", required: false, description: "On-field communication", example: "9", category: "leadership", relatesTo: ["cohesion_impact"], affects: ["leadership_weighting"] },
      { name: "vision", type: "number", required: false, description: "Game reading and awareness", example: "8", category: "cognitive", relatesTo: ["playmaking_ability"], affects: ["tactical_decision_making"] },
      { name: "gameManagement", type: "number", required: false, description: "Game control and decision making", example: "9", category: "tactical", relatesTo: ["leadership_role"], affects: ["captain_potential"] }
    ],
    relationships: ["Team Selection", "Training Programs", "Performance Analytics"]
  },
  {
    section: "Performance Statistics",
    description: "Match and season performance data",
    icon: Trophy,
    color: "bg-red-500",
    fields: [
      { name: "matchesPlayed", type: "number", required: false, description: "Games played this season", example: "18", category: "availability", relatesTo: ["selection_consistency"], affects: ["experience_calculation"] },
      { name: "minutesPlayed", type: "number", required: false, description: "Total playing time", example: "1440", category: "utilization", relatesTo: ["impact_measurement"], affects: ["load_management"] },
      { name: "tries", type: "number", required: false, description: "Tries scored", example: "6", category: "attacking", relatesTo: ["attacking_threat"], affects: ["attacking_value"] },
      { name: "tackles", type: "number", required: false, description: "Tackles completed", example: "92", category: "defensive", relatesTo: ["defensive_workload"], affects: ["defensive_rating"] },
      { name: "penalties", type: "number", required: false, description: "Penalties conceded", example: "4", category: "discipline", relatesTo: ["discipline_record"], affects: ["selection_risk"] },
      { name: "assists", type: "number", required: false, description: "Try assists", example: "12", category: "playmaking", relatesTo: ["creative_impact"], affects: ["playmaker_value"] },
      { name: "carries", type: "number", required: false, description: "Ball carries", example: "156", category: "ball_use", relatesTo: ["attacking_involvement"], affects: ["attacking_contribution"] },
      { name: "metresGained", type: "number", required: false, description: "Metres gained carrying", example: "1247", category: "territory", relatesTo: ["territory_gain"], affects: ["attacking_effectiveness"] },
      { name: "passAccuracy", type: "number", required: false, description: "Pass completion percentage", example: "94.2", category: "accuracy", relatesTo: ["ball_retention"], affects: ["playmaker_reliability"] }
    ],
    relationships: ["AI Analysis", "Team Comparisons", "Contract Value"]
  },
  {
    section: "Medical Records",
    description: "Health status and injury tracking",
    icon: Heart,
    color: "bg-red-600",
    fields: [
      { name: "currentAvailability", type: "string", required: true, description: "Current playing status", example: "Available", category: "status", relatesTo: ["team_selection"], affects: ["selection_eligibility"] },
      { name: "injuryStatus", type: "string", required: false, description: "Current injury details", example: "None", category: "medical", relatesTo: ["load_management"], affects: ["training_restrictions"] },
      { name: "medicalRestrictions", type: "string", required: false, description: "Current limitations", example: "None", category: "restrictions", relatesTo: ["training_participation"], affects: ["activity_modification"] },
      { name: "lastMedicalCheck", type: "date", required: false, description: "Most recent assessment", example: "2024-01-15", category: "monitoring", relatesTo: ["medical_compliance"], affects: ["clearance_status"] },
      { name: "injuryHistory", type: "array", required: false, description: "Previous injuries", example: "[{type: 'hamstring', date: '2023-05-15', severity: 'minor'}]", category: "history", relatesTo: ["injury_risk_model"], affects: ["load_monitoring"] },
      { name: "riskFactors", type: "array", required: false, description: "Identified risk factors", example: "['previous_hamstring', 'high_load_player']", category: "prevention", relatesTo: ["preventive_strategies"], affects: ["training_modification"] }
    ],
    relationships: ["Training Load", "Team Selection", "Insurance Records"]
  },
  {
    section: "AI Analysis",
    description: "Automated performance insights and ratings",
    icon: Database,
    color: "bg-indigo-500",
    fields: [
      { name: "overallRating", type: "number", required: false, description: "AI overall performance rating", example: "88", category: "assessment", relatesTo: ["all_performance_data"], affects: ["recruitment_value"] },
      { name: "physicalityRating", type: "number", required: false, description: "Physical capability rating", example: "85", category: "physical", relatesTo: ["physical_attributes", "gps_data"], affects: ["position_suitability"] },
      { name: "skillsetRating", type: "number", required: false, description: "Technical skills rating", example: "92", category: "technical", relatesTo: ["skills_assessment"], affects: ["tactical_deployment"] },
      { name: "gameImpactRating", type: "number", required: false, description: "Match impact rating", example: "89", category: "impact", relatesTo: ["performance_statistics"], affects: ["selection_priority"] },
      { name: "potentialRating", type: "number", required: false, description: "Development potential", example: "91", category: "development", relatesTo: ["age", "progression_trends"], affects: ["investment_value"] },
      { name: "lastUpdated", type: "date", required: false, description: "AI analysis timestamp", example: "2024-01-20", category: "metadata", relatesTo: ["data_freshness"], affects: ["analysis_validity"] }
    ],
    relationships: ["All Data Sources", "Team Selection", "Development Planning"]
  }
];

const dataRelationships = [
  {
    from: "Personal Details",
    to: "Communications",
    type: "direct",
    description: "Email and phone enable direct player communication",
    impact: "Critical for team coordination and emergency procedures"
  },
  {
    from: "Rugby Profile",
    to: "Skills Assessment", 
    type: "weighted",
    description: "Position determines skill importance weighting",
    impact: "Different positions prioritize different skills in evaluation"
  },
  {
    from: "Physical Attributes",
    to: "Performance Statistics",
    type: "calculated",
    description: "Physical data influences performance calculations",
    impact: "Power-to-weight ratios affect speed and collision metrics"
  },
  {
    from: "Skills Assessment",
    to: "Team Selection",
    type: "algorithmic",
    description: "Skills ratings feed into selection algorithms",
    impact: "Position-weighted skills determine selection priority"
  },
  {
    from: "Performance Statistics",
    to: "AI Analysis",
    type: "analytical",
    description: "Match data feeds AI rating calculations",
    impact: "Performance trends influence overall player ratings"
  },
  {
    from: "Medical Records",
    to: "Team Selection",
    type: "filtering",
    description: "Medical status filters player availability",
    impact: "Injury status can override performance-based selection"
  },
  {
    from: "All Sections",
    to: "Player Value",
    type: "aggregated",
    description: "Combined data calculates total player value",
    impact: "Holistic assessment for contracts and recruitment"
  }
];

export default function DataSchemaViewer() {
  const [selectedSection, setSelectedSection] = useState<DataStructure | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredFields = selectedSection?.fields.filter(field => 
    field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(field => 
    filterCategory === "all" || field.category === filterCategory
  ) || [];

  const getUniqueCategories = (fields: DataField[]) => {
    const categories = fields.map(f => f.category);
    return ["all", ...Array.from(new Set(categories))];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Schema Viewer</h1>
            <p className="text-gray-600 mt-2">
              Complete mapping of all data structures and their relationships in the North Harbour Rugby system
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {playerDataStructure.reduce((acc, section) => acc + section.fields.length, 0)} Total Fields
          </Badge>
        </div>

        <Tabs defaultValue="structure" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="structure">Data Structure</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="templates">Required Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="structure" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Section List */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold">Data Sections</h3>
                {playerDataStructure.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <Card 
                      key={section.section}
                      className={`cursor-pointer transition-colors hover:shadow-md ${
                        selectedSection?.section === section.section ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedSection(section)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${section.color} text-white`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{section.section}</h4>
                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                            <Badge variant="secondary" className="text-xs mt-2">
                              {section.fields.length} fields
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Section Details */}
              <div className="lg:col-span-2">
                {selectedSection ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <selectedSection.icon className="h-5 w-5" />
                          {selectedSection.section}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search fields..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-8 pr-4 py-2 border rounded-md text-sm"
                            />
                          </div>
                          <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2 border rounded-md text-sm"
                          >
                            {getUniqueCategories(selectedSection.fields).map(cat => (
                              <option key={cat} value={cat}>
                                {cat === "all" ? "All Categories" : cat.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-gray-600">{selectedSection.description}</p>

                      {/* Field List */}
                      <div className="space-y-3">
                        <h4 className="font-semibold">Fields ({filteredFields.length})</h4>
                        <div className="space-y-2">
                          {filteredFields.map((field) => (
                            <div 
                              key={field.name}
                              className="p-3 border rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{field.name}</span>
                                    <Badge variant={field.required ? "destructive" : "secondary"} className="text-xs">
                                      {field.required ? "Required" : "Optional"}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {field.type}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs bg-gray-100">
                                      {field.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{field.description}</p>
                                  <div className="text-xs text-gray-500">
                                    <span className="font-medium">Example: </span>
                                    <code className="bg-gray-100 px-1 rounded">{field.example}</code>
                                  </div>
                                  {field.relatesTo.length > 0 && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      <span className="font-medium">Relates to: </span>
                                      {field.relatesTo.join(", ")}
                                    </div>
                                  )}
                                  {field.affects.length > 0 && (
                                    <div className="text-xs text-green-600 mt-1">
                                      <span className="font-medium">Affects: </span>
                                      {field.affects.join(", ")}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Relationships */}
                      <div>
                        <h4 className="font-semibold mb-3">Section Relationships</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedSection.relationships.map((rel, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <ArrowRight className="h-3 w-3 mr-1" />
                              {rel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a data section to view its fields and relationships</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {dataRelationships.map((rel, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{rel.from}</Badge>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <Badge variant="outline">{rel.to}</Badge>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {rel.type}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium">{rel.description}</p>
                      <p className="text-xs text-gray-600">{rel.impact}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Template Gap Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Critical Gap Identified</h4>
                      <p className="text-red-700 text-sm mb-3">
                        Current basic templates only cover 8 fields, but the actual system uses 60+ interconnected fields.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Current Template:</span>
                          <div className="text-gray-600">Basic player roster (8 fields)</div>
                        </div>
                        <div>
                          <span className="font-medium">Actual System:</span>
                          <div className="text-gray-600">Complete player profile (60+ fields)</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Required Templates</h4>
                      <div className="space-y-2 text-sm">
                        <div>✓ Complete Player Profile Template (60+ fields) - Now Available</div>
                        <div>• Match Performance with GPS Integration (25+ fields)</div>
                        <div>• Medical Assessment & Injury Tracking (15+ fields)</div>
                        <div>• Skills Evaluation with Position Weighting (12+ fields)</div>
                        <div>• Training Session Data with Load Metrics (20+ fields)</div>
                        <div>• Video Analysis Metadata (10+ fields)</div>
                        <div>• Cohesion Markers & TWI Data (15+ fields)</div>
                        <div>• Contract & Value Tracking (8+ fields)</div>
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