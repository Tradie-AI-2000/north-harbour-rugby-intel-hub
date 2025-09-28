import { Request, Response } from "express";
import { db } from "./firebase";
import { 
  FIRESTORE_COLLECTIONS,
  FirestorePlayer,
  FirestoreGpsData,
  FirestoreOptaMatchStats,
  FirestoreTrainingSession,
  FirestoreGame,
  FirestoreStaffNote,
  FirestoreAiInsight,
  FirestoreSnapshot,
  FirestoreMedicalData,
  FirestoreVideoEvent,
  FirestoreVideoUpload,
  firestorePlayerSchema,
  firestoreGpsDataSchema,
  firestoreOptaMatchStatsSchema,
  firestoreTrainingSessionSchema,
  firestoreGameSchema,
  firestoreStaffNoteSchema,
  firestoreAiInsightSchema,
  firestoreSnapshotSchema,
  firestoreMedicalDataSchema,
  firestoreVideoEventSchema,
  firestoreVideoUploadSchema,
  validateFirestoreDocument,
  generateGpsDataId,
  generateMatchStatsId,
  generateMedicalDataId,
  generateVideoEventId,
  generateVideoUploadId
} from "@shared/firebase-firestore-schema";

// ==========================================
// COMPLETE FIREBASE API ARCHITECTURE
// North Harbour Rugby Performance Hub
// Single Source of Truth API Layer
// ==========================================

// PLAYERS API - Central Player Management
export class PlayersAPI {
  
  // GET /api/v2/players - Fetch all players (validation bypassed for integrity testing)
  static async getAllPlayers(req: Request, res: Response) {
    try {
      const snapshot = await db.collection(FIRESTORE_COLLECTIONS.PLAYERS).get();
      const players: any[] = [];
      
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        players.push(data); // Bypass validation for debugging
      });
      
      // Sort by jersey number for consistent ordering
      players.sort((a, b) => (a.jerseyNumber || 99) - (b.jerseyNumber || 99));
      
      console.log(`✅ Firebase v2 API returning ${players.length} players without validation`);
      
      res.json({
        success: true,
        count: players.length,
        players: players
      });
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch players",
        details: error.message 
      });
    }
  }
  
  // GET /api/players/:id (Legacy) OR /api/v2/players/:playerId - Fetch single player
  static async getPlayer(req: Request, res: Response) {
    try {
      // Support both :id (legacy) and :playerId (v2) parameter names
      const playerId = req.params.playerId || req.params.id;
      console.log(`🔍 FIREBASE API: Fetching player data for ID: ${playerId}`);
      const doc = await db.collection(FIRESTORE_COLLECTIONS.PLAYERS).doc(playerId).get();
      
      if (!doc.exists) {
        return res.status(404).json({ 
          success: false, 
          error: "Player not found" 
        });
      }
      
      const playerData = { id: doc.id, ...doc.data() };
      console.log(`🔍 Raw player data for ${playerId}:`, JSON.stringify(playerData, null, 2));
      
      // Temporarily bypass validation to see raw data structure
      res.json({
        success: true,
        player: playerData,
        note: "Validation bypassed for debugging"
      });
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch player",
        details: error.message 
      });
    }
  }
  
  // PUT /api/v2/players/:playerId/availability - Update medical availability
  static async updateAvailability(req: Request, res: Response) {
    try {
      const { playerId } = req.params;
      const { status, detail, expectedReturn, updatedBy } = req.body;
      
      const updateData = {
        'availability.status': status,
        'availability.detail': detail || null,
        'availability.expectedReturn': expectedReturn || null,
        'availability.lastUpdated': new Date().toISOString(),
        'availability.updatedBy': updatedBy || 'system',
        updatedAt: new Date().toISOString()
      };
      
      await db.collection(FIRESTORE_COLLECTIONS.PLAYERS)
        .doc(playerId)
        .update(updateData);
      
      console.log(`🏥 MEDICAL API: Updated availability for ${playerId}:`, { status, detail, updatedBy });
      
      res.json({
        success: true,
        message: `Player availability updated to ${status}`,
        playerId: playerId,
        availability: {
          status,
          detail,
          expectedReturn,
          lastUpdated: updateData['availability.lastUpdated'],
          updatedBy
        }
      });
    } catch (error) {
      console.error("Error updating player availability:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to update availability",
        details: error.message 
      });
    }
  }
  
  // GET /api/players - Get condensed player info for squad displays (FIXED FOR NESTED STRUCTURE)
  static async getSquadStatus(req: Request, res: Response) {
    try {
      console.log('🔥 FIREBASE V2 API: Fetching squad status from players collection...');
      
      // Get all players without field selection due to nested structure
      const snapshot = await db.collection(FIRESTORE_COLLECTIONS.PLAYERS).get();
      
      const squadData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`🔍 Processing player ${doc.id}:`, {
          firstName: data.personalDetails?.firstName,
          lastName: data.personalDetails?.lastName,
          primaryPosition: data.primaryPosition
        });
        
        return {
          id: doc.id,
          personalDetails: {
            firstName: data.personalDetails?.firstName || '',
            lastName: data.personalDetails?.lastName || '',
            fullName: data.personalDetails?.fullName || `${data.personalDetails?.firstName || ''} ${data.personalDetails?.lastName || ''}`.trim(),
            jerseyNumber: data.jerseyNumber || 99,
            position: data.primaryPosition || 'Position TBD'
          },
          currentStatus: data.availability?.status || 'Available',
          status: {
            fitness: data.availability?.status === 'Available' ? 'available' : 'unavailable',
            medical: data.availability?.status === 'Available' ? 'cleared' : 'restricted'
          }
        };
      });
      
      console.log(`✅ Returning ${squadData.length} players from Firebase V2 API`);
      res.json(squadData);
    } catch (error) {
      console.error("Error fetching squad status:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch squad status",
        details: error.message 
      });
    }
  }
}

