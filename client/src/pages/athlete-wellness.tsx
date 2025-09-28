// Athlete Wellness & Readiness Module - S&C Command Centre
// Manual data entry with Firebase Firestore integration

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
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  Heart,
  Moon,
  Zap,
  Brain,
  Utensils,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save,
  Calendar,
  Users,
  Target,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { WellnessEntry } from '@shared/wellness-schema';

// Soreness area options for wellness assessment
const SORENESS_AREAS_OPTIONS = [
  'hamstrings', 'quadriceps', 'calves', 'glutes', 'back_lower', 
  'back_upper', 'shoulders', 'neck', 'chest', 'arms', 'core', 'hip_flexors'
] as const;

interface WellnessFormData {
  sleepQuality: number;
  sleepHours: number;
  muscleSoreness: number;
  fatigueLevel: number;
  stressLevel: number;
  mood: number;
  nutritionAdherence: number;
  sessionRPE?: number;
  sorenessAreas: string[];
  staffNotes: string;
}

export default function AthleteWellness() {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('hoskins_sotutu');
  const [viewMode, setViewMode] = useState<'individual' | 'squad'>('squad');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [wellnessForm, setWellnessForm] = useState<WellnessFormData>({
    sleepQuality: 3,
    sleepHours: 7,
    muscleSoreness: 3,
    fatigueLevel: 3,
    stressLevel: 3,
    mood: 3,
    nutritionAdherence: 3,
    sorenessAreas: [],
    staffNotes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get squad readiness overview - MANUAL REFRESH ONLY
  const { data: squadReadiness, isLoading: squadLoading } = useQuery({
    queryKey: ['/api/v2/wellness/squad-readiness'],
    refetchInterval: false, // No automatic polling to prevent Firebase charges
    staleTime: Infinity     // Cache indefinitely - only refresh on manual actions
  });

  // Get individual player wellness entries
  const { data: playerWellness, isLoading: playerLoading } = useQuery({
    queryKey: ['/api/v2/wellness/player', selectedPlayer],
    refetchInterval: false,
    staleTime: Infinity,
    enabled: !!selectedPlayer
  });

  // Get player wellness trends
  const { data: wellnessTrends } = useQuery({
    queryKey: ['/api/v2/wellness/trends', selectedPlayer],
    refetchInterval: false,
    staleTime: Infinity,
    enabled: !!selectedPlayer
  });

  // Submit wellness entry mutation
  const submitWellnessMutation = useMutation({
    mutationFn: async (entryData: WellnessFormData & { playerId: string; playerName: string }) => {
      const response = await fetch(`/api/v2/wellness/player/${entryData.playerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save wellness entry: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v2/wellness'] });
      toast({
        title: "Wellness Entry Saved",
        description: "Player wellness data updated successfully",
      });
      setEditingEntry(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmitWellness = () => {
    if (!selectedPlayer) return;
    
    submitWellnessMutation.mutate({
      ...wellnessForm,
      playerId: selectedPlayer,
      playerName: 'Selected Player' // This would come from player data
    });
  };

  const getReadinessColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'amber': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getReadinessText = (status: string) => {
    switch (status) {
      case 'green': return 'Ready';
      case 'amber': return 'Monitor';
      case 'red': return 'Concern';
      default: return 'Unknown';
    }
  };

  // Firebase squad readiness data
  const firestoreSquadData = (squadReadiness as any)?.squadReadiness;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Athlete Wellness & Readiness</h1>
          <p className="text-gray-600">Daily monitoring and readiness assessment for S&C optimization</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: 'individual' | 'squad') => setViewMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="squad">Squad Overview</SelectItem>
              <SelectItem value="individual">Individual Player</SelectItem>
            </SelectContent>
          </Select>
          {viewMode === 'individual' && (
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
          )}
        </div>
      </div>

      {viewMode === 'squad' ? (
        /* Squad Overview */
        <div className="space-y-6">
          {/* Squad Readiness Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{firestoreSquadData?.totalPlayers || 'Loading...'}</div>
                <p className="text-xs text-gray-600">Active squad members</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Ready
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{firestoreSquadData?.readinessBreakdown.green || 'Loading...'}</div>
                <p className="text-xs text-gray-600">Full training ready</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{firestoreSquadData?.readinessBreakdown.amber || 'Loading...'}</div>
                <p className="text-xs text-gray-600">Requires monitoring</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Concern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{firestoreSquadData?.readinessBreakdown.red || 'Loading...'}</div>
                <p className="text-xs text-gray-600">Action required</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Concerns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Priority Attention Required
              </CardTitle>
              <CardDescription>Players requiring immediate S&C intervention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {firestoreSquadData?.topConcerns?.length > 0 ? (
                  firestoreSquadData.topConcerns.map((concern: any, index: number) => (
                  <div key={concern.playerId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getReadinessColor(concern.status)}`}></div>
                      <div>
                        <div className="font-semibold">{concern.playerName}</div>
                        <div className="text-sm text-gray-600">{concern.primaryConcern}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Score: {concern.readinessScore}</Badge>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setSelectedPlayer(concern.playerId);
                          setViewMode('individual');
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  ))
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      No wellness concerns data available. Data will populate from Firebase when wellness entries are submitted.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Individual Player View */
        <Tabs defaultValue="daily-entry" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily-entry">Daily Entry</TabsTrigger>
            <TabsTrigger value="trends">Wellness Trends</TabsTrigger>
            <TabsTrigger value="history">Entry History</TabsTrigger>
          </TabsList>

          {/* Daily Entry Tab */}
          <TabsContent value="daily-entry" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  New Wellness Entry - {selectedPlayer}
                </CardTitle>
                <CardDescription>Manual data entry for daily wellness monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sleep Quality */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <Label>Sleep Quality (1-5)</Label>
                    <Badge variant="outline">{wellnessForm.sleepQuality}</Badge>
                  </div>
                  <Slider
                    value={[wellnessForm.sleepQuality]}
                    onValueChange={(value) => setWellnessForm(prev => ({...prev, sleepQuality: value[0]}))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Very Poor</span>
                    <span>Poor</span>
                    <span>Fair</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="sleepHours">Hours Slept</Label>
                    <Input
                      id="sleepHours"
                      type="number"
                      step="0.5"
                      min="0"
                      max="12"
                      value={wellnessForm.sleepHours}
                      onChange={(e) => setWellnessForm(prev => ({...prev, sleepHours: parseFloat(e.target.value)}))}
                      className="w-20"
                    />
                  </div>
                </div>

                {/* Muscle Soreness */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <Label>Muscle Soreness (1-5)</Label>
                    <Badge variant="outline">{wellnessForm.muscleSoreness}</Badge>
                  </div>
                  <Slider
                    value={[wellnessForm.muscleSoreness]}
                    onValueChange={(value) => setWellnessForm(prev => ({...prev, muscleSoreness: value[0]}))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="space-y-2">
                    <Label>Affected Areas (select all that apply)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {SORENESS_AREAS_OPTIONS.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={area}
                            checked={wellnessForm.sorenessAreas.includes(area)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setWellnessForm(prev => ({
                                  ...prev,
                                  sorenessAreas: [...prev.sorenessAreas, area]
                                }));
                              } else {
                                setWellnessForm(prev => ({
                                  ...prev,
                                  sorenessAreas: prev.sorenessAreas.filter(a => a !== area)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={area} className="text-sm capitalize">
                            {area.replace('_', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fatigue Level */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <Label>Fatigue Level (1-5)</Label>
                    <Badge variant="outline">{wellnessForm.fatigueLevel}</Badge>
                  </div>
                  <Slider
                    value={[wellnessForm.fatigueLevel]}
                    onValueChange={(value) => setWellnessForm(prev => ({...prev, fatigueLevel: value[0]}))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Stress Level */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <Label>Stress Level (1-5)</Label>
                    <Badge variant="outline">{wellnessForm.stressLevel}</Badge>
                  </div>
                  <Slider
                    value={[wellnessForm.stressLevel]}
                    onValueChange={(value) => setWellnessForm(prev => ({...prev, stressLevel: value[0]}))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Mood */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <Label>Mood (1-5)</Label>
                    <Badge variant="outline">{wellnessForm.mood}</Badge>
                  </div>
                  <Slider
                    value={[wellnessForm.mood]}
                    onValueChange={(value) => setWellnessForm(prev => ({...prev, mood: value[0]}))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Nutrition Adherence */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    <Label>Nutrition Adherence (1-5)</Label>
                    <Badge variant="outline">{wellnessForm.nutritionAdherence}</Badge>
                  </div>
                  <Slider
                    value={[wellnessForm.nutritionAdherence]}
                    onValueChange={(value) => setWellnessForm(prev => ({...prev, nutritionAdherence: value[0]}))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Staff Notes */}
                <div className="space-y-2">
                  <Label htmlFor="staffNotes">S&C Staff Notes</Label>
                  <Textarea
                    id="staffNotes"
                    placeholder="Additional observations, interventions, or notes..."
                    value={wellnessForm.staffNotes}
                    onChange={(e) => setWellnessForm(prev => ({...prev, staffNotes: e.target.value}))}
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={handleSubmitWellness}
                  disabled={submitWellnessMutation.isPending}
                  className="w-full"
                >
                  {submitWellnessMutation.isPending ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Wellness Entry
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wellness Trends - Last 14 Days</CardTitle>
                <CardDescription>Track wellness patterns and identify concerning trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[1, 5]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="sleepQuality" stroke="#3B82F6" name="Sleep Quality" />
                      <Line type="monotone" dataKey="fatigueLevel" stroke="#EF4444" name="Fatigue" />
                      <Line type="monotone" dataKey="readinessScore" stroke="#10B981" name="Readiness" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wellness Entry History</CardTitle>
                <CardDescription>Review and edit previous wellness entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Wellness history will be populated from Firebase when data is available.
                      All entries support inline editing for staff corrections.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}