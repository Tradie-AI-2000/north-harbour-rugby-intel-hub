import { z } from "zod";

// Firebase-specific schemas for North Harbour Rugby Performance Hub
// This schema covers all interactive frontend operations beyond the static CSV player profiles

// ================================
// MEDICAL MANAGEMENT SCHEMAS
// ================================

export const medicalAppointmentSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  type: z.enum(['consultation', 'treatment', 'follow_up', 'assessment', 'scan', 'surgery']),
  provider: z.string(), // medical staff member
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
  location: z.string(),
  notes: z.string().optional(),
  priority: z.enum(['routine', 'urgent', 'emergency']),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
});

export const medicalNoteSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  appointmentId: z.string().optional(),
  title: z.string(),
  content: z.string(),
  type: z.enum(['assessment', 'treatment', 'recommendation', 'progress', 'clearance']),
  author: z.string(), // medical staff member
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  isConfidential: z.boolean().default(false),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
  })).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const injuryRecordSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  type: z.enum(['acute', 'chronic', 'overuse', 'contact', 'non_contact']),
  severity: z.enum(['minor', 'moderate', 'severe', 'career_threatening']),
  bodyPart: z.string(),
  specificArea: z.string(),
  mechanism: z.string(),
  dateOccurred: z.string(),
  dateReported: z.string(),
  reportedBy: z.string(),
  
  // Recovery tracking
  expectedReturnDate: z.string().optional(),
  actualReturnDate: z.string().optional(),
  status: z.enum(['active', 'recovering', 'cleared', 'chronic', 'retired']),
  
  // Treatment plan
  treatmentPlan: z.array(z.object({
    date: z.string(),
    treatment: z.string(),
    provider: z.string(),
    notes: z.string(),
    progress: z.enum(['excellent', 'good', 'fair', 'poor', 'setback']),
  })),
  
  // Restrictions and clearance
  currentRestrictions: z.array(z.string()),
  clearanceRequirements: z.array(z.string()),
  riskFactors: z.array(z.string()),
  preventionNotes: z.string().optional(),
  
  // Staff and updates
  primaryMedicalStaff: z.string(),
  lastUpdated: z.string(),
  lastUpdatedBy: z.string(),
});

// ================================
// STRENGTH & CONDITIONING SCHEMAS
// ================================

export const fitnessTestSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  testType: z.enum([
    'bronco_test', 'yo_yo_ir1', 'yo_yo_ir2', '40m_sprint', '10m_sprint',
    'bench_press_1rm', 'squat_1rm', 'deadlift_1rm', 'vertical_jump',
    'broad_jump', 'agility_test', 'vo2_max', 'body_composition'
  ]),
  testDate: z.string(),
  result: z.number(),
  unit: z.string(),
  percentile: z.number().optional(), // compared to position benchmarks
  previousResult: z.number().optional(),
  improvement: z.number().optional(),
  testConditions: z.object({
    weather: z.string().optional(),
    temperature: z.number().optional(),
    surface: z.string().optional(),
    equipment: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
  conductedBy: z.string(), // S&C staff member
  createdAt: z.string(),
});

export const gpsTrainingSessionSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  sessionDate: z.string(),
  sessionType: z.enum(['training', 'match', 'conditioning', 'skills', 'recovery']),
  duration: z.number(), // minutes
  
  // Movement metrics
  totalDistance: z.number(), // meters
  distanceZones: z.object({
    walking: z.number(), // 0-6 km/h
    jogging: z.number(), // 6-12 km/h
    running: z.number(), // 12-18 km/h
    highSpeed: z.number(), // 18-24 km/h
    sprinting: z.number() // 24+ km/h
  }),
  
  // Speed and acceleration
  maxSpeed: z.number(),
  averageSpeed: z.number(),
  sprintCount: z.number(),
  accelerationCount: z.object({
    low: z.number(),
    medium: z.number(),
    high: z.number(),
  }),
  decelerationCount: z.object({
    low: z.number(),
    medium: z.number(),
    high: z.number(),
  }),
  
  // Load metrics
  playerLoad: z.number(),
  playerLoadPerMinute: z.number(),
  
  // Heart rate (if available)
  heartRateData: z.object({
    average: z.number(),
    maximum: z.number(),
    timeInZones: z.object({
      zone1: z.number(), // minutes
      zone2: z.number(),
      zone3: z.number(),
      zone4: z.number(),
      zone5: z.number(),
    }),
  }).optional(),
  
  // Session quality and notes
  rpe: z.number().min(1).max(10).optional(), // Rate of Perceived Exertion
  sessionQuality: z.enum(['poor', 'average', 'good', 'excellent']).optional(),
  notes: z.string().optional(),
  recordedBy: z.string(),
  createdAt: z.string(),
});

export const physicalAttributeTimeSeriesSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  measurementDate: z.string(),
  weight: z.number(),
  bodyFatPercentage: z.number().optional(),
  leanMass: z.number().optional(),
  height: z.number().optional(),
  muscleGirth: z.object({
    bicep: z.number().optional(),
    thigh: z.number().optional(),
    calf: z.number().optional(),
  }).optional(),
  measuredBy: z.string(),
  notes: z.string().optional(),
  createdAt: z.string(),
});

