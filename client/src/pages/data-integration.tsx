import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import NavigationHeader from "@/components/navigation-header";
import { 
  Sheet, 
  Upload, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Eye,
  Users,
  Calendar,
  Activity,
  Heart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DataIntegration() {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [syncResults, setSyncResults] = useState<any>(null);
  const { toast } = useToast();

  const extractSpreadsheetId = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const handlePreview = async () => {
    if (!spreadsheetId) {
      toast({
        title: "Missing Information",
        description: "Please enter a Google Sheets URL or ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const id = extractSpreadsheetId(spreadsheetId);
      const response = await fetch(`/api/sheets/preview/${id}`);
      const data = await response.json();

      if (data.success) {
        setPreviewData(data);
        toast({
          title: "Preview Loaded!",
          description: `Found ${data.totalRows} player records in your spreadsheet`,
        });
      } else {
        throw new Error(data.error || 'Failed to preview data');
      }
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: "Could not access the spreadsheet. Please check your credentials and permissions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (dataType: string) => {
    if (!spreadsheetId) {
      toast({
        title: "Missing Information",
        description: "Please enter a Google Sheets URL or ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const id = extractSpreadsheetId(spreadsheetId);
      const endpoint = dataType === 'all' ? '/api/sheets/sync-all' : `/api/sheets/sync-${dataType}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId: id })
      });

      const data = await response.json();

      if (data.success) {
        setSyncResults(data);
        toast({
          title: "Sync Successful!",
          description: data.message,
        });
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Could not sync data. Please check your setup and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader
        title="Data Integration"
        breadcrumbs={[
          { label: "Main", href: "/" },
          { label: "Data Management", href: "/data-management" },
          { label: "Integration" }
        ]}
        backButton={{
          label: "Back to Data Management",
          href: "/data-management"
        }}
      />

      <div className="p-6 space-y-6">
        {/* Setup Instructions */}
      <Alert>
        <Sheet className="h-4 w-4" />
        <AlertDescription>
          <strong>Setup Required:</strong> To connect Google Sheets, you'll need to provide Google API credentials. 
          Contact your system administrator to configure GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.
        </AlertDescription>
      </Alert>

      {/* Main Integration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sheet className="text-green-600" size={24} />
            <span>Google Sheets Integration</span>
          </CardTitle>
          <CardDescription>
            Import player data, match statistics, training records, and medical information directly from your Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Spreadsheet URL Input */}
          <div className="space-y-2">
            <Label htmlFor="spreadsheet">Google Sheets URL or ID</Label>
            <Input
              id="spreadsheet"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit or just the ID"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Paste the full URL or just the spreadsheet ID from your Google Sheets document
            </p>
          </div>

          {/* CSV Download Section */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-blue-900">📥 Download CSV Templates</h4>
            <p className="text-sm text-blue-700">Download ready-to-use CSV files with sample North Harbour Rugby data that you can import directly into Google Sheets</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <a 
                href="/api/export/players-template" 
                download="nh_rugby_players.csv"
                className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                📊 Players
              </a>
              <a 
                href="/api/export/matches-template" 
                download="nh_rugby_matches.csv"
                className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-green-700 bg-white border border-green-200 rounded-md hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                🏉 Matches
              </a>
              <a 
                href="/api/export/training-template" 
                download="nh_rugby_training.csv"
                className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-orange-700 bg-white border border-orange-200 rounded-md hover:bg-orange-50 hover:border-orange-300 transition-colors"
              >
                💪 Training
              </a>
              <a 
                href="/api/export/injuries-template" 
                download="nh_rugby_injuries.csv"
                className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                🏥 Injuries
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button 
              onClick={handlePreview} 
              disabled={isLoading || !spreadsheetId}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Eye size={16} />
              <span>Preview Data</span>
            </Button>
            
            <Button 
              onClick={() => handleSync('players')} 
              disabled={isLoading || !spreadsheetId}
              className="flex items-center space-x-2 bg-nh-blue hover:bg-nh-navy"
            >
              {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
              <span>Sync Player Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Results */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="text-blue-600" size={20} />
              <span>Data Preview</span>
              <Badge variant="secondary">{previewData.totalRows} total rows</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Position</th>
                    <th className="text-left p-2">Jersey #</th>
                    <th className="text-left p-2">Weight</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">GPS Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.preview?.slice(0, 5).map((player: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-medium">{player.name}</td>
                      <td className="p-2">{player.position}</td>
                      <td className="p-2">{player.jerseyNumber}</td>
                      <td className="p-2">{player.weight}kg</td>
                      <td className="p-2">
                        <Badge variant={player.injuryStatus === 'Available' ? 'default' : 'destructive'}>
                          {player.injuryStatus}
                        </Badge>
                      </td>
                      <td className="p-2">{player.gpsDistance}km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.totalRows > 5 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Showing 5 of {previewData.totalRows} records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Sync Options */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Sync Options</CardTitle>
          <CardDescription>Sync specific data types from different sheets</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="players" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
            </TabsList>
            
            <TabsContent value="players" className="space-y-4">
              <div className="flex items-center space-x-4">
                <Users className="text-blue-600" size={24} />
                <div className="flex-1">
                  <h4 className="font-medium">Player Data</h4>
                  <p className="text-sm text-gray-600">Import basic player information, physical stats, and performance metrics</p>
                </div>
                <Button onClick={() => handleSync('players')} disabled={isLoading}>
                  Sync Players
                </Button>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <strong>Expected columns:</strong> Name, Position, Jersey#, Weight, Height, Age, Fitness Score, Injury Status, Last Match, GPS Distance, Top Speed, Tackles, Carries, Pass Accuracy
              </div>
            </TabsContent>

            <TabsContent value="matches" className="space-y-4">
              <div className="flex items-center space-x-4">
                <Calendar className="text-green-600" size={24} />
                <div className="flex-1">
                  <h4 className="font-medium">Match Data</h4>
                  <p className="text-sm text-gray-600">Import match statistics and performance data</p>
                </div>
                <Button onClick={() => handleSync('matches')} disabled={isLoading}>
                  Sync Matches
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="training" className="space-y-4">
              <div className="flex items-center space-x-4">
                <Activity className="text-orange-600" size={24} />
                <div className="flex-1">
                  <h4 className="font-medium">Training Data</h4>
                  <p className="text-sm text-gray-600">Import training sessions, load data, and performance metrics</p>
                </div>
                <Button onClick={() => handleSync('training')} disabled={isLoading}>
                  Sync Training
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <div className="flex items-center space-x-4">
                <Heart className="text-red-600" size={24} />
                <div className="flex-1">
                  <h4 className="font-medium">Medical Data</h4>
                  <p className="text-sm text-gray-600">Import injury records, medical clearances, and health status</p>
                </div>
                <Button onClick={() => handleSync('medical')} disabled={isLoading}>
                  Sync Medical
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sync Results */}
      {syncResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={20} />
              <span>Sync Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-green-600 font-medium">{syncResults.message}</p>
              {syncResults.playersImported && (
                <p className="text-sm text-gray-600">
                  Imported {syncResults.playersImported} players from {syncResults.totalRows} total rows
                </p>
              )}
              {syncResults.data && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{syncResults.data.players}</div>
                    <div className="text-xs text-gray-600">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{syncResults.data.matches}</div>
                    <div className="text-xs text-gray-600">Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{syncResults.data.training}</div>
                    <div className="text-xs text-gray-600">Training</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{syncResults.data.medical}</div>
                    <div className="text-xs text-gray-600">Medical</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Guide</CardTitle>
          <CardDescription>How to prepare your Google Sheets for integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">1. Prepare Your Spreadsheet</h4>
              <p className="text-sm text-gray-600">Create separate sheets for different data types: "Players", "Matches", "Training", "Medical"</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">2. Set Up Column Headers</h4>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                Players Sheet: Name | Position | Jersey# | Weight | Height | Age | Fitness Score | Injury Status | Last Match | GPS Distance | Top Speed | Tackles | Carries | Pass Accuracy
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">3. Share Your Spreadsheet</h4>
              <p className="text-sm text-gray-600">Share your spreadsheet with the service account email provided in your Google API setup</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">4. Configure API Access</h4>
              <p className="text-sm text-gray-600">Ensure your Google API credentials (GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY) are properly configured</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}