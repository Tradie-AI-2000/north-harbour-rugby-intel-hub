import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/navigation-header";
import { 
  Users, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Target,
  Brain,
  Eye,
  Calendar,
  Save,
  Edit,
  UserPlus,
  Shield,
  Activity,
  TrendingUp,
  Award
} from "lucide-react";

interface Player {
  id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    position: string;
    jerseyNumber: number;
  };
  currentStatus: string;
  gameStats: Array<{
    season: string;
    penalties: number;
    turnovers: number;
    tackles: number;
    tries: number;
    matchesPlayed: number;
  }>;
  skills: {
    ballHandling: number;
    passing: number;
    defense: number;
    communication: number;
  };
}

interface Squad {
  id: number;
  name: string;
  matchName?: string;
  matchDate?: string;
  notes?: string;
  createdAt: string;
  selections?: SquadSelection[];
  advice?: SquadAdvice[];
}

interface SquadSelection {
  id: number;
  playerId: string;
  position: string;
  isStarter: boolean;
  selectionReason?: string;
}

interface SquadAdvice {
  id: number;
  adviceType: string;
  category: string;
  message: string;
  priority: number;
  playerId?: string;
}

const rugbyPositions = [
  "Prop", "Hooker", "Lock", "Flanker", "Number 8", 
  "Scrum-half", "Fly-half", "Centre", "Wing", "Fullback"
];

