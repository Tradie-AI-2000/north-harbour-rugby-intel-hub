// XML-Driven Match Performance Analytics
// Built around actual XML data structure from North Harbour rugby matches

import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Upload, FileText, Users, Target, Activity, Trophy, Zap, Shield, Footprints, Video, MapPin } from "lucide-react";
import NavigationHeader from "@/components/navigation-header";
import { XMLMatchData } from "@shared/xml-match-schema";
import { queryClient } from "@/lib/queryClient";
import TryAnalysisSimplified from "@/pages/try-analysis-simplified";
import VideoAnalysisComponent from "@/components/video-analysis";

// Sample data structure for UI demonstration only - will be replaced with real XML data
const sampleXMLData: XMLMatchData = {
  matchInfo: {
    homeTeam: "North Harbour",
    awayTeam: "Hawke's Bay", 
    venue: "North Harbour Stadium",
    date: "2024-08-11",
    competition: "NPC"
  },
  ballMovement: {
    teamStats: {
      ballRuns: { northHarbour: 375, hawkesBay: 515 },
      teamBallMovement: { northHarbour: 88, hawkesBay: 132 },
      possession: { northHarbour: 48, hawkesBay: 53 },
      fieldPosition: {
        zone_22_50: 1155,
        zone_50_22: 1128, 
        zone_22_GL: 745,
        zone_GL_22: 649
      }
    },
    playerStats: [
      { playerId: "bryn_hall", playerName: "Bryn Hall", team: "North Harbour", ballRuns: 45, metres: 285, carries: 24, fieldPosition: ["50-22", "22-50"] },
      { playerId: "folau_fakatava", playerName: "Folau Fakatava", team: "Hawke's Bay", ballRuns: 62, metres: 380, carries: 32, fieldPosition: ["22-GL", "50-22"] }
    ]
  },
  breakdowns: {
    teamStats: {
      ruckArrivals: { northHarbour: 193, hawkesBay: 249 },
      breakdowns: { northHarbour: 80, hawkesBay: 114 },
      turnoversWon: { northHarbour: 10, hawkesBay: 6 },
      turnoversConceded: { northHarbour: 11, hawkesBay: 16 }
    },
    playerStats: [
      { playerId: "bryn_hall", playerName: "Bryn Hall", team: "North Harbour", ruckArrivals: 28, turnoversWon: 2, cleanOuts: 15, secured: 25 }
    ]
  },
  defence: {
    teamStats: {
      madeTackles: { northHarbour: 157, hawkesBay: 108 },
      ineffectiveTackles: { northHarbour: 47, hawkesBay: 35 },
      tackleSuccessRate: { northHarbour: 77, hawkesBay: 76 }
    },
    playerStats: [
      { playerId: "cameron_suafoa", playerName: "Cameron Suafoa", team: "North Harbour", madeTackles: 18, ineffectiveTackles: 3, tackleSuccessRate: 86, dominantTackles: 8 }
    ]
  },
  attack: {
    teamStats: {
      lineBreaks: { northHarbour: 45, hawkesBay: 40 },
      tackleBreaks: { northHarbour: 45, hawkesBay: 40 },
      triesScored: { northHarbour: 6, hawkesBay: 7 },
      pointsScored: { northHarbour: 42, hawkesBay: 49 }
    },
    playerStats: [
      { playerId: "bryn_hall", playerName: "Bryn Hall", team: "North Harbour", lineBreaks: 8, tackleBreaks: 6, offloads: 3, triesScored: 2, tryAssists: 1 }
    ],
    tryAnalysis: [
      { id: "try_1", player: "Bryn Hall", team: "North Harbour", time: "15:23", fieldPosition: "22-GL", phase: "phase_3", converted: true }
    ]
  },
  setPiece: {
    lineouts: {
      teamStats: {
        total: { northHarbour: 10, hawkesBay: 20 },
        effective: { northHarbour: 8, hawkesBay: 17 },
        steals: { northHarbour: 2, hawkesBay: 1 },
        catchAndDrive: 14,
        catchAndPass: 9,
        offTheTop: 4
      },
      effectiveness: { northHarbour: 80, hawkesBay: 85 }
    },
    scrums: {
      teamStats: {
        total: { northHarbour: 7, hawkesBay: 10 },
        effective: { northHarbour: 6, hawkesBay: 9 },
        penalties: { northHarbour: 1, hawkesBay: 1 }
      },
      effectiveness: { northHarbour: 86, hawkesBay: 90 }
    }
  },
  kicking: {
    teamStats: {
      kicksInPlay: { northHarbour: 35, hawkesBay: 29 },
      goalKicks: { northHarbour: 7, hawkesBay: 8 },
      defensiveExits: { northHarbour: 27, hawkesBay: 19 }
    },
    playerStats: []
  },
  individualPerformance: {
    topPerformers: {
      mostActive: [
        { playerId: "folau_fakatava", playerName: "Folau Fakatava", team: "Hawke's Bay", totalEvents: 319, keyStats: { events: 319 } },
        { playerId: "bryn_hall", playerName: "Bryn Hall", team: "North Harbour", totalEvents: 231, keyStats: { events: 231 } }
      ],
      topTacklers: [
        { playerId: "cameron_suafoa", playerName: "Cameron Suafoa", team: "North Harbour", totalEvents: 146, keyStats: { tackles: 18 } }
      ],
      topBallCarriers: [
        { playerId: "bryn_hall", playerName: "Bryn Hall", team: "North Harbour", totalEvents: 231, keyStats: { carries: 24, metres: 285 } }
      ],
      topBreakMakers: [
        { playerId: "bryn_hall", playerName: "Bryn Hall", team: "North Harbour", totalEvents: 231, keyStats: { lineBreaks: 8 } }
      ]
    },
    playerProfiles: []
  }
};

