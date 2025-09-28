/**
 * Player Value Calculation Engine
 * 
 * This module implements the "MoneyBall" concept for rugby players,
 * calculating their true value based on performance metrics, cohesion impact,
 * and position-specific requirements.
 */

// Player data structure for calculations
export interface PlayerValueMetrics {
  // Basic Info
  position: string;
  secondaryPosition?: string;
  weight: number; // kg
  contractValue: number; // USD
  
  // Performance Metrics (from CSV data)
  minutesPlayed: number;
  gamesPlayed: number;
  totalContributions: number;
  positiveContributions: number;
  negativeContributions: number;
  xFactorContributions: number;
  penaltyCount: number;
  
  // Physical Metrics
  sprintTime10m?: number; // seconds
  totalCarries?: number;
  dominantCarryPercent?: number;
  tackleCompletionPercent?: number;
  breakdownSuccessPercent?: number;
  triesScored?: number;
  tryAssists?: number;
  turnoversWon?: number;
  
  // Cohesion Factors (0-10 scale)
  attendanceScore: number;
  scScore: number; // Strength & Conditioning commitment
  medicalScore: number; // Robustness/availability
  personalityScore: number; // Leadership, team-fit, communication
}

// Position-specific non-negotiables and requirements
export const POSITIONAL_REQUIREMENTS = {
  'Prop': {
    skills: ['Excellent Scrum & Lineout', 'Strong Iron/Steel Carry', 'Early Skill Set Service', 'Dominant 10-60m Defense', '50min+ Capacity'],
    minWeight: 110, // kg
    minHeight: 180, // cm
    keyMetrics: ['scrumSuccess', 'carryDominance', 'lineoutSuccess']
  },
  'Hooker': {
    skills: ['World Class Throwing', 'Max Damage at Scrum', 'Hip Flexibility (Channel 1)', 'Can Play on Edge (like Back Row)', 'High Sprint Momentum', '80min Engine'],
    minWeight: 100,
    minHeight: 178,
    keyMetrics: ['lineoutThrowingSuccess', 'sprintMomentum', 'workRate']
  },
  'Lock': {
    skills: ['World Class Lineout IQ', 'Outstanding Aerial Skills', 'Scrum/Maul Endurance + Sprint', 'Brutal at Gain Line (Attack/Defense)', 'Early Skill Set Service', 'Huge Engine (Unseen Work)', 'Physical Minimum: 6\'7+, 118-122kg'],
    minWeight: 118,
    minHeight: 200,
    keyMetrics: ['lineoutSuccess', 'workRate', 'gainLineSuccess']
  },
  'Back Row': {
    skills: ['Brutal at Gain Line', 'Turnover Ability', 'Operates on the Edge (Attack/Defense)', 'Can Play in Midfield', 'High Sprint Momentum', 'Physical Minimum: 6ft+, 100kg+'],
    minWeight: 100,
    minHeight: 183,
    keyMetrics: ['turnovers', 'sprintMomentum', 'tackleSuccess']
  },
  'Scrum-half': {
    skills: ['Outstanding Pass (Both Hands)', 'Great Communication', 'Pressure-Relieving Kick', 'Acceleration & Speed', 'World Class Capacity', 'Defends Anywhere'],
    minWeight: 75,
    minHeight: 170,
    keyMetrics: ['passAccuracy', 'workRate', 'communication']
  },
  'First Five-Eighth': {
    skills: ['Controls Game & Tempo', 'World Class Pass (Both Hands)', 'Kicks off Either Foot', 'Shifts Ball to Space Quickly', 'Plays Flat', 'Challenges Defensive Line', 'Top-tier Communication'],
    minWeight: 80,
    minHeight: 175,
    keyMetrics: ['passAccuracy', 'kickingSuccess', 'gameManagement']
  },
  'Midfield': {
    skills: ['Brutal in Collisions', 'Quick Hands (In & Out)', 'Top-tier Communication', 'Kicks off Both Feet', 'Operates on Both Edges', 'Offloading Skills (KBA)', 'High Sprint Momentum', 'Speed'],
    minWeight: 90,
    minHeight: 180,
    keyMetrics: ['sprintMomentum', 'offloads', 'defensiveHits']
  },
  'Back 3': {
    skills: ['Brave', 'High Ball Skills (Low Error)', 'High Offload Count (KBA)', 'Robust 80min Capacity', 'Great Open Field Defender', 'Top End Speed & Acceleration', 'X-Factor Game Breaker', 'Varied Kicking Game'],
    minWeight: 85,
    minHeight: 178,
    keyMetrics: ['speed', 'highBallSuccess', 'xFactorContributions']
  }
};

