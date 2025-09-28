// Strength & Power Testing Module - S&C Command Centre
// Firebase-integrated testing protocols with manual data entry

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  Dumbbell,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Trophy,
  Edit,
  Save,
  Trash2,
  Calendar,
  Users,
  Award,
  Clock,
  Plus,
  Filter,
  Download,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TestingEntry, TestType, TestingProtocol } from '@shared/testing-schema';

// Test types for the UI
const TEST_TYPES: { value: TestType; label: string; category: string }[] = [
  { value: 'back_squat_1rm', label: 'Back Squat 1RM', category: 'Strength' },
  { value: 'bench_press_1rm', label: 'Bench Press 1RM', category: 'Strength' },
  { value: 'countermovement_jump', label: 'Countermovement Jump', category: 'Power' },
  { value: 'squat_jump', label: 'Squat Jump', category: 'Power' },
  { value: '10m_sprint', label: '10m Sprint', category: 'Speed' },
  { value: '20m_sprint', label: '20m Sprint', category: 'Speed' },
  { value: '30m_sprint', label: '30m Sprint', category: 'Speed' },
  { value: 'yo_yo_intermittent', label: 'Yo-Yo Intermittent', category: 'Endurance' },
  { value: 'agility_t_test', label: 'T-Test Agility', category: 'Agility' },
  { value: 'plank_hold', label: 'Plank Hold', category: 'Stability' }
];

const POSITIONS = [
  'Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8', 
  'Scrum-half', 'Fly-half', 'Centre', 'Winger', 'Fullback'
];

interface TestingFormData {
  playerId: string;
  playerName: string;
  position: string;
  testType: TestType;
  result: number;
  testDate: string;
  testConditions: 'optimal' | 'sub-optimal' | 'return-to-play' | 'baseline';
  testPhase: 'pre-season' | 'in-season' | 'post-season' | 'injury-return';
  staffNotes: string;
  testingOfficer: string;
  equipmentUsed: string;
  personalBest: boolean;
}

