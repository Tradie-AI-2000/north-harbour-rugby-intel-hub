import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { FirebaseGPSRecord } from './csv-parser';

// Initialize Firebase Admin if not already initialized
let db: FirebaseFirestore.Firestore;

try {
  if (getApps().length === 0) {
    console.log('🔥 Initializing Firebase Admin...');
    
    // Use service account credentials from environment
    const serviceAccount = {
      type: "service_account",
      project_id: "north-harbour-rugby-dashboard1",
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
    };

    initializeApp({
      credential: cert(serviceAccount as any),
      projectId: 'north-harbour-rugby-dashboard1'
    });
  }
  
  db = getFirestore();
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error);
  throw error;
}

// Firebase Collection Constants
export const COLLECTIONS = {
  STAT_SPORTS_DATA: 'stat_sports_data',
  TRAINING_SESSIONS: 'training_sessions',
  PLAYERS: 'players',
  AI_INSIGHTS: 'ai_insights'
};

/**
 * Get all GPS sessions with latest session first
 */
export async function getAllGPSSessions(): Promise<any[]> {
  try {
    console.log('🔍 Retrieving all GPS sessions...');
    
    const snapshot = await db.collection(COLLECTIONS.STAT_SPORTS_DATA)
      .limit(100)
      .get();
    
    if (snapshot.empty) {
      return [];
    }
    
    // Group by session and find the most recent
    const sessionMap = new Map();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const sessionId = data.sessionId;
      
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          sessionId: sessionId,
          sessionName: data.sessionName,
          sessionDate: data.sessionDate,
          weekId: data.weekId,
          playerData: [],
          timestamp: new Date(data.uploadTimestamp || 0).getTime()
        });
      }
      
      sessionMap.get(sessionId).playerData.push({
        playerId: data.playerId,
        playerName: data.playerName,
        totalDistance: data.metrics?.totalDistance || 0,
        sprintDistance: data.metrics?.sprintDistance || 0,
        playerLoad: data.metrics?.playerLoad || 0,
        maxSpeed: data.metrics?.maxSpeed || 0,
        accelerations: data.metrics?.accelerations || 0,
        decelerations: data.metrics?.decelerations || 0,
        impactCount: data.metrics?.impactCount || 0
      });
    });
    
    // Sort sessions by timestamp descending
    const sessions = Array.from(sessionMap.values());
    sessions.sort((a, b) => b.timestamp - a.timestamp);
    
    console.log(`✅ Retrieved ${sessions.length} GPS sessions`);
    return sessions;
    
  } catch (error) {
    console.error('❌ Failed to retrieve GPS sessions:', error);
    throw error;
  }
}

/**
 * Get GPS data for a specific session - SINGLE FUNCTION
 */
