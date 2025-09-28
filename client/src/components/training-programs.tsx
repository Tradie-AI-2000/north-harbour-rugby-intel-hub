import { useState } from "react";
import { Calendar, Clock, Target, Users, Plus, Play, Pause, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { format, addDays, startOfWeek } from "date-fns";
import type { Player } from "@shared/schema";

interface TrainingProgramsProps {
  playerId: string;
  player?: Player;
}

export default function TrainingPrograms({ playerId, player }: TrainingProgramsProps) {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [activeProgram, setActiveProgram] = useState("current");

  if (!player) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500">No training programs available</p>
      </div>
    );
  }

  // Sample training programs data
  const trainingPrograms = [
    {
      id: "prog-1",
      name: "Pre-Season Conditioning",
      description: "Comprehensive fitness program to prepare for the upcoming season",
      duration: 8,
      phase: "preseason",
      focusAreas: ["strength", "endurance", "speed"],
      progress: 75,
      currentWeek: 6,
      assignedPlayers: ["james-mitchell", "player-2", "player-3"],
      createdBy: "Coach Williams",
      sessions: [
        {
          id: "session-1",
          day: 1,
          week: 6,
          type: "strength",
          duration: 90,
          intensity: "high",
          completed: true,
          exercises: [
            { name: "Squats", sets: 4, reps: 8, weight: 120, notes: "Focus on depth" },
            { name: "Deadlifts", sets: 3, reps: 6, weight: 140, notes: "Maintain form" },
            { name: "Bench Press", sets: 4, reps: 10, weight: 100 },
            { name: "Pull-ups", sets: 3, reps: 12 },
          ]
        },
        {
          id: "session-2", 
          day: 2,
          week: 6,
          type: "conditioning",
          duration: 60,
          intensity: "medium",
          completed: false,
          exercises: [
            { name: "400m Run", sets: 4, duration: 90, notes: "90s rest between sets" },
            { name: "Burpees", sets: 3, reps: 15 },
            { name: "Mountain Climbers", sets: 3, duration: 30 },
          ]
        },
        {
          id: "session-3",
          day: 3,
          week: 6,
          type: "skills",
          duration: 75,
          intensity: "medium",
          completed: false,
          exercises: [
            { name: "Lineout Throwing", sets: 5, reps: 10, notes: "Focus on accuracy" },
            { name: "Scrum Practice", duration: 20, notes: "Hooking technique" },
            { name: "Passing Drills", duration: 25, notes: "Under pressure" },
          ]
        }
      ]
    },
    {
      id: "prog-2",
      name: "In-Season Maintenance",
      description: "Maintain fitness levels throughout the competitive season",
      duration: 16,
      phase: "inseason",
      focusAreas: ["skills", "recovery", "tactical"],
      progress: 35,
      currentWeek: 6,
      assignedPlayers: ["james-mitchell"],
      createdBy: "Coach Thompson",
      sessions: []
    }
  ];

  const currentProgram = trainingPrograms.find(p => p.id === activeProgram) || trainingPrograms[0];
  const weekStart = startOfWeek(new Date());

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "max": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "strength": return "💪";
      case "conditioning": return "🏃";
      case "skills": return "🏉";
      case "tactical": return "🧠";
      case "recovery": return "😴";
      default: return "📝";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-nh-navy">Training Programs & Scheduling</h2>
          <p className="text-slate-600">Personalized training plans and progress tracking</p>
        </div>
        <Button className="bg-nh-blue hover:bg-nh-navy">
          <Plus className="h-4 w-4 mr-2" />
          Create Program
        </Button>
      </div>

      {/* Program Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active Programs</p>
                <p className="text-3xl font-bold text-nh-navy">{trainingPrograms.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Target className="h-6 w-6 text-nh-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">This Week's Sessions</p>
                <p className="text-3xl font-bold text-nh-navy">3</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-nh-navy">87%</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-2 rounded-lg border border-gray-200 gap-1">
          <TabsTrigger 
            value="current"
            className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
          >
            Current Program
          </TabsTrigger>
          <TabsTrigger 
            value="schedule"
            className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
          >
            Weekly Schedule
          </TabsTrigger>
          <TabsTrigger 
            value="library"
            className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
          >
            Program Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Current Program Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{currentProgram.name}</CardTitle>
                  <p className="text-slate-600 mt-1">{currentProgram.description}</p>
                </div>
                <Badge className="bg-nh-blue text-white">
                  {currentProgram.phase}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-nh-navy mb-2">Program Progress</h4>
                    <Progress value={currentProgram.progress} className="mb-2" />
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Week {currentProgram.currentWeek} of {currentProgram.duration}</span>
                      <span>{currentProgram.progress}% Complete</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-nh-navy mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentProgram.focusAreas.map((area, index) => (
                        <Badge key={index} variant="outline" className="capitalize">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-nh-navy mb-2">Assigned Players</h4>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">{currentProgram.assignedPlayers.length} players</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-nh-navy mb-2">This Week's Sessions</h4>
                    <div className="space-y-2">
                      {currentProgram.sessions.map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{getTypeIcon(session.type)}</span>
                            <div>
                              <p className="font-medium text-sm capitalize">{session.type} Training</p>
                              <p className="text-xs text-slate-600">{session.duration} minutes</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getIntensityColor(session.intensity)}>
                              {session.intensity}
                            </Badge>
                            {session.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Session View */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              {currentProgram.sessions.length > 0 ? (
                <div className="space-y-4">
                  {currentProgram.sessions[0].exercises.map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{exercise.name}</h4>
                        {exercise.notes && (
                          <p className="text-sm text-slate-600 mt-1">{exercise.notes}</p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        {exercise.sets && <p>{exercise.sets} sets</p>}
                        {exercise.reps && <p>{exercise.reps} reps</p>}
                        {exercise.weight && <p>{exercise.weight}kg</p>}
                        {exercise.duration && <p>{exercise.duration}s</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">No session scheduled for today</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          {/* Weekly Calendar View */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weekly Training Schedule</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <span className="text-sm font-medium">
                    Week {currentProgram.currentWeek}
                  </span>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="font-medium text-sm text-slate-600 mb-2">{day}</div>
                    <div className="min-h-32 p-2 border rounded-lg bg-slate-50">
                      {currentProgram.sessions
                        .filter(session => session.day === index + 1)
                        .map((session, sessionIndex) => (
                          <div
                            key={sessionIndex}
                            className={`p-2 mb-1 rounded text-xs ${
                              session.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <div className="font-medium capitalize">{session.type}</div>
                            <div>{session.duration}min</div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          {/* Program Library */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trainingPrograms.map((program) => (
              <Card key={program.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                      <p className="text-slate-600 text-sm mt-1">{program.description}</p>
                    </div>
                    <Badge className={program.id === activeProgram ? "bg-nh-blue text-white" : "bg-slate-100"}>
                      {program.phase}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Duration:</span>
                      <span className="font-medium">{program.duration} weeks</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Progress:</span>
                      <span className="font-medium">{program.progress}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Created by:</span>
                      <span className="font-medium">{program.createdBy}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {program.focusAreas.map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs capitalize">
                          {area}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button 
                        size="sm" 
                        variant={program.id === activeProgram ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setActiveProgram(program.id)}
                      >
                        {program.id === activeProgram ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}