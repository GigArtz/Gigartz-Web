import React, { memo, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole, Permission } from "../constants/authTypes";
//import Loader from "./Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAllRoles?: boolean;
  requireAllPermissions?: boolean;
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  requireAllRoles = false,
  requireAllPermissions = true,
  fallbackPath,
  showUnauthorized = true,
}) => {
  const {
    isAuthenticated,
    isLoading,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    checkPermissions,
  } = useAuth();
  const location = useLocation();

  // Memoize auth checks to prevent unnecessary recalculations
  const authChecks = useMemo(() => {
    // Special case: Always allow access to events if authenticated
    const isViewEventsPermission =
      requiredPermissions.length === 1 &&
      requiredPermissions.includes(Permission.VIEW_EVENTS);

    return {
      needsAuth: requireAuth && !isAuthenticated,
      hasRequiredRoles:
        requiredRoles.length > 0
          ? requireAllRoles
            ? hasAllRoles(requiredRoles)
            : hasAnyRole(requiredRoles)
          : true,
      // Special handling for VIEW_EVENTS permission - allow for all authenticated users
      hasRequiredPermissions: isViewEventsPermission
        ? isAuthenticated // Only check if authenticated for view events
        : requiredPermissions.length > 0
        ? requireAllPermissions
          ? checkPermissions(requiredPermissions)
          : requiredPermissions.some((permission) => hasPermission(permission))
        : true,
    };
  }, [
    requireAuth,
    isAuthenticated,
    requiredRoles,
    requiredPermissions,
    requireAllRoles,
    requireAllPermissions,
    hasAllRoles,
    hasAnyRole,
    checkPermissions,
    hasPermission,
  ]);

  // Allow child components to handle their own loading states
  // Pass isLoading as a prop if needed, or render children regardless
  // Remove global loader override

  // Check authentication requirement
  if (authChecks.needsAuth) {
    return (
      <Navigate to={fallbackPath || "/"} state={{ from: location }} replace />
    );
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !authChecks.hasRequiredRoles) {
    if (showUnauthorized) {
      return <Navigate to="/unauthorized" replace />;
    }
    return (
      <Navigate
        to={fallbackPath || "/home"}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check permission requirements
  if (requiredPermissions.length > 0 && !authChecks.hasRequiredPermissions) {
    console.log("Permission check failed:", {
      requiredPermissions,
      path: location.pathname,
      hasRequiredPermissions: authChecks.hasRequiredPermissions,
    });

    // Special case for VIEW_EVENTS - allow it for all users
    if (
      requiredPermissions.length === 1 &&
      requiredPermissions.includes(Permission.VIEW_EVENTS) &&
      isAuthenticated
    ) {
      console.log("Allowing access to view events for authenticated user");
      return <>{children}</>;
    }

    if (showUnauthorized) {
      return <Navigate to="/unauthorized" replace />;
    }
    return (
      <Navigate
        to={fallbackPath || "/home"}
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default memo(ProtectedRoute);
