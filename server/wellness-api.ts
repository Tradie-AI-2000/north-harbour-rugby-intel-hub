// Athlete Wellness & Readiness API - Firebase Integration
// Server-side API for wellness data management with North Harbour Performance

import { Request, Response } from 'express';
import { 
  WellnessEntry, 
  WellnessThresholds, 
  WellnessTrend, 
  WELLNESS_COLLECTIONS,
  calculateReadinessScore,
  getReadinessStatus 
} from '@shared/wellness-schema';

// Mock Firebase functions (replace with actual Firebase when connected)
const mockFirestore = {
  collection: (name: string) => ({
    doc: (id?: string) => ({
      get: async () => ({ exists: false, data: () => null }),
      set: async (data: any) => ({ success: true }),
      update: async (data: any) => ({ success: true }),
      delete: async () => ({ success: true })
    }),
    add: async (data: any) => ({ id: `mock_${Date.now()}`, success: true }),
    where: (field: string, op: string, value: any) => ({
      get: async () => ({ docs: [], size: 0 })
    }),
    orderBy: (field: string, direction?: string) => ({
      limit: (count: number) => ({
        get: async () => ({ docs: [] })
      }),
      get: async () => ({ docs: [] })
    }),
    get: async () => ({ docs: [] })
  })
};

