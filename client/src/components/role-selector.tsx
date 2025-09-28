import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole, ROLE_DEPARTMENTS, getRolePermissions } from "@shared/permissions";
import { DEMO_USERS, AuthUser } from "@/hooks/useAuth";
import { 
  User, 
  Shield, 
  Stethoscope, 
  TrendingUp, 
  Users, 
  Settings,
  Activity,
  FileText,
  Crown
} from "lucide-react";

interface RoleSelectorProps {
  onRoleSelect: (user: AuthUser) => void;
}

export default function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  const [selectedUser, setSelectedUser] = useState<string>("");

  const roleIcons = {
    head_coach: Crown,
    assistant_coach: User,
    strength_coach: Activity,
    medical_staff: Stethoscope,
    physiotherapist: Stethoscope,
    team_manager: Users,
    analyst: TrendingUp,
    admin: Settings,
    player: User
  };

  const roleColors = {
    head_coach: "bg-red-100 text-red-800",
    assistant_coach: "bg-blue-100 text-blue-800",
    strength_coach: "bg-green-100 text-green-800",
    medical_staff: "bg-purple-100 text-purple-800",
    physiotherapist: "bg-purple-100 text-purple-800",
    team_manager: "bg-orange-100 text-orange-800",
    analyst: "bg-cyan-100 text-cyan-800",
    admin: "bg-gray-100 text-gray-800",
    player: "bg-yellow-100 text-yellow-800"
  };

  const handleRoleSelect = (username: string) => {
    const user = DEMO_USERS[username];
    if (user) {
      onRoleSelect(user);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-nh-red">
          Select Your Role
        </CardTitle>
        <CardDescription className="text-lg">
          Choose your role to access the appropriate features and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your role and user account" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DEMO_USERS).map(([username, user]) => {
              const IconComponent = roleIcons[user.role];
              return (
                <SelectItem key={username} value={username}>
                  <div className="flex items-center space-x-3 py-1">
                    <IconComponent size={16} />
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500 capitalize">
                        {user.role.replace('_', ' ')} - {user.department}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {selectedUser && (
          <div className="space-y-4">
            <Card className="border-2 border-nh-red">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const user = DEMO_USERS[selectedUser];
                      const IconComponent = roleIcons[user.role];
                      return (
                        <>
                          <IconComponent size={24} className="text-nh-red" />
                          <div>
                            <div className="font-semibold text-lg">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-gray-600">{user.email}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <Badge className={roleColors[DEMO_USERS[selectedUser].role]}>
                    {DEMO_USERS[selectedUser].role.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Department:</div>
                    <div className="text-gray-600">{DEMO_USERS[selectedUser].department}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Access Permissions:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {DEMO_USERS[selectedUser].permissions.slice(0, 6).map((permission) => (
                        <div key={permission} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {permission.replace('_', ' ')}
                        </div>
                      ))}
                      {DEMO_USERS[selectedUser].permissions.length > 6 && (
                        <div className="text-xs bg-gray-200 px-2 py-1 rounded text-center">
                          +{DEMO_USERS[selectedUser].permissions.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => handleRoleSelect(selectedUser)}
              className="w-full bg-nh-red hover:bg-red-700 text-white py-3 text-lg font-semibold"
            >
              Continue as {DEMO_USERS[selectedUser].firstName} {DEMO_USERS[selectedUser].lastName}
            </Button>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Shield className="text-blue-600 mt-1" size={16} />
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">Role-Based Access Control</div>
              <div className="text-blue-700">
                Each role has specific permissions tailored to their responsibilities. 
                This ensures data security and provides relevant tools for each team member.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}