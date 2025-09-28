import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Player } from "@shared/schema";

interface RecentActivityProps {
  playerId: string;
  player?: Player;
}

export default function RecentActivity({ playerId, player }: RecentActivityProps) {
  if (!player) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2 text-nh-blue" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-500">No activity data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get recent activities (last 5)
  const recentActivities = player.activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'training':
        return 'bg-nh-blue';
      case 'match':
        return 'bg-nh-green';
      case 'test':
        return 'bg-nh-amber';
      case 'medical':
        return 'bg-red-500';
      case 'meeting':
        return 'bg-purple-500';
      default:
        return 'bg-slate-400';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'training':
        return '🏃';
      case 'match':
        return '🏉';
      case 'test':
        return '📊';
      case 'medical':
        return '🏥';
      case 'meeting':
        return '👥';
      default:
        return '📝';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="h-5 w-5 mr-2 text-nh-blue" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No recent activities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                    <p className="text-sm font-medium text-slate-900">
                      {activity.description}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {format(new Date(activity.date), 'PPp')}
                  </p>
                  {activity.details && (
                    <p className="text-xs text-slate-600 mt-1">{activity.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
