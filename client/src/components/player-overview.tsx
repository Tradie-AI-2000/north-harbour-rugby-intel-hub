import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Player } from "@shared/schema";

interface PlayerOverviewProps {
  playerId: string;
  player?: Player;
  isLoading: boolean;
}

export default function PlayerOverview({ playerId, player, isLoading }: PlayerOverviewProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
        <div className="text-center mb-6 space-y-2">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
          <Skeleton className="h-4 w-12 mx-auto" />
        </div>
        <Skeleton className="h-24 w-full mb-6" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
        <div className="text-center py-12">
          <p className="text-slate-500">Player not found</p>
        </div>
      </div>
    );
  }

  const currentPhysical = player.physicalAttributes?.[player.physicalAttributes.length - 1];
  const currentStats = player.gameStats?.[player.gameStats.length - 1];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
      {/* Player Image */}
      <img 
        src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
        alt={`${player.personalDetails.firstName} ${player.personalDetails.lastName}`}
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-nh-blue"
      />
      
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-nh-navy">
          {player.personalDetails.firstName} {player.personalDetails.lastName}
        </h2>
        <p className="text-nh-blue font-medium">{player.rugbyProfile.primaryPosition}</p>
        <p className="text-sm text-slate-600">#{player.rugbyProfile.jerseyNumber}</p>
      </div>

      {/* AI Rating */}
      {player.aiRating && (
        <div className="mb-6 p-4 bg-gradient-to-r from-nh-blue to-blue-600 rounded-lg text-white">
          <div className="text-center">
            <div className="text-2xl font-bold">{player.aiRating.overall}</div>
            <div className="text-sm opacity-90">Overall Rating</div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Physicality</span>
              <span className="font-medium">{player.aiRating.physicality}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Skillset</span>
              <span className="font-medium">{player.aiRating.skillset}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Game Impact</span>
              <span className="font-medium">{player.aiRating.gameImpact}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Potential</span>
              <span className="font-medium">{player.aiRating.potential}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Age</span>
          <span className="font-medium">
            {new Date().getFullYear() - new Date(player.personalDetails.dateOfBirth).getFullYear()}
          </span>
        </div>
        {currentPhysical && (
          <>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Height</span>
              <span className="font-medium">{currentPhysical.height ? `${currentPhysical.height}cm` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Weight</span>
              <span className="font-medium">{currentPhysical.weight}kg</span>
            </div>
          </>
        )}
        {currentStats && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Caps This Season</span>
            <span className="font-medium text-nh-green">{currentStats.matchesPlayed}</span>
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="mt-6 space-y-2">
        <div className={`flex items-center justify-between p-2 rounded-lg ${
          player.status.fitness === 'available' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <span className={`text-sm ${
            player.status.fitness === 'available' ? 'text-green-800' : 'text-red-800'
          }`}>
            Fitness Status
          </span>
          <Badge variant={player.status.fitness === 'available' ? 'default' : 'destructive'}>
            {player.status.fitness}
          </Badge>
        </div>
        <div className={`flex items-center justify-between p-2 rounded-lg ${
          player.status.medical === 'cleared' ? 'bg-blue-50' : 'bg-yellow-50'
        }`}>
          <span className={`text-sm ${
            player.status.medical === 'cleared' ? 'text-blue-800' : 'text-yellow-800'
          }`}>
            Medical
          </span>
          <Badge variant={player.status.medical === 'cleared' ? 'default' : 'secondary'}>
            {player.status.medical}
          </Badge>
        </div>
      </div>
    </div>
  );
}
