import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/navigation-header";
import { apiRequest } from "@/lib/queryClient";
import { 
  Database, 
  Users, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  Download
} from "lucide-react";

export default function DatabaseAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [populateStatus, setPopulateStatus] = useState<string>("");

  // Fetch current players count
  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ["/api/players"],
  });

  // Populate database mutation
  const populateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/players/populate", "POST");
      return response;
    },
    onSuccess: (data) => {
      setPopulateStatus(`Successfully populated database: ${data.inserted} new players added, ${data.updated} players updated`);
      toast({
        title: "Database Populated",
        description: `Added ${data.inserted} new players and updated ${data.updated} existing players`,
      });
      // Refresh the players list
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
    },
    onError: (error: Error) => {
      setPopulateStatus(`Error: ${error.message}`);
      toast({
        title: "Population Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePopulateDatabase = () => {
    setPopulateStatus("Populating database...");
    populateMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        title="Database Administration"
        description="Manage North Harbour Rugby player database"
        breadcrumbs={[
          { label: "Main", href: "/" },
          { label: "Database Admin" }
        ]}
        badges={[
          { text: `${players.length} Players`, className: "bg-white text-nh-red" },
          { text: "Admin Panel", className: "bg-nh-red-700 text-white" }
        ]}
        backUrl="/"
        backLabel="Back to Main"
      />

      <div className="container mx-auto p-6 space-y-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {playersLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : players.length}
                </div>
                <div className="text-sm text-gray-600">Current Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">42</div>
                <div className="text-sm text-gray-600">Available in System</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {42 - players.length}
                </div>
                <div className="text-sm text-gray-600">Missing Players</div>
              </div>
            </div>

            {populateStatus && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {populateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : populateStatus.includes("Error") ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-sm">{populateStatus}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Populate Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Load the complete North Harbour Rugby squad (42 players) into the database. 
                This includes all player details, positions, game statistics, and performance data.
              </p>
              
              <div className="space-y-2">
                <Badge variant="outline" className="mr-2">Complete Player Profiles</Badge>
                <Badge variant="outline" className="mr-2">Game Statistics</Badge>
                <Badge variant="outline" className="mr-2">Physical Attributes</Badge>
                <Badge variant="outline">Skills Data</Badge>
              </div>

              <Button 
                onClick={handlePopulateDatabase}
                disabled={populateMutation.isPending}
                className="w-full"
              >
                {populateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Populating Database...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Populate with North Harbour Squad
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Database Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Additional database management operations for player data.
              </p>

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/players"] })}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Player List
                </Button>

                <Button variant="outline" className="w-full" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Export Player Data (Coming Soon)
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500">
                  <strong>Note:</strong> The populate operation will add missing players and update existing ones. 
                  No data will be lost during this process.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player Preview */}
        {players.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Current Players in Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.slice(0, 12).map((player: any) => (
                  <div key={player.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-nh-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {player.rugbyProfile?.jerseyNumber || "?"}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {player.personalDetails?.firstName} {player.personalDetails?.lastName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {player.rugbyProfile?.primaryPosition || "Unknown"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {players.length > 12 && (
                <div className="mt-3 text-center text-sm text-gray-600">
                  And {players.length - 12} more players...
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}