import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdvancedMetrics from "@/components/advanced-metrics";
import InjuryTracking from "@/components/injury-tracking";
import TrainingPrograms from "@/components/training-programs";
import PlayerComparison from "@/components/player-comparison";
import TeamCommunication from "@/components/team-communication";
import VideoAnalysisComponent from "@/components/video-analysis";
import RealTimeMatchAnalytics from "@/components/real-time-match-analytics";
import AIInjuryPrediction from "@/components/ai-injury-prediction";
import GPSTracking from "@/components/gps-tracking";
import CohesionAnalytics from "@/components/cohesion-analytics";
import nhLogo from "@assets/menulogo_wo.png";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Sample comprehensive player data for demonstration
const samplePlayer = {
  id: "james-mitchell",
  personalDetails: {
    firstName: "James",
    lastName: "Mitchell",
    dateOfBirth: "1995-03-15",
    email: "james.mitchell@northharbour.rugby",
    phone: "+64 21 555 0123",
    address: "123 Rugby Lane, Auckland, New Zealand",
    emergencyContact: {
      name: "Sarah Mitchell",
      relationship: "Wife",
      phone: "+64 21 555 0124"
    }
  },
  rugbyProfile: {
    primaryPosition: "Hooker",
    secondaryPositions: ["Lock"],
    playingLevel: "Semi-Professional",
    experience: "8 years",
    jerseyNumber: 2,
    preferredFoot: "Right",
    height: 185,
    weight: 105
  },
  skills: {
    ballHandling: 85,
    passing: 89,
    kicking: 72,
    lineoutThrowing: 92,
    scrummaging: 88,
    rucking: 86,
    defense: 91,
    communication: 94
  }
};

// Sample team roster for player selection
const teamRoster = [
  { id: "james-mitchell", name: "James Mitchell", jersey: 2, position: "Hooker", status: "Available" },
  { id: "david-carter", name: "David Carter", jersey: 10, position: "Fly Half", status: "Available" },
  { id: "mike-thompson", name: "Mike Thompson", jersey: 7, position: "Openside Flanker", status: "Available" },
  { id: "alex-brown", name: "Alex Brown", jersey: 1, position: "Loosehead Prop", status: "Injured" },
  { id: "sam-wilson", name: "Sam Wilson", jersey: 15, position: "Fullback", status: "Available" },
  { id: "tom-clarke", name: "Tom Clarke", jersey: 4, position: "Lock", status: "Available" },
];

