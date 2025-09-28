import { z } from "zod";
import { pgTable, text, serial, integer, real, timestamp, jsonb, boolean, varchar, decimal, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// Physical attribute entry schema
export const physicalAttributeSchema = z.object({
  date: z.string(),
  weight: z.number(),
  bodyFat: z.number(),
  leanMass: z.number(),
  height: z.number().optional(),
});

// Physical test result schema
export const testResultSchema = z.object({
  date: z.string(),
  testType: z.enum(['bench_press', 'squat', 'sprint_40m', 'yo_yo', 'bronco', 'vo2_max']),
  value: z.number(),
  unit: z.string(),
});

// Injury record schema
export const injurySchema = z.object({
  id: z.string(),
  date: z.string(),
  type: z.string(),
  severity: z.enum(['minor', 'moderate', 'major']),
  description: z.string(),
  recoveryDate: z.string().optional(),
  status: z.enum(['active', 'recovering', 'cleared']),
});

// Game statistics schema
export const gameStatsSchema = z.object({
  season: z.string(),
  matchesPlayed: z.number(),
  minutesPlayed: z.number(),
  tries: z.number(),
  tackles: z.number(),
  lineoutWins: z.number(),
  turnovers: z.number(),
  penalties: z.number(),
});

// Skills rating schema
export const skillsSchema = z.object({
  ballHandling: z.number().min(1).max(10),
  passing: z.number().min(1).max(10),
  kicking: z.number().min(1).max(10),
  lineoutThrowing: z.number().min(1).max(10),
  scrummaging: z.number().min(1).max(10),
  rucking: z.number().min(1).max(10),
  defense: z.number().min(1).max(10),
  communication: z.number().min(1).max(10),
});

// Medical data schemas
export const wellnessEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  sleep: z.number().min(0).max(10),
  fatigue: z.number().min(0).max(10),
  mood: z.number().min(0).max(10),
  stress: z.number().min(0).max(10),
  soreness: z.number().min(0).max(10),
  overallScore: z.number().min(0).max(10),
  notes: z.string().optional(),
});

export const trainingLoadSchema = z.object({
  id: z.string(),
  date: z.string(),
  sessionType: z.enum(['training', 'match', 'gym', 'recovery']),
  duration: z.number(), // minutes
  intensity: z.number().min(1).max(10),
  rpe: z.number().min(1).max(10), // Rate of Perceived Exertion
  load: z.number(), // duration * rpe
  notes: z.string().optional(),
});

export const medicalAssessmentSchema = z.object({
  id: z.string(),
  date: z.string(),
  assessmentType: z.enum(['screening', 'injury', 'return_to_play', 'routine']),
  fmsScore: z.number().optional(),
  shoulderFlexibility: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
  ankleStability: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
  coreStability: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
  assessor: z.string(),
  findings: z.string(),
  recommendations: z.string(),
  nextAssessment: z.string().optional(),
});

export const medicalAppointmentSchema = z.object({
  id: z.string(),
  date: z.string(),
  time: z.string(),
  type: z.enum(['checkup', 'treatment', 'assessment', 'consultation']),
  provider: z.string(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled']),
  notes: z.string().optional(),
  followUp: z.string().optional(),
});

export const rehabProgramSchema = z.object({
  id: z.string(),
  injuryId: z.string(),
  phase: z.number(),
  phaseDescription: z.string(),
  startDate: z.string(),
  estimatedEndDate: z.string().optional(),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.number().optional(),
    reps: z.number().optional(),
    duration: z.string().optional(),
    frequency: z.string(),
    intensity: z.string().optional(),
  })),
  progressCriteria: z.array(z.string()),
  isCompleted: z.boolean(),
});

// Report schema
export const reportSchema = z.object({
  id: z.string(),
  type: z.enum(['coach', 'medical', 'strength_conditioning', 'recruitment']),
  title: z.string(),
  content: z.string(),
  author: z.string(),
  date: z.string(),
  lastUpdated: z.string(),
});

// Activity log schema
export const activitySchema = z.object({
  id: z.string(),
  date: z.string(),
  type: z.enum(['training', 'match', 'test', 'medical', 'meeting']),
  description: z.string(),
  details: z.string().optional(),
});

// Advanced metrics schema
export const advancedMetricsSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  date: z.string(),
  matchId: z.string().optional(),
  metrics: z.object({
    // Physical metrics
    distanceCovered: z.number(),
    topSpeed: z.number(),
    sprintCount: z.number(),
    averageHeartRate: z.number(),
    maxHeartRate: z.number(),
    caloriesBurned: z.number(),
    // Rugby specific metrics
    rucks: z.number(),
    mauls: z.number(),
    scrums: z.number(),
    lineouts: z.number(),
    possessionTime: z.number(),
    territoryGained: z.number(),
    // Performance ratings
    workRate: z.number(),
    discipline: z.number(),
    communication: z.number(),
    leadership: z.number(),
  }),
  heatMap: z.array(z.object({
    x: z.number(),
    y: z.number(),
    intensity: z.number(),
  })),
  recordedBy: z.string(),
  device: z.string().optional(),
});

// Training program schema
export const trainingProgramSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  duration: z.number(), // weeks
  phase: z.enum(['preseason', 'inseason', 'offseason', 'recovery']),
  focusAreas: z.array(z.enum(['strength', 'endurance', 'speed', 'agility', 'skills', 'recovery'])),
  sessions: z.array(z.object({
    id: z.string(),
    day: z.number(),
    week: z.number(),
    type: z.enum(['strength', 'conditioning', 'skills', 'tactical', 'recovery']),
    duration: z.number(), // minutes
    intensity: z.enum(['low', 'medium', 'high', 'max']),
    exercises: z.array(z.object({
      name: z.string(),
      sets: z.number().optional(),
      reps: z.number().optional(),
      duration: z.number().optional(),
      weight: z.number().optional(),
      notes: z.string().optional(),
    })),
    notes: z.string().optional(),
  })),
  assignedPlayers: z.array(z.string()),
  createdBy: z.string(),
  createdAt: z.string(),
});

// Injury tracking schema
export const injuryTrackingSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  type: z.enum(['acute', 'chronic', 'overuse']),
  severity: z.enum(['minor', 'moderate', 'severe', 'critical']),
  bodyPart: z.string(),
  specificArea: z.string(),
  mechanism: z.string(),
  dateOccurred: z.string(),
  dateReported: z.string(),
  expectedReturn: z.string().optional(),
  actualReturn: z.string().optional(),
  status: z.enum(['active', 'recovering', 'resolved', 'chronic']),
  treatmentPlan: z.array(z.object({
    date: z.string(),
    treatment: z.string(),
    provider: z.string(),
    notes: z.string(),
    progress: z.enum(['excellent', 'good', 'fair', 'poor']),
  })),
  restrictions: z.array(z.string()),
  riskFactors: z.array(z.string()),
  preventionNotes: z.string().optional(),
  medicalStaff: z.string(),
  lastUpdated: z.string(),
});

