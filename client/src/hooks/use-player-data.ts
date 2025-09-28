import { useQuery } from "@tanstack/react-query";
import type { Player } from "@shared/schema";

export function usePlayerData(playerId: string) {
  const { data: playerResponse, ...rest } = useQuery<{success: boolean, player: Player}>({
    queryKey: [`/api/players/${playerId}`],
    enabled: !!playerId,
  });

  return {
    data: playerResponse?.player,
    ...rest
  };
}