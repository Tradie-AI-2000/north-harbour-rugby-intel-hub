import { GPSData } from "@shared/schema";

/**
 * StatSports GPS Integration Service
 * Handles GPS data from StatSports player units for North Harbour Rugby
 */

interface StatSportsConfig {
  apiKey: string;
  baseUrl: string;
  teamId: string;
}

interface StatSportsSession {
  sessionId: string;
  playerId: string;
  playerName: string;
  sessionType: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  
  // Core metrics from StatSports API
  totalDistance: number;
  maxSpeed: number;
  averageSpeed: number;
  playerLoad: number;
  sprintCount: number;
  
  // Distance zones
  walkingDistance: number;
  joggingDistance: number;
  runningDistance: number;
  highSpeedDistance: number;
  sprintingDistance: number;
  
  // Accelerations/Decelerations
  lowAccelerations: number;
  mediumAccelerations: number;
  highAccelerations: number;
  lowDecelerations: number;
  mediumDecelerations: number;
  highDecelerations: number;
  
  // Heart rate (if connected)
  averageHeartRate?: number;
  maxHeartRate?: number;
  hrZone1Time?: number;
  hrZone2Time?: number;
  hrZone3Time?: number;
  hrZone4Time?: number;
  hrZone5Time?: number;
  
  // Impact data
  totalImpacts?: number;
  lightImpacts?: number;
  moderateImpacts?: number;
  heavyImpacts?: number;
  
  // Quality metrics
  dataQuality: number;
  signalStrength: number;
  satelliteCount?: number;
}

export class StatSportsGPSService {
  private config: StatSportsConfig;

  constructor(config: StatSportsConfig) {
    this.config = config;
  }