export default function StrengthPowerTesting() {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('hoskins_sotutu');
  const [viewMode, setViewMode] = useState<'entry' | 'history' | 'leaderboards' | 'analytics'>('entry');
  const [selectedTestType, setSelectedTestType] = useState<TestType>('countermovement_jump');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  
  const [testingForm, setTestingForm] = useState<TestingFormData>({
    playerId: 'hoskins_sotutu',
    playerName: 'Hoskins Sotutu',
    position: 'Number 8',
    testType: 'countermovement_jump',
    result: 0,
    testDate: new Date().toISOString().split('T')[0],
    testConditions: 'optimal',
    testPhase: 'in-season',
    staffNotes: '',
    testingOfficer: 'S&C Coach Smith',
    equipmentUsed: '',
    personalBest: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get testing protocols
  const { data: protocols, isLoading: protocolsLoading } = useQuery({
    queryKey: ['/api/v2/testing/protocols'],
    refetchInterval: false,
    staleTime: Infinity
  });

  // Get player testing history
  const { data: playerHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/v2/testing/player', selectedPlayer, selectedTestType],
    refetchInterval: false,
    staleTime: Infinity,
    enabled: !!selectedPlayer
  });

  // Get team testing analytics
  const { data: teamAnalytics } = useQuery({
    queryKey: ['/api/v2/testing/analytics', selectedTestType],
    refetchInterval: false,
    staleTime: Infinity
  });

  // Get testing leaderboards
  const { data: leaderboards } = useQuery({
    queryKey: ['/api/v2/testing/leaderboards', selectedTestType, positionFilter],
    refetchInterval: false,
    staleTime: Infinity
  });

  // Submit testing entry mutation
  const submitTestingMutation = useMutation({
    mutationFn: async (entryData: TestingFormData) => {
      const response = await fetch('/api/v2/testing/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save testing entry: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v2/testing'] });
      toast({
        title: "Testing Entry Saved",
        description: "Performance test result recorded successfully",
      });
      // Reset form
      setTestingForm(prev => ({ ...prev, result: 0, staffNotes: '', personalBest: false }));
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete testing entry mutation
  const deleteTestingMutation = useMutation({
    mutationFn: async ({ entryId, reason }: { entryId: string; reason: string }) => {
      const response = await fetch(`/api/v2/testing/entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete testing entry: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v2/testing'] });
      toast({
        title: "Entry Deleted",
        description: "Testing entry removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmitTesting = () => {
    if (!testingForm.result || testingForm.result <= 0) {
      toast({
        title: "Invalid Result",
        description: "Please enter a valid test result",
        variant: "destructive",
      });
      return;
    }
    
    submitTestingMutation.mutate(testingForm);
  };

  const getTestUnits = (testType: TestType): string => {
    const unitsMap: Record<TestType, string> = {
      'back_squat_1rm': 'kg',
      'bench_press_1rm': 'kg',
      'countermovement_jump': 'cm',
      'squat_jump': 'cm',
      '10m_sprint': 'seconds',
      '20m_sprint': 'seconds',
      '30m_sprint': 'seconds',
      'yo_yo_intermittent': 'level',
      'agility_t_test': 'seconds',
      'plank_hold': 'seconds'
    };
    return unitsMap[testType] || 'units';
  };

  const getPerformanceColor = (percentileRank: number) => {
    if (percentileRank >= 80) return 'bg-green-500';
    if (percentileRank >= 60) return 'bg-yellow-500';
    if (percentileRank >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPerformanceText = (percentileRank: number) => {
    if (percentileRank >= 80) return 'Elite';
    if (percentileRank >= 60) return 'Good';
    if (percentileRank >= 40) return 'Average';
    return 'Below Average';
  };

  // Firebase data with proper error handling
  const firestoreAnalytics = (teamAnalytics as any)?.analytics;
  const firestoreLeaderboard = (leaderboards as any)?.leaderboard;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Strength & Power Testing</h1>
          <p className="text-gray-600">Performance testing protocols and progression tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: 'entry' | 'history' | 'leaderboards' | 'analytics') => setViewMode(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Data Entry</SelectItem>
              <SelectItem value="history">Player History</SelectItem>
              <SelectItem value="leaderboards">Leaderboards</SelectItem>
              <SelectItem value="analytics">Team Analytics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="entry">Data Entry</TabsTrigger>
          <TabsTrigger value="history">Player History</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Data Entry Tab */}
        <TabsContent value="entry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Testing Entry
              </CardTitle>
              <CardDescription>Manual entry for strength and power testing results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Player Selection */}
                <div className="space-y-2">
                  <Label htmlFor="player">Player</Label>
                  <Select value={testingForm.playerId} onValueChange={(value) => {
                    setTestingForm(prev => ({
                      ...prev, 
                      playerId: value,
                      playerName: value === 'hoskins_sotutu' ? 'Hoskins Sotutu' : 'Selected Player'
                    }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Player" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hoskins_sotutu">Hoskins Sotutu</SelectItem>
                      <SelectItem value="ben_lam">Ben Lam</SelectItem>
                      <SelectItem value="caleb_clarke">Caleb Clarke</SelectItem>
                      <SelectItem value="daniel_collins">Daniel Collins</SelectItem>
                      <SelectItem value="aisea_halo">Aisea Halo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select value={testingForm.position} onValueChange={(value) => setTestingForm(prev => ({...prev, position: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map(position => (
                        <SelectItem key={position} value={position}>{position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Test Type */}
                <div className="space-y-2">
                  <Label htmlFor="testType">Test Type</Label>
                  <Select value={testingForm.testType} onValueChange={(value: TestType) => setTestingForm(prev => ({...prev, testType: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_TYPES.map(test => (
                        <SelectItem key={test.value} value={test.value}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{test.category}</Badge>
                            {test.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Test Result */}
                <div className="space-y-2">
                  <Label htmlFor="result">Result ({getTestUnits(testingForm.testType)})</Label>
                  <Input
                    id="result"
                    type="number"
                    step="0.1"
                    min="0"
                    value={testingForm.result || ''}
                    onChange={(e) => setTestingForm(prev => ({...prev, result: parseFloat(e.target.value) || 0}))}
                    placeholder={`Enter result in ${getTestUnits(testingForm.testType)}`}
                  />
                </div>

                {/* Test Date */}
                <div className="space-y-2">
                  <Label htmlFor="testDate">Test Date</Label>
                  <Input
                    id="testDate"
                    type="date"
                    value={testingForm.testDate}
                    onChange={(e) => setTestingForm(prev => ({...prev, testDate: e.target.value}))}
                  />
                </div>

                {/* Test Conditions */}
                <div className="space-y-2">
                  <Label htmlFor="conditions">Test Conditions</Label>
                  <Select value={testingForm.testConditions} onValueChange={(value: any) => setTestingForm(prev => ({...prev, testConditions: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="optimal">Optimal</SelectItem>
                      <SelectItem value="sub-optimal">Sub-optimal</SelectItem>
                      <SelectItem value="return-to-play">Return to Play</SelectItem>
                      <SelectItem value="baseline">Baseline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Test Phase */}
                <div className="space-y-2">
                  <Label htmlFor="phase">Training Phase</Label>
                  <Select value={testingForm.testPhase} onValueChange={(value: any) => setTestingForm(prev => ({...prev, testPhase: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-season">Pre-season</SelectItem>
                      <SelectItem value="in-season">In-season</SelectItem>
                      <SelectItem value="post-season">Post-season</SelectItem>
                      <SelectItem value="injury-return">Injury Return</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Testing Officer */}
                <div className="space-y-2">
                  <Label htmlFor="officer">Testing Officer</Label>
                  <Input
                    id="officer"
                    value={testingForm.testingOfficer}
                    onChange={(e) => setTestingForm(prev => ({...prev, testingOfficer: e.target.value}))}
                    placeholder="S&C Coach Name"
                  />
                </div>
              </div>

              {/* Personal Best Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="personalBest"
                  checked={testingForm.personalBest}
                  onCheckedChange={(checked) => setTestingForm(prev => ({...prev, personalBest: !!checked}))}
                />
                <Label htmlFor="personalBest" className="text-sm font-medium">
                  This is a personal best result
                </Label>
              </div>

              {/* Staff Notes */}
              <div className="space-y-2">
                <Label htmlFor="staffNotes">Staff Notes & Observations</Label>
                <Textarea
                  id="staffNotes"
                  placeholder="Technical notes, observations, recommendations..."
                  value={testingForm.staffNotes}
                  onChange={(e) => setTestingForm(prev => ({...prev, staffNotes: e.target.value}))}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmitTesting}
                disabled={submitTestingMutation.isPending || !testingForm.result}
                className="w-full"
              >
                {submitTestingMutation.isPending ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Testing Entry
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Player History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoskins_sotutu">Hoskins Sotutu</SelectItem>
                <SelectItem value="ben_lam">Ben Lam</SelectItem>
                <SelectItem value="caleb_clarke">Caleb Clarke</SelectItem>
                <SelectItem value="daniel_collins">Daniel Collins</SelectItem>
                <SelectItem value="aisea_halo">Aisea Halo</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedTestType} onValueChange={(value: TestType) => setSelectedTestType(value)}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEST_TYPES.map(test => (
                  <SelectItem key={test.value} value={test.value}>
                    {test.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Testing History - {selectedPlayer}</CardTitle>
              <CardDescription>Historical performance data and progression trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="testDate" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="result" stroke="#DC2626" name="Result" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Testing history will be populated from Firebase when data is available.
                    All entries support inline editing and deletion for data corrections.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboards Tab */}
        <TabsContent value="leaderboards" className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Select value={selectedTestType} onValueChange={(value: TestType) => setSelectedTestType(value)}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEST_TYPES.map(test => (
                  <SelectItem key={test.value} value={test.value}>
                    {test.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {POSITIONS.map(position => (
                  <SelectItem key={position} value={position}>{position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Performance Leaderboard - {TEST_TYPES.find(t => t.value === selectedTestType)?.label}
              </CardTitle>
              <CardDescription>Top performers ranked by test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {firestoreLeaderboard?.length > 0 ? (
                  firestoreLeaderboard.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{entry.playerName}</div>
                        <div className="text-sm text-gray-600">{entry.position}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{entry.result} {getTestUnits(selectedTestType)}</div>
                      <div className="text-sm text-gray-600">{entry.testDate}</div>
                    </div>
                  </div>
                  ))
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No testing results available. Leaderboard will populate from Firebase when testing entries are submitted.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{firestoreAnalytics?.teamStatistics?.participationRate || 'Loading...'}%</div>
                <p className="text-xs text-gray-600">Players tested</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Team Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{firestoreAnalytics?.teamStatistics?.averageResult || 'Loading...'} {getTestUnits(selectedTestType)}</div>
                <p className="text-xs text-gray-600">Across all positions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Best Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{firestoreAnalytics?.teamStatistics?.rangeMax || 'Loading...'} {getTestUnits(selectedTestType)}</div>
                <p className="text-xs text-gray-600">Team record</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Current testing leaders by percentile rank</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {firestoreAnalytics?.topPerformers?.length > 0 ? (
                  firestoreAnalytics.topPerformers.map((performer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <div>
                        <div className="font-semibold">{performer.playerName}</div>
                        <div className="text-sm text-gray-600">{performer.position}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{performer.result} {getTestUnits(selectedTestType)}</Badge>
                      <div className={`w-3 h-3 rounded-full ${getPerformanceColor(performer.percentileRank)}`}></div>
                    </div>
                  </div>
                  ))
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No top performers data available. Analytics will populate from Firebase when testing entries are submitted.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}