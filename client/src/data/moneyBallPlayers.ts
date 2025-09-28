import { type PlayerValueMetrics } from "@/lib/playerValueCalculation";

export interface MoneyBallPlayer {
  id: string;
  name: string;
  photoUrl: string;
  position: string;
  secondaryPosition?: string;
  height: number;
  weight: number;
  club: string;
  teamHistory: string;
  dateSigned: string;
  offContractDate: string;
  contractValue: number;
  attendanceScore: number;
  scScore: number;
  medicalScore: number;
  personalityScore: number;
  gritNote: string;
  communityNote: string;
  familyBackground: string;
  minutesPlayed: number;
  totalContributions: number;
  positiveContributions: number;
  negativeContributions: number;
  penaltyCount: number;
  xFactorContributions: number;
  sprintTime10m: number;
}

// Direct CSV data from the uploaded file
export const moneyBallPlayersData: MoneyBallPlayer[] = [
  {
    id: "1",
    name: "James Parsons",
    photoUrl: "https://placehold.co/150x150/003366/FFFFFF?text=JP",
    position: "Hooker",
    secondaryPosition: "Back Row",
    height: 185,
    weight: 108,
    club: "Takapuna RFC",
    teamHistory: "North Harbour,Blues",
    dateSigned: "2022-11-01",
    offContractDate: "2025-10-31",
    contractValue: 85000,
    attendanceScore: 9.5,
    scScore: 8.8,
    medicalScore: 9.8,
    personalityScore: 9.2,
    gritNote: "Overcame a significant calf injury in 2023, showing incredible dedication during rehab to return ahead of schedule.",
    communityNote: "Actively volunteers with the \"Rugby in Schools\" program.",
    familyBackground: "Father was a professional builder, mother is a teacher. Strong work ethic instilled from a young age.",
    minutesPlayed: 580,
    totalContributions: 240,
    positiveContributions: 205,
    negativeContributions: 35,
    penaltyCount: 4,
    xFactorContributions: 15,
    sprintTime10m: 1.81
  },
  {
    id: "2",
    name: "Bryn Gatland",
    photoUrl: "https://placehold.co/150x150/003366/FFFFFF?text=BG",
    position: "First Five-Eighth",
    secondaryPosition: "Fullback",
    height: 178,
    weight: 88,
    club: "Massey RFC",
    teamHistory: "North Harbour,Highlanders,Chiefs",
    dateSigned: "2023-05-15",
    offContractDate: "2024-10-31",
    contractValue: 110000,
    attendanceScore: 9.8,
    scScore: 9.1,
    medicalScore: 8.5,
    personalityScore: 9.5,
    gritNote: "Transitioned from a different union, had to adapt quickly to new systems and prove himself to a new squad.",
    communityNote: "Passionate about mental health advocacy in sport.",
    familyBackground: "Comes from a high-performance rugby family, understands the pressures and demands of the professional environment.",
    minutesPlayed: 640,
    totalContributions: 310,
    positiveContributions: 280,
    negativeContributions: 30,
    penaltyCount: 2,
    xFactorContributions: 25,
    sprintTime10m: 1.72
  },
  {
    id: "3",
    name: "Lotu Inisi",
    photoUrl: "https://placehold.co/150x150/003366/FFFFFF?text=LI",
    position: "Back Row",
    secondaryPosition: "Lock",
    height: 190,
    weight: 112,
    club: "North Shore RFC",
    teamHistory: "North Harbour,Moana Pasifika",
    dateSigned: "2021-11-01",
    offContractDate: "2025-10-31",
    contractValue: 95000,
    attendanceScore: 9.0,
    scScore: 9.5,
    medicalScore: 9.5,
    personalityScore: 8.9,
    gritNote: "Known for playing through minor injuries and consistently putting the team first. Sacrificial mindset is a hallmark of his play.",
    communityNote: "Leads a local youth group and is a role model in his community.",
    familyBackground: "Deeply connected to his cultural roots, which is a source of his strength and motivation.",
    minutesPlayed: 720,
    totalContributions: 350,
    positiveContributions: 300,
    negativeContributions: 50,
    penaltyCount: 7,
    xFactorContributions: 18,
    sprintTime10m: 1.78
  },
  {
    id: "4",
    name: "Tane Edmed",
    photoUrl: "https://eu-cdn.rugbypass.com/webp-images/images/players/head/5575.png.webp?maxw=300",
    position: "First Five-Eighth",
    secondaryPosition: "Fullback",
    height: 180,
    weight: 85,
    club: "North Harbour Rugby",
    teamHistory: "Auckland,Blues Development,North Harbour",
    dateSigned: "2021-03-01",
    offContractDate: "2025-02-28",
    contractValue: 125000,
    attendanceScore: 4.2,
    scScore: 3.8,
    medicalScore: 2.1,
    personalityScore: 3.5,
    gritNote: "Concerning lack of commitment to rehabilitation protocols. Has missed 12 physiotherapy sessions this season and shows resistance to strength & conditioning requirements.",
    communityNote: "Limited community engagement since injury setbacks. Previously active but now increasingly withdrawn from team events and junior coaching commitments.",
    familyBackground: "Family support network remains strong but player appears to be struggling with pressure and expectations. Recent social media activity suggests frustration with contract situation.",
    minutesPlayed: 400,
    totalContributions: 145,
    positiveContributions: 98,
    negativeContributions: 47,
    penaltyCount: 18,
    xFactorContributions: 3,
    sprintTime10m: 2.15
  }
];

