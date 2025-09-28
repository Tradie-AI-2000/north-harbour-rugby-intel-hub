import { Link } from "wouter";
import logoPath from "@assets/menulogo_wo.png";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Stethoscope,
  BarChart3,
  Shield,
  UserCheck,
  Activity,
  Target,
  ArrowRight,
  ArrowLeft,
  Home,
  Database,
  FileText,
  Settings,
} from "lucide-react";

const roles = [
  {
    id: "coach",
    title: "Coaching Staff",
    description:
      "Access team analytics, player performance data, and tactical insights",
    icon: Users,
    color: "bg-red-600 hover:bg-red-700",
    route: "/team",
    features: [
      "Team performance analytics",
      "Player selection insights",
      "Match preparation tools",
      "Squad management",
    ],
  },
  {
    id: "medical",
    title: "Medical Staff",
    description: "Manage player health, injuries, and return-to-play protocols",
    icon: Stethoscope,
    color: "bg-blue-600 hover:bg-blue-700",
    route: "/medical-hub",
    features: [
      "Injury tracking & treatment",
      "Return-to-play planning",
      "Wellness monitoring",
      "Medical communications",
    ],
  },
  {
    id: "analyst",
    title: "Performance Analyst",
    description: "Deep dive into performance metrics and data analysis",
    icon: BarChart3,
    color: "bg-green-600 hover:bg-green-700",
    route: "/analytics",
    features: [
      "Advanced performance metrics",
      "GPS data analysis",
      "Statistical modeling",
      "Report generation",
    ],
  },
  {
    id: "strength",
    title: "Strength & Conditioning",
    description:
      "Monitor fitness levels, training loads, and physical development",
    icon: Activity,
    color: "bg-purple-600 hover:bg-purple-700",
    route: "/sc-portal",
    features: [
      "Training load management",
      "Fitness assessments",
      "Physical development tracking",
      "Injury prevention",
    ],
  },
];

export default function RoleSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50">
      {/* Navigation Header */}
      <div className="bg-nh-red text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-nh-red-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <img
                src={logoPath}
                alt="North Harbour Rugby"
                className="h-10 w-10"
              />
              <div>
                <h1 className="text-2xl font-bold">Role Selection</h1>
                <div className="flex items-center gap-2 text-sm text-nh-red-200">
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                  <span>›</span>
                  <span className="text-white">Role Selection</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button
                  variant="outline"
                  className="text-nh-red bg-white hover:bg-gray-100"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                North Harbour Rugby
              </h2>
              <p className="text-gray-600">Performance Management System</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Select Your Role
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to access the appropriate tools and data for your
            responsibilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card
                key={role.id}
                className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-gray-300"
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 rounded-full ${role.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">
                      Key Features:
                    </h4>
                    <ul className="space-y-1">
                      {role.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={role.route}>
                    <Button
                      className={`w-full ${role.color} text-white py-3 text-lg font-semibold transition-all duration-200`}
                    >
                      Access {role.title} Portal
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Data Management Section */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-xl shadow-lg max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">
                Data Management Hub
              </h3>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                Essential tools for data templates, configuration, and system
                management. Perfect for administrators and technical staff.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Data Templates</CardTitle>
                  <CardDescription className="text-gray-300">
                    CSV templates, field definitions, and import formats for all
                    data types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/data-templates">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Access Templates Hub
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Data Integration</CardTitle>
                  <CardDescription className="text-gray-300">
                    Configure API integrations, upload data, and manage system
                    connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/data-integration">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Manage Integrations
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-3">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">System Config</CardTitle>
                  <CardDescription className="text-gray-300">
                    Team settings, performance thresholds, and system
                    configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/data-templates#configuration">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Configure System
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="mt-12 text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Access
            </h3>
            <p className="text-gray-600 mb-6">
              Need to access general information or player profiles? Use these
              quick links.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/players">
                <Button variant="outline" className="flex items-center">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Player Profiles
                </Button>
              </Link>
              <Link href="/try-analysis">
                <Button variant="outline" className="flex items-center">
                  <Target className="mr-2 h-4 w-4" />
                  Try Analysis Pitch
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center">
                  <Target className="mr-2 h-4 w-4" />
                  Main Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