// Team communication schema
export const communicationSchema = z.object({
  id: z.string(),
  type: z.enum(['announcement', 'message', 'alert', 'reminder']),
  title: z.string(),
  content: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  recipients: z.array(z.string()), // player IDs or 'all'
  sender: z.string(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
  })).optional(),
  readBy: z.array(z.object({
    playerId: z.string(),
    readAt: z.string(),
  })),
  createdAt: z.string(),
  scheduledFor: z.string().optional(),
});

// StatSports GPS data schema
export const gpsDataSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  sessionId: z.string(),
  sessionType: z.enum(['training', 'match', 'conditioning', 'recovery']),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.number(), // minutes
  
  // Movement metrics
  totalDistance: z.number(), // meters
  totalDistanceZones: z.object({
    walking: z.number(), // 0-6 km/h
    jogging: z.number(), // 6-12 km/h
    running: z.number(), // 12-18 km/h
    highSpeed: z.number(), // 18-24 km/h
    sprinting: z.number() // 24+ km/h
  }),
  
  // Speed metrics
  maxSpeed: z.number(), // km/h
  averageSpeed: z.number(), // km/h
  sprintCount: z.number(),
  sprintDistance: z.number(),
  
  // Acceleration/Deceleration
  accelerations: z.object({
    low: z.number(), // 2-3 m/s²
    medium: z.number(), // 3-4 m/s²
    high: z.number() // 4+ m/s²
  }),
  decelerations: z.object({
    low: z.number(), // -2 to -3 m/s²
    medium: z.number(), // -3 to -4 m/s²
    high: z.number() // -4+ m/s²
  }),
  
  // Load metrics
  playerLoad: z.number(),
  playerLoadPerMinute: z.number(),
  
  // Heart rate data (if available)
  heartRate: z.object({
    average: z.number().optional(),
    maximum: z.number().optional(),
    zones: z.object({
      zone1: z.number().optional(), // 50-60% max HR
      zone2: z.number().optional(), // 60-70% max HR  
      zone3: z.number().optional(), // 70-80% max HR
      zone4: z.number().optional(), // 80-90% max HR
      zone5: z.number().optional()  // 90-100% max HR
    }).optional()
  }).optional(),
  
  // Impact/Contact metrics
  impacts: z.object({
    total: z.number(),
    light: z.number(), // 5-8G
    moderate: z.number(), // 8-10G
    heavy: z.number() // 10+ G
  }).optional(),
  
  // Recovery metrics
  recovery: z.object({
    restTime: z.number(), // minutes in low activity
    workToRestRatio: z.number()
  }).optional(),
  
  // Match-specific metrics (if session is a match)
  matchMetrics: z.object({
    ballInPlayTime: z.number().optional(),
    setPhaseDistance: z.number().optional(),
    openPlayDistance: z.number().optional(),
    scrumsAttended: z.number().optional(),
    lineoutsAttended: z.number().optional(),
    rucksAttended: z.number().optional()
  }).optional(),
  
  // Quality scores
  qualityScores: z.object({
    dataQuality: z.number(), // 0-100%
    signalStrength: z.number(), // 0-100%
    satelliteCount: z.number().optional()
  }).optional(),
  
  createdAt: z.string(),
  updatedAt: z.string()
});

// Head Injury & Concussion Management Schema (HeadGuard Pro)
export const headInjuryIncidentSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  dateTime: z.string(), // ISO timestamp
  context: z.enum(['game', 'training']),
  contextDetails: z.string().optional(), // drill type, opponent, etc.
  mechanismOfInjury: z.enum([
    'head_to_ground',
    'head_to_shoulder', 
    'head_to_head',
    'head_to_knee',
    'whiplash',
    'unknown',
    'other'
  ]),
  mechanismDescription: z.string().optional(),
  immediateSymptoms: z.object({
    lossOfConsciousness: z.boolean(),
    seizure: z.boolean(),
    confusion: z.boolean(),
    unsteadiness: z.boolean(),
    dizziness: z.boolean(),
    nausea: z.boolean(),
    headache: z.boolean(),
    visualDisturbance: z.boolean()
  }),
  initialAction: z.object({
    removedFromPlay: z.boolean(),
    hiaAdministered: z.boolean(),
    immediateAssessment: z.boolean(),
    hospitalReferral: z.boolean()
  }),
  reportedBy: z.string(), // medical staff ID
  createdAt: z.string(),
  updatedAt: z.string()
});

export const concussionAssessmentSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  incidentId: z.string().optional(), // link to incident if applicable
  assessmentType: z.enum(['baseline', 'hia', 'scat6', 'scat5', 'bess', 'daily_symptoms']),
  assessmentDate: z.string(),
  assessor: z.string(), // medical staff ID
  
  // HIA specific fields
  maddocksQuestions: z.object({
    whatGroundAreWeAt: z.boolean(),
    whichHalfIsIt: z.boolean(),
    whoScoredLast: z.boolean(),
    whatDidYouPlayLastWeek: z.boolean(),
    didYourTeamWinLastGame: z.boolean(),
    totalCorrect: z.number().min(0).max(5)
  }).optional(),
  
  // SCAT specific fields
  scatSymptomSeverity: z.object({
    symptomCount: z.number(),
    severityScore: z.number(),
    maxSeverity: z.number()
  }).optional(),
  
  scatCognitive: z.object({
    orientation: z.number(),
    immediateMemory: z.number(),
    concentration: z.number(),
    delayedRecall: z.number(),
    totalScore: z.number()
  }).optional(),
  
  // BESS specific fields
  bessBalance: z.object({
    doubleStance: z.number(), // error count
    singleStance: z.number(),
    tandemStance: z.number(),
    totalErrors: z.number()
  }).optional(),
  
  // Daily symptom tracking
  dailySymptoms: z.object({
    symptoms: z.record(z.number()), // symptom -> severity (0-6)
    totalScore: z.number(),
    symptomFree: z.boolean()
  }).optional(),
  
  // Overall assessment outcome
  outcome: z.enum(['pass', 'fail', 'refer', 'monitoring']),
  comparedToBaseline: z.object({
    withinNormalRange: z.boolean(),
    significantDifference: z.boolean(),
    percentageChange: z.number()
  }).optional(),
  
  notes: z.string().optional(),
  recommendations: z.string().optional(),
  nextAssessmentDate: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const rtpProtocolSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  incidentId: z.string(),
  currentStage: z.enum(['stage_1', 'stage_2', 'stage_3', 'stage_4', 'stage_5', 'stage_6', 'cleared']),
  stageStartDate: z.string(),
  
  // Stage progression history
  stageHistory: z.array(z.object({
    stage: z.enum(['stage_1', 'stage_2', 'stage_3', 'stage_4', 'stage_5', 'stage_6']),
    startDate: z.string(),
    endDate: z.string().optional(),
    duration: z.number().optional(), // hours
    successful: z.boolean(),
    notes: z.string().optional(),
    supervisionBy: z.string() // medical staff ID
  })),
  
  // Current stage requirements
  minimumDuration: z.number(), // hours required for current stage
  symptomFreeRequired: z.boolean(),
  lastSymptomCheck: z.string().optional(),
  
  // Progression controls
  autoProgressionEnabled: z.boolean().default(true),
  manualOverride: z.object({
    enabled: z.boolean(),
    reason: z.string(),
    authorizedBy: z.string(),
    timestamp: z.string()
  }).optional(),
  
  // Alerts and flags
  alerts: z.array(z.object({
    type: z.enum(['protocol_violation', 'prolonged_recovery', 'symptom_return', 'high_risk']),
    message: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    timestamp: z.string(),
    acknowledged: z.boolean().default(false)
  })),
  
  // Final clearance
  finalClearance: z.object({
    cleared: z.boolean(),
    clearanceDate: z.string(),
    clearedBy: z.string(), // must be team doctor
    clearanceNotes: z.string(),
    returnToPlayDate: z.string()
  }).optional(),
  
  createdAt: z.string(),
  updatedAt: z.string()
});

export const headInjuryPlayerSummarySchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  position: z.string(),
  
  // Current status
  currentStatus: z.enum(['available', 'rtp_protocol', 'medical_hold', 'cleared_pending']),
  currentRtpStage: z.string().optional(),
  daysSinceIncident: z.number().optional(),
  
  // Risk factors
  riskLevel: z.enum(['low', 'moderate', 'high', 'critical']),
  totalConcussions: z.number(),
  concussionsLast24Months: z.number(),
  longestRecoveryDays: z.number(),
  
  // Recent activity
  lastIncidentDate: z.string().optional(),
  lastAssessmentDate: z.string().optional(),
  nextAssessmentDue: z.string().optional(),
  
  // Alerts
  activeAlerts: z.array(z.string()),
  flaggedForReview: z.boolean().default(false)
});

// Video analysis schema
export const videoAnalysisSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  videoUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  duration: z.number(), // in seconds
  matchDate: z.string(),
  opponent: z.string().optional(),
  analysisType: z.enum(['highlight', 'full_match', 'training', 'skill_focus', 'tactical_analysis']),
  tags: z.array(z.string()),
  keyMoments: z.array(z.object({
    timestamp: z.number(), // seconds from start
    title: z.string(),
    description: z.string(),
    category: z.enum(['try', 'tackle', 'lineout', 'scrum', 'turnover', 'kick', 'skill', 'error']),
  })),
  metrics: z.object({
    tackles: z.number().optional(),
    carries: z.number().optional(),
    metersGained: z.number().optional(),
    turnovers: z.number().optional(),
    passesCompleted: z.number().optional(),
    lineoutSuccess: z.number().optional(),
  }).optional(),
  coachNotes: z.string().optional(),
  isHighlight: z.boolean().default(false),
  uploadedBy: z.string(),
  uploadedAt: z.string(),
});

// Main player schema
export const playerSchema = z.object({
  id: z.string(),
  personalDetails: z.object({
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    emergencyContact: z.object({
      name: z.string(),
      relationship: z.string(),
      phone: z.string(),
    }),
  }),
  rugbyProfile: z.object({
    jerseyNumber: z.number(),
    primaryPosition: z.string(),
    secondaryPositions: z.array(z.string()),
    playingLevel: z.string(),
    yearsInTeam: z.number(),
    previousClubs: z.array(z.string()),
  }),
  physicalAttributes: z.array(physicalAttributeSchema),
  testResults: z.array(testResultSchema),
  skills: skillsSchema,
  gameStats: z.array(gameStatsSchema),
  injuries: z.array(injurySchema),
  reports: z.array(reportSchema),
  activities: z.array(activitySchema),
  videoAnalysis: z.array(videoAnalysisSchema),
  status: z.object({
    fitness: z.enum(['available', 'injured', 'recovering', 'unavailable']),
    medical: z.enum(['cleared', 'under_review', 'restricted']),
  }),
  aiRating: z.object({
    overall: z.number(),
    physicality: z.number(),
    skillset: z.number(),
    gameImpact: z.number(),
    potential: z.number(),
    lastUpdated: z.string(),
  }).optional(),
});

// Positional benchmarks schema
export const benchmarkSchema = z.object({
  position: z.string(),
  benchmarks: z.object({
    bench_press: z.number(),
    squat: z.number(),
    sprint_40m: z.number(),
    yo_yo: z.number(),
    vo2_max: z.number(),
  }),
});

export type PlayerZodType = z.infer<typeof playerSchema>;
export type PhysicalAttribute = z.infer<typeof physicalAttributeSchema>;
export type TestResult = z.infer<typeof testResultSchema>;
export type Injury = z.infer<typeof injurySchema>;
export type GameStats = z.infer<typeof gameStatsSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type Report = z.infer<typeof reportSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type VideoAnalysis = z.infer<typeof videoAnalysisSchema>;
export type HeadInjuryIncident = z.infer<typeof headInjuryIncidentSchema>;
export type ConcussionAssessment = z.infer<typeof concussionAssessmentSchema>;
export type RTPProtocol = z.infer<typeof rtpProtocolSchema>;
export type HeadInjuryPlayerSummary = z.infer<typeof headInjuryPlayerSummarySchema>;
export type Benchmark = z.infer<typeof benchmarkSchema>;
export type AdvancedMetrics = z.infer<typeof advancedMetricsSchema>;
export type TrainingProgram = z.infer<typeof trainingProgramSchema>;
export type InjuryTracking = z.infer<typeof injuryTrackingSchema>;
export type Communication = z.infer<typeof communicationSchema>;
export type GPSData = z.infer<typeof gpsDataSchema>;

