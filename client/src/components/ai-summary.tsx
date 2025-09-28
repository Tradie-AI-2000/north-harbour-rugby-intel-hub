import { useQuery } from "@tanstack/react-query";
import { Brain, Sparkles, TrendingUp, AlertTriangle, Target, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Player } from "@shared/schema";

interface AISummaryProps {
  playerId: string;
  player?: Player;
}

export default function AISummary({ playerId, player }: AISummaryProps) {
  const { data: aiAnalysis, isLoading, error } = useQuery({
    queryKey: [`/api/players/${playerId}/ai-analysis`],
    enabled: !!playerId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Performance Analysis
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-auto"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Generating intelligent performance insights...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !aiAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Performance Analysis
            <Badge variant="outline" className="ml-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by OpenAI
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">AI analysis temporarily unavailable</p>
            <p className="text-sm text-gray-500 mt-2">Analysis will be generated with real player data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Performance Analysis
            <Badge variant="outline" className="ml-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by OpenAI
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Performance Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold text-nh-navy">Performance Summary</h4>
            <p className="text-gray-700 leading-relaxed">{aiAnalysis.summary}</p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Performance Rating:</span>
                <span className="font-semibold">{aiAnalysis.performanceRating}/10</span>
              </div>
              <Progress value={aiAnalysis.performanceRating * 10} className="flex-1 max-w-24" />
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-3">
            <h4 className="font-semibold text-nh-navy flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Key Strengths
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {aiAnalysis.strengths?.map((strength: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Development Areas */}
          <div className="space-y-3">
            <h4 className="font-semibold text-nh-navy flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Development Areas
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {aiAnalysis.developmentAreas?.map((area: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="font-semibold text-nh-navy">AI Recommendations</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2">
                {aiAnalysis.recommendations?.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-blue-800">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Injury Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Injury Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Risk Level:</span>
            <Badge className={getRiskColor(aiAnalysis.injuryRisk?.level || 'moderate')}>
              {(aiAnalysis.injuryRisk?.level || 'moderate').toUpperCase()}
            </Badge>
          </div>
          
          {aiAnalysis.injuryRisk?.factors?.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Risk Factors:</h5>
              <div className="space-y-1">
                {aiAnalysis.injuryRisk.factors.map((factor: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiAnalysis.injuryRisk?.recommendations?.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Prevention Recommendations:</h5>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="space-y-1">
                  {aiAnalysis.injuryRisk.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-green-800">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}