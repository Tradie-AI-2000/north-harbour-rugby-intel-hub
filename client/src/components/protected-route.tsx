import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRole, Permission, hasPermission } from "@shared/permissions";
import { Shield, Lock, AlertTriangle } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: Permission;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission, 
  fallback 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, hasPermission, canAccess } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <Lock className="mx-auto mb-4 text-gray-400" size={48} />
          <CardTitle className="text-xl text-gray-700">Authentication Required</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">Please select your role to access this content.</p>
        </CardContent>
      </Card>
    );
  }

  const hasRequiredRole = requiredRole ? canAccess(requiredRole) : true;
  const hasRequiredPermission = requiredPermission ? hasPermission(requiredPermission) : true;

  if (!hasRequiredRole || !hasRequiredPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="max-w-md mx-auto mt-8 border-red-200">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <CardTitle className="text-xl text-red-700">Access Restricted</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            This feature requires {requiredRole ? 'specific role access' : 'additional permissions'}.
          </p>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-500">Your current access level:</div>
            <Badge variant="secondary" className="text-sm">
              {user.role.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {requiredRole && (
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Required role:</div>
              <Badge variant="destructive" className="text-sm">
                {requiredRole.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          )}

          {requiredPermission && (
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Required permission:</div>
              <Badge variant="destructive" className="text-sm">
                {requiredPermission.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Contact your administrator if you believe you should have access to this feature.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

// Role-specific access indicator component
interface RoleIndicatorProps {
  currentRole: UserRole;
  requiredRole?: UserRole;
  requiredPermission?: Permission;
}

export function RoleIndicator({ currentRole, requiredRole, requiredPermission }: RoleIndicatorProps) {
  const roleColors = {
    head_coach: "bg-red-100 text-red-800 border-red-200",
    assistant_coach: "bg-blue-100 text-blue-800 border-blue-200",
    strength_coach: "bg-green-100 text-green-800 border-green-200",
    medical_staff: "bg-purple-100 text-purple-800 border-purple-200",
    physiotherapist: "bg-purple-100 text-purple-800 border-purple-200",
    team_manager: "bg-orange-100 text-orange-800 border-orange-200",
    analyst: "bg-cyan-100 text-cyan-800 border-cyan-200",
    admin: "bg-gray-100 text-gray-800 border-gray-200",
    player: "bg-yellow-100 text-yellow-800 border-yellow-200"
  };

  return (
    <div className="flex items-center space-x-2">
      <Shield size={16} className="text-gray-500" />
      <Badge className={`${roleColors[currentRole]} text-xs`}>
        {currentRole.replace('_', ' ').toUpperCase()}
      </Badge>
      {(requiredRole || requiredPermission) && (
        <span className="text-xs text-gray-500">
          - Access Level Required
        </span>
      )}
    </div>
  );
}