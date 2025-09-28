import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import NavigationHeader, { QuickNavigation } from "@/components/navigation-header";
import logoPath from "@assets/menulogo_wo.png";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RealTimeMatchAnalytics from "@/components/real-time-match-analytics";
import PositionGroupedSquadBuilder from "@/components/position-grouped-squad-builder";
import PerformanceAnalyticsDashboard from "@/components/performance-analytics-dashboard";
import { 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Users, 
  Activity, 
  Clock,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Zap,
  ArrowLeft,
  Settings,
  Bell,
  FileText,
  UserCheck,
  Trophy,
  Heart,
  AlertTriangle,
  DollarSign,
  Home
} from "lucide-react";

export default function TeamDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [location] = useLocation();

  // Hash navigation implementation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['overview', 'analytics', 'players', 'live-match', 'schedule', 'squad', 'communications'];
    
    if (hash && validTabs.includes(hash)) {
      setActiveTab(hash);
    } else if (!hash) {
      // Default to overview if no hash
      setActiveTab('overview');
    }
  }, []);

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.pushState(null, '', `/team#${value}`);
  };

  // FIREBASE DATA - Manual refresh only to prevent Firebase charges
  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ["/api/players"],
    staleTime: Infinity, // Cache indefinitely - only refresh on manual actions
    refetchInterval: false, // No automatic polling to prevent Firebase charges
  });

  // Firebase data for strategic coaching insights - MANUAL REFRESH ONLY
  const { data: medicalData } = useQuery({
    queryKey: ['/api/v2/medical-data'],
    staleTime: Infinity,
    refetchInterval: false,
  });

  const { data: wellnessData } = useQuery({
    queryKey: ['/api/v2/wellness/squad-readiness'],
    staleTime: Infinity,
    refetchInterval: false,
  });

  const { data: opponentScouting } = useQuery({
    queryKey: ['/api/v2/opponent-scouting/next'],
    staleTime: Infinity,
    refetchInterval: false,
  });

  const { data: weeklyTacticalFocus } = useQuery({
    queryKey: ['/api/v2/tactical-focus/weekly'],
    staleTime: Infinity,
    refetchInterval: false,
  });

  const { data: latestGpsData } = useQuery({
    queryKey: ['/api/v2/training-workrate/latest'],
    staleTime: Infinity,
    refetchInterval: false,
  });

  // Sample team schedule data
  const weeklySchedule = [
    { day: "Monday", time: "6:00 AM", activity: "Strength Training", location: "Gym A", attendees: 32 },
    { day: "Tuesday", time: "5:30 PM", activity: "Skills Training", location: "Field 1", attendees: 28 },
    { day: "Wednesday", time: "6:00 AM", activity: "Conditioning", location: "Track", attendees: 35 },
    { day: "Thursday", time: "5:30 PM", activity: "Team Practice", location: "Field 1", attendees: 40 },
    { day: "Friday", time: "Rest Day", activity: "Recovery Session", location: "Pool", attendees: 15 },
    { day: "Saturday", time: "2:00 PM", activity: "Match Day", location: "QBE Stadium", attendees: 47 },
    { day: "Sunday", time: "Rest Day", activity: "Optional Recovery", location: "Various", attendees: 12 }
  ];

  const typedPlayers = players as any[];

  // Calculate strategic metrics from Firebase data
  const availablePlayers = typedPlayers.filter(p => 
    p.medicalStatus?.status?.toLowerCase().includes('available') && 
    !p.medicalStatus?.status?.toLowerCase().includes('unavailable')
  ).length;
  
  const modifiedTrainingPlayers = typedPlayers.filter(p => 
    p.medicalStatus?.status?.toLowerCase().includes('modified')
  ).length;
  
  const unavailablePlayers = typedPlayers.filter(p => 
    p.medicalStatus?.status?.toLowerCase().includes('unavailable') || 
    p.medicalStatus?.status?.toLowerCase().includes('injured')
  ).length;

  const overallReadiness = wellnessData && typeof wellnessData === 'object' && 'averageReadiness' in wellnessData
    ? (wellnessData as any).averageReadiness : 85;

  const getReadinessStatus = (readiness: number) => {
    if (readiness >= 85) return { status: 'Good', color: 'bg-green-500', textColor: 'text-green-800' };
    if (readiness >= 70) return { status: 'Monitor', color: 'bg-amber-500', textColor: 'text-amber-800' };
    return { status: 'Caution', color: 'bg-red-500', textColor: 'text-red-800' };
  };

  const readinessIndicator = getReadinessStatus(overallReadiness);

  // Helper functions for status badge styling - FIXED COLOR LOGIC
  const getPlayerStatusBadgeColor = (status: string): string => {
    console.log("🔍 TEAM DASHBOARD: getPlayerStatusBadgeColor() checking status:", status);
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('available') && !statusLower.includes('unavailable')) {
      return 'bg-green-100 text-green-800 border-green-200'; // GREEN for Available
    }
    if (statusLower.includes('modified')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // YELLOW for Modified
    }
    if (statusLower.includes('unavailable') || statusLower.includes('injured')) {
      return 'bg-red-100 text-red-800 border-red-200'; // RED for Unavailable/Injured
    }
    
    console.log("⚠️ TEAM DASHBOARD: Status not recognized, defaulting to gray");
    return 'bg-gray-100 text-gray-800 border-gray-200'; // Default gray
  };

  const getPlayerStatusText = (status: string): string => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('available') && !statusLower.includes('unavailable')) {
      return 'Available - Full Training';
    }
    if (statusLower.includes('modified')) {
      return 'Modified Training - Limited Contact';
    }
    if (statusLower.includes('unavailable') || statusLower.includes('injured')) {
      return 'Unavailable - Injured/Recovery';
    }
    
    return 'Unknown Status';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader 
        title="Team Dashboard"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Team Dashboard", href: "/team" }
        ]}
      />

      {/* Strategic Coaching Header - Full Width S&C Portal Style */}
      <div className="relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black transform -skew-y-1 origin-top-left"></div>
        <div className="relative px-8 py-12 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-600 rounded-lg">
                <Trophy className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold">
                Welcome, Coaching Team
              </h1>
            </div>
            <div className="text-2xl font-semibold text-nh-red mb-4">
              Your Strategic Command
            </div>
            <p className="text-xl text-blue-100 leading-relaxed max-w-4xl">
              This hub provides real-time insights into squad readiness, tactical performance, and upcoming strategic objectives. 
              <span className="text-nh-red font-semibold"> Empower your decisions, optimize team potential, and secure victory for North Harbour.</span>
            </p>
            <div className="mt-6 flex items-center gap-6 text-blue-200">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Squad Management</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>Performance Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <span>Tactical Planning</span>
              </div>
            </div>
            <div className="absolute top-8 right-8">
              <img src={logoPath} alt="North Harbour Rugby" className="h-16 w-auto filter drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* Strategic Data Overview - Pulse of the Team */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">Pulse of the Team</h2>
            <p className="text-blue-700">Critical strategic intelligence at a glance</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Squad Availability & Readiness Snapshot */}
            <div className="lg:col-span-2">
              <Card className="h-full border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                    Squad Availability & Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                      <div className="text-3xl font-bold text-green-700 mb-1">{availablePlayers}</div>
                      <div className="text-sm font-medium text-green-600">Available Players</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-amber-200 shadow-sm">
                      <div className="text-3xl font-bold text-amber-700 mb-1">{modifiedTrainingPlayers}</div>
                      <div className="text-sm font-medium text-amber-600">Limited Training</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-red-200 shadow-sm">
                      <div className="text-3xl font-bold text-red-700 mb-1">{unavailablePlayers}</div>
                      <div className="text-sm font-medium text-red-600">Unavailable</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg border border-blue-200">
                    <div className={`w-4 h-4 rounded-full ${readinessIndicator.color}`}></div>
                    <span className="font-semibold text-blue-900">Overall Squad Readiness:</span>
                    <Badge className={`${readinessIndicator.textColor} bg-transparent border-current font-bold`}>
                      {readinessIndicator.status} ({Math.round(overallReadiness)}%)
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Link href="/medical-hub">
                      <Button size="sm" variant="outline" className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50">
                        Medical Hub
                      </Button>
                    </Link>
                    <Link href="/athlete-wellness">
                      <Button size="sm" variant="outline" className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50">
                        Wellness Data
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Opposition Insight */}
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-orange-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  Next Opposition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-900 mb-1">
                    {opponentScouting?.opponent || "Auckland Blues"}
                  </div>
                  <div className="text-sm text-orange-600 mb-3">
                    {opponentScouting?.matchDate || "Saturday, Aug 2"}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-lg border border-orange-200">
                    <div className="text-xs font-medium text-orange-600">Key Strength</div>
                    <div className="text-sm font-semibold text-orange-900">
                      {opponentScouting?.keyStrength || "Dominant Set Piece"}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-orange-200">
                    <div className="text-xs font-medium text-orange-600">Key Weakness</div>
                    <div className="text-sm font-semibold text-orange-900">
                      {opponentScouting?.keyWeakness || "Scrum Instability"}
                    </div>
                  </div>
                </div>

                <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  Update Scouting Report
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Tactical Focus */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Weekly Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                  <div className="text-xs font-medium text-purple-600 mb-2">This Week's Priority</div>
                  <div className="text-lg font-bold text-purple-900 leading-tight">
                    {weeklyTacticalFocus?.focus || "Dominant Breakdown & Clean Outs"}
                  </div>
                </div>

                <div className="text-center">
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Edit Weekly Focus
                  </Button>
                </div>

                <div className="text-xs text-purple-600 text-center">
                  Last updated: {weeklyTacticalFocus?.lastUpdated || "Monday, 9:00 AM"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent GPS Performance Summary & Strategic Action Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GPS Performance Summary */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-green-900 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-green-600" />
                  Recent GPS Performance
                </CardTitle>
                <CardDescription className="text-green-700">
                  Team work rate overview from latest session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">
                      {latestGpsData?.session?.totalDistance || '650'} km
                    </div>
                    <div className="text-xs font-medium text-green-600">Total Team Distance</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">
                      {latestGpsData?.session?.avgHighSpeedRunning || '120'} m/min
                    </div>
                    <div className="text-xs font-medium text-green-600">HSR (Avg per Player)</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg border border-green-200">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Work Rate Trend: Stable</span>
                </div>

                <Link href="/training-workrate">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    View Detailed GPS Analysis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Strategic Action Buttons */}
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-yellow-900 flex items-center gap-2">
                  <Settings className="h-6 w-6 text-yellow-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  Direct access to coaching essentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Plan Next Training Session
                </Button>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Review Match Footage
                </Button>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Squad Selections
                </Button>
                <Link href="/team#players">
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white justify-start">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Access Player Profiles
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>



        {/* Main Tabs - Enhanced Visibility */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white border-2 border-gray-200 p-1 rounded-xl shadow-lg gap-1 h-10">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="players"
              className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
            >
              Players
            </TabsTrigger>
            <TabsTrigger 
              value="live-match"
              className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
            >
              Live Match
            </TabsTrigger>
            <TabsTrigger 
              value="schedule"
              className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger 
              value="squad"
              className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
            >
              Squad Builder
            </TabsTrigger>
            <TabsTrigger 
              value="communications"
              className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
            >
              Communications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="mx-auto mb-3 text-blue-600" size={32} />
                  <div className="text-2xl font-bold text-gray-900">{typedPlayers.length}</div>
                  <div className="text-sm text-gray-600">Squad Size</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Activity className="mx-auto mb-3 text-green-600" size={32} />
                  <div className="text-2xl font-bold text-gray-900">89%</div>
                  <div className="text-sm text-gray-600">Avg Fitness</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="mx-auto mb-3 text-purple-600" size={32} />
                  <div className="text-2xl font-bold text-gray-900">3</div>
                  <div className="text-sm text-gray-600">Current Injuries</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="mx-auto mb-3 text-orange-600" size={32} />
                  <div className="text-2xl font-bold text-gray-900">8-4</div>
                  <div className="text-sm text-gray-600">Season Record</div>
                </CardContent>
              </Card>
            </div>

            {/* Essential Analytics Cards for Coach */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Team Cohesion Analytics */}
              <Link href="/team-cohesion">
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-orange-200 bg-orange-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        <CardTitle className="text-sm font-semibold">Team Cohesion Analytics</CardTitle>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">Monitor</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      GAIN LINE Analytics framework tracking team understanding and working relationships
                    </p>
                    
                    {/* Primary Metric */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">24.1%</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium">+2.9%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Team Work Index</p>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">In-Season Cohesion</span>
                        <span className="font-medium text-blue-600">512</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Zero Gaps</span>
                        <span className="font-medium text-red-600">17</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Squad Stability</span>
                        <span className="font-medium text-orange-600">2.3</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full mt-4 bg-nh-red hover:bg-nh-red-600 text-white" size="sm">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Match Performance Analytics */}
              <Link href="/analytics/match-list">
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-6 h-6" />
                        <CardTitle className="text-sm font-semibold">Match Performance Analytics</CardTitle>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Comprehensive match statistics, win rates, and performance trends analysis
                    </p>
                    
                    {/* Primary Metric */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">67%</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium">+12%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Win Rate</p>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Points For</span>
                        <span className="font-medium text-green-600">385</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Points Against</span>
                        <span className="font-medium text-red-600">298</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Point Differential</span>
                        <span className="font-medium text-green-600">+87</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full mt-4 bg-nh-red hover:bg-nh-red-600 text-white" size="sm">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Work Rate Report */}
              <Link href="/work-rate-report">
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-6 h-6" />
                        <CardTitle className="text-sm font-semibold">Work Rate Report</CardTitle>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      OPTA match data integration with GPS analysis for comprehensive player work rate insights
                    </p>
                    
                    {/* Primary Metric */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">8.4km</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium">+0.3km</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Avg Work Rate</p>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">High Intensity</span>
                        <span className="font-medium text-red-600">24%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Sprint Distance</span>
                        <span className="font-medium text-purple-600">485m</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Work Efficiency</span>
                        <span className="font-medium text-green-600">87%</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full mt-4 bg-nh-red hover:bg-nh-red-600 text-white" size="sm">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Player Value Analysis */}
              <Link href="/moneyball">
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-6 h-6" />
                        <CardTitle className="text-sm font-semibold">Player Value Analysis</CardTitle>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Comprehensive player value assessment using WEI, cohesion metrics, and performance analytics
                    </p>
                    
                    {/* Primary Metric */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">$290k</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium">+15%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Total Contract Value</p>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Avg Work Efficiency</span>
                        <span className="font-medium text-green-600">85.4%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Players Analyzed</span>
                        <span className="font-medium text-blue-600">3</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Cohesion Score</span>
                        <span className="font-medium text-purple-600">9.2/10</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full mt-4 bg-nh-red hover:bg-nh-red-600 text-white" size="sm">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Tactical Analysis */}
              <Link href="/tactical-analytics">
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-6 h-6" />
                        <CardTitle className="text-sm font-semibold">Tactical Analysis</CardTitle>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Game strategy analysis, formation effectiveness, and tactical insights
                    </p>
                    
                    {/* Primary Metric */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">78%</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium">+8%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Set Piece Success</p>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Lineout Success</span>
                        <span className="font-medium text-green-600">85%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Scrum Success</span>
                        <span className="font-medium text-green-600">92%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Turnover Rate</span>
                        <span className="font-medium text-orange-600">14%</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full mt-4 bg-nh-red hover:bg-nh-red-600 text-white" size="sm">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Recent Match Analytics */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-nh-red" />
                  Latest Match Analytics
                </CardTitle>
                <CardDescription>Quick access to recent match performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/match-list">
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
                            <div className="font-medium">43%</div>
                            <div className="text-gray-600">Possession</div>
                          </div>
                          <div>
                            <div className="font-medium">49%</div>
                            <div className="text-gray-600">Territory</div>
                          </div>
                          <div>
                            <div className="font-medium">86%</div>
                            <div className="text-gray-600">Tackles</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <PerformanceAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="players" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Squad Roster
                </CardTitle>
                <CardDescription>
                  Click on any player to view their detailed profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                {playersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">Loading live player data...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typedPlayers.slice(0, 12).map((player: any) => (
                      <Link key={player.id} href={`/player/${player.id}`}>
                        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="font-bold text-blue-600">#{player.personalDetails?.jerseyNumber || player.jerseyNumber || '?'}</span>
                                </div>
                                <div>
                                  <div className="font-medium text-sm">
                                    {player.personalDetails?.fullName || 
                                     `${player.personalDetails?.firstName || ''} ${player.personalDetails?.lastName || ''}`.trim() ||
                                     'Player Name TBD'}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {player.personalDetails?.primaryPosition || player.position || 'Position TBD'}
                                  </div>
                                </div>
                              </div>
                              <Badge 
                                className={
                                  getPlayerStatusBadgeColor(player.availability?.status || player.currentStatus || 'unknown')
                                }
                              >
                                {getPlayerStatusText(player.availability?.status || player.currentStatus || 'unknown')}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="live-match" className="space-y-6">
            <RealTimeMatchAnalytics matchId="nh_vs_auckland_2024" />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar size={24} />
                    <span>Weekly Training Schedule</span>
                  </div>
                  <Button className="bg-nh-red hover:bg-red-700">
                    <Settings size={16} className="mr-2" />
                    Edit Schedule
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage training sessions, match schedules, and team activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {weeklySchedule.map((session, index) => (
                    <Card key={index} className="border-l-4 border-l-nh-red">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-center min-w-[80px]">
                              <div className="font-bold text-lg">{session.day}</div>
                              <div className="text-sm text-gray-600">{session.time}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-lg">{session.activity}</div>
                              <div className="text-gray-600">{session.location}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={session.attendees > 35 ? "default" : "secondary"}
                              className={session.attendees > 35 ? "bg-green-600" : ""}
                            >
                              {session.attendees} players
                            </Badge>
                            <div className="text-sm text-gray-500 mt-1">
                              {Math.round((session.attendees / 47) * 100)}% attendance
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="squad" className="space-y-6">
            <PositionGroupedSquadBuilder />
          </TabsContent>

          <TabsContent value="communications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Team Communications
                </CardTitle>
                <CardDescription>Team announcements and communication hub</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border-l-4 border-l-blue-500 rounded-lg">
                    <div className="font-medium text-blue-800">Match Preparation</div>
                    <div className="text-sm text-blue-700 mt-1">
                      Team meeting scheduled for Thursday 3:00 PM in Conference Room A
                    </div>
                    <div className="text-xs text-blue-600 mt-2">Posted 3 hours ago</div>
                  </div>

                  <div className="p-4 bg-yellow-50 border-l-4 border-l-yellow-500 rounded-lg">
                    <div className="font-medium text-yellow-800">Injury Update</div>
                    <div className="text-sm text-yellow-700 mt-1">
                      Player cleared for full training. Return to match selection available.
                    </div>
                    <div className="text-xs text-yellow-600 mt-2">Posted 6 hours ago</div>
                  </div>

                  <Button className="w-full bg-nh-red hover:bg-red-700">
                    <Bell size={16} className="mr-2" />
                    Create Announcement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}