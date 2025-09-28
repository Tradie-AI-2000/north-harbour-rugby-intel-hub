// Strength & Power Testing Module - Firebase Schema
// S&C Command Centre testing protocols and performance tracking

export interface TestingEntry {
  id: string;
  playerId: string;
  playerName: string;
  position: string;
  testType: TestType;
  testDate: string; // YYYY-MM-DD format
  timestamp: string; // ISO timestamp
  
  // Test Results (units vary by test type)
  result: number;
  units: string; // kg, cm, seconds, level, etc.
  
  // Test Context
  testConditions: 'optimal' | 'sub-optimal' | 'return-to-play' | 'baseline';
  testPhase: 'pre-season' | 'in-season' | 'post-season' | 'injury-return';
  weatherConditions?: string; // for outdoor tests
  equipmentUsed?: string;
  
  // Performance Metrics
  personalBest: boolean;
  percentageOfPB: number;
  improvementFromLast: number; // positive/negative change
  
  // Comparison Data
  positionAverage: number;
  teamAverage: number;
  percentileRank: number; // 0-100 where this result ranks in team
  
  // Staff Notes
  staffNotes?: string;
  testingOfficer: string;
  verified: boolean;
  retestRequired: boolean;
  retestReason?: string;
  
  // Data management
  entryMethod: 'manual_entry' | 'imported' | 'auto_calculated';
  lastModified: string;
  modifiedBy: string;
}

export interface TestingProtocol {
  testType: TestType;
  testName: string;
  description: string;
  instructions: string[];
  equipment: string[];
  safetyNotes: string[];
  normativeData: {
    elite: { male: number; female: number };
    good: { male: number; female: number };
    average: { male: number; female: number };
    belowAverage: { male: number; female: number };
  };
  units: string;
  testFrequency: 'weekly' | 'monthly' | 'quarterly' | 'bi-annual' | 'annual';
  positions: string[]; // which positions typically perform this test
}

export interface PlayerTestingHistory {
  playerId: string;
  playerName: string;
  position: string;
  
  testingHistory: {
    [testType: string]: {
      allTimeResults: TestingEntry[];
      personalBest: TestingEntry;
      mostRecent: TestingEntry;
      trend: 'improving' | 'declining' | 'stable';
      trendPercentage: number;
      nextTestDue: string;
    };
  };
  
  overallProgress: {
    totalTests: number;
    personalBests: number;
    improvements: number;
    testingCompliance: number; // percentage of scheduled tests completed
  };
  
  lastUpdated: string;
}

export interface TeamTestingAnalytics {
  testType: TestType;
  testDate: string;
  
  teamStatistics: {
    participationRate: number;
    averageResult: number;
    medianResult: number;
    standardDeviation: number;
    rangeMin: number;
    rangeMax: number;
  };
  
  positionalBreakdown: {
    [position: string]: {
      average: number;
      best: number;
      worst: number;
      playerCount: number;
    };
  };
  
  topPerformers: TestingEntry[];
  improvementLeaders: {
    playerId: string;
    playerName: string;
    improvementPercentage: number;
    previousResult: number;
    currentResult: number;
  }[];
  
  concernAreas: {
    playerId: string;
    playerName: string;
    position: string;
    concern: string;
    percentileRank: number;
  }[];
  
  calculatedAt: string;
}

// Test Types Enumeration
export type TestType = 
  | 'back_squat_1rm'
  | 'front_squat_1rm'
  | 'bench_press_1rm'
  | 'deadlift_1rm'
  | 'countermovement_jump'
  | 'squat_jump'
  | 'drop_jump'
  | '10m_sprint'
  | '20m_sprint'
  | '30m_sprint'
  | '40m_sprint'
  | 'yo_yo_intermittent'
  | 'yo_yo_endurance'
  | '3km_time_trial'
  | 'plank_hold'
  | 'push_up_max'
  | 'pull_up_max'
  | 'broad_jump'
  | 'vertical_jump'
  | 'agility_t_test'
  | '505_agility'
  | 'pro_agility_5_10_5'
  | 'reactive_strength_index'
  | 'isometric_mid_thigh_pull'
  | 'nordic_hamstring'
  | 'single_leg_hop';

// Firebase Collection Names
export const TESTING_COLLECTIONS = {
  TESTING_ENTRIES: 'strength_power_testing_entries',
  TESTING_PROTOCOLS: 'testing_protocols',
  PLAYER_TESTING_HISTORY: 'player_testing_history',
  TEAM_TESTING_ANALYTICS: 'team_testing_analytics',
  TESTING_SCHEDULES: 'testing_schedules'
} as const;

