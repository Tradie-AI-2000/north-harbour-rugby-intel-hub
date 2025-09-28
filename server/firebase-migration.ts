import { db } from './firebase';
import { FieldValue } from 'firebase-admin/firestore';

// Check current Firebase database structure
export async function examineCurrentFirebaseData() {
  try {
    console.log('🔍 Examining current Firebase database...');
    
    const playersSnapshot = await db.collection('players').get();
    console.log(`Found ${playersSnapshot.size} players in Firebase`);
    
    if (playersSnapshot.size > 0) {
      const firstPlayer = playersSnapshot.docs[0];
      console.log('First player ID:', firstPlayer.id);
      console.log('First player data structure:', Object.keys(firstPlayer.data()));
      
      // Check for specific merged fields
      const playerData = firstPlayer.data();
      if (playerData.teamhistory) console.log('✅ Found teamhistory field');
      if (playerData.positivecontributions) console.log('✅ Found positivecontributions field');
      
      return {
        playerCount: playersSnapshot.size,
        firstPlayerId: firstPlayer.id,
        sampleData: playerData,
        hasTeamHistory: !!playerData.teamhistory,
        hasPositiveContributions: !!playerData.positivecontributions
      };
    }
    
    return { playerCount: 0 };
  } catch (error) {
    console.error('Error examining Firebase data:', error);
    throw error;
  }
}

