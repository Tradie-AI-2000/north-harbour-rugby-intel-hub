import { useState } from "react";
import { AlertTriangle, TrendingDown, Calendar, Clock, User, FileText, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import type { Player } from "@shared/schema";

interface InjuryTrackingProps {
  playerId: string;
  player?: Player;
}

export default function InjuryTracking({ playerId, player }: InjuryTrackingProps) {
  const [selectedInjury, setSelectedInjury] = useState<string | null>(null);

  if (!player) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500">No injury tracking data available</p>
      </div>
    );
  }

  // Sample injury data
  const injuryHistory = [
    {
      id: "inj-1",
      type: "acute",
      severity: "moderate",
      bodyPart: "Knee",
      specificArea: "Left ACL",
      mechanism: "Contact during tackle",
      dateOccurred: "2024-02-15",
      dateReported: "2024-02-15",
      expectedReturn: "2024-04-15",
      status: "recovering",
      treatmentPlan: [
        {
          date: "2024-02-16",
          treatment: "MRI Scan",
          provider: "Dr. Smith",
          notes: "Confirmed partial ACL strain, no surgery required",
          progress: "good"
        },
        {
          date: "2024-02-20",
          treatment: "Physiotherapy Session 1",
          provider: "Sarah Johnson (Physio)",
          notes: "Range of motion exercises, ice therapy",
          progress: "good"
        },
        {
          date: "2024-02-25",
          treatment: "Physiotherapy Session 2",
          provider: "Sarah Johnson (Physio)",
          notes: "Strengthening exercises introduced",
          progress: "excellent"
        }
      ],
      restrictions: ["No contact training", "Modified running drills", "Pool sessions only"],
      riskFactors: ["Previous knee injury", "High training load"],
      medicalStaff: "Dr. Smith",
      recoveryProgress: 65
    },
    {
      id: "inj-2",
      type: "overuse",
      severity: "minor",
      bodyPart: "Shoulder",
      specificArea: "Right rotator cuff",
      mechanism: "Repetitive lineout throwing",
      dateOccurred: "2024-01-10",
      dateReported: "2024-01-12",
      expectedReturn: "2024-02-10",
      actualReturn: "2024-02-08",
      status: "resolved",
      treatmentPlan: [
        {
          date: "2024-01-15",
          treatment: "Initial Assessment",
          provider: "Dr. Williams",
          notes: "Minor inflammation, conservative treatment",
          progress: "fair"
        },
        {
          date: "2024-01-20",
          treatment: "Massage Therapy",
          provider: "Mike Thompson (Massage)",
          notes: "Deep tissue massage, improved mobility",
          progress: "good"
        }
      ],
      restrictions: ["Reduced throwing volume", "No overhead weights"],
      riskFactors: ["High throwing volume", "Previous shoulder issues"],
      medicalStaff: "Dr. Williams",
      recoveryProgress: 100
    }
  ];

  const currentInjuries = injuryHistory.filter(injury => injury.status === "active" || injury.status === "recovering");
  const resolvedInjuries = injuryHistory.filter(injury => injury.status === "resolved");

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor": return "bg-yellow-100 text-yellow-800";
      case "moderate": return "bg-orange-100 text-orange-800";
      case "severe": return "bg-red-100 text-red-800";
      case "critical": return "bg-red-200 text-red-900";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-800";
      case "recovering": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "chronic": return "bg-purple-100 text-purple-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-nh-navy">Injury Tracking & Medical Management</h2>
          <p className="text-slate-600">Comprehensive injury monitoring and recovery tracking</p>
        </div>
        <Button className="bg-nh-blue hover:bg-nh-navy">
          <Plus className="h-4 w-4 mr-2" />
          Log New Injury
        </Button>
      </div>

      {/* Current Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Current Injuries</p>
                <p className="text-3xl font-bold text-nh-navy">{currentInjuries.length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Days Injury Free</p>
                <p className="text-3xl font-bold text-nh-navy">12</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Recovery Progress</p>
                <p className="text-3xl font-bold text-nh-navy">65%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Clock className="h-6 w-6 text-nh-blue" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-2 rounded-lg border border-gray-200 gap-1">
          <TabsTrigger 
            value="current"
            className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
          >
            Current Injuries ({currentInjuries.length})
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
          >
            Injury History ({resolvedInjuries.length})
          </TabsTrigger>
          <TabsTrigger 
            value="prevention"
            className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
          >
            Prevention Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {currentInjuries.length > 0 ? (
            <div className="space-y-4">
              {currentInjuries.map((injury) => (
                <Card key={injury.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{injury.bodyPart} - {injury.specificArea}</CardTitle>
                        <p className="text-slate-600 text-sm mt-1">{injury.mechanism}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getSeverityColor(injury.severity)}>
                          {injury.severity}
                        </Badge>
                        <Badge className={getStatusColor(injury.status)}>
                          {injury.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-nh-navy mb-2">Recovery Progress</h4>
                          <Progress value={injury.recoveryProgress} className="mb-2" />
                          <p className="text-sm text-slate-600">{injury.recoveryProgress}% complete</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-nh-navy mb-2">Key Dates</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Occurred:</span>
                              <span>{format(new Date(injury.dateOccurred), 'PP')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Expected Return:</span>
                              <span>{injury.expectedReturn ? format(new Date(injury.expectedReturn), 'PP') : 'TBD'}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-nh-navy mb-2">Current Restrictions</h4>
                          <div className="space-y-1">
                            {injury.restrictions.map((restriction, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {restriction}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-nh-navy mb-2">Recent Treatment</h4>
                          <div className="space-y-3">
                            {injury.treatmentPlan.slice(-2).map((treatment, index) => (
                              <div key={index} className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-medium text-sm">{treatment.treatment}</p>
                                    <p className="text-xs text-slate-600">{treatment.provider}</p>
                                  </div>
                                  <Badge className={`${
                                    treatment.progress === 'excellent' ? 'bg-green-100 text-green-800' :
                                    treatment.progress === 'good' ? 'bg-blue-100 text-blue-800' :
                                    treatment.progress === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {treatment.progress}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-700">{treatment.notes}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {format(new Date(treatment.date), 'PP')}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-nh-navy mb-2">Medical Team</h4>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">{injury.medicalStaff}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingDown className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium text-nh-navy mb-2">No Current Injuries</h3>
                <p className="text-slate-600">Great job staying healthy! Keep up the good work.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {resolvedInjuries.map((injury) => (
              <Card key={injury.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-nh-navy">{injury.bodyPart} - {injury.specificArea}</h3>
                      <p className="text-sm text-slate-600">{injury.mechanism}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getSeverityColor(injury.severity)}>
                        {injury.severity}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        Resolved
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Occurred</p>
                      <p className="font-medium">{format(new Date(injury.dateOccurred), 'PP')}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Resolved</p>
                      <p className="font-medium">{injury.actualReturn ? format(new Date(injury.actualReturn), 'PP') : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Duration</p>
                      <p className="font-medium">29 days</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Medical Staff</p>
                      <p className="font-medium">{injury.medicalStaff}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prevention" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-nh-blue" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-2">High Risk Areas</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Knee - Previous ACL injury</li>
                      <li>• Shoulder - Repetitive stress from lineouts</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Preventive Measures</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Daily knee stability exercises</li>
                      <li>• Shoulder strengthening program</li>
                      <li>• Proper warm-up protocols</li>
                      <li>• Load management</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wellness Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Sleep Quality</span>
                    <Badge className="bg-green-100 text-green-800">Good</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Training Load</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Recovery Score</span>
                    <Badge className="bg-green-100 text-green-800">8.5/10</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium">Stress Level</span>
                    <Badge className="bg-blue-100 text-blue-800">Low</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}