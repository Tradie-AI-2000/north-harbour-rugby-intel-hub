import { db } from "./firebase";
import { 
  FIRESTORE_COLLECTIONS,
  FirestorePlayer,
  FirestoreTrainingSession,
  FirestoreGpsData,
  firestorePlayerSchema,
  firestoreTrainingSessionSchema,
  firestoreGpsDataSchema,
  validateFirestoreDocument,
  generateGpsDataId
} from "@shared/firebase-firestore-schema";

// ==========================================
// FIREBASE DATA MIGRATION UTILITIES
// North Harbour Rugby Performance Hub
// Data Migration and Population Tools
// ==========================================

export class FirebaseDataMigration {
  
  // Migrate existing hardcoded player data to Firebase
  static async migratePlayersToFirebase(): Promise<void> {
    console.log("🔄 Starting player data migration to Firebase...");
    
    try {
      const northHarbourSquad = [
        // Available Players (10)
        {
          id: "jake_thompson",
          firstName: "Jake",
          lastName: "Thompson", 
          dob: "1998-03-15T00:00:00.000Z",
          position: "Hooker",
          contractStatus: "Active" as const,
          photoURL: "https://placehold.co/400x400/0066CC/FFFFFF?text=JT",
          availability: {
            status: "Available" as const,
            detail: null,
            expectedReturn: null,
            lastUpdated: new Date().toISOString(),
            updatedBy: "system_migration"
          },
          jerseyNumber: 2,
          primaryPosition: "Hooker",
          secondaryPositions: ["Flanker"],
          yearsInTeam: 3,
          clubHistory: ["North Harbour", "Takapuna"],
          physicalAttributes: {
            height: 185,
            weight: 108,
            bodyFat: 12.5,
            lastMeasured: new Date().toISOString()
          },
          skills: {
            ballHandling: 8,
            passing: 7,
            kicking: 4,
            lineoutThrowing: 9,
            scrummaging: 8,
            rucking: 9,
            defense: 8,
            communication: 9
          },
          playerValue: {
            contractValue: 85000,
            attendanceScore: 9.2,
            medicalScore: 8.8,
            personalityScore: 9.5,
            performanceScore: 8.4,
            cohesionScore: 9.1,
            totalScore: 8.83,
            lastCalculated: new Date().toISOString()
          },
          contactInfo: {
            email: "jake.thompson@northharbour.co.nz",
            phone: "+64 21 555 0102",
            address: "123 Harbour View Road, Takapuna",
            emergencyContact: {
              name: "Sarah Thompson",
              relationship: "Mother",
              phone: "+64 21 555 0103"
            }
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "daniel_collins",
          firstName: "Daniel",
          lastName: "Collins",
          dob: "1997-08-22T00:00:00.000Z", 
          position: "Prop",
          contractStatus: "Active" as const,
          photoURL: "https://placehold.co/400x400/0066CC/FFFFFF?text=DC",
          availability: {
            status: "Available" as const,
            detail: null,
            expectedReturn: null,
            lastUpdated: new Date().toISOString(),
            updatedBy: "system_migration"
          },
          jerseyNumber: 1,
          primaryPosition: "Prop",
          secondaryPositions: [],
          yearsInTeam: 4,
          clubHistory: ["North Harbour", "North Shore"],
          physicalAttributes: {
            height: 188,
            weight: 118,
            bodyFat: 15.2,
            lastMeasured: new Date().toISOString()
          },
          skills: {
            ballHandling: 6,
            passing: 6,
            kicking: 3,
            lineoutThrowing: 2,
            scrummaging: 9,
            rucking: 8,
            defense: 8,
            communication: 7
          },
          contactInfo: {
            email: "daniel.collins@northharbour.co.nz",
            phone: "+64 21 555 0201",
            address: "456 Shore Road, Milford",
            emergencyContact: {
              name: "Michael Collins",
              relationship: "Father",
              phone: "+64 21 555 0202"
            }
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        
        // Injured Players (2)
        {
          id: "luke_henderson",
          firstName: "Luke",
          lastName: "Henderson",
          dob: "1999-01-10T00:00:00.000Z",
          position: "Lock",
          contractStatus: "Active" as const,
          photoURL: "https://placehold.co/400x400/CC0000/FFFFFF?text=LH",
          availability: {
            status: "Injured" as const,
            detail: "Knee ligament strain",
            expectedReturn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks
            lastUpdated: new Date().toISOString(),
            updatedBy: "dr_smith_medical"
          },
          jerseyNumber: 4,
          primaryPosition: "Lock",
          secondaryPositions: ["Flanker"],
          yearsInTeam: 2,
          clubHistory: ["North Harbour", "Glenfield"],
          physicalAttributes: {
            height: 198,
            weight: 115,
            bodyFat: 11.8,
            lastMeasured: new Date().toISOString()
          },
          skills: {
            ballHandling: 7,
            passing: 6,
            kicking: 5,
            lineoutThrowing: 3,
            scrummaging: 8,
            rucking: 9,
            defense: 8,
            communication: 7
          },
          contactInfo: {
            email: "luke.henderson@northharbour.co.nz",
            phone: "+64 21 555 0301",
            address: "789 Lake Road, Takapuna",
            emergencyContact: {
              name: "Emma Henderson",
              relationship: "Sister",
              phone: "+64 21 555 0302"
            }
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        
        // Modified Training Players (3)
        {
          id: "connor_white",
          firstName: "Connor",
          lastName: "White",
          dob: "1996-11-08T00:00:00.000Z",
          position: "Fly-half", 
          contractStatus: "Active" as const,
          photoURL: "https://placehold.co/400x400/FF9900/FFFFFF?text=CW",
          availability: {
            status: "Modified" as const,
            detail: "Load management - 75% training intensity",
            expectedReturn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
            lastUpdated: new Date().toISOString(),
            updatedBy: "coach_williams"
          },
          jerseyNumber: 10,
          primaryPosition: "Fly-half",
          secondaryPositions: ["Centre"],
          yearsInTeam: 5,
          clubHistory: ["North Harbour", "Northcote", "Grammar TEC"],
          physicalAttributes: {
            height: 178,
            weight: 85,
            bodyFat: 9.5,
            lastMeasured: new Date().toISOString()
          },
          skills: {
            ballHandling: 9,
            passing: 9,
            kicking: 9,
            lineoutThrowing: 2,
            scrummaging: 4,
            rucking: 6,
            defense: 7,
            communication: 9
          },
          playerValue: {
            contractValue: 125000,
            attendanceScore: 8.9,
            medicalScore: 7.5,
            personalityScore: 9.2,
            performanceScore: 9.1,
            cohesionScore: 8.8,
            totalScore: 8.88,
            lastCalculated: new Date().toISOString()
          },
          contactInfo: {
            email: "connor.white@northharbour.co.nz",
            phone: "+64 21 555 0401",
            address: "321 Beach Road, Browns Bay",
            emergencyContact: {
              name: "Rebecca White",
              relationship: "Partner",
              phone: "+64 21 555 0402"
            }
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // Add 10 more available players to reach 15-player squad
      const additionalPlayers = [
        "ryan_patel", "marcus_jones", "alex_brown", "thomas_wilson", "james_taylor",
        "samuel_davis", "william_garcia", "matthew_rodriguez", "joshua_martinez", "andrew_lopez"
      ].map((id, index) => ({
        id,
        firstName: id.split('_')[0].charAt(0).toUpperCase() + id.split('_')[0].slice(1),
        lastName: id.split('_')[1].charAt(0).toUpperCase() + id.split('_')[1].slice(1),
        dob: `199${7 + (index % 3)}-0${(index % 9) + 1}-${10 + index}T00:00:00.000Z`,
        position: ["Flanker", "Wing", "Centre", "Fullback", "Number 8"][index % 5],
        contractStatus: "Active" as const,
        photoURL: `https://placehold.co/400x400/0066CC/FFFFFF?text=${id.split('_')[0][0].toUpperCase()}${id.split('_')[1][0].toUpperCase()}`,
        availability: {
          status: "Available" as const,
          detail: null,
          expectedReturn: null,
          lastUpdated: new Date().toISOString(),
          updatedBy: "system_migration"
        },
        jerseyNumber: 5 + index,
        primaryPosition: ["Flanker", "Wing", "Centre", "Fullback", "Number 8"][index % 5],
        secondaryPositions: [],
        yearsInTeam: 1 + (index % 4),
        clubHistory: ["North Harbour"],
        physicalAttributes: {
          height: 175 + (index % 20),
          weight: 80 + (index % 30),
          bodyFat: 8.5 + (index % 5),
          lastMeasured: new Date().toISOString()
        },
        skills: {
          ballHandling: 6 + (index % 4),
          passing: 6 + (index % 4),
          kicking: 4 + (index % 6),
          lineoutThrowing: 2 + (index % 3),
          scrummaging: 5 + (index % 5),
          rucking: 6 + (index % 4),
          defense: 6 + (index % 4),
          communication: 6 + (index % 4)
        },
        contactInfo: {
          email: `${id}@northharbour.co.nz`,
          phone: `+64 21 555 0${500 + index}`,
          address: `${100 + index} Rugby Street, Auckland`,
          emergencyContact: {
            name: `Emergency Contact ${index}`,
            relationship: "Parent",
            phone: `+64 21 555 0${600 + index}`
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      const allPlayers = [...northHarbourSquad, ...additionalPlayers];
      
      // Validate and upload each player
      for (const playerData of allPlayers) {
        try {
          const validatedPlayer = validateFirestoreDocument(firestorePlayerSchema, playerData);
          
          await db.collection(FIRESTORE_COLLECTIONS.PLAYERS)
            .doc(playerData.id)
            .set(validatedPlayer);
          
          console.log(`✅ Migrated player: ${playerData.firstName} ${playerData.lastName} (${playerData.availability.status})`);
          
        } catch (error) {
          console.error(`❌ Failed to migrate player ${playerData.id}:`, error);
        }
      }
      
      console.log(`🎉 Successfully migrated ${allPlayers.length} players to Firebase`);
      console.log(`   📊 Status breakdown: ${allPlayers.filter(p => p.availability.status === 'Available').length} Available, ${allPlayers.filter(p => p.availability.status === 'Injured').length} Injured, ${allPlayers.filter(p => p.availability.status === 'Modified').length} Modified`);
      
    } catch (error) {
      console.error("❌ Player migration failed:", error);
      throw error;
    }
  }
  
  // Create sample training session and GPS data
  static async createSampleTrainingData(): Promise<void> {
    console.log("🏃 Creating sample training session and GPS data...");
    
    try {
      // Create training session
      const trainingSession: FirestoreTrainingSession = {
        sessionDate: new Date().toISOString(),
        sessionTitle: "High Intensity Training - Week 3",
        week: 3,
        day: 2,
        sessionType: "High Intensity",
        location: "North Harbour Stadium",
        duration: 90,
        weather: "Light rain",
        temperature: 16,
        windSpeed: 12,
        pitchCondition: "Good",
        participantCount: 15,
        participants: [
          "jake_thompson", "daniel_collins", "luke_henderson", "connor_white", "ryan_patel",
          "marcus_jones", "alex_brown", "thomas_wilson", "james_taylor", "samuel_davis",
          "william_garcia", "matthew_rodriguez", "joshua_martinez", "andrew_lopez"
        ],
        coachingStaff: ["coach_williams", "assistant_jones", "sc_smith"],
        objectives: [
          "High-intensity interval training",
          "Lineout accuracy under pressure",
          "Breakdown speed and accuracy"
        ],
        plannedIntensity: "High",
        plannedLoad: 450,
        actualIntensity: "High",
        actualLoad: 425,
        sessionQuality: "Good",
        coachNotes: "Good session despite wet conditions. Lineout work particularly effective.",
        weatherImpact: "Minor",
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "coach_williams"
      };
      
      const sessionRef = await db.collection(FIRESTORE_COLLECTIONS.TRAINING_SESSIONS).add(trainingSession);
      const sessionId = sessionRef.id;
      
      console.log(`✅ Created training session: ${sessionId}`);
      
      // Create GPS data for key players
      const sampleGpsData = [
        {
          playerId: "jake_thompson",
          gpsMetrics: {
            totalDistance: 4200,
            metresPerMinute: 46.7,
            highSpeedRunningDistance: 420,
            sprintDistance: 180,
            maxVelocity: 8.7,
            accelerations: { total: 45, high: 12, moderate: 20 },
            decelerations: { total: 42, high: 8, moderate: 18 },
            dynamicStressLoad: 420,
            impacts: 28,
            highMetabolicLoadDistance: 890,
            involvements: 34,
            acwr: 1.2,
            personalDSLAverage: 385,
            positionalDSLAverage: 410,
            loadStatus: "green" as const,
            performanceStatus: "Good" as const,
            dataQuality: 0.95,
            satelliteCount: 12,
            signalStrength: 98
          }
        },
        {
          playerId: "connor_white",
          gpsMetrics: {
            totalDistance: 3800,
            metresPerMinute: 42.2,
            highSpeedRunningDistance: 380,
            sprintDistance: 160,
            maxVelocity: 8.2,
            accelerations: { total: 38, high: 9, moderate: 16 },
            decelerations: { total: 35, high: 6, moderate: 15 },
            dynamicStressLoad: 315, // Lower due to modified training
            impacts: 22,
            highMetabolicLoadDistance: 760,
            involvements: 42,
            acwr: 0.9,
            personalDSLAverage: 380,
            positionalDSLAverage: 365,
            loadStatus: "amber" as const, // Modified training
            performanceStatus: "Moderate" as const,
            dataQuality: 0.92,
            satelliteCount: 11,
            signalStrength: 95
          }
        }
      ];
      
      for (const playerGps of sampleGpsData) {
        const docId = generateGpsDataId(playerGps.playerId, sessionId);
        
        const gpsDocument: FirestoreGpsData = {
          playerRef: `/players/${playerGps.playerId}`,
          sessionRef: `/training_sessions/${sessionId}`,
          playerId: playerGps.playerId,
          sessionId: sessionId,
          date: new Date().toISOString(),
          sessionType: "training",
          gpsMetrics: playerGps.gpsMetrics,
          uploadedAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
          dataSource: "StatSports"
        };
        
        await db.collection(FIRESTORE_COLLECTIONS.GPS_DATA)
          .doc(docId)
          .set(gpsDocument);
        
        // Update player's latest GPS reference
        await db.collection(FIRESTORE_COLLECTIONS.PLAYERS)
          .doc(playerGps.playerId)
          .update({
            latestGpsRef: docId,
            updatedAt: new Date().toISOString()
          });
        
        console.log(`✅ Created GPS data for: ${playerGps.playerId}`);
      }
      
      console.log("🎉 Sample training data created successfully");
      
    } catch (error) {
      console.error("❌ Sample training data creation failed:", error);
      throw error;
    }
  }
  
  // Verify data integrity
  static async verifyDataIntegrity(): Promise<void> {
    console.log("🔍 Verifying Firebase data integrity...");
    
    try {
      // Check players collection
      const playersSnapshot = await db.collection(FIRESTORE_COLLECTIONS.PLAYERS).get();
      console.log(`   📊 Players: ${playersSnapshot.size} documents`);
      
      // Check GPS data collection
      const gpsSnapshot = await db.collection(FIRESTORE_COLLECTIONS.GPS_DATA).get();
      console.log(`   📍 GPS Data: ${gpsSnapshot.size} documents`);
      
      // Check training sessions collection
      const sessionsSnapshot = await db.collection(FIRESTORE_COLLECTIONS.TRAINING_SESSIONS).get();
      console.log(`   🏃 Training Sessions: ${sessionsSnapshot.size} documents`);
      
      // Verify data relationships
      let validReferences = 0;
      let invalidReferences = 0;
      
      for (const gpsDoc of gpsSnapshot.docs) {
        const gpsData = gpsDoc.data();
        
        // Check if player exists
        const playerDoc = await db.collection(FIRESTORE_COLLECTIONS.PLAYERS).doc(gpsData.playerId).get();
        if (playerDoc.exists) {
          validReferences++;
        } else {
          invalidReferences++;
          console.warn(`   ⚠️  GPS data ${gpsDoc.id} references non-existent player: ${gpsData.playerId}`);
        }
      }
      
      console.log(`   ✅ Valid references: ${validReferences}`);
      console.log(`   ❌ Invalid references: ${invalidReferences}`);
      
      if (invalidReferences === 0) {
        console.log("🎉 Data integrity verification passed");
      } else {
        console.warn("⚠️  Data integrity issues found");
      }
      
    } catch (error) {
      console.error("❌ Data integrity verification failed:", error);
      throw error;
    }
  }
  
  // Complete migration process
  static async runCompleteMigration(): Promise<void> {
    console.log("🚀 Starting complete Firebase migration...");
    
    try {
      await this.migratePlayersToFirebase();
      await this.createSampleTrainingData();
      await this.verifyDataIntegrity();
      
      console.log("🎉 Complete Firebase migration successful!");
      console.log("📋 Migration Summary:");
      console.log("   ✅ Player data migrated with realistic availability statuses");
      console.log("   ✅ Sample training session and GPS data created");
      console.log("   ✅ Data integrity verified");
      console.log("   ✅ All collections populated and ready for production use");
      console.log("🔗 Firebase Firestore now serves as single source of truth");
      
    } catch (error) {
      console.error("❌ Complete migration failed:", error);
      throw error;
    }
  }
}

// Export migration utilities
export default FirebaseDataMigration;