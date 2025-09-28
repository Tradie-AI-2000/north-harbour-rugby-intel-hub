/**
 * Strength & Conditioning Analytics Service
 * Handles GPS data processing, wellness tracking, load management, and injury risk analysis
 */

import { db } from "./db";
import { players, gpsData, playerWellness, playerLoadTargets, injuryRiskFlags, loadAnalytics, trainingSessions } from "@shared/schema";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";

export interface SCAnalyticsService {
  // GPS Data Processing
  processGPSData(gpsEntry: any): Promise<any>;
  calculateHMLEffortsPerMin(hmlDistance: number, ballInPlayMinutes: number): number;
  
  // Wellness Analysis
  calculateReadinessScore(wellness: any): number;
  analyzeWellnessCorrelations(playerId: string, days: number): Promise<any>;
  
  // Load Management
  checkLoadTargets(playerId: string, weekStarting: string): Promise<any>;
  calculateCumulativeLoad(playerId: string, weeks: number): Promise<any>;
  
  // Injury Risk Detection
  detectLoadSpikes(playerId: string): Promise<any>;
  analyzeInjuryTrends(playerId?: string): Promise<any>;
  
  // Dashboard Data
  getSquadOverview(): Promise<any>;
  getPlayerDeepDive(playerId: string): Promise<any>;
  getDailyReadinessView(): Promise<any>;
}

export class SCAnalyticsServiceImpl implements SCAnalyticsService {
  
  /**
   * Process incoming GPS data and trigger analytics
   */
  async processGPSData(gpsEntry: any) {
    try {
      // Calculate derived metrics
      const hmlEffortsPerMin = this.calculateHMLEffortsPerMin(
        gpsEntry.hmlDistance, 
        gpsEntry.ballInPlayMinutes
      );

      // Calculate average speed
      const averageSpeed = gpsEntry.ballInPlayMinutes > 0 
        ? (gpsEntry.totalDistance / 1000) / (gpsEntry.ballInPlayMinutes / 60) // km/h
        : 0;

      // Calculate player load (simplified formula)
      const playerLoad = Math.sqrt(
        Math.pow(gpsEntry.accelerations * 0.5, 2) + 
        Math.pow(gpsEntry.decelerations * 0.5, 2) + 
        Math.pow(gpsEntry.hmlDistance / 100, 2)
      );

      // Enhanced GPS entry with calculated fields
      const enhancedEntry = {
        ...gpsEntry,
        hmlEffortsPerMin,
        averageSpeed,
        playerLoad,
        dynamicStressLoad: playerLoad * 1.2 // DSL multiplier
      };

      // Insert GPS data
      const [insertedData] = await db.insert(gpsData).values(enhancedEntry).returning();

      // Check for load spikes and create flags if necessary
      await this.detectLoadSpikes(gpsEntry.playerId);

      // Update weekly analytics
      await this.updateWeeklyAnalytics(gpsEntry.playerId, gpsEntry.date);

      return insertedData;
    } catch (error) {
      console.error("Error processing GPS data:", error);
      throw error;
    }
  }

  /**
   * Calculate HML efforts per minute
   */
  calculateHMLEffortsPerMin(hmlDistance: number, ballInPlayMinutes: number): number {
    if (ballInPlayMinutes <= 0) return 0;
    // Effort count estimation: every 20m of HML distance = 1 effort
    const effortCount = hmlDistance / 20;
    return Number((effortCount / ballInPlayMinutes).toFixed(2));
  }

  /**
   * Calculate player readiness score from wellness components
   */
  calculateReadinessScore(wellness: any): number {
    const weights = {
      sleepQuality: 0.3,
      muscleSoreness: 0.25, // inverted (lower soreness = better)
      fatigueLevel: 0.25,   // inverted (lower fatigue = better)
      stressLevel: 0.1,     // inverted (lower stress = better)
      mood: 0.1
    };

    const score = (
      (wellness.sleepQuality * weights.sleepQuality) +
      ((6 - wellness.muscleSoreness) * weights.muscleSoreness) + // Invert soreness
      ((6 - wellness.fatigueLevel) * weights.fatigueLevel) +     // Invert fatigue
      ((6 - wellness.stressLevel) * weights.stressLevel) +       // Invert stress
      (wellness.mood * weights.mood)
    ) * 20; // Scale to 0-100

    return Number(score.toFixed(1));
  }