// Convert MoneyBall data to PlayerValueMetrics format
export function convertToPlayerValueMetrics(player: MoneyBallPlayer): PlayerValueMetrics {
  // Special handling for underperforming players like Tane Edmed
  const isUnderperforming = player.medicalScore < 5.0 || player.attendanceScore < 5.0;
  
  // Calculate derived metrics
  const totalCarries = Math.floor(player.totalContributions * 0.25);
  const dominantCarryPercent = isUnderperforming ? 
    (player.position === 'First Five-Eighth' ? 4.2 : 8.0) :
    (player.position === 'Back Row' ? 15.0 : 
     player.position === 'Hooker' ? 8.0 : 12.0);
  
  const tackleCompletionPercent = isUnderperforming ? 
    Math.max(65.0, 70.0 + (player.medicalScore * 2.0)) :
    85.0 + (player.medicalScore * 1.5);
    
  const breakdownSuccessPercent = isUnderperforming ?
    Math.max(60.0, 65.0 + (player.scScore * 1.8)) :
    88.0 + (player.scScore * 1.2);
  
  return {
    position: player.position,
    secondaryPosition: player.secondaryPosition,
    weight: player.weight,
    contractValue: player.contractValue,
    
    // Performance Metrics
    minutesPlayed: player.minutesPlayed,
    gamesPlayed: isUnderperforming ? Math.max(3, Math.floor(player.minutesPlayed / 120)) : 
                 (player.minutesPlayed > 600 ? 8 : 6),
    totalContributions: player.totalContributions,
    positiveContributions: player.positiveContributions,
    negativeContributions: player.negativeContributions,
    xFactorContributions: player.xFactorContributions,
    penaltyCount: player.penaltyCount,
    
    // Physical Metrics
    sprintTime10m: player.sprintTime10m,
    totalCarries,
    dominantCarryPercent,
    tackleCompletionPercent,
    breakdownSuccessPercent,
    triesScored: isUnderperforming ? 
      (player.position === 'First Five-Eighth' ? 0 : 1) :
      (player.position === 'First Five-Eighth' ? 3 : 
       player.position === 'Hooker' ? 1 : 2),
    tryAssists: isUnderperforming ?
      (player.position === 'First Five-Eighth' ? 1 : 0) :
      (player.position === 'First Five-Eighth' ? 8 : 2),
    turnoversWon: Math.floor(player.totalContributions * 0.08),
    
    // Cohesion Factors
    attendanceScore: player.attendanceScore,
    scScore: player.scScore,
    medicalScore: player.medicalScore,
    personalityScore: player.personalityScore
  };
}

// Get player by ID
export function getMoneyBallPlayer(id: string): MoneyBallPlayer | undefined {
  return moneyBallPlayersData.find(player => player.id === id);
}

// Get all MoneyBall players
export function getAllMoneyBallPlayers(): MoneyBallPlayer[] {
  return moneyBallPlayersData;
}