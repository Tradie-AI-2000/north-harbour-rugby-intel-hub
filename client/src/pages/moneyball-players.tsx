import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import PlayerValueScorecard from "@/components/player-value-scorecard";
import { 
  moneyBallPlayersData, 
  convertToPlayerValueMetrics, 
  type MoneyBallPlayer 
} from "@/data/moneyBallPlayers";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

export default function MoneyBallPlayers() {
  const [selectedPlayer, setSelectedPlayer] = useState<MoneyBallPlayer | null>(null);

  if (selectedPlayer) {
    const metrics = convertToPlayerValueMetrics(selectedPlayer);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedPlayer(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Players
            </Button>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage src={selectedPlayer.photoUrl} alt={selectedPlayer.name} />
                <AvatarFallback>{selectedPlayer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedPlayer.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{selectedPlayer.position}</Badge>
                  {selectedPlayer.secondaryPosition && (
                    <Badge variant="secondary">{selectedPlayer.secondaryPosition}</Badge>
                  )}
                  <Badge variant="outline">{selectedPlayer.club}</Badge>
                </div>
              </div>
            </div>
          </div>

          <PlayerValueScorecard metrics={metrics} />

          {/* Character Profile */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Character & Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Grit & Resilience</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedPlayer.gritNote}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Community Impact</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedPlayer.communityNote}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Family Background</h4>
                <p className="text-gray-700 dark:text-gray-300">{selectedPlayer.familyBackground}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contract Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${selectedPlayer.contractValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Contract Value</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedPlayer.dateSigned).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Date Signed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedPlayer.offContractDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Contract Expires</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedPlayer.teamHistory.split(',').length} Teams
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Career History</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Player Value Analysis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive player value assessment using advanced analytics and cohesion metrics
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {moneyBallPlayersData.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Players Analyzed</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <DollarSign className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${Math.round(moneyBallPlayersData.reduce((sum, p) => sum + p.contractValue, 0) / 1000)}k
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Contract Value</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <TrendingUp className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(moneyBallPlayersData.reduce((sum, p) => sum + p.totalContributions, 0) / moneyBallPlayersData.length)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Contributions</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Award className="w-8 h-8 text-orange-600 mr-4" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(moneyBallPlayersData.reduce((sum, p) => sum + p.personalityScore, 0) / moneyBallPlayersData.length * 10) / 10}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Cohesion Score</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moneyBallPlayersData.map((player) => {
            const metrics = convertToPlayerValueMetrics(player);
            const weiPercent = (player.positiveContributions / player.totalContributions) * 100;
            
            return (
              <Card 
                key={player.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPlayer(player)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={player.photoUrl} alt={player.name} />
                      <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{player.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{player.position}</Badge>
                        <Badge variant="secondary" className="text-xs">{player.club}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{weiPercent.toFixed(1)}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Work Efficiency</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-lg font-bold text-green-600">${(player.contractValue / 1000).toFixed(0)}k</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Contract Value</div>
                    </div>
                  </div>
                  
                  {/* Performance Indicators */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Contributions</span>
                      <span className="font-semibold">{player.totalContributions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">X-Factor Plays</span>
                      <span className="font-semibold">{player.xFactorContributions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sprint Time (10m)</span>
                      <span className="font-semibold">{player.sprintTime10m}s</span>
                    </div>
                  </div>
                  
                  {/* Cohesion Scores */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Cohesion Factors</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Attendance</span>
                        <span className="font-semibold">{player.attendanceScore}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Leadership</span>
                        <span className="font-semibold">{player.personalityScore}/10</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" size="sm">
                    View Full Analysis
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}