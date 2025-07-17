import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserRole, Permission } from "../constants/authTypes";
import Unauthorized from "./Unauthorized";

interface WithAuthOptions {
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAllRoles?: boolean;
  requireAllPermissions?: boolean;
  fallbackComponent?: React.ComponentType;
  redirectTo?: string;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    requiredRoles = [],
    requiredPermissions = [],
    requireAllRoles = false,
    requireAllPermissions = true,
    fallbackComponent: FallbackComponent = Unauthorized,
  } = options;

  const WithAuthComponent: React.FC<P> = (props) => {
    const {
      isAuthenticated,
      hasAnyRole,
      hasAllRoles,
      hasPermission,
      checkPermissions,
    } = useAuth();

    // Check authentication
    if (!isAuthenticated) {
      return <FallbackComponent />;
    }

    // Check role requirements
    if (requiredRoles.length > 0) {
      const hasRequiredRoles = requireAllRoles
        ? hasAllRoles(requiredRoles)
        : hasAnyRole(requiredRoles);

      if (!hasRequiredRoles) {
        return <FallbackComponent />;
      }
    }

    // Check permission requirements
    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = requireAllPermissions
        ? checkPermissions(requiredPermissions)
        : requiredPermissions.some((permission) => hasPermission(permission));

      if (!hasRequiredPermissions) {
        return <FallbackComponent />;
      }
    }

    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  WithAuthComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return WithAuthComponent;
}

export default withAuth;
