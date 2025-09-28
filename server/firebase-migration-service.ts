import { db } from './firebase';
import { 
  FirebasePlayer, 
  FIREBASE_COLLECTIONS,
  PlayerStatus,
  firebasePlayerSchema,
  playerStatusSchema
} from '@shared/firebase-schema';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

// Updated interface for 2025 North Harbour Squad CSV
interface CSVPlayer {
  firstName: string;
  lastName: string;
  position: string;
  club: string;
  caps: string;
  status: string;
}

export class FirebaseMigrationService {
  
  /**
   * Main migration function - creates unified Firebase schema with 2025 North Harbour squad
   */
  async migrateToFirebase(): Promise<{success: boolean, playersCreated: number, errors: string[]}> {
    console.log('🚀 Starting Firebase migration - Creating unified 2025 North Harbour squad database...');
    
    const errors: string[] = [];
    let playersCreated = 0;

    try {
      // Step 1: Read and validate CSV data
      console.log('📖 Reading CSV player data...');
      const csvPlayers = await this.readCSVData();
      console.log(`✅ Found ${csvPlayers.length} players in CSV`);

      // Step 2: Clear existing data (fresh start)
      console.log('🧹 Clearing existing Firestore data...');
      await this.clearExistingData();

      // Step 3: Transform and validate each player
      console.log('🔄 Transforming and validating player data...');
      const validatedPlayers: FirebasePlayer[] = [];
      
      for (const csvPlayer of csvPlayers) {
        try {
          const firebasePlayer = this.transformCSVToFirebase(csvPlayer);
          const validated = firebasePlayerSchema.parse(firebasePlayer);
          validatedPlayers.push(validated);
        } catch (error: any) {
          const errorMsg = `❌ Validation failed for player ${csvPlayer.firstName} ${csvPlayer.lastName}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      console.log(`✅ Successfully validated ${validatedPlayers.length} players`);

      // Step 4: Create players in Firestore with expanded schema structure
      console.log('📝 Creating players in Firestore...');
      
      for (const player of validatedPlayers) {
        try {
          await this.createPlayerWithSubcollections(player);
          playersCreated++;
          console.log(`✅ Created player: ${player.firstName} ${player.lastName}`);
        } catch (error) {
          const errorMsg = `❌ Failed to create player ${player.firstName} ${player.lastName}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      // Step 5: Create default squads
      console.log('🏉 Creating default squad structures...');
      await this.createDefaultSquads();

      console.log(`🎉 Migration completed! Created ${playersCreated} players with expanded schema`);
      
      return {
        success: true,
        playersCreated,
        errors
      };

    } catch (error) {
      console.error('💥 Migration failed:', error);
      errors.push(`Migration failed: ${error}`);
      return {
        success: false,
        playersCreated,
        errors
      };
    }
  }

  /**
   * Read CSV data from the 2025 North Harbour squad file
   */
  private async readCSVData(): Promise<CSVPlayer[]> {
    return new Promise((resolve, reject) => {
      const players: CSVPlayer[] = [];
      const csvPath = path.join(process.cwd(), 'north_harbour_rugby_2025_squad.csv');
      
      if (!fs.existsSync(csvPath)) {
        reject(new Error(`CSV file not found at: ${csvPath}`));
        return;
      }

      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (row: CSVPlayer) => {
          players.push(row);
        })
        .on('end', () => {
          resolve(players);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * Clear existing Firebase data for fresh migration
   */
  private async clearExistingData(): Promise<void> {
    try {
      // Get all existing players
      const playersSnapshot = await db.collection(FIREBASE_COLLECTIONS.PLAYERS).get();
      
      if (!playersSnapshot.empty) {
        console.log(`🗑️ Deleting ${playersSnapshot.docs.length} existing players...`);
        
        // Delete in batches to avoid hitting Firestore limits
        const batch = db.batch();
        playersSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('✅ Existing player data cleared');
      }

      // Clear existing squads
      const squadsSnapshot = await db.collection(FIREBASE_COLLECTIONS.SQUADS).get();
      if (!squadsSnapshot.empty) {
        const batch = db.batch();
        squadsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('✅ Existing squad data cleared');
      }

    } catch (error) {
      console.error('❌ Error clearing existing data:', error);
      throw error;
    }
  }

  /**
   * Transform 2025 squad CSV data to Firebase schema format
   */
  private transformCSVToFirebase(csvPlayer: CSVPlayer): FirebasePlayer {
    const now = new Date().toISOString();
    const caps = parseInt(csvPlayer.caps) || 0;
    
    // Generate player ID from name
    const playerId = `${csvPlayer.firstName.toLowerCase()}_${csvPlayer.lastName.toLowerCase().replace(/[^a-z]/g, '')}`;
    
    // Generate realistic dates and contact info
    const birthYear = this.generateBirthYear(caps);
    const dateOfBirth = `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
    
    return {
      id: playerId,
      firstName: csvPlayer.firstName,
      lastName: csvPlayer.lastName,
      dateOfBirth,
      email: `${csvPlayer.firstName.toLowerCase()}.${csvPlayer.lastName.toLowerCase().replace(/[^a-z]/g, '')}@northharbour.rugby`,
      phone: `+64 ${Math.floor(Math.random() * 9) + 1}${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
      
      // Rugby profile
      position: csvPlayer.position,
      secondaryPosition: undefined,
      jerseyNumber: this.generateJerseyNumber(csvPlayer.position),
      club: csvPlayer.club,
      experience: this.mapExperience(caps),
      teamHistory: caps > 0 ? `${caps} caps for North Harbour` : 'New to North Harbour squad',
      previousClubs: caps > 10 ? this.generatePreviousClubs() : [],
      
      // Physical attributes (realistic based on position)
      currentHeight: this.generateHeight(csvPlayer.position),
      currentWeight: this.generateWeight(csvPlayer.position),
      
      // Skills (estimated based on position and experience)
      skills: this.generateSkills(csvPlayer.position, caps),
      
      // Contract and status
      currentStatus: this.mapPlayerStatus(csvPlayer.status),
      availability: 'Available',
      dateSigned: undefined,
      offContractDate: undefined,
      contractValue: undefined,
      
      // Performance analytics (baseline values)
      attendanceScore: this.generateScore(85, 100),
      scScore: this.generateScore(70, 95),
      medicalScore: this.generateScore(80, 100),
      personalityScore: this.generateScore(75, 95),
      sprintTime10m: this.generateSprintTime(csvPlayer.position),
      
      // Community and background
      familyBackground: undefined,
      gritNote: undefined,
      communityNote: undefined,
      
      // Meta information
      photoUrl: undefined,
      createdAt: now,
      updatedAt: now,
      lastModifiedBy: 'migration_service',
      
      // Quick status indicators for frontend
      quickStatus: {
        fitness: this.mapFitnessStatus(csvPlayer.status),
        medical: this.mapMedicalStatus(csvPlayer.status),
        lastGpsSession: undefined,
        lastFitnessTest: undefined,
        openInjuries: 0,
        upcomingAppointments: 0,
      },
    };
  }

  // Helper functions for generating realistic player data

  private generateBirthYear(caps: number): number {
    // Estimate age based on caps: new caps (18-22), experienced players (23-28), veterans (29-35)
    const baseAge = caps === 0 ? 20 : caps < 10 ? 24 : caps < 30 ? 28 : 32;
    const variance = Math.floor(Math.random() * 6) - 3; // +/- 3 years
    const age = baseAge + variance;
    return 2025 - age;
  }

  private generateJerseyNumber(position: string): number {
    // Traditional rugby jersey number ranges
    const numberRanges: { [key: string]: number[] } = {
      'Hooker': [2, 16],
      'Prop': [1, 3, 17, 18],
      'Lock': [4, 5, 19, 20],
      'Loose Forward': [6, 7, 8, 21, 22],
      'Halfback': [9, 23],
      'First-Five': [10, 24],
      'Midfielder': [12, 13, 25, 26],
      'Outside Back': [11, 14, 15, 27, 28]
    };
    
    const availableNumbers = numberRanges[position] || [29, 30, 31, 32, 33];
    return availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
  }

  private generateHeight(position: string): number {
    // Realistic heights by position (in cm)
    const heightRanges: { [key: string]: [number, number] } = {
      'Hooker': [175, 185],
      'Prop': [175, 190],
      'Lock': [195, 210],
      'Loose Forward': [185, 200],
      'Halfback': [170, 180],
      'First-Five': [175, 185],
      'Midfielder': [175, 190],
      'Outside Back': [170, 185]
    };
    
    const [min, max] = heightRanges[position] || [175, 190];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateWeight(position: string): number {
    // Realistic weights by position (in kg)
    const weightRanges: { [key: string]: [number, number] } = {
      'Hooker': [95, 115],
      'Prop': [110, 130],
      'Lock': [105, 125],
      'Loose Forward': [95, 115],
      'Halfback': [75, 90],
      'First-Five': [80, 95],
      'Midfielder': [85, 100],
      'Outside Back': [80, 95]
    };
    
    const [min, max] = weightRanges[position] || [80, 100];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateSkills(position: string, caps: number) {
    // Base skills by position (1-10 scale)
    const baseSkills: { [key: string]: any } = {
      'Hooker': { ballHandling: 7, passing: 6, defense: 8, communication: 9 },
      'Prop': { ballHandling: 5, passing: 4, defense: 9, communication: 6 },
      'Lock': { ballHandling: 6, passing: 5, defense: 8, communication: 7 },
      'Loose Forward': { ballHandling: 7, passing: 7, defense: 8, communication: 7 },
      'Halfback': { ballHandling: 9, passing: 9, defense: 6, communication: 8 },
      'First-Five': { ballHandling: 8, passing: 9, defense: 6, communication: 8 },
      'Midfielder': { ballHandling: 8, passing: 8, defense: 7, communication: 7 },
      'Outside Back': { ballHandling: 8, passing: 7, defense: 6, communication: 6 }
    };

    const skills = baseSkills[position] || { ballHandling: 6, passing: 6, defense: 6, communication: 6 };
    
    // Adjust based on experience (caps)
    const experienceBonus = Math.min(Math.floor(caps / 10), 2);
    
    return {
      ballHandling: Math.min(10, skills.ballHandling + experienceBonus + (Math.random() > 0.5 ? 1 : 0)),
      passing: Math.min(10, skills.passing + experienceBonus + (Math.random() > 0.5 ? 1 : 0)),
      defense: Math.min(10, skills.defense + experienceBonus + (Math.random() > 0.5 ? 1 : 0)),
      communication: Math.min(10, skills.communication + experienceBonus + (Math.random() > 0.5 ? 1 : 0))
    };
  }

  private mapExperience(caps: number): string {
    if (caps === 0) return 'New Cap';
    if (caps < 5) return 'Developing';
    if (caps < 15) return 'Experienced';
    if (caps < 30) return 'Veteran';
    return 'Senior Professional';
  }

  private mapPlayerStatus(status: string): string {
    return status === 'development' ? 'Development Squad' : 'Available';
  }

  private generatePreviousClubs(): string[] {
    const clubs = ['Auckland', 'Wellington', 'Canterbury', 'Otago', 'Waikato', 'Bay of Plenty'];
    return [clubs[Math.floor(Math.random() * clubs.length)]];
  }

  private generateScore(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateSprintTime(position: string): number {
    // Sprint times by position (10m in seconds)
    const sprintRanges: { [key: string]: [number, number] } = {
      'Hooker': [1.8, 2.1],
      'Prop': [2.0, 2.3],
      'Lock': [1.9, 2.2],
      'Loose Forward': [1.7, 2.0],
      'Halfback': [1.5, 1.8],
      'First-Five': [1.6, 1.9],
      'Midfielder': [1.5, 1.8],
      'Outside Back': [1.4, 1.7]
    };
    
    const [min, max] = sprintRanges[position] || [1.6, 1.9];
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }

  /**
   * Map CSV status to fitness status enum
   */
  private mapFitnessStatus(status: string): 'available' | 'injured' | 'recovering' | 'unavailable' {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('injured')) return 'injured';
    if (lowerStatus.includes('development')) return 'available';
    if (lowerStatus.includes('unavailable')) return 'unavailable';
    return 'available';
  }

  /**
   * Map CSV status to medical status enum
   */
  private mapMedicalStatus(status: string): 'cleared' | 'under_review' | 'restricted' {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('restricted')) return 'restricted';
    if (lowerStatus.includes('development')) return 'cleared';
    if (lowerStatus.includes('review')) return 'under_review';
    return 'cleared';
  }

  /**
   * Create player in Firestore with all subcollection structure
   */
  private async createPlayerWithSubcollections(player: FirebasePlayer): Promise<void> {
    const playerRef = db.collection(FIREBASE_COLLECTIONS.PLAYERS).doc(player.id);
    
    // Create main player document
    await playerRef.set(player);
    
    // Create empty subcollections with proper structure (Firebase needs at least one doc)
    // We'll create placeholder documents that can be easily identified and cleaned up later
    
    const subcollections = [
      FIREBASE_COLLECTIONS.MEDICAL_APPOINTMENTS,
      FIREBASE_COLLECTIONS.MEDICAL_NOTES,
      FIREBASE_COLLECTIONS.INJURY_RECORDS,
      FIREBASE_COLLECTIONS.FITNESS_TESTS,
      FIREBASE_COLLECTIONS.GPS_SESSIONS,
      FIREBASE_COLLECTIONS.PHYSICAL_ATTRIBUTES,
      FIREBASE_COLLECTIONS.COACHING_NOTES,
      FIREBASE_COLLECTIONS.MATCH_ANALYSIS,
      FIREBASE_COLLECTIONS.AI_ANALYSIS,
      FIREBASE_COLLECTIONS.DATA_SOURCE_TRACKING,
    ];

    // Create initial status tracking document
    const initialStatus: PlayerStatus = {
      playerId: player.id,
      currentStatus: this.mapFitnessStatus(player.currentStatus) as 'available' | 'injured' | 'unavailable' | 'suspended' | 'retired',
      fitnessStatus: 'fit',
      medicalClearance: this.mapMedicalStatus(player.currentStatus) as 'cleared' | 'restricted' | 'conditional' | 'not_cleared',
      availabilityNotes: undefined,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'migration_service',
      nextReviewDate: undefined,
    };

    await playerRef.collection(FIREBASE_COLLECTIONS.STATUS_TRACKING)
      .doc('current_status')
      .set(initialStatus);

    // Note: We don't create placeholder documents for other subcollections
    // Firestore will create them automatically when the first real document is added
  }

  /**
   * Create default squad structures
   */
  private async createDefaultSquads(): Promise<void> {
    const defaultSquads = [
      {
        id: 'first_xv',
        name: 'First XV',
        type: 'match_squad' as const,
        description: 'Primary match day squad',
        members: [],
        createdBy: 'migration_service',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: 'development_squad',
        name: 'Development Squad',
        type: 'development_squad' as const,
        description: 'Young players in development pathway',
        members: [],
        createdBy: 'migration_service',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: 'injury_rehab',
        name: 'Injury Rehabilitation',
        type: 'rehab_group' as const,
        description: 'Players currently in injury rehabilitation',
        members: [],
        createdBy: 'migration_service',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      },
    ];

    for (const squad of defaultSquads) {
      await db.collection(FIREBASE_COLLECTIONS.SQUADS).doc(squad.id).set(squad);
      console.log(`✅ Created squad: ${squad.name}`);
    }
  }

  /**
   * Verify migration was successful
   */
  async verifyMigration(): Promise<{success: boolean, playerCount: number, squadCount: number, errors: string[]}> {
    const errors: string[] = [];
    
    try {
      // Check players collection
      const playersSnapshot = await db.collection(FIREBASE_COLLECTIONS.PLAYERS).get();
      const playerCount = playersSnapshot.docs.length;
      
      // Check squads collection
      const squadsSnapshot = await db.collection(FIREBASE_COLLECTIONS.SQUADS).get();
      const squadCount = squadsSnapshot.docs.length;
      
      // Verify subcollection structure for a sample player
      if (playerCount > 0) {
        const firstPlayer = playersSnapshot.docs[0];
        const statusSnapshot = await firstPlayer.ref
          .collection(FIREBASE_COLLECTIONS.STATUS_TRACKING)
          .get();
        
        if (statusSnapshot.empty) {
          errors.push('Status tracking subcollection not found for sample player');
        }
      }
      
      console.log(`📊 Migration verification: ${playerCount} players, ${squadCount} squads`);
      
      return {
        success: errors.length === 0,
        playerCount,
        squadCount,
        errors
      };
      
    } catch (error) {
      console.error('❌ Migration verification failed:', error);
      errors.push(`Verification failed: ${error}`);
      return {
        success: false,
        playerCount: 0,
        squadCount: 0,
        errors
      };
    }
  }

  /**
   * Get migration status and statistics
   */
  async getMigrationStatus(): Promise<any> {
    try {
      const verification = await this.verifyMigration();
      
      return {
        timestamp: new Date().toISOString(),
        status: verification.success ? 'completed' : 'error',
        statistics: {
          totalPlayers: verification.playerCount,
          totalSquads: verification.squadCount,
          collections: Object.values(FIREBASE_COLLECTIONS).length,
        },
        errors: verification.errors,
        firebaseProject: 'north-harbour-rugby-dashboard1',
        schemaVersion: '2025-v1',
      };
    } catch (error: any) {
      return {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.toString(),
      };
    }
  }
}

export const migrationService = new FirebaseMigrationService();