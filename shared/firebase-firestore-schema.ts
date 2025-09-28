import { z } from "zod";

// ==========================================
// DEFINITIVE FIREBASE FIRESTORE SCHEMA
// North Harbour Rugby Performance Hub
// Single Source of Truth Database Architecture
// ==========================================

// Players Collection - Top-Level Source of Truth
export const firestorePlayerSchema = z.object({
  // Document ID: player_id (e.g., "jake_thompson")
  
  // Basic Identity
  firstName: z.string(),
  lastName: z.string(),
  dob: z.string(), // ISO timestamp
  position: z.string(),
  contractStatus: z.enum(["Active", "Expired", "Negotiating", "Released"]),
  photoURL: z.string().url().optional(),
  
  // Live Medical Availability Status
  availability: z.object({
    status: z.enum(["Available", "Injured", "Modified", "Rest"]),
    detail: z.string().optional(), // e.g., "Hamstring strain", "Modified training load"
    expectedReturn: z.string().optional(), // ISO timestamp
    lastUpdated: z.string(), // ISO timestamp
    updatedBy: z.string() // staff member ID
  }),
  
  // Latest Data References (for performance optimization)
  latestGpsRef: z.string().optional(), // Document reference to stat_sports_data
  latestMatchStatsRef: z.string().optional(), // Document reference to opta_match_stats
  
  // Rugby Profile
  jerseyNumber: z.number(),
  primaryPosition: z.string(),
  secondaryPositions: z.array(z.string()),
  yearsInTeam: z.number(),
  clubHistory: z.array(z.string()),
  
  // Physical Attributes (latest values)
  physicalAttributes: z.object({
    height: z.number(), // cm
    weight: z.number(), // kg
    bodyFat: z.number(), // percentage
    lastMeasured: z.string() // ISO timestamp
  }),
  
  // Skills Ratings (1-10 scale)
  skills: z.object({
    ballHandling: z.number().min(1).max(10),
    passing: z.number().min(1).max(10),
    kicking: z.number().min(1).max(10),
    lineoutThrowing: z.number().min(1).max(10),
    scrummaging: z.number().min(1).max(10),
    rucking: z.number().min(1).max(10),
    defense: z.number().min(1).max(10),
    communication: z.number().min(1).max(10)
  }),
  
  // Player Value Metrics (MoneyBall Analytics)
  playerValue: z.object({
    contractValue: z.number(),
    attendanceScore: z.number().min(0).max(10),
    medicalScore: z.number().min(0).max(10),
    personalityScore: z.number().min(0).max(10),
    performanceScore: z.number().min(0).max(10),
    cohesionScore: z.number().min(0).max(10),
    totalScore: z.number(),
    lastCalculated: z.string() // ISO timestamp
  }).optional(),
  
  // Contact Information
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    emergencyContact: z.object({
      name: z.string(),
      relationship: z.string(),
      phone: z.string()
    })
  }),
  
  // System Metadata
  createdAt: z.string(), // ISO timestamp
  updatedAt: z.string() // ISO timestamp
});

// StatSports GPS Data Collection - Time-Series GPS Data
export const firestoreGpsDataSchema = z.object({
  // Document ID: {player_id}_{session_id} (e.g., "jake_thompson_session_2025_01_23_001")
  
  // References
  playerRef: z.string(), // Reference to players/{player_id}
  sessionRef: z.string(), // Reference to training_sessions/{session_id}
  playerId: z.string(), // Denormalized for query performance
  sessionId: z.string(), // Denormalized for query performance
  
  // Session Context
  date: z.string(), // ISO timestamp
  sessionType: z.enum(["training", "match", "conditioning", "recovery"]),
  
  // Core GPS Metrics
  gpsMetrics: z.object({
    // Distance Metrics
    totalDistance: z.number(), // metres
    metresPerMinute: z.number(),
    highSpeedRunningDistance: z.number(), // metres >14.4 km/h
    sprintDistance: z.number(), // metres >19.8 km/h
    maxVelocity: z.number(), // m/s
    
    // Movement Quality
    accelerations: z.object({
      total: z.number(),
      high: z.number(), // >3 m/s²
      moderate: z.number() // 2-3 m/s²
    }),
    decelerations: z.object({
      total: z.number(),
      high: z.number(), // <-3 m/s²
      moderate: z.number() // -2 to -3 m/s²
    }),
    
    // Load Metrics
    dynamicStressLoad: z.number(),
    impacts: z.number(), // >5G
    highMetabolicLoadDistance: z.number(),
    involvements: z.number(),
    
    // Performance Indicators
    acwr: z.number(), // Acute:Chronic Workload Ratio
    personalDSLAverage: z.number(),
    positionalDSLAverage: z.number(),
    loadStatus: z.enum(["green", "amber", "red"]),
    performanceStatus: z.enum(["Excellent", "Good", "Moderate", "Poor"]),
    
    // Data Quality
    dataQuality: z.number().min(0).max(1), // 0-1 scale
    satelliteCount: z.number(),
    signalStrength: z.number().min(0).max(100) // percentage
  }),
  
  // System Metadata
  uploadedAt: z.string(), // ISO timestamp
  processedAt: z.string(), // ISO timestamp
  dataSource: z.enum(["StatSports", "Manual Upload", "CSV Import"])
});