// Calculate Work Efficiency Index (WEI)
export function calculateWEI(metrics: PlayerValueMetrics): number {
  if (metrics.totalContributions === 0) return 0;
  return ((metrics.positiveContributions - metrics.negativeContributions) / metrics.totalContributions) * 100;
}

// Calculate Work Rate (minutes per contribution)
export function calculateWorkRate(metrics: PlayerValueMetrics): number {
  if (metrics.totalContributions === 0) return 0;
  return metrics.minutesPlayed / metrics.totalContributions;
}

// Calculate Sprint Momentum (speed × weight)
export function calculateSprintMomentum(metrics: PlayerValueMetrics): number {
  if (!metrics.sprintTime10m || metrics.sprintTime10m === 0) return 0;
  const speed = 10 / metrics.sprintTime10m; // m/s
  return speed * metrics.weight;
}

// Calculate X-Factor percentage
export function calculateXFactorPercent(metrics: PlayerValueMetrics): number {
  if (metrics.totalContributions === 0) return 0;
  return (metrics.xFactorContributions / metrics.totalContributions) * 100;
}

// Calculate Positive Contribution percentage
export function calculatePositiveContributionPercent(metrics: PlayerValueMetrics): number {
  if (metrics.totalContributions === 0) return 0;
  return (metrics.positiveContributions / metrics.totalContributions) * 100;
}

// Calculate Penalty rate
export function calculatePenaltyRate(metrics: PlayerValueMetrics): number {
  if (metrics.minutesPlayed === 0) return 0;
  return (metrics.penaltyCount / (metrics.minutesPlayed / 80)) * 100; // Penalties per 80min game
}

// Calculate Cohesion Score (weighted average)
export function calculateCohesionScore(metrics: PlayerValueMetrics): number {
  // Weights can be adjusted based on coaching philosophy
  const weights = {
    attendance: 0.25,    // Reliability and commitment
    sc: 0.20,           // Physical preparation commitment
    medical: 0.25,      // Availability and robustness
    personality: 0.30   // Leadership, team-fit, coachability
  };
  
  return (
    (metrics.attendanceScore * weights.attendance) +
    (metrics.scScore * weights.sc) +
    (metrics.medicalScore * weights.medical) +
    (metrics.personalityScore * weights.personality)
  );
}

// Calculate Availability Score (games played vs total possible)
export function calculateAvailabilityScore(metrics: PlayerValueMetrics, totalPossibleGames: number = 12): number {
  return (metrics.gamesPlayed / totalPossibleGames) * 100;
}

