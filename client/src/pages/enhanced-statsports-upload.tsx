import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Activity, Calendar, Users } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface SessionAssignment {
  weekId: string;
  weekName: string;
  sessionNumber: number;
  sessionType: 'training' | 'match';
  sessionName: string;
  date: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  sessionId: string;
  sessionName: string;
  data?: {
    hasFile: boolean;
    fileName?: string;
    fileSize?: number;
    recordsProcessed?: number;
    playersAffected?: string[];
    sessionData: any;
    processingStatus: string;
    sessionSummary?: any;
    storageErrors?: string[];
  };
  errors?: string[];
}

const WEEK_OPTIONS = [
  { id: 'preseason', name: 'Preseason', startDate: '2025-01-01' },
  { id: 'week1', name: 'Week 1', startDate: '2025-01-15' },
  { id: 'week2', name: 'Week 2', startDate: '2025-01-22' },
  { id: 'week3', name: 'Week 3', startDate: '2025-01-29' },
  { id: 'week4', name: 'Week 4', startDate: '2025-02-05' },
  { id: 'week5', name: 'Week 5', startDate: '2025-02-12' },
  { id: 'week6', name: 'Week 6', startDate: '2025-02-19' },
  { id: 'week7', name: 'Week 7', startDate: '2025-02-26' },
  { id: 'week8', name: 'Week 8', startDate: '2025-03-05' },
  { id: 'week9', name: 'Week 9', startDate: '2025-03-12' },
  { id: 'week10', name: 'Week 10', startDate: '2025-03-19' },
];

