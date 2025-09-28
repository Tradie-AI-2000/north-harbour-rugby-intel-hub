import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Loader2, Database, Users, Cloud } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface MigrationResult {
  success: boolean;
  message: string;
  playersCreated: number;
  errors: string[];
  timestamp: string;
}

interface MigrationStatus {
  timestamp: string;
  status: 'completed' | 'error' | 'pending';
  statistics: {
    totalPlayers: number;
    totalSquads: number;
    collections: number;
  };
  errors: string[];
  firebaseProject: string;
  schemaVersion: string;
}

export default function FirebaseMigration() {
  const [migrationStarted, setMigrationStarted] = useState(false);

  // Get current migration status
  const { data: migrationStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/firebase/migration-status'],
    refetchInterval: migrationStarted ? 5000 : false, // Poll every 5 seconds during migration
  });

  // Migration mutation
  const migrationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/firebase/migrate', { method: 'POST' });
      return await response.json();
    },
    onSuccess: () => {
      setMigrationStarted(false);
      refetchStatus();
    },
    onError: () => {
      setMigrationStarted(false);
    },
  });

  // Verification mutation
  const verificationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/firebase/verify');
      return await response.json();
    },
  });

  // Cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/firebase/cleanup', { method: 'POST' });
      return await response.json();
    },
    onSuccess: () => {
      refetchStatus();
      refetchDatabaseStatus();
    },
  });

  // Database status query
  const { data: databaseStatus, refetch: refetchDatabaseStatus } = useQuery({
    queryKey: ['/api/firebase/database-status'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const handleStartMigration = () => {
    setMigrationStarted(true);
    migrationMutation.mutate();
  };

  const handleVerifyMigration = () => {
    verificationMutation.mutate();
  };

  const handleCleanupDatabase = () => {
    cleanupMutation.mutate();
  };

  const isCurrentlyMigrating = migrationMutation.isPending || migrationStarted;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Cloud className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Firebase Migration</h1>
          <p className="text-muted-foreground">
            Migrate North Harbour Rugby data to unified Firebase schema
          </p>
        </div>
      </div>

      {/* Migration Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migration Status
          </CardTitle>
          <CardDescription>
            Current status of the Firebase migration process
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading migration status...</span>
            </div>
          ) : migrationStatus ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {migrationStatus.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <Badge 
                  variant={migrationStatus.status === 'completed' ? 'default' : 'secondary'}
                  className={migrationStatus.status === 'completed' ? 'bg-green-600' : ''}
                >
                  {migrationStatus.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(migrationStatus.timestamp).toLocaleString()}
                </span>
              </div>

              {migrationStatus.statistics && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {migrationStatus.statistics.totalPlayers}
                    </div>
                    <div className="text-sm text-muted-foreground">Players</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {migrationStatus.statistics.totalSquads}
                    </div>
                    <div className="text-sm text-muted-foreground">Squads</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {migrationStatus.statistics.collections}
                    </div>
                    <div className="text-sm text-muted-foreground">Collections</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Firebase Project:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {migrationStatus.firebaseProject}
                  </code>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Schema Version:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {migrationStatus.schemaVersion}
                  </code>
                </div>
              </div>

              {migrationStatus.errors && migrationStatus.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Migration Errors</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      {migrationStatus.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No migration status available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Migration Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Actions</CardTitle>
          <CardDescription>
            Execute or verify the Firebase migration process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Start Migration */}
          <div className="space-y-2">
            <Button
              onClick={handleStartMigration}
              disabled={isCurrentlyMigrating}
              className="w-full"
              size="lg"
            >
              {isCurrentlyMigrating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Start Migration
                </>
              )}
            </Button>
            
            {isCurrentlyMigrating && (
              <div className="space-y-2">
                <Progress value={undefined} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Creating unified 2025 North Harbour squad database in Firebase...
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Verify Migration */}
          <div className="space-y-2">
            <Button
              onClick={handleVerifyMigration}
              disabled={verificationMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {verificationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Migration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Migration Results */}
      {migrationMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {migrationMutation.data.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Migration Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={migrationMutation.data.success ? "default" : "destructive"}>
              <AlertTitle>
                {migrationMutation.data.success ? "Migration Successful" : "Migration Failed"}
              </AlertTitle>
              <AlertDescription>
                <div className="space-y-2 mt-2">
                  <p>{migrationMutation.data.message}</p>
                  
                  {migrationMutation.data.playersCreated > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{migrationMutation.data.playersCreated} players created</span>
                    </div>
                  )}

                  {migrationMutation.data.errors && migrationMutation.data.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium mb-2">Errors encountered:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {migrationMutation.data.errors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-3">
                    Completed at: {new Date(migrationMutation.data.timestamp).toLocaleString()}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Verification Results */}
      {verificationMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationMutation.data.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Verification Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={verificationMutation.data.success ? "default" : "destructive"}>
              <AlertTitle>
                {verificationMutation.data.success ? "Verification Passed" : "Verification Failed"}
              </AlertTitle>
              <AlertDescription>
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Players:</span> {verificationMutation.data.playerCount}
                    </div>
                    <div>
                      <span className="font-medium">Squads:</span> {verificationMutation.data.squadCount}
                    </div>
                  </div>

                  {verificationMutation.data.errors && verificationMutation.data.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium mb-2">Issues found:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {verificationMutation.data.errors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Schema Information */}
      <Card>
        <CardHeader>
          <CardTitle>Firebase Schema Overview</CardTitle>
          <CardDescription>
            Expanded schema supporting all frontend operational workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Main Collections</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• players</li>
                <li>• squads</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Medical Data</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• medicalAppointments</li>
                <li>• medicalNotes</li>
                <li>• injuryRecords</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">S&C Data</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• fitnessTests</li>
                <li>• gpsSessions</li>
                <li>• physicalAttributes</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Coaching Data</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• coachingNotes</li>
                <li>• matchAnalysis</li>
                <li>• aiAnalysis</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Operational Data</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• statusTracking</li>
                <li>• dataSourceTracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}