// ================================
// COACHING STAFF SCHEMAS
// ================================

export const coachingNoteSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  sessionId: z.string().optional(), // training or match session
  type: z.enum(['development', 'tactical', 'technical', 'behavioral', 'performance']),
  title: z.string(),
  content: z.string(),
  category: z.enum(['strengths', 'weaknesses', 'opportunities', 'concerns']),
  priority: z.enum(['low', 'medium', 'high']),
  actionItems: z.array(z.string()),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  author: z.string(), // coaching staff member
  isPrivate: z.boolean().default(false),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const squadSelectionSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  opponent: z.string(),
  matchDate: z.string(),
  venue: z.string(),
  
  // Squad composition
  startingXV: z.array(z.object({
    playerId: z.string(),
    position: z.string(),
    jerseyNumber: z.number(),
  })),
  reserves: z.array(z.object({
    playerId: z.string(),
    position: z.string(),
    jerseyNumber: z.number(),
  })),
  unavailablePlayers: z.array(z.object({
    playerId: z.string(),
    reason: z.enum(['injured', 'suspended', 'personal', 'form', 'tactical']),
    notes: z.string().optional(),
  })),
  
  // Selection rationale
  selectionNotes: z.string().optional(),
  tacticalFocus: z.array(z.string()),
  selectedBy: z.string(), // head coach
  approvedBy: z.string().optional(), // team management
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const matchAnalysisSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  playerId: z.string(),
  opponent: z.string(),
  matchDate: z.string(),
  venue: z.string(),
  
  // Performance ratings (1-10)
  ratings: z.object({
    overall: z.number().min(1).max(10),
    attack: z.number().min(1).max(10),
    defense: z.number().min(1).max(10),
    setPhase: z.number().min(1).max(10),
    workRate: z.number().min(1).max(10),
    discipline: z.number().min(1).max(10),
  }),
  
  // Key moments
  positiveContributions: z.array(z.object({
    time: z.string(), // match time
    action: z.string(),
    description: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
  })),
  negativeContributions: z.array(z.object({
    time: z.string(),
    action: z.string(),
    description: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
  })),
  
  // Development focus
  strengthsDisplayed: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  coachingPoints: z.array(z.string()),
  
  // Video analysis
  videoClips: z.array(z.object({
    title: z.string(),
    timestamp: z.string(),
    url: z.string(),
    category: z.enum(['positive', 'negative', 'learning']),
  })).optional(),
  
  analyzedBy: z.string(), // coaching staff member
  reviewedBy: z.string().optional(), // head coach
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ================================
// AI ANALYSIS SCHEMAS
// ================================

export const aiAnalysisSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  analysisType: z.enum(['performance', 'development', 'injury_risk', 'recruitment', 'comparison']),
  prompt: z.string(), // original analysis request
  
  // AI-generated insights
  insights: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    recommendations: z.array(z.string()),
    developmentPriorities: z.array(z.string()),
  }),
  
  // Confidence scores
  confidenceScores: z.object({
    overall: z.number().min(0).max(1),
    dataQuality: z.number().min(0).max(1),
    sampleSize: z.number().min(0).max(1),
  }),
  
  // Supporting data used
  dataSourcesUsed: z.array(z.object({
    source: z.string(),
    dateRange: z.object({
      from: z.string(),
      to: z.string(),
    }),
    recordCount: z.number(),
  })),
  
  // Injury risk prediction (if applicable)
  injuryRiskAssessment: z.object({
    riskLevel: z.enum(['low', 'moderate', 'high', 'critical']),
    riskFactors: z.array(z.string()),
    preventionRecommendations: z.array(z.string()),
    monitoringPoints: z.array(z.string()),
  }).optional(),
  
  // Model information
  aiModel: z.string(), // e.g., "gemini-2.5-pro"
  modelVersion: z.string(),
  generatedAt: z.string(),
  requestedBy: z.string(),
  reviewed: z.boolean().default(false),
  reviewedBy: z.string().optional(),
  reviewNotes: z.string().optional(),
});

// ================================
// OPERATIONAL DATA SCHEMAS
// ================================

export const playerStatusSchema = z.object({
  playerId: z.string(),
  currentStatus: z.enum(['available', 'injured', 'suspended', 'unavailable', 'retired']),
  fitnessStatus: z.enum(['fit', 'returning', 'managing', 'unfit']),
  medicalClearance: z.enum(['cleared', 'conditional', 'restricted', 'not_cleared']),
  availabilityNotes: z.string().optional(),
  lastUpdated: z.string(),
  updatedBy: z.string(),
  nextReviewDate: z.string().optional(),
});

