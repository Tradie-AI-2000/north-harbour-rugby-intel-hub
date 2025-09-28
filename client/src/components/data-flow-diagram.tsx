import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  FileSpreadsheet, 
  Smartphone, 
  Brain, 
  Heart, 
  Users, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Database
} from "lucide-react";

interface DataFlowNode {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  inputs: string[];
  outputs: string[];
  updateFrequency: string;
  dataSource: 'manual' | 'csv' | 'api' | 'ai' | 'medical';
}

const dataFlowNodes: DataFlowNode[] = [
  {
    id: 'medical_updates',
    title: 'Medical Records',
    description: 'Physio appointments, injury status, medical clearances',
    icon: Heart,
    color: 'bg-red-50 border-red-200',
    inputs: ['Physio input', 'Doctor assessments', 'Injury reports'],
    outputs: ['Medical score', 'Availability status', 'Player value'],
    updateFrequency: 'Real-time',
    dataSource: 'medical'
  },
  {
    id: 'training_attendance',
    title: 'Training Attendance',
    description: 'Session participation, punctuality, engagement levels',
    icon: Users,
    color: 'bg-blue-50 border-blue-200',
    inputs: ['Coach observations', 'Session check-ins', 'GPS tracking'],
    outputs: ['Attendance score', 'Cohesion metrics', 'Reliability rating'],
    updateFrequency: 'Daily',
    dataSource: 'manual'
  },
  {
    id: 'gps_data',
    title: 'GPS Performance',
    description: 'StatSports tracking data, movement analysis, workload',
    icon: Smartphone,
    color: 'bg-green-50 border-green-200',
    inputs: ['StatSports API', 'Training sessions', 'Match data'],
    outputs: ['Fitness status', 'Performance metrics', 'Workload analysis'],
    updateFrequency: 'Live',
    dataSource: 'api'
  },
  {
    id: 'match_performance',
    title: 'Match Statistics',
    description: 'Game performance, statistics, tactical contributions',
    icon: Activity,
    color: 'bg-purple-50 border-purple-200',
    inputs: ['Live match tracking', 'Video analysis', 'Coach ratings'],
    outputs: ['Performance rating', 'Game impact', 'Skills assessment'],
    updateFrequency: 'Match days',
    dataSource: 'api'
  },
  {
    id: 'csv_imports',
    title: 'Spreadsheet Updates',
    description: 'Bulk data updates, manual corrections, seasonal reviews',
    icon: FileSpreadsheet,
    color: 'bg-orange-50 border-orange-200',
    inputs: ['Coach spreadsheets', 'Database exports', 'Manual edits'],
    outputs: ['Comprehensive updates', 'Data corrections', 'Bulk changes'],
    updateFrequency: 'Weekly',
    dataSource: 'csv'
  },
  {
    id: 'ai_analysis',
    title: 'AI Insights',
    description: 'Machine learning analysis, predictive modeling, recommendations',
    icon: Brain,
    color: 'bg-indigo-50 border-indigo-200',
    inputs: ['All player data', 'Historical patterns', 'Performance trends'],
    outputs: ['AI ratings', 'Predictions', 'Development recommendations'],
    updateFrequency: 'Automated',
    dataSource: 'ai'
  }
];

const cascadingEffects = [
  {
    trigger: 'Medical appointment missed',
    impacts: ['Attendance score ↓', 'Medical compliance ↓', 'Player value ↓', 'Selection risk ↑']
  },
  {
    trigger: 'Injury status change',
    impacts: ['Medical status update', 'Availability change', 'Training modifications', 'Squad planning impact']
  },
  {
    trigger: 'GPS performance decline',
    impacts: ['Fitness status alert', 'Training load adjustment', 'Medical review trigger', 'Performance flag']
  },
  {
    trigger: 'Skills rating update',
    impacts: ['AI rating recalculation', 'Position suitability', 'Development plan update', 'Selection weighting']
  }
];

export default function DataFlowDiagram() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataFlowNodes.map((node) => {
          const IconComponent = node.icon;
          return (
            <Card key={node.id} className={`${node.color} transition-all hover:shadow-md`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5" />
                    <CardTitle className="text-sm">{node.title}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {node.updateFrequency}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{node.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Data Inputs</h4>
                    <div className="flex flex-wrap gap-1">
                      {node.inputs.map((input, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs py-0">
                          {input}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Affects</h4>
                    <div className="flex flex-wrap gap-1">
                      {node.outputs.map((output, idx) => (
                        <Badge key={idx} variant="default" className="text-xs py-0">
                          {output}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Cascading Data Effects
          </CardTitle>
          <p className="text-sm text-gray-600">
            How changes in one area automatically trigger updates in related metrics
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cascadingEffects.map((effect, idx) => (
              <div key={idx} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-sm">{effect.trigger}</span>
                </div>
                <div className="space-y-1">
                  {effect.impacts.map((impact, impactIdx) => (
                    <div key={impactIdx} className="flex items-center gap-2 text-sm">
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                      <span className="text-gray-700">{impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Integrity Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Automatic Validation</h4>
                <p className="text-xs text-gray-600">
                  All data updates are validated against business rules before applying changes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Change Tracking</h4>
                <p className="text-xs text-gray-600">
                  Complete audit trail of who changed what, when, and why
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Impact Analysis</h4>
                <p className="text-xs text-gray-600">
                  Preview what metrics will be affected before making changes
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Data Flow Summary</h3>
        <p className="text-sm text-blue-800 mb-3">
          Every data update flows through our integrity management system to ensure accuracy and consistency across all metrics. 
          Whether it's a physio updating an injury status, a CSV import, or real-time GPS data, all changes trigger appropriate 
          updates to related fields automatically.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            Real-time validation
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            Automatic cascading updates
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            Complete audit trail
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            Data consistency guaranteed
          </Badge>
        </div>
      </div>
    </div>
  );
}