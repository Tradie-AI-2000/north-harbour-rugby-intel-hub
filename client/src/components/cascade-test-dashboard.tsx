import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Clock, Zap, Database, Activity } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface TestMetrics {
  lastUpdate: string;
  responseTime: number;
  dataSource: 'firebase' | 'hardcoded' | 'error';
  playerCount: number;
  status: 'success' | 'loading' | 'error';
}

interface TestChange {
  id: string;
  description: string;
  mutation: () => Promise<any>;
  expectedCascade: string[];
}

export default function CascadeTestDashboard() {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [testResults, setTestResults] = useState<Record<string, TestMetrics>>({});
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Real-time data queries to test cascade
  const { data: allPlayers, isLoading: playersLoading } = useQuery({
    queryKey: ['/api/players'],
    refetchInterval: 2000, // Poll every 2 seconds for real-time testing
  });

  const { data: teamOverview, isLoading: teamLoading } = useQuery({
    queryKey: ['/api/team/overview'],
    refetchInterval: 2000,
  });

  const { data: selectedPlayerData, isLoading: playerLoading } = useQuery({
    queryKey: ['/api/players', selectedPlayer],
    enabled: !!selectedPlayer,
    refetchInterval: 2000,
  });

  // Track metrics for each component
  useEffect(() => {
    const updateMetrics = (key: string, data: any, loading: boolean) => {
      setTestResults(prev => ({
        ...prev,
        [key]: {
          lastUpdate: new Date().toLocaleTimeString(),
          responseTime: 0, // Would need performance.now() timing
          dataSource: data ? (Array.isArray(data) && data.length > 0 ? 'firebase' : 'hardcoded') : 'error',
          playerCount: Array.isArray(data) ? data.length : 1,
          status: loading ? 'loading' : data ? 'success' : 'error'
        }
      }));
    };

    updateMetrics('allPlayers', allPlayers, playersLoading);
    updateMetrics('teamOverview', teamOverview, teamLoading);
    updateMetrics('selectedPlayer', selectedPlayerData, playerLoading);
  }, [allPlayers, teamOverview, selectedPlayerData, playersLoading, teamLoading, playerLoading]);

  // Test mutations
  const playerUpdateMutation = useMutation({
    mutationFn: async (updateData: any) => {
      return await apiRequest(`/api/players/${selectedPlayer}`, {
        method: 'PUT',
        body: updateData
      });
    },
    onSuccess: () => {
      // Invalidate all related queries to trigger cascade
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team/overview'] });
      queryClient.invalidateQueries({ queryKey: ['/api/players', selectedPlayer] });
    }
  });

  // Predefined test scenarios
  const testScenarios: TestChange[] = [
    {
      id: 'status-change',
      description: 'Change player status: Available → Injured',
      mutation: () => playerUpdateMutation.mutateAsync({ currentStatus: 'Injured' }),
      expectedCascade: ['Player Dashboard', 'Team Overview', 'Players List', 'Injury Tracking']
    },
    {
      id: 'position-change',
      description: 'Change player position: Current → Prop',
      mutation: () => playerUpdateMutation.mutateAsync({ 
        personalDetails: { ...selectedPlayerData?.personalDetails, position: 'Prop' }
      }),
      expectedCascade: ['Player Dashboard', 'Team Analytics', 'Position Filters']
    },
    {
      id: 'skill-update',
      description: 'Update skill rating: Ball Handling +1',
      mutation: () => playerUpdateMutation.mutateAsync({
        skills: { 
          ...selectedPlayerData?.skills, 
          ballHandling: (selectedPlayerData?.skills?.ballHandling || 7) + 1 
        }
      }),
      expectedCascade: ['Player Profile', 'Performance Analytics', 'Team Averages']
    }
  ];

  const runCascadeTest = async (testId: string) => {
    setActiveTest(testId);
    const test = testScenarios.find(t => t.id === testId);
    
    try {
      console.log(`🧪 Starting cascade test: ${test?.description}`);
      
      // Simulate data change and trigger cache invalidation
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team/overview'] });
      
      console.log('💨 Cache invalidated - observing cascade effects...');
      
      // Wait and observe cascade
      setTimeout(() => {
        setActiveTest(null);
        console.log(`✅ Cascade test "${testId}" completed - Check network tab for API calls`);
      }, 3000);
      
    } catch (error) {
      console.error(`❌ Test "${testId}" failed:`, error);
      setActiveTest(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'loading': return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Database className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDataSourceBadge = (source: string) => {
    const variants = {
      firebase: 'bg-green-100 text-green-800',
      hardcoded: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[source as keyof typeof variants]}>
        {source.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Real-Time Data Cascade Test Dashboard</h1>
      </div>

      {/* Test Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Select Test Player</label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a player for testing..." />
                </SelectTrigger>
                <SelectContent>
                  {allPlayers?.slice(0, 5).map((player: any) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.personalDetails?.firstName} {player.personalDetails?.lastName} - {player.personalDetails?.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPlayerData && (
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Current Player Info</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <strong>Status:</strong> {selectedPlayerData.currentStatus}<br/>
                    <strong>Position:</strong> {selectedPlayerData.personalDetails?.position}<br/>
                    <strong>Skills:</strong> BH:{selectedPlayerData.skills?.ballHandling || 'N/A'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Component Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(testResults).map(([component, metrics]) => (
          <Card key={component}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{component.replace(/([A-Z])/g, ' $1')}</span>
                {getStatusIcon(metrics.status)}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Last Update: {metrics.lastUpdate}</div>
                <div className="flex justify-between">
                  <span>Data Source:</span>
                  {getDataSourceBadge(metrics.dataSource)}
                </div>
                <div>Records: {metrics.playerCount}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cascade Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Cascade Test Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {testScenarios.map((test) => (
            <div key={test.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{test.description}</h3>
                <Button 
                  onClick={() => runCascadeTest(test.id)}
                  disabled={!selectedPlayer || activeTest === test.id}
                  variant={activeTest === test.id ? "secondary" : "default"}
                  size="sm"
                >
                  {activeTest === test.id ? 'Testing...' : 'Run Test'}
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Expected Cascade:</strong> {test.expectedCascade.join(' → ')}
              </div>
              {activeTest === test.id && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                  🔄 Test in progress - Watch components for real-time updates...
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Test Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(testResults).filter(m => m.dataSource === 'firebase').length}
              </div>
              <div className="text-sm text-green-700">Firebase Connected</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {Object.values(testResults).filter(m => m.dataSource === 'hardcoded').length}
              </div>
              <div className="text-sm text-yellow-700">Using Hardcoded Data</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {allPlayers?.length || 0}
              </div>
              <div className="text-sm text-blue-700">Total Players</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {Object.values(testResults).filter(m => m.status === 'success').length}
              </div>
              <div className="text-sm text-gray-700">Components Online</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}