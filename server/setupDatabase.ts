import { db } from './db';
import { players } from '@shared/schema';

// Your actual North Harbour Rugby players from the CSV
const northHarbourPlayers = [
  {
    id: "penaia_cakobau",
    personalDetails: JSON.stringify({
      firstName: "Penaia",
      lastName: "Cakobau",
      dateOfBirth: "1998-05-10",
      email: "penaia.cakobau@example.com",
      phone: "555-123-4567",
      address: "Auckland, New Zealand",
      emergencyContact: { name: "Emergency Contact", relationship: "Family", phone: "555-000-0000" }
    }),
    rugbyProfile: JSON.stringify({
      position: "Hooker",
      jerseyNumber: 2,
      dateJoinedClub: "2023-01-01",
      previousClubs: [],
      representativeHonours: []
    }),
    physicalAttributes: JSON.stringify([{
      date: "2024-01-01",
      weight: 105,
      height: 185,
      bodyFat: 12.5,
      leanMass: 92
    }]),
    testResults: JSON.stringify([]),
    gameStats: JSON.stringify([{
      date: "2024-01-15",
      opponent: "Season Average",
      position: "Hooker",
      minutesPlayed: 80,
      tries: 1,
      tackles: 10,
      carries: 5,
      passAccuracy: 85,
      kicksAtGoal: 0,
      kicksSuccessful: 0
    }]),
    skills: JSON.stringify({ technical: [], tactical: [], physical: [], mental: [] }),
    injuries: JSON.stringify([]),
    reports: JSON.stringify([]),
    activities: JSON.stringify([]),
    videos: JSON.stringify([]),
    status: "available",
    currentStatus: "Minor Strain",
    coachingNotes: "Outstanding lineout work",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "tane_edmed", 
    personalDetails: JSON.stringify({
      firstName: "Tane",
      lastName: "Edmed",
      dateOfBirth: "2000-04-29",
      email: "tane.edmed@example.com",
      phone: "555-777-6666",
      address: "Auckland, New Zealand",
      emergencyContact: { name: "Emergency Contact", relationship: "Family", phone: "555-000-0000" }
    }),
    rugbyProfile: JSON.stringify({
      position: "First-Five",
      jerseyNumber: 10,
      dateJoinedClub: "2023-01-01",
      previousClubs: [],
      representativeHonours: []
    }),
    physicalAttributes: JSON.stringify([{
      date: "2024-01-01",
      weight: 85,
      height: 180,
      bodyFat: 9,
      leanMass: 77
    }]),
    testResults: JSON.stringify([]),
    gameStats: JSON.stringify([{
      date: "2024-01-15",
      opponent: "Season Average",
      position: "First-Five",
      minutesPlayed: 80,
      tries: 0,
      tackles: 4,
      carries: 2,
      passAccuracy: 94,
      kicksAtGoal: 8,
      kicksSuccessful: 6
    }]),
    skills: JSON.stringify({ technical: [], tactical: [], physical: [], mental: [] }),
    injuries: JSON.stringify([]),
    reports: JSON.stringify([]),
    activities: JSON.stringify([]),
    videos: JSON.stringify([]),
    status: "available",
    currentStatus: "Active",
    coachingNotes: "Good kicking game",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "mark_telea",
    personalDetails: JSON.stringify({
      firstName: "Mark",
      lastName: "Tele'a",
      dateOfBirth: "1995-07-24",
      email: "mark.telea@example.com",
      phone: "555-000-1111",
      address: "Auckland, New Zealand",
      emergencyContact: { name: "Emergency Contact", relationship: "Family", phone: "555-000-0000" }
    }),
    rugbyProfile: JSON.stringify({
      position: "Outside Back",
      jerseyNumber: 34,
      dateJoinedClub: "2023-01-01",
      previousClubs: [],
      representativeHonours: []
    }),
    physicalAttributes: JSON.stringify([{
      date: "2024-01-01",
      weight: 87,
      height: 184,
      bodyFat: 8.2,
      leanMass: 80
    }]),
    testResults: JSON.stringify([]),
    gameStats: JSON.stringify([{
      date: "2024-01-15",
      opponent: "Season Average",
      position: "Outside Back",
      minutesPlayed: 80,
      tries: 5,
      tackles: 8,
      carries: 10,
      passAccuracy: 89,
      kicksAtGoal: 0,
      kicksSuccessful: 0
    }]),
    skills: JSON.stringify({ technical: [], tactical: [], physical: [], mental: [] }),
    injuries: JSON.stringify([]),
    reports: JSON.stringify([]),
    activities: JSON.stringify([]),
    videos: JSON.stringify([]),
    status: "available",
    currentStatus: "Active",
    coachingNotes: "Experienced fullback",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "bryn_gordon",
    personalDetails: JSON.stringify({
      firstName: "Bryn",
      lastName: "Gordon",
      dateOfBirth: "1997-11-22",
      email: "bryn.gordon@example.com",
      phone: "555-234-5678",
      address: "Auckland, New Zealand",
      emergencyContact: { name: "Emergency Contact", relationship: "Family", phone: "555-000-0000" }
    }),
    rugbyProfile: JSON.stringify({
      position: "Hooker",
      jerseyNumber: 16,
      dateJoinedClub: "2023-01-01",
      previousClubs: [],
      representativeHonours: []
    }),
    physicalAttributes: JSON.stringify([{
      date: "2024-01-01",
      weight: 102,
      height: 183,
      bodyFat: 11.8,
      leanMass: 90
    }]),
    testResults: JSON.stringify([]),
    gameStats: JSON.stringify([{
      date: "2024-01-15",
      opponent: "Season Average",
      position: "Hooker",
      minutesPlayed: 80,
      tries: 0,
      tackles: 12,
      carries: 4,
      passAccuracy: 85.2,
      kicksAtGoal: 0,
      kicksSuccessful: 0
    }]),
    skills: JSON.stringify({ technical: [], tactical: [], physical: [], mental: [] }),
    injuries: JSON.stringify([]),
    reports: JSON.stringify([]),
    activities: JSON.stringify([]),
    videos: JSON.stringify([]),
    status: "available",
    currentStatus: "Active",
    coachingNotes: "Strong in scrum",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "cam_christie",
    personalDetails: JSON.stringify({
      firstName: "Cam",
      lastName: "Christie",
      dateOfBirth: "1999-06-20",
      email: "cam.christie@example.com",
      phone: "555-111-2222",
      address: "Auckland, New Zealand",
      emergencyContact: { name: "Emergency Contact", relationship: "Family", phone: "555-000-0000" }
    }),
    rugbyProfile: JSON.stringify({
      position: "Lock",
      jerseyNumber: 4,
      dateJoinedClub: "2023-01-01",
      previousClubs: [],
      representativeHonours: []
    }),
    physicalAttributes: JSON.stringify([{
      date: "2024-01-01",
      weight: 110,
      height: 198,
      bodyFat: 10.5,
      leanMass: 98
    }]),
    testResults: JSON.stringify([]),
    gameStats: JSON.stringify([{
      date: "2024-01-15",
      opponent: "Season Average",
      position: "Lock",
      minutesPlayed: 80,
      tries: 0,
      tackles: 13,
      carries: 6,
      passAccuracy: 76,
      kicksAtGoal: 0,
      kicksSuccessful: 0
    }]),
    skills: JSON.stringify({ technical: [], tactical: [], physical: [], mental: [] }),
    injuries: JSON.stringify([]),
    reports: JSON.stringify([]),
    activities: JSON.stringify([]),
    videos: JSON.stringify([]),
    status: "available",
    currentStatus: "Active",
    coachingNotes: "Dominant at scrum time",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function setupNorthHarbourDatabase() {
  try {
    console.log('Setting up North Harbour Rugby database...');
    
    // Clear existing data
    await db.delete(players);
    
    // Insert your real players
    await db.insert(players).values(northHarbourPlayers);
    
    console.log(`Successfully loaded ${northHarbourPlayers.length} North Harbour Rugby players into database`);
    return { success: true, count: northHarbourPlayers.length };
  } catch (error) {
    console.error('Database setup failed:', error);
    return { success: false, error: error.message };
  }
}