// Auth Context
export { AuthProvider, useAuth } from '../contexts/AuthContext';
export { UserRole, Permission } from '../constants/authTypes';

// Auth Components
export { default as ProtectedRoute } from '../components/ProtectedRoute';
export { default as RoleBasedRoute } from '../components/RoleBasedRoute';
export { default as PermissionGuard } from '../components/PermissionGuard';
export { default as AuthRedirect } from '../components/AuthRedirect';
export { default as AuthLoading } from '../components/AuthLoading';
export { default as Unauthorized } from '../components/Unauthorized';
export { default as NotFound } from '../components/NotFound';
export { default as withAuth } from '../components/withAuth';

// Auth Hooks
export { useAuthUtils } from '../hooks/useAuthUtils';
export type { AuthUtils } from '../hooks/useAuthUtils';

// Example component (for development/testing)
export { default as AuthExamples } from '../components/AuthExamples';
