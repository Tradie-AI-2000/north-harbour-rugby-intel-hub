import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap, 
  Heart, 
  Target, 
  Users,
  BarChart3,
  LineChart,
  Calendar,
  Download,
  Upload,
  Settings,
  Eye,
  Filter,
  RefreshCw,
  Dumbbell,
  Trophy,
  MapPin,
  Timer,
  Gauge
} from "lucide-react";
import { format, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Types
interface Player {
  id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
  };
  rugbyProfile: {
    primaryPosition: string;
    jerseyNumber: number;
  };
  status: {
    fitness: string;
    medical: string;
  };
}

interface FitnessTest {
  id: string;
  playerId: string;
  testType: 'bronco' | 'speed_40m' | 'speed_10m' | 'yo_yo' | 'bench_press' | 'squat' | 'deadlift';
  score: number;
  unit: string;
  date: string;
  notes?: string;
}

interface WorkRateData {
  avgWorkRate: number;
  trend: number;
  highIntensity: number;
  sprintDistance: number;
  workEfficiency: number;
}

interface GPSData {
  avgDistance: number;
  trend: number;
  maxSpeed: number;
  playerLoad: number;
  sprintCount: number;
  status: 'Healthy' | 'Warning' | 'Critical';
}

export default function StrengthConditioning() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [fitnessTestData, setFitnessTestData] = useState({
    testType: '',
    score: '',
    unit: '',
    notes: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch players
  const { data: playersResponse = [] } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  const players = Array.isArray(playersResponse) ? playersResponse : [];

  // Mock data for the cards (replace with actual API calls)
  const fitnessConditioningData = {
    averageFitnessScore: 89,
    trend: 5,
    trainingAttendance: 94,
    loadManagement: 'Optimal',
    recoveryRate: 92,
    status: 'Healthy' as const
  };

  const workRateData: WorkRateData = {
    avgWorkRate: 8.4,
    trend: 0.3,
    highIntensity: 24,
    sprintDistance: 485,
    workEfficiency: 87
  };

  const gpsData: GPSData = {
    avgDistance: 8.2,
    trend: 0.3,
    maxSpeed: 32.4,
    playerLoad: 485,
    sprintCount: 23,
    status: 'Healthy'
  };

  // Submit fitness test mutation
  const submitFitnessTest = useMutation({
    mutationFn: async (testData: any) => {
      const response = await fetch('/api/sc/fitness-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      if (!response.ok) throw new Error('Failed to submit fitness test');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Fitness test data uploaded successfully"
      });
      setFitnessTestData({ testType: '', score: '', unit: '', notes: '' });
      setSelectedPlayer('');
    }
  });

  const handleFitnessTestSubmit = () => {
    if (!selectedPlayer || !fitnessTestData.testType || !fitnessTestData.score) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    submitFitnessTest.mutate({
      playerId: selectedPlayer,
      testType: fitnessTestData.testType,
      score: parseFloat(fitnessTestData.score),
      unit: fitnessTestData.unit,
      date: new Date().toISOString().split('T')[0],
      notes: fitnessTestData.notes
    });
  };

  const getPositionColor = (position: string) => {
    const positionColors: Record<string, string> = {
      'Prop': 'bg-red-100 text-red-800',
      'Hooker': 'bg-orange-100 text-orange-800',
      'Lock': 'bg-yellow-100 text-yellow-800',
      'Flanker': 'bg-green-100 text-green-800',
      'Number 8': 'bg-blue-100 text-blue-800',
      'Scrum-half': 'bg-indigo-100 text-indigo-800',
      'Fly-half': 'bg-purple-100 text-purple-800',
      'Centre': 'bg-pink-100 text-pink-800',
      'Wing': 'bg-teal-100 text-teal-800',
      'Fullback': 'bg-cyan-100 text-cyan-800'
    };
    return positionColors[position] || 'bg-gray-100 text-gray-800';
  };

  const FitnessConditioningCard = () => (
    <Card className="border-2 border-green-200 bg-green-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Fitness & Conditioning</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            {fitnessConditioningData.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Player fitness levels, training loads, and physical conditioning metrics
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{fitnessConditioningData.averageFitnessScore}%</span>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">+{fitnessConditioningData.trend}%</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Average Fitness Score</p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Training Attendance</span>
            <span className="text-sm font-medium text-blue-600">{fitnessConditioningData.trainingAttendance}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Load Management</span>
            <span className="text-sm font-medium text-green-600">{fitnessConditioningData.loadManagement}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Recovery Rate</span>
            <span className="text-sm font-medium text-green-600">{fitnessConditioningData.recoveryRate}%</span>
          </div>
        </div>

        <Button 
          className="w-full bg-red-700 hover:bg-red-800 text-white"
          onClick={() => setSelectedCard('fitness')}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  const WorkRateCard = () => (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Work Rate Report</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            Healthy
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          OPTA match data integration with GPS analysis for comprehensive player work rate insights
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{workRateData.avgWorkRate}km</span>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">+{workRateData.trend}km</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Avg Work Rate</p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">High Intensity</span>
            <span className="text-sm font-medium text-red-600">{workRateData.highIntensity}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Sprint Distance</span>
            <span className="text-sm font-medium text-purple-600">{workRateData.sprintDistance}m</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Work Efficiency</span>
            <span className="text-sm font-medium text-teal-600">{workRateData.workEfficiency}%</span>
          </div>
        </div>

        <Button 
          className="w-full bg-red-700 hover:bg-red-800 text-white"
          onClick={() => setSelectedCard('workrate')}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  const GPSMovementCard = () => (
    <Card className="border-2 border-purple-200 bg-purple-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">GPS & Movement Analytics</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            {gpsData.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          StatSports GPS data analysis including distance, speed, and workload metrics
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{gpsData.avgDistance}km</span>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">+{gpsData.trend}km</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Avg Distance/Session</p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Max Speed</span>
            <span className="text-sm font-medium text-purple-600">{gpsData.maxSpeed} km/h</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Player Load</span>
            <span className="text-sm font-medium text-blue-600">{gpsData.playerLoad}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Sprint Count</span>
            <span className="text-sm font-medium text-orange-600">{gpsData.sprintCount}</span>
          </div>
        </div>

        <Button 
          className="w-full bg-red-700 hover:bg-red-800 text-white"
          onClick={() => setSelectedCard('gps')}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  const FitnessDetailView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Fitness & Conditioning Details</h2>
        <Button variant="outline" onClick={() => setSelectedCard(null)}>
          Back to Overview
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-gray-200 p-1 rounded-xl shadow-sm gap-1 h-10">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="testing"
            className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
          >
            Fitness Testing
          </TabsTrigger>
          <TabsTrigger 
            value="strength"
            className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
          >
            Strength & Gym
          </TabsTrigger>
          <TabsTrigger 
            value="comparisons"
            className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
          >
            Position Comparisons
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Squad Fitness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">89%</div>
                <p className="text-sm text-muted-foreground">Average fitness score</p>
                <Progress value={89} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Load Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">Optimal</div>
                <p className="text-sm text-muted-foreground">Training load status</p>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">On target</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  Recovery Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">92%</div>
                <p className="text-sm text-muted-foreground">Average recovery</p>
                <Progress value={92} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Fitness Test Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="player-select">Select Player</Label>
                  <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a player" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.personalDetails.firstName} {player.personalDetails.lastName} 
                          ({player.rugbyProfile?.primaryPosition || 'Unknown'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="test-type">Test Type</Label>
                  <Select 
                    value={fitnessTestData.testType} 
                    onValueChange={(value) => setFitnessTestData(prev => ({ ...prev, testType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronco">Bronco Test</SelectItem>
                      <SelectItem value="speed_40m">40m Sprint</SelectItem>
                      <SelectItem value="speed_10m">10m Sprint</SelectItem>
                      <SelectItem value="yo_yo">Yo-Yo Test</SelectItem>
                      <SelectItem value="bench_press">Bench Press</SelectItem>
                      <SelectItem value="squat">Squat</SelectItem>
                      <SelectItem value="deadlift">Deadlift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="score">Score</Label>
                  <Input
                    id="score"
                    type="number"
                    step="0.1"
                    value={fitnessTestData.score}
                    onChange={(e) => setFitnessTestData(prev => ({ ...prev, score: e.target.value }))}
                    placeholder="Enter score"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={fitnessTestData.unit}
                    onChange={(e) => setFitnessTestData(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="e.g., seconds, kg, reps"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={fitnessTestData.notes}
                  onChange={(e) => setFitnessTestData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about the test"
                />
              </div>
              
              <Button 
                onClick={handleFitnessTestSubmit}
                disabled={submitFitnessTest.isPending}
                className="w-full"
              >
                {submitFitnessTest.isPending ? 'Uploading...' : 'Upload Test Data'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="strength" className="space-y-4">
          <Alert>
            <Dumbbell className="h-4 w-4" />
            <AlertDescription>
              Strength and gym data integration coming soon. This will include bench press, squat, deadlift tracking with progressive overload analysis.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="comparisons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Position-Based Performance Comparisons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Select Position</Label>
                  <Select defaultValue="Prop">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prop">Props</SelectItem>
                      <SelectItem value="Hooker">Hookers</SelectItem>
                      <SelectItem value="Lock">Locks</SelectItem>
                      <SelectItem value="Flanker">Flankers</SelectItem>
                      <SelectItem value="Number 8">Number 8s</SelectItem>
                      <SelectItem value="Scrum-half">Scrum-halves</SelectItem>
                      <SelectItem value="Fly-half">Fly-halves</SelectItem>
                      <SelectItem value="Centre">Centres</SelectItem>
                      <SelectItem value="Wing">Wings</SelectItem>
                      <SelectItem value="Fullback">Fullbacks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Test Type</Label>
                  <Select defaultValue="squat">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="squat">Squat</SelectItem>
                      <SelectItem value="bench_press">Bench Press</SelectItem>
                      <SelectItem value="deadlift">Deadlift</SelectItem>
                      <SelectItem value="bronco">Bronco Test</SelectItem>
                      <SelectItem value="speed_40m">40m Sprint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Alert>
                <Trophy className="h-4 w-4" />
                <AlertDescription>
                  Example: Prop strength scores will compare all props in the squad against each other, showing who has the highest squat, bench press, etc. This helps identify position-specific strength leaders and development needs.
                </AlertDescription>
              </Alert>
              
              <Button className="w-full">
                Generate Position Comparison Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const WorkRateDetailView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Work Rate Report Details</h2>
        <Button variant="outline" onClick={() => setSelectedCard(null)}>
          Back to Overview
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Work Rate Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">8.4km</div>
            <p className="text-sm text-muted-foreground">Average work rate</p>
            <div className="flex items-center gap-1 mt-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">+0.3km improvement</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500" />
              High Intensity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">24%</div>
            <p className="text-sm text-muted-foreground">High intensity work</p>
            <Progress value={24} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Sprint Distance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">485m</div>
            <p className="text-sm text-muted-foreground">Total sprint distance</p>
            <div className="text-sm text-green-600 mt-2">87% work efficiency</div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <BarChart3 className="h-4 w-4" />
        <AlertDescription>
          This work rate analysis integrates with the existing analytics system. For detailed work rate reports, visit the main Analytics section or access the full Work Rate Report page.
        </AlertDescription>
      </Alert>

      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <a href="/analytics/work-rate-report" target="_blank">
            Open Full Work Rate Report
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/dashboard" target="_blank">
            View Main Analytics Dashboard
          </a>
        </Button>
      </div>
    </div>
  );

  const GPSDetailView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">GPS & Movement Analytics Details</h2>
        <Button variant="outline" onClick={() => setSelectedCard(null)}>
          Back to Overview
        </Button>
      </div>
      
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          StatSports integration for comprehensive GPS tracking. Visit{" "}
          <a href="https://statsports.com/sonra/rugby" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            statsports.com/sonra/rugby
          </a>{" "}
          for system integration details.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>StatSports Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Connection Status</span>
              <Badge variant="outline">Ready for Setup</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Data Source</span>
              <span className="text-muted-foreground">StatSports Sonra Rugby</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Metrics Available</span>
              <span className="text-muted-foreground">Distance, Speed, Load, HSR</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (selectedCard === 'fitness') {
    return <FitnessDetailView />;
  }
  
  if (selectedCard === 'workrate') {
    return <WorkRateDetailView />;
  }
  
  if (selectedCard === 'gps') {
    return <GPSDetailView />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Strength & Conditioning Portal</h1>
          <p className="text-muted-foreground">
            Comprehensive fitness tracking, GPS analytics, and performance monitoring for North Harbour Rugby
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Live Tracking
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FitnessConditioningCard />
        <WorkRateCard />
        <GPSMovementCard />
      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          Click "View Details" on any card to access comprehensive analytics, data upload tools, and detailed reporting features.
        </AlertDescription>
      </Alert>
    </div>
  );
}