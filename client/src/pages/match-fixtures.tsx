import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Target, BarChart3 } from "lucide-react";
import nhLogo from "@assets/menulogo_wo.png";

interface Match {
  id: string;
  round: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  status: "completed" | "upcoming" | "live";
  isHome: boolean;
  result?: {
    homeScore: number;
    awayScore: number;
    outcome: "win" | "loss" | "draw";
  };
}

const matches: Match[] = [
  {
    id: "nh_vs_auckland_2024",
    round: "Round 1",
    homeTeam: "North Harbour",
    awayTeam: "Auckland",
    date: "Saturday 1 June 2024",
    time: "19:05",
    venue: "North Harbour Stadium",
    status: "completed",
    isHome: true,
    result: { homeScore: 32, awayScore: 24, outcome: "win" }
  },
  {
    id: "canterbury_vs_nh_2024",
    round: "Round 2", 
    homeTeam: "Canterbury",
    awayTeam: "North Harbour",
    date: "Friday 7 June 2024",
    time: "19:05",
    venue: "Orangetheory Stadium",
    status: "completed",
    isHome: false,
    result: { homeScore: 28, awayScore: 31, outcome: "win" }
  },
  {
    id: "nh_vs_wellington_2024",
    round: "Round 3",
    homeTeam: "North Harbour",
    awayTeam: "Wellington",
    date: "Saturday 14 June 2024", 
    time: "14:05",
    venue: "North Harbour Stadium",
    status: "completed",
    isHome: true,
    result: { homeScore: 25, awayScore: 22, outcome: "win" }
  },
  {
    id: "otago_vs_nh_2024",
    round: "Round 4",
    homeTeam: "Otago", 
    awayTeam: "North Harbour",
    date: "Friday 21 June 2024",
    time: "19:05",
    venue: "Forsyth Barr Stadium",
    status: "completed",
    isHome: false,
    result: { homeScore: 19, awayScore: 17, outcome: "loss" }
  },
  {
    id: "nh_vs_tasman_2024",
    round: "Round 5",
    homeTeam: "North Harbour",
    awayTeam: "Tasman",
    date: "Saturday 28 June 2024",
    time: "16:05", 
    venue: "North Harbour Stadium",
    status: "upcoming",
    isHome: true
  },
  {
    id: "waikato_vs_nh_2024",
    round: "Round 6",
    homeTeam: "Waikato",
    awayTeam: "North Harbour", 
    date: "Friday 5 July 2024",
    time: "19:05",
    venue: "FMG Stadium Waikato",
    status: "upcoming",
    isHome: false
  }
];

export default function MatchFixtures() {
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState("completed");

  const completedMatches = matches.filter(m => m.status === "completed");
  const upcomingMatches = matches.filter(m => m.status === "upcoming");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "live": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getResultColor = (outcome: string) => {
    switch (outcome) {
      case "win": return "text-green-600";
      case "loss": return "text-red-600";
      case "draw": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const getOpponent = (match: Match) => {
    return match.isHome ? match.awayTeam : match.homeTeam;
  };

  const MatchCard = ({ match }: { match: Match }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-500">{match.round}</div>
            <Badge className={getStatusColor(match.status)}>{match.status}</Badge>
          </div>
          {match.result && (
            <div className={`text-lg font-bold ${getResultColor(match.result.outcome)}`}>
              {match.isHome ? `${match.result.homeScore}-${match.result.awayScore}` : `${match.result.awayScore}-${match.result.homeScore}`}
            </div>
          )}
        </div>
        <CardTitle className="text-lg">
          <div className="flex items-center gap-2">
            <img src={nhLogo} alt="North Harbour" className="w-6 h-6" />
            <span>North Harbour vs {getOpponent(match)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{match.date} at {match.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{match.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{match.isHome ? "Home" : "Away"}</span>
          </div>
        </div>

        {match.status === "completed" && (
          <div className="mt-4 pt-4 border-t flex gap-2">
            <Link href={`/match-performance/${match.id}`}>
              <Button size="sm" className="flex-1">
                <BarChart3 className="w-4 h-4 mr-2" />
                Match Analytics
              </Button>
            </Link>
            <Link href={`/match-performance/${match.id}/try-analysis`}>
              <Button size="sm" variant="outline" className="flex-1">
                <Target className="w-4 h-4 mr-2" />
                Try Analysis
              </Button>
            </Link>
          </div>
        )}

        {match.status === "upcoming" && (
          <div className="mt-4 pt-4 border-t">
            <Button size="sm" variant="outline" className="w-full" disabled>
              <Clock className="w-4 h-4 mr-2" />
              Analysis Available After Match
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Analytics
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Match Performance Analytics</h1>
              <p className="text-gray-600 mt-2">
                Select a fixture to analyze match performance and try patterns
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img src={nhLogo} alt="North Harbour Rugby" className="h-12 w-12" />
            <div>
              <div className="text-lg font-bold text-blue-900">North Harbour Rugby</div>
              <div className="text-sm text-gray-600">NPC 2024 Season</div>
            </div>
          </div>
        </div>

        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/analytics" className="hover:text-blue-600">Analytics</Link>
          <span>→</span>
          <span className="font-medium">Match Performance Analytics</span>
        </div>

        {/* Tabs for Completed/Upcoming Matches */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="completed">Completed Matches ({completedMatches.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Fixtures ({upcomingMatches.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Season Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>2024 Season Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">3</div>
                <div className="text-sm text-gray-600">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">1</div>
                <div className="text-sm text-gray-600">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">75%</div>
                <div className="text-sm text-gray-600">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">+51</div>
                <div className="text-sm text-gray-600">Point Differential</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}