import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Zap, Heart, Timer, TrendingUp, Activity, Target } from "lucide-react";
import { GPSData } from "@shared/schema";

interface GPSTrackingProps {
  playerId: string;
  playerName: string;
}

export default function GPSTracking({ playerId, playerName }: GPSTrackingProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: gpsData, isLoading } = useQuery({
    queryKey: ['/api/players', playerId, 'gps'],
    enabled: !!playerId,
  });

  const { data: teamSummary } = useQuery({
    queryKey: ['/api/gps/team/summary'],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const sessions = (gpsData as GPSData[]) || [];
  const latestSession = sessions?.[0] || null;
  
  // Debug logging
  console.log('GPS Data:', gpsData);
  console.log('Latest Session:', latestSession);
  console.log('Accelerations:', latestSession?.accelerations);
  console.log('Heart Rate:', latestSession?.heartRate);

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2) + ' km';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getZoneColor = (zone: string) => {
    const colors = {
      walking: 'bg-blue-100 text-blue-800',
      jogging: 'bg-green-100 text-green-800',
      running: 'bg-yellow-100 text-yellow-800',
      highSpeed: 'bg-orange-100 text-orange-800',
      sprinting: 'bg-red-100 text-red-800'
    };
    return colors[zone as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-nh-navy">GPS Tracking</h2>
          <p className="text-gray-600">StatSports movement analytics for {playerName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-3 py-1"
          />
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <MapPin className="w-12 h-12 mx-auto text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold">No GPS Data Available</h3>
              <p className="text-gray-600">StatSports GPS data will appear here once API credentials are configured</p>
            </div>
            <Button className="bg-nh-red hover:bg-nh-red/90">
              Configure StatSports Integration
            </Button>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="movement">Movement</TabsTrigger>
            <TabsTrigger value="load">Load & Recovery</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Distance</p>
                      <p className="text-2xl font-bold">{formatDistance(latestSession?.totalDistance || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Max Speed</p>
                      <p className="text-2xl font-bold">{latestSession?.maxSpeed?.toFixed(1) || '0.0'} km/h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Activity className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Player Load</p>
                      <p className="text-2xl font-bold">{latestSession?.playerLoad || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Target className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sprint Count</p>
                      <p className="text-2xl font-bold">{latestSession?.sprintCount || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distance Zones */}
            {latestSession && latestSession.totalDistanceZones && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Distance Zones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(latestSession.totalDistanceZones).map(([zone, distance]) => {
                      const percentage = latestSession.totalDistance > 0 ? (distance / latestSession.totalDistance) * 100 : 0;
                      return (
                        <div key={zone} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge className={getZoneColor(zone)}>
                                {zone.charAt(0).toUpperCase() + zone.slice(1)}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {formatDistance(distance)}
                              </span>
                            </div>
                            <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="movement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Accelerations */}
              {latestSession && latestSession.accelerations && (
                <Card>
                  <CardHeader>
                    <CardTitle>Accelerations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>High (4+ m/s²)</span>
                        <Badge variant="destructive">{latestSession.accelerations.high || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Medium (3-4 m/s²)</span>
                        <Badge variant="secondary">{latestSession.accelerations.medium || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Low (2-3 m/s²)</span>
                        <Badge variant="outline">{latestSession.accelerations.low || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Decelerations */}
              {latestSession && latestSession.decelerations && (
                <Card>
                  <CardHeader>
                    <CardTitle>Decelerations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>High (-4+ m/s²)</span>
                        <Badge variant="destructive">{latestSession.decelerations.high || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Medium (-3 to -4 m/s²)</span>
                        <Badge variant="secondary">{latestSession.decelerations.medium || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Low (-2 to -3 m/s²)</span>
                        <Badge variant="outline">{latestSession.decelerations.low || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Heart Rate Zones */}
            {latestSession?.heartRate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Heart Rate Zones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {Object.entries(latestSession.heartRate.zones || {}).map(([zone, time]) => (
                      <div key={zone} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          {zone.replace('zone', 'Zone ')}
                        </p>
                        <p className="text-lg font-bold">{formatTime(time || 0)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Avg: {latestSession.heartRate.average} bpm | Max: {latestSession.heartRate.maximum} bpm
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="load" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Player Load */}
              {latestSession && (
                <Card>
                  <CardHeader>
                    <CardTitle>Player Load Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Player Load</span>
                      <span className="text-2xl font-bold">{latestSession.playerLoad}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Load per Minute</span>
                      <span className="text-lg font-semibold">{latestSession.playerLoadPerMinute?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Session Duration</span>
                      <span className="text-lg font-semibold">{formatTime(latestSession.duration)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recovery Metrics */}
              {latestSession?.recovery && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recovery Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Rest Time</span>
                      <span className="text-lg font-semibold">{formatTime(latestSession.recovery.restTime)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Work:Rest Ratio</span>
                      <span className="text-lg font-semibold">1:{latestSession.recovery.workToRestRatio.toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Impact Data */}
            {latestSession?.impacts && (
              <Card>
                <CardHeader>
                  <CardTitle>Impact Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-2xl font-bold">{latestSession.impacts.total}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Light (5-8G)</p>
                      <p className="text-xl font-bold text-green-600">{latestSession.impacts.light}</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Moderate (8-10G)</p>
                      <p className="text-xl font-bold text-yellow-600">{latestSession.impacts.moderate}</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Heavy (10+G)</p>
                      <p className="text-xl font-bold text-red-600">{latestSession.impacts.heavy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Timer className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{session.sessionType} Session</h3>
                          <p className="text-sm text-gray-600">{session.date} • {formatTime(session.duration)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatDistance(session.totalDistance)}</p>
                        <p className="text-sm text-gray-600">Distance</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Max Speed</p>
                        <p className="font-semibold">{session.maxSpeed} km/h</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Player Load</p>
                        <p className="font-semibold">{session.playerLoad}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sprints</p>
                        <p className="font-semibold">{session.sprintCount}</p>
                      </div>
                    </div>

                    {session.qualityScores && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span>Data Quality</span>
                          <Badge variant={session.qualityScores.dataQuality > 90 ? "default" : "secondary"}>
                            {session.qualityScores.dataQuality}%
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}