// Test Category Mappings
export const TEST_CATEGORIES = {
  STRENGTH: ['back_squat_1rm', 'front_squat_1rm', 'bench_press_1rm', 'deadlift_1rm', 'isometric_mid_thigh_pull'],
  POWER: ['countermovement_jump', 'squat_jump', 'drop_jump', 'broad_jump', 'vertical_jump', 'reactive_strength_index'],
  SPEED: ['10m_sprint', '20m_sprint', '30m_sprint', '40m_sprint'],
  AGILITY: ['agility_t_test', '505_agility', 'pro_agility_5_10_5'],
  ENDURANCE: ['yo_yo_intermittent', 'yo_yo_endurance', '3km_time_trial'],
  STABILITY: ['plank_hold', 'single_leg_hop', 'nordic_hamstring'],
  BODYWEIGHT: ['push_up_max', 'pull_up_max']
} as const;

// Position-specific test recommendations
export const POSITION_TEST_MATRIX = {
  'Prop': ['back_squat_1rm', 'bench_press_1rm', 'countermovement_jump', '10m_sprint', 'plank_hold'],
  'Hooker': ['back_squat_1rm', 'countermovement_jump', '10m_sprint', '20m_sprint', 'agility_t_test'],
  'Lock': ['back_squat_1rm', 'countermovement_jump', '20m_sprint', 'yo_yo_intermittent', 'plank_hold'],
  'Flanker': ['back_squat_1rm', 'countermovement_jump', '20m_sprint', '30m_sprint', 'yo_yo_intermittent', 'agility_t_test'],
  'Number 8': ['back_squat_1rm', 'countermovement_jump', '20m_sprint', '30m_sprint', 'yo_yo_intermittent'],
  'Scrum-half': ['countermovement_jump', '10m_sprint', '20m_sprint', 'agility_t_test', 'pro_agility_5_10_5'],
  'Fly-half': ['countermovement_jump', '20m_sprint', '30m_sprint', 'agility_t_test', 'yo_yo_intermittent'],
  'Centre': ['back_squat_1rm', 'countermovement_jump', '20m_sprint', '30m_sprint', 'agility_t_test'],
  'Winger': ['countermovement_jump', '30m_sprint', '40m_sprint', 'agility_t_test', 'yo_yo_endurance'],
  'Fullback': ['countermovement_jump', '30m_sprint', '40m_sprint', 'agility_t_test', 'yo_yo_endurance']
} as const;

// Utility functions for testing calculations
export const calculatePercentileRank = (playerResult: number, teamResults: number[]): number => {
  const sortedResults = teamResults.sort((a, b) => b - a); // Descending for most tests
  const rank = sortedResults.findIndex(result => playerResult >= result) + 1;
  return Math.round((rank / sortedResults.length) * 100);
};

export const calculateImprovementPercentage = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100 * 100) / 100;
};

export const getTestUnits = (testType: TestType): string => {
  const unitsMap: Record<TestType, string> = {
    'back_squat_1rm': 'kg',
    'front_squat_1rm': 'kg',
    'bench_press_1rm': 'kg',
    'deadlift_1rm': 'kg',
    'countermovement_jump': 'cm',
    'squat_jump': 'cm',
    'drop_jump': 'cm',
    '10m_sprint': 'seconds',
    '20m_sprint': 'seconds',
    '30m_sprint': 'seconds',
    '40m_sprint': 'seconds',
    'yo_yo_intermittent': 'level',
    'yo_yo_endurance': 'level',
    '3km_time_trial': 'minutes',
    'plank_hold': 'seconds',
    'push_up_max': 'reps',
    'pull_up_max': 'reps',
    'broad_jump': 'cm',
    'vertical_jump': 'cm',
    'agility_t_test': 'seconds',
    '505_agility': 'seconds',
    'pro_agility_5_10_5': 'seconds',
    'reactive_strength_index': 'ratio',
    'isometric_mid_thigh_pull': 'newtons',
    'nordic_hamstring': 'degrees',
    'single_leg_hop': 'cm'
  };
  
  return unitsMap[testType] || 'units';
};

export const getTestCategory = (testType: TestType): string => {
  for (const [category, tests] of Object.entries(TEST_CATEGORIES)) {
    if ((tests as readonly TestType[]).includes(testType)) {
      return category;
    }
  }
  return 'OTHER';
};