// Main Player Value Calculation
export function calculatePlayerValue(metrics: PlayerValueMetrics): {
  totalValue: number;
  breakdown: {
    baseValue: number;
    performanceValue: number;
    physicalValue: number;
    cohesionValue: number;
    positionValue: number;
    availabilityValue: number;
  };
  calculations: {
    wei: number;
    workRate: number;
    sprintMomentum: number;
    xFactorPercent: number;
    positiveContributionPercent: number;
    penaltyRate: number;
    cohesionScore: number;
    availabilityScore: number;
  };
} {
  // Calculate all component metrics
  const wei = calculateWEI(metrics);
  const workRate = calculateWorkRate(metrics);
  const sprintMomentum = calculateSprintMomentum(metrics);
  const xFactorPercent = calculateXFactorPercent(metrics);
  const positiveContributionPercent = calculatePositiveContributionPercent(metrics);
  const penaltyRate = calculatePenaltyRate(metrics);
  const cohesionScore = calculateCohesionScore(metrics);
  const availabilityScore = calculateAvailabilityScore(metrics);

  // Base value - minimum professional rugby player value
  const baseValue = 50000;

  // Performance Value Component
  // Higher WEI = more value, efficient work rate = more value, X-factor = premium
  let performanceValue = 0;
  performanceValue += wei * 800; // WEI is major factor
  performanceValue += workRate < 3 ? (3 - workRate) * 8000 : 0; // Efficient work rate bonus
  performanceValue += xFactorPercent * 2000; // X-factor premium
  performanceValue -= penaltyRate > 5 ? (penaltyRate - 5) * 1000 : 0; // Penalty rate deduction

  // Physical Value Component
  // Sprint momentum for explosive players, position-specific bonuses
  let physicalValue = 0;
  physicalValue += sprintMomentum > 500 ? (sprintMomentum - 500) * 150 : 0;
  physicalValue += (metrics.tackleCompletionPercent || 0) > 85 ? 5000 : 0;
  physicalValue += (metrics.dominantCarryPercent || 0) > 10 ? 5000 : 0;

  // Cohesion Value Component
  // Team chemistry and reliability are crucial for sustained success
  const cohesionValue = cohesionScore * 7000;

  // Position-specific Value Component
  const positionRequirements = POSITIONAL_REQUIREMENTS[metrics.position] || POSITIONAL_REQUIREMENTS['Back Row'];
  let positionValue = 0;
  
  // Position-specific bonuses based on meeting requirements
  if (metrics.position === 'Hooker') {
    positionValue += sprintMomentum > 600 ? 8000 : 0; // High sprint momentum for hookers
    positionValue += workRate < 2.5 ? 5000 : 0; // Efficient hookers are valuable
  } else if (metrics.position === 'Lock') {
    positionValue += workRate < 3 ? 8000 : 0; // Engine requirement
    positionValue += metrics.weight >= positionRequirements.minWeight ? 5000 : -5000;
  } else if (metrics.position === 'Back Row') {
    positionValue += (metrics.turnoversWon || 0) * 2000; // Turnover ability
    positionValue += sprintMomentum > 550 ? 6000 : 0;
  } else if (metrics.position === 'First Five-Eighth') {
    positionValue += positiveContributionPercent > 90 ? 10000 : 0; // Decision making premium
    positionValue += penaltyRate < 3 ? 5000 : 0; // Low penalty rate crucial
  } else if (metrics.position.includes('Back 3')) {
    positionValue += xFactorPercent > 8 ? 12000 : 0; // X-factor game breakers
    positionValue += sprintMomentum > 450 ? 8000 : 0; // Speed premium
  }

  // Availability Value Component
  // Consistent availability is extremely valuable
  let availabilityValue = 0;
  availabilityValue += availabilityScore > 85 ? 8000 : 0;
  availabilityValue += availabilityScore > 95 ? 5000 : 0; // Bonus for exceptional availability

  // Calculate total value
  const totalValue = Math.round(
    baseValue + 
    performanceValue + 
    physicalValue + 
    cohesionValue + 
    positionValue + 
    availabilityValue
  );

  return {
    totalValue,
    breakdown: {
      baseValue: Math.round(baseValue),
      performanceValue: Math.round(performanceValue),
      physicalValue: Math.round(physicalValue),
      cohesionValue: Math.round(cohesionValue),
      positionValue: Math.round(positionValue),
      availabilityValue: Math.round(availabilityValue)
    },
    calculations: {
      wei: Number(wei.toFixed(1)),
      workRate: Number(workRate.toFixed(2)),
      sprintMomentum: Number(sprintMomentum.toFixed(0)),
      xFactorPercent: Number(xFactorPercent.toFixed(1)),
      positiveContributionPercent: Number(positiveContributionPercent.toFixed(1)),
      penaltyRate: Number(penaltyRate.toFixed(1)),
      cohesionScore: Number(cohesionScore.toFixed(1)),
      availabilityScore: Number(availabilityScore.toFixed(1))
    }
  };
}

