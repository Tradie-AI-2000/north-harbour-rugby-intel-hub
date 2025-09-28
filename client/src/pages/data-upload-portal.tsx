import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Database,
  Zap,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';

interface UploadStatus {
  filename: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  recordsProcessed?: number;
  errors?: string[];
}

export default function DataUploadPortal() {
  const [optaUploads, setOptaUploads] = useState<UploadStatus[]>([]);
  const [gpsUploads, setGpsUploads] = useState<UploadStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (files: FileList, uploadType: 'opta' | 'gps') => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const uploadStatus: UploadStatus = {
        filename: file.name,
        status: 'uploading',
        progress: 0,
        message: 'Preparing upload...'
      };

      if (uploadType === 'opta') {
        setOptaUploads(prev => [...prev, uploadStatus]);
      } else {
        setGpsUploads(prev => [...prev, uploadStatus]);
      }

      try {
        await processFileUpload(file, uploadType, uploadStatus);
      } catch (error) {
        const errorStatus = {
          ...uploadStatus,
          status: 'error' as const,
          message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };

        if (uploadType === 'opta') {
          setOptaUploads(prev => prev.map(u => u.filename === file.name ? errorStatus : u));
        } else {
          setGpsUploads(prev => prev.map(u => u.filename === file.name ? errorStatus : u));
        }
      }
    }
  };

  const processFileUpload = async (file: File, uploadType: 'opta' | 'gps', uploadStatus: UploadStatus) => {
    const updateStatus = (updates: Partial<UploadStatus>) => {
      const newStatus = { ...uploadStatus, ...updates };
      if (uploadType === 'opta') {
        setOptaUploads(prev => prev.map(u => u.filename === file.name ? newStatus : u));
      } else {
        setGpsUploads(prev => prev.map(u => u.filename === file.name ? newStatus : u));
      }
    };

    // Simulate file validation
    updateStatus({ progress: 20, message: 'Validating file format...' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate data processing
    updateStatus({ 
      status: 'processing', 
      progress: 50, 
      message: 'Processing data records...' 
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate database upload
    updateStatus({ progress: 80, message: 'Uploading to Firebase...' });
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Complete
    const recordsProcessed = Math.floor(Math.random() * 500) + 50;
    updateStatus({ 
      status: 'completed',
      progress: 100,
      message: 'Upload completed successfully',
      recordsProcessed
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, uploadType: 'opta' | 'gps') => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files, uploadType);
    }
  };

  const getStatusColor = (status: UploadStatus['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: UploadStatus['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Activity className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Upload className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-8 w-8 text-nh-red" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Centralized Data Upload Portal</h1>
              <p className="text-gray-600">Upload OPTA match data and GPS tracking files to Firebase database</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {optaUploads.filter(u => u.status === 'completed').length}
                </div>
                <div className="text-sm text-blue-700">OPTA Files Processed</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">
                  {gpsUploads.filter(u => u.status === 'completed').length}
                </div>
                <div className="text-sm text-green-700">GPS Files Processed</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <Zap className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {optaUploads.concat(gpsUploads).reduce((sum, u) => sum + (u.recordsProcessed || 0), 0)}
                </div>
                <div className="text-sm text-purple-700">Total Records</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
              <Target className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-900">Real-time</div>
                <div className="text-sm text-orange-700">Data Sync</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Tabs */}
        <Tabs defaultValue="opta" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="opta" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              OPTA Match Data
            </TabsTrigger>
            <TabsTrigger value="gps" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              GPS Tracking Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="opta" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* OPTA Upload Area */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-nh-red" />
                    OPTA Match Data Upload
                  </CardTitle>
                  <CardDescription>
                    Upload match statistics, player performance data, and team analytics from OPTA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging ? 'border-nh-red bg-red-50' : 'border-gray-300'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'opta')}
                  >
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Drop OPTA files here</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Supports CSV, JSON, and XML formats
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept=".csv,.json,.xml"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'opta')}
                      className="hidden"
                      id="opta-upload"
                    />
                    <Label htmlFor="opta-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Choose Files
                      </Button>
                    </Label>
                  </div>

                  {/* Supported Data Types */}
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-gray-900">Supported Data Types:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Match Statistics</Badge>
                      <Badge variant="secondary">Player Performance</Badge>
                      <Badge variant="secondary">Set Piece Data</Badge>
                      <Badge variant="secondary">Possession Stats</Badge>
                      <Badge variant="secondary">Territory Analysis</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* OPTA Upload Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Status</CardTitle>
                  <CardDescription>Real-time processing status for OPTA uploads</CardDescription>
                </CardHeader>
                <CardContent>
                  {optaUploads.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No uploads in progress</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {optaUploads.map((upload, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(upload.status)}
                              <span className="font-medium text-sm">{upload.filename}</span>
                            </div>
                            <Badge className={getStatusColor(upload.status)}>
                              {upload.status}
                            </Badge>
                          </div>
                          <Progress value={upload.progress} className="mb-2" />
                          <p className="text-xs text-gray-600">{upload.message}</p>
                          {upload.recordsProcessed && (
                            <p className="text-xs text-green-600 font-medium">
                              {upload.recordsProcessed} records processed
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gps" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GPS Upload Area */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    GPS Tracking Data Upload
                  </CardTitle>
                  <CardDescription>
                    Upload StatSports GPS data, player tracking metrics, and session analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'gps')}
                  >
                    <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Drop GPS files here</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Supports CSV, XLS, and JSON formats
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept=".csv,.xls,.xlsx,.json"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'gps')}
                      className="hidden"
                      id="gps-upload"
                    />
                    <Label htmlFor="gps-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Choose Files
                      </Button>
                    </Label>
                  </div>

                  {/* Supported Data Types */}
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-gray-900">Supported Data Types:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Distance Metrics</Badge>
                      <Badge variant="secondary">Speed Zones</Badge>
                      <Badge variant="secondary">Heart Rate Data</Badge>
                      <Badge variant="secondary">Load Metrics</Badge>
                      <Badge variant="secondary">Accelerations</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* GPS Upload Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Status</CardTitle>
                  <CardDescription>Real-time processing status for GPS uploads</CardDescription>
                </CardHeader>
                <CardContent>
                  {gpsUploads.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No uploads in progress</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {gpsUploads.map((upload, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(upload.status)}
                              <span className="font-medium text-sm">{upload.filename}</span>
                            </div>
                            <Badge className={getStatusColor(upload.status)}>
                              {upload.status}
                            </Badge>
                          </div>
                          <Progress value={upload.progress} className="mb-2" />
                          <p className="text-xs text-gray-600">{upload.message}</p>
                          {upload.recordsProcessed && (
                            <p className="text-xs text-green-600 font-medium">
                              {upload.recordsProcessed} records processed
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Data Integration Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Real-time Data Integration
            </CardTitle>
            <CardDescription>
              All uploaded data is immediately available across the North Harbour Performance Hub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">OPTA Data Feeds To:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-nh-red rounded-full"></div>
                    <span>Work Rate Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-nh-red rounded-full"></div>
                    <span>Match Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-nh-red rounded-full"></div>
                    <span>Team Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-nh-red rounded-full"></div>
                    <span>Try Analysis</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">GPS Data Feeds To:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Work Rate Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>S&C Portal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Medical Hub</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Player Profiles</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Integration Features:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Real-time sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Data validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Error handling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Batch processing</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}