import { FileText, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Player } from "@shared/schema";

interface ReportsAccessProps {
  playerId: string;
  player?: Player;
}

export default function ReportsAccess({ playerId, player }: ReportsAccessProps) {
  if (!player) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-nh-blue" />
            Latest Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-500">No reports available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get latest reports (last 5)
  const latestReports = player.reports
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 5);

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'coach':
        return 'bg-nh-blue text-white';
      case 'medical':
        return 'bg-red-100 text-red-700';
      case 'strength_conditioning':
        return 'bg-nh-green text-white';
      case 'recruitment':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'coach':
        return 'Coach';
      case 'medical':
        return 'Medical';
      case 'strength_conditioning':
        return 'S&C';
      case 'recruitment':
        return 'Recruitment';
      default:
        return type;
    }
  };

  const handleOpenReport = (reportId: string) => {
    // In a real app, this would open a modal or navigate to the report
    console.log(`Opening report: ${reportId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-nh-blue" />
          Latest Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        {latestReports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No reports available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {latestReports.map((report) => (
              <Button
                key={report.id}
                variant="ghost"
                className="w-full justify-between p-3 h-auto border border-slate-200 hover:bg-slate-50"
                onClick={() => handleOpenReport(report.id)}
              >
                <div className="text-left">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-slate-900">{report.title}</p>
                    <Badge className={getReportTypeColor(report.type)}>
                      {getReportTypeLabel(report.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    Updated {format(new Date(report.lastUpdated), 'PPp')}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">By {report.author}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
