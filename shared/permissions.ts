// Role-based access control system for North Harbour Rugby

export type UserRole = 
  | "head_coach" 
  | "assistant_coach" 
  | "strength_coach" 
  | "medical_staff" 
  | "physiotherapist" 
  | "team_manager" 
  | "analyst" 
  | "admin" 
  | "player";

export type Permission = 
  | "view_all_players"
  | "edit_player_data"
  | "manage_training_programs"
  | "access_medical_data"
  | "manage_injuries"
  | "view_financial_data"
  | "manage_users"
  | "export_reports"
  | "live_match_analytics"
  | "tactical_analysis"
  | "video_analysis"
  | "team_communications"
  | "schedule_management"
  | "performance_analytics"
  | "ai_insights"
  | "squad_selection";

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  head_coach: [
    "view_all_players",
    "edit_player_data",
    "manage_training_programs",
    "access_medical_data",
    "export_reports",
    "live_match_analytics",
    "tactical_analysis",
    "video_analysis",
    "team_communications",
    "schedule_management",
    "performance_analytics",
    "ai_insights",
    "squad_selection"
  ],
  assistant_coach: [
    "view_all_players",
    "edit_player_data",
    "manage_training_programs",
    "live_match_analytics",
    "tactical_analysis",
    "video_analysis",
    "team_communications",
    "performance_analytics",
    "ai_insights"
  ],
  strength_coach: [
    "view_all_players",
    "edit_player_data",
    "manage_training_programs",
    "performance_analytics",
    "export_reports",
    "team_communications"
  ],
  medical_staff: [
    "view_all_players",
    "access_medical_data",
    "manage_injuries",
    "export_reports",
    "team_communications",
    "performance_analytics"
  ],
  physiotherapist: [
    "view_all_players",
    "access_medical_data",
    "manage_injuries",
    "team_communications",
    "performance_analytics"
  ],
  team_manager: [
    "view_all_players",
    "schedule_management",
    "team_communications",
    "export_reports",
    "view_financial_data"
  ],
  analyst: [
    "view_all_players",
    "live_match_analytics",
    "tactical_analysis",
    "video_analysis",
    "performance_analytics",
    "ai_insights",
    "export_reports"
  ],
  admin: [
    "view_all_players",
    "edit_player_data",
    "manage_training_programs",
    "access_medical_data",
    "manage_injuries",
    "view_financial_data",
    "manage_users",
    "export_reports",
    "live_match_analytics",
    "tactical_analysis",
    "video_analysis",
    "team_communications",
    "schedule_management",
    "performance_analytics",
    "ai_insights",
    "squad_selection"
  ],
  player: [
    "performance_analytics",
    "team_communications"
  ]
};

// Role hierarchy for access escalation
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  player: 1,
  physiotherapist: 2,
  medical_staff: 3,
  analyst: 4,
  strength_coach: 5,
  team_manager: 5,
  assistant_coach: 6,
  head_coach: 8,
  admin: 10
};

// Department mappings
export const ROLE_DEPARTMENTS: Record<UserRole, string> = {
  head_coach: "Coaching",
  assistant_coach: "Coaching", 
  strength_coach: "Performance",
  medical_staff: "Medical",
  physiotherapist: "Medical",
  team_manager: "Administration",
  analyst: "Performance",
  admin: "Administration",
  player: "Playing Squad"
};

// Helper functions
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

export function canAccessRole(userRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole];
}

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function getRoleDepartment(role: UserRole): string {
  return ROLE_DEPARTMENTS[role];
}

// User interface for authentication
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

// Permission check decorator for components
export function requiresPermission(permission: Permission) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      // This would be used with authentication context
      // const user = useAuth(); 
      // if (!hasPermission(user.role, permission)) {
      //   throw new Error(`Permission denied: ${permission}`);
      // }
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}