import { z } from "zod";

// ==========================================
// WEEKLY TRAINING SYSTEM SCHEMA EXTENSIONS
// StatSports GPS Weekly Management
// ==========================================

// Training Weeks Collection - Weekly Organization
export const firestoreTrainingWeekSchema = z.object({
  // Document ID: week_id (e.g., "preseason", "week1", "week2")
  
  weekId: z.string(),
  weekName: z.string(), // "Preseason", "Week 1", "Week 2"
  seasonYear: z.number(), // 2025
  startDate: z.string(), // ISO timestamp
  endDate: z.string(), // ISO timestamp
  
  // Session References
  trainingSessionIds: z.array(z.string()),
  matchSessionIds: z.array(z.string()),
  
  // Week Summary Metrics (calculated from GPS data)
  weekSummary: z.object({
    totalSessions: z.number(),
    averagePlayerLoad: z.number(),
    highLoadPlayers: z.array(z.string()), // playerIds with high loads
    teamReadinessScore: z.number().min(0).max(100),
    injuryRiskAlerts: z.array(z.string()), // playerIds at risk
    topPerformers: z.array(z.object({
      playerId: z.string(),
      metric: z.string(),
      value: z.number()
    })),
    lastCalculated: z.string() // ISO timestamp
  }).optional(),
  
  // Match Correlation Data  
  matchOutcome: z.object({
    opponent: z.string(),
    result: z.enum(["win", "loss", "draw"]),
    scoreFor: z.number(),
    scoreAgainst: z.number(),
    matchDate: z.string() // ISO timestamp
  }).optional(),
  
  // Metadata
  createdAt: z.string(),
  updatedAt: z.string()
});

// Training Sessions Collection - Individual Session Management  
export const firestoreTrainingSessionSchema = z.object({
  // Document ID: session_${weekId}_${sessionNumber} (e.g., "session_week5_001")
  
  sessionId: z.string(),
  sessionName: z.string(), // "StatSports Training Data: Session 1, Week 5. 2025-01-23"
  weekId: z.string(), // Links to training_weeks collection
  sessionNumber: z.number(), // 1, 2, 3 within the week
  
  date: z.string(), // ISO timestamp
  sessionType: z.enum(["training", "match"]),
  
  // GPS Data References (for performance)
  gpsDataIds: z.array(z.string()),
  
  // Session Summary (calculated from GPS data)
  sessionSummary: z.object({
    playersInvolved: z.array(z.string()),
    averagePlayerLoad: z.number(),
    totalDistance: z.number(),
    highIntensityWork: z.number(),
    sessionDuration: z.number(), // minutes
    dataQuality: z.number().min(0).max(1),
    lastCalculated: z.string()
  }).optional(),
  
  // Upload Information
  uploadedBy: z.string(), // "nick_marquet"
  uploadedAt: z.string(),
  originalFileName: z.string(),
  
  // Metadata
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.enum(["active", "archived"])
});

// Season Analytics Collection - Long-term Trends
export const firestoreSeasonAnalyticsSchema = z.object({
  // Document ID: season_analytics_2025
  
  seasonYear: z.number(),
  
  // Weekly Trends
  weeklyTrends: z.array(z.object({
    weekId: z.string(),
    averagePlayerLoad: z.number(),
    matchResult: z.enum(["win", "loss", "draw"]).optional(),
    correlation: z.number().min(-1).max(1) // load vs outcome correlation  
  })),
  
  // Performance Correlations
  loadCorrelations: z.object({
    highLoadWinRate: z.number(), // % wins when avg load > threshold
    optimalLoadRange: z.object({
      min: z.number(),
      max: z.number()
    }),
    overtrainingIndicators: z.array(z.object({
      weekId: z.string(),
      avgLoad: z.number(),
      matchResult: z.string(),
      playersAffected: z.array(z.string())
    }))
  }),
  
  // Season Summary
  seasonSummary: z.object({
    totalWeeks: z.number(),
    winRate: z.number(),
    averageSeasonLoad: z.number(),
    bestPerformanceWeek: z.string(),
    highestRiskWeek: z.string(),
    keyInsights: z.array(z.string())
  }),
  
  // Last Updated
  lastCalculated: z.string(),
  calculatedBy: z.string() // "system_analytics"
});

