import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, User, Menu } from "lucide-react";
import logoPath from "@assets/menulogo_wo.png";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface NavigationHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  backButton?: {
    label: string;
    href: string;
  };
  actions?: React.ReactNode;
  showRoleButton?: boolean;
}

export default function NavigationHeader({
  title,
  breadcrumbs = [],
  backButton,
  actions,
  showRoleButton = true
}: NavigationHeaderProps) {
  const [location] = useLocation();

  return (
    <div className="bg-nh-red text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo, Title, Navigation */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/">
              <img src={logoPath} alt="North Harbour Rugby" className="h-10 w-10" />
            </Link>

            {/* Back Button */}
            {backButton && (
              <Link href={backButton.href}>
                <Button variant="ghost" className="text-white hover:bg-nh-red-600">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {backButton.label}
                </Button>
              </Link>
            )}

            {/* Title and Breadcrumbs */}
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              {breadcrumbs.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-nh-red-200 mt-1">
                  <span className="text-nh-red-200">Home</span>
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span>›</span>
                      {crumb.href ? (
                        <Link href={crumb.href} className="hover:text-white">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-white">{crumb.label}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2">
            {actions}
            
            {showRoleButton && (
              <Link href="/">
                <Button variant="outline" className="text-nh-red bg-white hover:bg-gray-100">
                  <User className="w-4 h-4 mr-2" />
                  Role Selection
                </Button>
              </Link>
            )}

            <Link href="/">
              <Button variant="outline" className="text-nh-red bg-white hover:bg-gray-100">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Access Navigation Component for sections
interface QuickNavProps {
  section: 'players' | 'team' | 'analytics' | 'medical' | 'admin';
  currentPath: string;
}

export function QuickNavigation({ section, currentPath }: QuickNavProps) {
  const navItems = {
    players: [
      { label: "Players Overview", href: "/players" },
      { label: "Player Search", href: "/players?search=true" },
      { label: "Player Analytics", href: "/analytics/performance" }
    ],
    team: [
      { label: "Team Dashboard", href: "/team" },
      { label: "Team Cohesion", href: "/team-cohesion" },
      { label: "Squad Builder", href: "/squad-builder" }
    ],
    analytics: [
      { label: "Analytics Hub", href: "/analytics" },
      { label: "Match Analysis", href: "/analytics/matches" },
      { label: "Performance", href: "/performance-analytics" },
      { label: "Fitness", href: "/fitness-analytics" }
    ],
    medical: [
      { label: "Medical Hub", href: "/medical" },
      { label: "Injury Tracking", href: "/medical?tab=injuries" },
      { label: "Wellness Monitoring", href: "/medical?tab=wellness" }
    ],
    admin: [
      { label: "Data Management", href: "/data-management" },
      { label: "CSV Upload", href: "/csv-upload" },
      { label: "Database Admin", href: "/database-admin" }
    ]
  };

  const items = navItems[section] || [];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="container mx-auto">
        <div className="flex items-center gap-4 overflow-x-auto">
          {items.map((item, index) => (
            <Link key={index} href={item.href}>
              <Button 
                variant={currentPath === item.href ? "default" : "ghost"}
                size="sm"
                className="whitespace-nowrap"
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}