export const dataSourceTrackingSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  dataType: z.enum(['medical', 'fitness', 'gps', 'coaching', 'ai_analysis', 'status']),
  recordId: z.string(), // ID of the specific record
  source: z.enum(['manual_entry', 'csv_upload', 'api_import', 'ai_generated']),
  inputBy: z.string(), // user who created/updated
  inputMethod: z.string(), // 'web_form', 'bulk_upload', 'api_sync', etc.
  lastModified: z.string(),
  version: z.number(),
  changeLog: z.array(z.object({
    field: z.string(),
    oldValue: z.string().optional(),
    newValue: z.string(),
    changedBy: z.string(),
    changedAt: z.string(),
  })),
});

export const teamSquadSchema = z.object({
  id: z.string(),
  name: z.string(), // e.g., "First XV", "Development Squad", "Injury Rehabilitation"
  type: z.enum(['match_squad', 'training_group', 'development_squad', 'rehab_group']),
  description: z.string().optional(),
  members: z.array(z.object({
    playerId: z.string(),
    role: z.string(), // captain, vice-captain, player
    addedDate: z.string(),
    addedBy: z.string(),
  })),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isActive: z.boolean().default(true),
});

// ================================
// FIREBASE PLAYER PROFILE SCHEMA
// ================================

export const firebasePlayerSchema = z.object({
  // Core identification (from CSV)
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  email: z.string(),
  phone: z.string(),
  
  // Rugby profile (from CSV)
  position: z.string(),
  secondaryPosition: z.string().optional(),
  jerseyNumber: z.number(),
  club: z.string(),
  experience: z.string(),
  teamHistory: z.string(),
  previousClubs: z.array(z.string()),
  
  // Physical attributes (from CSV - latest values)
  currentHeight: z.number(),
  currentWeight: z.number(),
  
  // Skills (from CSV)
  skills: z.object({
    ballHandling: z.number().min(1).max(10),
    passing: z.number().min(1).max(10),
    defense: z.number().min(1).max(10),
    communication: z.number().min(1).max(10),
  }),
  
  // Contract and status (from CSV)
  currentStatus: z.string(),
  availability: z.string(),
  dateSigned: z.string().optional(),
  offContractDate: z.string().optional(),
  contractValue: z.number().optional(),
  
  // Performance analytics (from CSV)
  attendanceScore: z.number(),
  scScore: z.number(),
  medicalScore: z.number(),
  personalityScore: z.number(),
  sprintTime10m: z.number().optional(),
  
  // Community and background (from CSV)
  familyBackground: z.string().optional(),
  gritNote: z.string().optional(),
  communityNote: z.string().optional(),
  
  // Meta information
  photoUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastModifiedBy: z.string(),
  
  // Quick status indicators for frontend
  quickStatus: z.object({
    fitness: z.enum(['available', 'injured', 'recovering', 'unavailable']),
    medical: z.enum(['cleared', 'under_review', 'restricted']),
    lastGpsSession: z.string().optional(),
    lastFitnessTest: z.string().optional(),
    openInjuries: z.number().default(0),
    upcomingAppointments: z.number().default(0),
  }),
});

// ================================
// TYPE EXPORTS
// ================================

export type MedicalAppointment = z.infer<typeof medicalAppointmentSchema>;
export type MedicalNote = z.infer<typeof medicalNoteSchema>;
export type InjuryRecord = z.infer<typeof injuryRecordSchema>;
export type FitnessTest = z.infer<typeof fitnessTestSchema>;
export type GpsTrainingSession = z.infer<typeof gpsTrainingSessionSchema>;
export type PhysicalAttributeTimeSeries = z.infer<typeof physicalAttributeTimeSeriesSchema>;
export type CoachingNote = z.infer<typeof coachingNoteSchema>;
export type SquadSelection = z.infer<typeof squadSelectionSchema>;
export type MatchAnalysis = z.infer<typeof matchAnalysisSchema>;
export type AiAnalysis = z.infer<typeof aiAnalysisSchema>;
export type PlayerStatus = z.infer<typeof playerStatusSchema>;
export type DataSourceTracking = z.infer<typeof dataSourceTrackingSchema>;
export type TeamSquad = z.infer<typeof teamSquadSchema>;
export type FirebasePlayer = z.infer<typeof firebasePlayerSchema>;

// ================================
// FIREBASE COLLECTION STRUCTURE
// ================================

export const FIREBASE_COLLECTIONS = {
  // Main collections
  PLAYERS: 'players',
  SQUADS: 'squads',
  
  // Player subcollections
  MEDICAL_APPOINTMENTS: 'medicalAppointments',
  MEDICAL_NOTES: 'medicalNotes', 
  INJURY_RECORDS: 'injuryRecords',
  FITNESS_TESTS: 'fitnessTests',
  GPS_SESSIONS: 'gpsSessions',
  PHYSICAL_ATTRIBUTES: 'physicalAttributes',
  COACHING_NOTES: 'coachingNotes',
  MATCH_ANALYSIS: 'matchAnalysis',
  AI_ANALYSIS: 'aiAnalysis',
  STATUS_TRACKING: 'statusTracking',
  DATA_SOURCE_TRACKING: 'dataSourceTracking',
} as const;