// Match Performance Schemas
export const matchPerformanceSchema = z.object({
  id: z.string(),
  matchId: z.string(),
  playerId: z.string(),
  date: z.string(),
  opponent: z.string(),
  venue: z.string(),
  result: z.string(),
  
  // Attack Metrics
  carries: z.number().default(0),
  metresCarried: z.number().default(0),
  metresGained: z.number().default(0),
  linebreaks: z.number().default(0),
  gainlineMadePercent: z.number().default(0),
  kicksMetres: z.number().default(0),
  turnoversGiven: z.number().default(0),
  
  // Defence Metrics
  tacklesMade: z.number().default(0),
  tacklesMissed: z.number().default(0),
  madeTacklePercent: z.number().default(0),
  
  // Infringements
  penaltiesConceded: z.number().default(0),
  freeKicksConceded: z.number().default(0),
  
  // Breakdown
  rucks: z.number().default(0),
  quickBallPercent: z.number().default(0),
  breakdownSteals: z.number().default(0),
  
  // Set Piece
  scrumWonPercent: z.number().default(0),
  lineoutWonPercent: z.number().default(0),
  lineoutSteals: z.number().default(0),
  
  // Possession & Territory
  possessionPercent: z.number().default(0),
  territoryPercent: z.number().default(0),
  attackingMinutes: z.number().default(0),
  ballInPlayMinutes: z.number().default(0),
  
  // Carry Analysis
  carriesOverGainlinePercent: z.number().default(0),
  carriesOnGainlinePercent: z.number().default(0),
  carriesBehindGainlinePercent: z.number().default(0),
  carryEfficiencyPercent: z.number().default(0),
  
  // Opposition Carry Analysis
  oppCarriesOverGainlinePercent: z.number().default(0),
  oppCarriesOnGainlinePercent: z.number().default(0),
  oppCarriesBehindGainlinePercent: z.number().default(0),
  
  // Ruck Analysis
  ruckRetentionPercent: z.number().default(0),
  ruckSpeed0to3SecsPercent: z.number().default(0),
  ruckSpeed3to6SecsPercent: z.number().default(0),
  ruckSpeedOver6SecsPercent: z.number().default(0),
  oppRuckSpeed0to3SecsPercent: z.number().default(0),
  oppRuckSpeed3to6SecsPercent: z.number().default(0),
  oppRuckSpeedOver6SecsPercent: z.number().default(0),
  
  // Scoring
  triesScored: z.number().default(0),
  pointsScored: z.number().default(0),
  ballCarryMetres: z.number().default(0),
  linebreaks1stPhase: z.number().default(0),
  defendersBeaten: z.number().default(0),
  offloads: z.number().default(0),
  
  // Kicking
  kicksInPlay: z.number().default(0),
  kickingMetres: z.number().default(0),
  goalKicking: z.string().default("0/0"),
  carrying22mExitPercent: z.number().default(0),
  kicking22mExitPercent: z.number().default(0),
  exit22mFailedPercent: z.number().default(0),
  
  // Scrum Detail
  ownScrumWonPercent: z.number().default(0),
  ownScrumCompletionPercent: z.number().default(0),
  totalScrums: z.number().default(0),
  scrumCompletionPercent: z.number().default(0),
  
  // Individual Contributions
  ruckArrivals: z.number().default(0),
  ruckFirst3: z.number().default(0),
  cleanouts: z.number().default(0),
  tacklesAttempted: z.number().default(0),
  assistTackles: z.number().default(0),
  dominantTackles: z.number().default(0),
  lineBreaksConceded: z.number().default(0),
  offloadsConceded: z.number().default(0),
  carryMetresConceded: z.number().default(0),
  tackleBreaksConceded: z.number().default(0),
  
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const matchSummarySchema = z.object({
  id: z.string(),
  date: z.string(),
  opponent: z.string(),
  venue: z.string(),
  result: z.string(),
  finalScore: z.string(),
  competition: z.string(),
  
  // Team Totals
  teamPossessionPercent: z.number().default(0),
  teamTerritoryPercent: z.number().default(0),
  teamAttackingMinutes: z.number().default(0),
  teamBallInPlayMinutes: z.number().default(0),
  teamCarryEfficiencyPercent: z.number().default(0),
  teamRuckRetentionPercent: z.number().default(0),
  teamTackleSuccessPercent: z.number().default(0),
  teamLinebreaks: z.number().default(0),
  teamTries: z.number().default(0),
  teamPoints: z.number().default(0),
  
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type MatchPerformanceZod = z.infer<typeof matchPerformanceSchema>;
export type MatchSummaryZod = z.infer<typeof matchSummarySchema>;

// Database Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  role: text("role", { enum: ["head_coach", "assistant_coach", "strength_coach", "medical_staff", "physiotherapist", "team_manager", "analyst", "admin", "player"] }).notNull().default("assistant_coach"),
  department: text("department"),
  permissions: text("permissions").array().default([]),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  personalDetails: jsonb("personal_details").notNull().$type<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    phone: string;
    address: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  }>(),
  rugbyProfile: jsonb("rugby_profile").notNull().$type<{
    jerseyNumber: number;
    primaryPosition: string;
    secondaryPositions: string[];
    playingLevel: string;
    yearsInTeam: number;
    previousClubs: string[];
  }>(),
  physicalAttributes: jsonb("physical_attributes").notNull().$type<Array<{
    date: string;
    weight: number;
    bodyFat: number;
    leanMass: number;
    height?: number;
  }>>(),
  testResults: jsonb("test_results").notNull().$type<Array<{
    date: string;
    testType: string;
    value: number;
    unit: string;
  }>>(),
  skills: jsonb("skills").notNull().$type<{
    ballHandling: number;
    passing: number;
    kicking: number;
    lineoutThrowing: number;
    scrummaging: number;
    rucking: number;
    defense: number;
    communication: number;
  }>(),
  gameStats: jsonb("game_stats").notNull().$type<Array<{
    season: string;
    matchesPlayed: number;
    minutesPlayed: number;
    tries: number;
    tackles: number;
    lineoutWins: number;
    turnovers: number;
    penalties: number;
  }>>(),
  // MoneyBall Contributions Data (from CSV analysis)
  contributionsData: jsonb("contributions_data").$type<{
    totalContributions: number;
    avgContributions: number;
    positiveContributions: number;
    positivePercent: number;
    negativeContributions: number;
    workEfficiencyIndex: number;
    weiPercent: number;
    playerWorkRate: number;
    xFactorContributions: number;
    xFactorPercent: number;
    penaltyPercent: number;
    // Detailed performance breakdowns
    totalCarries: number;
    dominantCarryPercent: number;
    tackleCompletionPercent: number;
    breakdownSuccessPercent: number;
    completedPasses: number;
    passAccuracy: number;
    lineoutThrowingSuccess?: number;
    tryAssists: number;
    turnoversWon: number;
    metersGained?: number;
    linebreaks?: number;
    offloads?: number;
  }>(),
  // Cohesion & Team Impact Metrics
  cohesionMetrics: jsonb("cohesion_metrics").$type<{
    cohesionScore: number; // Calculated team cohesion impact
    attendanceScore: number; // 0-10 scale
    scScore: number; // Strength & Conditioning commitment (0-10)
    medicalScore: number; // Robustness/availability (0-10)
    personalityScore: number; // Leadership, team-fit, communication (0-10)
    availabilityPercentage: number; // % of training/games available
    leadershipRating: number; // 1-10 scale
    teamFitRating: number; // 1-10 scale
    communicationRating: number; // 1-10 scale
  }>(),
  // Contract & Financial Information
  contractInfo: jsonb("contract_info").$type<{
    dateSigned: string;
    offContractDate: string;
    contractValue: number; // USD
    club: string; // Local club affiliation
    teamHistory: Array<{
      season: string;
      teamName: string;
      competition: string;
      gamesPlayed: number;
      minutesPlayed: number;
      triesScored: number;
      pointsScored: number;
    }>;
  }>(),
  // Character & Intangibles
  characterProfile: jsonb("character_profile").$type<{
    gritNote: string; // Stories of overcoming adversity
    communityNote: string; // Community involvement and "why"
    familyBackground: string; // Background context
    mentalToughness: number; // 1-10 scale
    workEthic: number; // 1-10 scale
    coachability: number; // 1-10 scale
  }>(),
  // Physical Performance Metrics
  physicalPerformance: jsonb("physical_performance").$type<{
    sprintTime10m?: number; // seconds
    sprintTime40m?: number; // seconds
    benchPress?: number; // kg
    squat?: number; // kg
    deadlift?: number; // kg
    verticalJump?: number; // cm
    beepTest?: number; // level
    injuryHistory: Array<{
      date: string;
      injury: string;
      daysOut: number;
      recurring: boolean;
    }>;
    injuryRiskIndex: 'Low' | 'Medium' | 'High';
    daysInjuredThisSeason: number;
  }>(),
  injuries: jsonb("injuries").notNull().$type<Array<{
    id: string;
    date: string;
    type: string;
    severity: string;
    description: string;
    recoveryDate?: string;
    status: string;
  }>>(),
  reports: jsonb("reports").notNull().$type<Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    author: string;
    date: string;
    lastUpdated: string;
  }>>(),
  activities: jsonb("activities").notNull().$type<Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    details?: string;
  }>>(),
  videoAnalysis: jsonb("video_analysis").default('[]').$type<Array<{
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    matchDate: string;
    opponent?: string;
    analysisType: string;
    tags: string[];
    keyMoments: Array<{
      timestamp: number;
      title: string;
      description: string;
      category: string;
    }>;
    metrics?: {
      tackles?: number;
      carries?: number;
      metersGained?: number;
      turnovers?: number;
      passesCompleted?: number;
      lineoutSuccess?: number;
    };
    coachNotes?: string;
    isHighlight: boolean;
    uploadedBy: string;
    uploadedAt: string;
  }>>(),
  status: jsonb("status").notNull().$type<{
    fitness: string;
    medical: string;
  }>(),
  aiRating: jsonb("ai_rating").$type<{
    overall: number;
    physicality: number;
    skillset: number;
    gameImpact: number;
    potential: number;
    lastUpdated: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const matchPerformances = pgTable("match_performances", {
  id: text("id").primaryKey(),
  matchId: text("match_id").notNull(),
  playerId: text("player_id").notNull().references(() => players.id),
  date: text("date").notNull(),
  opponent: text("opponent").notNull(),
  venue: text("venue").notNull(),
  result: text("result").notNull(),
  
  // Attack Metrics
  carries: integer("carries").default(0),
  metresCarried: integer("metres_carried").default(0),
  metresGained: integer("metres_gained").default(0),
  linebreaks: integer("linebreaks").default(0),
  gainlineMadePercent: real("gainline_made_percent").default(0),
  kicksMetres: integer("kicks_metres").default(0),
  turnoversGiven: integer("turnovers_given").default(0),
  
  // Defence Metrics
  tacklesMade: integer("tackles_made").default(0),
  tacklesMissed: integer("tackles_missed").default(0),
  madeTacklePercent: real("made_tackle_percent").default(0),
  
  // Infringements
  penaltiesConceded: integer("penalties_conceded").default(0),
  freeKicksConceded: integer("free_kicks_conceded").default(0),
  
  // Breakdown
  rucks: integer("rucks").default(0),
  quickBallPercent: real("quick_ball_percent").default(0),
  breakdownSteals: integer("breakdown_steals").default(0),
  
  // Set Piece
  scrumWonPercent: real("scrum_won_percent").default(0),
  lineoutWonPercent: real("lineout_won_percent").default(0),
  lineoutSteals: integer("lineout_steals").default(0),
  
  // Possession & Territory
  possessionPercent: real("possession_percent").default(0),
  territoryPercent: real("territory_percent").default(0),
  attackingMinutes: real("attacking_minutes").default(0),
  ballInPlayMinutes: real("ball_in_play_minutes").default(0),
  
  // Carry Analysis
  carriesOverGainlinePercent: real("carries_over_gainline_percent").default(0),
  carriesOnGainlinePercent: real("carries_on_gainline_percent").default(0),
  carriesBehindGainlinePercent: real("carries_behind_gainline_percent").default(0),
  carryEfficiencyPercent: real("carry_efficiency_percent").default(0),
  
  // Opposition Carry Analysis
  oppCarriesOverGainlinePercent: real("opp_carries_over_gainline_percent").default(0),
  oppCarriesOnGainlinePercent: real("opp_carries_on_gainline_percent").default(0),
  oppCarriesBehindGainlinePercent: real("opp_carries_behind_gainline_percent").default(0),
  
  // Ruck Analysis
  ruckRetentionPercent: real("ruck_retention_percent").default(0),
  ruckSpeed0to3SecsPercent: real("ruck_speed_0_to_3_secs_percent").default(0),
  ruckSpeed3to6SecsPercent: real("ruck_speed_3_to_6_secs_percent").default(0),
  ruckSpeedOver6SecsPercent: real("ruck_speed_over_6_secs_percent").default(0),
  oppRuckSpeed0to3SecsPercent: real("opp_ruck_speed_0_to_3_secs_percent").default(0),
  oppRuckSpeed3to6SecsPercent: real("opp_ruck_speed_3_to_6_secs_percent").default(0),
  oppRuckSpeedOver6SecsPercent: real("opp_ruck_speed_over_6_secs_percent").default(0),
  
  // Scoring
  triesScored: integer("tries_scored").default(0),
  pointsScored: integer("points_scored").default(0),
  ballCarryMetres: integer("ball_carry_metres").default(0),
  linebreaks1stPhase: integer("linebreaks_1st_phase").default(0),
  defendersBeaten: integer("defenders_beaten").default(0),
  offloads: integer("offloads").default(0),
  
  // Kicking
  kicksInPlay: integer("kicks_in_play").default(0),
  kickingMetres: integer("kicking_metres").default(0),
  goalKicking: text("goal_kicking").default("0/0"),
  carrying22mExitPercent: real("carrying_22m_exit_percent").default(0),
  kicking22mExitPercent: real("kicking_22m_exit_percent").default(0),
  exit22mFailedPercent: real("exit_22m_failed_percent").default(0),
  
  // Scrum Detail
  ownScrumWonPercent: real("own_scrum_won_percent").default(0),
  ownScrumCompletionPercent: real("own_scrum_completion_percent").default(0),
  totalScrums: integer("total_scrums").default(0),
  scrumCompletionPercent: real("scrum_completion_percent").default(0),
  
  // Individual Contributions
  ruckArrivals: integer("ruck_arrivals").default(0),
  ruckFirst3: integer("ruck_first_3").default(0),
  cleanouts: integer("cleanouts").default(0),
  tacklesAttempted: integer("tackles_attempted").default(0),
  assistTackles: integer("assist_tackles").default(0),
  dominantTackles: integer("dominant_tackles").default(0),
  lineBreaksConceded: integer("line_breaks_conceded").default(0),
  offloadsConceded: integer("offloads_conceded").default(0),
  carryMetresConceded: integer("carry_metres_conceded").default(0),
  tackleBreaksConceded: integer("tackle_breaks_conceded").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const matchSummaries = pgTable("match_summaries", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  opponent: text("opponent").notNull(),
  venue: text("venue").notNull(),
  result: text("result").notNull(),
  finalScore: text("final_score").notNull(),
  competition: text("competition").notNull(),
  
  // Team Totals
  teamPossessionPercent: real("team_possession_percent").default(0),
  teamTerritoryPercent: real("team_territory_percent").default(0),
  teamAttackingMinutes: real("team_attacking_minutes").default(0),
  teamBallInPlayMinutes: real("team_ball_in_play_minutes").default(0),
  teamCarryEfficiencyPercent: real("team_carry_efficiency_percent").default(0),
  teamRuckRetentionPercent: real("team_ruck_retention_percent").default(0),
  teamTackleSuccessPercent: real("team_tackle_success_percent").default(0),
  teamLinebreaks: integer("team_linebreaks").default(0),
  teamTries: integer("team_tries").default(0),
  teamPoints: integer("team_points").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  // Future: user-player assignments, reports, etc.
}));

export const playersRelations = relations(players, ({ many }) => ({
  matchPerformances: many(matchPerformances),
}));

export const matchPerformancesRelations = relations(matchPerformances, ({ one }) => ({
  player: one(players, { fields: [matchPerformances.playerId], references: [players.id] }),
  matchSummary: one(matchSummaries, { fields: [matchPerformances.matchId], references: [matchSummaries.id] }),
}));

export const matchSummariesRelations = relations(matchSummaries, ({ many }) => ({
  performances: many(matchPerformances),
}));

// Database types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;
export type MatchPerformance = typeof matchPerformances.$inferSelect;
export type InsertMatchPerformance = typeof matchPerformances.$inferInsert;
export type MatchSummary = typeof matchSummaries.$inferSelect;
export type InsertMatchSummary = typeof matchSummaries.$inferInsert;

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertPlayerSchema = createInsertSchema(players);
export const insertMatchPerformanceSchema = createInsertSchema(matchPerformances);
export const insertMatchSummarySchema = createInsertSchema(matchSummaries);

// Legacy Zod schemas for backwards compatibility  
export type PlayerZod = z.infer<typeof playerSchema>;
export type InsertPlayerZod = z.infer<typeof insertPlayerSchema>;

// Try Analysis Database Tables
export const matchTryData = pgTable("match_try_data", {
  id: serial("id").primaryKey(),
  matchId: text("match_id").notNull(),
  teamName: text("team_name").notNull(),
  isNorthHarbour: boolean("is_north_harbour").notNull(),
  analysisPerspective: text("analysis_perspective").notNull(), // 'attacking' or 'defensive'
  tries: jsonb("tries").notNull().$type<Array<{
    id: string;
    x: number;
    y: number;
    type: string;
    team: 'home' | 'away';
    zone: 'attacking_22' | 'attacking_22m_halfway' | 'defending_22m_halfway' | 'defending_22';
    quarter: 1 | 2 | 3 | 4;
    phase: 'phase_1' | 'phase_2_3' | 'phase_4_6' | 'phase_7_plus';
  }>>(),
  zoneBreakdown: jsonb("zone_breakdown").notNull().$type<Array<{
    name: string;
    value: number;
    percentage: number;
  }>>(),
  quarterBreakdown: jsonb("quarter_breakdown").notNull().$type<Array<{
    name: string;
    value: number;
    percentage: number;
  }>>(),
  phaseBreakdown: jsonb("phase_breakdown").notNull().$type<Array<{
    name: string;
    value: number;
    percentage: number;
  }>>(),
  sourceBreakdown: jsonb("source_breakdown").notNull().$type<Array<{
    name: string;
    value: number;
    percentage: number;
  }>>(),
  aiAnalysis: text("ai_analysis"),
  savedAt: timestamp("saved_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Season Analysis Summary for aggregated data
export const seasonAnalysis = pgTable("season_analysis", {
  id: serial("id").primaryKey(),
  season: text("season").notNull(),
  teamName: text("team_name").notNull(),
  totalMatches: integer("total_matches").default(0),
  totalTries: integer("total_tries").default(0),
  aggregatedZones: jsonb("aggregated_zones").notNull().$type<Array<{
    name: string;
    value: number;
    percentage: number;
  }>>(),
  aggregatedQuarters: jsonb("aggregated_quarters").notNull().$type<Array<{
    name: string;
    value: number;
    percentage: number;
  }>>(),
  aggregatedPhases: jsonb("aggregated_phases").notNull().$type<Array<{
    name: string;
    value: number;
    percentage: number;
  }>>(),
  aggregatedSources: jsonb("aggregated_sources").notNull().$type<Array<{
    name: string;
    value: number;
    percentage: number;
  }>>(),
  seasonAiAnalysis: text("season_ai_analysis"),
  lastUpdated: timestamp("last_updated").defaultNow()
});

export type MatchTryData = typeof matchTryData.$inferSelect;
export type InsertMatchTryData = typeof matchTryData.$inferInsert;
export type SeasonAnalysis = typeof seasonAnalysis.$inferSelect;
export type InsertSeasonAnalysis = typeof seasonAnalysis.$inferInsert;

// Squad Builder Tables - Updated to match Google Cloud schema
export const squads = pgTable("squads", {
  id: serial("id").primaryKey(),
  name: text("name"),
  matchDate: text("matchDate"),  // date type in DB but text in schema for compatibility
  opponent: text("opponent"),
  venue: text("venue"),
  startingXV: jsonb("startingXV").$type<string[]>(), // Array of player IDs
  bench: jsonb("bench").$type<string[]>(), // Array of player IDs
  unavailablePlayers: jsonb("unavailablePlayers").$type<string[]>(), // Array of player IDs
  notes: text("notes"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

export type Squad = typeof squads.$inferSelect;
export type InsertSquad = typeof squads.$inferInsert;

// ===== S&C PORTAL: NEW TABLES =====

// Enhanced GPS Data Table for S&C Portal
export const gpsData = pgTable("gps_data", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull().references(() => players.id),
  sessionId: text("session_id").notNull(), // Links to training session
  sessionType: text("session_type").notNull(), // 'training', 'match', 'recovery'
  date: text("date").notNull(),
  ballInPlayMinutes: real("ball_in_play_minutes").default(0),
  
  // Core GPS Metrics
  totalDistance: real("total_distance").default(0), // meters
  highSpeedRunning: real("high_speed_running").default(0), // meters above 20km/h
  hmlDistance: real("hml_distance").default(0), // High Metabolic Load distance
  hmlEffortsPerMin: real("hml_efforts_per_min").default(0),
  maxSpeed: real("max_speed").default(0), // km/h
  accelerations: integer("accelerations").default(0),
  decelerations: integer("decelerations").default(0),
  collisions: integer("collisions").default(0),
  
  // Additional Performance Metrics
  averageSpeed: real("average_speed").default(0),
  sprintCount: integer("sprint_count").default(0),
  playerLoad: real("player_load").default(0),
  dynamicStressLoad: real("dynamic_stress_load").default(0),
  
  // Data Quality Indicators
  gpsSignalStrength: real("gps_signal_strength").default(0), // percentage
  satelliteCount: integer("satellite_count").default(0),
  dataCompleteness: real("data_completeness").default(0), // percentage
  
  // Weather Context (for injury correlation)
  temperature: real("temperature"),
  humidity: real("humidity"),
  windSpeed: real("wind_speed"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Player Wellness Table
export const playerWellness = pgTable("player_wellness", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull().references(() => players.id),
  date: text("date").notNull(),
  
  // Wellness Components (1-5 scale)
  sleepQuality: integer("sleep_quality").notNull(), // 1-5
  muscleSoreness: integer("muscle_soreness").notNull(), // 1-5
  fatigueLevel: integer("fatigue_level").notNull(), // 1-5
  stressLevel: integer("stress_level").notNull(), // 1-5
  mood: integer("mood").notNull(), // 1-5
  
  // Calculated Readiness Score (derived from above)
  readinessScore: real("readiness_score"), // 0-100
  
  // Optional Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Player Load Targets Table
export const playerLoadTargets = pgTable("player_load_targets", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull().references(() => players.id),
  weekStarting: text("week_starting").notNull(), // ISO date string
  
  // Weekly HML Targets
  weeklyHmlTarget: real("weekly_hml_target").notNull(), // meters
  dailyHmlTarget: real("daily_hml_target").notNull(), // meters
  
  // Training Load Targets
  weeklyPlayerLoadTarget: real("weekly_player_load_target"),
  weeklyDistanceTarget: real("weekly_distance_target"),
  weeklyHsrTarget: real("weekly_hsr_target"), // High Speed Running
  
  // Position-specific targets
  positionMultiplier: real("position_multiplier").default(1.0),
  
  // Target rationale
  setBy: text("set_by").notNull(), // User who set the target
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Training Sessions Table
export const trainingSessions = pgTable("training_sessions", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  sessionType: text("session_type").notNull(), // 'team_training', 'skills', 'conditioning', 'recovery'
  duration: integer("duration").notNull(), // minutes
  intensity: text("intensity").notNull(), // 'low', 'moderate', 'high', 'very_high'
  
  // Session Details
  title: text("title").notNull(),
  description: text("description"),
  focusAreas: text("focus_areas").array().default([]), // ['fitness', 'skills', 'tactical']
  
  // Weather Conditions
  weather: jsonb("weather").$type<{
    temperature: number;
    humidity: number;
    windSpeed: number;
    conditions: string;
  }>(),
  
  // Session Outcomes
  ballInPlayTime: real("ball_in_play_time"), // total BIP minutes for session
  
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Injury Risk Flags Table
export const injuryRiskFlags = pgTable("injury_risk_flags", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull().references(() => players.id),
  flagType: text("flag_type").notNull(), // 'load_spike', 'wellness_drop', 'cumulative_fatigue'
  riskLevel: text("risk_level").notNull(), // 'low', 'moderate', 'high', 'critical'
  
  // Flag Details
  triggerValue: real("trigger_value"), // The value that triggered the flag
  threshold: real("threshold"), // The threshold that was exceeded
  description: text("description").notNull(),
  
  // Contextual Data
  dataSource: text("data_source").notNull(), // 'gps', 'wellness', 'manual'
  weeklyAverage: real("weekly_average"),
  rollingAverage: real("rolling_average"),
  
  // Flag Status
  status: text("status").default('active'), // 'active', 'acknowledged', 'resolved'
  acknowledgedBy: text("acknowledged_by"),
  acknowledgedAt: timestamp("acknowledged_at"),
  
  // Follow-up Actions
  recommendedActions: text("recommended_actions").array().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Load Analytics Summary Table (for quick dashboard queries)
export const loadAnalytics = pgTable("load_analytics", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull().references(() => players.id),
  weekStarting: text("week_starting").notNull(),
  
  // Weekly Totals
  totalDistance: real("total_distance").default(0),
  totalHmlDistance: real("total_hml_distance").default(0),
  totalPlayerLoad: real("total_player_load").default(0),
  totalHsr: real("total_hsr").default(0),
  
  // Targets vs Actual
  hmlTargetAchievement: real("hml_target_achievement").default(0), // percentage
  loadTargetAchievement: real("load_target_achievement").default(0),
  
  // Wellness Averages
  avgReadinessScore: real("avg_readiness_score"),
  avgSleepQuality: real("avg_sleep_quality"),
  avgFatigueLevel: real("avg_fatigue_level"),
  
  // Risk Indicators
  loadTrend: text("load_trend"), // 'increasing', 'stable', 'decreasing'
  riskScore: real("risk_score"), // 0-100
  
  // Injury Risk Factors
  hasActiveFlags: boolean("has_active_flags").default(false),
  flagCount: integer("flag_count").default(0),
  
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for new S&C tables
export const gpsDataRelations = relations(gpsData, ({ one }) => ({
  player: one(players, { fields: [gpsData.playerId], references: [players.id] }),
}));

export const playerWellnessRelations = relations(playerWellness, ({ one }) => ({
  player: one(players, { fields: [playerWellness.playerId], references: [players.id] }),
}));

export const playerLoadTargetsRelations = relations(playerLoadTargets, ({ one }) => ({
  player: one(players, { fields: [playerLoadTargets.playerId], references: [players.id] }),
}));

export const injuryRiskFlagsRelations = relations(injuryRiskFlags, ({ one }) => ({
  player: one(players, { fields: [injuryRiskFlags.playerId], references: [players.id] }),
}));

export const loadAnalyticsRelations = relations(loadAnalytics, ({ one }) => ({
  player: one(players, { fields: [loadAnalytics.playerId], references: [players.id] }),
}));

// Types for new S&C tables
export type GPSData = typeof gpsData.$inferSelect;
export type InsertGPSData = typeof gpsData.$inferInsert;
export type PlayerWellness = typeof playerWellness.$inferSelect;
export type InsertPlayerWellness = typeof playerWellness.$inferInsert;
export type PlayerLoadTargets = typeof playerLoadTargets.$inferSelect;
export type InsertPlayerLoadTargets = typeof playerLoadTargets.$inferInsert;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = typeof trainingSessions.$inferInsert;
export type InjuryRiskFlag = typeof injuryRiskFlags.$inferSelect;
export type InsertInjuryRiskFlag = typeof injuryRiskFlags.$inferInsert;
export type LoadAnalytics = typeof loadAnalytics.$inferSelect;
export type InsertLoadAnalytics = typeof loadAnalytics.$inferInsert;

// Insert schemas for S&C tables
export const insertGPSDataSchema = createInsertSchema(gpsData);
export const insertPlayerWellnessSchema = createInsertSchema(playerWellness);
export const insertPlayerLoadTargetsSchema = createInsertSchema(playerLoadTargets);
export const insertTrainingSessionSchema = createInsertSchema(trainingSessions);
export const insertInjuryRiskFlagSchema = createInsertSchema(injuryRiskFlags);
export const insertLoadAnalyticsSchema = createInsertSchema(loadAnalytics);

// ========================================
// STATSPORTS GPS TRAINING WORKRATE SCHEMA  
// ========================================

// Enhanced Training Sessions for StatSports Integration
export const trainingWorkrateSessions = pgTable("training_workrate_sessions", {
  sessionId: serial("session_id").primaryKey(),
  sessionDate: date("session_date").notNull(),
  sessionTitle: varchar("session_title", { length: 255 }).notNull(),
  sessionObjective: text("session_objective"),
  intendedExertion: varchar("intended_exertion", { length: 100 }),
  conditions: text("conditions"),
  staffNotes: text("staff_notes"),
  rpe: integer("rpe"), // Rate of Perceived Exertion
  week: integer("week"),
  day: integer("day"),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Player Workrate Table - StatSports SONRA Data
export const playerWorkrateData = pgTable("player_workrate_data", {
  workrateId: serial("workrate_id").primaryKey(),
  sessionId: integer("session_id").references(() => trainingWorkrateSessions.sessionId).notNull(),
  playerId: varchar("player_id", { length: 100 }).notNull(),
  
  // Volume Metrics
  totalDistance: decimal("total_distance", { precision: 8, scale: 2 }), // metres
  metresPerMinute: decimal("metres_per_minute", { precision: 6, scale: 2 }), // m/min work rate
  
  // Intensity & Speed Metrics
  highSpeedRunningDistance: decimal("high_speed_running_distance", { precision: 8, scale: 2 }), // metres (>5.5 m/s)
  sprintDistance: decimal("sprint_distance", { precision: 8, scale: 2 }), // metres (>7 m/s)
  maxVelocity: decimal("max_velocity", { precision: 5, scale: 2 }), // m/s
  
  // Explosive Efforts & Load
  accelerationsModerate: integer("accelerations_moderate"), // >2m/s²
  accelerationsHigh: integer("accelerations_high"), // >3m/s²
  accelerationsTotal: integer("accelerations_total"),
  decelerationsModerate: integer("decelerations_moderate"), // >2m/s²
  decelerationsHigh: integer("decelerations_high"), // >3m/s²
  decelerationsTotal: integer("decelerations_total"),
  dynamicStressLoad: decimal("dynamic_stress_load", { precision: 8, scale: 2 }), // StatSports DSL
  impacts: integer("impacts"), // collisions/impacts
  
  // Rugby-Specific Workrate Metrics
  highMetabolicLoadDistance: decimal("high_metabolic_load_distance", { precision: 8, scale: 2 }), // HMLD
  involvements: integer("involvements"), // key action involvements
  
  // Load Management
  acwr: decimal("acwr", { precision: 4, scale: 2 }), // Acute:Chronic Workload Ratio
  personalDSLAverage: decimal("personal_dsl_average", { precision: 8, scale: 2 }),
  positionalDSLAverage: decimal("positional_dsl_average", { precision: 8, scale: 2 }),
  
  // Status Indicators
  loadStatus: varchar("load_status", { length: 10 }).default("green"), // green/amber/red
  performanceStatus: varchar("performance_status", { length: 20 }),
  availability: varchar("availability", { length: 20 }).default("Available"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// GPS Data Upload Tracking
export const gpsWorkrateUploads = pgTable("gps_workrate_uploads", {
  uploadId: serial("upload_id").primaryKey(),
  sessionId: integer("session_id").references(() => trainingWorkrateSessions.sessionId),
  fileName: varchar("file_name", { length: 255 }),
  uploadedBy: varchar("uploaded_by", { length: 100 }),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  fileSize: integer("file_size"), // bytes
  recordsProcessed: integer("records_processed"),
  status: varchar("status", { length: 50 }).default("processing"), // processing/complete/error
  errorMessage: text("error_message"),
});

// Relations for StatSports Workrate Tables
export const trainingWorkrateSessionsRelations = relations(trainingWorkrateSessions, ({ many }) => ({
  playerWorkrates: many(playerWorkrateData),
  uploads: many(gpsWorkrateUploads),
}));

export const playerWorkrateDataRelations = relations(playerWorkrateData, ({ one }) => ({
  session: one(trainingWorkrateSessions, {
    fields: [playerWorkrateData.sessionId],
    references: [trainingWorkrateSessions.sessionId],
  }),
}));

export const gpsWorkrateUploadsRelations = relations(gpsWorkrateUploads, ({ one }) => ({
  session: one(trainingWorkrateSessions, {
    fields: [gpsWorkrateUploads.sessionId],
    references: [trainingWorkrateSessions.sessionId],
  }),
}));

// Zod Schemas for API Validation
export const insertTrainingWorkrateSessionSchema = createInsertSchema(trainingWorkrateSessions);
export const selectTrainingWorkrateSessionSchema = createInsertSchema(trainingWorkrateSessions);

export const insertPlayerWorkrateDataSchema = createInsertSchema(playerWorkrateData);
export const selectPlayerWorkrateDataSchema = createInsertSchema(playerWorkrateData);

export const insertGpsWorkrateUploadSchema = createInsertSchema(gpsWorkrateUploads);
export const selectGpsWorkrateUploadSchema = createInsertSchema(gpsWorkrateUploads);

// TypeScript Types for StatSports Workrate
export type TrainingWorkrateSession = typeof trainingWorkrateSessions.$inferSelect;
export type InsertTrainingWorkrateSession = typeof trainingWorkrateSessions.$inferInsert;

export type PlayerWorkrateData = typeof playerWorkrateData.$inferSelect;
export type InsertPlayerWorkrateData = typeof playerWorkrateData.$inferInsert;

export type GpsWorkrateUpload = typeof gpsWorkrateUploads.$inferSelect;
export type InsertGpsWorkrateUpload = typeof gpsWorkrateUploads.$inferInsert;
