import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useHashNavigation } from "@/hooks/useHashNavigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationHeader from "@/components/navigation-header";
import PlayerValueScorecard from "@/components/player-value-scorecard";
import AdvancedMetrics from "@/components/advanced-metrics";
import AIPlayerAnalysis from "@/components/ai-player-analysis";
import { 
  moneyBallPlayersData, 
  convertToPlayerValueMetrics,
  type MoneyBallPlayer 
} from "@/data/moneyBallPlayers";
import { type PlayerValueMetrics } from "@/lib/playerValueCalculation";
import { 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Ruler,
  Weight,
  Activity,
  Award,
  Users,
  MessageSquare,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Upload
} from "lucide-react";

interface Player {
  id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    fullName?: string;
    dateOfBirth: string;
    email?: string;
    phone?: string;
    address?: string;
    profileImageUrl?: string;
    bio?: string;
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  jerseyNumber?: number;
  primaryPosition: string;
  secondaryPositions?: string[];
  yearsInTeam?: number;
  clubHistory?: string[];
  physicalAttributes?: {
    height: number;
    weight: number;
    bodyFat: number;
    lastMeasured?: string;
  };
  skills?: {
    ballHandling: number;
    passing: number;
    kicking: number;
    lineoutThrowing?: number;
    scrummaging?: number;
    rucking?: number;
    defense: number;
    communication: number;
  };
  availability?: {
    status: string;
    detail?: string;
    expectedReturn?: string;
    lastUpdated?: string;
    updatedBy?: string;
  };
  contactInfo?: {
    email: string;
    phone: string;
    address: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  aiRating?: {
    overall: number;
    potential: number;
  };
}

export default function EnhancedPlayerProfile() {
  const [, params] = useRoute("/player/:playerId");
  const playerId = params?.playerId;

  // Use standardized hash navigation hook
  const validTabs = ['profile', 'value-analysis', 'advanced-metrics', 'medical-profile'];
  const { activeTab, handleTabChange } = useHashNavigation(validTabs, 'profile');

  const { data: player, isLoading } = useQuery<Player>({
    queryKey: [`/api/players/${playerId}`],
    enabled: !!playerId,
    staleTime: Infinity, // Cache indefinitely - only refresh on manual actions
    refetchInterval: false, // No automatic polling to prevent Firebase charges
  });

  // Dynamic status mapping based on Firebase availability data
  const getCurrentStatus = (): "available" | "modified" | "unavailable" => {
    const status = player?.availability?.status || "";
    if (status.toLowerCase().includes('available')) return "available";
    if (status.toLowerCase().includes('modified')) return "modified";
    return "unavailable";
  };

  // Calculate age helper function
  const calculateAge = (dateOfBirth?: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Get physical data and calculated age
  const physicalData = player?.physicalAttributes;
  const age = calculateAge(player?.personalDetails?.dateOfBirth);

  const downloadPlayerData = () => {
    if (!player) return;
    
    // Create comprehensive CSV data structure
    const csvData = [
      // Header row
      [
        'Export Date', 'Player ID', 'First Name', 'Last Name', 'Age', 'Date of Birth', 'Email', 'Phone', 'Address',
        'Emergency Contact Name', 'Emergency Contact Relationship', 'Emergency Contact Phone',
        'Jersey Number', 'Primary Position', 'Secondary Positions', 'Playing Level', 'Years In Team',
        'Height (cm)', 'Weight (kg)', 'Body Fat (%)', 'Lean Mass (kg)',
        'Ball Handling', 'Passing', 'Kicking', 'Defense', 'Communication',
        'Matches Played', 'Minutes Played', 'Tries', 'Tackles', 'Penalties',
        'Overall AI Rating', 'Potential Rating', 'Fitness Status', 'Medical Status'
      ],
      // Data row
      [
        new Date().toISOString().split('T')[0],
        player.id,
        player.personalDetails?.firstName || 'Unknown',
        player.personalDetails?.lastName || 'Player',
        age,
        player.personalDetails?.dateOfBirth || 'Unknown',
        player.personalDetails?.email || 'N/A',
        player.personalDetails?.phone || 'N/A',
        player.personalDetails?.address || 'N/A',
        player.personalDetails?.emergencyContact?.name || 'N/A',
        player.personalDetails?.emergencyContact?.relationship || 'N/A',
        player.personalDetails?.emergencyContact?.phone || 'N/A',
        player.jerseyNumber || 'N/A',
        player.primaryPosition || 'Unknown Position',
        player.secondaryPositions?.join(';') || '',
        'Professional', // Playing level not in Firebase structure
        player.yearsInTeam || 0,
        physicalData?.height || '',
        physicalData?.weight || '',
        physicalData?.bodyFat || '',
        '', // Lean mass not in current Firebase structure
        player.skills?.ballHandling || '',
        player.skills?.passing || '',
        player.skills?.kicking || '',
        player.skills?.defense || '',
        player.skills?.communication || '',
        '', // Matches played - not available in current Firebase structure
        '', // Minutes played - not available in current Firebase structure
        '', // Tries - not available in current Firebase structure
        '', // Tackles - not available in current Firebase structure
        '', // Penalties - not available in current Firebase structure
        player.aiRating?.overall || '',
        player.aiRating?.potential || '',
        player.availability?.status || 'Unknown',
        player.availability?.status || 'Unknown'
      ]
    ];

    // Convert to CSV string
    const csvContent = csvData.map(row => 
      row.map(field => {
        // Handle fields that might contain commas or quotes
        const stringField = String(field || '');
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      }).join(',')
    ).join('\n');

    // Create and download file
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${player.personalDetails?.firstName || 'Unknown'}_${player.personalDetails?.lastName || 'Player'}_profile_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle CSV file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const lines = csvContent.split('\n');
        
        if (lines.length < 2) {
          alert('CSV file must contain header and data rows');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const dataRow = lines[1].split(',').map(d => d.trim().replace(/"/g, ''));

        // Create player data object from CSV
        const updatedPlayerData: any = {
          id: dataRow[headers.indexOf('Player ID')] || player?.id,
          personalDetails: {
            firstName: dataRow[headers.indexOf('First Name')] || '',
            lastName: dataRow[headers.indexOf('Last Name')] || '',
            dateOfBirth: dataRow[headers.indexOf('Date of Birth')] || '',
            email: dataRow[headers.indexOf('Email')] || '',
            phone: dataRow[headers.indexOf('Phone')] || '',
            address: dataRow[headers.indexOf('Address')] || '',
            emergencyContact: {
              name: dataRow[headers.indexOf('Emergency Contact Name')] || '',
              relationship: dataRow[headers.indexOf('Emergency Contact Relationship')] || '',
              phone: dataRow[headers.indexOf('Emergency Contact Phone')] || ''
            }
          },
          rugbyProfile: {
            jerseyNumber: parseInt(dataRow[headers.indexOf('Jersey Number')]) || 0,
            primaryPosition: dataRow[headers.indexOf('Primary Position')] || '',
            secondaryPositions: dataRow[headers.indexOf('Secondary Positions')]?.split(';').filter(p => p) || [],
            playingLevel: dataRow[headers.indexOf('Playing Level')] || '',
            yearsInTeam: parseInt(dataRow[headers.indexOf('Years In Team')]) || 0
          },
          skills: {
            ballHandling: parseFloat(dataRow[headers.indexOf('Ball Handling')]) || 0,
            passing: parseFloat(dataRow[headers.indexOf('Passing')]) || 0,
            kicking: parseFloat(dataRow[headers.indexOf('Kicking')]) || 0,
            defense: parseFloat(dataRow[headers.indexOf('Defense')]) || 0,
            communication: parseFloat(dataRow[headers.indexOf('Communication')]) || 0
          },
          status: {
            fitness: dataRow[headers.indexOf('Fitness Status')] || 'unknown',
            medical: dataRow[headers.indexOf('Medical Status')] || 'unknown'
          },
          // Physical attributes update (Firebase uses single object)
          physicalAttributes: {
            height: parseInt(dataRow[headers.indexOf('Height (cm)')]) || player?.physicalAttributes?.height || 0,
            weight: parseInt(dataRow[headers.indexOf('Weight (kg)')]) || player?.physicalAttributes?.weight || 0,
            bodyFat: parseFloat(dataRow[headers.indexOf('Body Fat (%)')]) || player?.physicalAttributes?.bodyFat || 0,
            lastMeasured: new Date().toISOString()
          },
          // Game stats not available in current Firebase structure
          aiRating: {
            overall: parseFloat(dataRow[headers.indexOf('Overall AI Rating')]) || undefined,
            potential: parseFloat(dataRow[headers.indexOf('Potential Rating')]) || undefined
          }
        };

        // Validate required fields
        if (!updatedPlayerData.personalDetails.firstName || !updatedPlayerData.personalDetails.lastName) {
          alert('CSV must contain valid First Name and Last Name');
          return;
        }

        console.log('Parsed CSV player data:', updatedPlayerData);
        alert(`Player data for ${updatedPlayerData.personalDetails.firstName} ${updatedPlayerData.personalDetails.lastName} uploaded successfully!\n\nNote: In a production system, this would update the database. The parsed data is logged to console for review.`);
        
        // Here you would typically send the data to your API to update the player
        // await apiRequest('/api/players/' + playerId, {
        //   method: 'PUT',
        //   body: updatedPlayerData
        // });
        
      } catch (error) {
        console.error('CSV parsing error:', error);
        alert('Error reading CSV file. Please ensure it\'s properly formatted.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nh-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading player profile...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Player Not Found</h2>
          <p className="text-gray-600 mb-4">The requested player profile could not be found.</p>
          <Link href="/players">
            <Button className="bg-nh-red hover:bg-nh-red-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Players
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Variables already defined above - no need to redeclare

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 border-green-200";
      case "injured": return "bg-red-100 text-red-800 border-red-200";
      case "recovering": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return <CheckCircle className="w-4 h-4" />;
      case "injured": return <AlertTriangle className="w-4 h-4" />;
      case "recovering": return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Convert to Player Value metrics if this player has MoneyBall data
  const moneyBallPlayer = moneyBallPlayersData.find(p => 
    p.name.toLowerCase().includes(player.personalDetails?.firstName?.toLowerCase() || '') ||
    p.name.toLowerCase().includes(player.personalDetails?.lastName?.toLowerCase() || '')
  );

  let playerValueMetrics: PlayerValueMetrics | null = null;
  if (moneyBallPlayer) {
    playerValueMetrics = convertToPlayerValueMetrics(moneyBallPlayer);
  } else {
    // Create basic metrics from existing player data
    playerValueMetrics = {
      position: player.primaryPosition || 'Unknown Position',
      secondaryPosition: player.secondaryPositions?.[0],
      weight: physicalData?.weight || 100,
      contractValue: 85000, // Sample value
      
      // Performance Metrics
      minutesPlayed: 500, // Default value since no game stats in Firebase yet
      gamesPlayed: 10, // Default value since no game stats in Firebase yet
      totalContributions: 300,
      positiveContributions: 250,
      negativeContributions: 50,
      xFactorContributions: 20,
      penaltyCount: 5, // Default value since no game stats in Firebase yet
      
      // Physical Metrics
      sprintTime10m: 1.85,
      totalCarries: 60,
      dominantCarryPercent: 8.5,
      tackleCompletionPercent: 85.0,
      breakdownSuccessPercent: 90.0,
      
      // Cohesion Factors
      attendanceScore: 9.0,
      scScore: 8.5,
      medicalScore: 9.5,
      personalityScore: 8.8
    };
  }

  // Define player name safely with debug logging
  const playerName = player?.personalDetails?.firstName && player?.personalDetails?.lastName 
    ? `${player.personalDetails.firstName} ${player.personalDetails.lastName}`
    : 'Loading Player...';

  // Debug logging to track the issue
  console.log('🔍 Player data in enhanced-player-profile:', {
    playerId,
    playerExists: !!player,
    firstName: player?.personalDetails?.firstName,
    lastName: player?.personalDetails?.lastName,
    calculatedName: playerName
  });

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader
        title={playerName}
        breadcrumbs={[
          { label: "Main", href: "/" },
          { label: "Team", href: "/team" },
          { label: "Players", href: "/team#players" },
          { label: playerName }
        ]}
        backButton={{
          label: "Back to Players",
          href: "/team#players"
        }}
        actions={
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadPlayerData}
              className="text-white hover:bg-nh-red-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="text-white hover:bg-nh-red-600"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <Badge className={`flex items-center gap-2 ${getStatusColor(getCurrentStatus())}`}>
              {getStatusIcon(getCurrentStatus())}
              {player.availability?.status || 'Unknown'}
            </Badge>
          </div>
        }
      />

      {/* CSV Format Help */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>CSV Export/Import:</strong> Download exports all player data in spreadsheet format. Edit any fields in Excel/Google Sheets and upload the CSV to update player information. Required fields: First Name, Last Name.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-gray-200 p-1 rounded-xl shadow-sm gap-1 h-12">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:border-transparent data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 data-[state=inactive]:border-transparent font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
            >
              Player Profile
            </TabsTrigger>
            <TabsTrigger 
              value="value-analysis" 
              className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:border-transparent data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 data-[state=inactive]:border-transparent font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
            >
              Value Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="advanced-metrics" 
              className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:border-transparent data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 data-[state=inactive]:border-transparent font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
            >
              Advanced Metrics
            </TabsTrigger>
            <TabsTrigger 
              value="medical-profile" 
              className="data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:border-transparent data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-nh-red data-[state=inactive]:hover:bg-red-50 data-[state=inactive]:border-transparent font-semibold rounded-lg transition-all duration-200 text-sm flex items-center justify-center h-full"
            >
              Medical Profile
            </TabsTrigger>
          </TabsList>

          {/* Player Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="text-center">
                    <Avatar className="w-32 h-32 mx-auto mb-4">
                      <AvatarImage 
                        src={player.personalDetails?.profileImageUrl || `/api/players/${player.id}/avatar`} 
                        alt={`${player.personalDetails?.firstName || 'Player'} ${player.personalDetails?.lastName || 'Name'}`} 
                      />
                      <AvatarFallback className="bg-nh-red text-white text-2xl font-bold">
                        {(player.personalDetails?.firstName?.[0] || 'P')}{(player.personalDetails?.lastName?.[0] || 'N')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold">{playerName}</h3>
                    <p className="text-gray-600">#{player.jerseyNumber}</p>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Age: {age} years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{player.contactInfo?.address || player.personalDetails?.address || 'Address not available'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Position: {player.primaryPosition || 'Unknown Position'}</span>
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="space-y-2">
                    <Button className="w-full bg-nh-red hover:bg-nh-red-600" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Player
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Player
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Physical & Performance Stats */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Physical & Performance Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Physical Stats */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Ruler className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{physicalData?.height || 'N/A'}</div>
                      <div className="text-sm text-gray-600">Height (cm)</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Weight className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{physicalData?.weight || 'N/A'}</div>
                      <div className="text-sm text-gray-600">Weight (kg)</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{physicalData?.bodyFat || 'N/A'}</div>
                      <div className="text-sm text-gray-600">Body Fat (%)</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Award className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{player.aiRating?.overall || 'N/A'}</div>
                      <div className="text-sm text-gray-600">AI Rating</div>
                    </div>
                  </div>

                  {/* Skills Breakdown */}
                  {player.skills && (
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold mb-4">Skills Assessment</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(player.skills).map(([skill, rating]) => (
                          <div key={skill} className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-nh-red h-2 rounded-full" 
                                  style={{ width: `${(rating / 10) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold w-8">{rating}/10</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Performance - Game stats not available in current Firebase structure */}
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold mb-4">Recent Performance</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        Game statistics will be displayed here once match data is integrated into the Firebase database. 
                        This will include matches played, minutes, tries, tackles, and penalty statistics.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Player Value Analysis Tab */}
          <TabsContent value="value-analysis" className="space-y-6">
            {playerValueMetrics && (
              <div>
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Player Value Analysis</h2>
                  <p className="text-gray-600">
                    Comprehensive assessment combining performance metrics, cohesion impact, and market value
                  </p>
                </div>
                <PlayerValueScorecard metrics={playerValueMetrics} />
                
                {/* AI Analysis Section */}
                <div className="mt-8">
                  <AIPlayerAnalysis 
                    metrics={playerValueMetrics} 
                    playerName={player?.personalDetails?.firstName + ' ' + player?.personalDetails?.lastName || 'Player'} 
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Advanced Metrics Tab */}
          <TabsContent value="advanced-metrics" className="space-y-6">
            <AdvancedMetrics playerId={playerId} player={player} />
          </TabsContent>

          {/* Medical Profile Tab */}
          <TabsContent value="medical-profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Medical Status Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Medical Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Status */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Current Status</label>
                        <div className="mt-1">
                          <Badge className={`flex items-center gap-2 w-fit ${getStatusColor(getCurrentStatus())}`}>
                            {getStatusIcon(getCurrentStatus())}
                            {getCurrentStatus() === "available" && "Available - Full Training"}
                            {getCurrentStatus() === "modified" && "Modified Training"}
                            {getCurrentStatus() === "unavailable" && "Unavailable - Injured"}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">Wellness Score</label>
                        <div className="mt-1 text-2xl font-bold text-green-600">8.5/10</div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">Training Load (ACWR)</label>
                        <div className="mt-1 text-2xl font-bold text-green-600">0.85</div>
                        <div className="text-sm text-gray-500">Within safe range</div>
                      </div>
                    </div>

                    {/* Recent Assessments */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-600">Recent Assessments</h4>
                      
                      <div className="border rounded-lg p-3 bg-green-50 border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">Pre-Training Assessment</div>
                          <div className="text-xs text-gray-500">Today, 8:00 AM</div>
                        </div>
                        <div className="text-xs text-green-700">
                          All systems clear - full training clearance
                        </div>
                      </div>

                      <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">Physiotherapy Review</div>
                          <div className="text-xs text-gray-500">Yesterday</div>
                        </div>
                        <div className="text-xs text-blue-700">
                          Hip flexor mobility - excellent progress
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Medical Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" size="sm">
                    <Activity className="w-4 h-4 mr-2" />
                    New Assessment
                  </Button>
                  <Button className="w-full" variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                  <Button className="w-full" variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Update to Staff
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Medical History */}
            <Card>
              <CardHeader>
                <CardTitle>Medical History & Treatment Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">Hip Flexor Strain - Minor</div>
                      <div className="text-sm text-gray-500">2024-05-15 - 2024-06-01</div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Minor hip flexor strain during training. Responded well to conservative treatment with physiotherapy and modified training load.
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-green-600 border-green-600">Resolved</Badge>
                      <div className="text-xs text-gray-500">Treated by: Dr. Sarah Jones</div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">Routine Wellness Monitoring</div>
                      <div className="text-sm text-gray-500">Ongoing</div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Regular wellness monitoring and load management. Player demonstrates excellent self-awareness and compliance with recovery protocols.
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-blue-600 border-blue-600">Active</Badge>
                      <div className="text-xs text-gray-500">Monitored by: Medical Team</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}