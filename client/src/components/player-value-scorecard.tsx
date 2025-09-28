import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign,
  TrendingUp,
  Zap,
  Heart,
  Star,
  Shield,
  Target,
  AlertTriangle,
  CheckCircle,
  Users,
  BarChart3,
  User,
  FileText
} from "lucide-react";
import { 
  calculatePlayerValue, 
  getValueAnalysis, 
  generateDevelopmentRecommendations,
  POSITIONAL_REQUIREMENTS,
  MARKET_BENCHMARKS,
  type PlayerValueMetrics 
} from "@/lib/playerValueCalculation";

interface PlayerValueScorecardProps {
  metrics: PlayerValueMetrics;
  className?: string;
}

// Stat Card Component
const StatCard = ({ 
  icon, 
  title, 
  value, 
  unit = '', 
  color = 'text-gray-100', 
  bgColor = 'bg-gray-800',
  subtitle = ''
}) => (
  <div className={`${bgColor} p-4 rounded-xl shadow-lg flex flex-col justify-between`}>
    <div className="flex items-center text-gray-400">
      {icon}
      <span className="ml-2 text-sm font-medium">{title}</span>
    </div>
    <div className={`text-3xl font-bold mt-2 ${color}`}>
      {value} <span className="text-lg font-medium text-gray-300">{unit}</span>
    </div>
    {subtitle && (
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    )}
  </div>
);

// Cohesion Gauge Component
const CohesionGauge = ({ score }: { score: number }) => {
  const percentage = score * 10;
  const color = percentage > 85 ? 'text-green-400' : percentage > 70 ? 'text-yellow-400' : 'text-red-400';
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90 w-32 h-32">
        <circle 
          cx="64" 
          cy="64" 
          r="45" 
          stroke="currentColor" 
          strokeWidth="10" 
          fill="transparent" 
          className="text-gray-700" 
        />
        <circle 
          cx="64" 
          cy="64" 
          r="45" 
          stroke="currentColor" 
          strokeWidth="10" 
          fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          className={`transition-all duration-1000 ease-in-out ${color}`} 
        />
      </svg>
      <div className={`absolute text-3xl font-bold ${color}`}>
        {score.toFixed(1)}
      </div>
    </div>
  );
};