// Value Analysis Classification
export function getValueAnalysis(calculatedValue: number, contractValue: number): {
  classification: string;
  ratio: number;
  description: string;
  colorClass: string;
} {
  const ratio = calculatedValue / contractValue;
  
  if (ratio > 1.3) {
    return {
      classification: 'Significantly Undervalued',
      ratio,
      description: 'This player provides exceptional value relative to their contract. Consider priority retention.',
      colorClass: 'bg-green-500 text-white'
    };
  } else if (ratio > 1.15) {
    return {
      classification: 'Undervalued',
      ratio,
      description: 'Player provides above-average value for their contract cost.',
      colorClass: 'bg-teal-500 text-white'
    };
  } else if (ratio >= 0.9) {
    return {
      classification: 'Fair Value',
      ratio,
      description: 'Contract value aligns well with calculated player value.',
      colorClass: 'bg-blue-500 text-white'
    };
  } else if (ratio >= 0.75) {
    return {
      classification: 'Slightly Overvalued',
      ratio,
      description: 'Player value is somewhat below contract cost. Monitor performance.',
      colorClass: 'bg-amber-500 text-white'
    };
  } else {
    return {
      classification: 'Overvalued',
      ratio,
      description: 'Player value significantly below contract cost. Review required.',
      colorClass: 'bg-red-500 text-white'
    };
  }
}

// Generate development recommendations based on calculated metrics
export function generateDevelopmentRecommendations(
  metrics: PlayerValueMetrics,
  calculations: ReturnType<typeof calculatePlayerValue>['calculations']
): string[] {
  const recommendations: string[] = [];
  
  // Performance-based recommendations
  if (calculations.wei < 70) {
    recommendations.push('Focus on decision-making under pressure to improve contribution efficiency');
  }
  
  if (calculations.workRate > 4) {
    recommendations.push('Increase involvement frequency - look for more opportunities to contribute');
  }
  
  if (calculations.penaltyRate > 6) {
    recommendations.push('Discipline training required - penalty rate above acceptable threshold');
  }
  
  if (calculations.xFactorPercent < 3) {
    recommendations.push('Develop game-breaking skills and ability to create attacking opportunities');
  }
  
  // Physical recommendations
  if (calculations.sprintMomentum < 500) {
    recommendations.push('Focus on explosive power development to increase sprint momentum');
  }
  
  // Cohesion recommendations
  if (calculations.cohesionScore < 7.5) {
    recommendations.push('Improve team integration - focus on attendance, communication, and leadership development');
  }
  
  // Position-specific recommendations
  const positionRequirements = POSITIONAL_REQUIREMENTS[metrics.position];
  if (positionRequirements) {
    if (metrics.position === 'Hooker' && calculations.sprintMomentum < 600) {
      recommendations.push('Hooker-specific: Develop athletic ability to play on the edge like a back row forward');
    }
    
    if (metrics.position === 'Lock' && calculations.workRate > 3) {
      recommendations.push('Lock-specific: Increase work rate to meet engine requirements for your position');
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Continue current development path - all key metrics within target ranges');
  }
  
  return recommendations;
}

// Market comparison utilities
export const MARKET_BENCHMARKS = {
  // Professional rugby salary ranges by position (USD)
  positionSalaryRanges: {
    'Prop': { min: 60000, avg: 85000, max: 120000 },
    'Hooker': { min: 65000, avg: 90000, max: 130000 },
    'Lock': { min: 70000, avg: 95000, max: 140000 },
    'Back Row': { min: 75000, avg: 100000, max: 150000 },
    'Scrum-half': { min: 80000, avg: 110000, max: 180000 },
    'First Five-Eighth': { min: 90000, avg: 130000, max: 220000 },
    'Midfield': { min: 70000, avg: 105000, max: 160000 },
    'Back 3': { min: 75000, avg: 110000, max: 190000 }
  },
  
  // Performance benchmarks
  performanceBenchmarks: {
    wei: { poor: 60, average: 75, excellent: 85 },
    workRate: { excellent: 2.5, average: 3.5, poor: 4.5 },
    cohesionScore: { poor: 6.5, average: 7.5, excellent: 8.5 },
    availabilityScore: { poor: 70, average: 85, excellent: 95 }
  }
};