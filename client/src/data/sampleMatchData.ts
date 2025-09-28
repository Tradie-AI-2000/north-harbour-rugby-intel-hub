// Sample match performance data extracted from the uploaded images
// North Harbour vs Opposition - Match Analysis

export const sampleMatchPerformance = {
  matchInfo: {
    id: "nh_vs_opp_2024_001",
    date: "2024-06-01",
    opponent: "Auckland",
    venue: "North Harbour Stadium",
    result: "Win",
    finalScore: "32-24",
    competition: "NPC"
  },
  
  teamStats: {
    // From Possession & Territory image
    possessionPercent: 43,
    territoryPercent: 49,
    attackingMinutes: 15.8,
    ballInPlayMinutes: 36.28,
    
    // From Carry Analysis images
    carriesOverGainlinePercent: 64,
    carriesOnGainlinePercent: 16,
    carriesBehindGainlinePercent: 21,
    carryEfficiencyPercent: 98,
    
    // Opposition Carry Analysis
    oppCarriesOverGainlinePercent: 56,
    oppCarriesOnGainlinePercent: 18,
    oppCarriesBehindGainlinePercent: 26,
    
    // Ruck Analysis
    ruckRetentionPercent: 99,
    breakdownSteals: 4,
    madeTacklePercent: 86,
    
    // Ruck Speed Analysis
    ruckSpeed0to3SecsPercent: 57,
    ruckSpeed3to6SecsPercent: 33,
    ruckSpeedOver6SecsPercent: 10,
    oppRuckSpeed0to3SecsPercent: 62,
    oppRuckSpeed3to6SecsPercent: 31,
    oppRuckSpeedOver6SecsPercent: 7,
    
    // Scrum Performance
    ownScrumWonPercent: 100,
    ownScrumCompletionPercent: 80,
    totalScrums: 12,
    scrumCompletionPercent: 58
  },
  
  playerPerformances: [
    // Top Performers from Ruck Contributions
    {
      playerId: "cameron_suafoa",
      playerName: "Cameron Suafoa",
      position: "Hooker",
      
      // Ruck Contributions
      ruckArrivals: 133,
      ruckFirst3: 126,
      cleanouts: 48,
      
      // Tackling
      tacklesMade: 17,
      tacklesMissed: 0,
      tacklesAttempted: 17,
      madeTacklePercent: 100,
      dominantTackles: 0,
      
      // Carries
      carries: 14,
      metresCarried: 0,
      defendersBeaten: 6,
      
      // Match rating
      overallRating: 8.5
    },
    {
      playerId: "shilo_klein",
      playerName: "Shilo Klein",
      position: "Prop",
      
      // Ruck Contributions  
      ruckArrivals: 59,
      ruckFirst3: 58,
      cleanouts: 5,
      
      // Tackling
      tacklesMade: 11,
      tacklesMissed: 0,
      tacklesAttempted: 11,
      madeTacklePercent: 100,
      
      // Carries
      carries: 6,
      metresCarried: 0,
      
      overallRating: 7.8
    },
    {
      playerId: "cam_christie",
      playerName: "Cam Christie",
      position: "Lock",
      
      // Ruck Contributions
      ruckArrivals: 19,
      ruckFirst3: 13,
      cleanouts: 8,
      
      // Tackling
      tacklesMade: 17,
      tacklesMissed: 0,
      tacklesAttempted: 17,
      madeTacklePercent: 100,
      
      // Carries
      carries: 6,
      metresCarried: 0,
      
      overallRating: 8.2
    },
    {
      playerId: "tristyn_cook",
      playerName: "Tristyn Cook",
      position: "Flanker",
      
      // Tackling
      tacklesMade: 20,
      tacklesMissed: 2,
      tacklesAttempted: 22,
      madeTacklePercent: 91,
      dominantTackles: 3,
      assistTackles: 2,
      
      overallRating: 8.7
    },
    {
      playerId: "kade_banks",
      playerName: "Kade Banks",
      position: "Winger",
      
      // Scoring
      triesScored: 2,
      pointsScored: 10,
      
      // Carries
      carries: 16,
      ballCarryMetres: 177,
      linebreaks: 3,
      linebreaks1stPhase: 3,
      defendersBeaten: 4,
      
      overallRating: 9.1
    },
    {
      playerId: "tane_edmed",
      playerName: "Tane Edmed",
      position: "Fly Half",
      
      // Kicking
      kicksInPlay: 7,
      kickingMetres: 215,
      goalKicking: "3/6",
      pointsScored: 7,
      
      // Carries
      carries: 0,
      tacklesMissed: 3,
      
      overallRating: 6.2
    },
    {
      playerId: "shaun_stevenson",
      playerName: "Shaun Stevenson",
      position: "Fullback",
      
      // Kicking
      kicksInPlay: 13,
      kickingMetres: 505,
      carrying22mExitPercent: 35,
      kicking22mExitPercent: 54,
      exit22mFailedPercent: 12,
      
      // Carries
      ballCarryMetres: 114,
      defendersBeaten: 6,
      offloads: 2,
      
      overallRating: 8.4
    }
  ]
};

export const matchAnalyticsSections = [
  {
    id: "possession_territory",
    title: "Possession & Territory",
    description: "Ball control and field position analysis"
  },
  {
    id: "attack_analysis", 
    title: "Attack Analysis",
    description: "Carry efficiency and gain line metrics"
  },
  {
    id: "defence_analysis",
    title: "Defence Analysis", 
    description: "Tackle success and defensive structure"
  },
  {
    id: "breakdown_analysis",
    title: "Breakdown Analysis",
    description: "Ruck speed and retention metrics"
  },
  {
    id: "set_piece",
    title: "Set Piece",
    description: "Scrum and lineout performance"
  },
  {
    id: "individual_performance",
    title: "Individual Performance",
    description: "Player-specific match contributions"
  },
  {
    id: "try_analysis",
    title: "Try Analysis",
    description: "Interactive try scoring patterns and zones"
  },
  {
    id: "video_analysis",
    title: "Video Analysis",
    description: "Match video events analysis from CSV uploads"
  }
];