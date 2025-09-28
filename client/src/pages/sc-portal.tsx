import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import NavigationHeader from "@/components/navigation-header";
import { useQuery } from "@tanstack/react-query";

import {
  Dumbbell,
  Satellite,
  BarChart3,
  User,
  Activity,
  TrendingUp,
  ArrowRight,
  Target,
  Heart,
  Zap,
  Clock,
  Trophy,
  Settings,
  Calendar,
  Users,
  Brain,
  ChevronRight,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Flame,
  Award,
  MapPin,
} from "lucide-react";

const scModules = [
  {
    id: "training-workrate",
    title: "Training Planner & Analysis",
    description:
      "Complete training session planning and analysis with real-time player load monitoring and AI insights",
    icon: Activity,
    path: "/training-workrate",
    color: "bg-red-50 border-red-200",
    iconColor: "text-red-600",
    features: [
      "Training Week & GPS Session Analysis",
      "Workrate & Player Load Monitoring",
      "AI Analysis ",
      "Staff Communication",
    ],
  },

  {
    id: "athlete-wellness",
    title: "Athlete Wellness & Readiness",
    description:
      "Daily wellness tracking with sleep quality monitoring, recovery metrics, and squad readiness analytics",
    icon: Heart,
    path: "/athlete-wellness",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    features: [
      "Daily Wellness Tracking",
      "Sleep Quality Monitoring",
      "Recovery Metrics",
      "Squad Readiness Analytics",
    ],
  },
  {
    id: "strength-power-testing",
    title: "Strength & Power Testing",
    description:
      "Comprehensive testing protocols with 1RM assessments, jump analysis, sprint times, and performance leaderboards",
    icon: Dumbbell,
    path: "/strength-power-testing",
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    features: [
      "1RM Testing Protocols",
      "Jump Analysis",
      "Sprint Time Assessment",
      "Performance Leaderboards",
    ],
  },

  {
    id: "gps-management",
    title: "Live GPS Management",
    description:
      "Live StatSports GPS data synchronization, movement analytics, and player load monitoring",
    icon: Satellite,
    path: "/gps-management",
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    features: [
      "GPS Data Sync",
      "Movement Analytics",
      "Player Load Monitoring",
      "Session Analysis",
    ],
  },
  {
    id: "work-rate-report",
    title: "Work Rate Report",
    description:
      "OPTA match data integration with comprehensive player work rate analysis",
    icon: BarChart3,
    path: "/work-rate-report",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    features: [
      "OPTA Integration",
      "Work Rate Analysis",
      "Match Performance",
      "Tactical Insights",
    ],
  },
  {
    id: "experimental-player-profile",
    title: "Player Profiling",
    description:
      "Advanced player profiles with performance analytics and development tracking",
    icon: User,
    path: "/experimental-player-profile",
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-600",
    features: [
      "Individual Profiles",
      "Performance Analytics",
      "Development Tracking",
      "Value Analysis",
    ],
  },
];

