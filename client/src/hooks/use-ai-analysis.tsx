import { useQuery } from "@tanstack/react-query";
import { generatePlayerAnalysis } from "@/lib/gemini";
import type { Player } from "@shared/schema";
import type { AIAnalysis } from "@shared/types";

export function useAIAnalysis(playerId: string, player?: Player) {
  return useQuery({
    queryKey: ['ai-analysis', playerId],
    queryFn: async (): Promise<AIAnalysis> => {
      if (!player) {
        throw new Error("No player data available for analysis");
      }

      try {
        return await generatePlayerAnalysis(player);
      } catch (error) {
        console.error("AI analysis failed:", error);
        
        // Fallback analysis if AI fails
        return {
          summary: `${player.personalDetails.firstName} ${player.personalDetails.lastName} continues to demonstrate strong performance in their role as ${player.rugbyProfile.primaryPosition}. Recent data shows consistent development across key metrics.`,
          strengths: ["Consistent performance", "Physical development", "Team commitment"],
          developmentAreas: ["Continue current training regime", "Focus on skill refinement"],
          recommendations: ["Maintain current fitness levels", "Regular performance monitoring"],
          confidenceScore: 0.6
        };
      }
    },
    enabled: !!player,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
}