// API: Get player wellness entries (last 30 days)
export const getPlayerWellnessEntries = async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const { days = '30' } = req.query;
    
    console.log(`🏃 Fetching wellness entries for player ${playerId} (last ${days} days)`);
    
    const daysCount = parseInt(days as string, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    
    // Mock data for demonstration (replace with Firebase query)
    const mockWellnessEntries: WellnessEntry[] = [
      {
        id: `wellness_${playerId}_${Date.now()}`,
        playerId,
        playerName: 'Hoskins Sotutu',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        sleepQuality: 4,
        sleepHours: 7.5,
        muscleSoreness: 2,
        fatigueLevel: 2,
        stressLevel: 3,
        mood: 4,
        nutritionAdherence: 4,
        sorenessAreas: ['hamstrings', 'calves'],
        readinessScore: 4.2,
        readinessStatus: 'green',
        entryMethod: 'player_input',
        lastModified: new Date().toISOString(),
        modifiedBy: playerId,
        staffReview: 'reviewed'
      },
      {
        id: `wellness_${playerId}_${Date.now() - 86400000}`,
        playerId,
        playerName: 'Hoskins Sotutu',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        sleepQuality: 3,
        sleepHours: 6.5,
        muscleSoreness: 3,
        fatigueLevel: 3,
        stressLevel: 4,
        mood: 3,
        nutritionAdherence: 3,
        sorenessAreas: ['back_lower', 'shoulders'],
        readinessScore: 2.8,
        readinessStatus: 'amber',
        entryMethod: 'player_input',
        lastModified: new Date(Date.now() - 86400000).toISOString(),
        modifiedBy: playerId,
        staffReview: 'pending'
      }
    ];
    
    res.json({
      success: true,
      playerId,
      entriesCount: mockWellnessEntries.length,
      entries: mockWellnessEntries,
      period: `${days} days`
    });
    
  } catch (error) {
    console.error('❌ Error fetching player wellness entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wellness entries',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// API: Get squad readiness overview
export const getSquadReadinessOverview = async (req: Request, res: Response) => {
  try {
    console.log('👥 Fetching squad readiness overview');
    
    // Mock squad readiness data (replace with Firebase aggregation)
    const mockSquadReadiness = {
      date: new Date().toISOString().split('T')[0],
      totalPlayers: 40,
      readinessBreakdown: {
        green: 28,
        amber: 9,
        red: 3
      },
      averageReadinessScore: 3.7,
      topConcerns: [
        { playerId: 'daniel_collins', playerName: 'Daniel Collins', readinessScore: 1.8, status: 'red', primaryConcern: 'High fatigue + poor sleep' },
        { playerId: 'ryan_patel', playerName: 'Ryan Patel', readinessScore: 2.1, status: 'red', primaryConcern: 'Muscle soreness + stress' },
        { playerId: 'connor_white', playerName: 'Connor White', readinessScore: 2.4, status: 'amber', primaryConcern: 'Sleep quality declining' }
      ],
      calculatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      squadReadiness: mockSquadReadiness
    });
    
  } catch (error) {
    console.error('❌ Error fetching squad readiness:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch squad readiness overview',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// API: Submit/Update wellness entry
export const submitWellnessEntry = async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const wellnessData = req.body;
    
    console.log(`📝 Submitting wellness entry for player ${playerId}`);
    
    // Calculate readiness score
    const readinessScore = calculateReadinessScore(wellnessData);
    const readinessStatus = getReadinessStatus(readinessScore);
    
    const wellnessEntry: WellnessEntry = {
      id: wellnessData.id || `wellness_${playerId}_${Date.now()}`,
      playerId,
      playerName: wellnessData.playerName || 'Unknown Player',
      date: wellnessData.date || new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      sleepQuality: wellnessData.sleepQuality,
      sleepHours: wellnessData.sleepHours,
      muscleSoreness: wellnessData.muscleSoreness,
      fatigueLevel: wellnessData.fatigueLevel,
      stressLevel: wellnessData.stressLevel,
      mood: wellnessData.mood,
      nutritionAdherence: wellnessData.nutritionAdherence,
      sessionRPE: wellnessData.sessionRPE,
      sessionId: wellnessData.sessionId,
      sorenessAreas: wellnessData.sorenessAreas || [],
      staffNotes: wellnessData.staffNotes,
      staffReview: wellnessData.staffReview || 'pending',
      reviewedBy: wellnessData.reviewedBy,
      reviewedAt: wellnessData.reviewedAt,
      readinessScore,
      readinessStatus,
      entryMethod: wellnessData.entryMethod || 'staff_manual',
      lastModified: new Date().toISOString(),
      modifiedBy: wellnessData.modifiedBy || 'system'
    };
    
    // Save to Firebase (mock for now)
    console.log('💾 Saving wellness entry to Firebase:', wellnessEntry.id);
    
    res.json({
      success: true,
      message: 'Wellness entry saved successfully',
      entry: wellnessEntry,
      calculatedReadiness: {
        score: readinessScore,
        status: readinessStatus
      }
    });
    
  } catch (error) {
    console.error('❌ Error submitting wellness entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit wellness entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// API: Get wellness trends for player
export const getPlayerWellnessTrends = async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const { period = '14day' } = req.query;
    
    console.log(`📊 Calculating wellness trends for player ${playerId} (${period})`);
    
    // Mock trend data (replace with Firebase calculations)
    const mockTrend: WellnessTrend = {
      playerId,
      playerName: 'Hoskins Sotutu',
      period: period as '7day' | '14day' | '30day',
      trends: {
        sleepQuality: { current: 3.8, change: -0.3, direction: 'down' },
        fatigueLevel: { current: 2.5, change: 0.5, direction: 'up' },
        muscleSoreness: { current: 2.2, change: -0.2, direction: 'down' },
        readinessScore: { current: 3.9, change: -0.1, direction: 'down' }
      },
      alerts: [
        'Sleep quality declining over past week',
        'Fatigue levels increasing - consider load adjustment'
      ],
      calculatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      trends: mockTrend
    });
    
  } catch (error) {
    console.error('❌ Error calculating wellness trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate wellness trends',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// API: Update player wellness thresholds
export const updateWellnessThresholds = async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const thresholds = req.body;
    
    console.log(`⚙️ Updating wellness thresholds for player ${playerId}`);
    
    const wellnessThresholds: WellnessThresholds = {
      playerId,
      playerName: thresholds.playerName,
      sleepQualityThresholds: thresholds.sleepQualityThresholds,
      fatigueThresholds: thresholds.fatigueThresholds,
      sorenessThresholds: thresholds.sorenessThresholds,
      stressThresholds: thresholds.stressThresholds,
      personalBaseline: thresholds.personalBaseline,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Wellness thresholds updated successfully',
      thresholds: wellnessThresholds
    });
    
  } catch (error) {
    console.error('❌ Error updating wellness thresholds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update wellness thresholds',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};