// GPS DATA API - StatSports Integration
export class GpsDataAPI {
  
  // GET /api/v2/gps-data - Get all GPS data sessions
  static async getAllSessions(req: Request, res: Response) {
    try {
      const sessionsSnapshot = await db.collection(FIRESTORE_COLLECTIONS.GPS_DATA).get();
      
      const sessions = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json({
        sessions,
        count: sessions.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Error fetching GPS sessions:", error);
      res.status(500).json({ 
        error: "Failed to fetch GPS sessions",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  
  // GET /api/v2/training-workrate/latest - Latest training session with GPS data
  static async getLatestSession(req: Request, res: Response) {
    try {
      console.log('🔍 Fetching latest training session...');
      
      // Get all sessions to avoid index requirements - then sort in memory
      const sessionSnapshot = await db.collection(FIRESTORE_COLLECTIONS.TRAINING_SESSIONS)
        .limit(20)
        .get();
      
      if (sessionSnapshot.empty) {
        return res.status(404).json({ 
          success: false, 
          error: "No training sessions found" 
        });
      }
      
      // Sort sessions by date in memory and find most recent
      const allSessions = sessionSnapshot.docs.map(doc => ({
        doc,
        data: doc.data(),
        timestamp: new Date(doc.data().sessionDate || doc.data().uploadTimestamp || 0).getTime()
      }));
      
      // Sort by timestamp descending
      allSessions.sort((a, b) => b.timestamp - a.timestamp);
      
      const sessionDoc = allSessions[0]?.doc;
      if (!sessionDoc) {
        return res.status(404).json({ 
          success: false, 
          error: "No training sessions found" 
        });
      }
      
      const sessionData = { id: sessionDoc.id, ...sessionDoc.data() } as any;
      
      // Get GPS data for all participants in this session using gps_data collection
      const gpsSnapshot = await db.collection(FIRESTORE_COLLECTIONS.GPS_DATA)
        .where('sessionId', '==', sessionDoc.id)
        .get();
      
      const playerData: any[] = [];
      
      for (const gpsDoc of gpsSnapshot.docs) {
        const gpsData = gpsDoc.data() as any;
        
        playerData.push({
          playerId: gpsData.playerId,
          playerName: gpsData.playerName,
          position: 'Unknown', // Position data would need to be joined from players collection
          totalDistance: gpsData.metrics?.totalDistance || 0,
          sprintDistance: gpsData.metrics?.sprintDistance || 0,
          playerLoad: gpsData.metrics?.playerLoad || 0,
          maxSpeed: gpsData.metrics?.maxSpeed || 0,
          accelerations: gpsData.metrics?.accelerations || 0,
          decelerations: gpsData.metrics?.decelerations || 0,
          impactCount: gpsData.metrics?.impactCount || 0
        });
      }
      
      console.log(`✅ Found session ${sessionDoc.id} with ${playerData.length} player records`);
      
      res.json({
        success: true,
        session: {
          sessionId: sessionDoc.id,
          sessionDate: sessionData.sessionDate || sessionData.sessionName,
          sessionTitle: sessionData.sessionName,
          week: sessionData.weekId,
          status: sessionData.status,
          temperature: sessionData.temperature,
          participantCount: sessionData.participantCount
        },
        playerData: playerData
      });
      
    } catch (error) {
      console.error("Error fetching latest session:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch latest session",
        details: error.message 
      });
    }
  }
  
  // POST /api/v2/gps-data/upload - Upload GPS data
  static async uploadGpsData(req: Request, res: Response) {
    try {
      const { sessionId, playerDataList } = req.body;
      
      const uploadResults = [];
      
      for (const playerGpsData of playerDataList) {
        const docId = generateGpsDataId(playerGpsData.playerId, sessionId);
        
        const gpsDocument: FirestoreGpsData = {
          playerRef: `/players/${playerGpsData.playerId}`,
          sessionRef: `/training_sessions/${sessionId}`,
          playerId: playerGpsData.playerId,
          sessionId: sessionId,
          date: new Date().toISOString(),
          sessionType: playerGpsData.sessionType || 'training',
          gpsMetrics: {
            totalDistance: playerGpsData.totalDistance,
            metresPerMinute: playerGpsData.metresPerMinute,
            highSpeedRunningDistance: playerGpsData.highSpeedRunningDistance,
            sprintDistance: playerGpsData.sprintDistance,
            maxVelocity: playerGpsData.maxVelocity,
            accelerations: playerGpsData.accelerations,
            decelerations: playerGpsData.decelerations,
            dynamicStressLoad: playerGpsData.dynamicStressLoad,
            impacts: playerGpsData.impacts,
            highMetabolicLoadDistance: playerGpsData.highMetabolicLoadDistance,
            involvements: playerGpsData.involvements,
            acwr: playerGpsData.acwr,
            personalDSLAverage: playerGpsData.personalDSLAverage,
            positionalDSLAverage: playerGpsData.positionalDSLAverage,
            loadStatus: playerGpsData.loadStatus,
            performanceStatus: playerGpsData.performanceStatus,
            dataQuality: playerGpsData.dataQuality,
            satelliteCount: playerGpsData.satelliteCount,
            signalStrength: playerGpsData.signalStrength
          },
          uploadedAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
          dataSource: 'StatSports'
        };
        
        await db.collection(FIRESTORE_COLLECTIONS.GPS_DATA)
          .doc(docId)
          .set(gpsDocument);
        
        // Update player's latest GPS reference
        await db.collection(FIRESTORE_COLLECTIONS.PLAYERS)
          .doc(playerGpsData.playerId)
          .update({
            latestGpsRef: docId,
            updatedAt: new Date().toISOString()
          });
        
        uploadResults.push({ playerId: playerGpsData.playerId, status: 'success' });
      }
      
      res.json({
        success: true,
        message: `GPS data uploaded for ${uploadResults.length} players`,
        sessionId: sessionId,
        results: uploadResults
      });
      
    } catch (error) {
      console.error("Error uploading GPS data:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to upload GPS data",
        details: error.message 
      });
    }
  }
  
  // GET /api/v2/gps-data/player/:playerId - Get player GPS history
  static async getPlayerGpsHistory(req: Request, res: Response) {
    try {
      const { playerId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const snapshot = await db.collection(FIRESTORE_COLLECTIONS.GPS_DATA)
        .where('playerId', '==', playerId)
        .orderBy('date', 'desc')
        .limit(limit)
        .get();
      
      const gpsHistory = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json({
        success: true,
        playerId: playerId,
        count: gpsHistory.length,
        gpsHistory: gpsHistory
      });
      
    } catch (error) {
      console.error("Error fetching GPS history:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch GPS history",
        details: error.message 
      });
    }
  }
}

// TRAINING SESSIONS API - Session Management
export class TrainingSessionsAPI {
  
  // POST /api/v2/training-sessions - Create new training session
  static async createSession(req: Request, res: Response) {
    try {
      const sessionData = req.body;
      
      const session: FirestoreTrainingSession = {
        sessionDate: sessionData.sessionDate,
        sessionTitle: sessionData.sessionTitle,
        week: sessionData.week,
        day: sessionData.day,
        sessionType: sessionData.sessionType,
        location: sessionData.location,
        duration: sessionData.duration,
        weather: sessionData.weather,
        temperature: sessionData.temperature,
        windSpeed: sessionData.windSpeed,
        pitchCondition: sessionData.pitchCondition,
        participantCount: sessionData.participantCount,
        participants: sessionData.participants,
        coachingStaff: sessionData.coachingStaff,
        objectives: sessionData.objectives,
        plannedIntensity: sessionData.plannedIntensity,
        plannedLoad: sessionData.plannedLoad,
        coachNotes: sessionData.coachNotes,
        status: 'Planned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: sessionData.createdBy
      };
      
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.TRAINING_SESSIONS).add(session);
      
      res.json({
        success: true,
        message: "Training session created successfully",
        sessionId: docRef.id
      });
      
    } catch (error) {
      console.error("Error creating training session:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to create training session",
        details: error.message 
      });
    }
  }
  
  // PUT /api/v2/training-sessions/:sessionId/notes - Update session notes
  static async updateSessionNotes(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { coachNotes, sessionQuality, actualIntensity, actualLoad, weatherImpact } = req.body;
      
      await db.collection(FIRESTORE_COLLECTIONS.TRAINING_SESSIONS)
        .doc(sessionId)
        .update({
          coachNotes,
          sessionQuality,
          actualIntensity,
          actualLoad,
          weatherImpact,
          updatedAt: new Date().toISOString()
        });
      
      res.json({
        success: true,
        message: "Session notes updated successfully"
      });
      
    } catch (error) {
      console.error("Error updating session notes:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to update session notes",
        details: error.message 
      });
    }
  }
}

