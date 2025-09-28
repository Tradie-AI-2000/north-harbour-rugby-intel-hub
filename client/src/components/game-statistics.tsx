import { Clock, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GameTimeChart from "@/components/charts/game-time-chart";
import type { Player } from "@shared/schema";

interface GameStatisticsProps {
  playerId: string;
  player?: Player;
}

export default function GameStatistics({ playerId, player }: GameStatisticsProps) {
  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No player data available</p>
      </div>
    );
  }

  const currentSeason = player.gameStats[player.gameStats.length - 1];

  if (!currentSeason) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No game statistics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-nh-blue" />
            Season Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Game Time Comparison */}
            <div>
              <h4 className="text-md font-medium text-slate-700 mb-4">Minutes Played Comparison</h4>
              <GameTimeChart playerId={playerId} player={player} />
            </div>

            {/* Key Statistics */}
            <div>
              <h4 className="text-md font-medium text-slate-700 mb-4">Key Statistics ({currentSeason.season})</h4>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-xl font-bold text-nh-navy">{currentSeason.tries}</div>
                    <div className="text-xs text-slate-600">Tries</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-xl font-bold text-nh-navy">{currentSeason.tackles}</div>
                    <div className="text-xs text-slate-600">Tackles</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-xl font-bold text-nh-navy">{currentSeason.lineoutWins}</div>
                    <div className="text-xs text-slate-600">Lineout Wins</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-xl font-bold text-nh-navy">{currentSeason.turnovers}</div>
                    <div className="text-xs text-slate-600">Turnovers</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
