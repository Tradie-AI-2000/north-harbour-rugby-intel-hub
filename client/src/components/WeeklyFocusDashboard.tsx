import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  ArrowRight,
  Calendar,
  Users,
  Activity,
  Target,
  TrendingUp,
  Play,
  MapPin,
  Clock,
  Zap
} from "lucide-react";

interface WeeklyFocusProps {
  weekId: string;
  onBackToSeason: () => void;
  onSessionSelect: (sessionId: string) => void;
}

export function WeeklyFocusDashboard({ weekId, onBackToSeason, onSessionSelect }: WeeklyFocusProps) {
  // Mock weekly data - will be replaced with Firebase queries
  const weekData = {
    title: "Week 1 - Pre-Season Foundation",
    dateRange: "July 20-26, 2025",
    status: "completed",
    totalSessions: 3,
    attendance: 92,
    avgDistance: 6800,
    avgLoad: 520,
    topPerformer: "Hoskins Sotutu",
    objectives: [
      "Build aerobic base",
      "Establish movement patterns", 
      "Assess individual fitness levels",
      "Team bonding activities"
    ]
  };

  const sessions = [
    {
      id: "statsports_session1",
      title: "Session 1 - Fitness Testing",
      date: "July 21, 2025",
      time: "9:00 AM",
      type: "GPS Tracking",
      attendance: 38,
      avgDistance: 5200,
      avgLoad: 420,
      status: "completed",
      location: "Eden Park Training Ground"
    },
    {
      id: "statsports_session2", 
      title: "Session 2 - Conditioning Focus",
      date: "July 23, 2025", 
      time: "10:00 AM",
      type: "GPS Tracking",
      attendance: 35,
      avgDistance: 7200,
      avgLoad: 580,
      status: "completed",
      location: "Eden Park Training Ground"
    },
    {
      id: "statsports_session3",
      title: "Session 3 - Skills Integration",
      date: "July 25, 2025",
      time: "2:00 PM", 
      type: "GPS Tracking",
      attendance: 40,
      avgDistance: 8000,
      avgLoad: 650,
      status: "completed",
      location: "Eden Park Training Ground"
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

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={onBackToSeason}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Season Overview
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{weekData.title}</h1>
          <p className="text-gray-600">{weekData.dateRange}</p>
        </div>
        <Badge className={getStatusColor(weekData.status)}>
          {weekData.status}
        </Badge>
      </div>

      {/* Week Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sessions</p>
                <p className="text-2xl font-bold">{weekData.totalSessions}</p>
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
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-2xl font-bold">{weekData.attendance}%</p>
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
                <p className="text-sm text-gray-600">Avg Distance</p>
                <p className="text-2xl font-bold">{weekData.avgDistance}m</p>
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
                <p className="text-sm text-gray-600">Avg Load</p>
                <p className="text-2xl font-bold">{weekData.avgLoad}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Week Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weekData.objectives.map((objective, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-nh-red rounded-full"></div>
                <span>{objective}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Training Sessions - {weekData.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card 
                key={session.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                onClick={() => {
                  window.location.hash = `${weekId}#${session.id}`;
                  onSessionSelect(session.id);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{session.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.location}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Attendance</p>
                      <p className="text-xl font-bold text-blue-800">{session.attendance}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Avg Distance</p>
                      <p className="text-xl font-bold text-green-800">{session.avgDistance}m</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-600">Avg Load</p>
                      <p className="text-xl font-bold text-orange-800">{session.avgLoad}</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        GPS Deep-Dive
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Performance Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Session-by-session progression chart</p>
              <p className="text-sm text-gray-500">Shows distance, load, and intensity trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}