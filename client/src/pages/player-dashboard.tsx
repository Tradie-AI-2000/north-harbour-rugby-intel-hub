import { useState } from "react";
import { useParams } from "wouter";
import { Bell, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationHeader from "@/components/navigation-header";
import PlayerSelector from "@/components/player-selector";
import PlayerOverview from "@/components/player-overview";
import AISummary from "@/components/ai-summary";
import PhysicalPerformance from "@/components/physical-performance";
import GameStatistics from "@/components/game-statistics";
import RecentActivity from "@/components/recent-activity";
import ReportsAccess from "@/components/reports-access";
import VideoAnalysisComponent from "@/components/video-analysis";
import GPSTracking from "@/components/gps-tracking";

import { useQuery } from "@tanstack/react-query";
import type { Player } from "@shared/schema";

export default function PlayerDashboard() {
  const { playerId: routePlayerId } = useParams();
  const [selectedPlayerId, setSelectedPlayerId] = useState(routePlayerId || "penaia_cakobau");
  
  const { data: playersResponse } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const players = Array.isArray(playersResponse) ? playersResponse : [];
  
  const player = players?.find(p => p.id === selectedPlayerId);
  const isLoading = !players;
  const error = null;
  
  const refetch = () => {
    // Refetch players list
  };

  const handlePlayerChange = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Player Data</h1>
          <p className="text-slate-600 mb-4">{error.message}</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  const playerName = player?.personalDetails ? 
    `${player.personalDetails.firstName} ${player.personalDetails.lastName}` : 
    'Player Profile';

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader
        title={playerName}
        breadcrumbs={[
          { label: "Main", href: "/" },
          { label: "Team", href: "/team" },
          { label: "Players", href: "/team#players" },
          { label: playerName }
        ]}
        backButton={{
          label: "Back to Players",
          href: "/team#players"
        }}
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-nh-red-600">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-nh-red-600">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-6">
        {/* Player Selector */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1">
                <PlayerSelector 
                  selectedPlayerId={selectedPlayerId} 
                  onPlayerChange={handlePlayerChange}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} disabled={isLoading}>
                  <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Player Overview Sidebar */}
          <div className="lg:col-span-1">
            <PlayerOverview playerId={selectedPlayerId} player={player} isLoading={isLoading} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabbed Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <Tabs defaultValue="physical" className="w-full">
                <div className="border-b border-slate-200">
                  <TabsList className="bg-transparent h-auto p-0 w-full justify-start overflow-x-auto">
                    <div className="flex space-x-6 px-6 min-w-max">
                      <TabsTrigger 
                        value="physical" 
                        className="py-4 px-2 border-b-2 border-transparent data-[state=active]:border-nh-blue data-[state=active]:text-nh-blue bg-transparent whitespace-nowrap"
                      >
                        Physical
                      </TabsTrigger>
                      <TabsTrigger 
                        value="skills" 
                        className="py-4 px-2 border-b-2 border-transparent data-[state=active]:border-nh-blue data-[state=active]:text-nh-blue bg-transparent whitespace-nowrap"
                      >
                        Skills
                      </TabsTrigger>
                      <TabsTrigger 
                        value="health" 
                        className="py-4 px-2 border-b-2 border-transparent data-[state=active]:border-nh-blue data-[state=active]:text-nh-blue bg-transparent whitespace-nowrap"
                      >
                        Health
                      </TabsTrigger>
                      <TabsTrigger 
                        value="game" 
                        className="py-4 px-2 border-b-2 border-transparent data-[state=active]:border-nh-blue data-[state=active]:text-nh-blue bg-transparent whitespace-nowrap"
                      >
                        Game Stats
                      </TabsTrigger>
                      <TabsTrigger 
                        value="gps" 
                        className="py-4 px-2 border-b-2 border-transparent data-[state=active]:border-nh-blue data-[state=active]:text-nh-blue bg-transparent whitespace-nowrap"
                      >
                        GPS Tracking
                      </TabsTrigger>
                      <TabsTrigger 
                        value="reports" 
                        className="py-4 px-2 border-b-2 border-transparent data-[state=active]:border-nh-blue data-[state=active]:text-nh-blue bg-transparent whitespace-nowrap"
                      >
                        Reports
                      </TabsTrigger>
                      <TabsTrigger 
                        value="video" 
                        className="py-4 px-2 border-b-2 border-transparent data-[state=active]:border-nh-blue data-[state=active]:text-nh-blue bg-transparent whitespace-nowrap"
                      >
                        Video
                      </TabsTrigger>
                      <TabsTrigger 
                        value="ai-analysis" 
                        className="py-4 px-2 border-b-2 border-transparent data-[state=active]:border-nh-blue data-[state=active]:text-nh-blue bg-transparent whitespace-nowrap"
                      >
                        AI Analysis
                      </TabsTrigger>
                      <TabsTrigger 
                        value="advanced-metrics" 
                        className="py-4 px-2 border-b-2 border-transparent data-[state=active]:border-nh-blue data-[state=active]:text-nh-blue bg-transparent whitespace-nowrap"
                      >
                        Advanced Metrics
                      </TabsTrigger>
                    </div>
                  </TabsList>
                </div>

                <TabsContent value="physical" className="p-6">
                  <PhysicalPerformance playerId={selectedPlayerId} player={player} />
                </TabsContent>

                <TabsContent value="skills" className="p-6">
                  <div className="text-center py-12">
                    <p className="text-slate-500">Skills & Development content coming soon...</p>
                  </div>
                </TabsContent>

                <TabsContent value="health" className="p-6">
                  <div className="text-center py-12">
                    <p className="text-slate-500">Health & Wellbeing content coming soon...</p>
                  </div>
                </TabsContent>

                <TabsContent value="game" className="p-6">
                  <GameStatistics playerId={selectedPlayerId} player={player} />
                </TabsContent>

                <TabsContent value="reports" className="p-6">
                  <ReportsAccess playerId={selectedPlayerId} player={player} />
                </TabsContent>

                <TabsContent value="video" className="p-6">
                  <VideoAnalysisComponent playerId={selectedPlayerId} player={player} />
                </TabsContent>

                <TabsContent value="gps" className="p-6">
                  <GPSTracking 
                    playerId={selectedPlayerId} 
                    playerName={player?.personalDetails?.firstName && player?.personalDetails?.lastName 
                      ? `${player.personalDetails.firstName} ${player.personalDetails.lastName}` 
                      : 'Player'
                    } 
                  />
                </TabsContent>

                <TabsContent value="ai-analysis" className="p-6">
                  <div className="space-y-6">
                    <AISummary playerId={selectedPlayerId} player={player} />
                  </div>
                </TabsContent>

                <TabsContent value="advanced-metrics" className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                        <h3 className="text-lg font-semibold text-nh-navy mb-4">Performance Metrics</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Work Rate Index</span>
                            <span className="font-semibold text-blue-600">87.5</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Efficiency Rating</span>
                            <span className="font-semibold text-green-600">91.2</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Impact Score</span>
                            <span className="font-semibold text-purple-600">84.7</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                        <h3 className="text-lg font-semibold text-nh-navy mb-4">Fitness Analytics</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Endurance Index</span>
                            <span className="font-semibold text-green-600">89.3</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Recovery Rate</span>
                            <span className="font-semibold text-blue-600">92.1</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Load Tolerance</span>
                            <span className="font-semibold text-orange-600">85.8</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Activity and Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity playerId={selectedPlayerId} player={player} />
              <ReportsAccess playerId={selectedPlayerId} player={player} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="flex justify-around">
          <button className="flex flex-col items-center space-y-1 text-nh-blue">
            <span>📊</span>
            <span className="text-xs">Performance</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-slate-400">
            <span>❤️</span>
            <span className="text-xs">Health</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-slate-400">
            <span>🏆</span>
            <span className="text-xs">Games</span>
          </button>
          <button className="flex flex-col items-center space-y-1 text-slate-400">
            <span>📄</span>
            <span className="text-xs">Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}