// OPTA Match Statistics Collection - Match Performance Data
export const firestoreOptaMatchStatsSchema = z.object({
  // Document ID: {player_id}_{game_id} (e.g., "jake_thompson_nh_vs_auckland_2024_07_15")
  
  // References
  playerRef: z.string(), // Reference to players/{player_id}
  gameRef: z.string(), // Reference to games/{game_id}
  playerId: z.string(), // Denormalized for query performance
  gameId: z.string(), // Denormalized for query performance
  
  // Match Context
  date: z.string(), // ISO timestamp
  opponent: z.string(),
  venue: z.string(),
  competition: z.string(),
  matchResult: z.enum(["win", "loss", "draw"]),
  
  // Match Statistics
  matchStats: z.object({
    // Basic Stats
    minutesPlayed: z.number(),
    tries: z.number(),
    tacklesMade: z.number(),
    tacklesMissed: z.number(),
    carries: z.number(),
    metres: z.number(),
    passes: z.number(),
    turnovers: z.number(),
    
    // Position-Specific Stats
    lineoutThrows: z.number().optional(), // Hookers
    lineoutSuccess: z.number().optional(),
    kicksAtGoal: z.number().optional(), // Kickers
    kicksSuccessful: z.number().optional(),
    scrumPushovers: z.number().optional(), // Forwards
    linebreaks: z.number(),
    offloads: z.number(),
    
    // Advanced Analytics
    workRate: z.object({
      involvement: z.number(), // percentage
      attackingInvolvements: z.number(),
      defensiveInvolvements: z.number(),
      supportInvolvements: z.number()
    }),
    
    // Performance Ratings
    performanceRating: z.number().min(1).max(10),
    coachRating: z.number().min(1).max(10).optional(),
    
    // Error Analysis
    handlingErrors: z.number(),
    penaltiesConceded: z.number(),
    yellowCards: z.number(),
    redCards: z.number()
  }),
  
  // System Metadata
  uploadedAt: z.string(), // ISO timestamp
  processedAt: z.string(), // ISO timestamp
  dataSource: z.enum(["OPTA", "Manual Entry", "Video Analysis"])
});

// Training Sessions Collection - Session Metadata
export const firestoreTrainingSessionSchema = z.object({
  // Document ID: session_id (e.g., "session_2025_01_23_001")
  
  // Session Details
  sessionDate: z.string(), // ISO timestamp
  sessionTitle: z.string(),
  week: z.number(),
  day: z.number(),
  
  // Session Configuration
  sessionType: z.enum(["High Intensity", "Recovery", "Skills", "Match Prep", "Conditioning"]),
  location: z.string(),
  duration: z.number(), // minutes
  
  // Environmental Conditions
  weather: z.string(),
  temperature: z.number(), // celsius
  windSpeed: z.number().optional(), // km/h
  pitchCondition: z.enum(["Excellent", "Good", "Fair", "Poor"]).optional(),
  
  // Participants
  participantCount: z.number(),
  participants: z.array(z.string()), // Array of player IDs
  coachingStaff: z.array(z.string()),
  
  // Session Planning
  objectives: z.array(z.string()),
  plannedIntensity: z.enum(["Low", "Medium", "High", "Max"]),
  plannedLoad: z.number(), // expected DSL
  
  // Session Outcomes
  actualIntensity: z.enum(["Low", "Medium", "High", "Max"]).optional(),
  actualLoad: z.number().optional(), // average DSL achieved
  sessionQuality: z.enum(["Excellent", "Good", "Average", "Poor"]).optional(),
  
  // Notes and Analysis
  coachNotes: z.string().optional(),
  weatherImpact: z.enum(["None", "Minor", "Moderate", "Significant"]).optional(),
  injuryOccurrences: z.array(z.object({
    playerId: z.string(),
    injuryType: z.string(),
    severity: z.enum(["Minor", "Moderate", "Major"])
  })).optional(),
  
  // Session Status
  status: z.enum(["Planned", "Active", "Completed", "Cancelled"]),
  
  // System Metadata
  createdAt: z.string(), // ISO timestamp
  updatedAt: z.string(), // ISO timestamp
  createdBy: z.string() // staff member ID
});