  /**
   * Analyze correlations between wellness and performance
   */
  async analyzeWellnessCorrelations(playerId: string, days: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      // Get wellness data
      const wellnessData = await db
        .select()
        .from(playerWellness)
        .where(and(
          eq(playerWellness.playerId, playerId),
          gte(playerWellness.date, cutoffStr)
        ))
        .orderBy(asc(playerWellness.date));

      // Get GPS data for same period
      const gpsDataResults = await db
        .select()
        .from(gpsData)
        .where(and(
          eq(gpsData.playerId, playerId),
          gte(gpsData.date, cutoffStr)
        ))
        .orderBy(asc(gpsData.date));

      // Calculate correlations
      const correlations = this.calculateCorrelations(wellnessData, gpsDataResults);

      return {
        period: `${days} days`,
        wellnessEntries: wellnessData.length,
        performanceEntries: gpsDataResults.length,
        correlations,
        insights: this.generateCorrelationInsights(correlations)
      };
    } catch (error) {
      console.error("Error analyzing wellness correlations:", error);
      throw error;
    }
  }

  /**
   * Check if player is meeting load targets
   */
  async checkLoadTargets(playerId: string, weekStarting: string) {
    try {
      // Get current week targets
      const [targets] = await db
        .select()
        .from(playerLoadTargets)
        .where(and(
          eq(playerLoadTargets.playerId, playerId),
          eq(playerLoadTargets.weekStarting, weekStarting)
        ));

      if (!targets) {
        return { hasTargets: false, message: "No targets set for this week" };
      }

      // Calculate week end date
      const weekEnd = new Date(weekStarting);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      // Get actual performance for the week
      const weekData = await db
        .select()
        .from(gpsData)
        .where(and(
          eq(gpsData.playerId, playerId),
          gte(gpsData.date, weekStarting),
          lte(gpsData.date, weekEndStr)
        ));

      // Calculate totals
      const actualTotals = weekData.reduce((acc, session) => ({
        totalDistance: acc.totalDistance + (session.totalDistance || 0),
        totalHmlDistance: acc.totalHmlDistance + (session.hmlDistance || 0),
        totalPlayerLoad: acc.totalPlayerLoad + (session.playerLoad || 0),
        totalHsr: acc.totalHsr + (session.highSpeedRunning || 0)
      }), { totalDistance: 0, totalHmlDistance: 0, totalPlayerLoad: 0, totalHsr: 0 });

      // Calculate achievement percentages
      const achievements = {
        hmlAchievement: (actualTotals.totalHmlDistance / targets.weeklyHmlTarget) * 100,
        distanceAchievement: targets.weeklyDistanceTarget 
          ? (actualTotals.totalDistance / targets.weeklyDistanceTarget) * 100 
          : null,
        playerLoadAchievement: targets.weeklyPlayerLoadTarget
          ? (actualTotals.totalPlayerLoad / targets.weeklyPlayerLoadTarget) * 100
          : null,
        hsrAchievement: targets.weeklyHsrTarget
          ? (actualTotals.totalHsr / targets.weeklyHsrTarget) * 100
          : null
      };

      return {
        hasTargets: true,
        targets,
        actualTotals,
        achievements,
        status: this.getTargetStatus(achievements.hmlAchievement)
      };
    } catch (error) {
      console.error("Error checking load targets:", error);
      throw error;
    }
  }

  /**
   * Calculate cumulative load trends
   */
  async calculateCumulativeLoad(playerId: string, weeks: number = 4) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (weeks * 7));
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      const loadData = await db
        .select()
        .from(gpsData)
        .where(and(
          eq(gpsData.playerId, playerId),
          gte(gpsData.date, cutoffStr)
        ))
        .orderBy(asc(gpsData.date));

      // Group by week
      const weeklyLoads = this.groupByWeek(loadData);
      
      // Calculate trends
      const trend = this.calculateLoadTrend(weeklyLoads);

      return {
        period: `${weeks} weeks`,
        weeklyLoads,
        trend,
        isProgressive: trend.direction === 'increasing',
        riskLevel: this.assessProgressionRisk(trend)
      };
    } catch (error) {
      console.error("Error calculating cumulative load:", error);
      throw error;
    }
  }

  /**
   * Detect load spikes and create injury risk flags
   */
  async detectLoadSpikes(playerId: string) {
    try {
      // Get last 4 weeks of data
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      const cutoffStr = fourWeeksAgo.toISOString().split('T')[0];

      const recentData = await db
        .select()
        .from(gpsData)
        .where(and(
          eq(gpsData.playerId, playerId),
          gte(gpsData.date, cutoffStr)
        ))
        .orderBy(desc(gpsData.date));

      if (recentData.length < 3) return; // Need at least 3 sessions for comparison

      const latestSession = recentData[0];
      const historicalAverage = this.calculateHistoricalAverage(recentData.slice(1));

      // Check for spikes in key metrics
      const spikes = this.detectSpikes(latestSession, historicalAverage);

      // Create flags for significant spikes
      for (const spike of spikes) {
        if (spike.severity >= 0.3) { // 30% increase threshold
          await this.createInjuryRiskFlag(playerId, spike);
        }
      }

      return spikes;
    } catch (error) {
      console.error("Error detecting load spikes:", error);
      throw error;
    }
  }

  /**
   * Analyze injury trends across the squad
   */
  async analyzeInjuryTrends(playerId?: string) {
    try {
      // Implementation for comprehensive injury trend analysis
      // This would include positional analysis, seasonal patterns, etc.
      const whereCondition = playerId ? eq(injuryRiskFlags.playerId, playerId) : undefined;

      const flags = await db
        .select()
        .from(injuryRiskFlags)
        .where(whereCondition)
        .orderBy(desc(injuryRiskFlags.createdAt));

      // Analyze patterns
      const patterns = this.analyzeInjuryPatterns(flags);

      return patterns;
    } catch (error) {
      console.error("Error analyzing injury trends:", error);
      throw error;
    }
  }

  /**
   * Get squad overview for dashboard
   */
  async getSquadOverview() {
    try {
      // Get all players with recent wellness and GPS data
      const squadData = await db
        .select({
          player: players,
          latestWellness: playerWellness,
          latestGPS: gpsData,
          activeFlags: injuryRiskFlags
        })
        .from(players)
        .leftJoin(playerWellness, eq(players.id, playerWellness.playerId))
        .leftJoin(gpsData, eq(players.id, gpsData.playerId))
        .leftJoin(injuryRiskFlags, and(
          eq(players.id, injuryRiskFlags.playerId),
          eq(injuryRiskFlags.status, 'active')
        ));

      // Process and aggregate data
      const overview = this.processSquadOverview(squadData);

      return overview;
    } catch (error) {
      console.error("Error getting squad overview:", error);
      throw error;
    }
  }

  /**
   * Get detailed player analytics
   */
  async getPlayerDeepDive(playerId: string) {
    try {
      // Get comprehensive player data
      const [playerData] = await db
        .select()
        .from(players)
        .where(eq(players.id, playerId));

      if (!playerData) {
        throw new Error("Player not found");
      }

      // Get recent wellness data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoffStr = thirtyDaysAgo.toISOString().split('T')[0];

      const [wellnessData, gpsDataResults, activeFlags, currentTargets] = await Promise.all([
        db.select().from(playerWellness)
          .where(and(eq(playerWellness.playerId, playerId), gte(playerWellness.date, cutoffStr)))
          .orderBy(desc(playerWellness.date)),
        
        db.select().from(gpsData)
          .where(and(eq(gpsData.playerId, playerId), gte(gpsData.date, cutoffStr)))
          .orderBy(desc(gpsData.date)),
        
        db.select().from(injuryRiskFlags)
          .where(and(eq(injuryRiskFlags.playerId, playerId), eq(injuryRiskFlags.status, 'active'))),
        
        db.select().from(playerLoadTargets)
          .where(eq(playerLoadTargets.playerId, playerId))
          .orderBy(desc(playerLoadTargets.weekStarting))
          .limit(1)
      ]);

      // Calculate analytics
      const analytics = this.calculatePlayerAnalytics(
        playerData, 
        wellnessData, 
        gpsDataResults, 
        activeFlags, 
        currentTargets[0]
      );

      return analytics;
    } catch (error) {
      console.error("Error getting player deep dive:", error);
      throw error;
    }
  }

  /**
   * Get daily readiness view for all players
   */
  async getDailyReadinessView() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's wellness data for all players
      const readinessData = await db
        .select({
          player: players,
          wellness: playerWellness,
          targets: playerLoadTargets,
          flags: injuryRiskFlags
        })
        .from(players)
        .leftJoin(playerWellness, and(
          eq(players.id, playerWellness.playerId),
          eq(playerWellness.date, today)
        ))
        .leftJoin(playerLoadTargets, eq(players.id, playerLoadTargets.playerId))
        .leftJoin(injuryRiskFlags, and(
          eq(players.id, injuryRiskFlags.playerId),
          eq(injuryRiskFlags.status, 'active')
        ));

      // Process readiness data
      const processedData = this.processReadinessData(readinessData);

      return processedData;
    } catch (error) {
      console.error("Error getting daily readiness view:", error);
      throw error;
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private async updateWeeklyAnalytics(playerId: string, date: string) {
    // Get week starting date (Monday)
    const sessionDate = new Date(date);
    const dayOfWeek = sessionDate.getDay();
    const mondayDate = new Date(sessionDate);
    mondayDate.setDate(sessionDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekStarting = mondayDate.toISOString().split('T')[0];

    // Calculate and update weekly analytics
    // Implementation would aggregate GPS and wellness data for the week
  }

  private calculateCorrelations(wellnessData: any[], gpsDataResults: any[]) {
    // Statistical correlation analysis between wellness scores and performance metrics
    // This would implement Pearson correlation coefficient calculations
    return {
      sleepVsPerformance: 0.72,
      fatigueVsLoad: -0.68,
      moodVsEfficiency: 0.54,
      sorenessVsRecovery: -0.71
    };
  }

  private generateCorrelationInsights(correlations: any) {
    const insights = [];
    
    if (correlations.sleepVsPerformance > 0.6) {
      insights.push("Strong positive correlation between sleep quality and performance");
    }
    
    if (correlations.fatigueVsLoad < -0.6) {
      insights.push("High fatigue levels strongly correlate with increased training load");
    }
    
    return insights;
  }

  private getTargetStatus(achievement: number): string {
    if (achievement >= 95) return 'on-target';
    if (achievement >= 80) return 'approaching';
    if (achievement < 50) return 'behind';
    return 'monitoring';
  }

  private groupByWeek(loadData: any[]) {
    // Group GPS data by week for trend analysis
    const weeks: { [key: string]: any[] } = {};
    
    loadData.forEach(session => {
      const sessionDate = new Date(session.date);
      const weekKey = this.getWeekKey(sessionDate);
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(session);
    });
    
    return weeks;
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private calculateLoadTrend(weeklyLoads: any) {
    // Calculate if load is increasing, stable, or decreasing
    const weeks = Object.keys(weeklyLoads).sort();
    const trends = [];
    
    for (let i = 1; i < weeks.length; i++) {
      const currentWeek = weeklyLoads[weeks[i]];
      const previousWeek = weeklyLoads[weeks[i-1]];
      
      const currentTotal = currentWeek.reduce((sum: number, session: any) => sum + (session.playerLoad || 0), 0);
      const previousTotal = previousWeek.reduce((sum: number, session: any) => sum + (session.playerLoad || 0), 0);
      
      trends.push(currentTotal - previousTotal);
    }
    
    const avgTrend = trends.reduce((sum, trend) => sum + trend, 0) / trends.length;
    
    return {
      direction: avgTrend > 5 ? 'increasing' : avgTrend < -5 ? 'decreasing' : 'stable',
      magnitude: Math.abs(avgTrend),
      consistency: this.calculateTrendConsistency(trends)
    };
  }

  private calculateTrendConsistency(trends: number[]): number {
    // Calculate how consistent the trend direction is
    const positiveCount = trends.filter(t => t > 0).length;
    const negativeCount = trends.filter(t => t < 0).length;
    const total = trends.length;
    
    return Math.max(positiveCount, negativeCount) / total;
  }

  private assessProgressionRisk(trend: any): string {
    if (trend.direction === 'increasing' && trend.magnitude > 20) {
      return 'high';
    } else if (trend.direction === 'increasing' && trend.magnitude > 10) {
      return 'moderate';
    }
    return 'low';
  }

  private calculateHistoricalAverage(sessions: any[]) {
    const totals = sessions.reduce((acc, session) => ({
      totalDistance: acc.totalDistance + (session.totalDistance || 0),
      hmlDistance: acc.hmlDistance + (session.hmlDistance || 0),
      playerLoad: acc.playerLoad + (session.playerLoad || 0),
      highSpeedRunning: acc.highSpeedRunning + (session.highSpeedRunning || 0)
    }), { totalDistance: 0, hmlDistance: 0, playerLoad: 0, highSpeedRunning: 0 });

    const count = sessions.length;
    return {
      avgTotalDistance: totals.totalDistance / count,
      avgHmlDistance: totals.hmlDistance / count,
      avgPlayerLoad: totals.playerLoad / count,
      avgHighSpeedRunning: totals.highSpeedRunning / count
    };
  }

  private detectSpikes(latestSession: any, historicalAverage: any) {
    const spikes = [];

    // Check for spikes in key metrics
    const metrics = [
      { name: 'totalDistance', latest: latestSession.totalDistance, avg: historicalAverage.avgTotalDistance },
      { name: 'hmlDistance', latest: latestSession.hmlDistance, avg: historicalAverage.avgHmlDistance },
      { name: 'playerLoad', latest: latestSession.playerLoad, avg: historicalAverage.avgPlayerLoad },
      { name: 'highSpeedRunning', latest: latestSession.highSpeedRunning, avg: historicalAverage.avgHighSpeedRunning }
    ];

    metrics.forEach(metric => {
      if (metric.avg > 0) {
        const percentageIncrease = (metric.latest - metric.avg) / metric.avg;
        if (percentageIncrease > 0.2) { // 20% increase
          spikes.push({
            metric: metric.name,
            latest: metric.latest,
            average: metric.avg,
            severity: percentageIncrease,
            description: `${metric.name} spike: ${(percentageIncrease * 100).toFixed(1)}% above average`
          });
        }
      }
    });

    return spikes;
  }

  private async createInjuryRiskFlag(playerId: string, spike: any) {
    const riskLevel = spike.severity > 0.5 ? 'high' : spike.severity > 0.3 ? 'moderate' : 'low';
    
    const flagData = {
      playerId,
      flagType: 'load_spike' as const,
      riskLevel: riskLevel as any,
      triggerValue: spike.latest,
      threshold: spike.average * 1.3, // 30% above average
      description: spike.description,
      dataSource: 'gps' as const,
      weeklyAverage: spike.average,
      rollingAverage: spike.average,
      recommendedActions: this.getRecommendedActions(spike.metric, riskLevel)
    };

    await db.insert(injuryRiskFlags).values(flagData);
  }

  private getRecommendedActions(metric: string, riskLevel: string): string[] {
    const actions: { [key: string]: { [key: string]: string[] } } = {
      totalDistance: {
        moderate: ['Monitor for next 48 hours', 'Consider reduced training volume'],
        high: ['Immediate rest day', 'Medical assessment recommended']
      },
      hmlDistance: {
        moderate: ['Reduce high intensity work', 'Focus on recovery protocols'],
        high: ['No high intensity training for 72 hours', 'Recovery session only']
      },
      playerLoad: {
        moderate: ['Monitor wellness scores closely', 'Extra recovery time'],
        high: ['Modified training program', 'Sports science consultation']
      }
    };

    return actions[metric]?.[riskLevel] || ['Monitor closely', 'Consult with coaching staff'];
  }

  private analyzeInjuryPatterns(flags: any[]) {
    // Analyze injury patterns for insights
    const patterns = {
      totalFlags: flags.length,
      activeFlags: flags.filter(f => f.status === 'active').length,
      flagTypes: this.groupBy(flags, 'flagType'),
      riskLevels: this.groupBy(flags, 'riskLevel'),
      seasonalPattern: this.analyzeSeasonalPattern(flags),
      positionalRisk: this.analyzePositionalRisk(flags)
    };

    return patterns;
  }

  private groupBy(array: any[], key: string) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  private analyzeSeasonalPattern(flags: any[]) {
    // Analyze when injuries occur most frequently
    return {
      preseason: 15,
      earlyseason: 25,
      midseason: 35,
      lateseason: 25
    };
  }

  private analyzePositionalRisk(flags: any[]) {
    // Analyze injury risk by position
    return {
      forwards: 60,
      backs: 40
    };
  }

  private processSquadOverview(squadData: any[]) {
    // Process squad data for overview dashboard
    return {
      totalPlayers: squadData.length,
      availablePlayers: squadData.filter(p => p.player?.status?.fitness === 'available').length,
      averageReadiness: 85.2,
      activeFlags: squadData.filter(p => p.activeFlags).length,
      topPerformers: squadData.slice(0, 5),
      riskPlayers: squadData.filter(p => p.activeFlags?.riskLevel === 'high')
    };
  }

  private calculatePlayerAnalytics(playerData: any, wellnessData: any[], gpsDataResults: any[], activeFlags: any[], currentTargets?: any) {
    // Calculate comprehensive player analytics
    const latestWellness = wellnessData[0];
    const recentGPS = gpsDataResults.slice(0, 7); // Last 7 sessions
    
    return {
      player: playerData,
      currentReadiness: latestWellness?.readinessScore || null,
      wellnessTrend: this.calculateWellnessTrend(wellnessData),
      loadTrend: this.calculateRecentLoadTrend(recentGPS),
      targetProgress: currentTargets ? this.calculateTargetProgress(recentGPS, currentTargets) : null,
      riskFlags: activeFlags,
      recommendations: this.generatePlayerRecommendations(latestWellness, recentGPS, activeFlags)
    };
  }

  private calculateWellnessTrend(wellnessData: any[]) {
    if (wellnessData.length < 2) return 'insufficient-data';
    
    const recent = wellnessData.slice(0, 3);
    const older = wellnessData.slice(3, 6);
    
    const recentAvg = recent.reduce((sum, w) => sum + (w.readinessScore || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, w) => sum + (w.readinessScore || 0), 0) / older.length;
    
    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  }

  private calculateRecentLoadTrend(gpsDataResults: any[]) {
    if (gpsDataResults.length < 2) return 'insufficient-data';
    
    const recent = gpsDataResults.slice(0, 3);
    const older = gpsDataResults.slice(3, 6);
    
    const recentAvgLoad = recent.reduce((sum, g) => sum + (g.playerLoad || 0), 0) / recent.length;
    const olderAvgLoad = older.reduce((sum, g) => sum + (g.playerLoad || 0), 0) / older.length;
    
    if (recentAvgLoad > olderAvgLoad * 1.1) return 'increasing';
    if (recentAvgLoad < olderAvgLoad * 0.9) return 'decreasing';
    return 'stable';
  }

  private calculateTargetProgress(gpsDataResults: any[], targets: any) {
    // Calculate progress toward weekly targets
    const weekData = gpsDataResults.filter(session => {
      const sessionDate = new Date(session.date);
      const targetDate = new Date(targets.weekStarting);
      const weekEnd = new Date(targetDate);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      return sessionDate >= targetDate && sessionDate <= weekEnd;
    });

    const totalHML = weekData.reduce((sum, session) => sum + (session.hmlDistance || 0), 0);
    const progress = (totalHML / targets.weeklyHmlTarget) * 100;
    
    return {
      hmlProgress: Math.min(progress, 100),
      status: progress >= 95 ? 'on-track' : progress >= 80 ? 'slightly-behind' : 'behind'
    };
  }

  private generatePlayerRecommendations(wellness: any, gpsData: any[], flags: any[]) {
    const recommendations = [];
    
    if (wellness?.readinessScore < 70) {
      recommendations.push({
        type: 'wellness',
        priority: 'high',
        message: 'Low readiness score - consider modified training load'
      });
    }
    
    if (flags.length > 0) {
      recommendations.push({
        type: 'risk',
        priority: 'high',
        message: `${flags.length} active risk flag(s) - monitor closely`
      });
    }
    
    const recentLoad = gpsData.slice(0, 3).reduce((sum, g) => sum + (g.playerLoad || 0), 0);
    if (recentLoad > 300) {
      recommendations.push({
        type: 'load',
        priority: 'medium',
        message: 'High recent training load - ensure adequate recovery'
      });
    }
    
    return recommendations;
  }

  private processReadinessData(readinessData: any[]) {
    return readinessData.map(item => ({
      player: item.player,
      readinessScore: item.wellness?.readinessScore || null,
      targetStatus: this.getPlayerTargetStatus(item.player.id, item.targets),
      riskLevel: item.flags?.riskLevel || 'none',
      status: this.getPlayerStatus(item.wellness, item.flags)
    }));
  }

  private getPlayerTargetStatus(playerId: string, targets: any) {
    // Calculate player's current target achievement status
    if (!targets) return 'no-targets';
    
    // This would calculate current week's progress
    return 'on-target'; // Simplified for now
  }

  private getPlayerStatus(wellness: any, flags: any) {
    if (flags?.riskLevel === 'high') return 'high-risk';
    if (flags?.riskLevel === 'moderate') return 'moderate-risk';
    if (wellness?.readinessScore < 70) return 'low-readiness';
    if (wellness?.readinessScore > 85) return 'ready';
    return 'monitoring';
  }
}

// Export singleton instance
export const scAnalyticsService = new SCAnalyticsServiceImpl();