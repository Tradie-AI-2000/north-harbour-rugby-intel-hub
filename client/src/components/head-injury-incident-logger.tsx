import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Activity, 
  Eye,
  Brain,
  Save,
  X
} from "lucide-react";
import { headInjuryIncidentSchema } from "@shared/schema";

// Form schema for incident logging
const incidentFormSchema = headInjuryIncidentSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  dateTime: z.string().min(1, "Date and time is required"),
  playerId: z.string().min(1, "Player selection is required"),
  reportedBy: z.string().min(1, "Reporter is required")
});

type IncidentFormData = z.infer<typeof incidentFormSchema>;

interface HeadInjuryIncidentLoggerProps {
  onClose?: () => void;
  onSubmitted?: (incidentId: string) => void;
  selectedPlayerId?: string;
}

export default function HeadInjuryIncidentLogger({ 
  onClose, 
  onSubmitted, 
  selectedPlayerId 
}: HeadInjuryIncidentLoggerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock players - replace with real API call
  const mockPlayers = [
    { id: "player_1", name: "Jake Thompson", position: "Hooker" },
    { id: "player_2", name: "Mike Wilson", position: "Flanker" },
    { id: "player_3", name: "David Brown", position: "Lock" },
    { id: "player_4", name: "Sam Taylor", position: "Prop" }
  ];

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      playerId: selectedPlayerId || "",
      dateTime: new Date().toISOString().slice(0, 16),
      context: "training",
      contextDetails: "",
      mechanismOfInjury: "unknown",
      mechanismDescription: "",
      immediateSymptoms: {
        lossOfConsciousness: false,
        seizure: false,
        confusion: false,
        unsteadiness: false,
        dizziness: false,
        nausea: false,
        headache: false,
        visualDisturbance: false
      },
      initialAction: {
        removedFromPlay: false,
        hiaAdministered: false,
        immediateAssessment: false,
        hospitalReferral: false
      },
      reportedBy: "medical_staff" // Current user in real app
    }
  });

  const submitIncident = useMutation({
    mutationFn: async (data: IncidentFormData) => {
      // In real app, this would POST to /api/head-injuries/incidents
      console.log("Submitting incident:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { 
        id: `incident_${Date.now()}`,
        success: true,
        message: "Incident logged successfully"
      };
    },
    onSuccess: (response) => {
      toast({
        title: "Incident Logged",
        description: "Head injury incident has been successfully recorded.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/head-injuries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      
      if (onSubmitted) {
        onSubmitted(response.id);
      }
      
      if (onClose) {
        onClose();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log incident. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = async (data: IncidentFormData) => {
    setIsSubmitting(true);
    try {
      await submitIncident.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mechanismOptions = [
    { value: "head_to_ground", label: "Head to Ground", icon: "🏃➜🌍" },
    { value: "head_to_shoulder", label: "Head to Shoulder", icon: "👥💥" },
    { value: "head_to_head", label: "Head to Head", icon: "👤➜👤" },
    { value: "head_to_knee", label: "Head to Knee", icon: "👤➜🦵" },
    { value: "whiplash", label: "Whiplash", icon: "🌪️" },
    { value: "unknown", label: "Unknown", icon: "❓" },
    { value: "other", label: "Other", icon: "⚠️" }
  ];

  const selectedPlayer = mockPlayers.find(p => p.id === form.watch("playerId"));

  return (
    <div className="space-y-6" data-testid="head-injury-incident-logger">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-semibold">Log Head Injury Incident</h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Alert className="border-red-200 bg-red-50">
        <Brain className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>IMMEDIATE ACTION REQUIRED:</strong> Complete HIA assessment within 3 minutes if head impact is suspected.
          Remove player from field immediately if any symptoms are present.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Incident Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Incident Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="playerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-player">
                            <SelectValue placeholder="Select player" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockPlayers.map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name} - {player.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time *</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          data-testid="input-datetime"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-context">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="game">Game</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contextDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context Details</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., vs Auckland Blues, scrum drill"
                          data-testid="input-context-details"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="mechanismOfInjury"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mechanism of Injury *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-mechanism">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mechanismOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span>{option.icon}</span>
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mechanismDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mechanism Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Detailed description of how the injury occurred"
                        data-testid="textarea-mechanism-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Immediate Symptoms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Immediate Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(form.watch("immediateSymptoms")).map(([symptom, checked]) => (
                  <FormField
                    key={symptom}
                    control={form.control}
                    name={`immediateSymptoms.${symptom}` as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid={`checkbox-symptom-${symptom}`}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            {symptom.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Initial Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Initial Actions Taken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(form.watch("initialAction")).map(([action, taken]) => (
                  <FormField
                    key={action}
                    control={form.control}
                    name={`initialAction.${action}` as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid={`checkbox-action-${action}`}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            {action.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reported By */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Report Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="reportedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reported By *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Medical staff ID or name"
                        data-testid="input-reported-by"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Selected Player Summary */}
          {selectedPlayer && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedPlayer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{selectedPlayer.name}</p>
                    <p className="text-sm text-blue-700">{selectedPlayer.position}</p>
                  </div>
                  <Badge className="ml-auto bg-blue-100 text-blue-800">Selected Player</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
              data-testid="button-submit-incident"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Logging Incident..." : "Log Incident"}
            </Button>
            
            {onClose && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Next Steps Info */}
          <Alert className="border-blue-200 bg-blue-50">
            <Brain className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Next Steps:</strong> After logging this incident, proceed with HIA assessment if not already completed.
              Player will be automatically entered into RTP protocol if assessment indicates concussion.
            </AlertDescription>
          </Alert>
        </form>
      </Form>
    </div>
  );
}