// Games Collection - Match Metadata
export const firestoreGameSchema = z.object({
  // Document ID: game_id (e.g., "nh_vs_auckland_2024_07_15")
  
  // Match Details
  homeTeam: z.string(),
  awayTeam: z.string(),
  matchDate: z.string(), // ISO timestamp
  venue: z.string(),
  competition: z.string(),
  round: z.string().optional(),
  
  // Match Result
  homeScore: z.number(),
  awayScore: z.number(),
  result: z.enum(["win", "loss", "draw"]), // From North Harbour perspective
  
  // Match Conditions
  weather: z.string(),
  temperature: z.number(), // celsius
  windSpeed: z.number().optional(), // km/h
  pitchCondition: z.enum(["Excellent", "Good", "Fair", "Poor"]).optional(),
  
  // Team Statistics
  teamStats: z.object({
    possession: z.number(), // percentage
    territory: z.number(), // percentage
    lineBreaks: z.number(),
    turnovers: z.number(),
    penalties: z.number(),
    scrumSuccess: z.number(), // percentage
    lineoutSuccess: z.number(), // percentage
    tackleSuccess: z.number(), // percentage
    
    // Advanced Team Metrics
    ruckSpeed: z.object({
      fast: z.number(), // 0-3 seconds
      medium: z.number(), // 3-6 seconds
      slow: z.number() // 6+ seconds
    }),
    
    attackingStats: z.object({
      phasesPlayed: z.number(),
      offloads: z.number(),
      gainlineSuccess: z.number(), // percentage
      metresGained: z.number()
    })
  }),
  
  // Squad Selection
  startingXV: z.array(z.string()), // Array of player IDs
  bench: z.array(z.string()), // Array of player IDs
  unavailablePlayers: z.array(z.string()), // Array of player IDs
  
  // Officials
  referee: z.string(),
  assistantReferees: z.array(z.string()),
  tmo: z.string().optional(),
  
  // Match Analysis
  keyMoments: z.array(z.object({
    minute: z.number(),
    type: z.enum(["Try", "Penalty", "Yellow Card", "Red Card", "Substitution"]),
    player: z.string().optional(),
    description: z.string()
  })).optional(),
  
  // System Metadata
  createdAt: z.string(), // ISO timestamp
  updatedAt: z.string(), // ISO timestamp
  createdBy: z.string() // staff member ID
});

