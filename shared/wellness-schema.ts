// Athlete Wellness & Readiness Module - Firebase Schema
// Direct integration with North Harbour Performance Firebase Firestore

export interface WellnessEntry {
  id: string;
  playerId: string;
  playerName: string;
  date: string; // YYYY-MM-DD format
  timestamp: string; // ISO timestamp
  
  // Core Wellness Metrics (1-5 scale)
  sleepQuality: number;
  sleepHours: number;
  muscleSoreness: number;
  fatigueLevel: number;
  stressLevel: number;
  mood: number;
  nutritionAdherence: number;
  
  // Training-specific
  sessionRPE?: number; // Rate of Perceived Exertion (if linked to training session)
  sessionId?: string; // Link to training session
  
  // Body Area Soreness (multi-select)
  sorenessAreas: string[]; // ['hamstrings', 'quads', 'back', 'shoulders', 'calves', 'glutes']
  
  // Staff Notes
  staffNotes?: string;
  staffReview?: 'pending' | 'reviewed' | 'action_required';
  reviewedBy?: string;
  reviewedAt?: string;
  
  // Readiness Score (calculated)
  readinessScore: number; // 1-5 calculated from metrics
  readinessStatus: 'red' | 'amber' | 'green';
  
  // Data management
  entryMethod: 'player_input' | 'staff_manual' | 'imported';
  lastModified: string;
  modifiedBy: string;
}

export interface WellnessThresholds {
  playerId: string;
  playerName: string;
  
  // Personalized thresholds for red/amber/green status
  sleepQualityThresholds: { red: number; amber: number; green: number };
  fatigueThresholds: { red: number; amber: number; green: number };
  sorenessThresholds: { red: number; amber: number; green: number };
  stressThresholds: { red: number; amber: number; green: number };
  
  // Baseline averages (calculated from historical data)
  personalBaseline: {
    avgSleepQuality: number;
    avgFatigueLevel: number;
    avgMuscleSoreness: number;
    avgStressLevel: number;
    avgMood: number;
  };
  
  lastUpdated: string;
}

export interface WellnessTrend {
  playerId: string;
  playerName: string;
  period: '7day' | '14day' | '30day';
  
  trends: {
    sleepQuality: { current: number; change: number; direction: 'up' | 'down' | 'stable' };
    fatigueLevel: { current: number; change: number; direction: 'up' | 'down' | 'stable' };
    muscleSoreness: { current: number; change: number; direction: 'up' | 'down' | 'stable' };
    readinessScore: { current: number; change: number; direction: 'up' | 'down' | 'stable' };
  };
  
  alerts: string[]; // Array of alert messages
  calculatedAt: string;
}

// Firebase Collection Names
export const WELLNESS_COLLECTIONS = {
  DAILY_ENTRIES: 'athlete_wellness_entries',
  PLAYER_THRESHOLDS: 'wellness_thresholds',
  WELLNESS_TRENDS: 'wellness_trends',
  SQUAD_READINESS: 'squad_readiness_summary'
} as const;

// Utility functions for wellness calculations
export const calculateReadinessScore = (entry: Partial<WellnessEntry>): number => {
  const {
    sleepQuality = 3,
    fatigueLevel = 3,
    muscleSoreness = 3,
    stressLevel = 3,
    mood = 3
  } = entry;
  
  // Higher fatigue and soreness are negative indicators (invert)
  const invertedFatigue = 6 - fatigueLevel;
  const invertedSoreness = 6 - muscleSoreness;
  const invertedStress = 6 - stressLevel;
  
  const totalScore = sleepQuality + invertedFatigue + invertedSoreness + invertedStress + mood;
  return Math.round((totalScore / 25) * 5 * 100) / 100; // 0-5 scale
};

export const getReadinessStatus = (score: number): 'red' | 'amber' | 'green' => {
  if (score >= 4.0) return 'green';
  if (score >= 2.5) return 'amber';
  return 'red';
};

export const SORENESS_AREAS = [
  'hamstrings',
  'quadriceps',
  'calves',
  'glutes',
  'back_lower',
  'back_upper',
  'shoulders',
  'neck',
  'chest',
  'arms',
  'core',
  'hip_flexors'
] as const;

export type SorenessArea = typeof SORENESS_AREAS[number];