export default function FeaturesDemo() {
  const [activeFeature, setActiveFeature] = useState("overview");
  const [selectedPlayer, setSelectedPlayer] = useState("james-mitchell");
  
  const currentPlayer = teamRoster.find(p => p.id === selectedPlayer) || teamRoster[0];

  const features = [
    {
      id: "metrics",
      title: "Advanced Performance Metrics",
      description: "Real-time analytics with GPS tracking, heart rate monitoring, and rugby-specific metrics",
      highlights: ["Distance tracking", "Speed analysis", "Heat maps", "Performance trends"]
    },
    {
      id: "injury",
      title: "Injury Tracking & Medical Management",
      description: "Comprehensive injury monitoring with treatment plans and recovery tracking",
      highlights: ["Injury history", "Treatment plans", "Recovery progress", "Prevention strategies"]
    },
    {
      id: "training",
      title: "Training Program Planning",
      description: "Personalized training schedules with progress tracking and exercise management",
      highlights: ["Custom programs", "Weekly schedules", "Progress tracking", "Exercise library"]
    },
    {
      id: "comparison",
      title: "Player Comparison & Benchmarking",
      description: "Compare performance against teammates and industry standards",
      highlights: ["Peer comparison", "Position benchmarks", "Trend analysis", "Performance rankings"]
    },
    {
      id: "communication",
      title: "Team Communication Hub",
      description: "Centralized messaging system for team announcements and coordination",
      highlights: ["Team messages", "Announcements", "Priority alerts", "File sharing"]
    },
    {
      id: "video",
      title: "Video Analysis & Highlight Reels",
      description: "Professional video analysis tools with highlight compilation and performance insights",
      highlights: ["Match highlights", "Skill analysis", "Key moments", "Coach feedback"]
    },
    {
      id: "realtime",
      title: "🔥 Real-Time Match Analytics",
      description: "Live match monitoring with AI-powered tactical analysis and fatigue tracking",
      highlights: ["GPS fatigue monitoring", "AI tactical analysis", "Live heat maps", "Opposition insights"]
    },
    {
      id: "ai-prediction",
      title: "🧠 AI Injury Prediction",
      description: "Machine learning injury risk assessment with load management optimization",
      highlights: ["Risk forecasting", "Load optimization", "Biometric analysis", "Prevention protocols"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* North Harbour Rugby Header */}
      <div className="bg-nh-red text-white px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img 
            src={nhLogo} 
            alt="North Harbour Rugby"
            className="h-16 w-auto"
          />
          <div>
            <h1 className="text-3xl font-bold">North Harbour Rugby Performance Hub</h1>
            <p className="text-lg opacity-90">Advanced Player Analytics & Performance Management</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Player Context Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-nh-red rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {currentPlayer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentPlayer.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="bg-nh-red text-white px-2 py-1 rounded">Jersey #{currentPlayer.jersey}</span>
                    <span>{currentPlayer.position}</span>
                    <span>•</span>
                    <span>105kg, 185cm</span>
                    <span>•</span>
                    <span className={`font-medium ${currentPlayer.status === 'Available' ? 'text-green-600' : 'text-red-600'}`}>
                      {currentPlayer.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Select Player:</p>
                  <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {teamRoster.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{player.jersey}</span>
                            <span>{player.name}</span>
                            <span className="text-gray-500">({player.position})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-400">Currently viewing data for: <span className="font-semibold text-nh-red">{currentPlayer.name}</span></p>
              </div>
            </div>
          </div>
          <p className="text-xl text-slate-600 mb-6">
            Complete Player Performance Analytics Platform
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-nh-blue">8</div>
                <div className="text-sm text-slate-600">Advanced Features</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-nh-navy">100%</div>
                <div className="text-sm text-slate-600">Mobile Responsive</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">Pro</div>
                <div className="text-sm text-slate-600">Rugby Analytics</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeFeature} onValueChange={setActiveFeature} className="w-full">
          <TabsList className="grid w-full grid-cols-11 mb-8 bg-gray-100 p-1 rounded-lg border border-gray-200 gap-1 h-12">
            <TabsTrigger 
              value="overview"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center h-full"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="metrics"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center h-full"
            >
              Metrics
            </TabsTrigger>
            <TabsTrigger 
              value="injury"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center h-full"
            >
              Medical
            </TabsTrigger>
            <TabsTrigger 
              value="training"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center h-full"
            >
              Training
            </TabsTrigger>
            <TabsTrigger 
              value="comparison"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center h-full"
            >
              Compare
            </TabsTrigger>
            <TabsTrigger 
              value="communication"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center h-full"
            >
              Messages
            </TabsTrigger>
            <TabsTrigger 
              value="video"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm flex items-center justify-center h-full"
            >
              Video
            </TabsTrigger>
            <TabsTrigger 
              value="realtime"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-xs flex items-center justify-center h-full"
            >
              🔥 Live Match
            </TabsTrigger>
            <TabsTrigger 
              value="ai-prediction"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-xs flex items-center justify-center h-full"
            >
              🧠 AI Predict
            </TabsTrigger>
            <TabsTrigger 
              value="gps"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-xs flex items-center justify-center h-full"
            >
              📍 GPS
            </TabsTrigger>
            <TabsTrigger 
              value="cohesion"
              className="rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-xs flex items-center justify-center h-full"
            >
              🤝 Cohesion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Platform Features Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature) => (
                    <Card 
                      key={feature.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setActiveFeature(feature.id)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg text-nh-navy">{feature.title}</CardTitle>
                        <p className="text-slate-600 text-sm">{feature.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Key Features:</h4>
                          <div className="flex flex-wrap gap-2">
                            {feature.highlights.map((highlight, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technology Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="font-bold text-nh-blue">React + TypeScript</div>
                    <div className="text-sm text-slate-600">Frontend</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="font-bold text-green-600">PostgreSQL</div>
                    <div className="text-sm text-slate-600">Database</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="font-bold text-purple-600">Express.js</div>
                    <div className="text-sm text-slate-600">Backend</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="font-bold text-orange-600">Gemini AI</div>
                    <div className="text-sm text-slate-600">Analytics</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <AdvancedMetrics playerId="james-mitchell" player={samplePlayer as any} />
          </TabsContent>

          <TabsContent value="injury">
            <InjuryTracking playerId="james-mitchell" player={samplePlayer as any} />
          </TabsContent>

          <TabsContent value="training">
            <TrainingPrograms playerId="james-mitchell" player={samplePlayer as any} />
          </TabsContent>

          <TabsContent value="comparison">
            <PlayerComparison playerId="james-mitchell" player={samplePlayer as any} />
          </TabsContent>

          <TabsContent value="communication">
            <TeamCommunication playerId="james-mitchell" player={samplePlayer as any} />
          </TabsContent>

          <TabsContent value="video">
            <VideoAnalysisComponent playerId="james-mitchell" player={samplePlayer as any} />
          </TabsContent>

          <TabsContent value="realtime">
            <RealTimeMatchAnalytics matchId="nh-vs-blues-2024" isLive={true} />
          </TabsContent>

          <TabsContent value="ai-prediction">
            <AIInjuryPrediction playerId={currentPlayer.id} playerName={currentPlayer.name} />
          </TabsContent>

          <TabsContent value="gps">
            <GPSTracking playerId={currentPlayer.id} playerName={currentPlayer.name} />
          </TabsContent>

          <TabsContent value="cohesion">
            <CohesionAnalytics playerId={currentPlayer.id} playerName={currentPlayer.name} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}