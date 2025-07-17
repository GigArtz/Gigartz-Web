import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserRole, Permission } from "../constants/authTypes";
import Unauthorized from "./Unauthorized";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAllRoles?: boolean;
  requireAllPermissions?: boolean;
  fallbackComponent?: React.ComponentType;
  showFallback?: boolean;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  requireAllRoles = false,
  requireAllPermissions = true,
  fallbackComponent: FallbackComponent = Unauthorized,
  showFallback = true,
}) => {
  const {
    isAuthenticated,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    checkPermissions,
  } = useAuth();

  // If user is not authenticated, don't render anything
  if (!isAuthenticated) {
    return showFallback ? <FallbackComponent /> : null;
  }

  // Check role requirements
  if (allowedRoles.length > 0) {
    const hasRequiredRoles = requireAllRoles
      ? hasAllRoles(allowedRoles)
      : hasAnyRole(allowedRoles);

    if (!hasRequiredRoles) {
      return showFallback ? <FallbackComponent /> : null;
    }
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAllPermissions
      ? checkPermissions(requiredPermissions)
      : requiredPermissions.some((permission) => hasPermission(permission));

    if (!hasRequiredPermissions) {
      return showFallback ? <FallbackComponent /> : null;
    }
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
