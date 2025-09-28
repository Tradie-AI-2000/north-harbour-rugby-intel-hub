/**
 * Data Integrity Manager
 * Centralized system for maintaining data relationships and ensuring accuracy
 * across all data sources: manual entry, CSV uploads, API calls, and AI analysis
 */

import { db } from "./db";
import { players, type Player } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface DataUpdate {
  id: string;
  timestamp: string;
  source: 'manual' | 'csv_upload' | 'api_call' | 'ai_analysis' | 'medical_update' | 'physio_update';
  category: 'personal' | 'physical' | 'medical' | 'performance' | 'skills' | 'ai_rating' | 'availability';
  playerId: string;
  previousValue?: any;
  newValue: any;
  updatedBy: string;
  reason?: string;
  affectedMetrics: string[];
}

export interface DataValidationRule {
  field: string;
  validator: (value: any, player: Player) => boolean;
  errorMessage: string;
  dependencies?: string[];
}

export interface CascadingUpdate {
  sourceField: string;
  targetFields: string[];
  updateFunction: (sourceValue: any, player: Player) => Record<string, any>;
}

export class DataIntegrityManager {
  private validationRules: DataValidationRule[] = [];
  private cascadingUpdates: CascadingUpdate[] = [];
  private updateHistory: DataUpdate[] = [];

  constructor() {
    this.initializeValidationRules();
    this.initializeCascadingUpdates();
  }

  /**
   * Initialize validation rules for data consistency
   */
  private initializeValidationRules(): void {
    this.validationRules = [
      // Physical attribute validation
      {
        field: 'physicalAttributes.weight',
        validator: (weight: number) => weight > 40 && weight < 200,
        errorMessage: 'Weight must be between 40-200kg'
      },
      {
        field: 'physicalAttributes.bodyFat',
        validator: (bodyFat: number) => bodyFat >= 0 && bodyFat <= 50,
        errorMessage: 'Body fat percentage must be between 0-50%'
      },
      // Medical status validation
      {
        field: 'status.medical',
        validator: (status: string, player: Player) => {
          if (status === 'cleared' && player.injuries?.some(i => i.status === 'active')) {
            return false;
          }
          return true;
        },
        errorMessage: 'Cannot set medical status to cleared when active injuries exist',
        dependencies: ['injuries']
      },
      // Availability validation based on medical and fitness status
      {
        field: 'status.availability',
        validator: (availability: string, player: Player) => {
          if (availability === 'available' && 
              (player.status.medical === 'restricted' || player.status.fitness === 'injured')) {
            return false;
          }
          return true;
        },
        errorMessage: 'Player cannot be available with medical restrictions or injuries',
        dependencies: ['status.medical', 'status.fitness']
      },
      // Jersey number uniqueness
      {
        field: 'rugbyProfile.jerseyNumber',
        validator: async (jerseyNumber: number, player: Player) => {
          // This would need database check for uniqueness
          return jerseyNumber > 0 && jerseyNumber <= 99;
        },
        errorMessage: 'Jersey number must be between 1-99 and unique'
      }
    ];
  }

