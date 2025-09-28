import { z } from 'zod';

// PDF Match Report Schema - For Stats Perform Rugby Reports
// Maps to existing Attack Analysis and Defence Analysis dashboard tabs

// Team-level statistics extracted from PDF
export const pdfTeamStatsSchema = z.object({
  // Match Information
  matchId: z.string(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  homeScore: z.number(),
  awayScore: z.number(),
  matchDate: z.string(),
  venue: z.string(),
  
  // Attack Statistics (Page 3 - Attack section)
  attack: z.object({
    // Team-level indicators (percentages at top of attack section)
    carriesOverGainlinePercent: z.number(), // e.g., 64% for North Harbour
    carriesOnGainlinePercent: z.number(),   // e.g., 16%
    carriesBehindGainlinePercent: z.number(), // e.g., 21%
    carryEfficiencyPercent: z.number(),     // e.g., 98%
    
    // Aggregated team totals
    totalTries: z.number(),
    totalPoints: z.number(),
    totalCarries: z.number(),
    totalCarryMetres: z.number(),
    totalLinebreaks: z.number(),
    totalDefendersBeaten: z.number(),
    totalOffloads: z.number()
  }),
  
  // Defence Statistics (Page 3 - Defence section)  
  defence: z.object({
    // Team-level indicators
    oppCarriesOverGainlinePercent: z.number(), // Opposition's success against us
    oppCarriesOnGainlinePercent: z.number(),
    oppCarriesBehindGainlinePercent: z.number(),
    madeTacklePercent: z.number(), // e.g., 86%
    
    // Aggregated team totals
    totalTacklesMade: z.number(),
    totalTacklesMissed: z.number(),
    totalTacklesAttempted: z.number(),
    totalAssistTackles: z.number(),
    totalDominantTackles: z.number(),
    lineBreaksConceded: z.number(),
    carryMetresConceded: z.number(),
    offloadsConceded: z.number()
  }),
  
  // Additional sections (for future expansion)
  breakdown: z.object({
    ruckRetentionPercent: z.number(),
    breakdownSteals: z.number(),
    ruckSpeed: z.object({
      zeroToThreeSecsPercent: z.number(),
      threeToSixSecsPercent: z.number(),
      overSixSecsPercent: z.number()
    })
  }).optional(),
  
  setPiece: z.object({
    scrumWonPercent: z.number(),
    lineoutWonPercent: z.number(),
    lineoutSteals: z.number()
  }).optional(),
  
  // Metadata
  extractedAt: z.string(), // ISO timestamp
  extractedBy: z.string(),
  pdfFilename: z.string(),
  schemaVersion: z.number().default(1)
});

// Individual player statistics extracted from PDF
export const pdfPlayerStatsSchema = z.object({
  // Player identification
  playerId: z.string(),
  playerName: z.string(),
  position: z.string().optional(),
  team: z.enum(['home', 'away']),
  minutesPlayed: z.number().optional(),
  
  // Attack statistics (from Page 3 Attack section)
  attack: z.object({
    tries: z.number().default(0),
    points: z.number().default(0),
    ballCarries: z.number().default(0),
    ballCarryMetres: z.number().default(0),
    linebreaks: z.number().default(0),
    linebreaksFirstPhase: z.number().default(0),
    defendersBeaten: z.number().default(0),
    offloads: z.number().default(0)
  }),
  
  // Defence statistics (from Page 3 Defence section)
  defence: z.object({
    tacklesMade: z.number().default(0),
    tacklesMissed: z.number().default(0),
    tacklesAttempted: z.number().default(0),
    madeTacklePercent: z.number().default(0),
    assistTackles: z.number().default(0),
    dominantTackles: z.number().default(0)
  }),
  
  // Set piece contributions (Page 5)
  setPiece: z.object({
    lineoutThrows: z.number().default(0),
    lineoutThrowsSuccessful: z.number().default(0),
    scrumFeeds: z.number().default(0)
  }).optional(),
  
  // Breakdown contributions (Page 4)
  breakdown: z.object({
    ruckArrivals: z.number().default(0),
    cleanouts: z.number().default(0),
    breakdownSteals: z.number().default(0)
  }).optional()
});

// Complete PDF match report data structure
export const pdfMatchReportSchema = z.object({
  // Report metadata
  reportId: z.string(),
  matchId: z.string(),
  
  // Team statistics (both home and away)
  homeTeamStats: pdfTeamStatsSchema,
  awayTeamStats: pdfTeamStatsSchema,
  
  // All player statistics
  playerStats: z.array(pdfPlayerStatsSchema),
  
  // Processing information
  processingInfo: z.object({
    extractedSections: z.array(z.enum([
      'match_overview',
      'player_summary', 
      'attack_defence',
      'breakdown_kicking',
      'set_piece',
      'possessions',
      'play_styles'
    ])),
    extractionErrors: z.array(z.object({
      section: z.string(),
      error: z.string(),
      severity: z.enum(['warning', 'error'])
    })),
    extractionTime: z.number(), // milliseconds
    confidence: z.number().min(0).max(1) // Overall extraction confidence
  }),
  
  // File information
  originalFilename: z.string(),
  fileSize: z.number(),
  uploadedBy: z.string(),
  uploadedAt: z.string(),
  
  // System metadata
  createdAt: z.string(),
  lastUpdated: z.string()
});

// Types for use in the application
export type PDFTeamStats = z.infer<typeof pdfTeamStatsSchema>;
export type PDFPlayerStats = z.infer<typeof pdfPlayerStatsSchema>;
export type PDFMatchReport = z.infer<typeof pdfMatchReportSchema>;

// Validation helpers
export const validatePDFTeamStats = (data: unknown): PDFTeamStats => {
  return pdfTeamStatsSchema.parse(data);
};

export const validatePDFPlayerStats = (data: unknown): PDFPlayerStats => {
  return pdfPlayerStatsSchema.parse(data);
};

export const validatePDFMatchReport = (data: unknown): PDFMatchReport => {
  return pdfMatchReportSchema.parse(data);
};

// Data transformation utilities
export const transformToMatchPerformanceFormat = (pdfData: PDFMatchReport) => {
  // Transform PDF data to existing dashboard format
  const homeTeam = pdfData.homeTeamStats;
  const awayTeam = pdfData.awayTeamStats;
  
  return {
    teamStats: {
      // Map PDF attack data to existing dashboard fields
      carryEfficiencyPercent: homeTeam.attack.carryEfficiencyPercent,
      carriesOverGainlinePercent: homeTeam.attack.carriesOverGainlinePercent,
      carriesOnGainlinePercent: homeTeam.attack.carriesOnGainlinePercent,
      carriesBehindGainlinePercent: homeTeam.attack.carriesBehindGainlinePercent,
      
      // Map PDF defence data
      madeTacklePercent: homeTeam.defence.madeTacklePercent,
      oppCarriesOverGainlinePercent: homeTeam.defence.oppCarriesOverGainlinePercent,
      oppCarriesOnGainlinePercent: homeTeam.defence.oppCarriesOnGainlinePercent,
      oppCarriesBehindGainlinePercent: homeTeam.defence.oppCarriesBehindGainlinePercent,
      
      // Additional metrics
      totalTries: homeTeam.attack.totalTries,
      totalPoints: homeTeam.attack.totalPoints,
      totalTacklesMade: homeTeam.defence.totalTacklesMade,
      totalDominantTackles: homeTeam.defence.totalDominantTackles
    },
    
    playerPerformances: pdfData.playerStats.map(player => ({
      playerId: player.playerId,
      playerName: player.playerName,
      position: player.position,
      
      // Attack metrics
      ballCarryMetres: player.attack.ballCarryMetres,
      linebreaks: player.attack.linebreaks,
      tries: player.attack.tries,
      defendersBeaten: player.attack.defendersBeaten,
      
      // Defence metrics
      tacklesMade: player.defence.tacklesMade,
      tacklesMissed: player.defence.tacklesMissed,
      madeTacklePercent: player.defence.madeTacklePercent,
      dominantTackles: player.defence.dominantTackles
    }))
  };
};