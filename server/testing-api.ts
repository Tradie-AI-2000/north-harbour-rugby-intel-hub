// Strength & Power Testing API - Firebase Integration
// S&C Command Centre testing protocols and performance tracking

import { Request, Response } from 'express';
import { 
  TestingEntry, 
  TestingProtocol, 
  PlayerTestingHistory, 
  TeamTestingAnalytics,
  TestType,
  TESTING_COLLECTIONS,
  TEST_CATEGORIES,
  POSITION_TEST_MATRIX,
  calculatePercentileRank,
  calculateImprovementPercentage,
  getTestUnits,
  getTestCategory
} from '@shared/testing-schema';

// API: Get all testing protocols
export const getTestingProtocols = async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching testing protocols');
    
    // Mock testing protocols - replace with Firebase when connected
    const mockProtocols: TestingProtocol[] = [
      {
        testType: 'back_squat_1rm',
        testName: 'Back Squat 1RM',
        description: 'Maximal back squat strength assessment',
        instructions: [
          'Complete thorough warm-up including dynamic movements',
          'Start with 60% of estimated 1RM for 5 reps',
          'Increase weight progressively until 1RM is achieved',
          'Maximum 5 attempts at true 1RM range'
        ],
        equipment: ['Olympic barbell', 'Weight plates', 'Squat rack', 'Safety bars'],
        safetyNotes: ['Always use spotters', 'Ensure proper squat depth', 'Stop if form deteriorates'],
        normativeData: {
          elite: { male: 200, female: 140 },
          good: { male: 160, female: 110 },
          average: { male: 130, female: 85 },
          belowAverage: { male: 100, female: 65 }
        },
        units: 'kg',
        testFrequency: 'quarterly',
        positions: ['Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8', 'Centre']
      },
      {
        testType: 'countermovement_jump',
        testName: 'Countermovement Jump',
        description: 'Vertical jump power assessment with countermovement',
        instructions: [
          'Stand on force plate with hands on hips',
          'Perform rapid countermovement to approximately 90° knee angle',
          'Jump as high as possible',
          'Land softly in starting position'
        ],
        equipment: ['Force plate or jump mat', 'Measuring tape'],
        safetyNotes: ['Ensure clear landing area', 'Use appropriate footwear', 'Stop if experiencing pain'],
        normativeData: {
          elite: { male: 65, female: 55 },
          good: { male: 55, female: 45 },
          average: { male: 45, female: 35 },
          belowAverage: { male: 35, female: 25 }
        },
        units: 'cm',
        testFrequency: 'monthly',
        positions: ['Hooker', 'Flanker', 'Number 8', 'Scrum-half', 'Fly-half', 'Centre', 'Winger', 'Fullback']
      },
      {
        testType: '20m_sprint',
        testName: '20m Sprint',
        description: 'Acceleration and speed assessment over 20 meters',
        instructions: [
          'Start in standing position behind start line',
          'Begin when ready - self-start protocol',
          'Sprint maximally through 20m finish line',
          'Allow full recovery between attempts'
        ],
        equipment: ['Timing gates', 'Measuring tape', 'Cones'],
        safetyNotes: ['Proper warm-up essential', 'Check surface conditions', 'Appropriate footwear'],
        normativeData: {
          elite: { male: 2.8, female: 3.1 },
          good: { male: 3.0, female: 3.3 },
          average: { male: 3.2, female: 3.5 },
          belowAverage: { male: 3.5, female: 3.8 }
        },
        units: 'seconds',
        testFrequency: 'monthly',
        positions: ['Hooker', 'Flanker', 'Number 8', 'Scrum-half', 'Fly-half', 'Centre', 'Winger', 'Fullback']
      }
    ];
    
    res.json({
      success: true,
      protocols: mockProtocols,
      totalProtocols: mockProtocols.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching testing protocols:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch testing protocols',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// API: Get player testing history
export const getPlayerTestingHistory = async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const { testType } = req.query;
    
    console.log(`🏃 Fetching testing history for player ${playerId}${testType ? ` - ${testType}` : ''}`);
    
    // Mock player testing history - replace with Firebase when connected
    const mockTestingHistory: TestingEntry[] = [
      {
        id: `test_${playerId}_back_squat_2025_01_20`,
        playerId,
        playerName: 'Hoskins Sotutu',
        position: 'Number 8',
        testType: 'back_squat_1rm',
        testDate: '2025-01-20',
        timestamp: new Date('2025-01-20T10:00:00Z').toISOString(),
        result: 180,
        units: 'kg',
        testConditions: 'optimal',
        testPhase: 'pre-season',
        personalBest: true,
        percentageOfPB: 100,
        improvementFromLast: 10,
        positionAverage: 165,
        teamAverage: 150,
        percentileRank: 85,
        staffNotes: 'Excellent technique, significant improvement from last test',
        testingOfficer: 'S&C Coach Smith',
        verified: true,
        retestRequired: false,
        entryMethod: 'manual_entry',
        lastModified: new Date().toISOString(),
        modifiedBy: 'sc_coach_smith'
      },
      {
        id: `test_${playerId}_cmj_2025_01_15`,
        playerId,
        playerName: 'Hoskins Sotutu',
        position: 'Number 8',
        testType: 'countermovement_jump',
        testDate: '2025-01-15',
        timestamp: new Date('2025-01-15T09:30:00Z').toISOString(),
        result: 58,
        units: 'cm',
        testConditions: 'optimal',
        testPhase: 'pre-season',
        personalBest: false,
        percentageOfPB: 93.5,
        improvementFromLast: 3,
        positionAverage: 52,
        teamAverage: 48,
        percentileRank: 75,
        staffNotes: 'Good power output, close to PB',
        testingOfficer: 'S&C Coach Smith',
        verified: true,
        retestRequired: false,
        entryMethod: 'manual_entry',
        lastModified: new Date().toISOString(),
        modifiedBy: 'sc_coach_smith'
      }
    ];
    
    // Filter by test type if specified
    const filteredHistory = testType 
      ? mockTestingHistory.filter(entry => entry.testType === testType)
      : mockTestingHistory;
    
    res.json({
      success: true,
      playerId,
      testType: testType || 'all',
      entries: filteredHistory,
      entriesCount: filteredHistory.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching player testing history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player testing history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// API: Submit new testing entry
export const submitTestingEntry = async (req: Request, res: Response) => {
  try {
    const testingData = req.body;
    
    console.log(`📝 Submitting testing entry: ${testingData.testType} for ${testingData.playerName}`);
    
    // Calculate derived metrics
    const mockTeamResults = [45, 52, 48, 38, 55, 42, 50, 47, 49, 44]; // Mock team results for percentile calculation
    const percentileRank = calculatePercentileRank(testingData.result, mockTeamResults);
    
    const testingEntry: TestingEntry = {
      id: testingData.id || `test_${testingData.playerId}_${testingData.testType}_${Date.now()}`,
      playerId: testingData.playerId,
      playerName: testingData.playerName,
      position: testingData.position,
      testType: testingData.testType,
      testDate: testingData.testDate || new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      result: testingData.result,
      units: getTestUnits(testingData.testType),
      testConditions: testingData.testConditions || 'optimal',
      testPhase: testingData.testPhase || 'in-season',
      weatherConditions: testingData.weatherConditions,
      equipmentUsed: testingData.equipmentUsed,
      personalBest: testingData.personalBest || false,
      percentageOfPB: testingData.percentageOfPB || 100,
      improvementFromLast: testingData.improvementFromLast || 0,
      positionAverage: testingData.positionAverage || testingData.result * 0.9,
      teamAverage: testingData.teamAverage || testingData.result * 0.85,
      percentileRank,
      staffNotes: testingData.staffNotes,
      testingOfficer: testingData.testingOfficer || 'S&C Staff',
      verified: testingData.verified !== false,
      retestRequired: testingData.retestRequired || false,
      retestReason: testingData.retestReason,
      entryMethod: testingData.entryMethod || 'manual_entry',
      lastModified: new Date().toISOString(),
      modifiedBy: testingData.modifiedBy || 'system'
    };
    
    // Save to Firebase (mock for now)
    console.log('💾 Saving testing entry to Firebase:', testingEntry.id);
    
    res.json({
      success: true,
      message: 'Testing entry saved successfully',
      entry: testingEntry,
      metrics: {
        percentileRank,
        testCategory: getTestCategory(testingData.testType),
        units: getTestUnits(testingData.testType)
      }
    });
    
  } catch (error) {
    console.error('❌ Error submitting testing entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit testing entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// API: Get team testing analytics
export const getTeamTestingAnalytics = async (req: Request, res: Response) => {
  try {
    const { testType, dateRange = '30' } = req.query;
    
    console.log(`📊 Generating team testing analytics for ${testType || 'all tests'} (last ${dateRange} days)`);
    
    // Mock team analytics - replace with Firebase calculations
    const mockAnalytics: TeamTestingAnalytics = {
      testType: (testType as TestType) || 'countermovement_jump',
      testDate: new Date().toISOString().split('T')[0],
      teamStatistics: {
        participationRate: 92.5,
        averageResult: 48.7,
        medianResult: 49.2,
        standardDeviation: 6.8,
        rangeMin: 35.1,
        rangeMax: 62.4
      },
      positionalBreakdown: {
        'Forwards': { average: 45.2, best: 58.1, worst: 35.1, playerCount: 16 },
        'Backs': { average: 52.8, best: 62.4, worst: 42.7, playerCount: 24 }
      },
      topPerformers: [
        {
          id: 'test_caleb_clarke_cmj_latest',
          playerId: 'caleb_clarke',
          playerName: 'Caleb Clarke',
          position: 'Winger',
          testType: 'countermovement_jump',
          testDate: '2025-01-20',
          timestamp: new Date().toISOString(),
          result: 62.4,
          units: 'cm',
          testConditions: 'optimal',
          testPhase: 'pre-season',
          personalBest: true,
          percentageOfPB: 100,
          improvementFromLast: 4.2,
          positionAverage: 55.1,
          teamAverage: 48.7,
          percentileRank: 100,
          testingOfficer: 'S&C Coach Smith',
          verified: true,
          retestRequired: false,
          entryMethod: 'manual_entry',
          lastModified: new Date().toISOString(),
          modifiedBy: 'sc_coach_smith'
        }
      ],
      improvementLeaders: [
        {
          playerId: 'ben_lam',
          playerName: 'Ben Lam',
          improvementPercentage: 12.5,
          previousResult: 44.8,
          currentResult: 50.4
        }
      ],
      concernAreas: [
        {
          playerId: 'daniel_collins',
          playerName: 'Daniel Collins',
          position: 'Flanker',
          concern: 'Below position average - consider power development focus',
          percentileRank: 15
        }
      ],
      calculatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      analytics: mockAnalytics,
      dateRange: `${dateRange} days`
    });
    
  } catch (error) {
    console.error('❌ Error generating team testing analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate team testing analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// API: Get testing leaderboards
export const getTestingLeaderboards = async (req: Request, res: Response) => {
  try {
    const { testType, position, limit = '10' } = req.query;
    
    console.log(`🏆 Generating testing leaderboards for ${testType || 'all tests'}${position ? ` - ${position}` : ''}`);
    
    // Mock leaderboard data - replace with Firebase queries
    const mockLeaderboard = [
      { playerId: 'caleb_clarke', playerName: 'Caleb Clarke', position: 'Winger', result: 62.4, testDate: '2025-01-20' },
      { playerId: 'ben_lam', playerName: 'Ben Lam', position: 'Winger', result: 58.7, testDate: '2025-01-18' },
      { playerId: 'hoskins_sotutu', playerName: 'Hoskins Sotutu', position: 'Number 8', result: 58.1, testDate: '2025-01-15' },
      { playerId: 'aisea_halo', playerName: 'Aisea Halo', position: 'Centre', result: 55.9, testDate: '2025-01-17' },
      { playerId: 'connor_white', playerName: 'Connor White', position: 'Fly-half', result: 53.2, testDate: '2025-01-16' }
    ].slice(0, parseInt(limit as string, 10));
    
    res.json({
      success: true,
      leaderboard: mockLeaderboard,
      filters: {
        testType: testType || 'all',
        position: position || 'all',
        limit: parseInt(limit as string, 10)
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating testing leaderboards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate testing leaderboards',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// API: Delete testing entry
export const deleteTestingEntry = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const { reason } = req.body;
    
    console.log(`🗑️ Deleting testing entry ${entryId} - Reason: ${reason}`);
    
    // Delete from Firebase (mock for now)
    console.log('💾 Removing testing entry from Firebase:', entryId);
    
    res.json({
      success: true,
      message: 'Testing entry deleted successfully',
      deletedEntryId: entryId,
      deletionReason: reason,
      deletedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error deleting testing entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete testing entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};