// STAFF NOTES API - Staff Observations
export class StaffNotesAPI {
  
  // POST /api/v2/staff-notes - Create staff note
  static async createStaffNote(req: Request, res: Response) {
    try {
      const { playerId, sessionId, note, noteType, staffId, staffName, staffRole, visibility, priority, actionRequired } = req.body;
      
      const staffNote: FirestoreStaffNote = {
        playerId,
        sessionId,
        note,
        noteType,
        staffId,
        staffName,
        staffRole,
        visibility,
        priority: priority || 'medium',
        actionRequired: actionRequired || false,
        actionTaken: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.STAFF_NOTES).add(staffNote);
      
      res.json({
        success: true,
        message: "Staff note created successfully",
        noteId: docRef.id
      });
      
    } catch (error) {
      console.error("Error creating staff note:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to create staff note",
        details: error.message 
      });
    }
  }
  
  // GET /api/v2/staff-notes/player/:playerId - Get notes for specific player
  static async getPlayerNotes(req: Request, res: Response) {
    try {
      const { playerId } = req.params;
      const { visibility } = req.query;
      
      let query = db.collection(FIRESTORE_COLLECTIONS.STAFF_NOTES)
        .where('playerId', '==', playerId);
      
      if (visibility) {
        query = query.where('visibility', '==', visibility);
      }
      
      const snapshot = await query
        .orderBy('createdAt', 'desc')
        .get();
      
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json({
        success: true,
        playerId: playerId,
        count: notes.length,
        notes: notes
      });
      
    } catch (error) {
      console.error("Error fetching player notes:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch player notes",
        details: error.message 
      });
    }
  }
}

