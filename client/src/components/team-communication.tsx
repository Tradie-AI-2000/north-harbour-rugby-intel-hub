import { useState } from "react";
import { MessageSquare, Bell, Send, Users, AlertCircle, Calendar, FileText, Plus, Brain, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import AIMatchAnalysisTemplate from "./ai-match-analysis-template";
import type { Player } from "@shared/schema";

interface TeamCommunicationProps {
  playerId: string;
  player?: Player;
}

export default function TeamCommunication({ playerId, player }: TeamCommunicationProps) {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState({ title: "", content: "", priority: "medium", type: "message" });

  if (!player) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500">No communication data available</p>
      </div>
    );
  }

  // Sample communication data
  const messages = [
    {
      id: "msg-1",
      type: "announcement",
      title: "Training Schedule Update",
      content: "Tomorrow's training session has been moved to 3:00 PM due to field conditions. Please arrive 30 minutes early for warm-up.",
      priority: "high",
      sender: "Coach Williams",
      recipients: ["all"],
      attachments: [],
      readBy: [
        { playerId: "james-mitchell", readAt: "2024-01-20T14:30:00Z" }
      ],
      createdAt: "2024-01-20T12:00:00Z"
    },
    {
      id: "msg-2", 
      type: "alert",
      title: "Injury Prevention Workshop",
      content: "Mandatory workshop on injury prevention techniques this Friday at 2:00 PM. All forwards must attend.",
      priority: "urgent",
      sender: "Medical Team",
      recipients: ["james-mitchell", "player-2", "player-3"],
      attachments: [
        { name: "Workshop_Guidelines.pdf", url: "/docs/workshop.pdf", type: "pdf" }
      ],
      readBy: [],
      createdAt: "2024-01-19T16:45:00Z"
    },
    {
      id: "msg-3",
      type: "reminder",
      title: "Gear Check Reminder",
      content: "Please ensure all your gear is in good condition for Saturday's match. Report any issues to equipment manager.",
      priority: "medium",
      sender: "Equipment Manager",
      recipients: ["all"],
      attachments: [],
      readBy: [
        { playerId: "james-mitchell", readAt: "2024-01-19T09:15:00Z" }
      ],
      createdAt: "2024-01-19T08:00:00Z"
    },
    {
      id: "msg-4",
      type: "message",
      title: "Great Performance!",
      content: "Excellent lineout throwing accuracy in today's training session. Keep up the great work!",
      priority: "low",
      sender: "Coach Thompson",
      recipients: ["james-mitchell"],
      attachments: [],
      readBy: [
        { playerId: "james-mitchell", readAt: "2024-01-18T19:20:00Z" }
      ],
      createdAt: "2024-01-18T18:30:00Z"
    }
  ];

  const unreadMessages = messages.filter(msg => !msg.readBy.some(read => read.playerId === playerId));
  const importantMessages = messages.filter(msg => msg.priority === "urgent" || msg.priority === "high");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-blue-100 text-blue-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "announcement": return <Bell className="h-4 w-4" />;
      case "alert": return <AlertCircle className="h-4 w-4" />;
      case "reminder": return <Calendar className="h-4 w-4" />;
      case "message": return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const isUnread = (messageId: string) => {
    return !messages.find(msg => msg.id === messageId)?.readBy.some(read => read.playerId === playerId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-nh-navy">Team Communication</h2>
          <p className="text-slate-600">Stay connected with announcements, alerts, and team messages</p>
        </div>
        <Button className="bg-nh-blue hover:bg-nh-navy">
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Communication Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Unread Messages</p>
                <p className="text-3xl font-bold text-nh-navy">{unreadMessages.length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <Bell className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Important Messages</p>
                <p className="text-3xl font-bold text-nh-navy">{importantMessages.length}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Messages</p>
                <p className="text-3xl font-bold text-nh-navy">{messages.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <MessageSquare className="h-6 w-6 text-nh-blue" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-2 rounded-lg border border-gray-200 gap-1">
          <TabsTrigger 
            value="inbox"
            className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
          >
            Inbox ({messages.length})
          </TabsTrigger>
          <TabsTrigger 
            value="compose"
            className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
          >
            Compose
          </TabsTrigger>
          <TabsTrigger 
            value="ai-analysis"
            className="py-3 px-2 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0 text-sm"
          >
            🧠 AI Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="announcements"
            className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
          >
            Team Updates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Message List */}
            <div className="lg:col-span-1 space-y-2">
              <h3 className="font-medium text-nh-navy mb-3">Messages</h3>
              {messages.map((message) => (
                <Card 
                  key={message.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMessage === message.id ? 'ring-2 ring-nh-blue' : ''
                  } ${isUnread(message.id) ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedMessage(message.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(message.type)}
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority}
                        </Badge>
                      </div>
                      {isUnread(message.id) && (
                        <div className="w-2 h-2 bg-nh-blue rounded-full"></div>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-sm mb-1 line-clamp-1">{message.title}</h4>
                    <p className="text-xs text-slate-600 mb-2 line-clamp-2">{message.content}</p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{message.sender}</span>
                      <span>{format(new Date(message.createdAt), 'MMM d')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <Card>
                  <CardHeader>
                    {(() => {
                      const message = messages.find(m => m.id === selectedMessage);
                      if (!message) return null;
                      
                      return (
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <CardTitle className="text-lg">{message.title}</CardTitle>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={getPriorityColor(message.priority)}>
                                  {message.priority}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {message.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-slate-600 space-y-1">
                            <div className="flex items-center justify-between">
                              <span><strong>From:</strong> {message.sender}</span>
                              <span>{format(new Date(message.createdAt), 'PPP p')}</span>
                            </div>
                            <div>
                              <strong>To:</strong> {message.recipients.includes("all") ? "All Team Members" : "Selected Players"}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const message = messages.find(m => m.id === selectedMessage);
                      if (!message) return null;
                      
                      return (
                        <div className="space-y-4">
                          <div className="prose prose-sm max-w-none">
                            <p>{message.content}</p>
                          </div>
                          
                          {message.attachments && message.attachments.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2">Attachments</h4>
                              <div className="space-y-2">
                                {message.attachments.map((attachment, index) => (
                                  <div key={index} className="flex items-center p-2 bg-slate-50 rounded border">
                                    <FileText className="h-4 w-4 mr-2 text-slate-500" />
                                    <span className="text-sm font-medium">{attachment.name}</span>
                                    <Button size="sm" variant="ghost" className="ml-auto">
                                      Download
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex space-x-2 pt-4">
                            <Button className="bg-nh-blue hover:bg-nh-navy">
                              <Send className="h-4 w-4 mr-2" />
                              Reply
                            </Button>
                            <Button variant="outline">
                              Mark as Read
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium text-nh-navy mb-2">Select a Message</h3>
                    <p className="text-slate-600">Choose a message from the list to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose New Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Message Type
                    </label>
                    <Select value={newMessage.type} onValueChange={(value) => setNewMessage({...newMessage, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="message">Message</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="alert">Alert</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Priority
                    </label>
                    <Select value={newMessage.priority} onValueChange={(value) => setNewMessage({...newMessage, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Recipients
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Team Members</SelectItem>
                      <SelectItem value="forwards">Forwards</SelectItem>
                      <SelectItem value="backs">Backs</SelectItem>
                      <SelectItem value="coaches">Coaching Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject
                  </label>
                  <Input 
                    placeholder="Enter message subject"
                    value={newMessage.title}
                    onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message Content
                  </label>
                  <Textarea 
                    placeholder="Type your message here..."
                    rows={6}
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button className="bg-nh-blue hover:bg-nh-navy">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline">
                    Save Draft
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-nh-blue" />
                  Latest Team Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.filter(msg => msg.type === "announcement").map((announcement) => (
                    <div key={announcement.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-nh-navy">{announcement.title}</h4>
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{announcement.content}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>By {announcement.sender}</span>
                        <span>{format(new Date(announcement.createdAt), 'PPP')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Team Directory
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Calendar className="h-6 w-6 mb-2" />
                    Training Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-4">
          <AIMatchAnalysisTemplate 
            playerId={playerId} 
            playerName={player?.personalDetails?.firstName + " " + player?.personalDetails?.lastName || "Player"} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}