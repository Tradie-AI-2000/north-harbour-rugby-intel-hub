import { db } from "./db";
import { players } from "@shared/schema";
import { eq } from "drizzle-orm";
import { northHarbourPlayers } from "./northHarbourPlayers";

export async function populateNorthHarbourPlayers() {
  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (const playerData of northHarbourPlayers) {
    try {
      // Check if player already exists
      const existingPlayer = await db
        .select()
        .from(players)
        .where(eq(players.id, playerData.id))
        .limit(1);

      // Transform skills to include all required fields
      const completeSkills = {
        ballHandling: playerData.skills?.ballHandling || 7,
        passing: playerData.skills?.passing || 7,
        kicking: playerData.skills?.kicking || 6,
        lineoutThrowing: playerData.skills?.lineoutThrowing || 6,
        scrummaging: playerData.skills?.scrummaging || 7,
        rucking: playerData.skills?.rucking || 7,
        defense: playerData.skills?.defense || 7,
        communication: playerData.skills?.communication || 7
      };

      // Complete player data with all required fields
      const completePlayerData = {
        id: playerData.id,
        personalDetails: {
          firstName: playerData.personalDetails.firstName,
          lastName: playerData.personalDetails.lastName,
          email: `${playerData.personalDetails.firstName.toLowerCase()}.${playerData.personalDetails.lastName.toLowerCase()}@northharbour.co.nz`,
          phone: `+64 21 ${Math.floor(Math.random() * 9000000) + 1000000}`,
          dateOfBirth: playerData.personalDetails.dateOfBirth || '1995-01-01',
          address: "North Harbour, Auckland, New Zealand",
          emergencyContact: {
            name: "Emergency Contact",
            relationship: "Family",
            phone: `+64 21 ${Math.floor(Math.random() * 9000000) + 1000000}`
          }
        },
        rugbyProfile: {
          jerseyNumber: playerData.personalDetails.jerseyNumber,
          primaryPosition: playerData.personalDetails.position,
          secondaryPositions: [],
          yearsInTeam: 3,
          clubHistory: ["North Harbour Rugby"]
        },
        physicalAttributes: [{
          date: "2024-06-01",
          weight: 85 + Math.floor(Math.random() * 30),
          height: 175 + Math.floor(Math.random() * 25),
          bodyFat: 8 + Math.floor(Math.random() * 8),
          muscleMass: 75 + Math.floor(Math.random() * 15)
        }],
        testResults: [{
          date: "2024-06-01",
          benchPress: 80 + Math.floor(Math.random() * 40),
          squat: 120 + Math.floor(Math.random() * 60),
          sprint40m: 4.5 + Math.random() * 1.5,
          verticalJump: 55 + Math.floor(Math.random() * 15),
          beepTest: 12 + Math.floor(Math.random() * 6)
        }],
        skills: completeSkills,
        gameStats: playerData.gameStats || [],
        injuries: [],
        reports: [],
        activities: [],
        status: {
          fitness: playerData.currentStatus === "Fit" ? "available" : "injured",
          medical: "cleared",
          availability: "available"
        }
      };

      if (existingPlayer.length > 0) {
        // Update existing player
        await db
          .update(players)
          .set(completePlayerData)
          .where(eq(players.id, playerData.id));
        updatedCount++;
      } else {
        // Insert new player
        await db
          .insert(players)
          .values(completePlayerData);
        insertedCount++;
      }

    } catch (error) {
      console.error(`Error processing player ${playerData.id}:`, error);
      errorCount++;
    }
  }

  return {
    success: true,
    inserted: insertedCount,
    updated: updatedCount,
    errors: errorCount,
    total: northHarbourPlayers.length
  };
}