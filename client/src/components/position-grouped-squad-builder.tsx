import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Plus, 
  UserPlus, 
  Save, 
  Trash2, 
  Brain,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Trophy
} from "lucide-react";

interface Player {
  id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    position: string;
    jerseyNumber?: number;
    dateOfBirth?: string;
    profileImage?: string;
  };
  currentStatus: string;
  gameStats?: Array<{
    season: string;
    penalties?: number;
    turnovers?: number;
    tackles?: number;
    tries?: number;
    matchesPlayed?: number;
  }>;
  skills?: {
    ballHandling?: number;
    passing?: number;
    defense?: number;
    communication?: number;
  };
}

interface Squad {
  id: number;
  name: string;
  matchName: string;
  opponent: string;
  matchDate: string;
  createdAt: string;
  players: Player[];
}

interface SquadAdvice {
  id: number;
  squadId: number;
  adviceType: string;
  category: string;
  message: string;
  priority: number;
}

// Position groupings as requested
const POSITION_GROUPS = {
  'Front Rowers': ['Loosehead Prop', 'Hooker', 'Tighthead Prop'],
  'Locks': ['Lock'],
  'Back Rowers': ['Blindside Flanker', 'Openside Flanker', 'Number 8'],
  'Halves': ['Scrum Half', 'Fly Half'],
  'Centres': ['Inside Centre', 'Outside Centre'],
  'Outside Backs': ['Left Wing', 'Right Wing', 'Fullback']
};

