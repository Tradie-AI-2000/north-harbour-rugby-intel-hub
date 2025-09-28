import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NavigationHeader from '@/components/navigation-header';
import { Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CSVUpload() {
  const [uploadStatus, setUploadStatus] = useState<{
    players: 'pending' | 'uploading' | 'success' | 'error';
    matches: 'pending' | 'uploading' | 'success' | 'error';
    training: 'pending' | 'uploading' | 'success' | 'error';
    injuries: 'pending' | 'uploading' | 'success' | 'error';
  }>({
    players: 'pending',
    matches: 'pending',
    training: 'pending',
    injuries: 'pending'
  });

  const { toast } = useToast();

  const handleFileUpload = async (file: File, type: 'players' | 'matches' | 'training' | 'injuries') => {
    setUploadStatus(prev => ({ ...prev, [type]: 'uploading' }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus(prev => ({ ...prev, [type]: 'success' }));
        toast({
          title: "Upload Successful",
          description: `${result.count} ${type} records imported successfully`,
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setUploadStatus(prev => ({ ...prev, [type]: 'error' }));
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${type} data. Please check your CSV format.`,
        variant: "destructive",
      });
    }
  };

  const uploadSections = [
    {
      key: 'players' as const,
      title: 'Player Data',
      description: 'Upload your Players.csv file with player information',
      expectedColumns: 'firstName, lastName, dateOfBirth, height, weight, primaryPosition, jerseyNumber, phone, email'
    },
    {
      key: 'matches' as const,
      title: 'Match Data',
      description: 'Upload your PlayerMatches.csv file with match statistics',
      expectedColumns: 'playerName, matchDate, opponent, position, minutesPlayed, tries, tackles, carries'
    },
    {
      key: 'training' as const,
      title: 'Training Data',
      description: 'Upload your Player training.csv file with training sessions',
      expectedColumns: 'playerName, sessionDate, sessionType, duration, intensity, loadScore, rpe'
    },
    {
      key: 'injuries' as const,
      title: 'Injury Data',
      description: 'Upload your Injuries.csv file with injury tracking',
      expectedColumns: 'playerName, injuryType, injuryDate, injuryLocation, severity, expectedReturn'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'uploading':
        return <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader
        title="CSV Data Import"
        breadcrumbs={[
          { label: "Main", href: "/" },
          { label: "Data Management", href: "/data-management" },
          { label: "CSV Upload" }
        ]}
        backButton={{
          label: "Back to Data Management",
          href: "/data-management"
        }}
      />

      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {uploadSections.map((section) => (
          <Card key={section.key} className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getStatusIcon(uploadStatus[section.key])}
                {section.title}
              </CardTitle>
              <CardDescription>
                {section.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <strong>Expected columns:</strong> {section.expectedColumns}
              </div>
              
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, section.key);
                    }
                  }}
                  className="hidden"
                  id={`file-${section.key}`}
                  disabled={uploadStatus[section.key] === 'uploading'}
                />
                
                <Button
                  onClick={() => document.getElementById(`file-${section.key}`)?.click()}
                  variant={uploadStatus[section.key] === 'success' ? 'outline' : 'default'}
                  className="w-full"
                  disabled={uploadStatus[section.key] === 'uploading'}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadStatus[section.key] === 'uploading' 
                    ? 'Uploading...' 
                    : uploadStatus[section.key] === 'success'
                    ? 'Upload Complete - Click to Replace'
                    : `Upload ${section.title}`
                  }
                </Button>

                {uploadStatus[section.key] === 'success' && (
                  <div className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Data imported successfully
                  </div>
                )}

                {uploadStatus[section.key] === 'error' && (
                  <div className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Upload failed - please check CSV format
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">How to Export from Google Sheets:</h3>
            <ol className="text-sm text-blue-800 space-y-1 text-left max-w-md mx-auto">
              <li>1. Open your Google Sheet</li>
              <li>2. Click on each sheet tab (Players, PlayerMatches, etc.)</li>
              <li>3. Go to File → Download → Comma-separated values (.csv)</li>
              <li>4. Upload each CSV file using the buttons above</li>
            </ol>
          </CardContent>
        </Card>

        {Object.values(uploadStatus).every(status => status === 'success') && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 text-green-800">
                <CheckCircle className="h-6 w-6" />
                <span className="font-semibold">All data imported successfully!</span>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Your North Harbour Rugby data is now available in the performance dashboard.
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}