import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { PlayerSummary } from "@shared/types";

interface PlayerSelectorProps {
  selectedPlayerId: string;
  onPlayerChange: (playerId: string) => void;
}

export default function PlayerSelector({ selectedPlayerId, onPlayerChange }: PlayerSelectorProps) {
  // LIVE FIREBASE DATA - Replaces all hardcoded static player arrays
  const { data: playersData, isLoading } = useQuery<any[]>({
    queryKey: ['/api/players'],
  });

  // Transform Firebase data to PlayerSummary format
  const players: PlayerSummary[] = React.useMemo(() => {
    if (!playersData) return [];
    
    return playersData.map((player: any) => ({
      id: player.id,
      name: `${player.firstName} ${player.lastName}`,
      position: player.position,
      jerseyNumber: player.jerseyNumber,
      status: player.currentStatus
    }));
  }, [playersData]);

  return (
    <div>
      <Label className="block text-sm font-medium text-slate-700 mb-2">
        Select Player
      </Label>
      <Select value={selectedPlayerId} onValueChange={onPlayerChange} disabled={isLoading}>
        <SelectTrigger className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2">
          <SelectValue placeholder={isLoading ? "Loading players..." : "Select a player"} />
        </SelectTrigger>
        <SelectContent>
          {players.map((player) => (
            <SelectItem key={player.id} value={player.id}>
              <div className="flex items-center space-x-2">
                <span>{player.name} - {player.position}</span>
                <span className="text-xs text-slate-500">#{player.jerseyNumber}</span>
                {player.status !== 'available' && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                    {player.status}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