// AI INSIGHTS API - AI Analysis
export class AIInsightsAPI {
  
  // GET /api/v2/ai/training-insights - Get AI analysis for training sessions
  static async getTrainingInsights(req: Request, res: Response) {
    try {
      const { sessionId, analysisType } = req.query;
      
      let query = db.collection(FIRESTORE_COLLECTIONS.AI_INSIGHTS);
      
      if (sessionId) {
        query = query.where('sessionId', '==', sessionId);
      }
      
      if (analysisType) {
        query = query.where('analysisType', '==', analysisType);
      }
      
      const snapshot = await query
        .orderBy('generatedAt', 'desc')
        .limit(10)
        .get();
      
      if (snapshot.empty) {
        // Generate new insights for the session
        const insights = await AIInsightsAPI.generateSessionInsights(sessionId as string);
        return res.json(insights);
      }
      
      const insights = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      res.json({
        success: true,
        insights: insights
      });
      
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch AI insights",
        details: error.message 
      });
    }
  }
  
  // Generate AI insights for a session
  static async generateSessionInsights(sessionId: string): Promise<any> {
    try {
      // Mock AI analysis for demonstration
      const insight: FirestoreAiInsight = {
        sessionId: sessionId,
        analysisType: 'anomalies',
        anomalies: [
          {
            player: "Jake Thompson",
            metric: "HSR",
            description: "High-speed running 3.2 standard deviations below season average",
            severity: "high",
            recommendation: "Monitor for fatigue signs, consider 20% load reduction",
            confidence: 0.87
          }
        ],
        sessionAnalysis: {
          intentMatch: 0.73,
          weatherImpact: -0.15,
          overallQuality: "good",
          trainingLoad: "appropriate",
          playerReadiness: 0.82
        },
        insights: [
          {
            description: "Team m/min 15% lower than expected due to heavy rain conditions",
            confidence: 0.87,
            category: "session-intent",
            impact: "Session goals achieved despite adverse weather"
          }
        ],
        recommendations: [
          {
            description: "Monitor Jake Thompson for overreaching",
            priority: "high",
            actionRequired: true,
            timeframe: "immediate",
            targetStaff: ["S&C Coach", "Head Coach"]
          }
        ],
        modelVersion: "v2.1",
        processingTime: 2.3,
        dataQuality: 0.95,
        generatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      await db.collection(FIRESTORE_COLLECTIONS.AI_INSIGHTS).add(insight);
      
      return {
        success: true,
        insights: [insight]
      };
      
    } catch (error) {
      console.error("Error generating AI insights:", error);
      throw error;
    }
  }
  
  // POST /api/v2/ai/insights - Create AI insight
  static async createInsight(req: Request, res: Response) {
    try {
      const insightData: FirestoreAiInsight = {
        ...req.body,
        generatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.AI_INSIGHTS).add(insightData);
      
      res.json({
        success: true,
        message: "AI insight created successfully",
        insightId: docRef.id
      });
      
    } catch (error) {
      console.error("Error creating AI insight:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to create AI insight",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}

// SNAPSHOTS API - Performance Reports
export class SnapshotsAPI {
  
  // POST /api/v2/snapshots - Generate performance snapshot
  static async generateSnapshot(req: Request, res: Response) {
    try {
      const { playerId, sessionId, snapshotType, generatedBy, generatedByName, generatedByRole } = req.body;
      
      const snapshot: FirestoreSnapshot = {
        playerId,
        sessionId,
        snapshotType,
        generatedBy,
        generatedByName,
        generatedByRole,
        title: `${snapshotType.replace('_', ' ').toUpperCase()} - ${playerId}`,
        description: `Performance snapshot generated for ${playerId}`,
        reportData: {
          summary: "Performance snapshot generated successfully",
          keyMetrics: [
            { metric: "Total Distance", value: "4.2km", status: "good" },
            { metric: "Max Velocity", value: "8.7 m/s", status: "good" },
            { metric: "Dynamic Stress Load", value: 420, status: "average" }
          ],
          recommendations: [
            "Continue current training load",
            "Monitor for fatigue in next session"
          ]
        },
        fileFormat: 'pdf',
        status: 'generated',
        viewCount: 0,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await db.collection(FIRESTORE_COLLECTIONS.SNAPSHOTS).add(snapshot);
      
      res.json({
        success: true,
        message: "Performance snapshot generated successfully",
        snapshotId: docRef.id,
        downloadUrl: `/api/v2/snapshots/${docRef.id}/download`
      });
      
    } catch (error) {
      console.error("Error generating snapshot:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to generate snapshot",
        details: error.message 
      });
    }
  }
}

// MEDICAL DATA API - Medical Information
export class MedicalDataAPI {
  
  // GET /api/v2/medical-data - Get all medical data
  static async getAllMedicalData(req: Request, res: Response) {
    try {
      // Simplified query to avoid composite index requirement
      const snapshot = await db.collection(FIRESTORE_COLLECTIONS.MEDICAL_DATA)
        .orderBy('recordDate', 'desc')
        .limit(100)
        .get();
      
      const records = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((record: any) => record.confidentialityLevel && ['public', 'staff'].includes(record.confidentialityLevel))
        .slice(0, 50); // Limit to 50 after filtering
      
      res.json({
        success: true,
        records,
        count: records.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Error fetching all medical data:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch medical data",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  
  // GET /api/v2/players/:playerId/medical - Get medical data
  static async getPlayerMedicalData(req: Request, res: Response) {
    try {
      const { playerId } = req.params;
      
      // Simple query without orderBy to avoid any index requirements
      const snapshot = await db.collection(FIRESTORE_COLLECTIONS.MEDICAL_DATA)
        .where('playerId', '==', playerId)
        .limit(100)
        .get();
      
      const medicalData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((record: any) => record.confidentialityLevel && ['public', 'staff', 'medical_only'].includes(record.confidentialityLevel))
        .sort((a: any, b: any) => new Date(b.recordDate || 0).getTime() - new Date(a.recordDate || 0).getTime()) // Sort by date desc in JS
        .slice(0, 20); // Limit to 20 after filtering and sorting
      
      res.json({
        success: true,
        playerId: playerId,
        count: medicalData.length,
        medicalData: medicalData
      });
      
    } catch (error) {
      console.error("Error fetching medical data:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch medical data",
        details: error.message 
      });
    }
  }
  
  // POST /api/v2/medical-data - Create medical record
  static async createMedicalRecord(req: Request, res: Response) {
    try {
      const { playerId, recordType, ...medicalData } = req.body;
      
      const recordId = generateMedicalDataId(playerId, recordType);
      
      const record: FirestoreMedicalData = {
        playerId,
        recordType,
        ...medicalData,
        recordDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.collection(FIRESTORE_COLLECTIONS.MEDICAL_DATA)
        .doc(recordId)
        .set(record);
      
      res.json({
        success: true,
        message: "Medical record created successfully",
        recordId: recordId
      });
      
    } catch (error) {
      console.error("Error creating medical record:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to create medical record",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// VIDEO ANALYSIS API - Match Video Analysis
export class VideoAnalysisAPI {
  
  // POST /api/v2/matches/:matchId/video-analysis/upload - Upload and parse CSV video analysis data
  static async uploadVideoAnalysis(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const { csvData, filename, uploadedBy, uploadedByName, uploadedByRole } = req.body;
      
      console.log(`📹 VIDEO ANALYSIS: Processing upload for match ${matchId}...`);
      
      const uploadStartTime = Date.now();
      const uploadId = generateVideoUploadId();
      
      // Parse CSV data (expect array of objects)
      const csvRows = Array.isArray(csvData) ? csvData : [];
      const events: FirestoreVideoEvent[] = [];
      const errors: any[] = [];
      let rowIndex = 0;
      
      for (const row of csvRows) {
        try {
          rowIndex++;
          
          // Skip header row or empty rows
          if (!row['Start time'] || row['Start time'] === 'Start time') continue;
          
          // Parse time to get clock seconds and period
          const { clockSec, period } = VideoAnalysisAPI.parseTimeData(row['Start time'], row['Timeline']);
          
          // Auto-detect event type from populated fields
          const eventType = VideoAnalysisAPI.detectEventType(row);
          
          // Create video event
          const event: FirestoreVideoEvent = {
            matchId,
            period,
            clockSec,
            startTimeRaw: row['Start time'] || '',
            durationSec: parseFloat(row['Duration']) || 0,
            team: VideoAnalysisAPI.determineTeam(row, matchId),
            opposition: VideoAnalysisAPI.extractOpposition(row['Timeline']) || 'Unknown',
            players: VideoAnalysisAPI.extractPlayers(row),
            eventType,
            subType: VideoAnalysisAPI.getSubType(row, eventType),
            outcome: VideoAnalysisAPI.getOutcome(row, eventType),
            field: {
              zone: row['Field Zone'] || null,
              position: row['Field Position'] || null
            },
            qualities: VideoAnalysisAPI.extractQualities(row),
            tags: VideoAnalysisAPI.extractTags(row),
            instance: parseInt(row['Instance number']) || null,
            fxId: row['FXID'] || null,
            rowLabel: row['Row'] || null,
            source: 'SCVideo',
            uploadId,
            createdAt: new Date().toISOString(),
            schemaVersion: 1
          };
          
          // Validate event before storing
          const validatedEvent = validateFirestoreDocument(firestoreVideoEventSchema, event);
          events.push(validatedEvent);
          
        } catch (error) {
          errors.push({
            row: rowIndex,
            message: error instanceof Error ? error.message : 'Unknown parsing error',
            severity: 'error' as const
          });
        }
      }
      
      // Store events in chunked batches to avoid transaction size limits
      const BATCH_SIZE = 400; // Firestore limit is 500, using 400 for safety
      const totalEvents = events.length;
      
      console.log(`📹 VIDEO ANALYSIS: Storing ${totalEvents} events in chunks of ${BATCH_SIZE}...`);
      
      for (let i = 0; i < totalEvents; i += BATCH_SIZE) {
        const batch = db.batch();
        const chunk = events.slice(i, i + BATCH_SIZE);
        
        for (const event of chunk) {
          const eventId = generateVideoEventId(matchId, event.period, event.clockSec, i + chunk.indexOf(event));
          const eventRef = db.collection(FIRESTORE_COLLECTIONS.VIDEO_EVENTS).doc(eventId);
          batch.set(eventRef, event);
        }
        
        await batch.commit();
        console.log(`📹 VIDEO ANALYSIS: Stored chunk ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(totalEvents/BATCH_SIZE)} (${chunk.length} events)`);
      }
      
      // Create upload metadata
      const uploadMetadata: FirestoreVideoUpload = {
        matchId,
        filename: filename || 'unknown.csv',
        fileSize: JSON.stringify(csvData).length,
        rowsParsed: csvRows.length,
        eventsStored: events.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors.slice(0, 10) : [], // Only store first 10 errors to avoid document size limit
        eventTypeCounts: VideoAnalysisAPI.getEventTypeCounts(events),
        periodBreakdown: VideoAnalysisAPI.getPeriodBreakdown(events),
        uploadedBy,
        uploadedByName,
        uploadedByRole,
        processingTimeMs: Date.now() - uploadStartTime,
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        schemaVersion: 1
      };
      
      // Store upload metadata in separate batch
      const metadataBatch = db.batch();
      const uploadRef = db.collection(FIRESTORE_COLLECTIONS.VIDEO_UPLOADS).doc(uploadId);
      metadataBatch.set(uploadRef, uploadMetadata);
      await metadataBatch.commit();
      
      console.log(`✅ VIDEO ANALYSIS: Processed ${events.length} events for match ${matchId}`);
      
      res.json({
        success: true,
        message: `Video analysis uploaded successfully`,
        uploadId,
        summary: {
          rowsParsed: csvRows.length,
          eventsStored: events.length,
          errorCount: errors.length,
          processingTimeMs: uploadMetadata.processingTimeMs,
          eventTypeCounts: uploadMetadata.eventTypeCounts,
          periodBreakdown: uploadMetadata.periodBreakdown
        }
      });
      
    } catch (error) {
      console.error("Error uploading video analysis:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to upload video analysis",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // GET /api/v2/matches/:matchId/video-events - Get video events for a match with filtering
  static async getVideoEvents(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const { 
        eventType, 
        team, 
        period, 
        fromSec, 
        toSec, 
        zone, 
        limit = 1000,
        offset = 0 
      } = req.query;
      
      // Simple query to avoid composite index requirement - just filter by matchId
      const query = db.collection(FIRESTORE_COLLECTIONS.VIDEO_EVENTS)
        .where('matchId', '==', matchId)
        .limit(parseInt(limit as string) * 5); // Get more than needed to account for filtering
      
      const snapshot = await query.get();
      
      let events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Apply all filters client-side to avoid composite index requirement
      if (eventType) {
        events = events.filter(event => event.eventType === eventType);
      }
      
      if (team) {
        events = events.filter(event => event.team === team);
      }
      
      if (period) {
        events = events.filter(event => event.period === parseInt(period as string));
      }
      
      if (fromSec) {
        events = events.filter(event => event.clockSec >= parseInt(fromSec as string));
      }
      
      if (toSec) {
        events = events.filter(event => event.clockSec <= parseInt(toSec as string));
      }
      
      if (zone) {
        events = events.filter(event => event.field?.zone === zone);
      }
      
      // Sort by clockSec and apply limit
      events = events.sort((a, b) => a.clockSec - b.clockSec).slice(0, parseInt(limit as string));
      
      // Apply offset
      if (offset > 0) {
        events = events.slice(parseInt(offset as string));
      }
      
      res.json({
        success: true,
        matchId,
        count: events.length,
        events,
        filters: { eventType, team, period, fromSec, toSec, zone }
      });
      
    } catch (error) {
      console.error("Error fetching video events:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch video events",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // GET /api/v2/matches/:matchId/video-analysis/summary - Get video analysis summary/stats
  static async getVideoAnalysisSummary(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      
      // Get all events for the match
      const eventsSnapshot = await db.collection(FIRESTORE_COLLECTIONS.VIDEO_EVENTS)
        .where('matchId', '==', matchId)
        .get();
      
      const events = eventsSnapshot.docs.map(doc => doc.data());
      
      // Get upload metadata
      const uploadsSnapshot = await db.collection(FIRESTORE_COLLECTIONS.VIDEO_UPLOADS)
        .where('matchId', '==', matchId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      const latestUpload = uploadsSnapshot.docs[0]?.data();
      
      // Generate summary statistics
      const summary = VideoAnalysisAPI.generateSummaryStats(events);
      
      res.json({
        success: true,
        matchId,
        summary: {
          ...summary,
          latestUpload: latestUpload ? {
            uploadedAt: latestUpload.createdAt,
            uploadedBy: latestUpload.uploadedByName,
            filename: latestUpload.filename,
            eventsCount: latestUpload.eventsStored
          } : null
        }
      });
      
    } catch (error) {
      console.error("Error generating video analysis summary:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to generate summary",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Helper methods for parsing CSV data
  private static parseTimeData(startTime: string, timeline: string): { clockSec: number; period: number } {
    let totalSeconds = 0;
    
    // Check if it's already in decimal seconds format (Sportscode format)
    if (!startTime.includes(':')) {
      totalSeconds = parseFloat(startTime) || 0;
    } else {
      // Parse MM:SS or H:MM:SS format to seconds
      const timeParts = startTime.split(':').map(Number);
      
      if (timeParts.length === 2) {
        // MM:SS format
        totalSeconds = timeParts[0] * 60 + timeParts[1];
      } else if (timeParts.length === 3) {
        // H:MM:SS format
        totalSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
      }
    }
    
    // Determine period (assume first half is 0-2400 seconds, second half is 2400+)
    const period = totalSeconds <= 2400 ? 1 : 2;
    
    return { clockSec: totalSeconds, period };
  }
  
  private static detectEventType(row: any): FirestoreVideoEvent['eventType'] {
    // First check the "Row" column for Sportscode event types
    const rowType = row['Row'];
    if (rowType) {
      switch (rowType.toLowerCase()) {
        case 'ball in play':
          return 'ballInPlay';
        case 'start period':
        case 'end period':
          return 'periodChange';
        case 'try':
          return 'try';
        case 'conversion':
        case 'penalty goal':
        case 'drop goal':
          return 'goalKick';
        case 'scrum':
          return 'scrum';
        case 'lineout':
          return 'lineout';
        case 'kick':
          return 'kick';
        case 'tackle':
          return 'tackle';
        case 'carry':
        case 'run':
          return 'carry';
        case 'breakdown':
        case 'ruck':
        case 'maul':
          return 'breakdown';
        default:
          // Fall through to outcome-based detection
          break;
      }
    }
    
    // Fallback: detect event type based on which fields are populated  
    if (row['Tackle Outcome']) return 'tackle';
    if (row['Ball Carry Outcome']) return 'carry';
    if (row['Breakdown Outcome']) return 'breakdown';
    if (row['Kick Type']) return 'kick';
    if (row['LO Outcome']) return 'lineout';
    if (row['Scrum Outcome']) return 'scrum';
    if (row['Try']) return 'try';
    if (row['Goal Kick Outcome']) return 'goalKick';
    if (row['Error']) return 'error';
    if (row['Attack 22m Entry']) return 'attack22Entry';
    if (row['Counter Attack OutCome']) return 'counterAttack';
    
    return 'other';
  }
  
  private static determineTeam(row: any, matchId: string): FirestoreVideoEvent['team'] {
    // Extract team from match ID or timeline
    if (matchId.includes('nh_vs_') || matchId.includes('north_harbour')) {
      return 'home'; // North Harbour is home
    }
    return 'unknown';
  }
  
  private static extractOpposition(timeline: string): string {
    // Extract opposition from timeline string
    if (!timeline) return 'Unknown';
    const match = timeline.match(/vs\s+([^0-9]+)/i);
    return match ? match[1].trim() : 'Unknown';
  }
  
  private static extractPlayers(row: any): string[] {
    // Extract player information from row
    const players: string[] = [];
    if (row['Player']) players.push(row['Player']);
    return players;
  }
  
  private static getSubType(row: any, eventType: string): string | null {
    // Get more specific sub-type based on event type
    switch (eventType) {
      case 'kick':
        return row['Kick Type'] || null;
      case 'carry':
        return row['Ball Carry Types'] || null;
      case 'tackle':
        return row['Defence Action'] || null;
      default:
        return null;
    }
  }
  
  private static getOutcome(row: any, eventType: string): string | null {
    // Get outcome based on event type
    switch (eventType) {
      case 'tackle':
        return row['Tackle Outcome'] || null;
      case 'carry':
        return row['Ball Carry Outcome'] || null;
      case 'breakdown':
        return row['Breakdown Outcome'] || null;
      case 'kick':
        return row['Kick Outcome'] || null;
      case 'lineout':
        return row['LO Outcome'] || null;
      case 'scrum':
        return row['Scrum Outcome'] || null;
      case 'goalKick':
        return row['Goal Kick Outcome'] || null;
      case 'counterAttack':
        return row['Counter Attack OutCome'] || null;
      default:
        return null;
    }
  }
  
  private static extractQualities(row: any): FirestoreVideoEvent['qualities'] {
    return {
      carryDominance: row['Ball Carry Dominance'] || null,
      gainLine: row['Ball Carry Gain Line'] === 'Yes' || false,
      carryOutcome: row['Ball Carry Outcome'] || null,
      carryType: row['Ball Carry Types'] || null,
      tackleOutcome: row['Tackle Outcome'] || null,
      defenseAction: row['Defence Action'] || null,
      tacklersCommitted: row['Carry Tacklers Committed'] ? parseInt(row['Carry Tacklers Committed']) : null,
      breakdownOutcome: row['Breakdown Outcome'] || null,
      jackal: row['Jackal'] === 'Yes' || false,
      kickType: row['Kick Type'] || null,
      kickOutcome: row['Kick Outcome'] || null,
      lineoutOutcome: row['LO Outcome'] || null,
      scrumOutcome: row['Scrum Outcome'] || null,
      attack22Entry: row['Attack 22m Entry'] === 'Yes' || false,
      attack22Outcome: row['Attacking 22 Entry Outcome'] || null,
      attack22Points: row['Attacking 22 Entry Points'] ? parseInt(row['Attacking 22 Entry Points']) : null,
      goalKickOutcome: row['Goal Kick Outcome'] || null,
      goalKickMissedType: row['Goal Kick Missed Type'] || null,
      handlingOutcome: row['Handling Outcome'] || null,
      counterAttackOutcome: row['Counter Attack OutCome'] || null
    };
  }
  
  private static extractTags(row: any): string[] {
    const tags: string[] = [];
    if (row['Attacking Qualities']) {
      const qualities = row['Attacking Qualities'].toString();
      tags.push(...qualities.split(',').map((t: string) => t.trim()));
    }
    return tags.filter(Boolean);
  }
  
  private static getEventTypeCounts(events: FirestoreVideoEvent[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const event of events) {
      counts[event.eventType] = (counts[event.eventType] || 0) + 1;
    }
    return counts;
  }
  
  private static getPeriodBreakdown(events: FirestoreVideoEvent[]): { period1: number; period2: number } {
    const breakdown = { period1: 0, period2: 0 };
    for (const event of events) {
      if (event.period === 1) breakdown.period1++;
      else if (event.period === 2) breakdown.period2++;
    }
    return breakdown;
  }
  
  private static generateSummaryStats(events: any[]): any {
    const total = events.length;
    const eventTypeCounts = VideoAnalysisAPI.getEventTypeCounts(events);
    const periodBreakdown = VideoAnalysisAPI.getPeriodBreakdown(events);
    
    // Calculate key rugby statistics
    const carries = events.filter(e => e.eventType === 'carry').length;
    const tackles = events.filter(e => e.eventType === 'tackle').length;
    const breakdowns = events.filter(e => e.eventType === 'breakdown').length;
    const lineouts = events.filter(e => e.eventType === 'lineout').length;
    const scrums = events.filter(e => e.eventType === 'scrum').length;
    const attack22Entries = events.filter(e => e.eventType === 'attack22Entry').length;
    
    return {
      totalEvents: total,
      eventTypeCounts,
      periodBreakdown,
      rugbyStats: {
        carries,
        tackles,
        breakdowns,
        lineouts,
        scrums,
        attack22Entries,
        dominantCarries: events.filter(e => e.qualities?.carryDominance === 'Dominant').length,
        gainLineSuccess: events.filter(e => e.qualities?.gainLine === true).length,
        tackleSuccess: events.filter(e => e.qualities?.tackleOutcome === 'Made').length
      }
    };
  }
}