  /**
   * Fetch GPS sessions for a specific player
   */
  async getPlayerSessions(playerId: string, startDate: string, endDate: string): Promise<StatSportsSession[]> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/teams/${this.config.teamId}/players/${playerId}/sessions?start=${startDate}&end=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`StatSports API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.sessions || [];
    } catch (error) {
      console.error('Error fetching StatSports sessions:', error);
      throw error;
    }
  }

  /**
   * Fetch detailed GPS data for a specific session
   */
  async getSessionDetails(sessionId: string): Promise<StatSportsSession> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/sessions/${sessionId}/details`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`StatSports API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching StatSports session details:', error);
      throw error;
    }
  }

  /**
   * Fetch live GPS data during active sessions
   */
  async getLiveGPSData(sessionId: string): Promise<StatSportsSession> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/sessions/${sessionId}/live`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`StatSports API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching live StatSports data:', error);
      throw error;
    }
  }

  /**
   * Convert StatSports session to our GPS data format
   */
  convertToGPSData(session: StatSportsSession): GPSData {
    return {
      id: `gps_${session.sessionId}`,
      playerId: session.playerId,
      sessionId: session.sessionId,
      sessionType: this.mapSessionType(session.sessionType),
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      
      totalDistance: session.totalDistance,
      totalDistanceZones: {
        walking: session.walkingDistance,
        jogging: session.joggingDistance,
        running: session.runningDistance,
        highSpeed: session.highSpeedDistance,
        sprinting: session.sprintingDistance
      },
      
      maxSpeed: session.maxSpeed,
      averageSpeed: session.averageSpeed,
      sprintCount: session.sprintCount,
      sprintDistance: session.sprintingDistance,
      
      accelerations: {
        low: session.lowAccelerations,
        medium: session.mediumAccelerations,
        high: session.highAccelerations
      },
      decelerations: {
        low: session.lowDecelerations,
        medium: session.mediumDecelerations,
        high: session.highDecelerations
      },
      
      playerLoad: session.playerLoad,
      playerLoadPerMinute: session.playerLoad / session.duration,
      
      heartRate: session.averageHeartRate ? {
        average: session.averageHeartRate,
        maximum: session.maxHeartRate,
        zones: {
          zone1: session.hrZone1Time,
          zone2: session.hrZone2Time,
          zone3: session.hrZone3Time,
          zone4: session.hrZone4Time,
          zone5: session.hrZone5Time
        }
      } : undefined,
      
      impacts: session.totalImpacts ? {
        total: session.totalImpacts,
        light: session.lightImpacts || 0,
        moderate: session.moderateImpacts || 0,
        heavy: session.heavyImpacts || 0
      } : undefined,
      
      recovery: {
        restTime: this.calculateRestTime(session),
        workToRestRatio: this.calculateWorkToRestRatio(session)
      },
      
      qualityScores: {
        dataQuality: session.dataQuality,
        signalStrength: session.signalStrength,
        satelliteCount: session.satelliteCount
      },
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Map StatSports session types to our schema
   */
  private mapSessionType(statSportsType: string): "training" | "match" | "conditioning" | "recovery" {
    const typeMap: Record<string, "training" | "match" | "conditioning" | "recovery"> = {
      'training': 'training',
      'match': 'match',
      'game': 'match',
      'conditioning': 'conditioning',
      'fitness': 'conditioning',
      'recovery': 'recovery',
      'warmup': 'recovery'
    };
    
    return typeMap[statSportsType.toLowerCase()] || 'training';
  }

  /**
   * Calculate rest time based on low activity periods
   */
  private calculateRestTime(session: StatSportsSession): number {
    // Estimate rest time as walking distance converted to time
    const walkingSpeed = 3; // km/h average walking speed
    return (session.walkingDistance / 1000) / walkingSpeed * 60; // minutes
  }

  /**
   * Calculate work to rest ratio
   */
  private calculateWorkToRestRatio(session: StatSportsSession): number {
    const restTime = this.calculateRestTime(session);
    const workTime = session.duration - restTime;
    return restTime > 0 ? workTime / restTime : workTime;
  }

  /**
   * Get team roster with GPS unit assignments
   */
  async getTeamRoster(): Promise<Array<{playerId: string, playerName: string, unitId: string, isActive: boolean}>> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/teams/${this.config.teamId}/roster`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`StatSports API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.players || [];
    } catch (error) {
      console.error('Error fetching team roster:', error);
      throw error;
    }
  }

  /**
   * Sync GPS data for all players in a date range
   */
  async syncTeamGPSData(startDate: string, endDate: string): Promise<GPSData[]> {
    try {
      const roster = await this.getTeamRoster();
      const allGPSData: GPSData[] = [];

      for (const player of roster) {
        if (player.isActive) {
          const sessions = await this.getPlayerSessions(player.playerId, startDate, endDate);
          
          for (const session of sessions) {
            const detailedSession = await this.getSessionDetails(session.sessionId);
            const gpsData = this.convertToGPSData(detailedSession);
            allGPSData.push(gpsData);
          }
        }
      }

      return allGPSData;
    } catch (error) {
      console.error('Error syncing team GPS data:', error);
      throw error;
    }
  }
}

// Export service instance factory
export function createStatSportsService(apiKey: string, teamId: string): StatSportsGPSService {
  const config: StatSportsConfig = {
    apiKey,
    baseUrl: 'https://api.statsports.com', // StatSports API endpoint
    teamId
  };
  
  return new StatSportsGPSService(config);
}

// Export sample GPS data for testing (using real North Harbour player data)
export const sampleGPSData: GPSData[] = [
  {
    id: "gps_session_001",
    playerId: "james-mitchell",
    sessionId: "training_20240615_001",
    sessionType: "training",
    date: "2024-06-15",
    startTime: "09:00:00",
    endTime: "11:30:00",
    duration: 150, // 2.5 hours
    
    totalDistance: 8420, // meters
    totalDistanceZones: {
      walking: 2100,    // 25%
      jogging: 3200,    // 38%
      running: 2020,    // 24%
      highSpeed: 800,   // 9.5%
      sprinting: 300    // 3.5%
    },
    
    maxSpeed: 28.5, // km/h
    averageSpeed: 3.37, // km/h
    sprintCount: 12,
    sprintDistance: 300,
    
    accelerations: {
      low: 45,
      medium: 22,
      high: 8
    },
    decelerations: {
      low: 38,
      medium: 18,
      high: 6
    },
    
    playerLoad: 850,
    playerLoadPerMinute: 5.67,
    
    heartRate: {
      average: 145,
      maximum: 185,
      zones: {
        zone1: 25, // minutes
        zone2: 35,
        zone3: 45,
        zone4: 30,
        zone5: 15
      }
    },
    
    impacts: {
      total: 450,
      light: 320,
      moderate: 95,
      heavy: 35
    },
    
    recovery: {
      restTime: 18,
      workToRestRatio: 7.33
    },
    
    qualityScores: {
      dataQuality: 96,
      signalStrength: 92,
      satelliteCount: 14
    },
    
    createdAt: "2024-06-15T11:30:00Z",
    updatedAt: "2024-06-15T11:30:00Z"
  },
  {
    id: "gps_session_002",
    playerId: "penaia_cakobau",
    sessionId: "training_20240615_001",
    sessionType: "training",
    date: "2024-06-15",
    startTime: "09:00:00",
    endTime: "11:30:00",
    duration: 150, // 2.5 hours
    
    totalDistance: 8420, // meters
    totalDistanceZones: {
      walking: 2100,    // 25%
      jogging: 3200,    // 38%
      running: 2020,    // 24%
      highSpeed: 800,   // 9.5%
      sprinting: 300    // 3.5%
    },
    
    maxSpeed: 28.5, // km/h
    averageSpeed: 3.37, // km/h
    sprintCount: 12,
    sprintDistance: 300,
    
    accelerations: {
      low: 45,
      medium: 22,
      high: 8
    },
    decelerations: {
      low: 38,
      medium: 18,
      high: 6
    },
    
    playerLoad: 850,
    playerLoadPerMinute: 5.67,
    
    heartRate: {
      average: 145,
      maximum: 185,
      zones: {
        zone1: 25, // minutes
        zone2: 35,
        zone3: 45,
        zone4: 30,
        zone5: 15
      }
    },
    
    impacts: {
      total: 234,
      light: 180,
      moderate: 42,
      heavy: 12
    },
    
    recovery: {
      restTime: 42,
      workToRestRatio: 2.57
    },
    
    matchMetrics: {
      scrumsAttended: 8,
      lineoutsAttended: 12,
      rucksAttended: 25
    },
    
    qualityScores: {
      dataQuality: 94,
      signalStrength: 87,
      satelliteCount: 12
    },
    
    createdAt: "2024-06-15T11:30:00Z",
    updatedAt: "2024-06-15T11:30:00Z"
  }
];