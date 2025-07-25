import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store/store";
import { User } from "../../store/authSlice";
import { UserProfile } from "../../store/profileSlice";
import { UserRole, Permission, rolePermissions } from "../constants/authTypes";

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRoles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
  checkPermissions: (permissions: Permission[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Use shallow equality for all selectors to prevent unnecessary re-renders
  const user = useSelector((state: RootState) => state.auth.user, shallowEqual);
  const userProfile = useSelector(
    (state: RootState) => state.profile.userProfile,
    shallowEqual
  );
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const profileLoading = useSelector(
    (state: RootState) => state.profile.loading
  );

  const [isLoading, setIsLoading] = useState(true);

  // Determine loading state with memoization to prevent unnecessary updates
  const computedLoading = useMemo(() => {
    return authLoading || profileLoading;
  }, [authLoading, profileLoading]);

  useEffect(() => {
    setIsLoading(computedLoading);
  }, [computedLoading]);

  // Fallback timeout to prevent infinite loading states
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Loading timeout reached, forcing loading state to false");
        setIsLoading(false);
      }
    }, 20000); // 20 second fallback timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Get user roles from profile
  const getUserRoles = (): UserRole[] => {
    // Default to GENERAL_USER role if user is authenticated but no profile or roles exist
    if (!userProfile) return [UserRole.GENERAL_USER];

    // If roles object doesn't exist on profile, provide default role
    if (!userProfile.roles) return [UserRole.GENERAL_USER];

    const roles: UserRole[] = [];

    // Check for explicitly set roles based on your profile structure
    if (userProfile.roles.generalUser) {
      roles.push(UserRole.GENERAL_USER);
    }

    if (userProfile.roles.freelancer) {
      roles.push(UserRole.FREELANCER);
    }

    if (userProfile.roles.admin) {
      roles.push(UserRole.ADMIN);
    }

    // Always ensure at least GENERAL_USER role if any profile exists
    if (roles.length === 0) {
      roles.push(UserRole.GENERAL_USER);
    }

    console.log("Current user roles:", roles);
    return roles;
  };

  const userRoles = getUserRoles();
  const isAuthenticated = !!user;

  // Check if user has a specific role
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return userRoles.includes(role);
    },
    [userRoles]
  );

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      return roles.some((role) => userRoles.includes(role));
    },
    [userRoles]
  );

  // Check if user has all of the specified roles
  const hasAllRoles = useCallback(
    (roles: UserRole[]): boolean => {
      return roles.every((role) => userRoles.includes(role));
    },
    [userRoles]
  );

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      // Special case: VIEW_EVENTS permission is available to all authenticated users
      if (permission === Permission.VIEW_EVENTS && isAuthenticated) {
        return true;
      }

      const hasPermission = userRoles.some((role) =>
        rolePermissions[role]?.includes(permission)
      );

      console.log(`Checking permission ${permission}:`, {
        userRoles,
        hasPermission,
      });

      return hasPermission;
    },
    [userRoles, isAuthenticated]
  );

  // Check if user has all specified permissions
  const checkPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.every((permission) => hasPermission(permission));
    },
    [hasPermission]
  );

  const value: AuthContextType = useMemo(
    () => ({
      user,
      userProfile,
      isLoading,
      isAuthenticated,
      userRoles,
      hasRole,
      hasPermission,
      hasAnyRole,
      hasAllRoles,
      checkPermissions,
    }),
    [
      user,
      userProfile,
      isLoading,
      isAuthenticated,
      userRoles,
      hasRole,
      hasPermission,
      hasAnyRole,
      hasAllRoles,
      checkPermissions,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
