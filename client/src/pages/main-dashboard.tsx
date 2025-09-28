import { useState } from "react";
import { Link } from "wouter";
import logoPath from "@assets/menulogo_wo.png";
import RoleSelector from "@/components/role-selector";
import ProtectedRoute, { RoleIndicator } from "@/components/protected-route";
import { AuthUser } from "@/hooks/useAuth";
import { hasPermission } from "@shared/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  User, 
  Activity, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Target, 
  Zap,
  Brain,
  Shield,
  Clock,
  TrendingUp,
  Stethoscope
} from "lucide-react";

export default function MainDashboard() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Show role selector if no user is selected
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        {/* North Harbour Rugby Header */}
        <div className="bg-nh-red text-white p-6 shadow-lg">
          <div className="container mx-auto">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <img 
                  src={logoPath} 
                  alt="North Harbour Rugby" 
                  className="h-12 w-auto"
                />
                <div className="text-center">
                  <h1 className="text-2xl font-bold">North Harbour Rugby</h1>
                  <p className="text-red-100">Performance Hub - Role Selection</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto p-8">
          <RoleSelector onRoleSelect={setCurrentUser} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* North Harbour Rugby Header */}
      <div className="bg-nh-red text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={logoPath} 
                alt="North Harbour Rugby" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold">North Harbour Rugby</h1>
                <p className="text-red-100">Performance Hub - Main Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-red-100">Welcome, {currentUser.firstName} {currentUser.lastName}</div>
                <RoleIndicator currentRole={currentUser.role} />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentUser(null)}
                className="text-white hover:bg-red-700"
              >
                Switch Role
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Analytics Portal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access comprehensive player insights or manage team operations with our advanced analytics platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Player Analysis Portal */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-nh-red cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-nh-red group-hover:text-white transition-all duration-300">
                <User size={40} />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-nh-red transition-colors duration-300">
                Player Analysis Portal
              </CardTitle>
              <CardDescription className="text-lg">
                Individual player performance tracking and development insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Activity className="text-blue-600" size={20} />
                  <span className="text-sm font-medium">Performance Metrics</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Target className="text-green-600" size={20} />
                  <span className="text-sm font-medium">Skills Development</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Shield className="text-purple-600" size={20} />
                  <span className="text-sm font-medium">Injury Tracking</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Brain className="text-orange-600" size={20} />
                  <span className="text-sm font-medium">AI Insights</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Key Features:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-nh-red rounded-full"></div>
                    <span>Individual performance analytics and trends</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-nh-red rounded-full"></div>
                    <span>Training program management and progress tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-nh-red rounded-full"></div>
                    <span>Video analysis and skill development tools</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-nh-red rounded-full"></div>
                    <span>Injury prediction and recovery monitoring</span>
                  </li>
                </ul>
              </div>

              <Link href="/players">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold">
                  Access Player Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Team Management Portal */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-nh-red cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-nh-red group-hover:text-white transition-all duration-300">
                <Users size={40} />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-nh-red transition-colors duration-300">
                Team Management Portal
              </CardTitle>
              <CardDescription className="text-lg">
                Squad management, scheduling, and team-wide analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="text-blue-600" size={20} />
                  <span className="text-sm font-medium">Schedule Management</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Zap className="text-red-600" size={20} />
                  <span className="text-sm font-medium">Live Match Analysis</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <MessageSquare className="text-green-600" size={20} />
                  <span className="text-sm font-medium">Team Communication</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <BarChart3 className="text-purple-600" size={20} />
                  <span className="text-sm font-medium">Squad Analytics</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Key Features:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-nh-red rounded-full"></div>
                    <span>Weekly training schedules and session planning</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-nh-red rounded-full"></div>
                    <span>Real-time match analytics and tactical insights</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-nh-red rounded-full"></div>
                    <span>Slack integration for coaching communications</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-nh-red rounded-full"></div>
                    <span>Squad rotation and lineup optimization</span>
                  </li>
                </ul>
              </div>

              <Link href="/team">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold">
                  Access Team Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Medical Intelligence Hub */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-600 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Stethoscope size={40} />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                Medical Intelligence Hub
              </CardTitle>
              <CardDescription className="text-lg">
                Player health management, injury tracking, and return-to-play protocols
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Shield className="text-blue-600" size={20} />
                  <span className="text-sm font-medium">Injury Management</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Target className="text-green-600" size={20} />
                  <span className="text-sm font-medium">RTP Planning</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Activity className="text-purple-600" size={20} />
                  <span className="text-sm font-medium">Wellness Tracking</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <MessageSquare className="text-orange-600" size={20} />
                  <span className="text-sm font-medium">Coach Updates</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Key Features:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Comprehensive injury logging and treatment tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Evidence-based return-to-play protocols</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Player availability status management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Automated risk assessment and prevention</span>
                  </li>
                </ul>
              </div>

              <Link href="/medical-hub">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold">
                  Access Medical Hub
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Match Performance Analytics - New Featured Section */}
        <div className="mt-12 max-w-6xl mx-auto">
          <Card className="border-2 border-dashed border-red-300 bg-red-50">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Badge className="bg-red-100 text-red-800 px-3 py-1">NEW FEATURE</Badge>
              </div>
              <CardTitle className="text-2xl text-red-900 flex items-center justify-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Match Performance Analytics
              </CardTitle>
              <CardDescription className="text-red-700 text-lg">
                Comprehensive match analysis with AI-powered insights and detailed performance breakdowns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-red-800">6</div>
                  <div className="text-sm text-red-600">Analysis Sections</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-red-800">86%</div>
                  <div className="text-sm text-red-600">Team Tackle Success</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-red-800">98%</div>
                  <div className="text-sm text-red-600">Carry Efficiency</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-red-800">32-24</div>
                  <div className="text-sm text-red-600">Latest Result</div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-red-900 mb-3">Match Analysis Features:</h4>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Possession & Territory Control Analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Attack Efficiency & Gainline Success</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Defensive Structure & Tackle Analysis</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-900 mb-3">AI-Powered Insights:</h4>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Breakdown Speed & Ruck Retention</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Set Piece Performance Analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Individual Player Contributions</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/match-performance">
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    View Match Analytics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player Value Analysis */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="border-2 border-dashed border-green-300 bg-green-50">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Badge className="bg-green-100 text-green-800 px-3 py-1">NEW</Badge>
              </div>
              <CardTitle className="text-xl text-green-900">Player Value Analysis</CardTitle>
              <CardDescription className="text-green-700">
                Comprehensive player value assessment using advanced analytics and cohesion metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-800">3</div>
                  <div className="text-green-600">Players Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-800">$290k</div>
                  <div className="text-green-600">Total Contract Value</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-800">85.4%</div>
                  <div className="text-green-600">Avg Work Efficiency</div>
                </div>
              </div>
              <p className="text-sm text-green-700 mb-4">
                Analyze James Parsons, Bryn Gatland, and Lotu Inisi with comprehensive value calculations including WEI, cohesion impact, and position-specific assessments.
              </p>
              <Link href="/moneyball">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  View Player Value Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Experimental Features */}
        <div className="mt-8 max-w-4xl mx-auto">
          <Card className="border-2 border-dashed border-purple-300 bg-purple-50">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Badge className="bg-purple-100 text-purple-800 px-3 py-1">EXPERIMENTAL</Badge>
              </div>
              <CardTitle className="text-xl text-purple-900">Enhanced Player Profile</CardTitle>
              <CardDescription className="text-purple-700">
                Test the enhanced player profile with improved analytics and modern design
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-purple-700 mb-4">
                Try the experimental player profile for Penaia Cakobau to see new features without affecting your existing dashboard.
              </p>
              <Link href="/experimental/player/penaia_cakobau">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Try Experimental Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Overview */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card className="text-center p-4">
            <CardContent className="pt-2">
              <div className="text-2xl font-bold text-nh-red">47</div>
              <div className="text-sm text-gray-600">Active Players</div>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent className="pt-2">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">Matches Played</div>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent className="pt-2">
              <div className="text-2xl font-bold text-blue-600">89%</div>
              <div className="text-sm text-gray-600">Fitness Level</div>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent className="pt-2">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-gray-600">Injuries This Week</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-12 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock size={20} />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Training Session Completed</span>
                </div>
                <div className="text-sm text-gray-500">2 hours ago</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">New Player Performance Report</span>
                </div>
                <div className="text-sm text-gray-500">4 hours ago</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">Match Analysis Updated</span>
                </div>
                <div className="text-sm text-gray-500">6 hours ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}