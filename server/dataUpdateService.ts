/**
 * Data Update Service
 * Handles all player data updates through the Data Integrity Manager
 * Provides unified interface for manual updates, CSV imports, API calls, and AI analysis
 */

import { dataIntegrityManager, type DataUpdate } from "./dataIntegrityManager";
import { db } from "./db";
import { players } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface MedicalAppointment {
  id: string;
  playerId: string;
  type: 'routine_checkup' | 'injury_assessment' | 'treatment' | 'clearance';
  date: string;
  scheduledTime: string;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  provider: string;
  notes?: string;
  outcome?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface TrainingAttendance {
  id: string;
  playerId: string;
  sessionId: string;
  date: string;
  sessionType: 'team_training' | 'individual_training' | 'strength_conditioning' | 'skills_session';
  status: 'present' | 'absent' | 'late' | 'excused';
  arrivalTime?: string;
  departureTime?: string;
  participationLevel: 'full' | 'modified' | 'observer';
  notes?: string;
}

export interface PlayerValueUpdate {
  playerId: string;
  contractValue?: number;
  attendanceScore?: number;
  medicalScore?: number;
  personalityScore?: number;
  performanceScore?: number;
  cohesionScore?: number;
  totalScore?: number;
  lastUpdated: string;
}

export class DataUpdateService {
  /**
   * Handle medical appointment updates
   */
  async updateMedicalAppointment(
    appointment: MedicalAppointment,
    updatedBy: string
  ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    const updates: Record<string, any> = {
      [`medicalAppointments.${appointment.id}`]: appointment
    };

    // If appointment was missed, this affects attendance score
    if (appointment.status === 'missed') {
      const [player] = await db.select().from(players).where(eq(players.id, appointment.playerId));
      if (player?.medicalAppointments) {
        const allAppointments = [...player.medicalAppointments, appointment];
        updates['medicalAppointments'] = allAppointments;
      }
    }

    return await dataIntegrityManager.processDataUpdate(
      appointment.playerId,
      updates,
      'medical_update',
      updatedBy,
      `Medical appointment ${appointment.status}: ${appointment.type}`
    );
  }

  /**
   * Handle training attendance updates
   */
  async updateTrainingAttendance(
    attendance: TrainingAttendance,
    updatedBy: string
  ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    const [player] = await db.select().from(players).where(eq(players.id, attendance.playerId));
    if (!player) {
      return { success: false, errors: ['Player not found'], warnings: [] };
    }

    // Calculate new attendance score
    const recentAttendance = this.calculateAttendanceScore(player.trainingAttendance || [], attendance);

    const updates: Record<string, any> = {
      [`trainingAttendance.${attendance.id}`]: attendance,
      'playerValue.attendanceScore': recentAttendance,
      'cohesionMetrics.reliability': recentAttendance
    };

    return await dataIntegrityManager.processDataUpdate(
      attendance.playerId,
      updates,
      'manual',
      updatedBy,
      `Training attendance: ${attendance.status}`
    );
  }

  /**
   * Handle CSV data imports
   */
  async processCSVImport(
    playerId: string,
    csvData: Record<string, any>,
    updatedBy: string
  ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    // Transform CSV data to match schema
    const updates = this.transformCSVData(csvData);

    return await dataIntegrityManager.processDataUpdate(
      playerId,
      updates,
      'csv_upload',
      updatedBy,
      'CSV data import'
    );
  }

  /**
   * Handle GPS data updates from StatSports API
   */
  async processGPSDataUpdate(
    playerId: string,
    gpsData: any,
    updatedBy: string = 'system'
  ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    // Calculate derived metrics from GPS data
    const derivedMetrics = this.calculateGPSMetrics(gpsData);

    const updates: Record<string, any> = {
      [`gpsData.${gpsData.id}`]: gpsData,
      'physicalMetrics.currentFitness': derivedMetrics.fitnessLevel,
      'physicalMetrics.workload': derivedMetrics.trainingLoad
    };

    // Update fitness status if significant change detected
    if (derivedMetrics.fitnessLevel < 6) {
      updates['status.fitness'] = 'needs_attention';
    } else if (derivedMetrics.fitnessLevel > 8) {
      updates['status.fitness'] = 'excellent';
    }

    return await dataIntegrityManager.processDataUpdate(
      playerId,
      updates,
      'api_call',
      updatedBy,
      'GPS data from StatSports'
    );
  }

  /**
   * Handle AI analysis updates
   */
  async processAIAnalysisUpdate(
    playerId: string,
    aiAnalysis: any,
    updatedBy: string = 'ai_system'
  ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    const updates: Record<string, any> = {
      'aiRating.overall': aiAnalysis.overallRating,
      'aiRating.physicality': aiAnalysis.physicalityRating,
      'aiRating.skillset': aiAnalysis.skillsetRating,
      'aiRating.gameImpact': aiAnalysis.gameImpactRating,
      'aiRating.potential': aiAnalysis.potentialRating,
      'aiRating.lastUpdated': new Date().toISOString(),
      'aiAnalysis.summary': aiAnalysis.summary,
      'aiAnalysis.strengths': aiAnalysis.strengths,
      'aiAnalysis.developmentAreas': aiAnalysis.developmentAreas,
      'aiAnalysis.recommendations': aiAnalysis.recommendations
    };

    return await dataIntegrityManager.processDataUpdate(
      playerId,
      updates,
      'ai_analysis',
      updatedBy,
      'AI performance analysis update'
    );
  }

  /**
   * Handle injury updates from medical staff
   */
  async processInjuryUpdate(
    playerId: string,
    injury: any,
    updatedBy: string
  ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    const [player] = await db.select().from(players).where(eq(players.id, playerId));
    if (!player) {
      return { success: false, errors: ['Player not found'], warnings: [] };
    }

    const existingInjuries = player.injuries || [];
    const updatedInjuries = injury.id 
      ? existingInjuries.map(i => i.id === injury.id ? injury : i)
      : [...existingInjuries, injury];

    const updates: Record<string, any> = {
      'injuries': updatedInjuries
    };

    // Injury updates will trigger cascading updates via Data Integrity Manager
    return await dataIntegrityManager.processDataUpdate(
      playerId,
      updates,
      'medical_update',
      updatedBy,
      `Injury ${injury.status}: ${injury.type}`
    );
  }

  /**
   * Bulk update multiple players from spreadsheet
   */
  async processBulkPlayerUpdate(
    playerUpdates: Array<{ playerId: string; updates: Record<string, any> }>,
    updatedBy: string
  ): Promise<Array<{ playerId: string; success: boolean; errors: string[]; warnings: string[] }>> {
    const results = [];

    for (const { playerId, updates } of playerUpdates) {
      const result = await dataIntegrityManager.processDataUpdate(
        playerId,
        updates,
        'csv_upload',
        updatedBy,
        'Bulk update from spreadsheet'
      );

      results.push({
        playerId,
        ...result
      });
    }

    return results;
  }

  /**
   * Update player value metrics
   */
  async updatePlayerValue(
    update: PlayerValueUpdate,
    updatedBy: string
  ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    const updates: Record<string, any> = {};

    Object.entries(update).forEach(([key, value]) => {
      if (key !== 'playerId' && value !== undefined) {
        updates[`playerValue.${key}`] = value;
      }
    });

    return await dataIntegrityManager.processDataUpdate(
      update.playerId,
      updates,
      'manual',
      updatedBy,
      'Player value metrics update'
    );
  }

  /**
   * Get data update history for a player
   */
  getPlayerDataHistory(playerId: string, limit: number = 50): DataUpdate[] {
    return dataIntegrityManager.getPlayerUpdateHistory(playerId, limit);
  }

  /**
   * Generate data integrity report
   */
  async generatePlayerDataReport(playerId: string) {
    return await dataIntegrityManager.generateIntegrityReport(playerId);
  }

  /**
   * Helper methods
   */
  private calculateAttendanceScore(
    existingAttendance: TrainingAttendance[],
    newAttendance: TrainingAttendance
  ): number {
    const recentAttendance = [...existingAttendance, newAttendance]
      .filter(a => new Date(a.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));

    const totalSessions = recentAttendance.length;
    const attendedSessions = recentAttendance.filter(a => 
      a.status === 'present' || a.status === 'late'
    ).length;

    return totalSessions > 0 ? (attendedSessions / totalSessions) * 10 : 10;
  }

  private transformCSVData(csvData: Record<string, any>): Record<string, any> {
    const updates: Record<string, any> = {};

    // Map CSV fields to schema fields
    const fieldMapping: Record<string, string> = {
      'First Name': 'personalDetails.firstName',
      'Last Name': 'personalDetails.lastName',
      'Email': 'personalDetails.email',
      'Phone': 'personalDetails.phone',
      'Address': 'personalDetails.address',
      'Jersey Number': 'rugbyProfile.jerseyNumber',
      'Primary Position': 'rugbyProfile.primaryPosition',
      'Years In Team': 'rugbyProfile.yearsInTeam',
      'Height (cm)': 'physicalAttributes.height',
      'Weight (kg)': 'physicalAttributes.weight',
      'Body Fat (%)': 'physicalAttributes.bodyFat',
      'Ball Handling': 'skills.ballHandling',
      'Passing': 'skills.passing',
      'Kicking': 'skills.kicking',
      'Defense': 'skills.defense',
      'Communication': 'skills.communication',
      'Fitness Status': 'status.fitness',
      'Medical Status': 'status.medical'
    };

    Object.entries(csvData).forEach(([csvField, value]) => {
      const schemaField = fieldMapping[csvField];
      if (schemaField && value !== undefined && value !== '') {
        // Convert numeric fields
        if (['jerseyNumber', 'yearsInTeam', 'height', 'weight'].some(f => schemaField.includes(f))) {
          updates[schemaField] = parseInt(value as string) || 0;
        } else if (['bodyFat', 'ballHandling', 'passing', 'kicking', 'defense', 'communication'].some(f => schemaField.includes(f))) {
          updates[schemaField] = parseFloat(value as string) || 0;
        } else {
          updates[schemaField] = value;
        }
      }
    });

    return updates;
  }

  private calculateGPSMetrics(gpsData: any): {
    fitnessLevel: number;
    trainingLoad: number;
    workRate: number;
  } {
    // Calculate fitness level based on GPS metrics
    const distancePerMinute = gpsData.totalDistance / gpsData.duration;
    const highIntensityPercent = (gpsData.totalDistanceZones.highSpeed + gpsData.totalDistanceZones.sprinting) / gpsData.totalDistance;
    
    let fitnessLevel = 5; // Base level
    
    // Adjust based on work rate
    if (distancePerMinute > 80) fitnessLevel += 2;
    else if (distancePerMinute > 60) fitnessLevel += 1;
    else if (distancePerMinute < 40) fitnessLevel -= 1;
    
    // Adjust based on high intensity running
    if (highIntensityPercent > 0.15) fitnessLevel += 1;
    else if (highIntensityPercent < 0.05) fitnessLevel -= 1;
    
    fitnessLevel = Math.max(1, Math.min(10, fitnessLevel));
    
    const trainingLoad = gpsData.playerLoad || 0;
    const workRate = distancePerMinute;
    
    return {
      fitnessLevel,
      trainingLoad,
      workRate
    };
  }

  /**
   * Handle real-time updates during live matches
   */
  async processLiveMatchUpdate(
    playerId: string,
    matchData: any,
    updatedBy: string = 'live_system'
  ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    const updates: Record<string, any> = {
      [`liveMatchData.${matchData.matchId}`]: matchData,
      'currentMatch.status': 'playing',
      'currentMatch.minutesPlayed': matchData.minutesPlayed,
      'currentMatch.liveStats': matchData.stats
    };

    return await dataIntegrityManager.processDataUpdate(
      playerId,
      updates,
      'api_call',
      updatedBy,
      'Live match data update'
    );
  }

  /**
   * Sync data from external APIs
   */
  async syncExternalData(
    playerId: string,
    dataSource: 'statsports' | 'gain_line' | 'google_sheets',
    data: any,
    updatedBy: string = 'system'
  ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    let updates: Record<string, any> = {};

    switch (dataSource) {
      case 'statsports':
        updates = this.transformStatSportsData(data);
        break;
      case 'gain_line':
        updates = this.transformGainLineData(data);
        break;
      case 'google_sheets':
        updates = this.transformGoogleSheetsData(data);
        break;
    }

    return await dataIntegrityManager.processDataUpdate(
      playerId,
      updates,
      'api_call',
      updatedBy,
      `External data sync from ${dataSource}`
    );
  }

  private transformStatSportsData(data: any): Record<string, any> {
    return {
      'gpsData': data.gpsMetrics,
      'physicalMetrics.workload': data.playerLoad,
      'physicalMetrics.maxSpeed': data.maxSpeed,
      'lastUpdated': new Date().toISOString()
    };
  }

  private transformGainLineData(data: any): Record<string, any> {
    return {
      'cohesionMetrics': data.cohesionData,
      'teamworkScore': data.teamworkRating,
      'leadershipRating': data.leadershipScore,
      'lastUpdated': new Date().toISOString()
    };
  }

  private transformGoogleSheetsData(data: any): Record<string, any> {
    // Transform Google Sheets data to match our schema
    return this.transformCSVData(data);
  }
}

export const dataUpdateService = new DataUpdateService();