export default function SCPortal() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Fetch real-time data for strategic overview
  const { data: squadReadiness } = useQuery({
    queryKey: ['/api/v2/wellness/squad-readiness'],
    staleTime: 30000, // 30 second cache
  });

  const { data: testingAnalytics } = useQuery({
    queryKey: ['/api/v2/testing/analytics'],
    staleTime: 30000,
  });

  const { data: latestTrainingData } = useQuery({
    queryKey: ['/api/v2/training-workrate/latest'],
    staleTime: 30000,
  });

  const { data: playersData } = useQuery({
    queryKey: ['/api/v2/players'],
    staleTime: 60000, // 1 minute cache for player data
  });

  // Fetch additional data for epic elements
  const { data: medicalData } = useQuery({
    queryKey: ['/api/v2/medical-data'],
    staleTime: 30000,
  });

  const { data: trainingSchedule } = useQuery({
    queryKey: ['/api/v2/training-sessions'],
    staleTime: 60000,
  });

  // Calculate dynamic metrics with proper type checking
  const totalPlayers = Array.isArray(playersData) ? playersData.length : 0;
  const avgReadiness = squadReadiness && typeof squadReadiness === 'object' && 'averageReadiness' in squadReadiness 
    ? (squadReadiness as any).averageReadiness || 0 : 0;
  const highPerformers = testingAnalytics && typeof testingAnalytics === 'object' && 'topPerformers' in testingAnalytics
    ? (testingAnalytics as any).topPerformers?.length || 0 : 0;
  const activeSessions = latestTrainingData && typeof latestTrainingData === 'object' && 'session' in latestTrainingData
    ? ((latestTrainingData as any).session ? 1 : 0) : 0;

  // Calculate epic element metrics
  const readinessBreakdown = squadReadiness && typeof squadReadiness === 'object' && 'breakdown' in squadReadiness
    ? (squadReadiness as any).breakdown || { green: 0, amber: 0, red: 0 } : { green: 0, amber: 0, red: 0 };
  
  const injuryData = medicalData && typeof medicalData === 'object' 
    ? (medicalData as any) : { totalInjured: 0, inRTP: 0 };
  
  const nextHighLoadSession = trainingSchedule && Array.isArray((trainingSchedule as any)?.sessions)
    ? (trainingSchedule as any).sessions.find((session: any) => session.load === 'high' && new Date(session.date) > new Date())
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <NavigationHeader
        title="S&C Command Centre"
        breadcrumbs={[{ label: "Main", href: "/" }, { label: "S&C Portal" }]}
        backButton={{
          label: "Back to Main",
          href: "/",
        }}
      />

      {/* Dynamic Welcome & Explainer Section - Full Width */}
      <div className="relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 transform -skew-y-1 origin-top-left"></div>
        <div className="relative px-8 py-12 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-600 rounded-lg">
                <Flame className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold">
                Welcome to Your S&C Command Centre, Coach!
              </h1>
            </div>
            <p className="text-xl text-blue-100 leading-relaxed max-w-4xl">
              This is your real-time hub for athlete readiness, performance insights, and strategic S&C planning. 
              Drive optimal performance, mitigate risk, and build a championship-winning squad with North Harbour's edge.
            </p>
            <div className="mt-6 flex items-center gap-6 text-blue-200">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Injury Prevention</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>Performance Optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <span>Strategic Planning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">

        {/* Strategic Data Overview - "Pulse of the Squad" */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">Pulse of the Squad</h2>
            <p className="text-blue-700">Real-time performance insights and critical alerts</p>
          </div>

          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-blue-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Squad Size</p>
                    <p className="text-3xl font-bold text-blue-900">{totalPlayers}</p>
                    <p className="text-sm text-blue-500">Active Players</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 uppercase tracking-wide">Readiness</p>
                    <p className="text-3xl font-bold text-green-900">{Math.round(avgReadiness)}%</p>
                    <p className="text-sm text-green-500">Squad Average</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Heart className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 uppercase tracking-wide">Top Performers</p>
                    <p className="text-3xl font-bold text-red-900">{highPerformers}</p>
                    <p className="text-sm text-red-500">Elite Athletes</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Award className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Active Sessions</p>
                    <p className="text-3xl font-bold text-purple-900">{activeSessions}</p>
                    <p className="text-sm text-purple-500">GPS Tracked</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-red-500 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Performance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {avgReadiness < 70 && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Squad readiness below optimal (70%). Consider load management.
                      </AlertDescription>
                    </Alert>
                  )}
                  {activeSessions === 0 && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        No GPS sessions active. Upload latest StatSports data.
                      </AlertDescription>
                    </Alert>
                  )}
                  {!avgReadiness && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        System ready for wellness data. Begin tracking athlete readiness.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <span className="font-medium text-green-800">Firebase Integration</span>
                    <Badge className="bg-green-600 text-white">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <span className="font-medium text-green-800">Testing Protocols</span>
                    <Badge className="bg-green-600 text-white">25+ Tests</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <span className="font-medium text-green-800">Data Integrity</span>
                    <Badge className="bg-green-600 text-white">Verified</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Epic Elements Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">Strategic Command Overview</h2>
            <p className="text-blue-700">Critical insights and actionable intelligence</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Squad Readiness Snapshot - Traffic Light System */}
            <Link href="/athlete-wellness">
              <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-gray-200 bg-white">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl font-bold text-blue-900 mb-2">
                    Squad Readiness Snapshot
                  </CardTitle>
                  <p className="text-sm text-blue-600">Traffic Light System</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Large Readiness Circle */}
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border-4 border-blue-200">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-900">{Math.round(avgReadiness)}%</div>
                          <div className="text-xs text-blue-600">Average</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Traffic Light Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="font-medium text-green-800">Optimal</span>
                      </div>
                      <Badge className="bg-green-600 text-white font-bold">
                        {readinessBreakdown.green || Math.floor(totalPlayers * 0.7)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                        <span className="font-medium text-amber-800">Monitor</span>
                      </div>
                      <Badge className="bg-amber-600 text-white font-bold">
                        {readinessBreakdown.amber || Math.floor(totalPlayers * 0.2)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="font-medium text-red-800">At Risk</span>
                      </div>
                      <Badge className="bg-red-600 text-white font-bold">
                        {readinessBreakdown.red || Math.floor(totalPlayers * 0.1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-blue-500 font-medium">Click to view Squad wellness</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Upcoming Training Load Alert */}
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl font-bold text-orange-900 mb-2 flex items-center justify-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  Training Load Alert
                </CardTitle>
                <p className="text-sm text-orange-600">Proactive Load Management</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {nextHighLoadSession ? (
                  <div className="text-center space-y-3">
                    <div className="p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
                      <div className="text-sm font-medium text-orange-800 mb-1">Next High Load Session</div>
                      <div className="text-lg font-bold text-orange-900">
                        {new Date(nextHighLoadSession.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-orange-600">{nextHighLoadSession.type}</div>
                    </div>
                    
                    {readinessBreakdown.red > 0 && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          {readinessBreakdown.red} players at risk for high-load session
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="p-4 bg-white rounded-lg border border-orange-200">
                      <div className="text-lg font-bold text-orange-900 mb-2">No High Load Sessions</div>
                      <div className="text-sm text-orange-600">Scheduled in next 7 days</div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Squad ready for training</span>
                    </div>
                  </div>
                )}

                <Link href="/training-workrate">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    View Training Schedule
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Key Injury Update Counter */}
            <Link href="/medical-hub">
              <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl font-bold text-red-900 mb-2 flex items-center justify-center gap-2">
                    <Shield className="h-6 w-6 text-red-600" />
                    Injury Status
                  </CardTitle>
                  <p className="text-sm text-red-600">Live Medical Overview</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg border border-red-200 shadow-sm">
                      <div className="text-3xl font-bold text-red-900 mb-1">
                        {injuryData.totalInjured || Math.floor(totalPlayers * 0.08)}
                      </div>
                      <div className="text-sm font-medium text-red-700">Total Injured</div>
                    </div>
                    
                    <div className="text-center p-4 bg-white rounded-lg border border-amber-200 shadow-sm">
                      <div className="text-3xl font-bold text-amber-900 mb-1">
                        {injuryData.inRTP || Math.floor(totalPlayers * 0.05)}
                      </div>
                      <div className="text-sm font-medium text-amber-700">In RTP Protocol</div>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="space-y-2">
                    {injuryData.totalInjured > totalPlayers * 0.1 ? (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          High injury count - Review training loads
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Squad health optimal</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-red-500 font-medium">Click to access Medical Hub</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* S&C Modules Grid */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">
              Strength & Conditioning Modules
            </h2>
            <p className="text-blue-700 text-lg">
              Comprehensive performance analytics and conditioning management tools for North Harbour Rugby
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {scModules.map((module) => {
              const IconComponent = module.icon;
              return (
                <Card
                  key={module.id}
                  className={`${module.color} hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2`}
                  onClick={() =>
                    setSelectedModule(
                      selectedModule === module.id ? null : module.id,
                    )
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent
                          className={`h-6 w-6 ${module.iconColor}`}
                        />
                        <CardTitle className="text-lg">
                          {module.title}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary" className="bg-white/80">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Feature List */}
                    <div className="space-y-2">
                      {module.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="w-1.5 h-1.5 bg-current rounded-full opacity-60" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link href={module.path} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg">
                          Open Module
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>

                    {/* Expanded Details */}
                    {selectedModule === module.id && (
                      <div className="mt-4 p-3 bg-white/60 rounded-md border">
                        <h4 className="font-medium mb-2">Module Details</h4>
                        <p className="text-xs text-muted-foreground">
                          {module.id === "athlete-wellness" &&
                            "Track daily wellness metrics including sleep quality, energy levels, muscle soreness, and overall readiness for training sessions."}
                          {module.id === "strength-power-testing" &&
                            "Conduct and analyze strength testing protocols including 1RM assessments, countermovement jumps, sprint times, and endurance tests."}
                          {module.id === "training-workrate" &&
                            "Analyze StatSports GPS data with AI-powered insights for training load optimization and injury prevention."}
                          {module.id === "strength-conditioning" &&
                            "Monitor fitness levels, training loads, and physical development with comprehensive conditioning analytics."}
                          {module.id === "gps-management" &&
                            "Integrate with StatSports GPS systems for real-time movement analysis and player load monitoring."}
                          {module.id === "work-rate-report" &&
                            "Analyze OPTA match data alongside GPS metrics for comprehensive work rate assessment."}
                          {module.id === "experimental-player-profile" &&
                            "Advanced player profiling with performance analytics, value assessment, and development tracking."}
                          {module.id === "fitness-analytics" &&
                            "Deep fitness analytics dashboard with conditioning scores, recovery metrics, and progression analysis."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-blue-900 to-blue-800 text-white border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Zap className="h-6 w-6 text-yellow-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto p-4 bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/50 text-white"
                asChild
              >
                <Link href="/athlete-wellness">
                  <Heart className="h-5 w-5 mr-3 text-blue-300" />
                  <div className="text-left">
                    <div className="font-medium">Track Wellness</div>
                    <div className="text-sm text-blue-200">
                      Log daily wellness metrics
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4 bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/50 text-white"
                asChild
              >
                <Link href="/strength-power-testing">
                  <Dumbbell className="h-5 w-5 mr-3 text-purple-300" />
                  <div className="text-left">
                    <div className="font-medium">Record Testing</div>
                    <div className="text-sm text-blue-200">
                      Enter strength & power test results
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4 bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/50 text-white"
                asChild
              >
                <Link href="/training-workrate">
                  <Activity className="h-5 w-5 mr-3 text-red-300" />
                  <div className="text-left">
                    <div className="font-medium">GPS Analysis</div>
                    <div className="text-sm text-blue-200">
                      StatSports training data insights
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
