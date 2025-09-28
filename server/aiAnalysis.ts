import OpenAI from "openai";
import type { Player, GPSData } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  developmentAreas: string[];
  recommendations: string[];
  injuryRisk: {
    level: "low" | "moderate" | "high";
    factors: string[];
    recommendations: string[];
  };
  performanceRating: number; // 1-10 scale
  confidenceScore: number; // 0-1 scale
}

export async function generatePlayerAnalysis(
  player: Player,
  gpsData?: GPSData[]
): Promise<AIAnalysisResult> {
  try {
    const playerData = {
      name: `${player.personalDetails?.firstName} ${player.personalDetails?.lastName}`,
      position: player.rugbyProfile?.primaryPosition || "Unknown",
      age: calculateAge(player.personalDetails?.dateOfBirth),
      physicalMetrics: {
        height: player.personalDetails?.height,
        weight: player.personalDetails?.weight,
        fitnessLevel: player.status?.fitness
      },
      skills: player.skills,
      gameStats: player.gameStats?.slice(-5) || [], // Last 5 games
      physicalAttributes: player.physicalAttributes?.slice(-3) || [], // Last 3 assessments
      injuries: player.injuries?.slice(-3) || [], // Recent injuries
      gpsMetrics: gpsData ? summarizeGPSData(gpsData) : null
    };

    const prompt = `Analyze this North Harbour Rugby player's performance data and provide comprehensive insights:

Player: ${playerData.name}
Position: ${playerData.position}
Age: ${playerData.age}

Physical Metrics:
- Height: ${playerData.physicalMetrics.height}cm
- Weight: ${playerData.physicalMetrics.weight}kg
- Fitness Status: ${playerData.physicalMetrics.fitnessLevel}

Skills Assessment (1-10 scale):
${playerData.skills ? Object.entries(playerData.skills).map(([skill, rating]) => `- ${skill}: ${rating}/10`).join('\n') : 'No skills data available'}

Recent Game Statistics:
${playerData.gameStats.length > 0 ? playerData.gameStats.map(game => 
  `- ${game.opponent}: ${game.tries} tries, ${game.tackles} tackles, ${game.lineouts} lineouts`
).join('\n') : 'No recent game data available'}

Recent Physical Assessments:
${playerData.physicalAttributes.length > 0 ? playerData.physicalAttributes.map(assessment => 
  `- Weight: ${assessment.weight}kg, Body Fat: ${assessment.bodyFat}%, Lean Mass: ${assessment.leanMass}kg`
).join('\n') : 'No recent physical assessments'}

Injury History:
${playerData.injuries.length > 0 ? playerData.injuries.map(injury => 
  `- ${injury.type}: ${injury.severity} (${injury.status})`
).join('\n') : 'No recent injuries'}

GPS Performance Data:
${playerData.gpsMetrics ? `
- Average Distance: ${playerData.gpsMetrics.avgDistance}km
- Average Speed: ${playerData.gpsMetrics.avgSpeed}km/h
- Player Load: ${playerData.gpsMetrics.avgPlayerLoad}
- Sprint Count: ${playerData.gpsMetrics.avgSprints}
` : 'GPS data not available'}

Provide analysis in JSON format with:
{
  "summary": "2-3 sentence overview of player's current performance level",
  "strengths": ["list of 3-5 key strengths"],
  "developmentAreas": ["list of 3-5 areas for improvement"],
  "recommendations": ["list of 3-5 specific actionable recommendations"],
  "injuryRisk": {
    "level": "low/moderate/high",
    "factors": ["risk factors identified"],
    "recommendations": ["injury prevention recommendations"]
  },
  "performanceRating": 7.5,
  "confidenceScore": 0.85
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert rugby performance analyst with deep knowledge of player development, injury prevention, and sports science. Provide detailed, actionable insights based on the data provided. Respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      summary: analysis.summary || "Analysis unavailable",
      strengths: analysis.strengths || [],
      developmentAreas: analysis.developmentAreas || [],
      recommendations: analysis.recommendations || [],
      injuryRisk: {
        level: analysis.injuryRisk?.level || "moderate",
        factors: analysis.injuryRisk?.factors || [],
        recommendations: analysis.injuryRisk?.recommendations || []
      },
      performanceRating: Math.max(1, Math.min(10, analysis.performanceRating || 6)),
      confidenceScore: Math.max(0, Math.min(1, analysis.confidenceScore || 0.7))
    };

  } catch (error) {
    console.error("AI analysis failed:", error);
    throw new Error("Failed to generate AI analysis");
  }
}

export async function generateMatchAnalysis(
  players: Player[],
  matchData: any
): Promise<{
  teamPerformance: string;
  keyInsights: string[];
  tacticalRecommendations: string[];
  playerHighlights: { playerId: string; highlight: string }[];
}> {
  try {
    const prompt = `Analyze this rugby match performance for North Harbour Rugby:

Match Details:
- Opponent: ${matchData.opponent || "Unknown"}
- Result: ${matchData.result || "Unknown"}
- Date: ${matchData.date || "Recent"}

Team Statistics:
- Total Tries: ${matchData.tries || 0}
- Total Tackles: ${matchData.tackles || 0}
- Possession: ${matchData.possession || "Unknown"}%
- Territory: ${matchData.territory || "Unknown"}%

Key Players Performance:
${players.slice(0, 5).map(player => 
  `- ${player.personalDetails?.firstName} ${player.personalDetails?.lastName} (${player.rugbyProfile?.primaryPosition})`
).join('\n')}

Provide tactical analysis in JSON format with:
{
  "teamPerformance": "Overall team performance summary",
  "keyInsights": ["3-5 key insights from the match"],
  "tacticalRecommendations": ["3-5 tactical recommendations for future matches"],
  "playerHighlights": [{"playerId": "player_id", "highlight": "specific performance note"}]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert rugby tactical analyst. Provide detailed match analysis and tactical recommendations. Respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    return JSON.parse(response.choices[0].message.content || '{}');

  } catch (error) {
    console.error("Match analysis failed:", error);
    throw new Error("Failed to generate match analysis");
  }
}

export async function generateInjuryPrediction(
  player: Player,
  gpsData?: GPSData[]
): Promise<{
  riskLevel: "low" | "moderate" | "high";
  riskFactors: string[];
  preventionRecommendations: string[];
  monitoringPoints: string[];
  confidenceScore: number;
}> {
  try {
    const recentTrainingLoad = gpsData ? calculateTrainingLoad(gpsData) : null;
    
    const prompt = `Analyze injury risk for this rugby player:

Player: ${player.personalDetails?.firstName} ${player.personalDetails?.lastName}
Position: ${player.rugbyProfile?.primaryPosition}
Age: ${calculateAge(player.personalDetails?.dateOfBirth)}

Recent Training Load:
${recentTrainingLoad ? `
- Weekly Distance: ${recentTrainingLoad.weeklyDistance}km
- Average Player Load: ${recentTrainingLoad.avgPlayerLoad}
- High-Intensity Count: ${recentTrainingLoad.highIntensityCount}
- Training Days: ${recentTrainingLoad.trainingDays}
` : 'Training load data not available'}

Injury History:
${player.injuries?.slice(-5).map(injury => 
  `- ${injury.type}: ${injury.severity} (${injury.status})`
).join('\n') || 'No recent injuries'}

Physical Status:
- Current Fitness: ${player.status?.fitness}
- Medical Status: ${player.status?.medical}

Provide injury risk assessment in JSON format:
{
  "riskLevel": "low/moderate/high",
  "riskFactors": ["list of identified risk factors"],
  "preventionRecommendations": ["specific prevention strategies"],
  "monitoringPoints": ["areas to monitor closely"],
  "confidenceScore": 0.85
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a sports medicine expert specializing in rugby injury prevention. Provide evidence-based risk assessments. Respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6
    });

    return JSON.parse(response.choices[0].message.content || '{}');

  } catch (error) {
    console.error("Injury prediction failed:", error);
    throw new Error("Failed to generate injury prediction");
  }
}

// Helper functions
function calculateAge(dateOfBirth?: string): number {
  if (!dateOfBirth) return 0;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  return Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function summarizeGPSData(gpsData: GPSData[]) {
  if (!gpsData.length) return null;
  
  return {
    avgDistance: (gpsData.reduce((sum, session) => sum + session.totalDistance, 0) / gpsData.length / 1000).toFixed(1),
    avgSpeed: (gpsData.reduce((sum, session) => sum + session.averageSpeed, 0) / gpsData.length).toFixed(1),
    avgPlayerLoad: Math.round(gpsData.reduce((sum, session) => sum + session.playerLoad, 0) / gpsData.length),
    avgSprints: Math.round(gpsData.reduce((sum, session) => sum + session.sprintCount, 0) / gpsData.length)
  };
}

function calculateTrainingLoad(gpsData: GPSData[]) {
  const weeklyData = gpsData.filter(session => {
    const sessionDate = new Date(session.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  });

  return {
    weeklyDistance: (weeklyData.reduce((sum, session) => sum + session.totalDistance, 0) / 1000).toFixed(1),
    avgPlayerLoad: Math.round(weeklyData.reduce((sum, session) => sum + session.playerLoad, 0) / weeklyData.length),
    highIntensityCount: weeklyData.reduce((sum, session) => sum + session.sprintCount, 0),
    trainingDays: weeklyData.length
  };
}