export async function getSessionGPSData(sessionId: string): Promise<any[]> {
  try {
    console.log(`🔍 Retrieving GPS data for session: ${sessionId}`);
    
    const snapshot = await db.collection(COLLECTIONS.STAT_SPORTS_DATA)
      .where('sessionId', '==', sessionId)
      .get();
    
    const gpsData: any[] = [];
    snapshot.forEach(doc => {
      gpsData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Retrieved ${gpsData.length} GPS records for session ${sessionId}`);
    return gpsData;
    
  } catch (error) {
    console.error(`❌ Failed to retrieve GPS data for session ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Store GPS records in Firebase Firestore
 */
export async function storeGPSRecords(records: FirebaseGPSRecord[]): Promise<{
  success: boolean;
  stored: number;
  errors: string[];
  sessionSummary?: any;
}> {
  console.log(`🔥 Storing ${records.length} GPS records in Firestore...`);
  
  const errors: string[] = [];
  let stored = 0;
  
  try {
    // Use batch writes for efficiency
    const batch = db.batch();
    
    for (const record of records) {
      try {
        // Generate document ID
        const docId = `${record.sessionId}_${record.playerId}`;
        const docRef = db.collection(COLLECTIONS.STAT_SPORTS_DATA).doc(docId);
        
        // Add to batch, removing undefined values
        const cleanRecord = JSON.parse(JSON.stringify({
          ...record,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        
        batch.set(docRef, cleanRecord);
        
        stored++;
      } catch (error) {
        const errorMsg = `Failed to prepare record for ${record.playerName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('❌', errorMsg);
        errors.push(errorMsg);
      }
    }
    
    // Commit batch
    await batch.commit();
    console.log(`✅ Successfully stored ${stored} GPS records`);
    
    // Also create/update training session document
    await createTrainingSession(records[0]);
    
    // Generate session summary
    const sessionSummary = generateSessionSummary(records);
    
    return {
      success: true,
      stored,
      errors,
      sessionSummary
    };
    
  } catch (error) {
    console.error('❌ Batch write failed:', error);
    errors.push(`Batch write failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      success: false,
      stored: 0,
      errors
    };
  }
}

/**
 * Create or update training session document
 */
async function createTrainingSession(sampleRecord: FirebaseGPSRecord): Promise<void> {
  try {
    const sessionData = {
      sessionId: sampleRecord.sessionId,
      sessionName: sampleRecord.sessionName,
      sessionDate: sampleRecord.sessionDate,
      weekId: sampleRecord.weekId,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection(COLLECTIONS.TRAINING_SESSIONS)
      .doc(sampleRecord.sessionId)
      .set(sessionData, { merge: true });
      
    console.log(`✅ Training session document created/updated: ${sampleRecord.sessionId}`);
  } catch (error) {
    console.error('❌ Failed to create training session:', error);
  }
}

/**
 * Generate session summary from GPS records
 */
function generateSessionSummary(records: FirebaseGPSRecord[]) {
  if (records.length === 0) return null;
  
  return {
    totalPlayers: records.length,
    metrics: {
      avgTotalDistance: Math.round(records.reduce((sum, r) => sum + r.metrics.totalDistance, 0) / records.length),
      maxTotalDistance: Math.max(...records.map(r => r.metrics.totalDistance)),
      avgPlayerLoad: Math.round(records.reduce((sum, r) => sum + r.metrics.playerLoad, 0) / records.length),
      maxPlayerLoad: Math.max(...records.map(r => r.metrics.playerLoad)),
      avgMaxSpeed: Math.round((records.reduce((sum, r) => sum + r.metrics.maxSpeed, 0) / records.length) * 10) / 10,
      maxMaxSpeed: Math.max(...records.map(r => r.metrics.maxSpeed))
    },
    topPerformers: {
      distance: records
        .sort((a, b) => b.metrics.totalDistance - a.metrics.totalDistance)
        .slice(0, 3)
        .map(r => ({ name: r.playerName, value: r.metrics.totalDistance })),
      load: records
        .sort((a, b) => b.metrics.playerLoad - a.metrics.playerLoad)
        .slice(0, 3)
        .map(r => ({ name: r.playerName, value: r.metrics.playerLoad })),
      speed: records
        .sort((a, b) => b.metrics.maxSpeed - a.metrics.maxSpeed)
        .slice(0, 3)
        .map(r => ({ name: r.playerName, value: r.metrics.maxSpeed }))
    }
  };
}

/**
 * Get all training sessions for a specific week
 */
export async function getWeekSessions(weekId: string): Promise<any[]> {
  try {
    console.log(`🔍 Retrieving sessions for week: ${weekId}`);
    
    const snapshot = await db
      .collection(COLLECTIONS.TRAINING_SESSIONS)
      .where('weekId', '==', weekId)
      .orderBy('sessionDate', 'asc')
      .get();
    
    const sessions: any[] = [];
    snapshot.forEach(doc => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Retrieved ${sessions.length} sessions for ${weekId}`);
    return sessions;
    
  } catch (error) {
    console.error(`❌ Failed to retrieve sessions for ${weekId}:`, error);
    throw error;
  }
}

export { db };