export default function SquadBuilder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [selectedSquadId, setSelectedSquadId] = useState<number | null>(null);
  const [showCreateSquad, setShowCreateSquad] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  
  // Form states
  const [squadForm, setSquadForm] = useState({
    name: "",
    matchName: "",
    matchDate: "",
    notes: ""
  });
  
  const [playerForm, setPlayerForm] = useState({
    firstName: "",
    lastName: "",
    position: "",
    jerseyNumber: "",
    status: "Fit"
  });

  // Queries
  const { data: squads = [], isLoading: squadsLoading } = useQuery({
    queryKey: ['/api/squads'],
  });

  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ['/api/players'],
  });

  const { data: selectedSquad, isLoading: squadLoading } = useQuery({
    queryKey: ['/api/squads', selectedSquadId],
    enabled: !!selectedSquadId,
  });

  // Mutations
  const createSquadMutation = useMutation({
    mutationFn: async (squadData: any) => {
      const response = await fetch('/api/squads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(squadData),
      });
      if (!response.ok) throw new Error('Failed to create squad');
      return response.json();
    },
    onSuccess: (newSquad) => {
      queryClient.invalidateQueries({ queryKey: ['/api/squads'] });
      setSelectedSquadId(newSquad.id);
      setShowCreateSquad(false);
      setSquadForm({ name: "", matchName: "", matchDate: "", notes: "" });
      toast({ title: "Success", description: "Squad created successfully!" });
    },
  });

  const addPlayerToSquadMutation = useMutation({
    mutationFn: async ({ squadId, playerId, position }: { squadId: number; playerId: string; position: string }) => {
      const response = await fetch(`/api/squads/${squadId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, position, isStarter: true }),
      });
      if (!response.ok) throw new Error('Failed to add player to squad');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/squads', selectedSquadId] });
      toast({ title: "Success", description: "Player added to squad!" });
    },
  });

  const removePlayerFromSquadMutation = useMutation({
    mutationFn: async ({ squadId, playerId }: { squadId: number; playerId: string }) => {
      const response = await fetch(`/api/squads/${squadId}/players/${playerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove player from squad');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/squads', selectedSquadId] });
      toast({ title: "Success", description: "Player removed from squad!" });
    },
  });

  const createPlayerMutation = useMutation({
    mutationFn: async (playerData: any) => {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalDetails: {
            firstName: playerData.firstName,
            lastName: playerData.lastName,
            position: playerData.position,
            jerseyNumber: parseInt(playerData.jerseyNumber),
            dateOfBirth: "1995-01-01",
            height: 180,
            weight: 85
          },
          currentStatus: playerData.status,
          gameStats: [],
          physicalAttributes: [],
          skills: {
            ballHandling: 5,
            passing: 5,
            kicking: 5,
            lineoutThrowing: 5,
            scrummaging: 5,
            rucking: 5,
            defense: 5,
            communication: 5
          }
        }),
      });
      if (!response.ok) throw new Error('Failed to create player');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      setShowAddPlayer(false);
      setPlayerForm({ firstName: "", lastName: "", position: "", jerseyNumber: "", status: "Fit" });
      toast({ title: "Success", description: "Player created successfully!" });
    },
  });

  // Helper functions
  const getPlayerById = (id: string) => players.find((p: Player) => p.id === id);
  
  // FIXED: Firebase status format compatibility
  const getStatusColor = (status: string) => {
    console.log("🔍 SQUAD BUILDER: getStatusColor() checking status:", status);
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
    
    console.log("⚠️ SQUAD BUILDER: Status not recognized, defaulting to gray");
    return 'bg-gray-100 text-gray-800 border-gray-200'; // Default gray
  };

  const getAdviceIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'suggestion': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSquadStats = () => {
    if (!selectedSquad?.selections) return null;
    
    const totalPlayers = selectedSquad.selections.length;
    const positions = selectedSquad.selections.reduce((acc, sel) => {
      acc[sel.position] = (acc[sel.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const selectedPlayerData = selectedSquad.selections.map(sel => getPlayerById(sel.playerId)).filter(Boolean);
    const totalPenalties = selectedPlayerData.reduce((sum, player) => {
      const recentStats = player?.gameStats[player.gameStats.length - 1];
      return sum + (recentStats?.penalties || 0);
    }, 0);

    const totalTurnovers = selectedPlayerData.reduce((sum, player) => {
      const recentStats = player?.gameStats[player.gameStats.length - 1];
      return sum + (recentStats?.turnovers || 0);
    }, 0);

    return { totalPlayers, positions, totalPenalties, totalTurnovers };
  };

  const squadStats = getSquadStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <img src={nhLogo} alt="North Harbour Rugby" className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Squad Builder</h1>
              <p className="text-sm text-gray-600">Build and manage match squads with intelligent selection assistance</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowCreateSquad(true)}
              className="bg-nh-red hover:bg-nh-red/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Squad
            </Button>
            <Button 
              onClick={() => setShowAddPlayer(true)}
              variant="outline"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Squad List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Squads</h2>
            
            {squadsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : squads.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No squads created yet</p>
                <Button 
                  onClick={() => setShowCreateSquad(true)}
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  Create your first squad
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {squads.map((squad: Squad) => (
                  <Card 
                    key={squad.id}
                    className={`cursor-pointer transition-all ${
                      selectedSquadId === squad.id ? 'ring-2 ring-nh-red bg-red-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedSquadId(squad.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 truncate">{squad.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {squad.selections?.length || 0}
                        </Badge>
                      </div>
                      {squad.matchName && (
                        <p className="text-sm text-gray-600 truncate mb-1">{squad.matchName}</p>
                      )}
                      {squad.matchDate && (
                        <p className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {squad.matchDate}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedSquadId ? (
            <div className="p-6">
              {squadLoading ? (
                <div className="space-y-6">
                  <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="squad" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="squad">Squad Overview</TabsTrigger>
                    <TabsTrigger value="players">Available Players</TabsTrigger>
                    <TabsTrigger value="advice">Selection Advice</TabsTrigger>
                    <TabsTrigger value="analysis">Squad Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="squad" className="space-y-6">
                    {/* Squad Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedSquad?.name}</h2>
                        {selectedSquad?.matchName && (
                          <p className="text-gray-600">{selectedSquad.matchName}</p>
                        )}
                        {selectedSquad?.matchDate && (
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {selectedSquad.matchDate}
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Squad
                      </Button>
                    </div>

                    {/* Squad Stats */}
                    {squadStats && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Users className="h-8 w-8 text-nh-red mx-auto mb-2" />
                            <div className="text-2xl font-bold">{squadStats.totalPlayers}</div>
                            <div className="text-sm text-gray-600">Total Players</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Shield className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{squadStats.totalPenalties}</div>
                            <div className="text-sm text-gray-600">Total Penalties</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{squadStats.totalTurnovers}</div>
                            <div className="text-sm text-gray-600">Total Turnovers</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold">
                              {Object.keys(squadStats.positions).length}
                            </div>
                            <div className="text-sm text-gray-600">Positions Covered</div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Selected Players */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Selected Players</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedSquad?.selections?.length === 0 ? (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No players selected yet</p>
                            <p className="text-sm text-gray-400 mb-4">Start building your squad by adding players</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedSquad?.selections?.map((selection) => {
                              const player = getPlayerById(selection.playerId);
                              if (!player) return null;
                              
                              return (
                                <Card key={selection.id} className="relative">
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <h4 className="font-medium">
                                          {player.personalDetails.firstName} {player.personalDetails.lastName}
                                        </h4>
                                        <p className="text-sm text-gray-600">{selection.position}</p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removePlayerFromSquadMutation.mutate({
                                          squadId: selectedSquadId!,
                                          playerId: selection.playerId
                                        })}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <Badge className={getStatusColor(player.currentStatus)}>
                                        {player.currentStatus}
                                      </Badge>
                                      <div className="text-xs text-gray-500">
                                        #{player.personalDetails.jerseyNumber}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="players" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Available Players</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {playersLoading ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {players.map((player: Player) => {
                              const isSelected = selectedSquad?.selections?.some(s => s.playerId === player.id);
                              const recentStats = player.gameStats[player.gameStats.length - 1];
                              
                              return (
                                <Card key={player.id} className={`relative ${isSelected ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                      <div>
                                        <h4 className="font-medium">
                                          {player.personalDetails.firstName} {player.personalDetails.lastName}
                                        </h4>
                                        <p className="text-sm text-gray-600">{player.personalDetails.position}</p>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        #{player.personalDetails.jerseyNumber}
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2 mb-3">
                                      <Badge className={getStatusColor(player.currentStatus)}>
                                        {player.currentStatus}
                                      </Badge>
                                      
                                      {recentStats && (
                                        <div className="text-xs text-gray-600 space-y-1">
                                          <div>Penalties: {recentStats.penalties}</div>
                                          <div>Turnovers: {recentStats.turnovers}</div>
                                          <div>Tackles: {recentStats.tackles}</div>
                                        </div>
                                      )}
                                    </div>

                                    {!isSelected ? (
                                      <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={() => addPlayerToSquadMutation.mutate({
                                          squadId: selectedSquadId!,
                                          playerId: player.id,
                                          position: player.personalDetails.position
                                        })}
                                        disabled={addPlayerToSquadMutation.isPending}
                                      >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add to Squad
                                      </Button>
                                    ) : (
                                      <div className="flex items-center justify-center text-green-600 text-sm font-medium">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        In Squad
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="advice" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Brain className="h-5 w-5 mr-2" />
                          Selection Advice
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedSquad?.advice?.length === 0 ? (
                          <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                            <p className="text-gray-500">No issues detected</p>
                            <p className="text-sm text-gray-400">Your squad looks good!</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedSquad?.advice?.map((advice) => (
                              <div key={advice.id} className={`p-4 rounded-lg border-l-4 ${
                                advice.adviceType === 'warning' ? 'border-red-500 bg-red-50' :
                                advice.adviceType === 'suggestion' ? 'border-blue-500 bg-blue-50' :
                                'border-green-500 bg-green-50'
                              }`}>
                                <div className="flex items-start space-x-3">
                                  {getAdviceIcon(advice.adviceType)}
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{advice.message}</p>
                                    <p className="text-xs text-gray-600 mt-1 capitalize">
                                      {advice.category} • Priority {advice.priority}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Squad Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {squadStats && (
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-medium mb-3">Position Coverage</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {rugbyPositions.map(position => {
                                  const count = squadStats.positions[position] || 0;
                                  return (
                                    <div key={position} className={`p-3 rounded-lg border ${
                                      count === 0 ? 'border-red-200 bg-red-50' :
                                      count > 2 ? 'border-orange-200 bg-orange-50' :
                                      'border-green-200 bg-green-50'
                                    }`}>
                                      <div className="text-sm font-medium">{position}</div>
                                      <div className="text-xs text-gray-600">{count} selected</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Squad</h3>
                <p className="text-gray-500 mb-4">Choose a squad from the sidebar to view and edit</p>
                <Button onClick={() => setShowCreateSquad(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Squad
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Squad Dialog */}
      <Dialog open={showCreateSquad} onOpenChange={setShowCreateSquad}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Squad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="squadName">Squad Name *</Label>
              <Input
                id="squadName"
                value={squadForm.name}
                onChange={(e) => setSquadForm({...squadForm, name: e.target.value})}
                placeholder="e.g., First XV vs Auckland"
              />
            </div>
            <div>
              <Label htmlFor="matchName">Match Name</Label>
              <Input
                id="matchName"
                value={squadForm.matchName}
                onChange={(e) => setSquadForm({...squadForm, matchName: e.target.value})}
                placeholder="e.g., North Harbour vs Auckland"
              />
            </div>
            <div>
              <Label htmlFor="matchDate">Match Date</Label>
              <Input
                id="matchDate"
                type="date"
                value={squadForm.matchDate}
                onChange={(e) => setSquadForm({...squadForm, matchDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={squadForm.notes}
                onChange={(e) => setSquadForm({...squadForm, notes: e.target.value})}
                placeholder="Additional notes or objectives..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateSquad(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createSquadMutation.mutate(squadForm)}
                disabled={!squadForm.name || createSquadMutation.isPending}
              >
                Create Squad
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Player Dialog */}
      <Dialog open={showAddPlayer} onOpenChange={setShowAddPlayer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={playerForm.firstName}
                  onChange={(e) => setPlayerForm({...playerForm, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={playerForm.lastName}
                  onChange={(e) => setPlayerForm({...playerForm, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Position *</Label>
                <Select 
                  value={playerForm.position} 
                  onValueChange={(value) => setPlayerForm({...playerForm, position: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {rugbyPositions.map(pos => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="jerseyNumber">Jersey Number *</Label>
                <Input
                  id="jerseyNumber"
                  type="number"
                  value={playerForm.jerseyNumber}
                  onChange={(e) => setPlayerForm({...playerForm, jerseyNumber: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={playerForm.status} 
                onValueChange={(value) => setPlayerForm({...playerForm, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fit">Fit</SelectItem>
                  <SelectItem value="Injured">Injured</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddPlayer(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createPlayerMutation.mutate(playerForm)}
                disabled={!playerForm.firstName || !playerForm.lastName || !playerForm.position || !playerForm.jerseyNumber || createPlayerMutation.isPending}
              >
                Add Player
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}