// Enhanced GPS Data Schema with Week Linking
export const enhancedGpsDataSchema = z.object({
  // Document ID: gps_${playerId}_${sessionId}_${timestamp}
  
  playerId: z.string(),
  sessionId: z.string(), // Links to training_sessions collection
  weekId: z.string(), // Links to training_weeks collection
  date: z.string(), // ISO timestamp
  sessionType: z.enum(["training", "match"]),
  
  // All 32 StatSports GPS Metrics (from CSV template)
  totalDistance: z.number(),
  metresPerMinute: z.number(),
  highSpeedRunningDistance: z.number(),
  sprintDistance: z.number(),
  maxVelocity: z.number(),
  playerLoad: z.number(), // CRITICAL METRIC for load management
  accelerations_total: z.number(),
  accelerations_high: z.number(),
  accelerations_moderate: z.number(),
  decelerations_total: z.number(),
  decelerations_high: z.number(),
  decelerations_moderate: z.number(),
  dynamicStressLoad: z.number(),
  impacts: z.number(),
  highMetabolicLoadDistance: z.number(),
  involvements: z.number(),
  timeInRedZone: z.number(),
  distancePerMinute: z.number(),
  highSpeedRunning: z.number(),
  maxSpeed: z.number(),
  acwr: z.number(), // Acute:Chronic Workload Ratio - injury risk indicator
  personalDSLAverage: z.number(),
  positionalDSLAverage: z.number(),
  loadStatus: z.enum(["green", "amber", "red"]), // Load management indicator
  performanceStatus: z.enum(["Poor", "Moderate", "Good", "Excellent"]),
  dataQuality: z.number().min(0).max(1),
  satelliteCount: z.number(),
  signalStrength: z.number(),
  
  // Metadata
  uploadedAt: z.string(),
  uploadedBy: z.string() // "nick_marquet"
});

// TypeScript types for use across the application
export type TrainingWeek = z.infer<typeof firestoreTrainingWeekSchema>;
export type TrainingSession = z.infer<typeof firestoreTrainingSessionSchema>;
export type SeasonAnalytics = z.infer<typeof firestoreSeasonAnalyticsSchema>;
export type EnhancedGpsData = z.infer<typeof enhancedGpsDataSchema>;

// Collection Names Constants
export const WEEKLY_COLLECTIONS = {
  TRAINING_WEEKS: 'training_weeks',
  TRAINING_SESSIONS: 'training_sessions', 
  SEASON_ANALYTICS: 'season_analytics',
  GPS_DATA: 'stat_sports_data' // Uses existing collection with enhanced schema
} as const;

// Week ID Generation Helper
export const generateWeekId = (weekNumber: number, isPreseason: boolean = false): string => {
  if (isPreseason) return 'preseason';
  return `week${weekNumber}`;
};

// Enhanced Session ID Generation Helper
export const generateSessionId = (weekId: string, sessionNumber: number, date: string): string => {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${weekId}_session${sessionNumber}_${year}_${month}_${day}`;
};

// Session ID Parser Helper for Frontend
export const parseSessionId = (sessionId: string) => {
  const parts = sessionId.split('_');
  if (parts.length < 5) {
    // Fallback for legacy format
    return {
      weekId: 'unknown',
      sessionNumber: 0,
      year: 2025,
      month: 1,
      day: 1,
      isLegacy: true
    };
  }
  
  return {
    weekId: parts[0], // "week1"
    sessionNumber: parseInt(parts[1].replace('session', '')), // 2
    year: parseInt(parts[2]), // 2025
    month: parseInt(parts[3]), // 07
    day: parseInt(parts[4]),   // 27
    isLegacy: false
  };
};

// Week-based Query Helper
export const getWeekSessionPrefix = (weekId: string): string => {
  return `${weekId}_session`;
};