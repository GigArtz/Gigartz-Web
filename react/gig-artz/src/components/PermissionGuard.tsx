import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserRole, Permission } from "../constants/authTypes";

interface PermissionGuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: Permission[];
  requireAllRoles?: boolean;
  requireAllPermissions?: boolean;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  roles = [],
  permissions = [],
  requireAllRoles = false,
  requireAllPermissions = true,
  fallback = null,
  showFallback = false,
}) => {
  const {
    isAuthenticated,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    checkPermissions,
  } = useAuth();

  // If user is not authenticated, don't show content
  if (!isAuthenticated) {
    return showFallback ? <>{fallback}</> : null;
  }

  // Check role requirements
  if (roles.length > 0) {
    const hasRequiredRoles = requireAllRoles
      ? hasAllRoles(roles)
      : hasAnyRole(roles);

    if (!hasRequiredRoles) {
      return showFallback ? <>{fallback}</> : null;
    }
  }

  // Check permission requirements
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAllPermissions
      ? checkPermissions(permissions)
      : permissions.some((permission) => hasPermission(permission));

    if (!hasRequiredPermissions) {
      return showFallback ? <>{fallback}</> : null;
    }
  }

  return <>{children}</>;
};

export default PermissionGuard;
