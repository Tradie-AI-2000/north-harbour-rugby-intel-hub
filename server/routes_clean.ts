import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, and, sql } from "drizzle-orm";
import { db, pool } from "./db";
import { squads } from "@shared/schema";
import { northHarbourPlayers } from './northHarbourPlayers';
import { geminiAnalyst, type MatchAnalysisRequest } from "./geminiAnalysis";
import { DatabaseStorage } from "./storage";

const storage = new DatabaseStorage();

export function registerRoutes(app: Express): Server {
  // Get all players - Complete North Harbour Rugby roster
  app.get("/api/players", async (req, res) => {
    try {
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

  // Squad Management Routes
  
  // Create new squad
  app.post('/api/squads', async (req, res) => {
    try {
      const { name, matchDate, opponent, venue, notes } = req.body;
      
      const [squad] = await db.insert(squads).values({
        name,
        matchDate,
        opponent,
        venue,
        notes,
        startingXV: [],
        bench: [],
        unavailablePlayers: []
      }).returning();

      res.status(201).json(squad);
    } catch (error) {
      console.error('Error creating squad:', error);
      res.status(500).json({ error: 'Failed to create squad' });
    }
  });

  // Get all squads for user
  app.get('/api/squads', async (req, res) => {
    try {
      console.log('Attempting to fetch squads...');
      
      // Use raw SQL query as fallback for Drizzle ORM timeout issues
      const result = await pool.query('SELECT * FROM squads ORDER BY id');
      const userSquads = result.rows;
      
      console.log('Successfully fetched squads:', userSquads.length);
      res.json(userSquads);
    } catch (error) {
      console.error('Error fetching squads:', error);
      res.status(500).json({ error: 'Failed to fetch squads' });
    }
  });

  // Get squad details 
  app.get('/api/squads/:squadId', async (req, res) => {
    try {
      const squadId = parseInt(req.params.squadId);
      
      const [squad] = await db.select().from(squads).where(eq(squads.id, squadId));
      if (!squad) {
        return res.status(404).json({ error: 'Squad not found' });
      }

      res.json(squad);
    } catch (error) {
      console.error('Error fetching squad details:', error);
      res.status(500).json({ error: 'Failed to fetch squad details' });
    }
  });

  // Update squad with player selections
  app.put('/api/squads/:squadId', async (req, res) => {
    try {
      const squadId = parseInt(req.params.squadId);
      const { startingXV, bench, unavailablePlayers, name, matchDate, opponent, venue, notes } = req.body;

      const [updatedSquad] = await db.update(squads)
        .set({
          startingXV: startingXV || [],
          bench: bench || [],
          unavailablePlayers: unavailablePlayers || [],
          name,
          matchDate,
          opponent,
          venue,
          notes,
          updatedAt: new Date()
        })
        .where(eq(squads.id, squadId))
        .returning();

      if (!updatedSquad) {
        return res.status(404).json({ error: 'Squad not found' });
      }

      res.json(updatedSquad);
    } catch (error) {
      console.error('Error updating squad:', error);
      res.status(500).json({ error: 'Failed to update squad' });
    }
  });

  // Delete squad
  app.delete('/api/squads/:squadId', async (req, res) => {
    try {
      const squadId = parseInt(req.params.squadId);
      
      await db.delete(squads).where(eq(squads.id, squadId));

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting squad:', error);
      res.status(500).json({ error: 'Failed to delete squad' });
    }
  });





  // Gemini AI Analysis Routes
  app.post("/api/gemini/analyze-section", async (req, res) => {
    try {
      const { sectionId, matchData, teamStats, playerPerformances } = req.body;
      
      const analysisRequest = {
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

  // Sample analytics data
  app.get('/api/analytics/overview', (req, res) => {
    res.json({
      teamMetrics: {
        totalPlayers: northHarbourPlayers.length,
        activePlayers: northHarbourPlayers.filter(p => p.currentStatus === 'Fit').length,
        averageAge: 24.5,
        winRate: 0.67
      }
    });
  });

  // Team cohesion data
  app.get('/api/team/cohesion/twi-progression/2024', (req, res) => {
    res.json([
      { month: 'January', twiScore: 22.1, inSeasonCohesion: 485 },
      { month: 'February', twiScore: 23.4, inSeasonCohesion: 502 },
      { month: 'March', twiScore: 24.1, inSeasonCohesion: 512 }
    ]);
  });

  // Team performance overview
  app.get('/api/team/performance/overview', (req, res) => {
    res.json({
      winRate: 67,
      pointsFor: 385,
      pointsAgainst: 298,
      matchesPlayed: 12
    });
  });

  // Medical overview
  app.get('/api/team/medical/overview', (req, res) => {
    res.json({
      injuryRate: 6.4,
      playersAvailable: 42,
      totalPlayers: 45,
      averageRecovery: 12
    });
  });

  // Fitness overview
  app.get('/api/team/fitness/overview', (req, res) => {
    res.json({
      averageFitness: 89,
      trainingAttendance: 94,
      loadManagement: 'Optimal'
    });
  });

  // Try analysis season data
  app.get('/api/try-analysis/season/2024', (req, res) => {
    res.json([
      {
        teamName: "North Harbour",
        totalTries: 45,
        averagePerMatch: 3.2,
        homeAdvantage: 12,
        awayTries: 20,
        aggregatedZones: [
          { name: "Zone 1", value: 8, percentage: 17.8 },
          { name: "Zone 2", value: 12, percentage: 26.7 },
          { name: "Zone 3", value: 15, percentage: 33.3 },
          { name: "Zone 4", value: 10, percentage: 22.2 }
        ],
        aggregatedQuarters: [
          { name: "Q1", value: 8, percentage: 17.8 },
          { name: "Q2", value: 14, percentage: 31.1 },
          { name: "Q3", value: 12, percentage: 26.7 },
          { name: "Q4", value: 11, percentage: 24.4 }
        ],
        aggregatedPhases: [
          { name: "0-2 phases", value: 18, percentage: 40.0 },
          { name: "3-5 phases", value: 15, percentage: 33.3 },
          { name: "6+ phases", value: 12, percentage: 26.7 }
        ],
        aggregatedSources: [
          { name: "Set Piece", value: 22, percentage: 48.9 },
          { name: "Turnover", value: 12, percentage: 26.7 },
          { name: "Lineout", value: 8, percentage: 17.8 },
          { name: "Counter Attack", value: 3, percentage: 6.7 }
        ]
      }
    ]);
  });

  // AI Analysis endpoints for try patterns and trends
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

  // Save try analysis data endpoint
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
      
      // Validate required fields
      if (!matchId) {
        return res.status(400).json({ 
          error: 'Missing required field: matchId' 
        });
      }
      
      // Construct analysis data object
      const analysisData = {
        teamName,
        isNorthHarbour,
        analysisPerspective,
        tries: tries || [],
        zoneBreakdown: zoneBreakdown || {},
        quarterBreakdown: quarterBreakdown || {},
        phaseBreakdown: phaseBreakdown || {},
        sourceBreakdown: sourceBreakdown || {},
        aiAnalysis: aiAnalysis || ''
      };
      
      // Save to database
      const analysisJson = JSON.stringify(analysisData);
      const seasonValue = '2024';
      
      // First try to insert, if it fails due to conflict, update
      try {
        const result = await db.execute(sql`
          INSERT INTO try_analysis (match_id, season, team_name, analysis_data)
          VALUES (${matchId}, ${seasonValue}, ${teamName}, ${analysisJson})
          RETURNING id
        `);
        console.log('Successfully inserted new try analysis data');
      } catch (insertError: any) {
        if (insertError.code === '23505') { // Unique violation
          await db.execute(sql`
            UPDATE try_analysis 
            SET analysis_data = ${analysisJson}, updated_at = NOW()
            WHERE match_id = ${matchId} AND season = ${seasonValue}
          `);
          console.log('Successfully updated existing try analysis data');
        } else {
          throw insertError;
        }
      }
      
      console.log('Successfully saved try analysis data:', { matchId, teamName, dataSize: analysisJson.length });
      
      res.json({ 
        success: true, 
        message: 'Try analysis data saved successfully',
        id: `try_analysis_${Date.now()}`
      });
    } catch (error) {
      console.error('Error saving try analysis data:', error);
      res.status(500).json({ 
        error: 'Failed to save try analysis data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Populate database with North Harbour players
  app.post('/api/players/populate', async (req, res) => {
    try {
      const { northHarbourPlayers } = await import('./northHarbourPlayers');
      let insertedCount = 0;
      let updatedCount = 0;

      for (const playerData of northHarbourPlayers) {
        try {
          // Transform the data to match the database schema
          const dbPlayer = {
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
              weight: 85 + Math.floor(Math.random() * 30), // Random realistic weight
              height: 175 + Math.floor(Math.random() * 25), // Random realistic height
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
            gameStats: playerData.gameStats || [],
            skills: {
              ballHandling: playerData.skills?.ballHandling || 7,
              passing: playerData.skills?.passing || 7,
              kicking: playerData.skills?.kicking || 6,
              lineoutThrowing: playerData.skills?.lineoutThrowing || 6,
              scrummaging: playerData.skills?.scrummaging || 7,
              rucking: playerData.skills?.rucking || 7,
              defense: playerData.skills?.defense || 7,
              communication: playerData.skills?.communication || 7
            },
            status: {
              fitness: playerData.currentStatus === "Fit" ? "available" : "injured",
              medical: "cleared",
              availability: "available"
            },
            injuries: [],
            reports: [],
            activities: [],
            injuryHistory: [],
            trainingPrograms: [],
            videoAnalysis: []
          };

          // Check if player already exists
          const existingPlayer = await storage.getPlayer(playerData.id);
          
          if (existingPlayer) {
            // Update existing player
            await storage.updatePlayer(playerData.id, dbPlayer);
            updatedCount++;
          } else {
            // Create new player
            await storage.createPlayer(dbPlayer);
            insertedCount++;
          }
        } catch (playerError) {
          console.error(`Error processing player ${playerData.id}:`, playerError);
        }
      }

      res.json({
        success: true,
        message: `Database populated successfully`,
        inserted: insertedCount,
        updated: updatedCount,
        total: northHarbourPlayers.length
      });
    } catch (error) {
      console.error('Error populating players database:', error);
      res.status(500).json({
        error: 'Failed to populate players database',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  
  // Add WebSocket support
  if (typeof WebSocket !== 'undefined') {
    const { WebSocketServer } = require('ws');
    const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
    
    wss.on('connection', (ws: any) => {
      console.log('WebSocket client connected');
      
      ws.on('message', (data: any) => {
        try {
          const message = JSON.parse(data);
          console.log('Received WebSocket message:', message);
          
          // Echo the message back to the client
          ws.send(JSON.stringify({
            type: 'response',
            data: message,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });
      
      ws.on('error', (error: any) => {
        console.error('WebSocket error:', error);
      });
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to North Harbour Rugby Performance Hub',
        timestamp: new Date().toISOString()
      }));
    });
  }
  
  return httpServer;
}