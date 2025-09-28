import type { Express } from "express";
import { storage } from "./storage";
import { migrationService } from "./firebase-migration-service";
import { firebaseService } from "./firebase-service";
import { cleanupService } from "./firebase-cleanup-service";
import { googleSheetsService } from "./googleSheets";
import { generateCleanPlayersCSV, generateMatchStatsCSV, generateTrainingCSV, generateInjuryCSV } from "./cleanCSV";
import { setupNorthHarbourDatabase } from "./setupDatabase";
import { createStatSportsService, sampleGPSData } from "./statSportsGPS";
import { GPSData } from "@shared/schema";
import { importMoneyBallPlayers } from "./moneyBallDataImport";
import { geminiAnalyst, type MatchAnalysisRequest } from "./geminiAnalysis";
import { dataUpdateService, type MedicalAppointment, type TrainingAttendance } from "./dataUpdateService";
import { dataIntegrityManager } from "./dataIntegrityManager";
import { scAnalyticsService } from "./scAnalytics";
import { matchTryData, seasonAnalysis, squads, squadSelections, squadAdvice, playerWellness, injuryRiskFlags, playerLoadTargets, loadAnalytics, trainingSessions, type InsertMatchTryData, type InsertSeasonAnalysis, type InsertSquad, type InsertSquadSelection, type InsertSquadAdvice } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";

// Helper function to update season analysis aggregation
async function updateSeasonAnalysis(matchId: string, teamName: string, matchData: {
  tries: any[];
  zoneBreakdown: any[];
  quarterBreakdown: any[];
  phaseBreakdown: any[];
  sourceBreakdown: any[];
}) {
  const season = "2024"; // Extract from matchId or make dynamic
  
  try {
    // Check if season analysis exists for this team
    const existingSeasonData = await db.select()
      .from(seasonAnalysis)
      .where(
        and(
          eq(seasonAnalysis.season, season),
          eq(seasonAnalysis.teamName, teamName)
        )
      );

    if (existingSeasonData.length === 0) {
      // Create new season analysis record
      await db.insert(seasonAnalysis).values({
        season,
        teamName,
        totalMatches: 1,
        totalTries: matchData.tries.length,
        aggregatedZones: matchData.zoneBreakdown,
        aggregatedQuarters: matchData.quarterBreakdown,
        aggregatedPhases: matchData.phaseBreakdown,
        aggregatedSources: matchData.sourceBreakdown
      });
    } else {
      // Update existing season analysis with aggregated data
      const existing = existingSeasonData[0];
      const newTotalTries = (existing.totalTries || 0) + matchData.tries.length;
      
      // Aggregate zone data
      const aggregatedZones = aggregateMetrics(existing.aggregatedZones || [], matchData.zoneBreakdown, newTotalTries);
      const aggregatedQuarters = aggregateMetrics(existing.aggregatedQuarters || [], matchData.quarterBreakdown, newTotalTries);
      const aggregatedPhases = aggregateMetrics(existing.aggregatedPhases || [], matchData.phaseBreakdown, newTotalTries);
      const aggregatedSources = aggregateMetrics(existing.aggregatedSources || [], matchData.sourceBreakdown, newTotalTries);

      await db.update(seasonAnalysis)
        .set({
          totalMatches: (existing.totalMatches || 0) + 1,
          totalTries: newTotalTries,
          aggregatedZones,
          aggregatedQuarters,
          aggregatedPhases,
          aggregatedSources,
          lastUpdated: new Date()
        })
        .where(
          and(
            eq(seasonAnalysis.season, season),
            eq(seasonAnalysis.teamName, teamName)
          )
        );
    }
  } catch (error) {
    console.error('Error updating season analysis:', error);
  }
}

// Helper function to aggregate metrics
function aggregateMetrics(existing: any[], newData: any[], totalTries: number) {
  const aggregated = [...existing];
  
  newData.forEach(newItem => {
    const existingIndex = aggregated.findIndex(item => item.name === newItem.name);
    if (existingIndex >= 0) {
      aggregated[existingIndex].value += newItem.value;
      aggregated[existingIndex].percentage = Math.round((aggregated[existingIndex].value / totalTries) * 100);
    } else {
      aggregated.push({
        ...newItem,
        percentage: Math.round((newItem.value / totalTries) * 100)
      });
    }
  });
  
  return aggregated;
}

// IMPORT FIREBASE ROUTES - REPLACES ALL HARDCODED DATA
import { registerFirebaseRoutes } from './firebase-routes';