  /**
   * Initialize cascading update rules
   */
  private initializeCascadingUpdates(): void {
    this.cascadingUpdates = [
      // Medical updates affect player value analysis
      {
        sourceField: 'injuries',
        targetFields: ['playerValue.medicalScore', 'status.medical', 'status.availability'],
        updateFunction: (injuries: any[], player: Player) => {
          const activeInjuries = injuries.filter(i => i.status === 'active');
          const recentInjuries = injuries.filter(i => 
            new Date(i.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          );
          
          // Calculate medical score based on injury history
          let medicalScore = 10;
          medicalScore -= activeInjuries.length * 2;
          medicalScore -= recentInjuries.length * 0.5;
          medicalScore = Math.max(0, Math.min(10, medicalScore));

          return {
            'playerValue.medicalScore': medicalScore,
            'status.medical': activeInjuries.length > 0 ? 'restricted' : 'cleared',
            'status.availability': activeInjuries.length > 0 ? 'injured' : 'available'
          };
        }
      },
      // Physical attribute changes affect AI ratings
      {
        sourceField: 'physicalAttributes',
        targetFields: ['aiRating.physicality', 'playerValue.fitnessScore'],
        updateFunction: (physicalAttributes: any[], player: Player) => {
          const latest = physicalAttributes[physicalAttributes.length - 1];
          if (!latest) return {};

          // Calculate physicality rating based on position benchmarks
          const positionBenchmarks = this.getPositionBenchmarks(player.rugbyProfile.primaryPosition);
          let physicalityRating = 5; // Base rating
          
          if (latest.weight && positionBenchmarks.weight) {
            const weightRatio = latest.weight / positionBenchmarks.weight;
            physicalityRating += (weightRatio - 1) * 2; // Adjust based on position ideal
          }

          physicalityRating = Math.max(1, Math.min(10, physicalityRating));

          return {
            'aiRating.physicality': physicalityRating,
            'playerValue.fitnessScore': physicalityRating,
            'aiRating.lastUpdated': new Date().toISOString()
          };
        }
      },
      // Game stats updates affect overall AI rating
      {
        sourceField: 'gameStats',
        targetFields: ['aiRating.overall', 'aiRating.gameImpact', 'playerValue.performanceScore'],
        updateFunction: (gameStats: any[], player: Player) => {
          const latestSeason = gameStats[gameStats.length - 1];
          if (!latestSeason) return {};

          // Calculate performance metrics
          const triesPerGame = latestSeason.tries / Math.max(1, latestSeason.matchesPlayed);
          const tacklesPerGame = latestSeason.tackles / Math.max(1, latestSeason.matchesPlayed);
          const minutesPerGame = latestSeason.minutesPlayed / Math.max(1, latestSeason.matchesPlayed);

          // Position-specific weighting
          const positionWeights = this.getPositionWeights(player.rugbyProfile.primaryPosition);
          
          let gameImpact = 5;
          gameImpact += triesPerGame * positionWeights.tries;
          gameImpact += (tacklesPerGame / 10) * positionWeights.tackles;
          gameImpact += (minutesPerGame / 80) * 2; // Playing time importance

          gameImpact = Math.max(1, Math.min(10, gameImpact));

          const overall = (
            (player.aiRating?.physicality || 5) * 0.25 +
            (player.aiRating?.skillset || 5) * 0.25 +
            gameImpact * 0.5
          );

          return {
            'aiRating.gameImpact': gameImpact,
            'aiRating.overall': overall,
            'playerValue.performanceScore': gameImpact,
            'aiRating.lastUpdated': new Date().toISOString()
          };
        }
      },
      // Skills updates affect AI skillset rating
      {
        sourceField: 'skills',
        targetFields: ['aiRating.skillset', 'playerValue.skillsScore'],
        updateFunction: (skills: any, player: Player) => {
          const positionWeights = this.getPositionWeights(player.rugbyProfile.primaryPosition);
          
          let skillsetRating = 0;
          let totalWeight = 0;

          Object.entries(skills).forEach(([skill, value]) => {
            const weight = positionWeights[skill] || 1;
            skillsetRating += (value as number) * weight;
            totalWeight += weight;
          });

          skillsetRating = skillsetRating / totalWeight;

          return {
            'aiRating.skillset': skillsetRating,
            'playerValue.skillsScore': skillsetRating,
            'aiRating.lastUpdated': new Date().toISOString()
          };
        }
      },
      // Medical appointments/compliance affects attendance score
      {
        sourceField: 'medicalAppointments',
        targetFields: ['playerValue.attendanceScore', 'cohesionMetrics.reliability'],
        updateFunction: (appointments: any[], player: Player) => {
          const recentAppointments = appointments.filter(a => 
            new Date(a.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          );
          
          const missedAppointments = recentAppointments.filter(a => a.status === 'missed');
          const attendanceRate = 1 - (missedAppointments.length / Math.max(1, recentAppointments.length));
          
          const attendanceScore = attendanceRate * 10;
          
          return {
            'playerValue.attendanceScore': attendanceScore,
            'cohesionMetrics.reliability': attendanceScore,
            'cohesionMetrics.lastUpdated': new Date().toISOString()
          };
        }
      }
    ];
  }

  /**
   * Process a data update with full integrity checking
   */
  async processDataUpdate(
    playerId: string,
    updates: Record<string, any>,
    source: DataUpdate['source'],
    updatedBy: string,
    reason?: string
  ): Promise<{ success: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Get current player data
      const [currentPlayer] = await db.select().from(players).where(eq(players.id, playerId));
      if (!currentPlayer) {
        errors.push('Player not found');
        return { success: false, errors, warnings };
      }

      // Validate updates
      const validationResults = await this.validateUpdates(updates, currentPlayer);
      errors.push(...validationResults.errors);
      warnings.push(...validationResults.warnings);

      if (errors.length > 0) {
        return { success: false, errors, warnings };
      }

      // Apply cascading updates
      const cascadingResults = await this.applyCascadingUpdates(updates, currentPlayer);
      const finalUpdates = { ...updates, ...cascadingResults };

      // Record the update
      const updateRecord: DataUpdate = {
        id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        source,
        category: this.categorizeUpdate(updates),
        playerId,
        previousValue: this.extractPreviousValues(updates, currentPlayer),
        newValue: finalUpdates,
        updatedBy,
        reason,
        affectedMetrics: this.getAffectedMetrics(finalUpdates)
      };

      this.updateHistory.push(updateRecord);

      // Apply updates to database
      const updatedPlayer = this.mergeUpdates(currentPlayer, finalUpdates);
      await db.update(players).set(updatedPlayer).where(eq(players.id, playerId));

      // Log significant changes
      if (this.isSignificantChange(updates)) {
        await this.logSignificantChange(updateRecord);
      }

      return { success: true, errors: [], warnings };

    } catch (error) {
      errors.push(`Database error: ${error.message}`);
      return { success: false, errors, warnings };
    }
  }

  /**
   * Validate updates against business rules
   */
  private async validateUpdates(
    updates: Record<string, any>,
    currentPlayer: Player
  ): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of this.validationRules) {
      const fieldValue = this.getNestedValue(updates, rule.field);
      if (fieldValue !== undefined) {
        const isValid = await rule.validator(fieldValue, currentPlayer);
        if (!isValid) {
          errors.push(rule.errorMessage);
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Apply cascading updates based on primary field changes
   */
  private async applyCascadingUpdates(
    updates: Record<string, any>,
    currentPlayer: Player
  ): Promise<Record<string, any>> {
    const cascadingResults: Record<string, any> = {};

    for (const cascade of this.cascadingUpdates) {
      const sourceValue = this.getNestedValue(updates, cascade.sourceField);
      if (sourceValue !== undefined) {
        const cascadeUpdates = cascade.updateFunction(sourceValue, currentPlayer);
        Object.assign(cascadingResults, cascadeUpdates);
      }
    }

    return cascadingResults;
  }

  /**
   * Get position-specific benchmarks for validation
   */
  private getPositionBenchmarks(position: string): Record<string, number> {
    const benchmarks: Record<string, Record<string, number>> = {
      'Prop': { weight: 115, height: 185, benchPress: 140, squat: 180 },
      'Hooker': { weight: 105, height: 180, benchPress: 130, squat: 170 },
      'Lock': { weight: 110, height: 200, benchPress: 135, squat: 175 },
      'Flanker': { weight: 100, height: 190, benchPress: 125, squat: 165 },
      'Number 8': { weight: 105, height: 195, benchPress: 130, squat: 170 },
      'Scrum-half': { weight: 80, height: 175, benchPress: 100, squat: 140 },
      'Fly-half': { weight: 85, height: 180, benchPress: 105, squat: 145 },
      'Centre': { weight: 95, height: 185, benchPress: 120, squat: 160 },
      'Wing': { weight: 85, height: 180, benchPress: 105, squat: 145 },
      'Fullback': { weight: 90, height: 182, benchPress: 115, squat: 155 }
    };

    return benchmarks[position] || benchmarks['Centre'];
  }

  /**
   * Get position-specific weights for skill importance
   */
  private getPositionWeights(position: string): Record<string, number> {
    const weights: Record<string, Record<string, number>> = {
      'Prop': { strength: 3, scrummaging: 3, ballHandling: 1, tries: 0.5, tackles: 2 },
      'Hooker': { ballHandling: 2, lineoutThrowing: 3, communication: 2, tries: 1, tackles: 2 },
      'Lock': { lineout: 3, rucking: 2, communication: 2, tries: 1, tackles: 2.5 },
      'Flanker': { rucking: 3, defense: 2.5, ballHandling: 2, tries: 2, tackles: 3 },
      'Number 8': { ballHandling: 2.5, rucking: 2, passing: 2, tries: 2.5, tackles: 2.5 },
      'Scrum-half': { passing: 3, communication: 3, ballHandling: 2.5, tries: 2, tackles: 1.5 },
      'Fly-half': { kicking: 3, passing: 3, communication: 2.5, tries: 2.5, tackles: 1.5 },
      'Centre': { defense: 2.5, ballHandling: 2.5, passing: 2, tries: 2.5, tackles: 2.5 },
      'Wing': { ballHandling: 2, speed: 3, tries: 3, tackles: 1.5 },
      'Fullback': { kicking: 2.5, ballHandling: 2.5, communication: 2, tries: 2.5, tackles: 2 }
    };

    return weights[position] || weights['Centre'];
  }

  /**
   * Helper functions for data manipulation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private categorizeUpdate(updates: Record<string, any>): DataUpdate['category'] {
    const keys = Object.keys(updates);
    if (keys.some(k => k.startsWith('personalDetails'))) return 'personal';
    if (keys.some(k => k.startsWith('physicalAttributes'))) return 'physical';
    if (keys.some(k => k.startsWith('injuries') || k.startsWith('medicalAppointments'))) return 'medical';
    if (keys.some(k => k.startsWith('gameStats') || k.startsWith('gpsData'))) return 'performance';
    if (keys.some(k => k.startsWith('skills'))) return 'skills';
    if (keys.some(k => k.startsWith('aiRating'))) return 'ai_rating';
    if (keys.some(k => k.startsWith('status'))) return 'availability';
    return 'personal';
  }

  private extractPreviousValues(updates: Record<string, any>, currentPlayer: Player): any {
    const previous: any = {};
    Object.keys(updates).forEach(key => {
      previous[key] = this.getNestedValue(currentPlayer, key);
    });
    return previous;
  }

  private getAffectedMetrics(updates: Record<string, any>): string[] {
    const affected: string[] = [];
    Object.keys(updates).forEach(key => {
      if (key.startsWith('playerValue')) affected.push('Player Value Analysis');
      if (key.startsWith('aiRating')) affected.push('AI Performance Rating');
      if (key.startsWith('cohesionMetrics')) affected.push('Team Cohesion Score');
      if (key.startsWith('status')) affected.push('Availability Status');
    });
    return [...new Set(affected)];
  }

  private mergeUpdates(currentPlayer: Player, updates: Record<string, any>): Player {
    const merged = JSON.parse(JSON.stringify(currentPlayer));
    Object.entries(updates).forEach(([key, value]) => {
      this.setNestedValue(merged, key, value);
    });
    return merged;
  }

  private isSignificantChange(updates: Record<string, any>): boolean {
    const significantFields = [
      'status.medical', 'status.availability', 'injuries',
      'aiRating.overall', 'playerValue.totalScore'
    ];
    return Object.keys(updates).some(key => 
      significantFields.some(field => key.startsWith(field))
    );
  }

  private async logSignificantChange(updateRecord: DataUpdate): Promise<void> {
    // Log to audit trail, send notifications to relevant staff
    console.log('Significant player data change:', {
      playerId: updateRecord.playerId,
      category: updateRecord.category,
      source: updateRecord.source,
      affectedMetrics: updateRecord.affectedMetrics,
      timestamp: updateRecord.timestamp
    });
  }

  /**
   * Get update history for a player
   */
  getPlayerUpdateHistory(playerId: string, limit: number = 50): DataUpdate[] {
    return this.updateHistory
      .filter(update => update.playerId === playerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Generate data integrity report
   */
  async generateIntegrityReport(playerId: string): Promise<{
    consistencyScore: number;
    issues: string[];
    recommendations: string[];
    lastValidation: string;
  }> {
    const [player] = await db.select().from(players).where(eq(players.id, playerId));
    if (!player) {
      throw new Error('Player not found');
    }

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check data consistency
    const latestPhysical = player.physicalAttributes?.[player.physicalAttributes.length - 1];
    const latestStats = player.gameStats?.[player.gameStats.length - 1];

    // Medical status consistency
    if (player.status.medical === 'cleared' && player.injuries?.some(i => i.status === 'active')) {
      issues.push('Medical status shows cleared but active injuries exist');
      recommendations.push('Review and update medical status or injury records');
    }

    // AI rating freshness
    if (player.aiRating?.lastUpdated) {
      const daysSinceUpdate = (Date.now() - new Date(player.aiRating.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 30) {
        issues.push('AI rating has not been updated in over 30 days');
        recommendations.push('Schedule AI rating refresh');
      }
    }

    // Data completeness
    if (!latestPhysical) {
      issues.push('No recent physical attributes recorded');
      recommendations.push('Schedule physical assessment');
    }

    if (!latestStats) {
      issues.push('No game statistics recorded');
      recommendations.push('Update match performance data');
    }

    const consistencyScore = Math.max(0, 100 - (issues.length * 10));

    return {
      consistencyScore,
      issues,
      recommendations,
      lastValidation: new Date().toISOString()
    };
  }
}

export const dataIntegrityManager = new DataIntegrityManager();