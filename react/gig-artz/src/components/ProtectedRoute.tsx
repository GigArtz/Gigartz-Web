import React, { memo, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole, Permission } from "../constants/authTypes";
import Loader from "./Loader";

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
  const authChecks = useMemo(
    () => ({
      needsAuth: requireAuth && !isAuthenticated,
      hasRequiredRoles:
        requiredRoles.length > 0
          ? requireAllRoles
            ? hasAllRoles(requiredRoles)
            : hasAnyRole(requiredRoles)
          : true,
      hasRequiredPermissions:
        requiredPermissions.length > 0
          ? requireAllPermissions
            ? checkPermissions(requiredPermissions)
            : requiredPermissions.some((permission) =>
                hasPermission(permission)
              )
          : true,
    }),
    [
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
    ]
  );

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark">
        <Loader />
      </div>
    );
  }

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
