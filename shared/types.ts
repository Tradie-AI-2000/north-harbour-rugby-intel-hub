export interface PlayerSummary {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number;
  status: 'available' | 'injured' | 'recovering' | 'unavailable';
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface BenchmarkComparison {
  metric: string;
  playerValue: number;
  benchmark: number;
  unit: string;
  percentage: number;
}

export interface AIAnalysis {
  summary: string;
  strengths: string[];
  developmentAreas: string[];
  recommendations: string[];
  confidenceScore: number;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType<{ playerId: string }>;
}

declare global {
  var FIRESTORE_EMULATOR_INITIALIZED: boolean;
}
