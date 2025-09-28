import { useQuery } from "@tanstack/react-query";
import { UserRole, Permission, hasPermission, getRolePermissions } from "@shared/permissions";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  department?: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    hasPermission: (permission: Permission) => 
      user ? hasPermission(user.role, permission) : false,
    canAccess: (requiredRole: UserRole) => 
      user?.role === requiredRole || user?.role === "admin",
    isRole: (role: UserRole) => user?.role === role,
    isCoach: () => user?.role === "head_coach" || user?.role === "assistant_coach",
    isMedical: () => user?.role === "medical_staff" || user?.role === "physiotherapist",
    isAdmin: () => user?.role === "admin",
  };
}

// Mock authentication data for demo purposes
export const DEMO_USERS: Record<string, AuthUser> = {
  jimmy_maher: {
    id: 1,
    username: "jimmy_maher",
    email: "jimmy@northharbour.co.nz",
    firstName: "Jimmy",
    lastName: "Maher",
    role: "head_coach",
    department: "Coaching",
    permissions: getRolePermissions("head_coach"),
    isActive: true,
  },
  nick_marquet: {
    id: 2,
    username: "nick_marquet",
    email: "nick@northharbour.co.nz",
    firstName: "Nick",
    lastName: "Marquet",
    role: "strength_coach",
    department: "Performance",
    permissions: getRolePermissions("strength_coach"),
    isActive: true,
  },
  matt_wenham: {
    id: 3,
    username: "matt_wenham",
    email: "matt@northharbour.co.nz",
    firstName: "Matt",
    lastName: "Wenham",
    role: "physiotherapist",
    department: "Medical",
    permissions: getRolePermissions("physiotherapist"),
    isActive: true,
  },
  analyst_user: {
    id: 4,
    username: "analyst",
    email: "analyst@northharbour.co.nz",
    firstName: "Performance",
    lastName: "Analyst",
    role: "analyst",
    department: "Performance",
    permissions: getRolePermissions("analyst"),
    isActive: true,
  },
  admin_user: {
    id: 5,
    username: "admin",
    email: "admin@northharbour.co.nz",
    firstName: "System",
    lastName: "Administrator",
    role: "admin",
    department: "Administration",
    permissions: getRolePermissions("admin"),
    isActive: true,
  }
};