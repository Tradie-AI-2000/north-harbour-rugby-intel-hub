import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Users, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  MessageSquare,
  Shield
} from "lucide-react";
import { type PlayerValueMetrics } from "@/lib/playerValueCalculation";

interface AIPlayerAnalysisProps {
  metrics: PlayerValueMetrics;
  playerName: string;
}

interface AIAnalysis {
  overallAssessment: {
    status: "critical" | "concerning" | "stable" | "excellent";
    summary: string;
    riskLevel: "high" | "medium" | "low";
  };
  valueAnalysis: {
    contractEfficiency: number;
    marketValue: number;
    recommendation: string;
    financialImpact: string;
  };
  developmentPlan: {
    priority: "immediate" | "urgent" | "standard";
    keyAreas: string[];
    timeline: string;
    resources: {
      medical: string[];
      performance: string[];
      support: string[];
    };
  };
  resigningConsiderations: {
    pros: string[];
    cons: string[];
    recommendation: "release" | "restructure" | "retain" | "monitor";
    contractSuggestion: string;
  };
  teamImpact: {
    cohesionEffect: "negative" | "neutral" | "positive";
    leadershipInfluence: string;
    cultureAlignment: number;
  };
}

export default function AIPlayerAnalysis({ metrics, playerName }: AIPlayerAnalysisProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateAnalysis();
  }, [metrics]);

  const generateAnalysis = async () => {
    setIsGenerating(true);
    
    // Simulate AI analysis based on metrics
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const isUnderperforming = metrics.attendanceScore < 5.0 || metrics.medicalScore < 5.0;
    const contractEfficiency = (metrics.totalContributions / (metrics.contractValue / 1000)) * 10;
    
    const aiAnalysis: AIAnalysis = {
      overallAssessment: {
        status: isUnderperforming ? "critical" : "stable",
        summary: isUnderperforming 
          ? `${playerName} is significantly underperforming contract expectations with concerning attendance and medical compliance issues. Current contribution-to-cost ratio indicates poor value for investment.`
          : `${playerName} is meeting contract expectations with solid performance metrics and good team integration.`,
        riskLevel: isUnderperforming ? "high" : "low"
      },
      valueAnalysis: {
        contractEfficiency: Math.round(contractEfficiency * 10) / 10,
        marketValue: Math.round(metrics.contractValue * (isUnderperforming ? 0.4 : 0.8)),
        recommendation: isUnderperforming 
          ? "Immediate contract review required - current performance does not justify $125k investment"
          : "Contract value aligned with performance output",
        financialImpact: isUnderperforming
          ? `Estimated $75k overpayment this season. ROI: ${Math.round(contractEfficiency * 100)}% of contract value delivered.`
          : "Contract delivering expected ROI with positive trajectory"
      },
      developmentPlan: {
        priority: isUnderperforming ? "immediate" : "standard",
        keyAreas: isUnderperforming 
          ? ["Medical Compliance", "Attendance Accountability", "Mental Health Support", "Fitness Rehabilitation", "Leadership Re-engagement"]
          : ["Skill Enhancement", "Leadership Development", "Tactical Awareness"],
        timeline: isUnderperforming ? "6-week intensive intervention" : "Season-long development",
        resources: {
          medical: isUnderperforming 
            ? ["Daily physio check-ins", "Sports psychologist", "Compliance monitoring system", "Medical liaison officer"]
            : ["Standard physio program", "Injury prevention protocols"],
          performance: isUnderperforming
            ? ["1-on-1 coaching sessions", "Modified training program", "Fitness rebuilding plan", "Video analysis"]
            : ["Advanced skills coaching", "Leadership training", "Tactical development"],
          support: isUnderperforming
            ? ["Player welfare officer", "Family liaison", "Mentorship program", "Career counseling"]
            : ["Standard player support", "Community engagement opportunities"]
        }
      },
      resigningConsiderations: {
        pros: isUnderperforming 
          ? ["Young age with potential upside", "Previous high performance history", "First Five-Eighth position value"]
          : ["Consistent performer", "Good culture fit", "Leadership potential", "Position flexibility"],
        cons: isUnderperforming
          ? ["Poor medical compliance", "Attendance issues", "High salary for output", "Negative team culture impact", "Injury concerns", "Attitude problems"]
          : ["Market competition for position", "Salary expectations rising"],
        recommendation: isUnderperforming ? "restructure" : "retain",
        contractSuggestion: isUnderperforming 
          ? "Performance-based contract: $60k base + $40k performance incentives. Medical/attendance clauses mandatory."
          : "Standard renewal with moderate increase reflecting performance"
      },
      teamImpact: {
        cohesionEffect: isUnderperforming ? "negative" : "positive",
        leadershipInfluence: isUnderperforming 
          ? "Concerning withdrawal from leadership responsibilities. Setting poor example for junior players regarding professionalism."
          : "Positive leadership influence with good mentorship of younger players",
        cultureAlignment: isUnderperforming ? 25 : 85
      }
    };

    setAnalysis(aiAnalysis);
    setIsGenerating(false);
  };

  if (isGenerating) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-6 w-6 text-nh-red animate-pulse" />
            <div className="text-lg font-medium">AI Analysis in Progress...</div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-2 bg-gray-200 rounded animate-pulse" />
            <div className="h-2 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-2 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      case "concerning": return "text-orange-600 bg-orange-50 border-orange-200";
      case "stable": return "text-blue-600 bg-blue-50 border-blue-200";
      case "excellent": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "medium": return <Clock className="h-5 w-5 text-orange-500" />;
      case "low": return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-nh-red" />
          <h2 className="text-2xl font-bold text-nh-navy">AI Performance Analysis</h2>
        </div>
        <Button variant="outline" size="sm" onClick={generateAnalysis}>
          Refresh Analysis
        </Button>
      </div>

      {/* Overall Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getRiskIcon(analysis.overallAssessment.riskLevel)}
            <span>Overall Assessment</span>
            <Badge className={getStatusColor(analysis.overallAssessment.status)}>
              {analysis.overallAssessment.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{analysis.overallAssessment.summary}</p>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Risk Level:</span>
              <Badge variant={analysis.overallAssessment.riskLevel === "high" ? "destructive" : "secondary"}>
                {analysis.overallAssessment.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Value Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Financial Value Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Contract Efficiency</div>
                <div className="text-xl font-bold">{analysis.valueAnalysis.contractEfficiency}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Market Value</div>
                <div className="text-xl font-bold">${analysis.valueAnalysis.marketValue.toLocaleString()}</div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-gray-800 mb-2">Recommendation:</div>
              <p className="text-sm text-gray-700">{analysis.valueAnalysis.recommendation}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm font-medium text-gray-800 mb-1">Financial Impact:</div>
              <p className="text-sm text-gray-600">{analysis.valueAnalysis.financialImpact}</p>
            </div>
          </CardContent>
        </Card>

        {/* Team Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Team Impact Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cohesion Effect</span>
                <Badge variant={analysis.teamImpact.cohesionEffect === "negative" ? "destructive" : 
                              analysis.teamImpact.cohesionEffect === "positive" ? "default" : "secondary"}>
                  {analysis.teamImpact.cohesionEffect.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Culture Alignment</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${analysis.teamImpact.cultureAlignment > 50 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${analysis.teamImpact.cultureAlignment}%` }}
                    />
                  </div>
                  <span className="text-sm">{analysis.teamImpact.cultureAlignment}%</span>
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-gray-800 mb-2">Leadership Influence:</div>
              <p className="text-sm text-gray-700">{analysis.teamImpact.leadershipInfluence}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>Development Action Plan</span>
            <Badge variant={analysis.developmentPlan.priority === "immediate" ? "destructive" : "secondary"}>
              {analysis.developmentPlan.priority.toUpperCase()} PRIORITY
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium text-gray-800 mb-2">Timeline: {analysis.developmentPlan.timeline}</div>
              <div className="text-sm font-medium text-gray-800 mb-3">Key Development Areas:</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {analysis.developmentPlan.keyAreas.map((area, index) => (
                  <Badge key={index} variant="outline" className="justify-center">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-red-500" />
                  Medical Support
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {analysis.developmentPlan.resources.medical.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                  Performance Support
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {analysis.developmentPlan.resources.performance.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
                  Welfare Support
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {analysis.developmentPlan.resources.support.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Re-signing Considerations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-orange-600" />
            <span>Contract Re-signing Analysis</span>
            <Badge variant={analysis.resigningConsiderations.recommendation === "release" ? "destructive" : 
                           analysis.resigningConsiderations.recommendation === "restructure" ? "secondary" : "default"}>
              {analysis.resigningConsiderations.recommendation.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-green-700 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Retention Pros
              </div>
              <ul className="space-y-2">
                {analysis.resigningConsiderations.pros.map((pro, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="text-sm font-medium text-red-700 mb-3 flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Retention Concerns
              </div>
              <ul className="space-y-2">
                {analysis.resigningConsiderations.cons.map((con, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <XCircle className="h-3 w-3 text-red-500 mt-1 mr-2 flex-shrink-0" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="text-sm font-medium text-yellow-800 mb-2">Contract Recommendation:</div>
            <p className="text-sm text-yellow-700">{analysis.resigningConsiderations.contractSuggestion}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}