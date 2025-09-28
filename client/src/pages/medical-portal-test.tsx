import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import NavigationHeader from "@/components/navigation-header";
import { 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  TestTube,
  Database,
  Send,
  RefreshCw
} from "lucide-react";

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export default function MedicalPortalTest() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [availabilityStatus, setAvailabilityStatus] = useState<"available" | "modified" | "unavailable">("available");
  const [availabilityNotes, setAvailabilityNotes] = useState("");

  // Medical portal test queries now use real Firebase player IDs
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("aisea_halo");
  
  // Test 1: Fetch player medical data
  const { data: medicalData, isLoading: medicalLoading } = useQuery({
    queryKey: ["/api/players", selectedPlayerId, "medical"],
    retry: false,
  });

  // Test 2: Fetch Firebase medical appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/firebase/players", selectedPlayerId, "medical/appointments"],
    retry: false,
  });

  // Test 3: Fetch Firebase medical notes
  const { data: medicalNotes, isLoading: notesLoading } = useQuery({
    queryKey: ["/api/firebase/players", selectedPlayerId, "medical/notes"],
    retry: false,
  });

  // Test 4: Fetch injury records
  const { data: injuries, isLoading: injuriesLoading } = useQuery({
    queryKey: ["/api/firebase/players", selectedPlayerId, "medical/injuries"],
    retry: false,
  });

  // Test 5: Test availability update mutation
  const availabilityUpdateMutation = useMutation({
    mutationFn: async (data: { status: string; notes: string }) => {
      return await apiRequest(`/api/players/${selectedPlayerId}/availability`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ 
        ...prev, 
        availabilityUpdate: { success: true, message: "Availability updated successfully", data } 
      }));
      toast({
        title: "Test Passed",
        description: "Availability update flow working correctly",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
    },
    onError: (error: any) => {
      setTestResults(prev => ({ 
        ...prev, 
        availabilityUpdate: { success: false, message: "Availability update failed", error: error.message } 
      }));
      toast({
        title: "Test Failed",
        description: "Availability update encountered an error",
        variant: "destructive",
      });
    }
  });

  // Test 6: Test medical communication
  const communicationMutation = useMutation({
    mutationFn: async (data: { type: string; message: string }) => {
      return await apiRequest('/api/medical/communication', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ 
        ...prev, 
        communication: { success: true, message: "Communication sent successfully", data } 
      }));
    },
    onError: (error: any) => {
      setTestResults(prev => ({ 
        ...prev, 
        communication: { success: false, message: "Communication failed", error: error.message } 
      }));
    }
  });

  // Test 7: Create medical appointment
  const appointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/firebase/players/jake_thompson/medical/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ 
        ...prev, 
        createAppointment: { success: true, message: "Appointment created successfully", data } 
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/firebase/players/jake_thompson/medical/appointments"] });
    },
    onError: (error: any) => {
      setTestResults(prev => ({ 
        ...prev, 
        createAppointment: { success: false, message: "Appointment creation failed", error: error.message } 
      }));
    }
  });

  const runAllTests = async () => {
    setTestResults({});
    toast({
      title: "Running Tests",
      description: "Testing medical portal data flow and Firebase integration",
    });

    // Test availability update
    availabilityUpdateMutation.mutate({
      status: availabilityStatus,
      notes: availabilityNotes || "Test availability update from medical portal"
    });

    // Test communication
    communicationMutation.mutate({
      type: "status_update",
      message: "Test medical communication - player status updated"
    });

    // Test appointment creation
    appointmentMutation.mutate({
      type: "assessment",
      date: new Date().toISOString().split('T')[0],
      time: "14:00",
      provider: "Dr. Test",
      notes: "Test appointment from medical portal"
    });
  };

  const getStatusColor = (success: boolean) => {
    return success ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        title="Medical Portal Integration Test"
        subtitle="Testing Firebase schema, APIs, and data flow for medical availability updates"
        breadcrumbs={[
          { label: "Medical Hub", href: "/medical" },
          { label: "Integration Test", href: "/medical-portal-test" }
        ]}
        backUrl="/medical"
        backLabel="Back to Medical Hub"
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TestTube className="mr-2 h-5 w-5" />
              Medical Portal Test Suite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Test Availability Status</label>
                <Select value={availabilityStatus} onValueChange={(value: "available" | "modified" | "unavailable") => setAvailabilityStatus(value)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available - Full Training</SelectItem>
                    <SelectItem value="modified">Modified Training</SelectItem>
                    <SelectItem value="unavailable">Unavailable - Injured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Test Notes</label>
                <Textarea
                  placeholder="Test notes for availability update..."
                  value={availabilityNotes}
                  onChange={(e) => setAvailabilityNotes(e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>
            
            <Button onClick={runAllTests} className="w-full" size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Run All Medical Portal Tests
            </Button>
          </CardContent>
        </Card>

        {/* API Data Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Firebase API Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Firebase API Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Medical Appointments</div>
                    <div className="text-xs text-gray-500">
                      {appointmentsLoading ? "Loading..." : appointments ? "✓ Data loaded" : "✗ No data"}
                    </div>
                  </div>
                  <Badge className={appointments ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {appointments ? "Pass" : "Fail"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Medical Notes</div>
                    <div className="text-xs text-gray-500">
                      {notesLoading ? "Loading..." : medicalNotes ? "✓ Data loaded" : "✗ No data"}
                    </div>
                  </div>
                  <Badge className={medicalNotes ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {medicalNotes ? "Pass" : "Fail"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Injury Records</div>
                    <div className="text-xs text-gray-500">
                      {injuriesLoading ? "Loading..." : injuries ? "✓ Data loaded" : "✗ No data"}
                    </div>
                  </div>
                  <Badge className={injuries ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {injuries ? "Pass" : "Fail"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Medical Data</div>
                    <div className="text-xs text-gray-500">
                      {medicalLoading ? "Loading..." : medicalData ? "✓ Data loaded" : "✗ No data"}
                    </div>
                  </div>
                  <Badge className={medicalData ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {medicalData ? "Pass" : "Fail"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Flow Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="mr-2 h-5 w-5" />
                Data Flow Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {Object.entries(testResults).map(([testName, result]) => (
                  <div key={testName} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm capitalize">{testName.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="text-xs text-gray-500">{result.message}</div>
                    </div>
                    <Badge className={`flex items-center gap-2 ${getStatusColor(result.success)}`}>
                      {getStatusIcon(result.success)}
                      {result.success ? "Pass" : "Fail"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Test Results */}
        {Object.keys(testResults).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(testResults).map(([testName, result]) => (
                  <Alert key={testName} className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium capitalize mb-2">{testName.replace(/([A-Z])/g, ' $1')} Test</div>
                      <div className="text-sm mb-2">{result.message}</div>
                      {result.data && (
                        <div className="text-xs bg-white p-2 rounded border">
                          <pre>{JSON.stringify(result.data, null, 2)}</pre>
                        </div>
                      )}
                      {result.error && (
                        <div className="text-xs text-red-600 bg-red-100 p-2 rounded border">
                          Error: {result.error}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Preview */}
        {(medicalData || appointments || medicalNotes || injuries) && (
          <Card>
            <CardHeader>
              <CardTitle>Live Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {medicalData && (
                  <div>
                    <h4 className="font-medium mb-2">Medical Data</h4>
                    <div className="text-xs bg-gray-100 p-3 rounded">
                      <pre>{JSON.stringify(medicalData, null, 2)}</pre>
                    </div>
                  </div>
                )}
                
                {appointments && (
                  <div>
                    <h4 className="font-medium mb-2">Appointments</h4>
                    <div className="text-xs bg-gray-100 p-3 rounded">
                      <pre>{JSON.stringify(appointments, null, 2)}</pre>
                    </div>
                  </div>
                )}
                
                {medicalNotes && (
                  <div>
                    <h4 className="font-medium mb-2">Medical Notes</h4>
                    <div className="text-xs bg-gray-100 p-3 rounded">
                      <pre>{JSON.stringify(medicalNotes, null, 2)}</pre>
                    </div>
                  </div>
                )}
                
                {injuries && (
                  <div>
                    <h4 className="font-medium mb-2">Injury Records</h4>
                    <div className="text-xs bg-gray-100 p-3 rounded">
                      <pre>{JSON.stringify(injuries, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}