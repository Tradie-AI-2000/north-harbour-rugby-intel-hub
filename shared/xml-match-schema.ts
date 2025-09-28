// XML Match Data Schema - Based on actual North Harbour vs Hawke's Bay XML structure
// Single source of truth for match performance data

export interface XMLMatchData {
  matchInfo: {
    homeTeam: string;
    awayTeam: string;
    venue: string;
    date: string;
    competition: string;
  };
  
  // Tab 1: Ball Movement & Possession (1,110 events)
  ballMovement: {
    teamStats: {
      ballRuns: { northHarbour: number; hawkesBay: number };
      teamBallMovement: { northHarbour: number; hawkesBay: number };
      possession: { northHarbour: number; hawkesBay: number };
      fieldPosition: {
        zone_22_50: number;
        zone_50_22: number;
        zone_22_GL: number;
        zone_GL_22: number;
      };
    };
    playerStats: PlayerBallMovement[];
  };
  
  // Tab 2: Breakdown Analysis (683 events)
  breakdowns: {
    teamStats: {
      ruckArrivals: { northHarbour: number; hawkesBay: number };
      breakdowns: { northHarbour: number; hawkesBay: number };
      turnoversWon: { northHarbour: number; hawkesBay: number };
      turnoversConceded: { northHarbour: number; hawkesBay: number };
    };
    playerStats: PlayerBreakdownStats[];
  };
  
  // Tab 3: Defence & Tackling (347 events)
  defence: {
    teamStats: {
      madeTackles: { northHarbour: number; hawkesBay: number };
      ineffectiveTackles: { northHarbour: number; hawkesBay: number };
      tackleSuccessRate: { northHarbour: number; hawkesBay: number };
    };
    playerStats: PlayerDefenceStats[];
  };
  
  // Tab 4: Attack & Breaks (98 events + try analysis)
  attack: {
    teamStats: {
      lineBreaks: { northHarbour: number; hawkesBay: number };
      tackleBreaks: { northHarbour: number; hawkesBay: number };
      triesScored: { northHarbour: number; hawkesBay: number };
      pointsScored: { northHarbour: number; hawkesBay: number };
    };
    playerStats: PlayerAttackStats[];
    tryAnalysis: TryEvent[];
  };
  
  // Tab 5: Set Piece (70 events)
  setPiece: {
    lineouts: {
      teamStats: LineoutStats;
      effectiveness: { northHarbour: number; hawkesBay: number };
    };
    scrums: {
      teamStats: ScrumStats;
      effectiveness: { northHarbour: number; hawkesBay: number };
    };
  };
  
  // Tab 6: Kicking Game (79 events)
  kicking: {
    teamStats: {
      kicksInPlay: { northHarbour: number; hawkesBay: number };
      goalKicks: { northHarbour: number; hawkesBay: number };
      defensiveExits: { northHarbour: number; hawkesBay: number };
    };
    playerStats: PlayerKickingStats[];
  };
  
  // Tab 7: Individual Performance
  individualPerformance: {
    topPerformers: {
      mostActive: PlayerSummary[];
      topTacklers: PlayerSummary[];
      topBallCarriers: PlayerSummary[];
      topBreakMakers: PlayerSummary[];
    };
    playerProfiles: PlayerProfile[];
  };
}

// Supporting interfaces
export interface PlayerBallMovement {
  playerId: string;
  playerName: string;
  team: "North Harbour" | "Hawke's Bay";
  ballRuns: number;
  metres: number;
  carries: number;
  fieldPosition: string[];
}

export interface PlayerBreakdownStats {
  playerId: string;
  playerName: string;
  team: "North Harbour" | "Hawke's Bay";
  ruckArrivals: number;
  turnoversWon: number;
  cleanOuts: number;
  secured: number;
}

export interface PlayerDefenceStats {
  playerId: string;
  playerName: string;
  team: "North Harbour" | "Hawke's Bay";
  madeTackles: number;
  ineffectiveTackles: number;
  tackleSuccessRate: number;
  dominantTackles: number;
}

export interface PlayerAttackStats {
  playerId: string;
  playerName: string;
  team: "North Harbour" | "Hawke's Bay";
  lineBreaks: number;
  tackleBreaks: number;
  offloads: number;
  triesScored: number;
  tryAssists: number;
}

export interface TryEvent {
  id: string;
  player: string;
  team: "North Harbour" | "Hawke's Bay";
  time: string;
  fieldPosition: string;
  phase: string;
  converted: boolean;
  assistedBy?: string[];
}

export interface LineoutStats {
  total: { northHarbour: number; hawkesBay: number };
  effective: { northHarbour: number; hawkesBay: number };
  steals: { northHarbour: number; hawkesBay: number };
  catchAndDrive: number;
  catchAndPass: number;
  offTheTop: number;
}

export interface ScrumStats {
  total: { northHarbour: number; hawkesBay: number };
  effective: { northHarbour: number; hawkesBay: number };
  penalties: { northHarbour: number; hawkesBay: number };
}

export interface PlayerKickingStats {
  playerId: string;
  playerName: string;
  team: "North Harbour" | "Hawke's Bay";
  kicksInPlay: number;
  goalKicks: number;
  goalKickSuccess: number;
  exits: number;
}

export interface PlayerSummary {
  playerId: string;
  playerName: string;
  team: "North Harbour" | "Hawke's Bay";
  totalEvents: number;
  keyStats: Record<string, number>;
}

export interface PlayerProfile {
  playerId: string;
  playerName: string;
  team: "North Harbour" | "Hawke's Bay";
  position: string;
  totalEvents: number;
  attackStats: PlayerAttackStats;
  defenceStats: PlayerDefenceStats;
  ballMovement: PlayerBallMovement;
  breakdown: PlayerBreakdownStats;
  kicking?: PlayerKickingStats;
}