export default function EnhancedStatSportsUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [sessionAssignment, setSessionAssignment] = useState<Partial<SessionAssignment>>({
    sessionType: 'training'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResult> => {
      if (!sessionAssignment.weekId || !sessionAssignment.sessionName || !sessionAssignment.date) {
        throw new Error('Please complete all session details before uploading');
      }

      const formData = new FormData();
      formData.append('gpsFile', file);
      formData.append('sessionData', JSON.stringify(sessionAssignment));
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        const response = await fetch('/api/v2/statsports-upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${errorText}`);
        }
        
        const result = await response.json();
        clearInterval(progressInterval);
        setUploadProgress(100);
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: (result: UploadResult) => {
      setUploadResult(result);
      // Trigger data refresh across all components after successful upload (cost-efficient)
      queryClient.invalidateQueries({ queryKey: ['/api/v2/gps-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v2/training-workrate/latest'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v2/players'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v2/analytics/cohesion'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v2/analytics/team-performance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v2/match-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v2/opta-stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/training-workrate'] });
      queryClient.invalidateQueries({ queryKey: [`/api/training-weeks/${result.sessionCreated.weekId}`] });
      
      toast({
        title: "Upload Successful",
        description: `Created ${result.sessionCreated.sessionName} with ${result.recordsProcessed} GPS records`,
      });
    },
    onError: (error: Error) => {
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setUploadProgress(0);
    setUploadResult(null);
    uploadMutation.mutate(file);
  };

  const downloadTemplate = () => {
    const csvContent = `playerId,sessionId,date,sessionType,totalDistance,metresPerMinute,highSpeedRunningDistance,sprintDistance,maxVelocity,playerLoad,accelerations_total,accelerations_high,accelerations_moderate,decelerations_total,decelerations_high,decelerations_moderate,dynamicStressLoad,impacts,highMetabolicLoadDistance,involvements,timeInRedZone,distancePerMinute,highSpeedRunning,maxSpeed,acwr,personalDSLAverage,positionalDSLAverage,loadStatus,performanceStatus,dataQuality,satelliteCount,signalStrength
aisea_halo,session_2025_01_23_001,2025-01-23T10:00:00Z,training,4567,76.1,892,234,8.9,387,45,12,18,38,8,15,245.7,89,1234,23,125,76.1,892,29.8,0.85,220.4,235.1,green,Good,0.92,14,87
ben_lam,session_2025_01_23_001,2025-01-23T10:00:00Z,training,5234,87.2,1023,345,9.2,432,52,15,22,42,10,18,278.3,102,1456,28,156,87.2,1023,33.1,0.78,198.7,235.1,amber,Excellent,0.95,15,91
caleb_clarke,session_2025_01_23_001,2025-01-23T10:00:00Z,training,4890,81.5,945,267,8.7,398,48,11,20,40,9,16,259.1,94,1345,25,134,81.5,945,31.3,0.92,243.2,235.1,green,Good,0.89,13,84
daniel_collins,session_2025_01_23_001,2025-01-23T10:00:00Z,training,3456,57.6,567,123,7.4,280,32,6,14,28,5,12,189.4,67,876,18,89,57.6,567,26.6,1.12,267.8,235.1,red,Moderate,0.87,12,79
hoskins_sotutu,session_2025_01_23_001,2025-01-23T10:00:00Z,training,5678,94.6,1234,456,9.8,467,58,18,25,45,12,20,312.5,125,1678,32,178,94.6,1234,35.3,0.74,189.3,235.1,amber,Excellent,0.96,16,93`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'statsports_gps_upload_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "CSV template with 32 GPS metrics ready for StatSports data",
    });
  };

  const generateSessionName = () => {
    if (!sessionAssignment.weekId || !sessionAssignment.sessionNumber || !sessionAssignment.sessionType || !sessionAssignment.date) {
      return '';
    }
    
    const week = WEEK_OPTIONS.find(w => w.id === sessionAssignment.weekId);
    if (!week) return '';
    
    // Generate enhanced sessionId with new naming convention
    const sessionId = `${sessionAssignment.weekId}_session${sessionAssignment.sessionNumber}_${sessionAssignment.date.replace(/-/g, '_')}`;
    
    if (sessionAssignment.sessionType === 'training') {
      return `StatSports Training Data: Session ${sessionAssignment.sessionNumber}, ${week.name}. ${sessionAssignment.date}`;
    } else {
      return `StatSports Match Data: North Harbour vs Opponent, ${week.name}. ${sessionAssignment.date}`;
    }
  };

  const generateSessionId = () => {
    if (!sessionAssignment.weekId || !sessionAssignment.sessionNumber || !sessionAssignment.date) {
      return '';
    }
    
    const dateParts = sessionAssignment.date.split('-');
    return `${sessionAssignment.weekId}_session${sessionAssignment.sessionNumber}_${dateParts[0]}_${dateParts[1]}_${dateParts[2]}`;
  };

  React.useEffect(() => {
    const generatedName = generateSessionName();
    if (generatedName && generatedName !== sessionAssignment.sessionName) {
      setSessionAssignment(prev => ({ ...prev, sessionName: generatedName }));
    }
  }, [sessionAssignment.weekId, sessionAssignment.sessionNumber, sessionAssignment.sessionType, sessionAssignment.date]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">StatSports Weekly Training System</h1>
          <p className="text-gray-600">Upload GPS data with automatic week and session organization</p>
        </div>

        {/* Session Assignment Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Session Assignment
            </CardTitle>
            <CardDescription>
              Assign your GPS data to a specific training week and session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="week-select">Training Week</Label>
                <Select 
                  value={sessionAssignment.weekId} 
                  onValueChange={(value) => setSessionAssignment(prev => ({ ...prev, weekId: value, weekName: WEEK_OPTIONS.find(w => w.id === value)?.name }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEK_OPTIONS.map(week => (
                      <SelectItem key={week.id} value={week.id}>
                        {week.name} (starts {week.startDate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="session-type">Session Type</Label>
                <Select 
                  value={sessionAssignment.sessionType} 
                  onValueChange={(value: 'training' | 'match') => setSessionAssignment(prev => ({ ...prev, sessionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="training">Training Session</SelectItem>
                    <SelectItem value="match">Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="session-number">Session Number</Label>
                <Input 
                  id="session-number"
                  type="number" 
                  min="1" 
                  max="10"
                  value={sessionAssignment.sessionNumber || ''} 
                  onChange={(e) => setSessionAssignment(prev => ({ ...prev, sessionNumber: parseInt(e.target.value) }))}
                  placeholder="e.g., 1, 2, 3..."
                />
              </div>
              
              <div>
                <Label htmlFor="session-date">Session Date</Label>
                <Input 
                  id="session-date"
                  type="date" 
                  value={sessionAssignment.date || ''} 
                  onChange={(e) => setSessionAssignment(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
            
            {sessionAssignment.sessionName && (
              <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                <div>
                  <Label className="text-sm font-medium text-blue-900">Generated Session Name:</Label>
                  <p className="text-blue-700 font-mono text-sm mt-1">{sessionAssignment.sessionName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-900">Enhanced Session ID:</Label>
                  <p className="text-blue-700 font-mono text-sm mt-1 bg-blue-100 px-2 py-1 rounded">
                    {generateSessionId()}
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    Format: {sessionAssignment.weekId}_session{sessionAssignment.sessionNumber}_yyyy_mm_dd
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Download Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="mr-2 h-5 w-5 text-blue-600" />
              Download Template
            </CardTitle>
            <CardDescription>
              Get the CSV template with all 32 StatSports GPS metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Download StatSports GPS Template
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Template includes: Player Load, ACWR, Dynamic Stress Load, and 29 other GPS metrics
            </p>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5 text-red-600" />
              Upload GPS Data
            </CardTitle>
            <CardDescription>
              Drag and drop your StatSports CSV file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {dragActive ? 'Drop your CSV file here' : 'Upload StatSports GPS Data'}
              </p>
              <p className="text-gray-600 mb-4">
                Supports CSV files with player GPS tracking data
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Browse Files
                </label>
              </Button>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing GPS data...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Upload Results */}
            {uploadResult && (
              <div className="mt-6 space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Upload completed successfully!</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Records processed:</span> {uploadResult.data?.recordsProcessed || 0}
                        </div>
                        <div>
                          <span className="font-medium">Players affected:</span> {uploadResult.data?.playersAffected?.length || 0}
                        </div>
                        <div>
                          <span className="font-medium">Session created:</span> {uploadResult.sessionName || 'Processing...'}
                        </div>
                        <div>
                          <span className="font-medium">File processed:</span> {uploadResult.data?.fileName || 'Processing...'}
                        </div>
                      </div>
                      
                      {uploadResult.data?.playersAffected && uploadResult.data.playersAffected.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium mb-2">Players in this session:</p>
                          <div className="flex flex-wrap gap-1">
                            {uploadResult.data.playersAffected.slice(0, 8).map((playerName, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {playerName}
                              </Badge>
                            ))}
                            {uploadResult.data.playersAffected.length > 8 && (
                              <Badge variant="secondary" className="text-xs">
                                +{uploadResult.data.playersAffected.length - 8} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {uploadResult.data?.sessionSummary && (
                        <div className="mt-3">
                          <p className="font-medium mb-2">Session Summary:</p>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center">
                              <div className="font-medium">{uploadResult.data.sessionSummary.metrics?.avgTotalDistance}m</div>
                              <div className="text-gray-500">Avg Distance</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{uploadResult.data.sessionSummary.metrics?.avgPlayerLoad}</div>
                              <div className="text-gray-500">Avg Load</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{uploadResult.data.sessionSummary.metrics?.avgMaxSpeed}km/h</div>
                              <div className="text-gray-500">Avg Max Speed</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <Button 
                          onClick={() => window.location.href = `/training-workrate#week1`}
                          size="sm"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          View Week Analytics
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Error Handling */}
            {uploadResult?.errors && uploadResult.errors.length > 0 && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Upload completed with errors:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {uploadResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}