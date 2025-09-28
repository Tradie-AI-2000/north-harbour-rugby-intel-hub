import { useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  User,
  Activity,
  TrendingUp,
  Target,
  Heart,
  Zap,
  Award,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import type { Player } from "@shared/schema";
import { type PlayerValueMetrics, calculatePlayerValue } from "@/lib/playerValueCalculation";
import PlayerValueScorecard from "@/components/player-value-scorecard";

export default function ExperimentalPlayerProfile() {
  const { playerId } = useParams<{ playerId: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: player, isLoading } = useQuery<Player>({
    queryKey: ['/api/players', playerId],
  });

  const { data: gpsData } = useQuery({
    queryKey: ['/api/gps/player', playerId],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nh-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading player profile...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Player Not Found</h2>
          <p className="text-gray-600 mb-4">The requested player profile could not be found.</p>
          <Link href="/players">
            <Button className="bg-nh-red hover:bg-nh-red-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Players
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const playerName = `${player.personalDetails?.firstName || ''} ${player.personalDetails?.lastName || ''}`.trim();
  const position = player.rugbyProfile?.primaryPosition || player.personalDetails?.position || 'Unknown';
  const jerseyNumber = player.rugbyProfile?.jerseyNumber || player.personalDetails?.jerseyNumber || 0;
  const fitnessStatus = player.status?.fitness || 'unknown';
  const medicalStatus = player.status?.medical || 'unknown';

  // Calculate overall rating from skills
  const skills = player.skills || {};
  const skillValues = Object.values(skills).filter(val => typeof val === 'number');
  const overallRating = skillValues.length > 0 
    ? Math.round(skillValues.reduce((sum, val) => sum + val, 0) / skillValues.length)
    : 0;

  // Get latest physical attributes
  const latestPhysical = player.physicalAttributes?.[player.physicalAttributes.length - 1];
  const latestGameStats = player.gameStats?.[player.gameStats.length - 1];

  // Calculate performance trends
  const performanceMetrics = [
    { label: "Overall Rating", value: overallRating, max: 10, color: "bg-blue-500" },
    { label: "Ball Handling", value: skills.ballHandling || 0, max: 10, color: "bg-green-500" },
    { label: "Passing", value: skills.passing || 0, max: 10, color: "bg-purple-500" },
    { label: "Defense", value: skills.defense || 0, max: 10, color: "bg-red-500" },
    { label: "Communication", value: skills.communication || 0, max: 10, color: "bg-orange-500" }
  ];

  const statusColor = fitnessStatus === 'available' && medicalStatus === 'cleared' 
    ? 'text-green-600 bg-green-50 border-green-200'
    : fitnessStatus === 'injured' || medicalStatus === 'injured'
    ? 'text-red-600 bg-red-50 border-red-200'
    : 'text-orange-600 bg-orange-50 border-orange-200';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/players">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Players
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Experimental Player Profile</h1>
              <p className="text-gray-600">Enhanced player analytics and insights</p>
            </div>
          </div>
          <Badge className="text-sm px-3 py-1 bg-purple-100 text-purple-800">
            EXPERIMENTAL
          </Badge>
        </div>

        {/* Player Hero Section */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-nh-red to-red-700 p-6 text-white">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24 border-4 border-white">
                <AvatarImage src={`/api/players/${playerId}/avatar`} />
                <AvatarFallback className="text-2xl font-bold bg-white text-nh-red">
                  {playerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h2 className="text-3xl font-bold">{playerName}</h2>
                  <div className="text-4xl font-bold opacity-80">#{jerseyNumber}</div>
                </div>
                <div className="flex items-center space-x-4 text-lg opacity-90">
                  <span>{position}</span>
                  <span>•</span>
                  <span>Overall Rating: {overallRating}/10</span>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <Badge className={`${statusColor} border`}>
                    {fitnessStatus === 'available' && medicalStatus === 'cleared' ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Available
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {fitnessStatus === 'injured' ? 'Injured' : 'Monitoring'}
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-80 mb-1">Years in Team</div>
                <div className="text-2xl font-bold">{player.rugbyProfile?.yearsInTeam || 0}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{latestGameStats?.matchesPlayed || 0}</div>
              <p className="text-sm text-blue-700">Matches Played</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{latestGameStats?.tries || 0}</div>
              <p className="text-sm text-green-700">Tries Scored</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{latestGameStats?.tackles || 0}</div>
              <p className="text-sm text-purple-700">Tackles Made</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">{overallRating}</div>
              <p className="text-sm text-orange-700">Overall Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="physical">Physical</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills Radar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Skills Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.map((metric, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{metric.label}</span>
                          <span className="text-gray-600">{metric.value}/{metric.max}</span>
                        </div>
                        <Progress value={(metric.value / metric.max) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-sm">Training Session Completed</div>
                        <div className="text-xs text-gray-600">2 hours ago</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-sm">Fitness Assessment</div>
                        <div className="text-xs text-gray-600">1 day ago</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-sm">Match Performance Review</div>
                        <div className="text-xs text-gray-600">3 days ago</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Season Performance Analysis</CardTitle>
                <CardDescription>
                  Comprehensive performance metrics and trends for the current season
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Match Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Matches Played</span>
                        <span className="font-medium">{latestGameStats?.matchesPlayed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minutes Played</span>
                        <span className="font-medium">{latestGameStats?.minutesPlayed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tries</span>
                        <span className="font-medium">{latestGameStats?.tries || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tackles</span>
                        <span className="font-medium">{latestGameStats?.tackles || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Position Specific</h3>
                    <div className="space-y-3">
                      {position === 'Hooker' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lineout Wins</span>
                            <span className="font-medium">{latestGameStats?.lineoutWins || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lineout Throws</span>
                            <span className="font-medium">{Math.round((latestGameStats?.lineoutWins || 0) * 1.2)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Turnovers</span>
                        <span className="font-medium">{latestGameStats?.turnovers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Penalties</span>
                        <span className="font-medium">{latestGameStats?.penalties || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Performance Trends</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Form</span>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-green-600">Improving</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Consistency</span>
                        <span className="font-medium">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fitness Level</span>
                        <span className="font-medium">Excellent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Player Value Analysis */}
            {(() => {
              // Convert existing player data to Player Value metrics format
              const latestGameStats = player.gameStats?.[player.gameStats.length - 1];
              const latestPhysical = player.physicalAttributes?.[player.physicalAttributes.length - 1];
              
              const playerValueMetrics: PlayerValueMetrics = {
                position: player.rugbyProfile?.primaryPosition || 'Back Row',
                secondaryPosition: player.rugbyProfile?.secondaryPositions?.[0],
                weight: latestPhysical?.weight || 100,
                contractValue: 85000, // Sample contract value
                
                // Performance Metrics (using existing data + sample MoneyBall data)
                minutesPlayed: latestGameStats?.minutesPlayed || 542,
                gamesPlayed: latestGameStats?.matchesPlayed || 7,
                totalContributions: 389, // Sample from CSV
                positiveContributions: 337,
                negativeContributions: 52,
                xFactorContributions: 21,
                penaltyCount: latestGameStats?.penalties || 8,
                
                // Physical Metrics
                sprintTime10m: 1.81, // Sample sprint time
                totalCarries: 76,
                dominantCarryPercent: 7.89,
                tackleCompletionPercent: 89.0,
                breakdownSuccessPercent: 93.06,
                triesScored: latestGameStats?.tries || 1,
                tryAssists: 0,
                turnoversWon: latestGameStats?.turnovers || 1,
                
                // Cohesion Factors (sample data - would come from coaching staff)
                attendanceScore: 9.5,
                scScore: 8.8,
                medicalScore: 9.8,
                personalityScore: 9.2
              };

              return <PlayerValueScorecard metrics={playerValueMetrics} />;
            })()}
          </TabsContent>

          <TabsContent value="physical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Physical Attributes</CardTitle>
                <CardDescription>
                  Physical measurements and body composition tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestPhysical ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-900">{latestPhysical.weight}kg</div>
                      <p className="text-sm text-blue-700">Weight</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-900">{latestPhysical.height}cm</div>
                      <p className="text-sm text-green-700">Height</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-900">{latestPhysical.bodyFat}%</div>
                      <p className="text-sm text-orange-700">Body Fat</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-900">{latestPhysical.leanMass}kg</div>
                      <p className="text-sm text-purple-700">Lean Mass</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No physical measurements recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Player Information</CardTitle>
                <CardDescription>
                  Personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Personal Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Full Name:</span>
                        <span className="font-medium">{playerName}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Date of Birth:</span>
                        <span className="font-medium">{player.personalDetails?.dateOfBirth || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium">{player.personalDetails?.address || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{player.personalDetails?.email || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{player.personalDetails?.phone || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Emergency Contact:</span>
                        <span className="font-medium">
                          {player.personalDetails?.emergencyContact?.name || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}