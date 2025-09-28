import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Target,
  ArrowRight,
  BarChart3,
  Activity,
  Zap,
  Clock
} from "lucide-react";

interface SeasonOverviewProps {
  onWeekSelect: (weekId: string) => void;
}

export function SeasonOverviewDashboard({ onWeekSelect }: SeasonOverviewProps) {
  // Mock season data - will be replaced with Firebase queries
  const seasonStats = {
    totalSessions: 24,
    totalPlayers: 40,
    avgAttendance: 85,
    peakWeek: "Week 8",
    totalDistance: "892,456m",
    totalLoad: "28,437"
  };

  const weeklyData = [
    { 
      id: "week1", 
      title: "Week 1 - Pre-Season Foundation", 
      sessions: 3, 
      attendance: 92,
      avgDistance: 6800,
      avgLoad: 520,
      status: "completed",
      date: "July 20-26, 2025"
    },
    { 
      id: "week2", 
      title: "Week 2 - Conditioning Focus", 
      sessions: 4, 
      attendance: 88,
      avgDistance: 7200,
      avgLoad: 580,
      status: "in-progress",
      date: "July 27 - Aug 2, 2025"
    },
    { 
      id: "week3", 
      title: "Week 3 - Skills Integration", 
      sessions: 3, 
      attendance: 0,
      avgDistance: 0,
      avgLoad: 0,
      status: "upcoming",
      date: "Aug 3-9, 2025"
    },
    { 
      id: "week4", 
      title: "Week 4 - Match Preparation", 
      sessions: 3, 
      attendance: 0,
      avgDistance: 0,
      avgLoad: 0,
      status: "upcoming",
      date: "Aug 10-16, 2025"
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "upcoming": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const handleWeekClick = (weekId: string) => {
    window.location.hash = weekId;
    onWeekSelect(weekId);
  };

  return (
    <div className="space-y-6">
      {/* Season Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">{seasonStats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold">{seasonStats.avgAttendance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold">{seasonStats.totalDistance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Load</p>
                <p className="text-2xl font-bold">{seasonStats.totalLoad}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Season Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Season Training Load Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Load progression chart will appear here</p>
              <p className="text-sm text-gray-500">Connected to Firebase GPS data</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Kanban Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Weekly Training Overview - Season 2025
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weeklyData.map((week) => (
              <Card 
                key={week.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-nh-red"
                onClick={() => {
                  window.location.hash = week.id;
                  onWeekSelect(week.id);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(week.status)}>
                      {week.status.replace('-', ' ')}
                    </Badge>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <CardTitle className="text-lg">{week.title}</CardTitle>
                  <p className="text-sm text-gray-600">{week.date}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Sessions</p>
                      <p className="font-semibold">{week.sessions}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Attendance</p>
                      <p className="font-semibold">{week.attendance}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Avg Distance</p>
                      <p className="font-semibold">
                        {week.avgDistance > 0 ? `${week.avgDistance}m` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Avg Load</p>
                      <p className="font-semibold">
                        {week.avgLoad > 0 ? week.avgLoad : "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    disabled={week.status === "upcoming"}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    {week.status === "upcoming" ? "Coming Soon" : "View Details"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Load Correlation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Training Load vs Match Performance Correlation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-green-800">Optimal Load Range</span>
              </div>
              <p className="text-sm text-green-700">
                Weeks with 480-620 player load correlated with 85% win rate
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-semibold text-yellow-800">Overtraining Risk</span>
              </div>
              <p className="text-sm text-yellow-700">
                Weeks with over 650 load showed 60% win rate (fatigue impact)
              </p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-semibold text-red-800">Under-preparation</span>
              </div>
              <p className="text-sm text-red-700">
                Weeks with less than 450 load showed 45% win rate (insufficient prep)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}