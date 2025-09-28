import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TrendingUp, TrendingDown, Users, Target, Award, AlertTriangle, BarChart3, LineChart, Activity, Heart, Calendar, Trophy, Shield, Zap } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";

interface AnalyticsCard {
  id: string;
  title: string;
  description: string;
  primaryMetric: {
    value: string | number;
    label: string;
    trend?: "up" | "down" | "stable";
    trendValue?: string;
  };
  secondaryMetrics?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
  status: "good" | "warning" | "critical" | "neutral";
  icon: React.ReactNode;
  route: string;
  category: "performance" | "health" | "tactical" | "development";
}

export default function AnalyticsOverview() {
  const { data: teamMetrics, isLoading } = useQuery({
    queryKey: ['/api/analytics/overview'],
  });

  const { data: cohesionData } = useQuery({
    queryKey: ['/api/team/cohesion/twi-progression/2024'],
  });

  const { data: performanceData } = useQuery({
    queryKey: ['/api/team/performance/overview'],
  });

  const { data: injuryData } = useQuery({
    queryKey: ['/api/team/medical/overview'],
  });

  const { data: fitnessData } = useQuery({
    queryKey: ['/api/team/fitness/overview'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Extract current metrics from API data with proper type handling
  const cohesionArray = cohesionData && Array.isArray(cohesionData) ? cohesionData : [];
  const latestCohesionData = cohesionArray.length > 0 ? cohesionArray[cohesionArray.length - 1] : null;
  const currentTWI = latestCohesionData?.twiScore || 24.1;
  const currentCohesion = latestCohesionData?.inSeasonCohesion || 512;

  const analyticsCards: AnalyticsCard[] = [
    {
      id: "cohesion",
      title: "Team Cohesion Analytics",
      description: "GAIN LINE Analytics framework tracking team understanding and working relationships",
      primaryMetric: {
        value: `${currentTWI.toFixed(1)}%`,
        label: "Team Work Index",
        trend: "up",
        trendValue: "+2.9%"
      },
      secondaryMetrics: [
        { label: "In-Season Cohesion", value: currentCohesion, color: "text-blue-600" },
        { label: "Zero Gaps", value: 17, color: "text-red-600" },
        { label: "Squad Stability", value: "2.3", color: "text-orange-600" }
      ],
      status: currentTWI >= 30 ? "good" : currentTWI >= 20 ? "warning" : "critical",
      icon: <Users className="w-6 h-6" />,
      route: "/team-cohesion",
      category: "tactical"
    },
    {
      id: "performance",
      title: "Match Performance Analytics",
      description: "Comprehensive match statistics, win rates, and performance trends analysis",
      primaryMetric: {
        value: "67%",
        label: "Win Rate",
        trend: "up",
        trendValue: "+12%"
      },
      secondaryMetrics: [
        { label: "Points For", value: 385, color: "text-green-600" },
        { label: "Points Against", value: 298, color: "text-red-600" },
        { label: "Point Differential", value: "+87", color: "text-green-600" }
      ],
      status: "good",
      icon: <Trophy className="w-6 h-6" />,
      route: "/analytics/match-list",
      category: "performance"
    },
    {
      id: "fitness",
      title: "Fitness & Conditioning",
      description: "Player fitness levels, training loads, and physical conditioning metrics",
      primaryMetric: {
        value: "89%",
        label: "Average Fitness Score",
        trend: "up",
        trendValue: "+5%"
      },
      secondaryMetrics: [
        { label: "Training Attendance", value: "94%", color: "text-blue-600" },
        { label: "Load Management", value: "Optimal", color: "text-green-600" },
        { label: "Recovery Rate", value: "92%", color: "text-green-600" }
      ],
      status: "good",
      icon: <Activity className="w-6 h-6" />,
      route: "/fitness-analytics",
      category: "health"
    },
    {
      id: "injury",
      title: "Injury Prevention & Medical",
      description: "Injury tracking, risk assessment, and medical monitoring dashboard",
      primaryMetric: {
        value: "6.4%",
        label: "Injury Rate",
        trend: "down",
        trendValue: "-1.2%"
      },
      secondaryMetrics: [
        { label: "Players Available", value: "42/45", color: "text-green-600" },
        { label: "High Risk", value: 3, color: "text-orange-600" },
        { label: "Recovery Time", value: "12 days", color: "text-blue-600" }
      ],
      status: "warning",
      icon: <Heart className="w-6 h-6" />,
      route: "/medical-analytics",
      category: "health"
    },
    {
      id: "gps",
      title: "GPS & Movement Analytics",
      description: "StatSports GPS data analysis including distance, speed, and workload metrics",
      primaryMetric: {
        value: "8.2km",
        label: "Avg Distance/Session",
        trend: "stable",
        trendValue: "±0.3km"
      },
      secondaryMetrics: [
        { label: "Max Speed", value: "32.4 km/h", color: "text-purple-600" },
        { label: "Player Load", value: "485", color: "text-blue-600" },
        { label: "Sprint Count", value: "23", color: "text-green-600" }
      ],
      status: "good",
      icon: <Zap className="w-6 h-6" />,
      route: "/gps-analytics",
      category: "performance"
    },
    {
      id: "tactical",
      title: "Tactical Analysis",
      description: "Game strategy analysis, formation effectiveness, and tactical insights",
      primaryMetric: {
        value: "78%",
        label: "Set Piece Success",
        trend: "up",
        trendValue: "+8%"
      },
      secondaryMetrics: [
        { label: "Lineout Success", value: "85%", color: "text-green-600" },
        { label: "Scrum Success", value: "92%", color: "text-green-600" },
        { label: "Turnover Rate", value: "14%", color: "text-orange-600" }
      ],
      status: "good",
      icon: <Target className="w-6 h-6" />,
      route: "/tactical-analytics",
      category: "tactical"
    },
    {
      id: "work-rate",
      title: "Work Rate Report",
      description: "Integrated OPTA match events with GPS tracking data for comprehensive player work rate analysis",
      primaryMetric: {
        value: "571",
        label: "Avg Dynamic Stress Load",
        trend: "up",
        trendValue: "+12%"
      },
      secondaryMetrics: [
        { label: "Total Distance", value: "31.3km", color: "text-blue-600" },
        { label: "High Speed Running", value: "2.7km", color: "text-green-600" },
        { label: "Red Zone Time", value: "22.6 min", color: "text-red-600" }
      ],
      status: "good",
      icon: <BarChart3 className="w-6 h-6" />,
      route: "/analytics/work-rate-report",
      category: "performance"
    },
    {
      id: "development",
      title: "Player Development",
      description: "Individual player progression tracking and skill development analysis",
      primaryMetric: {
        value: "85%",
        label: "Development Goals Met",
        trend: "up",
        trendValue: "+15%"
      },
      secondaryMetrics: [
        { label: "Skills Improved", value: "127", color: "text-green-600" },
        { label: "Training Hours", value: "2,340", color: "text-blue-600" },
        { label: "Assessment Score", value: "4.2/5", color: "text-green-600" }
      ],
      status: "good",
      icon: <BarChart3 className="w-6 h-6" />,
      route: "/development-analytics",
      category: "development"
    },
    {
      id: "schedule",
      title: "Schedule & Workload",
      description: "Training schedule optimization and workload distribution analysis",
      primaryMetric: {
        value: "Balanced",
        label: "Workload Distribution",
        trend: "stable",
        trendValue: "Optimal"
      },
      secondaryMetrics: [
        { label: "Training Days", value: "4.2/week", color: "text-blue-600" },
        { label: "Rest Days", value: "2.8/week", color: "text-green-600" },
        { label: "Match Load", value: "Moderate", color: "text-orange-600" }
      ],
      status: "good",
      icon: <Calendar className="w-6 h-6" />,
      route: "/schedule-analytics",
      category: "development"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "border-green-200 bg-green-50";
      case "warning": return "border-orange-200 bg-orange-50";
      case "critical": return "border-red-200 bg-red-50";
      default: return "border-gray-200 bg-white";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good": return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case "warning": return <Badge className="bg-orange-100 text-orange-800">Monitor</Badge>;
      case "critical": return <Badge className="bg-red-100 text-red-800">Attention</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Neutral</Badge>;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const categories = [
    { id: "performance", label: "Performance", color: "border-blue-500" },
    { id: "health", label: "Health & Fitness", color: "border-green-500" },
    { id: "tactical", label: "Tactical", color: "border-purple-500" },
    { id: "development", label: "Development", color: "border-orange-500" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        title="Analytics Overview"
        description="Squad Analytics & Performance Intelligence"
        breadcrumbs={[
          { label: "Main", href: "/" },
          { label: "Analytics" }
        ]}
        badges={[
          { text: "2024 Season", className: "bg-white text-nh-red" },
          { text: "Live Data", className: "bg-nh-red-700 text-white" }
        ]}
        backUrl="/"
        backLabel="Back to Main"
      />

      <div className="p-6">
        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`px-4 py-2 rounded-lg border-2 ${category.color} bg-white text-sm font-medium`}
              >
                {category.label}
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {analyticsCards.map((card) => (
            <Link key={card.id} href={card.route}>
              <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${getStatusColor(card.status)} border-2`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {card.icon}
                      <CardTitle className="text-sm font-semibold">{card.title}</CardTitle>
                    </div>
                    {getStatusBadge(card.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-gray-600 leading-relaxed">{card.description}</p>
                  
                  {/* Primary Metric */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{card.primaryMetric.value}</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(card.primaryMetric.trend)}
                        <span className="text-xs font-medium">{card.primaryMetric.trendValue}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{card.primaryMetric.label}</p>
                  </div>

                  {/* Secondary Metrics */}
                  {card.secondaryMetrics && (
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      {card.secondaryMetrics.map((metric, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-600">{metric.label}</span>
                          <span className={`font-medium ${metric.color || 'text-gray-900'}`}>
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    className="w-full mt-4 bg-nh-red hover:bg-nh-red-600 text-white"
                    size="sm"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Match Analytics */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-nh-red" />
                Latest Match Analytics
              </CardTitle>
              <p className="text-sm text-gray-600">Quick access to recent match performance data</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Recent Matches List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link href="/match-performance">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-sm">vs Auckland</h4>
                            <p className="text-xs text-gray-600">June 1, 2024 • NPC</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 text-xs">Win</Badge>
                        </div>
                        <div className="text-lg font-bold text-green-600 mb-2">32-24</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="font-medium">67%</div>
                            <div className="text-gray-600">Win Rate</div>
                          </div>
                          <div>
                            <div className="font-medium">43%</div>
                            <div className="text-gray-600">Possession</div>
                          </div>
                          <div>
                            <div className="font-medium">86%</div>
                            <div className="text-gray-600">Tackles</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-sm">vs Canterbury</h4>
                          <p className="text-xs text-gray-600">May 25, 2024 • NPC</p>
                        </div>
                        <Badge className="bg-red-100 text-red-800 text-xs">Loss</Badge>
                      </div>
                      <div className="text-lg font-bold text-red-600 mb-2">18-31</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="font-medium">38%</div>
                          <div className="text-gray-600">Possession</div>
                        </div>
                        <div>
                          <div className="font-medium">42%</div>
                          <div className="text-gray-600">Territory</div>
                        </div>
                        <div>
                          <div className="font-medium">82%</div>
                          <div className="text-gray-600">Tackles</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-sm">vs Otago</h4>
                          <p className="text-xs text-gray-600">May 18, 2024 • NPC</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 text-xs">Win</Badge>
                      </div>
                      <div className="text-lg font-bold text-green-600 mb-2">28-21</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="font-medium">51%</div>
                          <div className="text-gray-600">Possession</div>
                        </div>
                        <div>
                          <div className="font-medium">55%</div>
                          <div className="text-gray-600">Territory</div>
                        </div>
                        <div>
                          <div className="font-medium">88%</div>
                          <div className="text-gray-600">Tackles</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="pt-4 border-t">
                  <Link href="/match-performance">
                    <Button className="w-full bg-nh-red hover:bg-nh-red-600 text-white">
                      <Trophy className="h-4 w-4 mr-2" />
                      View Comprehensive Match Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <p className="text-sm text-blue-800">Active Analytics Modules</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">6</div>
              <p className="text-sm text-green-800">Metrics Improving</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">2</div>
              <p className="text-sm text-orange-800">Areas to Monitor</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">45</div>
              <p className="text-sm text-purple-800">Players Tracked</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}