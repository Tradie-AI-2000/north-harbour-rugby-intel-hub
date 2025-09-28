import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Filter,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Bell
} from "lucide-react";
import NavigationHeader from "@/components/navigation-header";

interface Player {
  id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  rugbyProfile?: {
    jerseyNumber?: number;
    primaryPosition?: string;
  };
  physicalAttributes?: Array<{
    weight?: number;
    height?: number;
  }>;
  status?: {
    fitness?: string;
    medical?: string;
  };
}

export default function PlayersOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: playersResponse = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const players = Array.isArray(playersResponse) ? playersResponse : [];

  // Filter players based on search and status
  const filteredPlayers = players.filter(player => {
    const fullName = `${player.personalDetails.firstName} ${player.personalDetails.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         (player.rugbyProfile?.primaryPosition || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (player.rugbyProfile?.jerseyNumber || '').toString().includes(searchTerm);
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "available") return matchesSearch && (player.status?.fitness === "available");
    if (statusFilter === "injured") return matchesSearch && (player.status?.fitness === "injured");
    if (statusFilter === "recovering") return matchesSearch && (player.status?.fitness === "recovering");
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 border-green-200";
      case "injured": return "bg-red-100 text-red-800 border-red-200";
      case "recovering": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return <CheckCircle className="w-4 h-4" />;
      case "injured": return <AlertTriangle className="w-4 h-4" />;
      case "recovering": return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nh-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        title="Player Management"
        breadcrumbs={[
          { label: "Main", href: "/" },
          { label: "Players" }
        ]}
        badges={[
          { text: `${players.length} Players`, className: "bg-white text-nh-red" },
          { text: "Active Squad", className: "bg-nh-red-700 text-white" }
        ]}
        backUrl="/"
        backLabel="Back to Main"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search players by name, position, or jersey number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                  className={statusFilter === "all" ? "bg-nh-red hover:bg-nh-red-600" : ""}
                >
                  All ({players.length})
                </Button>
                <Button
                  variant={statusFilter === "available" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("available")}
                  className={statusFilter === "available" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Available ({players.filter(p => p.status?.fitness === "available").length})
                </Button>
                <Button
                  variant={statusFilter === "injured" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("injured")}
                  className={statusFilter === "injured" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  Injured ({players.filter(p => p.status?.fitness === "injured").length})
                </Button>
                <Button
                  variant={statusFilter === "recovering" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("recovering")}
                  className={statusFilter === "recovering" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                >
                  Recovering ({players.filter(p => p.status?.fitness === "recovering").length})
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No players found</h3>
            <p className="text-gray-500">
              {searchTerm ? `No players match "${searchTerm}"` : "No players match the selected filter"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlayers.map((player) => {
              const latestPhysical = player.physicalAttributes?.[player.physicalAttributes.length - 1];
              
              return (
                <Link key={player.id} href={`/player/${player.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-2 hover:border-nh-red">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage 
                              src={`/api/players/${player.id}/avatar`} 
                              alt={`${player.personalDetails.firstName} ${player.personalDetails.lastName}`} 
                            />
                            <AvatarFallback className="bg-nh-red text-white font-semibold">
                              {player.personalDetails.firstName[0]}{player.personalDetails.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg leading-tight">
                              {player.personalDetails.firstName} {player.personalDetails.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">#{player.rugbyProfile?.jerseyNumber || 'TBD'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {player.rugbyProfile?.primaryPosition || 'Position TBD'}
                        </Badge>
                        <Badge className={`text-xs flex items-center gap-1 ${getStatusColor(player.status?.fitness || 'unknown')}`}>
                          {getStatusIcon(player.status?.fitness || 'unknown')}
                          {player.status?.fitness || 'Unknown'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Height</p>
                          <p className="font-medium">{latestPhysical?.height || 'N/A'} cm</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Weight</p>
                          <p className="font-medium">{latestPhysical?.weight || 'N/A'} kg</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button 
                          className="w-full bg-nh-red hover:bg-nh-red-600 text-white"
                          size="sm"
                        >
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}