// Value Analysis Component
const ValueAnalysis = ({ calculatedValue, contractValue }: { calculatedValue: number; contractValue: number }) => {
  const analysis = getValueAnalysis(calculatedValue, contractValue);

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <DollarSign className="mr-2" /> Value Analysis
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-400">Contract Value</p>
          <p className="text-2xl font-bold text-white">${contractValue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Calculated Value</p>
          <p className="text-2xl font-bold text-green-400">${calculatedValue.toLocaleString()}</p>
        </div>
      </div>
      <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${analysis.colorClass}`}>
        {analysis.classification}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        {analysis.description}
      </p>
      <div className="mt-2 text-center">
        <span className="text-sm text-gray-400">Value Ratio: </span>
        <span className="font-bold text-white">{analysis.ratio.toFixed(2)}x</span>
      </div>
    </div>
  );
};

// Value Breakdown Component
const ValueBreakdown = ({ breakdown }: { breakdown: any }) => {
  const total = breakdown.baseValue + breakdown.performanceValue + breakdown.physicalValue + 
                breakdown.cohesionValue + breakdown.positionValue + breakdown.availabilityValue;

  const components = [
    { name: 'Base Value', value: breakdown.baseValue, color: 'bg-gray-600' },
    { name: 'Performance', value: breakdown.performanceValue, color: 'bg-blue-500' },
    { name: 'Physical', value: breakdown.physicalValue, color: 'bg-green-500' },
    { name: 'Cohesion', value: breakdown.cohesionValue, color: 'bg-purple-500' },
    { name: 'Position', value: breakdown.positionValue, color: 'bg-orange-500' },
    { name: 'Availability', value: breakdown.availabilityValue, color: 'bg-teal-500' }
  ];

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <BarChart3 className="mr-2" /> Value Breakdown
      </h3>
      <div className="space-y-3">
        {components.map((component, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{component.name}</span>
              <span className="text-white font-medium">${component.value.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${component.color}`} 
                style={{ width: `${(component.value / total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex justify-between font-bold">
          <span className="text-gray-300">Total Value</span>
          <span className="text-white">${total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// Performance Metrics Component
const PerformanceMetrics = ({ calculations }: { calculations: any }) => {
  const getScoreColor = (value: number, benchmarks: any, reverse = false) => {
    if (reverse) {
      return value <= benchmarks.excellent ? 'text-green-400' : 
             value <= benchmarks.average ? 'text-yellow-400' : 'text-red-400';
    }
    return value >= benchmarks.excellent ? 'text-green-400' : 
           value >= benchmarks.average ? 'text-yellow-400' : 'text-red-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        icon={<TrendingUp size={20}/>} 
        title="Work Efficiency Index" 
        value={calculations.wei} 
        unit="%" 
        color={getScoreColor(calculations.wei, MARKET_BENCHMARKS.performanceBenchmarks.wei)}
        subtitle="Positive vs Negative Contributions"
      />
      <StatCard 
        icon={<Heart size={20}/>} 
        title="Work Rate" 
        value={calculations.workRate} 
        unit="min/contrib" 
        color={getScoreColor(calculations.workRate, MARKET_BENCHMARKS.performanceBenchmarks.workRate, true)}
        subtitle="Minutes per Contribution"
      />
      <StatCard 
        icon={<Zap size={20}/>} 
        title="Sprint Momentum" 
        value={calculations.sprintMomentum} 
        unit="kg·m/s" 
        color={calculations.sprintMomentum > 600 ? 'text-orange-400' : 'text-blue-400'}
        subtitle="Explosive Power Index"
      />
      <StatCard 
        icon={<Star size={20}/>} 
        title="X-Factor" 
        value={calculations.xFactorPercent} 
        unit="%" 
        color="text-purple-400"
        subtitle="Game-Breaking Contributions"
      />
    </div>
  );
};

// Positional Requirements Component
const PositionalRequirements = ({ position }: { position: string }) => {
  const positionKey = position.includes('-') ? position.split('-')[1] : position;
  const requirements = POSITIONAL_REQUIREMENTS[positionKey] || POSITIONAL_REQUIREMENTS['Back Row'];

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
        <Shield className="mr-2" /> Positional Non-Negotiables: 
        <span className="text-blue-400 ml-2">{position}</span>
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {requirements.skills.map((skill, index) => (
          <li key={index} className="flex items-center text-sm">
            <CheckCircle size={16} className="text-green-400 mr-2 flex-shrink-0"/>
            <span className="text-gray-300">{skill}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Development Focus Component
const DevelopmentFocus = ({ recommendations }: { recommendations: string[] }) => (
  <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
      <Target className="mr-2 text-yellow-400" /> Development Focus
    </h3>
    <ul className="space-y-2">
      {recommendations.map((rec, index) => (
        <li key={index} className="flex items-start text-sm">
          <AlertTriangle size={16} className="text-yellow-400 mr-2 flex-shrink-0 mt-0.5"/>
          <span className="text-gray-300">{rec}</span>
        </li>
      ))}
    </ul>
  </div>
);

// Main Scorecard Component
export default function PlayerValueScorecard({ metrics, className = "" }: PlayerValueScorecardProps) {
  const valueCalculation = calculatePlayerValue(metrics);
  const recommendations = generateDevelopmentRecommendations(metrics, valueCalculation.calculations);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Cohesion Score */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">Player Value Analysis</h2>
          <p className="text-gray-400">
            Comprehensive assessment combining performance metrics, cohesion impact, and market value
          </p>
        </div>
        <div className="text-center">
          <CohesionGauge score={valueCalculation.calculations.cohesionScore} />
          <p className="text-sm font-semibold text-gray-300 mt-2">Cohesion Score</p>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <PerformanceMetrics calculations={valueCalculation.calculations} />

      {/* Value Analysis and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ValueAnalysis 
          calculatedValue={valueCalculation.totalValue} 
          contractValue={metrics.contractValue} 
        />
        <ValueBreakdown breakdown={valueCalculation.breakdown} />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={<Users size={20}/>} 
          title="Positive Contributions" 
          value={valueCalculation.calculations.positiveContributionPercent} 
          unit="%" 
          color="text-green-400"
          bgColor="bg-green-900/30"
        />
        <StatCard 
          icon={<AlertTriangle size={20}/>} 
          title="Penalty Rate" 
          value={valueCalculation.calculations.penaltyRate} 
          unit="per 80min" 
          color={valueCalculation.calculations.penaltyRate > 5 ? 'text-red-400' : 'text-green-400'}
          bgColor="bg-orange-900/30"
        />
        <StatCard 
          icon={<CheckCircle size={20}/>} 
          title="Availability" 
          value={valueCalculation.calculations.availabilityScore} 
          unit="%" 
          color={valueCalculation.calculations.availabilityScore > 85 ? 'text-green-400' : 'text-yellow-400'}
          bgColor="bg-blue-900/30"
        />
      </div>

      {/* Positional Requirements */}
      <PositionalRequirements position={metrics.position} />

      {/* Development Recommendations */}
      <DevelopmentFocus recommendations={recommendations} />

      {/* Market Context */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <BarChart3 className="mr-2" /> Market Context
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {(() => {
            const positionRange = MARKET_BENCHMARKS.positionSalaryRanges[metrics.position] || 
                                 MARKET_BENCHMARKS.positionSalaryRanges['Back Row'];
            return (
              <>
                <div>
                  <p className="text-sm text-gray-400">Position Min</p>
                  <p className="text-lg font-bold text-red-300">${positionRange.min.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Position Average</p>
                  <p className="text-lg font-bold text-yellow-300">${positionRange.avg.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Position Max</p>
                  <p className="text-lg font-bold text-green-300">${positionRange.max.toLocaleString()}</p>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}