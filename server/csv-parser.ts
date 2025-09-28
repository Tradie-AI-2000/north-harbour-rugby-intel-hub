import csv from 'csv-parser';
import { Readable } from 'stream';

// StatSports CSV Data Interface
export interface StatSportsRecord {
  playerName: string;
  playerId: string;
  session: string;
  period: string;
  totalDistance: number;
  sprintDistance: number;
  playerLoad: number;
  maxSpeed: number;
  avgSpeed: number;
  highIntensityDistance: number;
  accelerations: number;
  decelerations: number;
  impactCount: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  timeInZone1?: number;
  timeInZone2?: number;
  timeInZone3?: number;
  timeInZone4?: number;
  timeInZone5?: number;
}

// Firebase GPS Data Record
export interface FirebaseGPSRecord {
  sessionId: string;
  sessionName: string;
  sessionDate: string;
  weekId: string;
  playerId: string;
  playerName: string;
  metrics: {
    totalDistance: number;
    sprintDistance: number;
    playerLoad: number;
    maxSpeed: number;
    avgSpeed: number;
    highIntensityDistance: number;
    accelerations: number;
    decelerations: number;
    impactCount: number;
    // heartRate data not available in current StatSports format
  };
  uploadTimestamp: string;
  processingStatus: 'processed' | 'error';
}

/**
 * Parse StatSports CSV buffer into structured GPS records
 */
export async function parseStatSportsCSV(
  csvBuffer: Buffer,
  sessionData: {
    sessionId: string;
    sessionName: string;
    date: string;
    weekId: string;
  }
): Promise<FirebaseGPSRecord[]> {
  return new Promise((resolve, reject) => {
    const records: FirebaseGPSRecord[] = [];
    const errors: string[] = [];
    
    console.log('🔍 Starting CSV parsing...');
    console.log('📊 Session Data:', sessionData);
    
    // Convert buffer to readable stream
    const stream = Readable.from(csvBuffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Map CSV columns to our interface based on actual StatSports format
          const record: FirebaseGPSRecord = {
            sessionId: sessionData.sessionId,
            sessionName: sessionData.sessionName,
            sessionDate: sessionData.date,
            weekId: sessionData.weekId,
            playerId: row['playerId'] || generatePlayerId(row['Player Name'] || row['Player'] || row['Name']),
            playerName: row['playerId']?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown',
            metrics: {
              totalDistance: parseFloat(row['totalDistance'] || '0'),
              sprintDistance: parseFloat(row['sprintDistance'] || '0'),
              playerLoad: parseFloat(row['playerLoad'] || '0'),
              maxSpeed: parseFloat(row['maxVelocity'] || row['maxSpeed'] || '0'),
              avgSpeed: parseFloat(row['metresPerMinute'] || '0') / 16.67, // Convert m/min to km/h
              highIntensityDistance: parseFloat(row['highSpeedRunningDistance'] || '0'),
              accelerations: parseInt(row['accelerations_total'] || '0'),
              decelerations: parseInt(row['decelerations_total'] || '0'),
              impactCount: parseInt(row['impacts'] || '0'),
              // heartRate omitted - not in this StatSports format
            },
            uploadTimestamp: new Date().toISOString(),
            processingStatus: 'processed'
          };
          
          // Validate record has essential data
          if (record.playerName !== 'Unknown' && record.metrics.totalDistance > 0) {
            records.push(record);
            console.log(`✅ Parsed record for ${record.playerName}: ${record.metrics.totalDistance}m`);
          } else {
            console.log(`⚠️ Skipping invalid record: ${record.playerName}`);
          }
          
        } catch (error) {
          console.error('❌ Error parsing row:', error);
          errors.push(`Row parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      })
      .on('end', () => {
        console.log(`📊 CSV parsing complete: ${records.length} records processed`);
        if (errors.length > 0) {
          console.log(`⚠️ Parsing errors: ${errors.length}`);
        }
        resolve(records);
      })
      .on('error', (error) => {
        console.error('❌ CSV parsing failed:', error);
        reject(error);
      });
  });
}

/**
 * Generate consistent player ID from name
 */
function generatePlayerId(playerName: string): string {
  if (!playerName || playerName === 'Unknown') {
    return 'unknown_player';
  }
  
  return playerName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim();
}

/**
 * Validate GPS record for data quality
 */
export function validateGPSRecord(record: FirebaseGPSRecord): boolean {
  // Basic validation rules
  const hasValidPlayer = record.playerName && record.playerName !== 'Unknown';
  const hasValidMetrics = record.metrics.totalDistance > 0 || record.metrics.playerLoad > 0;
  const hasValidSession = record.sessionId && record.sessionDate;
  
  return hasValidPlayer && hasValidMetrics && hasValidSession;
}

/**
 * Generate summary statistics from GPS records
 */
export function generateSessionSummary(records: FirebaseGPSRecord[]) {
  if (records.length === 0) {
    return null;
  }
  
  const summary = {
    totalPlayers: records.length,
    avgTotalDistance: records.reduce((sum, r) => sum + r.metrics.totalDistance, 0) / records.length,
    maxTotalDistance: Math.max(...records.map(r => r.metrics.totalDistance)),
    avgPlayerLoad: records.reduce((sum, r) => sum + r.metrics.playerLoad, 0) / records.length,
    maxPlayerLoad: Math.max(...records.map(r => r.metrics.playerLoad)),
    avgMaxSpeed: records.reduce((sum, r) => sum + r.metrics.maxSpeed, 0) / records.length,
    maxMaxSpeed: Math.max(...records.map(r => r.metrics.maxSpeed)),
    sessionDate: records[0].sessionDate,
    sessionName: records[0].sessionName,
    weekId: records[0].weekId,
  };
  
  console.log('📊 Session Summary Generated:', summary);
  return summary;
}