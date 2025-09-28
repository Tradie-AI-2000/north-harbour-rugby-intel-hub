import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/navigation-header";
import { 
  Satellite, 
  Download, 
  Upload, 
  Calendar, 
  Users, 
  TrendingUp, 
  Activity,
  MapPin,
  Zap,
  Clock,
  Settings,
  AlertCircle,
  CheckCircle,
  Play,
  Pause
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function GPSManagement() {
  const [syncStartDate, setSyncStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [syncEndDate, setSyncEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [apiKey, setApiKey] = useState("");
  const [teamId, setTeamId] = useState("");
  const { toast } = useToast();

  const { data: teamSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/gps/team/summary'],
  });

  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['/api/players'],
  });

  const syncMutation = useMutation({
    mutationFn: async (data: { startDate: string; endDate: string; apiKey: string; teamId: string }) => {
      return await apiRequest('/api/gps/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "GPS Data Synced Successfully",
        description: `Synced ${data.sessionCount || 0} GPS sessions from StatSports`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gps/team/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: "Please check your StatSports API credentials and try again",
        variant: "destructive",
      });
    },
  });

  const handleSync = () => {
    if (!apiKey || !teamId) {
      toast({
        title: "Missing Credentials",
        description: "Please provide both API Key and Team ID",
        variant: "destructive",
      });
      return;
    }

    syncMutation.mutate({
      startDate: syncStartDate,
      endDate: syncEndDate,
      apiKey,
      teamId,
    });
  };

  if (summaryLoading || playersLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nh-red mx-auto"></div>
          <p className="text-gray-600">Loading GPS management dashboard...</p>
        </div>
      </div>
    );
  }

  const summary = teamSummary || {};
  const playerList = players || [];

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader
        title="StatSports GPS Management"
        breadcrumbs={[
          { label: "Main", href: "/" },
          { label: "Data Management", href: "/data-management" },
          { label: "GPS Management" }
        ]}
        backButton={{
          label: "Back to Data Management",
          href: "/data-management"
        }}
        actions={
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Satellite className="w-3 h-3 mr-1" />
            {playerList.length || 0} Players
          </Badge>
        }
      />

      <div className="space-y-6 p-6">

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
          <TabsTrigger value="units">GPS Units</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold">{summary.totalSessions || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Distance</p>
                    <p className="text-2xl font-bold">{((summary.totalDistance || 0) / 1000).toFixed(1)} km</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Player Load</p>
                    <p className="text-2xl font-bold">{summary.averagePlayerLoad || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Users className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Players</p>
                    <p className="text-2xl font-bold">{playerList.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent GPS Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Training Session</p>
                      <p className="text-sm text-gray-600">Today at 09:00 AM</p>
                    </div>
                  </div>
                  <Badge>Live</Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Data Sync Complete</p>
                      <p className="text-sm text-gray-600">Yesterday at 6:30 PM</p>
                    </div>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Match Day Analysis</p>
                      <p className="text-sm text-gray-600">2 days ago</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Analyzed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Sync Tab */}
        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                StatSports Data Sync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">StatSports API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your StatSports API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-id">Team ID</Label>
                  <Input
                    id="team-id"
                    placeholder="Enter your StatSports Team ID"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={syncStartDate}
                    onChange={(e) => setSyncStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={syncEndDate}
                    onChange={(e) => setSyncEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Sync Button */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleSync}
                  disabled={syncMutation.isPending}
                  className="bg-nh-red hover:bg-nh-red/90"
                >
                  {syncMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Sync GPS Data
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-600">
                  This will fetch the latest GPS data from StatSports for the selected date range
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900">StatSports Integration Setup</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>1. Log into your StatSports portal</p>
                      <p>2. Navigate to API Settings and generate an API key</p>
                      <p>3. Find your Team ID in the team management section</p>
                      <p>4. Enter the credentials above and select your sync date range</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GPS Units Tab */}
        <TabsContent value="units" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Satellite className="w-5 h-5" />
                GPS Unit Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playerList.slice(0, 6).map((player: any, index: number) => (
                  <Card key={player.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-sm">Unit {index + 1}</span>
                        </div>
                        <Badge variant="outline" className="text-green-600">Active</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Player:</span>
                          <span className="font-medium">{player.personalDetails?.firstName} {player.personalDetails?.lastName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Position:</span>
                          <span>{player.rugbyProfile?.primaryPosition || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Battery:</span>
                          <span className="text-green-600">85%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Signal:</span>
                          <span className="text-green-600">Strong</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Team Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Distance per Session</span>
                    <span className="font-semibold">8.4 km</span>
                  </div>
                  <Progress value={84} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Player Load</span>
                    <span className="font-semibold">850</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sprint Count per Session</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Data Quality */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Data Quality Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">94%</div>
                    <p className="text-sm text-gray-600">Overall Quality Score</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">GPS Signal Strength</span>
                      <span className="text-green-600">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Satellite Count</span>
                      <span className="text-green-600">12/15</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Completeness</span>
                      <span className="text-green-600">98%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}