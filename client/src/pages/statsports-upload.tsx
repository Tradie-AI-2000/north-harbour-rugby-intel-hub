import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Activity } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UploadResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  duplicates: number;
  playersAffected: string[];
}

export default function StatSportsUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResult> => {
      const formData = new FormData();
      formData.append('gpsFile', file);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        const response = await fetch('/api/upload/statsports-gps', {
          method: 'POST',
          body: formData,
        });
        
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
      queryClient.invalidateQueries({ queryKey: ['/api/v2/gps-data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/training-workrate'] });
      
      toast({
        title: "Upload Successful",
        description: `Processed ${result.recordsProcessed} GPS records for ${result.playersAffected.length} players`,
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
hoskins_sotutu,session_2025_01_23_001,2025-01-23T10:00:00Z,training,5678,94.6,1234,456,9.8,467,58,18,25,45,12,20,312.5,125,1678,32,178,94.6,1234,35.3,0.74,189.3,235.1,amber,Excellent,0.96,16,93
aisea_halo,session_2025_01_24_002,2025-01-24T14:30:00Z,match,6789,84.6,1456,567,9.5,523,62,20,28,48,14,22,345.7,134,1987,38,198,84.6,1456,34.2,0.82,234.1,235.1,green,Excellent,0.94,15,89
ben_lam,session_2025_01_24_002,2025-01-24T14:30:00Z,match,7234,90.4,1678,678,10.1,587,68,23,31,52,16,24,389.2,156,2234,42,234,90.4,1678,36.4,0.79,198.7,235.1,amber,Excellent,0.97,16,94
caleb_clarke,session_2025_01_24_002,2025-01-24T14:30:00Z,match,6543,81.8,1345,534,9.3,534,59,19,26,46,13,21,323.4,128,1876,36,189,81.8,1345,33.5,0.88,243.2,235.1,green,Good,0.91,14,86
daniel_collins,session_2025_01_24_002,2025-01-24T14:30:00Z,match,4567,57.1,789,234,8.1,367,38,8,17,34,7,15,223.1,78,1234,22,134,57.1,789,29.2,1.08,267.8,235.1,red,Moderate,0.85,11,77
hoskins_sotutu,session_2025_01_24_002,2025-01-24T14:30:00Z,match,7456,93.2,1567,645,10.3,612,71,25,33,55,18,26,412.8,167,2456,45,245,93.2,1567,37.1,0.76,189.3,235.1,amber,Excellent,0.98,17,96`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'statsports_gps_upload_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "CSV template with 32 GPS metrics and 10 sample records ready for use",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">StatSports GPS Data Upload</h1>
          <p className="text-gray-600">Upload GPS tracking data to enhance player performance analytics</p>
        </div>

        {/* Template Download Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="mr-2 h-5 w-5 text-blue-600" />
              Download Template
            </CardTitle>
            <CardDescription>
              Get the CSV template with sample data from 5 North Harbour players
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  <span>10 sample GPS sessions</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  <span>Training & match data</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  <span>Realistic load metrics</span>
                </div>
              </div>
              
              <Button onClick={downloadTemplate} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download StatSports Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5 text-green-600" />
              Upload GPS Data
            </CardTitle>
            <CardDescription>
              Drag and drop your CSV file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your CSV file here
              </p>
              <p className="text-gray-600 mb-4">
                Supports StatSports GPS data export files
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer">
                  Browse Files
                </Button>
              </label>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading GPS data...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Results */}
        {uploadResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {uploadResult.success ? (
                  <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
                )}
                Upload {uploadResult.success ? 'Successful' : 'Failed'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Success Stats */}
                {uploadResult.success && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {uploadResult.recordsProcessed}
                      </div>
                      <div className="text-sm text-green-700">Records Processed</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {uploadResult.playersAffected.length}
                      </div>
                      <div className="text-sm text-blue-700">Players Updated</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {uploadResult.duplicates}
                      </div>
                      <div className="text-sm text-yellow-700">Duplicates Skipped</div>
                    </div>
                  </div>
                )}

                {/* Players Affected */}
                {uploadResult.playersAffected.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Players Updated:</h4>
                    <div className="flex flex-wrap gap-2">
                      {uploadResult.playersAffected.map(player => (
                        <Badge key={player} variant="secondary">
                          {player.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors */}
                {uploadResult.errors.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <strong>Issues found:</strong>
                        {uploadResult.errors.map((error, index) => (
                          <div key={index} className="text-sm">• {error}</div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Next Steps */}
                {uploadResult.success && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div>• Check Training Workrate page to view new GPS sessions</div>
                      <div>• Review load status indicators in Team Dashboard</div>
                      <div>• Monitor any red load status players in Medical Hub</div>
                      <div>• Analyze performance trends in S&C Portal</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Format Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-purple-600" />
              Data Format Requirements
            </CardTitle>
            <CardDescription>
              Ensure your CSV file matches these specifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">Required Columns:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• playerId (must match Firebase player)</li>
                  <li>• sessionId (unique identifier)</li>
                  <li>• date (ISO timestamp format)</li>
                  <li>• sessionType (training/match/conditioning/recovery)</li>
                  <li>• GPS metrics (totalDistance, maxVelocity, etc.)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Data Validation:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Player IDs verified against database</li>
                  <li>• Realistic ranges for GPS metrics</li>
                  <li>• Load status calculation verification</li>
                  <li>• Duplicate session detection</li>
                  <li>• Data quality thresholds enforced</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}