// Clear existing player data
export async function clearExistingPlayers() {
  try {
    console.log('🗑️ Clearing existing player data...');
    
    const playersSnapshot = await db.collection('players').get();
    const batch = db.batch();
    
    playersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ Deleted ${playersSnapshot.size} existing players`);
    
    return playersSnapshot.size;
  } catch (error) {
    console.error('Error clearing players:', error);
    throw error;
  }
}

// Create 2025 North Harbour Squad with unified schema
export async function create2025NorthHarbourSquad() {
  try {
    console.log('🏉 Creating 2025 North Harbour Squad...');
    
    // Unified 2025 North Harbour Rugby Squad
    const squad2025 = [
      {
        id: "penaia_cakobau",
        personalDetails: {
          firstName: "Penaia",
          lastName: "Cakobau",
          dateOfBirth: "1998-05-10",
          email: "penaia.cakobau@northharbour.co.nz",
          phone: "+64 21 123 4567",
          address: "Auckland, New Zealand",
          emergencyContact: {
            name: "Contact Person",
            relationship: "Family",
            phone: "+64 21 987 6543"
          },
          profileImageUrl: "https://placehold.co/400x400/003366/FFFFFF?text=PC"
        },
        rugbyProfile: {
          jerseyNumber: 2,
          primaryPosition: "Hooker",
          secondaryPositions: ["Back Row"],
          dateJoinedClub: "2023-01-01",
          previousClubs: ["Takapuna RFC"],
          representativeHonours: ["North Harbour", "Blues"],
          clubHistory: ["Takapuna RFC", "North Harbour"],
          yearsInTeam: 2,
          teamhistory: "North Harbour,Blues" // Legacy field
        },
        physicalAttributes: [{
          date: "2025-01-01",
          weight: 105,
          height: 185,
          bodyFat: 12.5,
          muscleMass: 92.4,
          leanMass: 92
        }],
        testResults: [{
          date: "2025-01-01",
          benchPress: 140,
          squat: 180,
          sprint40m: 5.8,
          verticalJump: 65,
          beepTest: 14.2
        }],
        skills: {
          ballHandling: 9,
          passing: 8,
          kicking: 6,
          lineoutThrowing: 9,
          scrummaging: 8,
          rucking: 8,
          defense: 8,
          communication: 9
        },
        gameStats: [{
          date: "2025-01-01",
          season: "2025",
          opponent: "Season Average",
          position: "Hooker",
          minutesPlayed: 750,
          tries: 3,
          tackles: 45,
          carries: 25,
          passAccuracy: 92,
          kicksAtGoal: 0,
          kicksSuccessful: 0,
          penalties: 2,
          turnovers: 1,
          matchesPlayed: 15
        }],
        injuries: [],
        status: {
          availability: "available",
          currentStatus: "Fit",
          lastUpdated: "2025-01-22"
        },
        moneyBallMetrics: {
          contractValue: 95000,
          attendanceScore: 9.2,
          scScore: 8.8,
          medicalScore: 9.5,
          personalityScore: 9.0,
          minutesPlayed: 750,
          totalContributions: 280,
          positiveContributions: 245,
          negativeContributions: 35,
          penaltyCount: 2,
          xFactorContributions: 18,
          sprintTime10m: 1.82,
          dateSigned: "2023-11-01",
          offContractDate: "2026-10-31",
          gritNote: "Outstanding lineout accuracy and leadership qualities",
          communityNote: "Active in youth rugby development programs",
          familyBackground: "Strong Pacific Island rugby heritage"
        },
        coachingNotes: "Exceptional lineout throwing accuracy. Natural leader with strong communication skills.",
        reports: [],
        activities: [],
        videos: []
      },
      {
        id: "tane_edmed",
        personalDetails: {
          firstName: "Tane",
          lastName: "Edmed",
          dateOfBirth: "2000-04-29",
          email: "tane.edmed@northharbour.co.nz",
          phone: "+64 21 234 5678",
          address: "Auckland, New Zealand",
          emergencyContact: {
            name: "Contact Person",
            relationship: "Family", 
            phone: "+64 21 876 5432"
          },
          profileImageUrl: "https://eu-cdn.rugbypass.com/webp-images/images/players/head/5575.png.webp?maxw=300"
        },
        rugbyProfile: {
          jerseyNumber: 10,
          primaryPosition: "Fly-half",
          secondaryPositions: ["Fullback"],
          dateJoinedClub: "2024-01-01",
          previousClubs: ["Waratahs", "Eastwood"],
          representativeHonours: ["North Harbour", "Waratahs"],
          clubHistory: ["Eastwood", "Waratahs", "North Harbour"],
          yearsInTeam: 1,
          teamhistory: "Waratahs,North Harbour"
        },
        physicalAttributes: [{
          date: "2025-01-01",
          weight: 85,
          height: 180,
          bodyFat: 10.2,
          muscleMass: 76.3,
          leanMass: 76
        }],
        testResults: [{
          date: "2025-01-01",
          benchPress: 110,
          squat: 150,
          sprint40m: 5.2,
          verticalJump: 72,
          beepTest: 15.8
        }],
        skills: {
          ballHandling: 9,
          passing: 9,
          kicking: 9,
          lineoutThrowing: 4,
          scrummaging: 5,
          rucking: 7,
          defense: 7,
          communication: 9
        },
        gameStats: [{
          date: "2025-01-01",
          season: "2025",
          opponent: "Season Average",
          position: "Fly-half",
          minutesPlayed: 800,
          tries: 5,
          tackles: 35,
          carries: 45,
          passAccuracy: 88,
          kicksAtGoal: 25,
          kicksSuccessful: 20,
          penalties: 3,
          turnovers: 4,
          matchesPlayed: 16
        }],
        injuries: [],
        status: {
          availability: "available",
          currentStatus: "Fit",
          lastUpdated: "2025-01-22"
        },
        moneyBallMetrics: {
          contractValue: 120000,
          attendanceScore: 9.5,
          scScore: 9.2,
          medicalScore: 8.8,
          personalityScore: 9.3,
          minutesPlayed: 800,
          totalContributions: 350,
          positiveContributions: 315,
          negativeContributions: 35,
          penaltyCount: 3,
          xFactorContributions: 28,
          sprintTime10m: 1.68,
          dateSigned: "2024-01-01",
          offContractDate: "2027-12-31",
          gritNote: "Excellent game management and tactical awareness",
          communityNote: "Mentors young players in skills development",
          familyBackground: "Son of former professional player"
        },
        coachingNotes: "Outstanding game management and tactical kicking. Key playmaker for 2025 season.",
        reports: [],
        activities: [],
        videos: []
      },
      {
        id: "mark_telea",
        personalDetails: {
          firstName: "Mark",
          lastName: "Tele'a",
          dateOfBirth: "1997-01-17",
          email: "mark.telea@northharbour.co.nz",
          phone: "+64 21 345 6789",
          address: "Auckland, New Zealand",
          emergencyContact: {
            name: "Contact Person",
            relationship: "Family",
            phone: "+64 21 765 4321"
          },
          profileImageUrl: "https://placehold.co/400x400/003366/FFFFFF?text=MT"
        },
        rugbyProfile: {
          jerseyNumber: 11,
          primaryPosition: "Wing",
          secondaryPositions: ["Fullback"],
          dateJoinedClub: "2022-01-01",
          previousClubs: ["Blues", "Auckland"],
          representativeHonours: ["All Blacks", "Blues", "North Harbour"],
          clubHistory: ["Auckland", "Blues", "North Harbour"],
          yearsInTeam: 3,
          teamhistory: "Auckland,Blues,All Blacks,North Harbour"
        },
        physicalAttributes: [{
          date: "2025-01-01",
          weight: 95,
          height: 183,
          bodyFat: 8.5,
          muscleMass: 86.9,
          leanMass: 87
        }],
        testResults: [{
          date: "2025-01-01",
          benchPress: 125,
          squat: 170,
          sprint40m: 4.8,
          verticalJump: 78,
          beepTest: 16.2
        }],
        skills: {
          ballHandling: 9,
          passing: 8,
          kicking: 7,
          lineoutThrowing: 3,
          scrummaging: 4,
          rucking: 7,
          defense: 8,
          communication: 8
        },
        gameStats: [{
          date: "2025-01-01",
          season: "2025",
          opponent: "Season Average",
          position: "Wing",
          minutesPlayed: 720,
          tries: 12,
          tackles: 28,
          carries: 55,
          passAccuracy: 85,
          kicksAtGoal: 0,
          kicksSuccessful: 0,
          penalties: 1,
          turnovers: 3,
          matchesPlayed: 14
        }],
        injuries: [],
        status: {
          availability: "available",
          currentStatus: "Fit",
          lastUpdated: "2025-01-22"
        },
        moneyBallMetrics: {
          contractValue: 140000,
          attendanceScore: 9.8,
          scScore: 9.5,
          medicalScore: 9.2,
          personalityScore: 8.9,
          minutesPlayed: 720,
          totalContributions: 420,
          positiveContributions: 395,
          negativeContributions: 25,
          penaltyCount: 1,
          xFactorContributions: 35,
          sprintTime10m: 1.58,
          dateSigned: "2022-01-01",
          offContractDate: "2026-12-31",
          gritNote: "Exceptional speed and finishing ability under pressure",
          communityNote: "Ambassador for Pacific Island rugby development",
          familyBackground: "Strong Samoan heritage and family rugby tradition"
        },
        coachingNotes: "Elite finisher with exceptional pace. Key attacking weapon and defensive rock.",
        reports: [],
        activities: [],
        videos: []
      },
      {
        id: "wallace_sititi",
        personalDetails: {
          firstName: "Wallace",
          lastName: "Sititi",
          dateOfBirth: "1999-05-12",
          email: "wallace.sititi@northharbour.co.nz",
          phone: "+64 21 456 7890",
          address: "Auckland, New Zealand",
          emergencyContact: {
            name: "Contact Person",
            relationship: "Family",
            phone: "+64 21 654 3210"
          },
          profileImageUrl: "https://placehold.co/400x400/003366/FFFFFF?text=WS"
        },
        rugbyProfile: {
          jerseyNumber: 8,
          primaryPosition: "Number 8",
          secondaryPositions: ["Flanker"],
          dateJoinedClub: "2023-01-01",
          previousClubs: ["Blues", "Auckland"],
          representativeHonours: ["All Blacks", "Blues", "North Harbour"],
          clubHistory: ["Auckland", "Blues", "North Harbour"],
          yearsInTeam: 2,
          teamhistory: "Auckland,Blues,All Blacks,North Harbour"
        },
        physicalAttributes: [{
          date: "2025-01-01",
          weight: 112,
          height: 196,
          bodyFat: 11.8,
          muscleMass: 98.8,
          leanMass: 99
        }],
        testResults: [{
          date: "2025-01-01",
          benchPress: 160,
          squat: 220,
          sprint40m: 5.5,
          verticalJump: 68,
          beepTest: 14.8
        }],
        skills: {
          ballHandling: 8,
          passing: 7,
          kicking: 6,
          lineoutThrowing: 4,
          scrummaging: 8,
          rucking: 9,
          defense: 9,
          communication: 8
        },
        gameStats: [{
          date: "2025-01-01",
          season: "2025",
          opponent: "Season Average",
          position: "Number 8",
          minutesPlayed: 680,
          tries: 4,
          tackles: 58,
          carries: 65,
          passAccuracy: 82,
          kicksAtGoal: 0,
          kicksSuccessful: 0,
          penalties: 4,
          turnovers: 7,
          matchesPlayed: 13
        }],
        injuries: [],
        status: {
          availability: "available",
          currentStatus: "Fit",
          lastUpdated: "2025-01-22"
        },
        moneyBallMetrics: {
          contractValue: 135000,
          attendanceScore: 9.6,
          scScore: 9.1,
          medicalScore: 9.0,
          personalityScore: 8.8,
          minutesPlayed: 680,
          totalContributions: 380,
          positiveContributions: 340,
          negativeContributions: 40,
          penaltyCount: 4,
          xFactorContributions: 22,
          sprintTime10m: 1.75,
          dateSigned: "2023-01-01",
          offContractDate: "2027-12-31",
          gritNote: "Powerful ball carrier with excellent work rate",
          communityNote: "Works with youth fitness programs",
          familyBackground: "Tongan heritage with strong work ethic values"
        },
        coachingNotes: "Dynamic ball carrier and lineout option. Excellent fitness and work rate.",
        reports: [],
        activities: [],
        videos: []
      },
      {
        id: "bryn_hall",
        personalDetails: {
          firstName: "Bryn",
          lastName: "Hall",
          dateOfBirth: "1994-08-25",
          email: "bryn.hall@northharbour.co.nz",
          phone: "+64 21 567 8901",
          address: "Auckland, New Zealand",
          emergencyContact: {
            name: "Contact Person",
            relationship: "Family",
            phone: "+64 21 543 2109"
          },
          profileImageUrl: "https://placehold.co/400x400/003366/FFFFFF?text=BH"
        },
        rugbyProfile: {
          jerseyNumber: 9,
          primaryPosition: "Scrum-half",
          secondaryPositions: [],
          dateJoinedClub: "2024-01-01",
          previousClubs: ["Crusaders", "Canterbury"],
          representativeHonours: ["All Blacks", "Crusaders", "North Harbour"],
          clubHistory: ["Canterbury", "Crusaders", "North Harbour"],
          yearsInTeam: 1,
          teamhistory: "Canterbury,Crusaders,All Blacks,North Harbour"
        },
        physicalAttributes: [{
          date: "2025-01-01",
          weight: 82,
          height: 175,
          bodyFat: 9.8,
          muscleMass: 74.0,
          leanMass: 74
        }],
        testResults: [{
          date: "2025-01-01",
          benchPress: 105,
          squat: 140,
          sprint40m: 5.0,
          verticalJump: 70,
          beepTest: 15.5
        }],
        skills: {
          ballHandling: 9,
          passing: 9,
          kicking: 8,
          lineoutThrowing: 5,
          scrummaging: 6,
          rucking: 7,
          defense: 7,
          communication: 9
        },
        gameStats: [{
          date: "2025-01-01",
          season: "2025",
          opponent: "Season Average",
          position: "Scrum-half",
          minutesPlayed: 720,
          tries: 2,
          tackles: 42,
          carries: 35,
          passAccuracy: 94,
          kicksAtGoal: 0,
          kicksSuccessful: 0,
          penalties: 1,
          turnovers: 2,
          matchesPlayed: 14
        }],
        injuries: [],
        status: {
          availability: "available",
          currentStatus: "Fit",
          lastUpdated: "2025-01-22"
        },
        moneyBallMetrics: {
          contractValue: 125000,
          attendanceScore: 9.7,
          scScore: 9.3,
          medicalScore: 8.9,
          personalityScore: 9.1,
          minutesPlayed: 720,
          totalContributions: 320,
          positiveContributions: 300,
          negativeContributions: 20,
          penaltyCount: 1,
          xFactorContributions: 25,
          sprintTime10m: 1.65,
          dateSigned: "2024-01-01",
          offContractDate: "2027-12-31",
          gritNote: "Quick decision making under pressure",
          communityNote: "Coaches junior rugby teams",
          familyBackground: "Rugby family with strong competitive spirit"
        },
        coachingNotes: "Excellent service and game management. Proven at highest level.",
        reports: [],
        activities: [],
        videos: []
      }
    ];

    // Add players to Firebase in batches
    const batchSize = 5;
    let playersAdded = 0;

    for (let i = 0; i < squad2025.length; i += batchSize) {
      const batch = db.batch();
      const batchPlayers = squad2025.slice(i, i + batchSize);
      
      batchPlayers.forEach(player => {
        const playerRef = db.collection('players').doc(player.id);
        batch.set(playerRef, {
          ...player,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      playersAdded += batchPlayers.length;
      console.log(`✅ Added ${playersAdded}/${squad2025.length} players to Firebase`);
    }

    console.log(`🏉 Successfully created 2025 North Harbour Squad with ${squad2025.length} players`);
    return squad2025.length;
    
  } catch (error) {
    console.error('Error creating 2025 squad:', error);
    throw error;
  }
}

// Main migration function
export async function migrateToUnifiedFirebaseDatabase() {
  try {
    console.log('🚀 Starting unified Firebase migration...');
    
    // 1. Examine current data
    const currentData = await examineCurrentFirebaseData();
    console.log('Current database analysis:', currentData);
    
    // 2. Clear existing data
    const deletedCount = await clearExistingPlayers();
    
    // 3. Create new 2025 squad
    const newPlayerCount = await create2025NorthHarbourSquad();
    
    console.log(`\n✅ Migration Complete!`);
    console.log(`   Deleted: ${deletedCount} old players`);
    console.log(`   Created: ${newPlayerCount} new 2025 squad players`);
    console.log(`   Single source of truth established in Firebase`);
    
    return {
      success: true,
      deletedCount,
      newPlayerCount,
      message: 'Successfully migrated to unified 2025 North Harbour Squad'
    };
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}