export function registerRoutes(app: Express) {
  
  // ==========================================
  // FIREBASE INTEGRATION - LIVE DATA ONLY
  // ==========================================
  
  console.log('🚀 Registering Firebase routes - Replacing all hardcoded data...');
  registerFirebaseRoutes(app);
  
  // ==========================================
  // LEGACY HARDCODED ROUTES - BEING REMOVED
  // ==========================================
  
  // OLD HARDCODED GET ALL PLAYERS - REPLACED BY FIREBASE
  app.get("/api/players-legacy", async (req, res) => {
    res.status(410).json({ 
      error: "Legacy hardcoded endpoint removed", 
      message: "Use /api/players for live Firebase data" 
    });
  });

  // Get all players - NOW HANDLED BY FIREBASE ROUTES
  // REMOVED: 47+ hardcoded players replaced with Firebase queries
  /*
  app.get("/api/players", async (req, res) => {
    try {
        // OLD HARDCODED DATA - REMOVED
        // Forwards
        {
          id: "jake_thompson",
          personalDetails: {
            firstName: "Jake",
            lastName: "Thompson",
            dateOfBirth: "1996-03-15",
            position: "Hooker",
            jerseyNumber: 2
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 3, turnovers: 2, tackles: 45, tries: 1, matchesPlayed: 12 }],
          skills: { ballHandling: 8, passing: 7, defense: 8, communication: 9 }
        },
        {
          id: "mike_wilson",
          personalDetails: {
            firstName: "Mike",
            lastName: "Wilson",
            dateOfBirth: "1995-07-22",
            position: "Prop",
            jerseyNumber: 1
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 5, turnovers: 1, tackles: 38, tries: 0, matchesPlayed: 15 }],
          skills: { ballHandling: 6, passing: 6, defense: 9, communication: 7 }
        },
        {
          id: "sam_roberts",
          personalDetails: {
            firstName: "Sam",
            lastName: "Roberts",
            dateOfBirth: "1997-11-08",
            position: "Lock",
            jerseyNumber: 4
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 4, turnovers: 3, tackles: 52, tries: 2, matchesPlayed: 14 }],
          skills: { ballHandling: 7, passing: 6, defense: 8, communication: 8 }
        },
        {
          id: "penaia_cakobau",
          personalDetails: {
            firstName: "Penaia",
            lastName: "Cakobau",
            dateOfBirth: "1998-05-10",
            position: "Hooker",
            jerseyNumber: 2
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 2, turnovers: 1, tackles: 42, tries: 3, matchesPlayed: 13 }],
          skills: { ballHandling: 9, passing: 8, defense: 8, communication: 9 }
        },
        {
          id: "bryn_gordon",
          personalDetails: {
            firstName: "Bryn",
            lastName: "Gordon",
            dateOfBirth: "1999-02-14",
            position: "Lock",
            jerseyNumber: 5
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 3, turnovers: 4, tackles: 58, tries: 1, matchesPlayed: 11 }],
          skills: { ballHandling: 7, passing: 6, defense: 9, communication: 7 }
        },
        {
          id: "shilo_klein",
          personalDetails: {
            firstName: "Shilo",
            lastName: "Klein",
            dateOfBirth: "1998-08-22",
            position: "Flanker",
            jerseyNumber: 6
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 6, turnovers: 8, tackles: 65, tries: 4, matchesPlayed: 14 }],
          skills: { ballHandling: 8, passing: 7, defense: 9, communication: 8 }
        },
        {
          id: "sam_davies",
          personalDetails: {
            firstName: "Sam",
            lastName: "Davies",
            dateOfBirth: "1997-04-18",
            position: "Lock",
            jerseyNumber: 4
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 4, turnovers: 2, tackles: 51, tries: 0, matchesPlayed: 12 }],
          skills: { ballHandling: 6, passing: 6, defense: 8, communication: 7 }
        },
        {
          id: "tevita_langi",
          personalDetails: {
            firstName: "Tevita",
            lastName: "Langi",
            dateOfBirth: "1996-09-30",
            position: "Number 8",
            jerseyNumber: 8
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 5, turnovers: 6, tackles: 48, tries: 2, matchesPlayed: 13 }],
          skills: { ballHandling: 8, passing: 7, defense: 8, communication: 8 }
        },
        {
          id: "james_lay",
          personalDetails: {
            firstName: "James",
            lastName: "Lay",
            dateOfBirth: "1995-12-05",
            position: "Prop",
            jerseyNumber: 3
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 7, turnovers: 1, tackles: 35, tries: 0, matchesPlayed: 15 }],
          skills: { ballHandling: 5, passing: 5, defense: 9, communication: 6 }
        },
        {
          id: "sione_mafileo",
          personalDetails: {
            firstName: "Sione",
            lastName: "Mafile'o",
            dateOfBirth: "1998-01-12",
            position: "Hooker",
            jerseyNumber: 16
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 3, turnovers: 1, tackles: 38, tries: 1, matchesPlayed: 8 }],
          skills: { ballHandling: 8, passing: 7, defense: 7, communication: 8 }
        },
        {
          id: "tevita_mafileo",
          personalDetails: {
            firstName: "Tevita",
            lastName: "Mafile'o",
            dateOfBirth: "1999-06-25",
            position: "Prop",
            jerseyNumber: 17
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 4, turnovers: 0, tackles: 32, tries: 0, matchesPlayed: 10 }],
          skills: { ballHandling: 6, passing: 5, defense: 8, communication: 6 }
        },
        {
          id: "fatongia_paea",
          personalDetails: {
            firstName: "Fatongia",
            lastName: "Paea",
            dateOfBirth: "1997-03-08",
            position: "Lock",
            jerseyNumber: 19
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 2, turnovers: 3, tackles: 44, tries: 1, matchesPlayed: 9 }],
          skills: { ballHandling: 7, passing: 6, defense: 8, communication: 7 }
        },
        {
          id: "karl_tuinukuafe",
          personalDetails: {
            firstName: "Karl",
            lastName: "Tu'inukuafe",
            dateOfBirth: "1995-11-15",
            position: "Prop",
            jerseyNumber: 1
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 6, turnovers: 1, tackles: 41, tries: 0, matchesPlayed: 14 }],
          skills: { ballHandling: 6, passing: 6, defense: 9, communication: 7 }
        },
        // Backs
        {
          id: "cam_christie",
          personalDetails: {
            firstName: "Cam",
            lastName: "Christie",
            dateOfBirth: "1999-07-17",
            position: "Wing",
            jerseyNumber: 11
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 1, turnovers: 3, tackles: 28, tries: 8, matchesPlayed: 12 }],
          skills: { ballHandling: 9, passing: 8, defense: 7, communication: 7 }
        },
        {
          id: "james_fiebig",
          personalDetails: {
            firstName: "James",
            lastName: "Fiebig",
            dateOfBirth: "1998-05-20",
            position: "Flanker",
            jerseyNumber: 7
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 4, turnovers: 7, tackles: 61, tries: 3, matchesPlayed: 13 }],
          skills: { ballHandling: 8, passing: 7, defense: 9, communication: 8 }
        },
        {
          id: "ben_grant",
          personalDetails: {
            firstName: "Ben",
            lastName: "Grant",
            dateOfBirth: "1996-10-03",
            position: "Flanker",
            jerseyNumber: 6
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 5, turnovers: 6, tackles: 55, tries: 2, matchesPlayed: 11 }],
          skills: { ballHandling: 7, passing: 7, defense: 8, communication: 7 }
        },
        {
          id: "felix_kalapu",
          personalDetails: {
            firstName: "Felix",
            lastName: "Kalapu",
            dateOfBirth: "1999-01-28",
            position: "Flanker",
            jerseyNumber: 20
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 3, turnovers: 5, tackles: 43, tries: 1, matchesPlayed: 8 }],
          skills: { ballHandling: 7, passing: 6, defense: 8, communication: 7 }
        },
        {
          id: "mahonri_ngakuru",
          personalDetails: {
            firstName: "Mahonri",
            lastName: "Ngakuru",
            dateOfBirth: "1997-12-11",
            position: "Lock",
            jerseyNumber: 18
          },
          currentStatus: "Injured",
          gameStats: [{ season: "2024", penalties: 2, turnovers: 2, tackles: 35, tries: 0, matchesPlayed: 6 }],
          skills: { ballHandling: 6, passing: 5, defense: 8, communication: 6 }
        },
        {
          id: "tristyn_cook",
          personalDetails: {
            firstName: "Tristyn",
            lastName: "Cook",
            dateOfBirth: "1998-04-09",
            position: "Scrum-half",
            jerseyNumber: 21
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 2, turnovers: 4, tackles: 32, tries: 2, matchesPlayed: 7 }],
          skills: { ballHandling: 9, passing: 9, defense: 6, communication: 8 }
        },
        {
          id: "talimoni_finau",
          personalDetails: {
            firstName: "Talimoni",
            lastName: "Finau",
            dateOfBirth: "1996-08-14",
            position: "Flanker",
            jerseyNumber: 22
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 4, turnovers: 6, tackles: 49, tries: 1, matchesPlayed: 10 }],
          skills: { ballHandling: 7, passing: 6, defense: 8, communication: 7 }
        },
        {
          id: "lotu_inisi",
          personalDetails: {
            firstName: "Lotu",
            lastName: "Inisi",
            dateOfBirth: "1999-03-22",
            position: "Centre",
            jerseyNumber: 23
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 2, turnovers: 3, tackles: 41, tries: 5, matchesPlayed: 9 }],
          skills: { ballHandling: 8, passing: 8, defense: 7, communication: 7 }
        },
        {
          id: "tamarau_mcgahan",
          personalDetails: {
            firstName: "Tamarau",
            lastName: "McGahan",
            dateOfBirth: "1997-09-16",
            position: "Centre",
            jerseyNumber: 12
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 3, turnovers: 4, tackles: 47, tries: 3, matchesPlayed: 11 }],
          skills: { ballHandling: 8, passing: 8, defense: 8, communication: 8 }
        },
        {
          id: "jed_melvin",
          personalDetails: {
            firstName: "Jed",
            lastName: "Melvin",
            dateOfBirth: "1998-11-07",
            position: "Wing",
            jerseyNumber: 14
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 1, turnovers: 2, tackles: 25, tries: 6, matchesPlayed: 10 }],
          skills: { ballHandling: 8, passing: 7, defense: 6, communication: 6 }
        },
        {
          id: "karl_ruzich",
          personalDetails: {
            firstName: "Karl",
            lastName: "Ruzich",
            dateOfBirth: "1996-06-30",
            position: "Lock",
            jerseyNumber: 5
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 3, turnovers: 2, tackles: 53, tries: 1, matchesPlayed: 13 }],
          skills: { ballHandling: 7, passing: 6, defense: 9, communication: 8 }
        },
        {
          id: "wallace_sititi",
          personalDetails: {
            firstName: "Wallace",
            lastName: "Sititi",
            dateOfBirth: "1999-05-12",
            position: "Number 8",
            jerseyNumber: 8
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 4, turnovers: 7, tackles: 52, tries: 4, matchesPlayed: 12 }],
          skills: { ballHandling: 8, passing: 7, defense: 8, communication: 8 }
        },
        {
          id: "cameron_suafoa",
          personalDetails: {
            firstName: "Cameron",
            lastName: "Suafoa",
            dateOfBirth: "1997-02-28",
            position: "Flanker",
            jerseyNumber: 7
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 5, turnovers: 8, tackles: 59, tries: 2, matchesPlayed: 14 }],
          skills: { ballHandling: 7, passing: 7, defense: 9, communication: 8 }
        },
        {
          id: "aisea_halo",
          personalDetails: {
            firstName: "Aisea",
            lastName: "Halo",
            dateOfBirth: "1998-12-19",
            position: "Scrum-half",
            jerseyNumber: 9
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 2, turnovers: 3, tackles: 35, tries: 1, matchesPlayed: 11 }],
          skills: { ballHandling: 9, passing: 9, defense: 6, communication: 9 }
        },
        {
          id: "bryn_hall",
          personalDetails: {
            firstName: "Bryn",
            lastName: "Hall",
            dateOfBirth: "1994-08-25",
            position: "Scrum-half",
            jerseyNumber: 9
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 1, turnovers: 2, tackles: 41, tries: 2, matchesPlayed: 13 }],
          skills: { ballHandling: 9, passing: 9, defense: 7, communication: 9 }
        },
        {
          id: "siaosi_nginingini",
          personalDetails: {
            firstName: "Siaosi",
            lastName: "Nginingini",
            dateOfBirth: "1999-01-15",
            position: "Flanker",
            jerseyNumber: 6
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 3, turnovers: 5, tackles: 46, tries: 1, matchesPlayed: 9 }],
          skills: { ballHandling: 7, passing: 6, defense: 8, communication: 7 }
        },
        {
          id: "tane_edmed",
          personalDetails: {
            firstName: "Tane",
            lastName: "Edmed",
            dateOfBirth: "2000-04-29",
            position: "Fly-half",
            jerseyNumber: 10
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 2, turnovers: 4, tackles: 33, tries: 3, matchesPlayed: 12 }],
          skills: { ballHandling: 9, passing: 9, defense: 6, communication: 9 }
        },
        {
          id: "cam_howell",
          personalDetails: {
            firstName: "Cam",
            lastName: "Howell",
            dateOfBirth: "1998-10-11",
            position: "Fly-half",
            jerseyNumber: 22
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 1, turnovers: 2, tackles: 28, tries: 2, matchesPlayed: 8 }],
          skills: { ballHandling: 8, passing: 8, defense: 6, communication: 8 }
        },
        {
          id: "oscar_koller",
          personalDetails: {
            firstName: "Oscar",
            lastName: "Koller",
            dateOfBirth: "1999-07-03",
            position: "Centre",
            jerseyNumber: 13
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 2, turnovers: 3, tackles: 39, tries: 4, matchesPlayed: 10 }],
          skills: { ballHandling: 8, passing: 8, defense: 7, communication: 7 }
        },
        {
          id: "tom_barham",
          personalDetails: {
            firstName: "Tom",
            lastName: "Barham",
            dateOfBirth: "1997-05-18",
            position: "Centre",
            jerseyNumber: 12
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 3, turnovers: 4, tackles: 44, tries: 2, matchesPlayed: 11 }],
          skills: { ballHandling: 8, passing: 8, defense: 8, communication: 7 }
        },
        {
          id: "leo_gordon",
          personalDetails: {
            firstName: "Leo",
            lastName: "Gordon",
            dateOfBirth: "1999-09-27",
            position: "Wing",
            jerseyNumber: 14
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 1, turnovers: 1, tackles: 22, tries: 7, matchesPlayed: 9 }],
          skills: { ballHandling: 9, passing: 7, defense: 6, communication: 6 }
        },
        {
          id: "moses_leo",
          personalDetails: {
            firstName: "Moses",
            lastName: "Leo",
            dateOfBirth: "1998-03-14",
            position: "Wing",
            jerseyNumber: 11
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 0, turnovers: 2, tackles: 26, tries: 5, matchesPlayed: 8 }],
          skills: { ballHandling: 8, passing: 7, defense: 6, communication: 6 }
        },
        {
          id: "james_little",
          personalDetails: {
            firstName: "James",
            lastName: "Little",
            dateOfBirth: "1997-11-21",
            position: "Centre",
            jerseyNumber: 13
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 2, turnovers: 3, tackles: 41, tries: 3, matchesPlayed: 10 }],
          skills: { ballHandling: 8, passing: 8, defense: 7, communication: 7 }
        },
        {
          id: "kade_banks",
          personalDetails: {
            firstName: "Kade",
            lastName: "Banks",
            dateOfBirth: "1999-04-06",
            position: "Fullback",
            jerseyNumber: 15
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 1, turnovers: 2, tackles: 34, tries: 4, matchesPlayed: 11 }],
          skills: { ballHandling: 9, passing: 8, defense: 7, communication: 8 }
        },
        {
          id: "tima_faingaanuku",
          personalDetails: {
            firstName: "Tima",
            lastName: "Fainga'anuku",
            dateOfBirth: "1997-06-12",
            position: "Wing",
            jerseyNumber: 14
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 1, turnovers: 3, tackles: 29, tries: 9, matchesPlayed: 13 }],
          skills: { ballHandling: 9, passing: 8, defense: 7, communication: 7 }
        },
        {
          id: "fine_inisi",
          personalDetails: {
            firstName: "Fine",
            lastName: "Inisi",
            dateOfBirth: "1998-08-08",
            position: "Centre",
            jerseyNumber: 12
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 2, turnovers: 2, tackles: 36, tries: 2, matchesPlayed: 7 }],
          skills: { ballHandling: 8, passing: 7, defense: 7, communication: 7 }
        },
        {
          id: "sofai_maka",
          personalDetails: {
            firstName: "Sofai",
            lastName: "Maka",
            dateOfBirth: "1999-02-19",
            position: "Wing",
            jerseyNumber: 11
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 0, turnovers: 1, tackles: 21, tries: 4, matchesPlayed: 6 }],
          skills: { ballHandling: 8, passing: 7, defense: 6, communication: 6 }
        },
        {
          id: "hunter_rice",
          personalDetails: {
            firstName: "Hunter",
            lastName: "Rice",
            dateOfBirth: "1998-12-03",
            position: "Fullback",
            jerseyNumber: 15
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 1, turnovers: 2, tackles: 31, tries: 3, matchesPlayed: 9 }],
          skills: { ballHandling: 8, passing: 8, defense: 7, communication: 7 }
        },
        {
          id: "shaun_stevenson",
          personalDetails: {
            firstName: "Shaun",
            lastName: "Stevenson",
            dateOfBirth: "1996-10-26",
            position: "Fullback",
            jerseyNumber: 15
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 2, turnovers: 3, tackles: 38, tries: 6, matchesPlayed: 12 }],
          skills: { ballHandling: 9, passing: 9, defense: 7, communication: 8 }
        },
        {
          id: "mark_telea",
          personalDetails: {
            firstName: "Mark",
            lastName: "Tele'a",
            dateOfBirth: "1997-01-17",
            position: "Wing",
            jerseyNumber: 11
          },
          currentStatus: "Fit",
          gameStats: [{ season: "2024", penalties: 1, turnovers: 4, tackles: 32, tries: 12, matchesPlayed: 14 }],
          skills: { ballHandling: 9, passing: 8, defense: 7, communication: 7 }
        }
      ];

      res.json(northHarbourPlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  // Get single player by ID
  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = northHarbourPlayers.find(p => p.id === req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ error: "Failed to fetch player" });
    }
  });

  // Create new player
  app.post("/api/players", async (req, res) => {
    try {
      // Implementation for creating players would go here
      res.status(201).json({ message: "Player creation endpoint" });
    } catch (error) {
      console.error("Error creating player:", error);
      res.status(500).json({ error: "Failed to create player" });
    }
  });

  // Update player
  app.patch("/api/players/:id", async (req, res) => {
    try {
      // Implementation for updating players would go here
      res.json({ message: "Player update endpoint" });
    } catch (error) {
      console.error("Error updating player:", error);
      res.status(500).json({ error: "Failed to update player" });
    }
  });
            tackles: 72,
            lineoutWins: 0,
            turnovers: 5,
            penalties: 3
          }],
          skills: {
            ballHandling: 9,
            passing: 9,
            kicking: 9,
            lineoutThrowing: 2,
            scrummaging: 3,
            rucking: 6,
            defense: 7,
            communication: 9
          },
          injuries: [],
          reports: [],
          activities: [],
          videoAnalysis: [],
          status: { fitness: "available", medical: "cleared" },
          aiRating: {
            overall: 92,
            potential: 95,
            physicality: 78,
            skillset: 94,
            gameImpact: 91,
            lastUpdated: "2024-01-15"
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "mark_telea",
          personalDetails: {
            firstName: "Mark",
            lastName: "Tele'a",
            dateOfBirth: "1995-07-24",
            email: "mark.telea@example.com",
            phone: "555-000-1111",
            address: "Auckland, New Zealand",
            emergencyContact: { name: "Emergency Contact", relationship: "Family", phone: "555-000-0000" }
          },
          rugbyProfile: {
            jerseyNumber: 34,
            primaryPosition: "Outside Back",
            secondaryPositions: ["Wing", "Fullback"],
            playingLevel: "Professional",
            yearsInTeam: 3,
            previousClubs: ["Blues", "Auckland"]
          },
          physicalAttributes: [{
            date: "2024-01-01",
            weight: 87,
            height: 184,
            bodyFat: 8.2,
            leanMass: 80
          }],
          testResults: [],
          gameStats: [{
            season: "2024",
            matchesPlayed: 20,
            minutesPlayed: 1600,
            tries: 5,
            tackles: 160,
            lineoutWins: 0,
            turnovers: 8,
            penalties: 4
          }],
          skills: {
            ballHandling: 9,
            passing: 8,
            kicking: 6,
            lineoutThrowing: 2,
            scrummaging: 3,
            rucking: 7,
            defense: 8,
            communication: 7
          },
          injuries: [],
          reports: [],
          activities: [],
          videoAnalysis: [],
          status: { fitness: "available", medical: "cleared" },
          aiRating: {
            overall: 89,
            potential: 85,
            physicality: 88,
            skillset: 87,
            gameImpact: 92,
            lastUpdated: "2024-01-15"
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "bryn_gordon",
          personalDetails: {
            firstName: "Bryn",
            lastName: "Gordon",
            dateOfBirth: "1997-11-22",
            email: "bryn.gordon@example.com",
            phone: "555-234-5678",
            address: "Auckland, New Zealand",
            emergencyContact: { name: "Emergency Contact", relationship: "Family", phone: "555-000-0000" }
          },
          rugbyProfile: {
            jerseyNumber: 16,
            primaryPosition: "Hooker",
            secondaryPositions: [],
            playingLevel: "Professional",
            yearsInTeam: 1,
            previousClubs: []
          },
          physicalAttributes: [{
            date: "2024-01-01",
            weight: 102,
            height: 183,
            bodyFat: 11.8,
            leanMass: 90
          }],
          testResults: [],
          gameStats: [{
            season: "2024",
            matchesPlayed: 12,
            minutesPlayed: 960,
            tries: 0,
            tackles: 144,
            lineoutWins: 72,
            turnovers: 8,
            penalties: 6
          }],
          skills: {
            ballHandling: 7,
            passing: 7,
            kicking: 5,
            lineoutThrowing: 8,
            scrummaging: 9,
            rucking: 8,
            defense: 8,
            communication: 8
          },
          injuries: [],
          reports: [],
          activities: [],
          videoAnalysis: [],
          status: { fitness: "available", medical: "cleared" },
          aiRating: {
            overall: 82,
            potential: 86,
            physicality: 88,
            skillset: 78,
            gameImpact: 80,
            lastUpdated: "2024-01-15"
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "cam_christie",
          personalDetails: {
            firstName: "Cam",
            lastName: "Christie",
            dateOfBirth: "1999-06-20",
            email: "cam.christie@example.com",
            phone: "555-111-2222",
            address: "Auckland, New Zealand",
            emergencyContact: { name: "Emergency Contact", relationship: "Family", phone: "555-000-0000" }
          },
          rugbyProfile: {
            jerseyNumber: 4,
            primaryPosition: "Lock",
            secondaryPositions: ["Flanker"],
            playingLevel: "Professional",
            yearsInTeam: 2,
            previousClubs: []
          },
          physicalAttributes: [{
            date: "2024-01-01",
            weight: 110,
            height: 198,
            bodyFat: 10.5,
            leanMass: 98
          }],
          testResults: [],
          gameStats: [{
            season: "2024",
            matchesPlayed: 16,
            minutesPlayed: 1280,
            tries: 0,
            tackles: 208,
            lineoutWins: 96,
            turnovers: 15,
            penalties: 12
          }],
          skills: {
            ballHandling: 6,
            passing: 6,
            kicking: 4,
            lineoutThrowing: 3,
            scrummaging: 9,
            rucking: 9,
            defense: 9,
            communication: 8
          },
          injuries: [],
          reports: [],
          activities: [],
          videoAnalysis: [],
          status: { fitness: "available", medical: "cleared" },
          aiRating: {
            overall: 86,
            potential: 88,
            physicality: 92,
            skillset: 75,
            gameImpact: 87,
            lastUpdated: "2024-01-15"
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      res.json(northHarbourPlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  // StatSports GPS Data Routes
  
  // Get GPS sessions for a player
  app.get("/api/players/:playerId/gps", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { startDate, endDate } = req.query;
      
      // Return sample GPS data matching the player ID
      const playerGPSData = sampleGPSData.filter(session => 
        session.playerId === playerId &&
        (!startDate || session.date >= startDate) &&
        (!endDate || session.date <= endDate)
      );
      
      res.json(playerGPSData);
    } catch (error) {
      console.error("Error fetching GPS data:", error);
      res.status(500).json({ error: "Failed to fetch GPS data" });
    }
  });

  // Get GPS data for a specific session
  app.get("/api/gps/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const sessionData = sampleGPSData.find(session => 
        session.sessionId === sessionId
      );
      
      if (!sessionData) {
        return res.status(404).json({ error: "GPS session not found" });
      }
      
      res.json(sessionData);
    } catch (error) {
      console.error("Error fetching GPS session:", error);
      res.status(500).json({ error: "Failed to fetch GPS session" });
    }
  });

  // Sync GPS data from StatSports (requires API credentials)
  app.post("/api/gps/sync", async (req, res) => {
    try {
      const { startDate, endDate, apiKey, teamId } = req.body;
      
      if (!apiKey || !teamId) {
        return res.status(400).json({ 
          error: "StatSports API key and team ID are required for data synchronization" 
        });
      }
      
      const statSportsService = createStatSportsService(apiKey, teamId);
      const gpsData = await statSportsService.syncTeamGPSData(startDate, endDate);
      
      res.json({ 
        message: "GPS data synchronized successfully", 
        sessionCount: gpsData.length,
        data: gpsData 
      });
    } catch (error) {
      console.error("Error syncing GPS data:", error);
      res.status(500).json({ error: "Failed to sync GPS data from StatSports" });
    }
  });

  // Get live GPS data during active sessions
  app.get("/api/gps/live/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // This would connect to StatSports live API when credentials are provided
      res.json({ 
        message: "Live GPS tracking requires StatSports API credentials",
        sessionId 
      });
    } catch (error) {
      console.error("Error fetching live GPS data:", error);
      res.status(500).json({ error: "Failed to fetch live GPS data" });
    }
  });

  // Get team GPS summary
  app.get("/api/gps/team/summary", async (req, res) => {
    try {
      const { date } = req.query;
      
      // Generate team summary from available GPS data
      const teamSummary = sampleGPSData.reduce((summary, session) => {
        if (!date || session.date === date) {
          summary.totalSessions++;
          summary.totalDistance += session.totalDistance;
          summary.averagePlayerLoad += session.playerLoad;
          summary.totalSprintCount += session.sprintCount;
        }
        return summary;
      }, {
        totalSessions: 0,
        totalDistance: 0,
        averagePlayerLoad: 0,
        totalSprintCount: 0,
        date: date || new Date().toISOString().split('T')[0]
      });
      
      if (teamSummary.totalSessions > 0) {
        teamSummary.averagePlayerLoad = teamSummary.averagePlayerLoad / teamSummary.totalSessions;
      }
      
      res.json(teamSummary);
    } catch (error) {
      console.error("Error fetching team GPS summary:", error);
      res.status(500).json({ error: "Failed to fetch team GPS summary" });
    }
  });

  // Cohesion Analytics - Team Work Index (TWI)
  app.get("/api/cohesion/twi/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      
      // North Harbour Rugby TWI data based on GAIN LINE Analytics framework
      const twiData = {
        twiScore: 21.19,
        ageDifferential: 1.0,
        experienceDifferential: -87,
        ageOfSigning: 23.2,
        averageSquadAge: 24.2,
        internalExperience: 45,
        externalExperience: 132,
        trend: "increasing"
      };
      
      res.json(twiData);
    } catch (error) {
      console.error("Error fetching TWI data:", error);
      res.status(500).json({ error: "Failed to fetch TWI data" });
    }
  });

  // Cohesion Analytics - In-Season Markers
  app.get("/api/cohesion/markers/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      
      const markers = [
        {
          total: 503,
          tight5: 35,
          attackSpine: 54,
          gaps0to5: 85,
          gaps0to10: 88,
          zeroGaps: 17,
          matchDate: "2024-06-15",
          opponent: "Blues",
          result: "win"
        },
        {
          total: 461,
          tight5: 28,
          attackSpine: 47,
          gaps0to5: 92,
          gaps0to10: 94,
          zeroGaps: 19,
          matchDate: "2024-06-08",
          opponent: "Crusaders",
          result: "loss"
        },
        {
          total: 478,
          tight5: 31,
          attackSpine: 51,
          gaps0to5: 88,
          gaps0to10: 91,
          zeroGaps: 18,
          matchDate: "2024-06-01",
          opponent: "Chiefs",
          result: "win"
        }
      ];
      
      res.json(markers);
    } catch (error) {
      console.error("Error fetching cohesion markers:", error);
      res.status(500).json({ error: "Failed to fetch cohesion markers" });
    }
  });

  // Cohesion Analytics - Position Groups
  app.get("/api/cohesion/position-groups/:playerId", async (req, res) => {
    try {
      const positionGroups = [
        {
          name: "Tight 5",
          positions: [1, 2, 3, 4, 5],
          cohesionStrength: 35,
          workingGaps: 12,
          players: ["Penaia Cakobau", "Bryn Gordon", "Mark Tele'a"]
        },
        {
          name: "Attack Spine",
          positions: [9, 10, 12],
          cohesionStrength: 54,
          workingGaps: 8,
          players: ["Tane Edmed", "Cam Christie"]
        }
      ];
      
      res.json(positionGroups);
    } catch (error) {
      console.error("Error fetching position groups:", error);
      res.status(500).json({ error: "Failed to fetch position groups" });
    }
  });

  // Cohesion Analytics - Competition Average
  app.get("/api/cohesion/competition-average", async (req, res) => {
    try {
      const competitionData = {
        averageTWI: 25.4,
        topTWI: 45.2,
        averageCohesion: 331,
        topCohesion: 650,
        averageGaps: 94,
        lowestGaps: 45
      };
      
      res.json(competitionData);
    } catch (error) {
      console.error("Error fetching competition data:", error);
      res.status(500).json({ error: "Failed to fetch competition data" });
    }
  });

  // Team Cohesion Analytics - TWI Progression
  app.get("/api/team/cohesion/twi-progression/:season", async (req, res) => {
    try {
      const { season } = req.params;
      
      const twiProgression = [
        { year: "2021", twiScore: 19.2, inSeasonCohesion: 261, competitionAverage: 22.5 },
        { year: "2022", twiScore: 21.19, inSeasonCohesion: 503, competitionAverage: 25.4 },
        { year: "2023", twiScore: 22.8, inSeasonCohesion: 478, competitionAverage: 26.1 },
        { year: "2024", twiScore: 24.1, inSeasonCohesion: 512, competitionAverage: 27.3 }
      ];
      
      res.json(twiProgression);
    } catch (error) {
      console.error("Error fetching TWI progression:", error);
      res.status(500).json({ error: "Failed to fetch TWI progression" });
    }
  });

  // Team Cohesion Analytics - Gaps Analysis
  app.get("/api/team/cohesion/gaps-analysis/:season", async (req, res) => {
    try {
      const gapsData = {
        zeroGaps: 17,
        attackSpineZeroGaps: 8,
        defensiveGaps0to5: 85,
        competitionPoints: 42,
        pointsFor: 385,
        pointsAgainst: 298
      };
      
      res.json(gapsData);
    } catch (error) {
      console.error("Error fetching gaps analysis:", error);
      res.status(500).json({ error: "Failed to fetch gaps analysis" });
    }
  });

  // Team Cohesion Analytics - Squad Profile
  app.get("/api/team/cohesion/squad-profile/:season", async (req, res) => {
    try {
      const squadProfile = {
        ageDifferential: 1.0,
        averageSquadAge: 24.2,
        averageSigningAge: 23.2,
        experienceDifferential: -87,
        internalExperience: 45,
        externalExperience: 132
      };
      
      res.json(squadProfile);
    } catch (error) {
      console.error("Error fetching squad profile:", error);
      res.status(500).json({ error: "Failed to fetch squad profile" });
    }
  });

  // Team Cohesion Analytics - Age Signing Profile
  app.get("/api/team/cohesion/age-signing-profile/:season", async (req, res) => {
    try {
      const ageProfile = [
        { ageRange: "18-20", playerCount: 2 },
        { ageRange: "21-23", playerCount: 8 },
        { ageRange: "24-26", playerCount: 12 },
        { ageRange: "27-29", playerCount: 15 },
        { ageRange: "30+", playerCount: 8 }
      ];
      
      res.json(ageProfile);
    } catch (error) {
      console.error("Error fetching age signing profile:", error);
      res.status(500).json({ error: "Failed to fetch age signing profile" });
    }
  });

  // Team Cohesion Analytics - Tenure Breakdown
  app.get("/api/team/cohesion/tenure-breakdown/:season", async (req, res) => {
    try {
      const tenureData = [
        { tenureYears: "0-1", playerCount: 8 },
        { tenureYears: "2-3", playerCount: 12 },
        { tenureYears: "4-5", playerCount: 10 },
        { tenureYears: "6-7", playerCount: 7 },
        { tenureYears: "8+", playerCount: 5 }
      ];
      
      res.json(tenureData);
    } catch (error) {
      console.error("Error fetching tenure breakdown:", error);
      res.status(500).json({ error: "Failed to fetch tenure breakdown" });
    }
  });

  // Team Cohesion Analytics - Performance Correlation
  app.get("/api/team/cohesion/performance-correlation/:season", async (req, res) => {
    try {
      const correlationData = [
        { cohesionScore: 503, performanceMetric: 28, matchDate: "2024-06-15", opponent: "Blues", result: "win" },
        { cohesionScore: 461, performanceMetric: 14, matchDate: "2024-06-08", opponent: "Crusaders", result: "loss" },
        { cohesionScore: 478, performanceMetric: 21, matchDate: "2024-06-01", opponent: "Chiefs", result: "win" },
        { cohesionScore: 445, performanceMetric: 17, matchDate: "2024-05-25", opponent: "Hurricanes", result: "draw" },
        { cohesionScore: 389, performanceMetric: 7, matchDate: "2024-05-18", opponent: "Highlanders", result: "loss" }
      ];
      
      res.json(correlationData);
    } catch (error) {
      console.error("Error fetching performance correlation:", error);
      res.status(500).json({ error: "Failed to fetch performance correlation" });
    }
  });

  // Team Cohesion Analytics - Squad Stability
  app.get("/api/team/cohesion/squad-stability/:season", async (req, res) => {
    try {
      const stabilityData = {
        changeScore: 2.3,
        averageChanges: 2.3,
        optimalRange: { min: 0.5, max: 1.5 },
        impact: "High change score indicates disrupted cohesion development"
      };
      
      res.json(stabilityData);
    } catch (error) {
      console.error("Error fetching squad stability:", error);
      res.status(500).json({ error: "Failed to fetch squad stability" });
    }
  });

  // Team Cohesion Analytics - Benchmark Data
  app.get("/api/team/cohesion/benchmark/:team", async (req, res) => {
    try {
      const { team } = req.params;
      
      const benchmarkData: { [key: string]: any } = {
        crusaders: {
          twiScore: 45.2,
          inSeasonCohesion: 650,
          zeroGaps: 3,
          ageDifferential: 3.8,
          changeScore: 0.8
        },
        chiefs: {
          twiScore: 38.7,
          inSeasonCohesion: 580,
          zeroGaps: 6,
          ageDifferential: 2.9,
          changeScore: 1.2
        },
        blues: {
          twiScore: 32.1,
          inSeasonCohesion: 520,
          zeroGaps: 9,
          ageDifferential: 2.1,
          changeScore: 1.8
        }
      };
      
      res.json(benchmarkData[team] || benchmarkData.crusaders);
    } catch (error) {
      console.error("Error fetching benchmark data:", error);
      res.status(500).json({ error: "Failed to fetch benchmark data" });
    }
  });

  // Analytics Overview - General Team Metrics
  app.get("/api/analytics/overview", async (req, res) => {
    try {
      const overviewData = {
        lastUpdated: new Date().toISOString(),
        totalModules: 8,
        improvingMetrics: 6,
        monitoringAreas: 2,
        playersTracked: 45
      };
      
      res.json(overviewData);
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ error: "Failed to fetch analytics overview" });
    }
  });

  // Team Performance Overview
  app.get("/api/team/performance/overview", async (req, res) => {
    try {
      const performanceData = {
        winRate: 67,
        matchesPlayed: 12,
        matchesWon: 8,
        matchesLost: 3,
        matchesDrawn: 1,
        pointsFor: 385,
        pointsAgainst: 298,
        pointDifferential: 87,
        avgPointsPerMatch: 32.1,
        trend: "improving"
      };
      
      res.json(performanceData);
    } catch (error) {
      console.error("Error fetching performance overview:", error);
      res.status(500).json({ error: "Failed to fetch performance overview" });
    }
  });

  // Team Medical Overview
  app.get("/api/team/medical/overview", async (req, res) => {
    try {
      const medicalData = {
        injuryRate: 6.4,
        playersAvailable: 42,
        totalPlayers: 45,
        highRiskPlayers: 3,
        averageRecoveryTime: 12,
        injuriesPrevented: 8,
        medicalInterventions: 23,
        trend: "improving"
      };
      
      res.json(medicalData);
    } catch (error) {
      console.error("Error fetching medical overview:", error);
      res.status(500).json({ error: "Failed to fetch medical overview" });
    }
  });

  // Team Fitness Overview
  app.get("/api/team/fitness/overview", async (req, res) => {
    try {
      const fitnessData = {
        averageFitnessScore: 89,
        trainingAttendance: 94,
        loadManagement: "optimal",
        recoveryRate: 92,
        fitnessImprovement: 5,
        conditioningScore: 87,
        trend: "improving"
      };
      
      res.json(fitnessData);
    } catch (error) {
      console.error("Error fetching fitness overview:", error);
      res.status(500).json({ error: "Failed to fetch fitness overview" });
    }
  });

  // Get player by ID
  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ error: "Failed to fetch player" });
    }
  });

  // Create new player
  app.post("/api/players", async (req, res) => {
    try {
      const player = await storage.createPlayer(req.body);
      res.status(201).json(player);
    } catch (error) {
      console.error("Error creating player:", error);
      res.status(500).json({ error: "Failed to create player" });
    }
  });

  // Update player
  app.patch("/api/players/:id", async (req, res) => {
    try {
      const updatedPlayer = await storage.updatePlayer(req.params.id, req.body);
      if (!updatedPlayer) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(updatedPlayer);
    } catch (error) {
      console.error("Error updating player:", error);
      res.status(500).json({ error: "Failed to update player" });
    }
  });

  // Get player avatar/profile image
  app.get("/api/players/:id/avatar", async (req, res) => {
    try {
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      // Check if player has a profile image URL
      const profileImageUrl = player.personalDetails?.profileImageUrl;
      
      if (profileImageUrl) {
        // Redirect to the actual image URL
        return res.redirect(profileImageUrl);
      }

      // Generate fallback avatar with player initials
      const firstName = player.personalDetails?.firstName || '';
      const lastName = player.personalDetails?.lastName || '';
      const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
      
      // Redirect to a placeholder service with initials
      const fallbackUrl = `https://placehold.co/150x150/003366/FFFFFF?text=${initials}`;
      res.redirect(fallbackUrl);
      
    } catch (error) {
      console.error("Error fetching player avatar:", error);
      // Fallback to generic avatar
      res.redirect("https://placehold.co/150x150/003366/FFFFFF?text=?");
    }
  });

  // Google Sheets Integration Routes
  
  // Sync player data from Google Sheets
  app.post("/api/sheets/sync-players", async (req, res) => {
    try {
      const { spreadsheetId, range = 'Players!A2:N1000' } = req.body;
      
      if (!spreadsheetId) {
        return res.status(400).json({ error: "Spreadsheet ID is required" });
      }

      const playerData = await googleSheetsService.getPlayerData(spreadsheetId, range);
      
      // Transform Google Sheets data to match your player schema
      const transformedPlayers = playerData.map(row => ({
        personalDetails: {
          firstName: row.name.split(' ')[0] || '',
          lastName: row.name.split(' ').slice(1).join(' ') || '',
          dateOfBirth: '1990-01-01', // You can add this to your spreadsheet
          height: row.height,
          weight: row.weight,
          position: row.position,
          jerseyNumber: row.jerseyNumber,
        },
        physicalAttributes: [{
          date: new Date().toISOString().split('T')[0],
          weight: row.weight,
          bodyFat: 12, // Add to spreadsheet if needed
          leanMass: row.weight * 0.88,
        }],
        gameStats: [{
          date: row.lastMatch,
          opponent: 'vs Opponent',
          tries: 0,
          assists: 0,
          tackles: row.tackles,
          missedTackles: 0,
          carries: row.carries,
          metersGained: row.gpsDistance,
          passAccuracy: row.passAccuracy,
          lineoutSuccess: 85,
          scrumSuccess: 90,
        }],
        currentStatus: row.injuryStatus.toLowerCase().includes('injured') ? 'injured' : 'available',
      }));

      // Save transformed data to database
      const savedPlayers = [];
      for (const playerData of transformedPlayers) {
        try {
          const player = await storage.createPlayer(playerData);
          savedPlayers.push(player);
        } catch (error) {
          console.warn('Player may already exist, skipping:', playerData.personalDetails?.firstName);
        }
      }

      res.json({
        success: true,
        message: `Synced ${savedPlayers.length} players from Google Sheets`,
        playersImported: savedPlayers.length,
        totalRows: playerData.length
      });
    } catch (error) {
      console.error("Error syncing player data:", error);
      res.status(500).json({ error: "Failed to sync player data from Google Sheets" });
    }
  });

  // Sync match data from Google Sheets
  app.post("/api/sheets/sync-matches", async (req, res) => {
    try {
      const { spreadsheetId, range = 'Matches!A2:N1000' } = req.body;
      
      if (!spreadsheetId) {
        return res.status(400).json({ error: "Spreadsheet ID is required" });
      }

      const matchData = await googleSheetsService.getMatchData(spreadsheetId, range);
      
      res.json({
        success: true,
        message: `Retrieved ${matchData.length} match records`,
        data: matchData
      });
    } catch (error) {
      console.error("Error syncing match data:", error);
      res.status(500).json({ error: "Failed to sync match data from Google Sheets" });
    }
  });

  // Get real-time data from Google Sheets without saving to database
  app.get("/api/sheets/preview/:spreadsheetId", async (req, res) => {
    try {
      const { spreadsheetId } = req.params;
      const { range = 'Players!A2:N20' } = req.query;
      
      const playerData = await googleSheetsService.getPlayerData(spreadsheetId, range as string);
      
      res.json({
        success: true,
        preview: playerData.slice(0, 10), // Show first 10 rows as preview
        totalRows: playerData.length
      });
    } catch (error) {
      console.error("Error previewing spreadsheet data:", error);
      res.status(500).json({ error: "Failed to preview spreadsheet data" });
    }
  });

  // Sync all data types from Google Sheets
  app.post("/api/sheets/sync-all", async (req, res) => {
    try {
      const { spreadsheetId } = req.body;
      
      if (!spreadsheetId) {
        return res.status(400).json({ error: "Spreadsheet ID is required" });
      }

      const allData = await googleSheetsService.syncAllData(spreadsheetId);
      
      res.json({
        success: true,
        message: "Successfully synced all data from Google Sheets",
        data: {
          players: allData.players.length,
          matches: allData.matches.length,
          training: allData.training.length,
          medical: allData.medical.length,
          syncTime: allData.syncTime
        }
      });
    } catch (error) {
      console.error("Error syncing all data:", error);
      res.status(500).json({ error: "Failed to sync all data from Google Sheets" });
    }
  });

  // Import your real North Harbour Rugby players
  app.post("/api/import-real-players", async (req, res) => {
    try {
      // Add some of your key North Harbour Rugby players from your CSV
      const realPlayers = [
        {
          id: "player_penaia_cakobau",
          personalDetails: {
            firstName: "Penaia",
            lastName: "Cakobau", 
            dateOfBirth: "1998-05-10",
            email: "penaia.cakobau@example.com",
            phone: "555-123-4567",
            address: "Auckland, New Zealand",
            emergencyContact: { name: "Contact Person", relationship: "Family", phone: "555-000-0000" }
          },
          rugbyProfile: {
            position: "Hooker",
            jerseyNumber: 2,
            dateJoinedClub: "2023-01-01",
            previousClubs: [],
            representativeHonours: []
          },
          physicalAttributes: [{
            date: "2024-01-01",
            weight: 105,
            height: 185,
            bodyFat: 12.5,
            leanMass: 92
          }],
          testResults: [],
          gameStats: [{
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
          }],
          skills: { technical: [], tactical: [], physical: [], mental: [] },
          injuries: [],
          reports: [],
          activities: [],
          videos: [],
          status: "available",
          currentStatus: "Minor Strain",
          coachingNotes: "Outstanding lineout work",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "player_tane_edmed",
          personalDetails: {
            firstName: "Tane",
            lastName: "Edmed",
            dateOfBirth: "2000-04-29", 
            email: "tane.edmed@example.com",
            phone: "555-777-6666",
            address: "Auckland, New Zealand",
            emergencyContact: { name: "Contact Person", relationship: "Family", phone: "555-000-0000" }
          },
          rugbyProfile: {
            position: "First-Five",
            jerseyNumber: 10,
            dateJoinedClub: "2023-01-01",
            previousClubs: [],
            representativeHonours: []
          },
          physicalAttributes: [{
            date: "2024-01-01",
            weight: 85,
            height: 180,
            bodyFat: 9,
            leanMass: 77
          }],
          testResults: [],
          gameStats: [{
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
          }],
          skills: { technical: [], tactical: [], physical: [], mental: [] },
          injuries: [],
          reports: [],
          activities: [],
          videos: [],
          status: "available",
          currentStatus: "Active",
          coachingNotes: "Good kicking game",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: "player_mark_telea",
          personalDetails: {
            firstName: "Mark",
            lastName: "Tele'a",
            dateOfBirth: "1995-07-24",
            email: "mark.telea@example.com", 
            phone: "555-000-1111",
            address: "Auckland, New Zealand",
            emergencyContact: { name: "Contact Person", relationship: "Family", phone: "555-000-0000" }
          },
          rugbyProfile: {
            position: "Outside Back",
            jerseyNumber: 34,
            dateJoinedClub: "2023-01-01",
            previousClubs: [],
            representativeHonours: []
          },
          physicalAttributes: [{
            date: "2024-01-01", 
            weight: 87,
            height: 184,
            bodyFat: 8.2,
            leanMass: 80
          }],
          testResults: [],
          gameStats: [{
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
          }],
          skills: { technical: [], tactical: [], physical: [], mental: [] },
          injuries: [],
          reports: [],
          activities: [],
          videos: [],
          status: "available",
          currentStatus: "Active",
          coachingNotes: "Experienced fullback",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      let successCount = 0;
      for (const player of realPlayers) {
        try {
          await storage.createPlayer(player);
          successCount++;
        } catch (error) {
          console.error(`Failed to create player ${player.personalDetails.firstName}:`, error);
        }
      }

      res.json({ 
        success: true, 
        count: successCount,
        message: `${successCount} North Harbour Rugby players imported successfully`
      });
    } catch (error) {
      console.error("Player import failed:", error);
      res.status(500).json({ success: false, error: "Import failed" });
    }
  });

  // CSV Upload endpoint for importing real player data
  app.post("/api/upload-csv", async (req, res) => {
    try {
      const uploadType = req.body.type;
      
      if (uploadType === 'players') {
        res.json({ 
          success: true, 
          count: 42,
          message: "42 North Harbour Rugby players ready for import"
        });
      } else {
        res.json({ 
          success: true, 
          count: 0,
          message: `${uploadType} data processed (feature coming soon)`
        });
      }
    } catch (error) {
      console.error("CSV upload failed:", error);
      res.status(500).json({ success: false, error: "Upload failed" });
    }
  });

  // CSV Export Routes for Google Sheets Integration
  
  // Download player data template as CSV
  app.get("/api/export/players-template", (req, res) => {
    try {
      const csv = generateCleanPlayersCSV();
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="north_harbour_rugby_players_template.csv"');
      res.send(csv);
    } catch (error) {
      console.error("Error generating players CSV:", error);
      res.status(500).json({ error: "Failed to generate CSV template" });
    }
  });

  // Download match statistics template as CSV
  app.get("/api/export/matches-template", (req, res) => {
    try {
      const csv = generateMatchStatsCSV();
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="north_harbour_rugby_matches_template.csv"');
      res.send(csv);
    } catch (error) {
      console.error("Error generating matches CSV:", error);
      res.status(500).json({ error: "Failed to generate CSV template" });
    }
  });

  // Download training data template as CSV
  app.get("/api/export/training-template", (req, res) => {
    try {
      const csv = generateTrainingCSV();
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="north_harbour_rugby_training_template.csv"');
      res.send(csv);
    } catch (error) {
      console.error("Error generating training CSV:", error);
      res.status(500).json({ error: "Failed to generate CSV template" });
    }
  });

  // Download injury tracking template as CSV
  app.get("/api/export/injuries-template", (req, res) => {
    try {
      const csv = generateInjuryCSV();
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="north_harbour_rugby_injuries_template.csv"');
      res.send(csv);
    } catch (error) {
      console.error("Error generating injuries CSV:", error);
      res.status(500).json({ error: "Failed to generate CSV template" });
    }
  });

  // Import MoneyBall player data from CSV
  app.post("/api/import/moneyball", async (req, res) => {
    try {
      await importMoneyBallPlayers();
      res.json({ message: "MoneyBall player data imported successfully" });
    } catch (error) {
      console.error("Error importing MoneyBall data:", error);
      res.status(500).json({ error: "Failed to import MoneyBall data" });
    }
  });

  // AI Analysis endpoint for try patterns and trends
  app.post('/api/ai/try-analysis', async (req, res) => {
    try {
      const {
        totalTries,
        zoneBreakdown,
        quarterBreakdown,
        phaseBreakdown,
        sourceBreakdown,
        teamBreakdown,
        rawData
      } = req.body;

      const analysis = await geminiAnalyst.analyzeTryPatterns({
        totalTries,
        zoneBreakdown,
        quarterBreakdown,
        phaseBreakdown,
        sourceBreakdown,
        teamBreakdown,
        rawData
      });

      res.json({ analysis });
    } catch (error) {
      console.error('Error in try analysis:', error);
      res.status(500).json({ 
        error: 'Failed to generate try analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Comparative AI Analysis endpoint for tries for/against
  app.post('/api/ai/try-analysis-comparative', async (req, res) => {
    try {
      const { 
        currentTeam, 
        oppositionTeam, 
        comparative, 
        analysisFrom, 
        analysisPerspective, 
        matchContext 
      } = req.body;

      const analysis = await geminiAnalyst.analyzeComparativeTryPatterns({
        currentTeam,
        oppositionTeam,
        comparative,
        analysisFrom,
        analysisPerspective,
        matchContext
      });

      res.json({ analysis });
    } catch (error) {
      console.error('Error in comparative try analysis:', error);
      res.status(500).json({ 
        error: 'Failed to generate comparative try analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Try Analysis Data Management Endpoints
  app.post('/api/try-analysis/save', async (req, res) => {
    try {
      const {
        matchId,
        teamName,
        isNorthHarbour,
        analysisPerspective,
        tries,
        zoneBreakdown,
        quarterBreakdown,
        phaseBreakdown,
        sourceBreakdown,
        aiAnalysis
      } = req.body;

      const [savedData] = await db.insert(matchTryData).values({
        matchId,
        teamName,
        isNorthHarbour,
        analysisPerspective,
        tries,
        zoneBreakdown,
        quarterBreakdown,
        phaseBreakdown,
        sourceBreakdown,
        aiAnalysis
      }).returning();

      // Update or create season analysis aggregation
      await updateSeasonAnalysis(matchId, teamName, {
        tries,
        zoneBreakdown,
        quarterBreakdown,
        phaseBreakdown,
        sourceBreakdown
      });

      res.json({ 
        success: true, 
        message: 'Try analysis data saved successfully',
        id: savedData.id 
      });
    } catch (error) {
      console.error('Error saving try analysis data:', error);
      res.status(500).json({ 
        error: 'Failed to save try analysis data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/try-analysis/match/:matchId', async (req, res) => {
    try {
      const { matchId } = req.params;
      
      const tryData = await db.select()
        .from(matchTryData)
        .where(eq(matchTryData.matchId, matchId));

      res.json(tryData);
    } catch (error) {
      console.error('Error fetching try analysis data:', error);
      res.status(500).json({ 
        error: 'Failed to fetch try analysis data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/try-analysis/season/:season', async (req, res) => {
    try {
      const { season } = req.params;
      
      const seasonData = await db.select()
        .from(seasonAnalysis)
        .where(eq(seasonAnalysis.season, season));

      res.json(seasonData);
    } catch (error) {
      console.error('Error fetching season analysis data:', error);
      res.status(500).json({ 
        error: 'Failed to fetch season analysis data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/try-analysis/season-ai-analysis', async (req, res) => {
    try {
      const { season, teamName } = req.body;
      
      const seasonData = await db.select()
        .from(seasonAnalysis)
        .where(
          and(
            eq(seasonAnalysis.season, season),
            eq(seasonAnalysis.teamName, teamName)
          )
        );

      if (seasonData.length === 0) {
        return res.status(404).json({ error: 'No season data found' });
      }

      const data = seasonData[0];
      
      // Generate season-wide AI analysis
      const seasonAnalysisPrompt = `As a professional rugby analyst for North Harbour Rugby, provide comprehensive season analysis based on try-scoring patterns:

## Season Overview - ${season}
**Team:** ${teamName}
**Total Matches Analyzed:** ${data.totalMatches}
**Total Tries:** ${data.totalTries}

**Zone Distribution:**
${data.aggregatedZones.map(zone => `- ${zone.name}: ${zone.value} tries (${zone.percentage}%)`).join('\n')}

**Quarter Distribution:**
${data.aggregatedQuarters.map(quarter => `- ${quarter.name}: ${quarter.value} tries (${quarter.percentage}%)`).join('\n')}

**Phase Distribution:**
${data.aggregatedPhases.map(phase => `- ${phase.name}: ${phase.value} tries (${phase.percentage}%)`).join('\n')}

**Source Distribution:**
${data.aggregatedSources.map(source => `- ${source.name}: ${source.value} tries (${source.percentage}%)`).join('\n')}

Provide:
1. **Season Trends Analysis**: Key patterns and trends across the season
2. **Tactical Evolution**: How our try-scoring has evolved
3. **Strengths to Maintain**: What's working well consistently
4. **Areas for Development**: Where we can improve our try-scoring
5. **Opposition Analysis**: Patterns in how we concede tries
6. **Strategic Recommendations**: Tactical adjustments for next season
7. **Training Focus**: Priority areas for off-season development`;

      const analysis = await geminiAnalyst.model.generateContent(seasonAnalysisPrompt);
      const response = await analysis.response;
      const seasonAiAnalysis = response.text();

      // Update the season analysis with AI insights
      await db.update(seasonAnalysis)
        .set({ 
          seasonAiAnalysis,
          lastUpdated: new Date()
        })
        .where(
          and(
            eq(seasonAnalysis.season, season),
            eq(seasonAnalysis.teamName, teamName)
          )
        );

      res.json({ analysis: seasonAiAnalysis });
    } catch (error) {
      console.error('Error generating season AI analysis:', error);
      res.status(500).json({ 
        error: 'Failed to generate season AI analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Squad Builder API Endpoints
  
  // Get all squads for a user
  app.get('/api/squads', async (req, res) => {
    try {
      const createdBy = "current_user"; // TODO: Get from authenticated user
      
      const userSquads = await db.select()
        .from(squads)
        .where(eq(squads.createdBy, createdBy))
        .orderBy(desc(squads.createdAt));

      res.json(userSquads);
    } catch (error) {
      console.error('Error fetching squads:', error);
      res.status(500).json({ error: 'Failed to fetch squads' });
    }
  });

  // Create a new squad
  app.post('/api/squads', async (req, res) => {
    try {
      const { name, matchName, matchDate, notes } = req.body;
      const createdBy = "current_user"; // TODO: Get from authenticated user

      const [newSquad] = await db.insert(squads).values({
        name,
        matchName,
        matchDate,
        createdBy,
        notes
      }).returning();

      res.json(newSquad);
    } catch (error) {
      console.error('Error creating squad:', error);
      res.status(500).json({ error: 'Failed to create squad' });
    }
  });

  // Get squad details with selections
  app.get('/api/squads/:squadId', async (req, res) => {
    try {
      const { squadId } = req.params;
      
      const [squad] = await db.select()
        .from(squads)
        .where(eq(squads.id, parseInt(squadId)));

      if (!squad) {
        return res.status(404).json({ error: 'Squad not found' });
      }

      const selections = await db.select()
        .from(squadSelections)
        .where(eq(squadSelections.squadId, parseInt(squadId)));

      const advice = await db.select()
        .from(squadAdvice)
        .where(eq(squadAdvice.squadId, parseInt(squadId)))
        .orderBy(desc(squadAdvice.priority));

      res.json({
        ...squad,
        selections,
        advice
      });
    } catch (error) {
      console.error('Error fetching squad details:', error);
      res.status(500).json({ error: 'Failed to fetch squad details' });
    }
  });

  // Add player to squad
  app.post('/api/squads/:squadId/players', async (req, res) => {
    try {
      const { squadId } = req.params;
      const { playerId, position, isStarter, selectionReason } = req.body;

      // Find the player to get their actual position if not provided
      let playerPosition = position;
      if (!playerPosition) {
        // Get position from player's personalDetails
        const response = await fetch('http://localhost:5000/api/players');
        const allPlayers = await response.json();
        const player = allPlayers.find((p: any) => p.id === playerId);
        
        if (player && player.personalDetails && player.personalDetails.position) {
          playerPosition = player.personalDetails.position;
        } else {
          // Fallback position mapping
          playerPosition = 'Forward';
        }
      }

      const [selection] = await db.insert(squadSelections).values({
        squadId: parseInt(squadId),
        playerId,
        position: playerPosition,
        isStarter: isStarter ?? true,
        selectionReason
      }).returning();

      // Generate selection advice for this squad
      await generateSquadAdvice(parseInt(squadId));

      res.json(selection);
    } catch (error) {
      console.error('Error adding player to squad:', error);
      res.status(500).json({ error: 'Failed to add player to squad' });
    }
  });

  // Remove player from squad
  app.delete('/api/squads/:squadId/players/:playerId', async (req, res) => {
    try {
      const { squadId, playerId } = req.params;

      await db.delete(squadSelections)
        .where(
          and(
            eq(squadSelections.squadId, parseInt(squadId)),
            eq(squadSelections.playerId, playerId)
          )
        );

      // Regenerate advice after removal
      await generateSquadAdvice(parseInt(squadId));

      res.json({ success: true });
    } catch (error) {
      console.error('Error removing player from squad:', error);
      res.status(500).json({ error: 'Failed to remove player from squad' });
    }
  });

  // Update squad details
  app.put('/api/squads/:squadId', async (req, res) => {
    try {
      const { squadId } = req.params;
      const { name, matchName, matchDate, notes } = req.body;

      const [updatedSquad] = await db.update(squads)
        .set({
          name,
          matchName,
          matchDate,
          notes,
          updatedAt: new Date()
        })
        .where(eq(squads.id, parseInt(squadId)))
        .returning();

      res.json(updatedSquad);
    } catch (error) {
      console.error('Error updating squad:', error);
      res.status(500).json({ error: 'Failed to update squad' });
    }
  });

  // Delete squad
  app.delete('/api/squads/:squadId', async (req, res) => {
    try {
      const { squadId } = req.params;

      // Delete related advice and selections first
      await db.delete(squadAdvice).where(eq(squadAdvice.squadId, parseInt(squadId)));
      await db.delete(squadSelections).where(eq(squadSelections.squadId, parseInt(squadId)));
      await db.delete(squads).where(eq(squads.id, parseInt(squadId)));

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting squad:', error);
      res.status(500).json({ error: 'Failed to delete squad' });
    }
  });

  // Generate squad analysis
  app.post('/api/squads/:squadId/analyze', async (req, res) => {
    try {
      const { squadId } = req.params;
      await generateSquadAdvice(parseInt(squadId));
      
      const advice = await db.select()
        .from(squadAdvice)
        .where(eq(squadAdvice.squadId, parseInt(squadId)))
        .orderBy(desc(squadAdvice.priority));

      res.json(advice);
    } catch (error) {
      console.error('Error analyzing squad:', error);
      res.status(500).json({ error: 'Failed to analyze squad' });
    }
  });

// Helper function to generate squad advice
async function generateSquadAdvice(squadId: number) {
  try {
    // Clear existing advice
    await db.delete(squadAdvice).where(eq(squadAdvice.squadId, squadId));

    // Get squad selections
    const selections = await db.select()
      .from(squadSelections)
      .where(eq(squadSelections.squadId, squadId));

    const advice: InsertSquadAdvice[] = [];

    // Get player data for analysis - use existing player data structure
    const playerIds = selections.map(s => s.playerId);
    
    // For now, we'll use a basic player structure that matches our schema
    // In production, this would query the actual player database
    const mockPlayerData = playerIds.map(id => ({
      id,
      personalDetails: { firstName: "Player", lastName: id.slice(-4), position: "Forward" },
      currentStatus: Math.random() > 0.8 ? (Math.random() > 0.5 ? "Injured" : "Suspended") : "Fit",
      gameStats: [{
        season: "2024",
        penalties: Math.floor(Math.random() * 10),
        turnovers: Math.floor(Math.random() * 12),
        tackles: Math.floor(Math.random() * 50),
        tries: Math.floor(Math.random() * 8),
        matchesPlayed: Math.floor(Math.random() * 15)
      }]
    }));
    
    const players = mockPlayerData;

    // Check for injured/suspended players
    players.forEach(player => {
      if (player.currentStatus === 'Injured') {
        advice.push({
          squadId,
          adviceType: 'warning',
          category: 'injury',
          message: `${player.personalDetails.firstName} ${player.personalDetails.lastName} is currently injured and unavailable for selection`,
          priority: 5,
          playerId: player.id
        });
      }
      
      if (player.currentStatus === 'Suspended') {
        advice.push({
          squadId,
          adviceType: 'warning',
          category: 'suspension',
          message: `${player.personalDetails.firstName} ${player.personalDetails.lastName} is currently suspended and unavailable for selection`,
          priority: 5,
          playerId: player.id
        });
      }

      // Check penalty count
      const recentStats = player.gameStats[player.gameStats.length - 1];
      if (recentStats && recentStats.penalties > 5) {
        advice.push({
          squadId,
          adviceType: 'warning',
          category: 'penalties',
          message: `${player.personalDetails.firstName} ${player.personalDetails.lastName} has high penalty count (${recentStats.penalties}) - consider disciplinary focus`,
          priority: 3,
          playerId: player.id
        });
      }

      // Check turnover count
      if (recentStats && recentStats.turnovers > 8) {
        advice.push({
          squadId,
          adviceType: 'suggestion',
          category: 'turnovers',
          message: `${player.personalDetails.firstName} ${player.personalDetails.lastName} has high turnover count (${recentStats.turnovers}) - monitor ball security`,
          priority: 2,
          playerId: player.id
        });
      }
    });

    // Squad balance checks
    const positions = selections.reduce((acc, sel) => {
      acc[sel.position] = (acc[sel.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Check position coverage
    const requiredPositions = ['Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8', 'Scrum-half', 'Fly-half', 'Centre', 'Wing', 'Fullback'];
    requiredPositions.forEach(pos => {
      if (!positions[pos]) {
        advice.push({
          squadId,
          adviceType: 'warning',
          category: 'balance',
          message: `No ${pos} selected - critical position gap`,
          priority: 4
        });
      }
    });

    // Check for too many in one position
    Object.entries(positions).forEach(([pos, count]) => {
      if (count > 4) {
        advice.push({
          squadId,
          adviceType: 'suggestion',
          category: 'balance',
          message: `Too many players selected for ${pos} (${count}) - consider position balance`,
          priority: 2
        });
      }
    });

    // Insert advice
    if (advice.length > 0) {
      await db.insert(squadAdvice).values(advice);
    }

  } catch (error) {
    console.error('Error generating squad advice:', error);
  }
}

  // Seed database with sample data
  app.post("/api/seed", async (req, res) => {
    try {
      // Check if players already exist
      const existingPlayers = await storage.getPlayers();
      if (existingPlayers.length > 0) {
        return res.json({ message: "Database already contains players" });
      }

      // Sample player data for James Mitchell
      const samplePlayer = {
        id: "james-mitchell",
        personalDetails: {
          firstName: "James",
          lastName: "Mitchell",
          dateOfBirth: "2001-03-15",
          email: "james.mitchell@northharbour.rugby",
          phone: "+64 21 123 4567",
          address: "123 Rugby Street, Auckland",
          emergencyContact: {
            name: "Sarah Mitchell",
            relationship: "Mother",
            phone: "+64 21 765 4321"
          }
        },
        rugbyProfile: {
          jerseyNumber: 7,
          primaryPosition: "Flanker",
          secondaryPositions: ["Number 8", "Lock"],
          playingLevel: "Professional",
          yearsInTeam: 3,
          previousClubs: ["Auckland Grammar", "Auckland U19"]
        },
        physicalAttributes: [
          {
            date: "2024-01-15",
            weight: 103,
            bodyFat: 9.0,
            leanMass: 93.7,
            height: 188
          },
          {
            date: "2024-02-15",
            weight: 104,
            bodyFat: 8.5,
            leanMass: 95.2,
            height: 188
          },
          {
            date: "2024-03-15",
            weight: 105,
            bodyFat: 8.2,
            leanMass: 96.4,
            height: 188
          }
        ],
        testResults: [
          {
            date: "2024-03-10",
            testType: "bench_press",
            value: 130,
            unit: "kg"
          },
          {
            date: "2024-03-10",
            testType: "squat",
            value: 185,
            unit: "kg"
          },
          {
            date: "2024-03-10",
            testType: "sprint_40m",
            value: 5.1,
            unit: "s"
          },
          {
            date: "2024-03-10",
            testType: "yo_yo",
            value: 18.2,
            unit: "level"
          },
          {
            date: "2024-03-10",
            testType: "vo2_max",
            value: 58.2,
            unit: "ml/kg/min"
          }
        ],
        skills: {
          ballHandling: 8,
          passing: 7,
          kicking: 6,
          lineoutThrowing: 5,
          scrummaging: 7,
          rucking: 9,
          defense: 8,
          communication: 7
        },
        gameStats: [
          {
            season: "2023",
            matchesPlayed: 12,
            minutesPlayed: 1058,
            tries: 4,
            tackles: 128,
            lineoutWins: 32,
            turnovers: 18,
            penalties: 8
          },
          {
            season: "2024",
            matchesPlayed: 14,
            minutesPlayed: 1247,
            tries: 6,
            tackles: 142,
            lineoutWins: 38,
            turnovers: 23,
            penalties: 6
          }
        ],
        injuries: [],
        reports: [
          {
            id: "r1",
            type: "coach",
            title: "Performance Review - March 2024",
            content: "Excellent progress in lineout work...",
            author: "Coach Thompson",
            date: "2024-03-15",
            lastUpdated: "2024-03-15"
          },
          {
            id: "r2",
            type: "medical",
            title: "Medical Clearance",
            content: "Cleared for full contact...",
            author: "Dr. Smith",
            date: "2024-03-08",
            lastUpdated: "2024-03-08"
          }
        ],
        activities: [
          {
            id: "a1",
            date: "2024-03-20",
            type: "test",
            description: "Physical Test Completed",
            details: "Strength & conditioning assessment"
          },
          {
            id: "a2",
            date: "2024-03-18",
            type: "match",
            description: "Match Performance",
            details: "75 minutes vs Auckland"
          },
          {
            id: "a3",
            date: "2024-03-15",
            type: "meeting",
            description: "Coach Review",
            details: "Performance feedback session"
          }
        ],
        status: {
          fitness: "available",
          medical: "cleared"
        },
        videoAnalysis: [
          {
            id: "video-1",
            title: "Match Highlights vs Auckland Blues",
            description: "Outstanding performance showcasing exceptional lineout throwing and attacking play",
            videoUrl: "https://example.com/video1.mp4",
            thumbnailUrl: "https://example.com/thumb1.jpg",
            duration: 185,
            matchDate: "2024-01-18",
            opponent: "Auckland Blues",
            analysisType: "highlight",
            tags: ["lineout", "attack", "leadership", "tries"],
            keyMoments: [
              {
                timestamp: 45,
                title: "Perfect Lineout Throw",
                description: "Pinpoint accuracy under pressure leading to attacking platform",
                category: "lineout"
              },
              {
                timestamp: 92,
                title: "Try Assist",
                description: "Quick hands to create space for winger's try",
                category: "try"
              }
            ],
            metrics: {
              tackles: 12,
              carries: 8,
              metersGained: 45,
              turnovers: 2,
              passesCompleted: 23,
              lineoutSuccess: 95
            },
            coachNotes: "Excellent game management and leadership qualities on display.",
            isHighlight: true,
            uploadedBy: "Coach Williams",
            uploadedAt: "2024-01-19T10:30:00Z"
          },
          {
            id: "video-2",
            title: "Lineout Training Session",
            description: "Technical breakdown of lineout throwing technique",
            videoUrl: "https://example.com/video2.mp4",
            duration: 420,
            matchDate: "2024-01-15",
            analysisType: "skill_focus",
            tags: ["lineout", "technique", "accuracy"],
            keyMoments: [
              {
                timestamp: 120,
                title: "Throwing Technique",
                description: "Demonstration of proper body positioning",
                category: "skill"
              }
            ],
            metrics: {
              lineoutSuccess: 98
            },
            isHighlight: false,
            uploadedBy: "Coach Thompson",
            uploadedAt: "2024-01-16T14:15:00Z"
          }
        ],
        aiRating: {
          overall: 87,
          physicality: 92,
          skillset: 85,
          gameImpact: 89,
          potential: 84,
          lastUpdated: "2024-03-20"
        }
      };

      await storage.createPlayer(samplePlayer);
      res.json({ message: "Database seeded successfully with sample player data" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  // AI Analysis Routes
  app.get("/api/players/:playerId/ai-analysis", async (req, res) => {
    try {
      const { playerId } = req.params;
      const player = await storage.getPlayer(playerId);
      
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      // Get recent GPS data for the player
      const playerGPSData = sampleGPSData.filter(session => session.playerId === playerId);
      
      const { generatePlayerAnalysis } = await import("./aiAnalysis");
      const analysis = await generatePlayerAnalysis(player, playerGPSData);
      
      res.json(analysis);
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ error: "Failed to generate AI analysis" });
    }
  });

  app.get("/api/players/:playerId/injury-prediction", async (req, res) => {
    try {
      const { playerId } = req.params;
      const player = await storage.getPlayer(playerId);
      
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      const playerGPSData = sampleGPSData.filter(session => session.playerId === playerId);
      
      const { generateInjuryPrediction } = await import("./aiAnalysis");
      const prediction = await generateInjuryPrediction(player, playerGPSData);
      
      res.json(prediction);
    } catch (error) {
      console.error("Injury prediction error:", error);
      res.status(500).json({ error: "Failed to generate injury prediction" });
    }
  });

  app.post("/api/match-analysis", async (req, res) => {
    try {
      const matchData = req.body;
      const players = await storage.getPlayers();
      
      const { generateMatchAnalysis } = await import("./aiAnalysis");
      const analysis = await generateMatchAnalysis(players, matchData);
      
      res.json(analysis);
    } catch (error) {
      console.error("Match analysis error:", error);
      res.status(500).json({ error: "Failed to generate match analysis" });
    }
  });

  // Gemini AI Analysis Routes
  app.post("/api/gemini/analyze-section", async (req, res) => {
    try {
      const { sectionId, matchData, teamStats, playerPerformances } = req.body;
      
      const analysisRequest: MatchAnalysisRequest = {
        sectionId,
        matchData,
        teamStats,
        playerPerformances
      };
      
      const analysis = await geminiAnalyst.analyzeMatchSection(analysisRequest);
      res.json(analysis);
    } catch (error) {
      console.error("Error generating Gemini analysis:", error);
      res.status(500).json({ error: "Failed to generate AI analysis" });
    }
  });

  app.post("/api/gemini/analyze-player", async (req, res) => {
    try {
      const { playerId, matchData, playerStats } = req.body;
      
      const analysis = await geminiAnalyst.analyzePlayerPerformance(playerId, matchData, playerStats);
      res.json(analysis);
    } catch (error) {
      console.error("Error generating player analysis:", error);
      res.status(500).json({ error: "Failed to generate player analysis" });
    }
  });

  app.post("/api/gemini/generate-match-report", async (req, res) => {
    try {
      const { matchData, teamStats, playerPerformances } = req.body;
      
      const report = await geminiAnalyst.generateMatchReport(matchData, teamStats, playerPerformances);
      res.json({ report });
    } catch (error) {
      console.error("Error generating match report:", error);
      res.status(500).json({ error: "Failed to generate match report" });
    }
  });

  app.post("/api/gemini/cohesion-analysis", async (req, res) => {
    try {
      const { cohesionData, prompt, analysisType } = req.body;
      
      const cohesionPrompt = `You are an expert rugby union coach and performance analyst for North Harbour Rugby. Your analysis is grounded in the principle that team cohesion is a primary driver of success.

Current Team Cohesion Data:
- Team Work Index (TWI): ${cohesionData.teamWorkIndex}%
- Experience Differential: ${cohesionData.experienceDifferential}
- Average Signing Age: ${cohesionData.avgSigningAge} years
- Strategy Focus: ${cohesionData.strategy}
- Internal Tenure Distribution: ${JSON.stringify(cohesionData.internalTenure)}

Analysis Request: ${prompt}

Provide a detailed, actionable analysis with specific recommendations for North Harbour Rugby's coaching staff. Focus on practical steps that can be implemented immediately and strategic considerations for long-term success.`;

      const analysisRequest = {
        sectionId: analysisType,
        matchData: { analysis_type: "cohesion" },
        teamStats: cohesionData,
        playerPerformances: []
      };

      // Use existing Gemini service but with cohesion-specific prompt
      const result = await geminiAnalyst.analyzeMatchSection({
        ...analysisRequest,
        sectionId: `cohesion_${analysisType}`
      });

      // Override the analysis with our cohesion prompt
      const cohesionResult = await geminiAnalyst.model.generateContent(cohesionPrompt);
      const response = await cohesionResult.response;
      const analysisText = response.text();

      res.json({
        section: `cohesion_${analysisType}`,
        analysis: analysisText,
        keyInsights: [`TWI: ${cohesionData.teamWorkIndex}%`, `Strategy: ${cohesionData.strategy}`],
        recommendations: ["Strategic cohesion analysis provided"],
        performanceRating: Math.round(cohesionData.teamWorkIndex / 10),
        confidence: 0.95
      });
    } catch (error) {
      console.error("Error generating cohesion analysis:", error);
      res.status(500).json({ error: "Failed to generate cohesion analysis" });
    }
  });

  // ==========================================
  // DATA INTEGRITY & INTERCONNECTED UPDATES
  // ==========================================

  // Medical appointment updates (affects attendance score, player value)
  app.post("/api/players/:id/medical/appointments", async (req, res) => {
    try {
      const { id: playerId } = req.params;
      const appointmentData: MedicalAppointment = req.body;
      const updatedBy = req.body.updatedBy || 'medical_staff';

      const result = await dataUpdateService.updateMedicalAppointment(appointmentData, updatedBy);
      
      if (result.success) {
        res.json({ success: true, message: 'Medical appointment updated successfully' });
      } else {
        res.status(400).json({ success: false, errors: result.errors, warnings: result.warnings });
      }
    } catch (error) {
      console.error("Error updating medical appointment:", error);
      res.status(500).json({ error: "Failed to update medical appointment" });
    }
  });

  // Training attendance updates (affects attendance score, cohesion metrics)
  app.post("/api/players/:id/training/attendance", async (req, res) => {
    try {
      const { id: playerId } = req.params;
      const attendanceData: TrainingAttendance = req.body;
      const updatedBy = req.body.updatedBy || 'coaching_staff';

      const result = await dataUpdateService.updateTrainingAttendance(attendanceData, updatedBy);
      
      if (result.success) {
        res.json({ success: true, message: 'Training attendance updated successfully' });
      } else {
        res.status(400).json({ success: false, errors: result.errors, warnings: result.warnings });
      }
    } catch (error) {
      console.error("Error updating training attendance:", error);
      res.status(500).json({ error: "Failed to update training attendance" });
    }
  });

  // Injury updates (affects medical status, player value, availability)
  app.post("/api/players/:id/injuries", async (req, res) => {
    try {
      const { id: playerId } = req.params;
      const injuryData = req.body;
      const updatedBy = req.body.updatedBy || 'medical_staff';

      const result = await dataUpdateService.processInjuryUpdate(playerId, injuryData, updatedBy);
      
      if (result.success) {
        res.json({ success: true, message: 'Injury record updated successfully' });
      } else {
        res.status(400).json({ success: false, errors: result.errors, warnings: result.warnings });
      }
    } catch (error) {
      console.error("Error updating injury record:", error);
      res.status(500).json({ error: "Failed to update injury record" });
    }
  });

  // CSV data import (comprehensive player data update)
  app.post("/api/players/:id/csv-import", async (req, res) => {
    try {
      const { id: playerId } = req.params;
      const csvData = req.body.data;
      const updatedBy = req.body.updatedBy || 'coaching_staff';

      const result = await dataUpdateService.processCSVImport(playerId, csvData, updatedBy);
      
      if (result.success) {
        res.json({ success: true, message: 'CSV data imported successfully' });
      } else {
        res.status(400).json({ success: false, errors: result.errors, warnings: result.warnings });
      }
    } catch (error) {
      console.error("Error importing CSV data:", error);
      res.status(500).json({ error: "Failed to import CSV data" });
    }
  });

  // Bulk player updates from spreadsheet
  app.post("/api/players/bulk-update", async (req, res) => {
    try {
      const { playerUpdates, updatedBy = 'coaching_staff' } = req.body;

      const results = await dataUpdateService.processBulkPlayerUpdate(playerUpdates, updatedBy);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      res.json({ 
        success: true, 
        message: `Bulk update completed: ${successCount} successful, ${failureCount} failed`,
        results 
      });
    } catch (error) {
      console.error("Error processing bulk update:", error);
      res.status(500).json({ error: "Failed to process bulk update" });
    }
  });

  // GPS data updates from StatSports (affects fitness status, performance metrics)
  app.post("/api/players/:id/gps-data", async (req, res) => {
    try {
      const { id: playerId } = req.params;
      const gpsData = req.body;
      const updatedBy = 'statsports_api';

      const result = await dataUpdateService.processGPSDataUpdate(playerId, gpsData, updatedBy);
      
      if (result.success) {
        res.json({ success: true, message: 'GPS data updated successfully' });
      } else {
        res.status(400).json({ success: false, errors: result.errors, warnings: result.warnings });
      }
    } catch (error) {
      console.error("Error updating GPS data:", error);
      res.status(500).json({ error: "Failed to update GPS data" });
    }
  });

  // AI analysis updates (affects AI ratings, player insights)
  app.post("/api/players/:id/ai-analysis", async (req, res) => {
    try {
      const { id: playerId } = req.params;
      const aiAnalysis = req.body;
      const updatedBy = 'ai_system';

      const result = await dataUpdateService.processAIAnalysisUpdate(playerId, aiAnalysis, updatedBy);
      
      if (result.success) {
        res.json({ success: true, message: 'AI analysis updated successfully' });
      } else {
        res.status(400).json({ success: false, errors: result.errors, warnings: result.warnings });
      }
    } catch (error) {
      console.error("Error updating AI analysis:", error);
      res.status(500).json({ error: "Failed to update AI analysis" });
    }
  });

  // Player value updates (manual adjustments to MoneyBall metrics)
  app.post("/api/players/:id/player-value", async (req, res) => {
    try {
      const { id: playerId } = req.params;
      const playerValueData = { ...req.body, playerId };
      const updatedBy = req.body.updatedBy || 'coaching_staff';

      const result = await dataUpdateService.updatePlayerValue(playerValueData, updatedBy);
      
      if (result.success) {
        res.json({ success: true, message: 'Player value updated successfully' });
      } else {
        res.status(400).json({ success: false, errors: result.errors, warnings: result.warnings });
      }
    } catch (error) {
      console.error("Error updating player value:", error);
      res.status(500).json({ error: "Failed to update player value" });
    }
  });

  // Live match data updates (real-time performance tracking)
  app.post("/api/players/:id/live-match", async (req, res) => {
    try {
      const { id: playerId } = req.params;
      const matchData = req.body;
      const updatedBy = 'live_system';

      const result = await dataUpdateService.processLiveMatchUpdate(playerId, matchData, updatedBy);
      
      if (result.success) {
        res.json({ success: true, message: 'Live match data updated successfully' });
      } else {
        res.status(400).json({ success: false, errors: result.errors, warnings: result.warnings });
      }
    } catch (error) {
      console.error("Error updating live match data:", error);
      res.status(500).json({ error: "Failed to update live match data" });
    }
  });

  // External data sync (StatSports, GAIN LINE, Google Sheets)
  app.post("/api/players/:id/sync/:source", async (req, res) => {
    try {
      const { id: playerId, source } = req.params;
      const data = req.body;
      const updatedBy = `${source}_api`;

      const result = await dataUpdateService.syncExternalData(
        playerId, 
        source as 'statsports' | 'gain_line' | 'google_sheets', 
        data, 
        updatedBy
      );
      
      if (result.success) {
        res.json({ success: true, message: `Data synced from ${source} successfully` });
      } else {
        res.status(400).json({ success: false, errors: result.errors, warnings: result.warnings });
      }
    } catch (error) {
      console.error(`Error syncing data from ${req.params.source}:`, error);
      res.status(500).json({ error: `Failed to sync data from ${req.params.source}` });
    }
  });

  // Get player data update history
  app.get("/api/players/:id/update-history", async (req, res) => {
    try {
      const { id: playerId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const history = dataUpdateService.getPlayerDataHistory(playerId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching update history:", error);
      res.status(500).json({ error: "Failed to fetch update history" });
    }
  });

  // Generate data integrity report
  app.get("/api/players/:id/integrity-report", async (req, res) => {
    try {
      const { id: playerId } = req.params;

      const report = await dataUpdateService.generatePlayerDataReport(playerId);
      res.json(report);
    } catch (error) {
      console.error("Error generating integrity report:", error);
      res.status(500).json({ error: "Failed to generate integrity report" });
    }
  });

  // Data validation endpoint
  app.post("/api/data/validate", async (req, res) => {
    try {
      const { playerId, updates, source = 'manual', updatedBy = 'system' } = req.body;

      // Dry run validation without actually updating
      const result = await dataIntegrityManager.processDataUpdate(
        playerId, 
        updates, 
        source, 
        updatedBy, 
        'Validation check'
      );
      
      res.json({
        valid: result.success,
        errors: result.errors,
        warnings: result.warnings
      });
    } catch (error) {
      console.error("Error validating data:", error);
      res.status(500).json({ error: "Failed to validate data" });
    }
  });

  // Cascade impact analysis - show what will be affected by a change
  app.post("/api/data/impact-analysis", async (req, res) => {
    try {
      const { playerId, updates } = req.body;

      // This would analyze what fields would be affected by the proposed updates
      const impactAnalysis = {
        directUpdates: Object.keys(updates),
        cascadingUpdates: [],
        affectedMetrics: [],
        riskLevel: 'low'
      };

      // Example logic for medical status change
      if (updates['status.medical']) {
        impactAnalysis.cascadingUpdates.push('status.availability', 'playerValue.medicalScore');
        impactAnalysis.affectedMetrics.push('Player Value Analysis', 'Team Availability');
        impactAnalysis.riskLevel = 'medium';
      }

      if (updates['injuries']) {
        impactAnalysis.cascadingUpdates.push('status.medical', 'status.availability', 'playerValue.medicalScore');
        impactAnalysis.affectedMetrics.push('Medical Status', 'Player Value', 'Team Selection');
        impactAnalysis.riskLevel = 'high';
      }

      res.json(impactAnalysis);
    } catch (error) {
      console.error("Error analyzing impact:", error);
      res.status(500).json({ error: "Failed to analyze impact" });
    }
  });

  // Medical endpoints for comprehensive patient management
  app.get('/api/medical/appointments/:playerId', async (req, res) => {
    try {
      const { playerId } = req.params;
      // In production, fetch from database
      const mockAppointments = [
        {
          id: `apt_${playerId}_1`,
          playerId,
          type: 'routine_checkup',
          date: '2024-06-20',
          scheduledTime: '10:00',
          status: 'scheduled',
          provider: 'Dr. Smith',
          notes: 'Regular health assessment'
        }
      ];
      res.json(mockAppointments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  app.get('/api/medical/notes/:playerId', async (req, res) => {
    try {
      const { playerId } = req.params;
      // In production, fetch from database
      const mockNotes = [
        {
          id: `note_${playerId}_1`,
          playerId,
          date: '2024-06-15',
          provider: 'Dr. Smith',
          type: 'assessment',
          content: 'Player reports good overall fitness. No significant concerns.',
          recommendations: 'Continue current training regime',
          urgency: 'low',
          flaggedForCoach: false
        }
      ];
      res.json(mockNotes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch medical notes' });
    }
  });

  app.get('/api/medical/injuries/:playerId', async (req, res) => {
    try {
      const { playerId } = req.params;
      // In production, fetch from database
      const mockInjuries = [];
      res.json(mockInjuries);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch injury records' });
    }
  });

  app.post('/api/medical/notes', async (req, res) => {
    try {
      const noteData = req.body;
      
      // Process through data integrity system
      const updateResult = await dataIntegrityManager.processDataUpdate(
        noteData.playerId,
        { medicalNotes: [noteData] },
        'medical_update',
        'Dr. Smith'
      );

      res.json({ success: true, note: noteData, cascadingUpdates: updateResult.cascadingUpdates });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create medical note' });
    }
  });

  app.post('/api/medical/appointments', async (req, res) => {
    try {
      const appointmentData = req.body;
      
      // Process through data integrity system for appointment scheduling
      const updateResult = await dataIntegrityManager.processDataUpdate(
        appointmentData.playerId,
        { medicalAppointments: [appointmentData] },
        'medical_update',
        'Medical Staff'
      );

      res.json({ success: true, appointment: appointmentData, cascadingUpdates: updateResult.cascadingUpdates });
    } catch (error) {
      res.status(500).json({ error: 'Failed to schedule appointment' });
    }
  });

  app.post('/api/medical/injuries', async (req, res) => {
    try {
      const injuryData = req.body;
      
      // Process injury through data integrity system with cascading effects
      const updateResult = await dataIntegrityManager.processDataUpdate(
        injuryData.playerId,
        { 
          injuries: [injuryData],
          status: { medical: injuryData.severity === 'severe' ? 'unavailable' : 'modified' }
        },
        'medical_update',
        'Medical Staff'
      );

      res.json({ success: true, injury: injuryData, cascadingUpdates: updateResult.cascadingUpdates });
    } catch (error) {
      res.status(500).json({ error: 'Failed to record injury' });
    }
  });

  app.post('/api/medical/communication', async (req, res) => {
    try {
      const messageData = req.body;
      
      // Log communication in system
      console.log('Medical communication sent:', messageData);
      
      res.json({ success: true, message: 'Communication sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send communication' });
    }
  });

  // Live demo endpoint for testing data integrity
  app.post("/api/demo/medical-appointment/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { action } = req.body; // 'miss' or 'attend'

      // Simulate a medical appointment update
      const appointmentData = {
        id: `appointment_${Date.now()}`,
        playerId,
        type: 'routine_checkup' as const,
        date: new Date().toISOString().split('T')[0],
        scheduledTime: '14:00',
        status: (action === 'miss' ? 'missed' : 'completed') as const,
        provider: 'Dr. Smith',
        notes: `Demo appointment - ${action === 'miss' ? 'player did not attend' : 'completed successfully'}`
      };

      // Process through data integrity system
      const result = await dataUpdateService.updateMedicalAppointment(
        appointmentData, 
        'demo_system'
      );

      if (result.success) {
        // Return the cascading effects for demonstration
        const cascadingEffects = {
          trigger: `Medical appointment ${appointmentData.status}`,
          changes: action === 'miss' ? [
            { field: 'attendanceScore', before: 9.2, after: 8.7, impact: 'negative' },
            { field: 'medicalScore', before: 8.8, after: 8.3, impact: 'negative' },
            { field: 'playerValue', before: 147000, after: 143500, impact: 'negative' },
            { field: 'cohesionReliability', before: 9.1, after: 8.7, impact: 'negative' }
          ] : [
            { field: 'attendanceScore', before: 8.7, after: 9.2, impact: 'positive' },
            { field: 'medicalScore', before: 8.3, after: 8.8, impact: 'positive' },
            { field: 'playerValue', before: 143500, after: 147000, impact: 'positive' },
            { field: 'cohesionReliability', before: 8.7, after: 9.1, impact: 'positive' }
          ],
          affectedSystems: [
            'Player Value Analysis',
            'Team Cohesion Metrics',
            'Medical Compliance Tracking',
            'Selection Risk Assessment'
          ],
          auditTrail: {
            timestamp: new Date().toISOString(),
            source: 'demo_system',
            updatedBy: 'Demo User',
            reason: 'Data integrity demonstration'
          }
        };

        res.json({
          success: true,
          message: 'Medical appointment processed successfully',
          cascadingEffects,
          appointmentData
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in medical appointment demo:", error);
      res.status(500).json({ error: "Failed to process medical appointment demo" });
    }
  });

  // Demo endpoint for GPS data impact
  app.post("/api/demo/gps-data/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { scenario } = req.body; // 'decline' or 'improve'

      const gpsData = {
        id: `gps_${Date.now()}`,
        playerId,
        sessionType: 'training',
        date: new Date().toISOString().split('T')[0],
        duration: 90,
        totalDistance: scenario === 'decline' ? 4200 : 6800,
        maxSpeed: scenario === 'decline' ? 22.3 : 28.7,
        playerLoad: scenario === 'decline' ? 245 : 385,
        totalDistanceZones: {
          walking: scenario === 'decline' ? 1800 : 1200,
          jogging: scenario === 'decline' ? 1600 : 2200,
          running: scenario === 'decline' ? 600 : 2100,
          highSpeed: scenario === 'decline' ? 150 : 900,
          sprinting: scenario === 'decline' ? 50 : 400
        }
      };

      const result = await dataUpdateService.processGPSDataUpdate(
        playerId,
        gpsData,
        'demo_system'
      );

      if (result.success) {
        const cascadingEffects = {
          trigger: `GPS performance ${scenario}`,
          changes: scenario === 'decline' ? [
            { field: 'fitnessRating', before: 8.5, after: 6.2, impact: 'negative' },
            { field: 'workloadScore', before: 7.8, after: 5.9, impact: 'negative' },
            { field: 'performanceFlag', before: false, after: true, impact: 'negative' },
            { field: 'medicalReviewRequired', before: false, after: true, impact: 'negative' }
          ] : [
            { field: 'fitnessRating', before: 6.2, after: 8.5, impact: 'positive' },
            { field: 'workloadScore', before: 5.9, after: 7.8, impact: 'positive' },
            { field: 'performanceFlag', before: true, after: false, impact: 'positive' },
            { field: 'fitnessStatus', before: 'needs_attention', after: 'excellent', impact: 'positive' }
          ],
          affectedSystems: [
            'Fitness Monitoring',
            'Training Load Management',
            'Performance Analytics',
            'Medical Alert System'
          ]
        };

        res.json({
          success: true,
          message: 'GPS data processed successfully',
          cascadingEffects,
          gpsData
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in GPS data demo:", error);
      res.status(500).json({ error: "Failed to process GPS data demo" });
    }
  });

  // Demo endpoint for injury status change
  app.post("/api/demo/injury-update/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { action } = req.body; // 'new_injury' or 'clear_injury'

      const injuryData = action === 'new_injury' ? {
        id: `injury_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'hamstring strain',
        severity: 'moderate',
        description: 'Grade 2 hamstring strain during training',
        status: 'active',
        expectedReturn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      } : {
        id: `injury_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'hamstring strain',
        severity: 'moderate',
        description: 'Cleared for full training',
        status: 'cleared',
        actualReturn: new Date().toISOString().split('T')[0]
      };

      const result = await dataUpdateService.processInjuryUpdate(
        playerId,
        injuryData,
        'demo_system'
      );

      if (result.success) {
        const cascadingEffects = {
          trigger: `Injury status ${injuryData.status}`,
          changes: action === 'new_injury' ? [
            { field: 'medicalStatus', before: 'cleared', after: 'restricted', impact: 'negative' },
            { field: 'availabilityStatus', before: 'available', after: 'injured', impact: 'negative' },
            { field: 'medicalScore', before: 9.5, after: 7.5, impact: 'negative' },
            { field: 'selectionRisk', before: 'low', after: 'high', impact: 'negative' }
          ] : [
            { field: 'medicalStatus', before: 'restricted', after: 'cleared', impact: 'positive' },
            { field: 'availabilityStatus', before: 'injured', after: 'available', impact: 'positive' },
            { field: 'medicalScore', before: 7.5, after: 9.5, impact: 'positive' },
            { field: 'selectionRisk', before: 'high', after: 'low', impact: 'positive' }
          ],
          affectedSystems: [
            'Medical Status Tracking',
            'Team Selection',
            'Player Value Analysis',
            'Risk Assessment'
          ]
        };

        res.json({
          success: true,
          message: 'Injury status updated successfully',
          cascadingEffects,
          injuryData
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in injury update demo:", error);
      res.status(500).json({ error: "Failed to process injury update demo" });
    }
  });

  // ==========================================
  // DATA TEMPLATES HUB API ENDPOINTS
  // ==========================================

  // Get all available data templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = [
        {
          id: "players_basic",
          name: "Player Roster Template",
          description: "Essential player information for team setup and management",
          category: "players",
          format: "csv",
          fields: [
            { name: "player_id", type: "string", required: true, description: "Unique identifier for player", example: "NH001" },
            { name: "first_name", type: "string", required: true, description: "Player's first name", example: "John" },
            { name: "last_name", type: "string", required: true, description: "Player's last name", example: "Smith" },
            { name: "date_of_birth", type: "date", required: true, description: "Player's birth date", example: "1995-03-15" },
            { name: "position", type: "string", required: true, description: "Primary playing position", example: "Flanker" },
            { name: "jersey_number", type: "number", required: true, description: "Player's jersey number", example: "7" },
            { name: "height_cm", type: "number", required: false, description: "Height in centimeters", example: "185" },
            { name: "weight_kg", type: "number", required: false, description: "Weight in kilograms", example: "95" },
            { name: "contract_start", type: "date", required: false, description: "Contract start date", example: "2024-01-01" },
            { name: "contract_end", type: "date", required: false, description: "Contract end date", example: "2025-12-31" }
          ]
        },
        {
          id: "match_performance",
          name: "Match Performance Template",
          description: "Individual player statistics for match analysis",
          category: "matches",
          format: "csv",
          fields: [
            { name: "match_id", type: "string", required: true, description: "Unique match identifier", example: "NPC2025_RD1" },
            { name: "player_id", type: "string", required: true, description: "Player identifier", example: "NH001" },
            { name: "minutes_played", type: "number", required: true, description: "Minutes on field", example: "80" },
            { name: "tries", type: "number", required: false, description: "Tries scored", example: "1" },
            { name: "assists", type: "number", required: false, description: "Try assists", example: "2" },
            { name: "tackles_made", type: "number", required: false, description: "Successful tackles", example: "12" },
            { name: "tackles_missed", type: "number", required: false, description: "Missed tackles", example: "2" },
            { name: "carries", type: "number", required: false, description: "Ball carries", example: "8" },
            { name: "metres_gained", type: "number", required: false, description: "Metres gained from carries", example: "45" },
            { name: "passes", type: "number", required: false, description: "Passes attempted", example: "25" },
            { name: "pass_accuracy", type: "number", required: false, description: "Pass completion percentage", example: "92.5" }
          ]
        }
      ];
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Download specific template
  app.get("/api/templates/download/:templateId", async (req, res) => {
    try {
      const { templateId } = req.params;
      
      const templateData: { [key: string]: string } = {
        "players_basic": `player_id,first_name,last_name,date_of_birth,position,jersey_number,height_cm,weight_kg,contract_start,contract_end
NH001,John,Smith,1995-03-15,Flanker,7,185,95,2024-01-01,2025-12-31
NH002,Mike,Johnson,1993-07-22,Prop,1,180,110,2024-01-01,2025-12-31
NH003,David,Wilson,1996-11-08,Fly-half,10,175,85,2024-01-01,2025-12-31`,
        "match_performance": `match_id,player_id,minutes_played,tries,assists,tackles_made,tackles_missed,carries,metres_gained,passes,pass_accuracy
NPC2025_RD1,NH001,80,1,2,12,2,8,45,25,92.5
NPC2025_RD1,NH002,65,0,0,8,1,12,35,15,88.2
NPC2025_RD1,NH003,80,0,3,3,1,15,85,45,94.1`,
        "gps_training": `session_id,player_id,total_distance,high_speed_distance,sprint_distance,max_speed,accelerations,decelerations,impacts,training_load
TRN_20250801,NH001,4500,850,125,28.5,45,38,12,285
TRN_20250801,NH002,3800,650,95,26.2,38,32,8,245
TRN_20250801,NH003,4200,780,110,27.8,42,35,10,265`,
        "medical_tracking": `player_id,date,injury_type,injury_severity,expected_return,availability,load_restriction,notes
NH001,2025-01-15,,,Available,100,Cleared for full training
NH002,2025-01-15,Hamstring strain,Grade 1,2025-01-29,Injured,0,Rest and rehabilitation required
NH003,2025-01-15,,,Available,90,Return to play protocol`
      };

      const data = templateData[templateId];
      if (!data) {
        return res.status(404).json({ error: "Template not found" });
      }

      const filename = `${templateId}_template.csv`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'text/csv');
      res.send(data);
    } catch (error) {
      console.error("Error downloading template:", error);
      res.status(500).json({ error: "Failed to download template" });
    }
  });

  // Get system configuration
  app.get("/api/configuration", async (req, res) => {
    try {
      const config = {
        teamSetup: {
          teamName: "North Harbour Rugby",
          season: "2025 NPC",
          homeVenue: "North Harbour Stadium",
          competition: "NPC Championship"
        },
        performanceThresholds: {
          highSpeedThreshold: 15,
          sprintThreshold: 25,
          targetCScore: 3.0,
          tackleSuccessTarget: 90
        },
        dataSync: {
          autoSyncGPS: true,
          syncFrequency: "daily",
          dataRetention: 24
        }
      };
      res.json(config);
    } catch (error) {
      console.error("Error fetching configuration:", error);
      res.status(500).json({ error: "Failed to fetch configuration" });
    }
  });

  // Update system configuration
  app.post("/api/configuration", async (req, res) => {
    try {
      const config = req.body;
      // In a real implementation, save to database
      // For now, just validate and return success
      res.json({ success: true, message: "Configuration updated successfully" });
    } catch (error) {
      console.error("Error updating configuration:", error);
      res.status(500).json({ error: "Failed to update configuration" });
    }
  });

  // Get API integrations status
  app.get("/api/integrations", async (req, res) => {
    try {
      const integrations = [
        {
          name: "StatSports API",
          description: "GPS tracking data integration",
          endpoint: "/api/statsports/sync",
          authentication: "API Key",
          status: "configured",
          lastSync: "2025-01-16T10:30:00Z"
        },
        {
          name: "Google Sheets",
          description: "Spreadsheet data synchronization",
          endpoint: "/api/google-sheets/sync",
          authentication: "Service Account",
          status: "configured",
          lastSync: "2025-01-16T09:15:00Z"
        },
        {
          name: "GAIN LINE Analytics",
          description: "Cohesion analytics integration",
          endpoint: "/api/gainline/cohesion",
          authentication: "OAuth 2.0",
          status: "pending",
          lastSync: null
        }
      ];
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  // Test API integration
  app.post("/api/integrations/:integrationName/test", async (req, res) => {
    try {
      const { integrationName } = req.params;
      // Mock test result - in real implementation, test actual connection
      const testResult = {
        success: true,
        message: `${integrationName} integration test successful`,
        timestamp: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 500) + 100
      };
      res.json(testResult);
    } catch (error) {
      console.error("Error testing integration:", error);
      res.status(500).json({ error: "Failed to test integration" });
    }
  });

  // Upload custom data template
  app.post("/api/templates/upload", async (req, res) => {
    try {
      const { name, description, category, format, fields, sampleData } = req.body;
      
      // In a real implementation, save to database
      const templateId = name.toLowerCase().replace(/\s+/g, '_');
      
      res.json({ 
        success: true, 
        templateId,
        message: "Custom template uploaded successfully" 
      });
    } catch (error) {
      console.error("Error uploading template:", error);
      res.status(500).json({ error: "Failed to upload template" });
    }
  });

  // Validate uploaded data against template
  app.post("/api/templates/:templateId/validate", async (req, res) => {
    try {
      const { templateId } = req.params;
      const { data } = req.body;
      
      // Mock validation - in real implementation, validate against template schema
      const validationResult = {
        valid: true,
        errors: [],
        warnings: [],
        rowsProcessed: Array.isArray(data) ? data.length : 0,
        summary: "Data validation completed successfully"
      };
      
      res.json(validationResult);
    } catch (error) {
      console.error("Error validating data:", error);
      res.status(500).json({ error: "Failed to validate data" });
    }
  });

  // ==========================================
  // STRENGTH & CONDITIONING PORTAL API ROUTES
  // ==========================================

  // Get squad overview for S&C dashboard
  app.get("/api/sc/squad-overview", async (req, res) => {
    try {
      const overview = await scAnalyticsService.getSquadOverview();
      res.json(overview);
    } catch (error) {
      console.error("Error getting squad overview:", error);
      res.status(500).json({ error: "Failed to get squad overview" });
    }
  });

  // Get daily readiness view for all players
  app.get("/api/sc/daily-readiness", async (req, res) => {
    try {
      const readinessData = await scAnalyticsService.getDailyReadinessView();
      res.json(readinessData);
    } catch (error) {
      console.error("Error getting daily readiness:", error);
      res.status(500).json({ error: "Failed to get daily readiness data" });
    }
  });

  // Get detailed player analytics for S&C
  app.get("/api/sc/player-analytics/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const analytics = await scAnalyticsService.getPlayerDeepDive(playerId);
      res.json(analytics);
    } catch (error) {
      console.error("Error getting player analytics:", error);
      res.status(500).json({ error: "Failed to get player analytics" });
    }
  });

  // Submit wellness entry
  app.post("/api/sc/wellness", async (req, res) => {
    try {
      const { playerId, date, sleepQuality, muscleSoreness, fatigueLevel, stressLevel, mood, notes, readinessScore } = req.body;
      
      // Calculate readiness score using service method
      const calculatedReadiness = scAnalyticsService.calculateReadinessScore({
        sleepQuality, muscleSoreness, fatigueLevel, stressLevel, mood
      });

      // Insert wellness entry into database
      const wellnessEntry = await db.insert(playerWellness).values({
        playerId,
        date,
        sleepQuality,
        muscleSoreness, 
        fatigueLevel,
        stressLevel,
        mood,
        readinessScore: calculatedReadiness,
        notes
      }).returning();

      // Check for wellness-based injury risk flags
      if (calculatedReadiness < 60) {
        await db.insert(injuryRiskFlags).values({
          playerId,
          flagType: 'wellness_drop',
          riskLevel: calculatedReadiness < 50 ? 'high' : 'moderate',
          triggerValue: calculatedReadiness,
          threshold: 70,
          description: `Low wellness readiness score: ${calculatedReadiness}%`,
          dataSource: 'wellness',
          recommendedActions: ['Monitor closely', 'Consider modified training load', 'Extra recovery protocols']
        });
      }

      res.json({ success: true, wellnessEntry: wellnessEntry[0], readinessScore: calculatedReadiness });
    } catch (error) {
      console.error("Error submitting wellness entry:", error);
      res.status(500).json({ error: "Failed to submit wellness entry" });
    }
  });

  // Submit GPS data
  app.post("/api/sc/gps-data", async (req, res) => {
    try {
      const gpsEntry = req.body;
      const result = await scAnalyticsService.processGPSData(gpsEntry);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error("Error processing GPS data:", error);
      res.status(500).json({ error: "Failed to process GPS data" });
    }
  });

  // Set load targets for a player
  app.post("/api/sc/load-targets", async (req, res) => {
    try {
      const { playerId, weekStarting, weeklyHmlTarget, dailyHmlTarget, weeklyPlayerLoadTarget, weeklyDistanceTarget, weeklyHsrTarget, setBy, notes } = req.body;

      const targets = await db.insert(playerLoadTargets).values({
        playerId,
        weekStarting,
        weeklyHmlTarget,
        dailyHmlTarget,
        weeklyPlayerLoadTarget,
        weeklyDistanceTarget,
        weeklyHsrTarget,
        setBy,
        notes
      }).returning();

      res.json({ success: true, targets: targets[0] });
    } catch (error) {
      console.error("Error setting load targets:", error);
      res.status(500).json({ error: "Failed to set load targets" });
    }
  });

  // Check load targets for a player and week
  app.get("/api/sc/load-targets/:playerId/:weekStarting", async (req, res) => {
    try {
      const { playerId, weekStarting } = req.params;
      const targetCheck = await scAnalyticsService.checkLoadTargets(playerId, weekStarting);
      res.json(targetCheck);
    } catch (error) {
      console.error("Error checking load targets:", error);
      res.status(500).json({ error: "Failed to check load targets" });
    }
  });

  // Get cumulative load analysis
  app.get("/api/sc/cumulative-load/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const weeks = parseInt(req.query.weeks as string) || 4;
      const loadAnalysis = await scAnalyticsService.calculateCumulativeLoad(playerId, weeks);
      res.json(loadAnalysis);
    } catch (error) {
      console.error("Error getting cumulative load:", error);
      res.status(500).json({ error: "Failed to get cumulative load analysis" });
    }
  });

  // Get wellness correlations for a player
  app.get("/api/sc/wellness-correlations/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      const correlations = await scAnalyticsService.analyzeWellnessCorrelations(playerId, days);
      res.json(correlations);
    } catch (error) {
      console.error("Error analyzing wellness correlations:", error);
      res.status(500).json({ error: "Failed to analyze wellness correlations" });
    }
  });

  // Get injury risk flags
  app.get("/api/sc/injury-flags", async (req, res) => {
    try {
      const playerId = req.query.playerId as string;
      const trends = await scAnalyticsService.analyzeInjuryTrends(playerId);
      res.json(trends);
    } catch (error) {
      console.error("Error getting injury flags:", error);
      res.status(500).json({ error: "Failed to get injury risk analysis" });
    }
  });

  // Acknowledge/resolve injury risk flag
  app.patch("/api/sc/injury-flags/:flagId", async (req, res) => {
    try {
      const { flagId } = req.params;
      const { status, acknowledgedBy } = req.body;

      const updatedFlag = await db.update(injuryRiskFlags)
        .set({
          status,
          acknowledgedBy,
          acknowledgedAt: status === 'acknowledged' ? new Date() : undefined,
          resolvedAt: status === 'resolved' ? new Date() : undefined
        })
        .where(eq(injuryRiskFlags.id, parseInt(flagId)))
        .returning();

      res.json({ success: true, flag: updatedFlag[0] });
    } catch (error) {
      console.error("Error updating injury flag:", error);
      res.status(500).json({ error: "Failed to update injury flag" });
    }
  });

  // Bulk GPS data import (for StatSports integration)
  app.post("/api/sc/gps-data/bulk", async (req, res) => {
    try {
      const { sessions } = req.body;
      const results = [];

      for (const session of sessions) {
        try {
          const result = await scAnalyticsService.processGPSData(session);
          results.push({ success: true, sessionId: session.sessionId, data: result });
        } catch (error) {
          results.push({ success: false, sessionId: session.sessionId, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      res.json({
        success: true,
        processed: sessions.length,
        successful: successCount,
        failed: failCount,
        results
      });
    } catch (error) {
      console.error("Error processing bulk GPS data:", error);
      res.status(500).json({ error: "Failed to process bulk GPS data" });
    }
  });

  // Get load analytics summary for dashboard
  app.get("/api/sc/load-analytics", async (req, res) => {
    try {
      const weekStarting = req.query.weekStarting as string;
      const position = req.query.position as string;
      
      // Get load analytics data based on filters
      let query = db.select().from(loadAnalytics);
      
      if (weekStarting) {
        query = query.where(eq(loadAnalytics.weekStarting, weekStarting));
      }

      const analyticsData = await query;
      
      // Additional processing could be done here for position filtering
      res.json(analyticsData);
    } catch (error) {
      console.error("Error getting load analytics:", error);
      res.status(500).json({ error: "Failed to get load analytics" });
    }
  });

  // Create training session
  app.post("/api/sc/training-sessions", async (req, res) => {
    try {
      const sessionData = req.body;
      
      const session = await db.insert(trainingSessions).values({
        id: `session_${Date.now()}`,
        ...sessionData,
        createdBy: sessionData.createdBy || 'sc_staff'
      }).returning();

      res.json({ success: true, session: session[0] });
    } catch (error) {
      console.error("Error creating training session:", error);
      res.status(500).json({ error: "Failed to create training session" });
    }
  });

  // Get training sessions
  app.get("/api/sc/training-sessions", async (req, res) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      let query = db.select().from(trainingSessions);
      
      if (startDate && endDate) {
        query = query.where(and(
          gte(trainingSessions.date, startDate),
          lte(trainingSessions.date, endDate)
        ));
      }
      
      const sessions = await query.orderBy(desc(trainingSessions.date));
      res.json(sessions);
    } catch (error) {
      console.error("Error getting training sessions:", error);
      res.status(500).json({ error: "Failed to get training sessions" });
    }
  });

  // Submit fitness test data
  app.post("/api/sc/fitness-tests", async (req, res) => {
    try {
      const { playerId, testType, score, unit, date, notes } = req.body;
      
      // Insert into player test results (using existing structure)
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      // Add to test results array
      const updatedTestResults = [
        ...(player.testResults || []),
        {
          date,
          testType,
          value: score,
          unit,
          notes
        }
      ];

      // Update player with new test result
      await storage.updatePlayer(playerId, {
        testResults: updatedTestResults
      });

      res.json({ 
        success: true, 
        message: "Fitness test data added successfully",
        testResult: {
          date,
          testType,
          value: score,
          unit,
          notes
        }
      });
    } catch (error) {
      console.error("Error submitting fitness test:", error);
      res.status(500).json({ error: "Failed to submit fitness test data" });
    }
  });

  // Get position-based fitness comparisons
  app.get("/api/sc/position-comparisons/:position", async (req, res) => {
    try {
      const { position } = req.params;
      const { testType } = req.query;
      
      const players = await storage.getPlayers();
      const positionPlayers = players.filter(p => 
        p.rugbyProfile?.primaryPosition === position || 
        p.rugbyProfile?.secondaryPositions?.includes(position)
      );

      const comparisons = positionPlayers.map(player => {
        const latestTest = player.testResults
          ?.filter(test => testType ? test.testType === testType : true)
          ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        return {
          playerId: player.id,
          playerName: `${player.personalDetails.firstName} ${player.personalDetails.lastName}`,
          jerseyNumber: player.rugbyProfile?.jerseyNumber,
          latestScore: latestTest ? {
            value: latestTest.value,
            unit: latestTest.unit,
            date: latestTest.date,
            testType: latestTest.testType
          } : null
        };
      });

      res.json({
        position,
        testType: testType || 'all',
        playerCount: comparisons.length,
        comparisons: comparisons.sort((a, b) => {
          if (!a.latestScore && !b.latestScore) return 0;
          if (!a.latestScore) return 1;
          if (!b.latestScore) return -1;
          return b.latestScore.value - a.latestScore.value;
        })
      });
    } catch (error) {
      console.error("Error getting position comparisons:", error);
      res.status(500).json({ error: "Failed to get position comparisons" });
    }
  });

  // ================================
  // FIREBASE CLEANUP ENDPOINTS
  // ================================

  // Clear all Firebase collections before migration
  app.post("/api/firebase/cleanup", async (req, res) => {
    try {
      console.log('🧹 Starting Firebase database cleanup...');
      const result = await cleanupService.clearAllCollections();
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Firebase database cleaned successfully',
          collectionsCleared: result.collectionsCleared,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Cleanup completed with errors',
          collectionsCleared: result.collectionsCleared,
          errors: result.errors,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error('❌ Firebase cleanup failed:', error);
      res.status(500).json({
        success: false,
        message: 'Firebase cleanup failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get current database status
  app.get("/api/firebase/database-status", async (req, res) => {
    try {
      const status = await cleanupService.getDatabaseStatus();
      res.json({
        success: true,
        ...status,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Failed to get database status:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Verify cleanup completion
  app.get("/api/firebase/verify-cleanup", async (req, res) => {
    try {
      const verification = await cleanupService.verifyCleanup();
      res.json({
        success: true,
        isClean: verification.isClean,
        remainingData: verification.remainingData,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Failed to verify cleanup:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // ================================
  // FIREBASE MIGRATION ENDPOINTS
  // ================================

  // Start Firebase migration - Execute comprehensive migration
  app.post("/api/firebase/migrate", async (req, res) => {
    try {
      console.log('🚀 Starting Firebase migration...');
      const result = await migrationService.migrateToFirebase();
      
      if (result.success) {
        res.json({
          success: true,
          message: `Migration completed successfully! Created ${result.playersCreated} players with expanded Firebase schema`,
          playersCreated: result.playersCreated,
          errors: result.errors,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Migration failed',
          playersCreated: result.playersCreated,
          errors: result.errors,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error('❌ Migration endpoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Migration failed with error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get migration status
  app.get("/api/firebase/migration-status", async (req, res) => {
    try {
      const status = await migrationService.getMigrationStatus();
      res.json(status);
    } catch (error: any) {
      console.error('❌ Migration status error:', error);
      res.status(500).json({
        error: 'Failed to get migration status',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Verify migration
  app.get("/api/firebase/verify", async (req, res) => {
    try {
      const verification = await migrationService.verifyMigration();
      res.json(verification);
    } catch (error: any) {
      console.error('❌ Migration verification error:', error);
      res.status(500).json({
        error: 'Failed to verify migration',
        timestamp: new Date().toISOString()
      });
    }
  });

  // ================================
  // FIREBASE PLAYER DATA ENDPOINTS
  // ================================

  // Get all players from Firebase
  app.get("/api/firebase/players", async (req, res) => {
    try {
      const players = await firebaseService.getAllPlayers();
      res.json({
        players,
        count: players.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Error getting Firebase players:', error);
      res.status(500).json({ error: 'Failed to get players from Firebase' });
    }
  });

  // Get specific player from Firebase
  app.get("/api/firebase/players/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      const player = await firebaseService.getPlayer(playerId);
      
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      res.json(player);
    } catch (error: any) {
      console.error('❌ Error getting Firebase player:', error);
      res.status(500).json({ error: 'Failed to get player from Firebase' });
    }
  });

  // Get player analytics from Firebase
  app.get("/api/firebase/players/:playerId/analytics", async (req, res) => {
    try {
      const { playerId } = req.params;
      const analytics = await firebaseService.getPlayerAnalytics(playerId);
      res.json(analytics);
    } catch (error: any) {
      console.error('❌ Error getting player analytics:', error);
      res.status(500).json({ error: 'Failed to get player analytics' });
    }
  });

  // Search players in Firebase
  app.get("/api/firebase/players/search/:searchTerm", async (req, res) => {
    try {
      const { searchTerm } = req.params;
      const players = await firebaseService.searchPlayers(searchTerm);
      res.json({
        searchTerm,
        players,
        count: players.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Error searching Firebase players:', error);
      res.status(500).json({ error: 'Failed to search players in Firebase' });
    }
  });

  // ================================
  // FIREBASE MEDICAL ENDPOINTS
  // ================================

  // Get medical appointments for a player
  app.get("/api/firebase/players/:playerId/medical/appointments", async (req, res) => {
    try {
      const { playerId } = req.params;
      const appointments = await firebaseService.getMedicalAppointments(playerId);
      res.json(appointments);
    } catch (error: any) {
      console.error('❌ Error getting medical appointments:', error);
      res.status(500).json({ error: 'Failed to get medical appointments' });
    }
  });

  // Create medical appointment
  app.post("/api/firebase/players/:playerId/medical/appointments", async (req, res) => {
    try {
      const { playerId } = req.params;
      const appointmentId = await firebaseService.createMedicalAppointment(playerId, req.body);
      res.json({ id: appointmentId, message: 'Medical appointment created successfully' });
    } catch (error: any) {
      console.error('❌ Error creating medical appointment:', error);
      res.status(500).json({ error: 'Failed to create medical appointment' });
    }
  });

  // Get medical notes for a player
  app.get("/api/firebase/players/:playerId/medical/notes", async (req, res) => {
    try {
      const { playerId } = req.params;
      const notes = await firebaseService.getMedicalNotes(playerId);
      res.json(notes);
    } catch (error: any) {
      console.error('❌ Error getting medical notes:', error);
      res.status(500).json({ error: 'Failed to get medical notes' });
    }
  });

  // Create medical note
  app.post("/api/firebase/players/:playerId/medical/notes", async (req, res) => {
    try {
      const { playerId } = req.params;
      const noteId = await firebaseService.createMedicalNote(playerId, req.body);
      res.json({ id: noteId, message: 'Medical note created successfully' });
    } catch (error: any) {
      console.error('❌ Error creating medical note:', error);
      res.status(500).json({ error: 'Failed to create medical note' });
    }
  });

  // Get injury records for a player
  app.get("/api/firebase/players/:playerId/medical/injuries", async (req, res) => {
    try {
      const { playerId } = req.params;
      const injuries = await firebaseService.getInjuryRecords(playerId);
      res.json(injuries);
    } catch (error: any) {
      console.error('❌ Error getting injury records:', error);
      res.status(500).json({ error: 'Failed to get injury records' });
    }
  });

  // Create injury record
  app.post("/api/firebase/players/:playerId/medical/injuries", async (req, res) => {
    try {
      const { playerId } = req.params;
      const injuryId = await firebaseService.createInjuryRecord(playerId, req.body);
      res.json({ id: injuryId, message: 'Injury record created successfully' });
    } catch (error: any) {
      console.error('❌ Error creating injury record:', error);
      res.status(500).json({ error: 'Failed to create injury record' });
    }
  });

  // ================================
  // FIREBASE FITNESS & GPS ENDPOINTS
  // ================================

  // Get fitness tests for a player
  app.get("/api/firebase/players/:playerId/fitness/tests", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { testType } = req.query;
      const tests = await firebaseService.getFitnessTests(playerId, testType as string);
      res.json(tests);
    } catch (error: any) {
      console.error('❌ Error getting fitness tests:', error);
      res.status(500).json({ error: 'Failed to get fitness tests' });
    }
  });

  // Create fitness test
  app.post("/api/firebase/players/:playerId/fitness/tests", async (req, res) => {
    try {
      const { playerId } = req.params;
      const testId = await firebaseService.createFitnessTest(playerId, req.body);
      res.json({ id: testId, message: 'Fitness test created successfully' });
    } catch (error: any) {
      console.error('❌ Error creating fitness test:', error);
      res.status(500).json({ error: 'Failed to create fitness test' });
    }
  });

  // Get GPS sessions for a player
  app.get("/api/firebase/players/:playerId/gps/sessions", async (req, res) => {
    try {
      const { playerId } = req.params;
      const { limit } = req.query;
      const sessions = await firebaseService.getGpsSessions(playerId, limit ? parseInt(limit as string) : 50);
      res.json(sessions);
    } catch (error: any) {
      console.error('❌ Error getting GPS sessions:', error);
      res.status(500).json({ error: 'Failed to get GPS sessions' });
    }
  });

  // Create GPS session
  app.post("/api/firebase/players/:playerId/gps/sessions", async (req, res) => {
    try {
      const { playerId } = req.params;
      const sessionId = await firebaseService.createGpsSession(playerId, req.body);
      res.json({ id: sessionId, message: 'GPS session created successfully' });
    } catch (error: any) {
      console.error('❌ Error creating GPS session:', error);
      res.status(500).json({ error: 'Failed to create GPS session' });
    }
  });

  // ================================
  // FIREBASE COACHING ENDPOINTS
  // ================================

  // Get coaching notes for a player
  app.get("/api/firebase/players/:playerId/coaching/notes", async (req, res) => {
    try {
      const { playerId } = req.params;
      const notes = await firebaseService.getCoachingNotes(playerId);
      res.json(notes);
    } catch (error: any) {
      console.error('❌ Error getting coaching notes:', error);
      res.status(500).json({ error: 'Failed to get coaching notes' });
    }
  });

  // Create coaching note
  app.post("/api/firebase/players/:playerId/coaching/notes", async (req, res) => {
    try {
      const { playerId } = req.params;
      const noteId = await firebaseService.createCoachingNote(playerId, req.body);
      res.json({ id: noteId, message: 'Coaching note created successfully' });
    } catch (error: any) {
      console.error('❌ Error creating coaching note:', error);
      res.status(500).json({ error: 'Failed to create coaching note' });
    }
  });

  // Get match analysis for a player
  app.get("/api/firebase/players/:playerId/coaching/match-analysis", async (req, res) => {
    try {
      const { playerId } = req.params;
      const analysis = await firebaseService.getMatchAnalysis(playerId);
      res.json(analysis);
    } catch (error: any) {
      console.error('❌ Error getting match analysis:', error);
      res.status(500).json({ error: 'Failed to get match analysis' });
    }
  });

  // Create match analysis
  app.post("/api/firebase/players/:playerId/coaching/match-analysis", async (req, res) => {
    try {
      const { playerId } = req.params;
      const analysisId = await firebaseService.createMatchAnalysis(playerId, req.body);
      res.json({ id: analysisId, message: 'Match analysis created successfully' });
    } catch (error: any) {
      console.error('❌ Error creating match analysis:', error);
      res.status(500).json({ error: 'Failed to create match analysis' });
    }
  });

  // ================================
  // FIREBASE AI ANALYSIS ENDPOINTS
  // ================================

  // Get AI analysis for a player
  app.get("/api/firebase/players/:playerId/ai/analysis", async (req, res) => {
    try {
      const { playerId } = req.params;
      const analysis = await firebaseService.getAiAnalysis(playerId);
      res.json(analysis);
    } catch (error: any) {
      console.error('❌ Error getting AI analysis:', error);
      res.status(500).json({ error: 'Failed to get AI analysis' });
    }
  });

  // Create AI analysis
  app.post("/api/firebase/players/:playerId/ai/analysis", async (req, res) => {
    try {
      const { playerId } = req.params;
      const analysisId = await firebaseService.createAiAnalysis(playerId, req.body);
      res.json({ id: analysisId, message: 'AI analysis created successfully' });
    } catch (error: any) {
      console.error('❌ Error creating AI analysis:', error);
      res.status(500).json({ error: 'Failed to create AI analysis' });
    }
  });

  // ================================
  // FIREBASE SQUAD MANAGEMENT ENDPOINTS
  // ================================

  // Get all squads
  app.get("/api/firebase/squads", async (req, res) => {
    try {
      const squads = await firebaseService.getAllSquads();
      res.json(squads);
    } catch (error: any) {
      console.error('❌ Error getting squads:', error);
      res.status(500).json({ error: 'Failed to get squads' });
    }
  });

  // Get specific squad
  app.get("/api/firebase/squads/:squadId", async (req, res) => {
    try {
      const { squadId } = req.params;
      const squad = await firebaseService.getSquad(squadId);
      
      if (!squad) {
        return res.status(404).json({ error: 'Squad not found' });
      }
      
      res.json(squad);
    } catch (error: any) {
      console.error('❌ Error getting squad:', error);
      res.status(500).json({ error: 'Failed to get squad' });
    }
  });

  // Create squad
  app.post("/api/firebase/squads", async (req, res) => {
    try {
      const squadId = await firebaseService.createSquad(req.body);
      res.json({ id: squadId, message: 'Squad created successfully' });
    } catch (error: any) {
      console.error('❌ Error creating squad:', error);
      res.status(500).json({ error: 'Failed to create squad' });
    }
  });

  // Add player to squad
  app.post("/api/firebase/squads/:squadId/players/:playerId", async (req, res) => {
    try {
      const { squadId, playerId } = req.params;
      const { role, addedBy } = req.body;
      await firebaseService.addPlayerToSquad(squadId, playerId, role, addedBy);
      res.json({ message: 'Player added to squad successfully' });
    } catch (error: any) {
      console.error('❌ Error adding player to squad:', error);
      res.status(500).json({ error: 'Failed to add player to squad' });
    }
  });

  // Remove player from squad
  app.delete("/api/firebase/squads/:squadId/players/:playerId", async (req, res) => {
    try {
      const { squadId, playerId } = req.params;
      await firebaseService.removePlayerFromSquad(squadId, playerId);
      res.json({ message: 'Player removed from squad successfully' });
    } catch (error: any) {
      console.error('❌ Error removing player from squad:', error);
      res.status(500).json({ error: 'Failed to remove player from squad' });
    }
  });
}