export default function PositionGroupedSquadBuilder() {
  const [isCreatingSquad, setIsCreatingSquad] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const [newSquadData, setNewSquadData] = useState({
    name: '',
    matchName: '',
    opponent: '',
    matchDate: ''
  });
  const [activePositionGroup, setActivePositionGroup] = useState('Front Rowers');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch players grouped by position
  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ['/api/players'],
  });

  // Fetch existing squads
  const { data: squads = [], isLoading: squadsLoading } = useQuery({
    queryKey: ['/api/squads'],
  });

  // Fetch squad advice for selected squad
  const { data: squadAdvice = [] } = useQuery({
    queryKey: ['/api/squads', selectedSquad?.id, 'advice'],
    enabled: !!selectedSquad?.id,
  });

  // Create squad mutation
  const createSquadMutation = useMutation({
    mutationFn: async (squadData: typeof newSquadData) => {
      const response = await apiRequest('POST', '/api/squads', squadData);
      return await response.json();
    },
    onSuccess: (newSquad: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/squads'] });
      setSelectedSquad(newSquad);
      setIsCreatingSquad(false);
      setNewSquadData({ name: '', matchName: '', opponent: '', matchDate: '' });
      toast({
        title: "Squad Created",
        description: `${newSquad.name} has been created successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create squad. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add player to squad mutation
  const addPlayerMutation = useMutation({
    mutationFn: async ({ squadId, playerId }: { squadId: number; playerId: string }) => {
      const response = await apiRequest('POST', `/api/squads/${squadId}/players`, { playerId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/squads'] });
      toast({
        title: "Player Added",
        description: "Player has been added to the squad.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add player to squad.",
        variant: "destructive",
      });
    },
  });

  // Remove player from squad mutation
  const removePlayerMutation = useMutation({
    mutationFn: async ({ squadId, playerId }: { squadId: number; playerId: string }) => {
      const response = await apiRequest('DELETE', `/api/squads/${squadId}/players/${playerId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/squads'] });
      toast({
        title: "Player Removed",
        description: "Player has been removed from the squad.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove player from squad.",
        variant: "destructive",
      });
    },
  });

  // Generate AI advice mutation
  const generateAdviceMutation = useMutation({
    mutationFn: async (squadId: number) => {
      const response = await apiRequest('POST', `/api/squads/${squadId}/advice`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/squads', selectedSquad?.id, 'advice'] });
      toast({
        title: "AI Analysis Complete",
        description: "Squad advice has been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate squad advice.",
        variant: "destructive",
      });
    },
  });

  // Group players by position categories
  const groupedPlayers = Object.entries(POSITION_GROUPS).reduce((acc, [groupName, positions]) => {
    acc[groupName] = (players as Player[]).filter((player: Player) => 
      positions.includes(player.personalDetails.position)
    );
    return acc;
  }, {} as Record<string, Player[]>);

  // Get players in selected squad
  const squadPlayerIds = selectedSquad?.players?.map(p => p.id) || [];

  const handleCreateSquad = () => {
    if (!newSquadData.name || !newSquadData.opponent) {
      toast({
        title: "Validation Error",
        description: "Please fill in squad name and opponent.",
        variant: "destructive",
      });
      return;
    }
    createSquadMutation.mutate(newSquadData);
  };

  const handleAddPlayer = (playerId: string) => {
    if (!selectedSquad) {
      toast({
        title: "No Squad Selected",
        description: "Please select a squad first.",
        variant: "destructive",
      });
      return;
    }
    addPlayerMutation.mutate({ squadId: selectedSquad.id, playerId });
  };

  const handleRemovePlayer = (playerId: string) => {
    if (!selectedSquad) return;
    removePlayerMutation.mutate({ squadId: selectedSquad.id, playerId });
  };

  // FIXED: Firebase status format compatibility
  const getAvailabilityColor = (status: string) => {
    console.log("🔍 POSITION SQUAD BUILDER: getAvailabilityColor() checking status:", status);
    const statusLower = status.toLowerCase();
    
    // Firebase format: "available - full training", "unavailable - injured/recovery", "modified training - limited contact"
    if (statusLower.includes('available') && !statusLower.includes('unavailable')) {
      return 'bg-green-100 text-green-800 border-green-200'; // GREEN for Available
    }
    if (statusLower.includes('modified')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // YELLOW for Modified
    }
    if (statusLower.includes('unavailable') || statusLower.includes('injured')) {
      return 'bg-red-100 text-red-800 border-red-200'; // RED for Unavailable/Injured
    }
    if (statusLower.includes('suspended')) {
      return 'bg-orange-100 text-orange-800 border-orange-200'; // ORANGE for Suspended
    }
    
    console.log("⚠️ POSITION SQUAD BUILDER: Status not recognized, defaulting to gray");
    return 'bg-gray-100 text-gray-800 border-gray-200'; // Default gray
  };

  const getAvailabilityIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fit': return <CheckCircle size={14} />;
      case 'available': return <CheckCircle size={14} />;
      case 'injured': return <AlertCircle size={14} />;
      case 'suspended': return <Clock size={14} />;
      default: return <Shield size={14} />;
    }
  };

  if (playersLoading || squadsLoading) {
    return <div className="flex items-center justify-center p-8">Loading squad builder...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Squad Selection Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users size={24} />
                <span>Squad Builder</span>
              </CardTitle>
              <CardDescription>
                Build match squads by selecting players from position groups
              </CardDescription>
            </div>
            <Dialog open={isCreatingSquad} onOpenChange={setIsCreatingSquad}>
              <DialogTrigger asChild>
                <Button className="bg-nh-red hover:bg-nh-red-600">
                  <Plus size={16} className="mr-2" />
                  New Squad
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Squad</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="squadName">Squad Name</Label>
                    <Input
                      id="squadName"
                      value={newSquadData.name}
                      onChange={(e) => setNewSquadData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., FIRST XV vs Auckland"
                    />
                  </div>
                  <div>
                    <Label htmlFor="matchName">Match Name</Label>
                    <Input
                      id="matchName"
                      value={newSquadData.matchName}
                      onChange={(e) => setNewSquadData(prev => ({ ...prev, matchName: e.target.value }))}
                      placeholder="e.g., NPC Round 5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="opponent">Opponent</Label>
                    <Input
                      id="opponent"
                      value={newSquadData.opponent}
                      onChange={(e) => setNewSquadData(prev => ({ ...prev, opponent: e.target.value }))}
                      placeholder="e.g., Auckland"
                    />
                  </div>
                  <div>
                    <Label htmlFor="matchDate">Match Date</Label>
                    <Input
                      id="matchDate"
                      type="date"
                      value={newSquadData.matchDate}
                      onChange={(e) => setNewSquadData(prev => ({ ...prev, matchDate: e.target.value }))}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateSquad} 
                    className="w-full"
                    disabled={createSquadMutation.isPending}
                  >
                    {createSquadMutation.isPending ? "Creating..." : "Create Squad"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Squad Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {(squads as Squad[]).map((squad: Squad) => (
              <Card 
                key={squad.id} 
                className={`cursor-pointer transition-all ${
                  selectedSquad?.id === squad.id 
                    ? 'ring-2 ring-nh-red bg-red-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedSquad(squad)}
              >
                <CardContent className="p-4">
                  <div className="font-semibold">{squad.name}</div>
                  <div className="text-sm text-gray-600">vs {squad.opponent}</div>
                  <div className="text-sm text-gray-500">{squad.matchDate}</div>
                  <Badge variant="secondary" className="mt-2">
                    {squad.players?.length || 0} players
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedSquad && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="font-semibold text-blue-900">
                  Selected: {selectedSquad.name}
                </div>
                <div className="text-sm text-blue-700">
                  {selectedSquad.players?.length || 0} players selected
                </div>
              </div>
              <Button
                onClick={() => generateAdviceMutation.mutate(selectedSquad.id)}
                disabled={generateAdviceMutation.isPending}
                variant="outline"
                size="sm"
              >
                <Brain size={16} className="mr-2" />
                {generateAdviceMutation.isPending ? "Analyzing..." : "Get AI Advice"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Position Groups */}
      {selectedSquad && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Position Group Tabs */}
          <div className="lg:col-span-3">
            <Tabs value={activePositionGroup} onValueChange={setActivePositionGroup}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
                {Object.keys(POSITION_GROUPS).map((group) => (
                  <TabsTrigger 
                    key={group} 
                    value={group}
                    className="text-xs p-2"
                  >
                    {group}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(POSITION_GROUPS).map(([groupName, positions]) => (
                <TabsContent key={groupName} value={groupName} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{groupName}</CardTitle>
                      <CardDescription>
                        Positions: {positions.join(', ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupedPlayers[groupName]?.map((player: Player) => {
                          const isSelected = squadPlayerIds.includes(player.id);
                          return (
                            <Card 
                              key={player.id}
                              className={`transition-all ${
                                isSelected 
                                  ? 'ring-2 ring-green-500 bg-green-50' 
                                  : 'hover:shadow-md'
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <div className="font-semibold">
                                      {player.personalDetails.firstName} {player.personalDetails.lastName}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {player.personalDetails.position}
                                    </div>
                                    {player.personalDetails.jerseyNumber && (
                                      <Badge variant="outline" className="mt-1">
                                        #{player.personalDetails.jerseyNumber}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-right text-sm text-gray-500">
                                    <div>
                                      {player.gameStats?.[0]?.matchesPlayed || 0} matches
                                    </div>
                                    <div>
                                      {player.gameStats?.[0]?.tries || 0} tries
                                    </div>
                                    <div>
                                      {player.gameStats?.[0]?.tackles || 0} tackles
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <Badge 
                                    className={`text-xs ${getAvailabilityColor(player.currentStatus)}`}
                                  >
                                    {getAvailabilityIcon(player.currentStatus)}
                                    <span className="ml-1">{player.currentStatus}</span>
                                  </Badge>

                                  {isSelected ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRemovePlayer(player.id)}
                                      disabled={removePlayerMutation.isPending}
                                    >
                                      <Trash2 size={14} className="mr-1" />
                                      Remove
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddPlayer(player.id)}
                                      disabled={
                                        addPlayerMutation.isPending || 
                                        player.currentStatus.toLowerCase() === 'injured'
                                      }
                                    >
                                      <UserPlus size={14} className="mr-1" />
                                      Add
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Squad Summary & AI Advice */}
          <div className="space-y-4">
            {/* Current Squad Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy size={20} />
                  Current Squad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    {selectedSquad.players?.length || 0} / 23 players selected
                  </div>
                  {Object.entries(POSITION_GROUPS).map(([groupName, positions]) => {
                    const groupPlayers = selectedSquad.players?.filter((p: Player) => 
                      positions.includes(p.personalDetails.position)
                    ) || [];
                    return (
                      <div key={groupName} className="flex justify-between text-sm">
                        <span>{groupName}:</span>
                        <span className="font-medium">{groupPlayers.length}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* AI Squad Advice */}
            {(squadAdvice as SquadAdvice[]).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain size={20} />
                    AI Advice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {(squadAdvice as SquadAdvice[]).map((advice: SquadAdvice) => (
                        <div 
                          key={advice.id}
                          className={`p-3 rounded-lg text-sm ${
                            advice.priority >= 4 
                              ? 'bg-red-50 border-l-4 border-red-500' 
                              : advice.priority >= 3 
                              ? 'bg-yellow-50 border-l-4 border-yellow-500'
                              : 'bg-blue-50 border-l-4 border-blue-500'
                          }`}
                        >
                          <div className="font-medium mb-1">
                            {advice.adviceType ? advice.adviceType.replace('_', ' ').toUpperCase() : 'SQUAD ADVICE'}
                          </div>
                          <div>{advice.message}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}