interface XMLUploadSectionProps {
  matchId: string;
  onDataLoaded: (data: XMLMatchData) => void;
}

const XMLUploadSection = ({ matchId, onDataLoaded }: XMLUploadSectionProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus({ type: 'info', message: 'Processing XML match data...' });

    try {
      const formData = new FormData();
      formData.append('xmlFile', file);

      console.log('Uploading file:', file.name, 'to match:', matchId);

      const response = await fetch(`/api/v2/matches/${matchId}/xml-upload`, {
        method: 'POST',
        body: formData
      });

      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);

      if (result.success) {
        setUploadStatus({ type: 'success', message: `XML processed! Found ${result.summary?.totalEvents || 'unknown'} events from ${result.filename}` });
        
        // Fetch the processed data
        const dataResponse = await fetch(`/api/v2/matches/${matchId}/xml-data`);
        console.log('Data fetch response status:', dataResponse.status);
        
        if (dataResponse.ok) {
          const dataResult = await dataResponse.json();
          console.log('Data result:', dataResult);
          
          if (dataResult.success) {
            onDataLoaded(dataResult.data);
          }
        }
      } else {
        setUploadStatus({ type: 'error', message: result.error || 'Failed to process XML' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({ type: 'error', message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
      <CardContent className="p-8 text-center">
        <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload XML Match Data</h3>
        <p className="text-gray-600 mb-4">
          Upload the post-match XML file to populate all analytics sections with real match data
        </p>
        
        <input
          type="file"
          accept=".xml"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          id="xml-upload"
        />
        <Button 
          asChild 
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <label htmlFor="xml-upload" className="cursor-pointer">
            {uploading ? 'Processing...' : 'Choose XML File'}
          </label>
        </Button>
        
        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-lg ${
            uploadStatus.type === 'success' ? 'bg-green-100 text-green-800' :
            uploadStatus.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {uploadStatus.message}
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500">
          Supports: Post-match XML files from rugby analysis systems
        </div>
      </CardContent>
    </Card>
  );
};

const BallMovementSection = ({ data }: { data: XMLMatchData }) => {
  const chartData = [
    { zone: "22-50", events: data.ballMovement.teamStats.fieldPosition.zone_22_50 },
    { zone: "50-22", events: data.ballMovement.teamStats.fieldPosition.zone_50_22 },
    { zone: "22-GL", events: data.ballMovement.teamStats.fieldPosition.zone_22_GL },
    { zone: "GL-22", events: data.ballMovement.teamStats.fieldPosition.zone_GL_22 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Footprints className="h-5 w-5 text-blue-600" />
        <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
          Data from XML Match Report (Live Events: {data.ballMovement.teamStats.ballRuns.northHarbour + data.ballMovement.teamStats.ballRuns.hawkesBay})
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.ballMovement.teamStats.ballRuns.northHarbour}</div>
            <div className="text-sm text-gray-600">NH Ball Runs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{data.ballMovement.teamStats.ballRuns.hawkesBay}</div>
            <div className="text-sm text-gray-600">HB Ball Runs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.ballMovement.teamStats.possession.northHarbour}%</div>
            <div className="text-sm text-gray-600">NH Possession</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{data.ballMovement.teamStats.possession.hawkesBay}%</div>
            <div className="text-sm text-gray-600">HB Possession</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Field Position Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="zone" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="events" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Ball Carriers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.ballMovement.playerStats.map((player, index) => (
              <div key={player.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{player.playerName}</div>
                    <div className="text-sm text-gray-600">{player.team}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{player.metres}m</div>
                  <div className="text-sm text-gray-600">{player.ballRuns} ball runs</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AttackBreaksSection = ({ data }: { data: XMLMatchData }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-green-600" />
        <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
          Data from XML Try Analysis ({data.attack.teamStats.triesScored.northHarbour + data.attack.teamStats.triesScored.hawkesBay} tries, {data.attack.teamStats.lineBreaks.northHarbour + data.attack.teamStats.lineBreaks.hawkesBay} line breaks)
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.attack.teamStats.lineBreaks.northHarbour + data.attack.teamStats.lineBreaks.hawkesBay}</div>
            <div className="text-sm text-gray-600">Total Line Breaks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.attack.teamStats.triesScored.northHarbour + data.attack.teamStats.triesScored.hawkesBay}</div>
            <div className="text-sm text-gray-600">Total Tries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.attack.teamStats.triesScored.northHarbour}</div>
            <div className="text-sm text-gray-600">NH Tries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{data.attack.teamStats.triesScored.hawkesBay}</div>
            <div className="text-sm text-gray-600">HB Tries</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Try Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.attack.tryAnalysis.map((tryEvent, index) => (
              <div key={tryEvent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    T{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{tryEvent.player}</div>
                    <div className="text-sm text-gray-600">{tryEvent.team}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{tryEvent.time}</div>
                  <div className="text-sm text-gray-600">{tryEvent.fieldPosition} • {tryEvent.phase}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Defence section component with beautiful visualizations
const DefenceSection = ({ data }: { data: XMLMatchData }) => {
  const defenceData = data.defence;
  
  if (!defenceData) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Defence Data Available</h3>
      </div>
    );
  }

  const teams = [
    { name: 'North Harbour', key: 'northHarbour' as const, color: 'bg-red-600' },
    { name: "Hawke's Bay", key: 'hawkesBay' as const, color: 'bg-blue-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Team Defence Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Team Defence Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Made Tackles */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Made Tackles</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold">{defenceData.teamStats.madeTackles[team.key]}</span>
                </div>
              ))}
            </div>

            {/* Tackle Success Rate */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Success Rate</h4>
              {teams.map(team => (
                <div key={team.key} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                      <span className="text-sm">{team.name}</span>
                    </div>
                    <span className="font-bold">{defenceData.teamStats.tackleSuccessRate[team.key]}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${team.color}`}
                      style={{ width: `${defenceData.teamStats.tackleSuccessRate[team.key]}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ineffective Tackles */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Ineffective Tackles</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold text-red-600">{defenceData.teamStats.ineffectiveTackles[team.key]}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Player Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Top Defenders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {defenceData.playerStats.slice(0, 10).map((player, index) => (
              <div key={player.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${player.team === 'North Harbour' ? 'bg-red-600' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{player.playerName}</div>
                    <div className="text-sm text-gray-600">{player.team}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{player.madeTackles}</div>
                  <div className="text-sm text-gray-600">tackles</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{player.tackleSuccessRate}%</div>
                  <div className="text-sm text-gray-600">success</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-600">{player.dominantTackles}</div>
                  <div className="text-sm text-gray-600">dominant</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Individual Performance section component with comprehensive player analysis
const IndividualPerformanceSection = ({ data }: { data: XMLMatchData }) => {
  const individualData = data.individualPerformance;
  
  if (!individualData) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Individual Performance Data Available</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Performers Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Players */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Most Active Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {individualData.topPerformers.mostActive.slice(0, 5).map((player, index) => (
                <div key={player.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${player.team === 'North Harbour' ? 'bg-red-600' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{player.playerName}</div>
                      <div className="text-sm text-gray-600">{player.team}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-orange-600">{player.totalEvents}</div>
                    <div className="text-sm text-gray-600">total events</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Line Break Makers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Top Line Break Makers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {individualData.topPerformers.topBreakMakers.slice(0, 5).map((player, index) => (
                <div key={player.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${player.team === 'North Harbour' ? 'bg-red-600' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{player.playerName}</div>
                      <div className="text-sm text-gray-600">{player.team}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-600">{player.keyStats.lineBreaks}</div>
                    <div className="text-sm text-gray-600">line breaks</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Player Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Detailed Player Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {individualData.playerProfiles.slice(0, 6).map((player) => (
              <div key={player.playerId} className="border rounded-lg p-4 bg-gray-50">
                {/* Player Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{player.playerName}</h3>
                    <p className="text-sm text-gray-600">{player.team} • {player.position}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-2xl text-blue-600">{player.totalEvents}</div>
                    <div className="text-sm text-gray-600">total events</div>
                  </div>
                </div>

                {/* Player Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Attack Stats */}
                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Attack</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Line Breaks:</span>
                        <span className="font-semibold text-green-600">{player.attackStats.lineBreaks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tackle Breaks:</span>
                        <span className="font-semibold">{player.attackStats.tackleBreaks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tries Scored:</span>
                        <span className="font-semibold text-gold">{player.attackStats.triesScored}</span>
                      </div>
                    </div>
                  </div>

                  {/* Defence Stats */}
                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Defence</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Made Tackles:</span>
                        <span className="font-semibold text-red-600">{player.defenceStats.madeTackles}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate:</span>
                        <span className="font-semibold">{player.defenceStats.tackleSuccessRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Dominant:</span>
                        <span className="font-semibold text-purple-600">{player.defenceStats.dominantTackles}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ball Movement Stats */}
                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Ball Movement</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Ball Runs:</span>
                        <span className="font-semibold text-blue-600">{player.ballMovement.ballRuns}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Metres:</span>
                        <span className="font-semibold">{player.ballMovement.metres}m</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Carries:</span>
                        <span className="font-semibold">{player.ballMovement.carries}</span>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Stats */}
                  <div className="bg-white p-3 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Breakdowns</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Ruck Arrivals:</span>
                        <span className="font-semibold text-orange-600">{player.breakdown.ruckArrivals}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Turnovers Won:</span>
                        <span className="font-semibold">{player.breakdown.turnoversWon}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Secured:</span>
                        <span className="font-semibold">{player.breakdown.secured}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Breakdowns section component showing ruck and maul statistics
const BreakdownsSection = ({ data }: { data: XMLMatchData }) => {
  const breakdownData = data.breakdowns;
  
  if (!breakdownData) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Breakdown Data Available</h3>
      </div>
    );
  }

  const teams = [
    { name: 'North Harbour', key: 'northHarbour' as const, color: 'bg-red-600' },
    { name: "Hawke's Bay", key: 'hawkesBay' as const, color: 'bg-blue-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Team Breakdown Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Team Breakdown Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Ruck Arrivals */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Ruck Arrivals</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold">{breakdownData.teamStats.ruckArrivals[team.key]}</span>
                </div>
              ))}
            </div>

            {/* Total Breakdowns */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Breakdowns</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold">{breakdownData.teamStats.breakdowns[team.key]}</span>
                </div>
              ))}
            </div>

            {/* Turnovers Won */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Turnovers Won</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold text-green-600">{breakdownData.teamStats.turnoversWon[team.key]}</span>
                </div>
              ))}
            </div>

            {/* Turnovers Conceded */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Turnovers Conceded</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold text-red-600">{breakdownData.teamStats.turnoversConceded[team.key]}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Player Breakdown Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Top Breakdown Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {breakdownData.playerStats.slice(0, 12).map((player, index) => (
              <div key={player.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${player.team === 'North Harbour' ? 'bg-red-600' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{player.playerName}</div>
                    <div className="text-sm text-gray-600">{player.team}</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-right">
                  <div>
                    <div className="font-bold text-orange-600">{player.ruckArrivals}</div>
                    <div className="text-xs text-gray-600">arrivals</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-600">{player.turnoversWon}</div>
                    <div className="text-xs text-gray-600">turnovers</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-600">{player.cleanOuts}</div>
                    <div className="text-xs text-gray-600">clean outs</div>
                  </div>
                  <div>
                    <div className="font-bold text-purple-600">{player.secured}</div>
                    <div className="text-xs text-gray-600">secured</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Efficiency Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            Breakdown Efficiency Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teams.map(team => {
              const ruckArrivals = breakdownData.teamStats.ruckArrivals[team.key];
              const turnoversWon = breakdownData.teamStats.turnoversWon[team.key];
              const turnoversConceded = breakdownData.teamStats.turnoversConceded[team.key];
              const winRate = ruckArrivals > 0 ? Math.round((turnoversWon / ruckArrivals) * 100) : 0;
              const lossRate = ruckArrivals > 0 ? Math.round((turnoversConceded / ruckArrivals) * 100) : 0;
              
              return (
                <div key={team.key} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    {team.name} Efficiency
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Turnover Win Rate:</span>
                      <span className="font-bold text-green-600">{winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Turnover Loss Rate:</span>
                      <span className="font-bold text-red-600">{lossRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Turnovers:</span>
                      <span className={`font-bold ${turnoversWon - turnoversConceded >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {turnoversWon - turnoversConceded > 0 ? '+' : ''}{turnoversWon - turnoversConceded}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Set Piece section component showing lineout and scrum statistics
const SetPieceSection = ({ data }: { data: XMLMatchData }) => {
  const setPieceData = data.setPiece;
  
  if (!setPieceData) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Set Piece Data Available</h3>
      </div>
    );
  }

  const teams = [
    { name: 'North Harbour', key: 'northHarbour' as const, color: 'bg-red-600' },
    { name: "Hawke's Bay", key: 'hawkesBay' as const, color: 'bg-blue-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Lineout Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Lineout Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Lineouts */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Total Lineouts</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold">{setPieceData.lineouts.teamStats.total[team.key]}</span>
                </div>
              ))}
            </div>

            {/* Effective Lineouts */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Effective Lineouts</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold text-green-600">{setPieceData.lineouts.teamStats.effective[team.key]}</span>
                </div>
              ))}
            </div>

            {/* Lineout Effectiveness */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Effectiveness</h4>
              {teams.map(team => (
                <div key={team.key} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                      <span className="text-sm">{team.name}</span>
                    </div>
                    <span className="font-bold">{setPieceData.lineouts.effectiveness[team.key]}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${team.color}`}
                      style={{ width: `${setPieceData.lineouts.effectiveness[team.key]}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lineout Details */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="font-bold text-2xl text-blue-600">{setPieceData.lineouts.teamStats.catchAndDrive}</div>
              <div className="text-sm text-gray-600">Catch & Drive</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="font-bold text-2xl text-green-600">{setPieceData.lineouts.teamStats.catchAndPass}</div>
              <div className="text-sm text-gray-600">Catch & Pass</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="font-bold text-2xl text-orange-600">{setPieceData.lineouts.teamStats.offTheTop}</div>
              <div className="text-sm text-gray-600">Off The Top</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scrum Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Scrum Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Total Scrums */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Total Scrums</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold">{setPieceData.scrums.teamStats.total[team.key]}</span>
                </div>
              ))}
            </div>

            {/* Effective Scrums */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Effective Scrums</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold text-green-600">{setPieceData.scrums.teamStats.effective[team.key]}</span>
                </div>
              ))}
            </div>

            {/* Scrum Penalties */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Penalties</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold text-red-600">{setPieceData.scrums.teamStats.penalties[team.key]}</span>
                </div>
              ))}
            </div>

            {/* Scrum Effectiveness */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Effectiveness</h4>
              {teams.map(team => (
                <div key={team.key} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                      <span className="text-sm">{team.name}</span>
                    </div>
                    <span className="font-bold">{setPieceData.scrums.effectiveness[team.key]}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${team.color}`}
                      style={{ width: `${setPieceData.scrums.effectiveness[team.key]}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Set Piece Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            Set Piece Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teams.map(team => {
              const lineoutTotal = setPieceData.lineouts.teamStats.total[team.key];
              const lineoutEffective = setPieceData.lineouts.teamStats.effective[team.key];
              const scrumTotal = setPieceData.scrums.teamStats.total[team.key];
              const scrumEffective = setPieceData.scrums.teamStats.effective[team.key];
              const lineoutSteals = setPieceData.lineouts.teamStats.steals[team.key];
              
              return (
                <div key={team.key} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    {team.name} Set Piece
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Lineout Success:</span>
                      <span className="font-bold text-blue-600">{lineoutEffective}/{lineoutTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scrum Success:</span>
                      <span className="font-bold text-purple-600">{scrumEffective}/{scrumTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lineout Steals:</span>
                      <span className="font-bold text-green-600">{lineoutSteals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overall Set Piece %:</span>
                      <span className="font-bold text-indigo-600">
                        {Math.round(((lineoutEffective + scrumEffective) / (lineoutTotal + scrumTotal)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Kicking Game section component showing territorial and accuracy statistics
const KickingSection = ({ data }: { data: XMLMatchData }) => {
  const kickingData = data.kicking;
  
  if (!kickingData) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Kicking Data Available</h3>
      </div>
    );
  }

  const teams = [
    { name: 'North Harbour', key: 'northHarbour' as const, color: 'bg-red-600' },
    { name: "Hawke's Bay", key: 'hawkesBay' as const, color: 'bg-blue-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Kicking Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Kicking Game Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kicks in Play */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Kicks in Play</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold">{kickingData.teamStats.kicksInPlay[team.key]}</span>
                </div>
              ))}
            </div>

            {/* Goal Kicks */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Goal Kicks</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold text-blue-600">{kickingData.teamStats.goalKicks[team.key]}</span>
                </div>
              ))}
            </div>

            {/* Defensive Exits */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Defensive Exits</h4>
              {teams.map(team => (
                <div key={team.key} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold text-purple-600">{kickingData.teamStats.defensiveExits[team.key]}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kicking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Territorial Kicking Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teams.map(team => {
              const kicksInPlay = kickingData.teamStats.kicksInPlay[team.key];
              const goalKicks = kickingData.teamStats.goalKicks[team.key];
              const defensiveExits = kickingData.teamStats.defensiveExits[team.key];
              const totalKicks = kicksInPlay + goalKicks + defensiveExits;
              
              return (
                <div key={team.key} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    {team.name} Kicking
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Kicks:</span>
                      <span className="font-bold text-gray-800">{totalKicks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Territorial Kicks:</span>
                      <span className="font-bold text-green-600">{kicksInPlay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scoring Attempts:</span>
                      <span className="font-bold text-blue-600">{goalKicks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exit Strategy:</span>
                      <span className="font-bold text-purple-600">{defensiveExits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Territorial %:</span>
                      <span className="font-bold text-orange-600">
                        {totalKicks > 0 ? Math.round((kicksInPlay / totalKicks) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Try Analysis section component - independent of XML data
const TryAnalysisSection = ({ matchId }: { matchId: string }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-green-600" />
        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Interactive Try Analysis - Independent of XML Upload
        </div>
      </div>
      
      <TryAnalysisSimplified matchId={matchId} />
    </div>
  );
};

// Video Analysis section component - independent of XML data  
const VideoAnalysisSection = ({ matchId }: { matchId: string }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Video className="h-5 w-5 text-purple-600" />
        <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
          Video Analysis - Independent of XML Upload
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-600" />
            Match Video Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Match Highlights Card */}
            <Card>
              <CardContent className="p-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-70" />
                      <p className="text-lg font-medium">Match Highlights</p>
                      <p className="text-sm opacity-70">3:00 min</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Moments</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>First try scored</span>
                      <Badge className="bg-green-500">0:45</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Key defensive play</span>
                      <Badge className="bg-blue-500">2:00</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tactical Analysis Card */}
            <Card>
              <CardContent className="p-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-70" />
                      <p className="text-lg font-medium">Tactical Breakdown</p>
                      <p className="text-sm opacity-70">5:00 min</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Analysis Points</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Lineout strategy</span>
                      <Badge className="bg-purple-500">1:00</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Scrum techniques</span>
                      <Badge className="bg-orange-500">3:00</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">Upload match videos for AI-powered analysis and key moment detection</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Static tabs for consistent XML structure - no need for dynamic generation
const staticTabs = [
  { key: 'ballMovement', label: 'Ball Movement', icon: Footprints },
  { key: 'attack', label: 'Attack', icon: Zap },
  { key: 'defence', label: 'Defence', icon: Shield },
  { key: 'individualPerformance', label: 'Individual', icon: Trophy },
  { key: 'breakdowns', label: 'Breakdowns', icon: Activity },
  { key: 'setPiece', label: 'Set Piece', icon: Users },
  { key: 'kicking', label: 'Kicking Game', icon: Target },
  { key: 'tryAnalysis', label: 'Try Analysis', icon: MapPin },
  { key: 'videoAnalysis', label: 'Video Analysis', icon: Video }
];

export default function XMLMatchPerformance() {
  const params = useParams();
  const matchId = params.matchId || "nh_vs_hawkesbay_2024";
  
  const [xmlData, setXmlData] = useState<XMLMatchData | null>(null);
  
  // Use React Query to fetch XML data
  const { data: xmlDataResponse, isLoading, error } = useQuery({
    queryKey: ['xml-data', matchId],
    queryFn: async () => {
      const response = await fetch(`/api/v2/matches/${matchId}/xml-data`);
      if (!response.ok) {
        throw new Error('Failed to fetch XML data');
      }
      return response.json();
    },
    retry: false
  });

  // Set XML data when loaded from API, or use sample data as fallback
  if (xmlDataResponse?.success && xmlDataResponse.data && !xmlData) {
    setXmlData(xmlDataResponse.data);
  } else if (error && !xmlData) {
    // Use sample data if API call fails
    setXmlData(sampleXMLData);
  }
  
  // Use static tabs since XML structure is consistent
  const availableTabs = staticTabs;

  const handleDataLoaded = (data: XMLMatchData) => {
    setXmlData(data);
    // Invalidate and refetch the query to update the cache
    queryClient.invalidateQueries({ queryKey: ['xml-data', matchId] });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading match data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        title="XML-Driven Match Performance"
        breadcrumbs={[
          { label: "Main", href: "/" },
          { label: "Analytics", href: "/analytics" },
          { label: "Match List", href: "/analytics/match-list" },
          { label: "XML Match Performance" }
        ]}
      />

      <div className="container mx-auto p-6 space-y-6">
        {/* Match Header */}
        <Card className="bg-gradient-to-r from-red-800 to-red-900 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">XML-Driven Match Analytics</h1>
                <div className="text-lg">
                  {xmlData ? `${xmlData.matchInfo.homeTeam} vs ${xmlData.matchInfo.awayTeam}` : 'Upload XML file to see match details'}
                </div>
                <div className="text-sm opacity-90">
                  {xmlData ? `${xmlData.matchInfo.date} • ${xmlData.matchInfo.competition}` : 'Real match data from XML analysis'}
                </div>
              </div>
              <div className="text-right">
                {xmlData ? (
                  <>
                    <div className="text-3xl font-bold">{xmlData.attack.teamStats.pointsScored.northHarbour}-{xmlData.attack.teamStats.pointsScored.hawkesBay}</div>
                    <Badge className="bg-green-600 hover:bg-green-700 mt-2">
                      XML Data Loaded
                    </Badge>
                  </>
                ) : (
                  <Badge className="bg-yellow-600 hover:bg-yellow-700">
                    Upload XML File
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section or Dynamic Tabs */}
        {!xmlData ? (
          <XMLUploadSection matchId={matchId} onDataLoaded={handleDataLoaded} />
        ) : availableTabs.length > 0 ? (
          <Tabs defaultValue={availableTabs[0]?.key} className="space-y-6">
            <TabsList className={`grid w-full ${availableTabs.length <= 3 ? 'grid-cols-' + availableTabs.length : availableTabs.length <= 5 ? 'grid-cols-5' : 'grid-cols-7'}`}>
              {availableTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger key={tab.key} value={tab.key} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Static Tab Content for all sections */}
            {availableTabs.map((tab) => (
              <TabsContent key={tab.key} value={tab.key}>
                {tab.key === 'ballMovement' && <BallMovementSection data={xmlData} />}
                {tab.key === 'attack' && <AttackBreaksSection data={xmlData} />}
                {tab.key === 'defence' && <DefenceSection data={xmlData} />}
                {tab.key === 'individualPerformance' && <IndividualPerformanceSection data={xmlData} />}
                {tab.key === 'breakdowns' && <BreakdownsSection data={xmlData} />}
                {tab.key === 'setPiece' && <SetPieceSection data={xmlData} />}
                {tab.key === 'kicking' && <KickingSection data={xmlData} />}
                {tab.key === 'tryAnalysis' && <TryAnalysisSection matchId={matchId} />}
                {tab.key === 'videoAnalysis' && <VideoAnalysisSection matchId={matchId} />}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analyzable Data Found</h3>
            <p className="text-gray-600">The uploaded XML file doesn't contain recognizable rugby performance data.</p>
          </div>
        )}
      </div>
    </div>
  );
}