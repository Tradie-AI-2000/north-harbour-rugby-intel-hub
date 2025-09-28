import { useState } from "react";
import { useHashNavigation } from "@/hooks/useHashNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Users, Activity, FileText, Camera } from "lucide-react";
import nhLogo from "@assets/menulogo_wo.png";

export default function DataManagement() {
  const validTabs = ["players", "performance", "medical", "video", "bulk"];
  const { activeTab, handleTabChange } = useHashNavigation(validTabs, "players");

  return (
    <div className="min-h-screen bg-background">
      {/* North Harbour Rugby Header */}
      <div className="bg-nh-red text-white px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <img 
            src={nhLogo} 
            alt="North Harbour Rugby"
            className="h-16 w-auto"
          />
          <div>
            <h1 className="text-3xl font-bold">Data Management Center</h1>
            <p className="text-lg opacity-90">Player Information & Performance Data Entry</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg border border-gray-200 gap-1 h-12">
            <TabsTrigger 
              value="players" 
              className="flex items-center gap-2 rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm justify-center h-full"
            >
              <Users className="h-4 w-4" />
              Players
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="flex items-center gap-2 rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm justify-center h-full"
            >
              <Activity className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="medical" 
              className="flex items-center gap-2 rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm justify-center h-full"
            >
              <FileText className="h-4 w-4" />
              Medical
            </TabsTrigger>
            <TabsTrigger 
              value="video" 
              className="flex items-center gap-2 rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm justify-center h-full"
            >
              <Camera className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className="flex items-center gap-2 rounded-md font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg border-0 text-sm justify-center h-full"
            >
              <Upload className="h-4 w-4" />
              Bulk Import
            </TabsTrigger>
          </TabsList>

          {/* Player Information Entry */}
          <TabsContent value="players" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Player
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="James" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Mitchell" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input id="dateOfBirth" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="player@northharbour.rugby" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+64 21 555 0123" />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" placeholder="123 Rugby Lane, Auckland" />
                    </div>
                  </div>

                  {/* Rugby Profile */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Rugby Profile</h3>
                    <div>
                      <Label htmlFor="primaryPosition">Primary Position</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="loosehead-prop">Loosehead Prop</SelectItem>
                          <SelectItem value="hooker">Hooker</SelectItem>
                          <SelectItem value="tighthead-prop">Tighthead Prop</SelectItem>
                          <SelectItem value="lock">Lock</SelectItem>
                          <SelectItem value="blindside-flanker">Blindside Flanker</SelectItem>
                          <SelectItem value="openside-flanker">Openside Flanker</SelectItem>
                          <SelectItem value="number-8">Number 8</SelectItem>
                          <SelectItem value="scrum-half">Scrum Half</SelectItem>
                          <SelectItem value="fly-half">Fly Half</SelectItem>
                          <SelectItem value="wing">Wing</SelectItem>
                          <SelectItem value="centre">Centre</SelectItem>
                          <SelectItem value="fullback">Fullback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="jerseyNumber">Jersey Number</Label>
                        <Input id="jerseyNumber" type="number" placeholder="2" />
                      </div>
                      <div>
                        <Label htmlFor="playingLevel">Playing Level</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="semi-professional">Semi-Professional</SelectItem>
                            <SelectItem value="amateur">Amateur</SelectItem>
                            <SelectItem value="development">Development</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input id="height" type="number" placeholder="185" />
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input id="weight" type="number" placeholder="105" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="experience">Experience</Label>
                      <Input id="experience" placeholder="8 years" />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="emergencyName">Name</Label>
                      <Input id="emergencyName" placeholder="Sarah Mitchell" />
                    </div>
                    <div>
                      <Label htmlFor="emergencyRelationship">Relationship</Label>
                      <Input id="emergencyRelationship" placeholder="Wife" />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Phone</Label>
                      <Input id="emergencyPhone" placeholder="+64 21 555 0124" />
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-nh-red hover:bg-nh-red/90">
                  Add Player to System
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Data Entry */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training Session Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sessionDate">Session Date</Label>
                    <Input id="sessionDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="sessionType">Session Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skills">Skills Training</SelectItem>
                        <SelectItem value="fitness">Fitness/Conditioning</SelectItem>
                        <SelectItem value="team">Team Training</SelectItem>
                        <SelectItem value="match">Match</SelectItem>
                        <SelectItem value="recovery">Recovery Session</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input id="duration" type="number" placeholder="90" />
                  </div>
                  <div>
                    <Label htmlFor="intensity">Intensity (1-10)</Label>
                    <Input id="intensity" type="number" min="1" max="10" placeholder="7" />
                  </div>
                  <div>
                    <Label htmlFor="notes">Session Notes</Label>
                    <Textarea id="notes" placeholder="Player performed well in lineout practice..." />
                  </div>
                  <Button className="w-full">Record Session</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="distanceCovered">Distance (km)</Label>
                      <Input id="distanceCovered" type="number" step="0.1" placeholder="5.2" />
                    </div>
                    <div>
                      <Label htmlFor="maxSpeed">Max Speed (km/h)</Label>
                      <Input id="maxSpeed" type="number" step="0.1" placeholder="28.5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="avgHeartRate">Avg Heart Rate</Label>
                      <Input id="avgHeartRate" type="number" placeholder="165" />
                    </div>
                    <div>
                      <Label htmlFor="maxHeartRate">Max Heart Rate</Label>
                      <Input id="maxHeartRate" type="number" placeholder="185" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="skillsRating">Skills Rating (1-10)</Label>
                    <Input id="skillsRating" type="number" min="1" max="10" placeholder="8" />
                  </div>
                  <div>
                    <Label htmlFor="performanceNotes">Performance Notes</Label>
                    <Textarea id="performanceNotes" placeholder="Excellent lineout throwing accuracy..." />
                  </div>
                  <Button className="w-full">Save Metrics</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Medical Data Entry */}
          <TabsContent value="medical" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Injury Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="injuryDate">Injury Date</Label>
                    <Input id="injuryDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="injuryType">Injury Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select injury type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="muscle-strain">Muscle Strain</SelectItem>
                        <SelectItem value="ligament">Ligament Injury</SelectItem>
                        <SelectItem value="fracture">Fracture</SelectItem>
                        <SelectItem value="concussion">Concussion</SelectItem>
                        <SelectItem value="bruising">Bruising</SelectItem>
                        <SelectItem value="cut">Cut/Laceration</SelectItem>
                        <SelectItem value="joint">Joint Injury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bodyPart">Body Part</Label>
                    <Input id="bodyPart" placeholder="Right shoulder" />
                  </div>
                  <div>
                    <Label htmlFor="severity">Severity (1-10)</Label>
                    <Input id="severity" type="number" min="1" max="10" placeholder="6" />
                  </div>
                  <div>
                    <Label htmlFor="cause">Cause/Mechanism</Label>
                    <Textarea id="cause" placeholder="Contact during ruck..." />
                  </div>
                  <Button className="w-full">Report Injury</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Treatment Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="treatmentType">Treatment Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select treatment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physiotherapy">Physiotherapy</SelectItem>
                        <SelectItem value="massage">Sports Massage</SelectItem>
                        <SelectItem value="ice-therapy">Ice Therapy</SelectItem>
                        <SelectItem value="rest">Rest</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="surgery">Surgery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimatedRecovery">Estimated Recovery (days)</Label>
                    <Input id="estimatedRecovery" type="number" placeholder="14" />
                  </div>
                  <div>
                    <Label htmlFor="treatmentNotes">Treatment Notes</Label>
                    <Textarea id="treatmentNotes" placeholder="Daily physiotherapy sessions..." />
                  </div>
                  <div>
                    <Label htmlFor="followUpDate">Follow-up Date</Label>
                    <Input id="followUpDate" type="date" />
                  </div>
                  <Button className="w-full">Create Treatment Plan</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Video Upload */}
          <TabsContent value="video" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Upload & Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium">Upload Match or Training Video</p>
                  <p className="text-gray-500 mb-4">Drag and drop your video files here, or click to browse</p>
                  <Button>Choose Files</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="videoType">Video Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select video type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="match">Match Footage</SelectItem>
                        <SelectItem value="training">Training Session</SelectItem>
                        <SelectItem value="skills">Skills Practice</SelectItem>
                        <SelectItem value="analysis">Technical Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="videoDate">Date Recorded</Label>
                    <Input id="videoDate" type="date" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="videoDescription">Description</Label>
                  <Textarea id="videoDescription" placeholder="Match against Auckland Blues - focus on lineout performance..." />
                </div>
                
                <Button className="w-full">Upload & Process Video</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Import */}
          <TabsContent value="bulk" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Excel/CSV Import</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="font-medium">Upload Player Data</p>
                    <p className="text-sm text-gray-500">Excel (.xlsx) or CSV files</p>
                    <Button className="mt-2" size="sm">Browse Files</Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Supported columns:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>First Name, Last Name, Email</li>
                      <li>Position, Jersey Number, Height, Weight</li>
                      <li>Date of Birth, Phone, Address</li>
                      <li>Emergency Contact Details</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>GPS Device Integration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Badge variant="outline" className="w-full justify-center py-2">
                      Catapult Sports Integration
                    </Badge>
                    <Badge variant="outline" className="w-full justify-center py-2">
                      STATSports GPS Integration
                    </Badge>
                    <Badge variant="outline" className="w-full justify-center py-2">
                      Polar Heart Rate Monitors
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Connect your existing GPS and monitoring devices to automatically import performance data.
                  </p>
                  <Button className="w-full">Configure Device Integration</Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Data Import Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Player Template
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Activity className="h-6 w-6 mb-2" />
                    Performance Template
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    Medical Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}