// Staff Notes Collection - Staff Observations
export const firestoreStaffNoteSchema = z.object({
  // Document ID: auto-generated
  
  // Note Details
  playerId: z.string(),
  sessionId: z.string().optional(),
  gameId: z.string().optional(),
  
  // Note Content
  note: z.string(),
  noteType: z.enum(["observation", "concern", "achievement", "recommendation", "medical", "tactical"]),
  
  // Staff Information
  staffId: z.string(),
  staffName: z.string(),
  staffRole: z.enum(["Head Coach", "Assistant Coach", "S&C Coach", "Medical Staff", "Physiotherapist"]),
  
  // Visibility and Privacy
  visibility: z.enum(["staff_only", "coaches", "medical", "public"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  
  // Follow-up
  actionRequired: z.boolean(),
  actionTaken: z.boolean().optional(),
  followUpDate: z.string().optional(), // ISO timestamp
  
  // System Metadata
  createdAt: z.string(), // ISO timestamp
  updatedAt: z.string() // ISO timestamp
});

// AI Insights Collection - Generated Analytics
export const firestoreAiInsightSchema = z.object({
  // Document ID: auto-generated
  
  // Analysis Context
  sessionId: z.string().optional(),
  gameId: z.string().optional(),
  playerId: z.string().optional(), // if player-specific insight
  analysisType: z.enum(["anomalies", "session_intent", "trends", "positional", "injury_risk", "performance_prediction"]),
  
  // Anomaly Detection
  anomalies: z.array(z.object({
    player: z.string(),
    metric: z.string(),
    description: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    recommendation: z.string(),
    confidence: z.number().min(0).max(1) // 0-1 scale
  })),
  
  // Session Analysis
  sessionAnalysis: z.object({
    intentMatch: z.number().min(0).max(1), // How well session matched intended load
    weatherImpact: z.number().min(-1).max(1), // Weather effect on performance
    overallQuality: z.enum(["poor", "moderate", "good", "excellent"]),
    trainingLoad: z.enum(["low", "appropriate", "high"]),
    playerReadiness: z.number().min(0).max(1) // Squad readiness score
  }).optional(),
  
  // Insights and Recommendations
  insights: z.array(z.object({
    description: z.string(),
    confidence: z.number().min(0).max(1),
    category: z.enum(["session-intent", "player-performance", "injury-risk", "tactical", "conditioning"]),
    impact: z.string()
  })),
  
  recommendations: z.array(z.object({
    description: z.string(),
    priority: z.enum(["low", "medium", "high"]),
    actionRequired: z.boolean(),
    timeframe: z.enum(["immediate", "24hrs", "next_session", "this_week", "ongoing"]),
    targetStaff: z.array(z.string()) // staff roles that should see this
  })),
  
  // AI Processing Information
  modelVersion: z.string(),
  processingTime: z.number(), // seconds
  dataQuality: z.number().min(0).max(1), // Quality of input data
  
  // System Metadata
  generatedAt: z.string(), // ISO timestamp
  lastUpdated: z.string() // ISO timestamp
});

// Performance Snapshots Collection - Generated Reports
export const firestoreSnapshotSchema = z.object({
  // Document ID: auto-generated
  
  // Snapshot Details
  playerId: z.string(),
  sessionId: z.string().optional(),
  gameId: z.string().optional(),
  snapshotType: z.enum(["session_summary", "weekly_report", "injury_assessment", "performance_analysis", "tactical_review"]),
  
  // Generation Information
  generatedBy: z.string(), // staff member ID
  generatedByName: z.string(),
  generatedByRole: z.string(),
  
  // Content
  title: z.string(),
  description: z.string(),
  reportData: z.object({
    summary: z.string(),
    keyMetrics: z.array(z.object({
      metric: z.string(),
      value: z.union([z.string(), z.number()]),
      status: z.enum(["good", "average", "concern"])
    })),
    recommendations: z.array(z.string()),
    charts: z.array(z.object({
      type: z.string(),
      title: z.string(),
      data: z.any() // Chart data in JSON format
    })).optional()
  }),
  
  // File Information
  downloadUrl: z.string().optional(), // URL to generated PDF/document
  fileSize: z.number().optional(), // bytes
  fileFormat: z.enum(["pdf", "json", "csv"]),
  
  // Distribution
  sentTo: z.array(z.string()), // email addresses
  sentAt: z.string().optional(), // ISO timestamp
  
  // Status
  status: z.enum(["generated", "sent", "viewed", "archived"]),
  viewCount: z.number().default(0),
  
  // System Metadata
  createdAt: z.string(), // ISO timestamp
  expiresAt: z.string().optional() // ISO timestamp for auto-cleanup
});

// Medical Data Collection - Extended Medical Information
export const firestoreMedicalDataSchema = z.object({
  // Document ID: {player_id}_{medical_record_id}
  
  // Patient Reference
  playerId: z.string(),
  
  // Medical Record Details
  recordType: z.enum(["wellness", "assessment", "appointment", "treatment", "clearance"]),
  
  // Wellness Data
  wellness: z.object({
    sleep: z.number().min(0).max(10),
    fatigue: z.number().min(0).max(10),
    mood: z.number().min(0).max(10),
    stress: z.number().min(0).max(10),
    soreness: z.number().min(0).max(10),
    overallScore: z.number().min(0).max(10),
    notes: z.string().optional()
  }).optional(),
  
  // Assessment Data
  assessment: z.object({
    assessmentType: z.enum(["screening", "injury", "return_to_play", "routine"]),
    fmsScore: z.number().optional(),
    shoulderFlexibility: z.enum(["poor", "fair", "good", "excellent"]).optional(),
    ankleStability: z.enum(["poor", "fair", "good", "excellent"]).optional(),
    coreStability: z.enum(["poor", "fair", "good", "excellent"]).optional(),
    assessor: z.string(),
    findings: z.string(),
    recommendations: z.string(),
    nextAssessment: z.string().optional() // ISO timestamp
  }).optional(),
  
  // Injury Risk Assessment
  injuryRisk: z.object({
    riskLevel: z.enum(["low", "moderate", "high", "very_high"]),
    riskFactors: z.array(z.string()),
    acwrRatio: z.number().optional(),
    previousInjuries: z.number(),
    currentSymptoms: z.array(z.string()),
    preventionRecommendations: z.array(z.string())
  }).optional(),
  
  // Privacy and Access
  confidentialityLevel: z.enum(["public", "staff", "medical_only"]),
  accessRestrictions: z.array(z.string()), // staff roles with access
  
  // Medical Staff Information
  recordedBy: z.string(), // medical staff ID
  recordedByName: z.string(),
  approvedBy: z.string().optional(), // senior medical staff
  
  // System Metadata
  recordDate: z.string(), // ISO timestamp
  createdAt: z.string(), // ISO timestamp
  updatedAt: z.string() // ISO timestamp
});

// Video Analysis Events Collection - Match Video Analysis Data
export const firestoreVideoEventSchema = z.object({
  // Document ID: {match_id}_{period}_{clockSec}_{rowIndex} (e.g., "nh_vs_hawkes_bay_2024_1_120_15")
  
  // Match Context
  matchId: z.string(), // Reference to games/{match_id}
  period: z.number().min(1).max(2), // Half (1 or 2)
  clockSec: z.number(), // Time in seconds from kick-off
  startTimeRaw: z.string(), // Original start time from CSV
  durationSec: z.number(), // Event duration in seconds
  
  // Team Context
  team: z.enum(["home", "away", "unknown"]), // Which team involved
  opposition: z.string().optional(), // Opposition team name
  players: z.array(z.string()), // Player names/numbers involved
  
  // Event Classification
  eventType: z.enum([
    "carry", "tackle", "breakdown", "turnover", "kick", "lineout", 
    "scrum", "penalty", "try", "goalKick", "restart", "counterAttack", 
    "error", "setPlay", "attack22Entry", "ballInPlay", "periodChange", "other"
  ]),
  subType: z.string().optional(), // Specific sub-classification
  outcome: z.string().optional(), // Event outcome/result
  
  // Field Position
  field: z.object({
    zone: z.string().optional(), // Field zone from CSV
    position: z.string().optional(), // Field position description
    x: z.number().optional(), // X coordinate if available
    y: z.number().optional() // Y coordinate if available
  }),
  
  // Rugby-Specific Qualities
  qualities: z.object({
    // Ball Carry
    carryDominance: z.string().optional(),
    gainLine: z.boolean().optional(),
    carryOutcome: z.string().optional(),
    carryType: z.string().optional(),
    
    // Tackle/Defense
    tackleOutcome: z.string().optional(),
    defenseAction: z.string().optional(),
    tacklersCommitted: z.number().optional(),
    
    // Breakdown
    breakdownOutcome: z.string().optional(),
    jackal: z.boolean().optional(),
    
    // Kicking
    kickType: z.string().optional(),
    kickOutcome: z.string().optional(),
    
    // Set Pieces
    lineoutOutcome: z.string().optional(),
    scrumOutcome: z.string().optional(),
    
    // Attacking Plays
    attack22Entry: z.boolean().optional(),
    attack22Outcome: z.string().optional(),
    attack22Points: z.number().optional(),
    
    // Goal Kicking
    goalKickOutcome: z.string().optional(),
    goalKickMissedType: z.string().optional(),
    
    // Other Events
    handlingOutcome: z.string().optional(),
    counterAttackOutcome: z.string().optional(),
    tryType: z.string().optional()
  }),
  
  // Tags and Labels
  tags: z.array(z.string()), // Additional tags/labels
  instance: z.number().optional(), // Instance number from CSV
  fxId: z.string().optional(), // FX ID from video analysis software
  rowLabel: z.string().optional(), // Original row label from CSV
  
  // Data Source
  source: z.enum(["SCVideo", "Manual", "Import"]),
  uploadId: z.string(), // Reference to upload that created this event
  
  // System Metadata
  createdAt: z.string(), // ISO timestamp
  schemaVersion: z.number().default(1)
});

// Video Upload Metadata Collection - Track CSV Upload Sessions
export const firestoreVideoUploadSchema = z.object({
  // Document ID: auto-generated
  
  // Upload Context
  matchId: z.string(), // Reference to games/{match_id}
  filename: z.string(), // Original CSV filename
  fileSize: z.number(), // File size in bytes
  fileHash: z.string().optional(), // MD5 hash for duplicate detection
  
  // Processing Results
  rowsParsed: z.number(), // Total rows in CSV
  eventsStored: z.number(), // Successfully parsed events
  errorCount: z.number(), // Number of parsing errors
  errors: z.array(z.object({
    row: z.number(),
    field: z.string().optional(),
    message: z.string(),
    severity: z.enum(["warning", "error"])
  })).optional(),
  
  // Processing Summary
  eventTypeCounts: z.record(z.number()), // Count by event type
  periodBreakdown: z.object({
    period1: z.number(),
    period2: z.number()
  }),
  
  // Upload Information
  uploadedBy: z.string(), // Staff member ID
  uploadedByName: z.string(),
  uploadedByRole: z.string(),
  processingTimeMs: z.number().optional(),
  
  // Status
  status: z.enum(["processing", "completed", "failed"]),
  
  // System Metadata
  createdAt: z.string(), // ISO timestamp
  completedAt: z.string().optional(), // ISO timestamp
  schemaVersion: z.number().default(1)
});

// Export all schemas and types
export type FirestorePlayer = z.infer<typeof firestorePlayerSchema>;
export type FirestoreGpsData = z.infer<typeof firestoreGpsDataSchema>;
export type FirestoreOptaMatchStats = z.infer<typeof firestoreOptaMatchStatsSchema>;
export type FirestoreTrainingSession = z.infer<typeof firestoreTrainingSessionSchema>;
export type FirestoreGame = z.infer<typeof firestoreGameSchema>;
export type FirestoreStaffNote = z.infer<typeof firestoreStaffNoteSchema>;
export type FirestoreAiInsight = z.infer<typeof firestoreAiInsightSchema>;
export type FirestoreSnapshot = z.infer<typeof firestoreSnapshotSchema>;
export type FirestoreMedicalData = z.infer<typeof firestoreMedicalDataSchema>;
export type FirestoreVideoEvent = z.infer<typeof firestoreVideoEventSchema>;
export type FirestoreVideoUpload = z.infer<typeof firestoreVideoUploadSchema>;

// Collection Names (Constants)
export const FIRESTORE_COLLECTIONS = {
  PLAYERS: "players",
  GPS_DATA: "stat_sports_data",
  MATCH_STATS: "opta_match_stats", 
  TRAINING_SESSIONS: "training_sessions",
  GAMES: "games",
  STAFF_NOTES: "staff_notes",
  AI_INSIGHTS: "ai_insights",
  SNAPSHOTS: "snapshots",
  MEDICAL_DATA: "medical_data",
  VIDEO_EVENTS: "video_events",
  VIDEO_UPLOADS: "video_uploads",
  PDF_MATCH_REPORTS: "pdf_match_reports",
  PDF_TEAM_STATS: "pdf_team_stats",
  PDF_PLAYER_STATS: "pdf_player_stats"
} as const;

// Data Validation Helpers
export function validateFirestoreDocument<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Firestore validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Document ID Generators
export function generateGpsDataId(playerId: string, sessionId: string): string {
  return `${playerId}_${sessionId}`;
}

export function generateMatchStatsId(playerId: string, gameId: string): string {
  return `${playerId}_${gameId}`;
}

export function generateMedicalDataId(playerId: string, recordType: string): string {
  const timestamp = new Date().getTime();
  return `${playerId}_${recordType}_${timestamp}`;
}

export function generateVideoEventId(matchId: string, period: number, clockSec: number, rowIndex: number): string {
  return `${matchId}_${period}_${clockSec}_${rowIndex}`;
}

export function generatePdfReportId(matchId: string): string {
  const timestamp = new Date().getTime();
  return `${matchId}_pdf_${timestamp}`;
}

export function generatePdfPlayerStatsId(playerId: string, matchId: string): string {
  return `${playerId}_${matchId}`;
}

export function generateVideoUploadId(): string {
  return `upload_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;
}