import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { Player } from "@shared/schema";

export function usePlayerData(playerId: string) {
  return useQuery({
    queryKey: ['/api/players'],
    queryFn: async () => {
      const response = await fetch('/api/players');
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      const players = await response.json();
      return players.find((p: any) => p.id === playerId);
    },
    enabled: !!playerId,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2
  });
}
