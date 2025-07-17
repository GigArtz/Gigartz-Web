import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Permission } from '../constants/authTypes';
import { logout, User } from '../../store/authSlice';
import { UserProfile } from '../../store/profileSlice';

export interface AuthUtils {
    // Auth state
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    userProfile: UserProfile | null;
    userRoles: UserRole[];

    // Role checks
    isGeneralUser: boolean;
    isFreelancer: boolean;
    isAdmin: boolean;
    isModerator: boolean;

    // Permission checks
    canViewEvents: boolean;
    canCreateEvents: boolean;
    canEditEvents: boolean;
    canDeleteEvents: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canManageBookings: boolean;
    canModerateContent: boolean;

    // Auth actions
    handleLogout: () => void;
    redirectIfUnauthorized: (requiredRoles?: UserRole[], requiredPermissions?: Permission[]) => boolean;
    requireAuth: (callback: () => void) => void;
    requireRole: (role: UserRole, callback: () => void) => void;
    requirePermission: (permission: Permission, callback: () => void) => void;
}

export const useAuthUtils = (): AuthUtils => {
    const auth = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        isAuthenticated,
        isLoading,
        user,
        userProfile,
        userRoles,
        hasRole,
        hasPermission,
        hasAnyRole,
        checkPermissions,
    } = auth;

    // Role checks - memoized to prevent re-computation
    const isGeneralUser = useMemo(() => hasRole(UserRole.GENERAL_USER), [hasRole]);
    const isFreelancer = useMemo(() => hasRole(UserRole.FREELANCER), [hasRole]);
    const isAdmin = useMemo(() => hasRole(UserRole.ADMIN), [hasRole]);
    const isModerator = useMemo(() => hasRole(UserRole.MODERATOR), [hasRole]);

    // Permission checks - memoized to prevent re-computation
    const canViewEvents = useMemo(() => hasPermission(Permission.VIEW_EVENTS), [hasPermission]);
    const canCreateEvents = useMemo(() => hasPermission(Permission.CREATE_EVENTS), [hasPermission]);
    const canEditEvents = useMemo(() => hasPermission(Permission.EDIT_EVENTS), [hasPermission]);
    const canDeleteEvents = useMemo(() => hasPermission(Permission.DELETE_EVENTS), [hasPermission]);
    const canManageUsers = useMemo(() => hasPermission(Permission.MANAGE_USERS), [hasPermission]);
    const canViewAnalytics = useMemo(() => hasPermission(Permission.VIEW_ANALYTICS), [hasPermission]);
    const canManageBookings = useMemo(() => hasPermission(Permission.MANAGE_BOOKINGS), [hasPermission]);
    const canModerateContent = useMemo(() => hasPermission(Permission.MODERATE_CONTENT), [hasPermission]);

    // Handle logout
    const handleLogout = useCallback(() => {
        dispatch(logout());
        navigate('/', { replace: true });
    }, [dispatch, navigate]);

    // Check if user should be redirected due to lack of authorization
    const redirectIfUnauthorized = useCallback((
        requiredRoles: UserRole[] = [],
        requiredPermissions: Permission[] = []
    ): boolean => {
        if (!isAuthenticated) {
            navigate('/', { replace: true });
            return true;
        }

        if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
            navigate('/unauthorized', { replace: true });
            return true;
        }

        if (requiredPermissions.length > 0 && !checkPermissions(requiredPermissions)) {
            navigate('/unauthorized', { replace: true });
            return true;
        }

        return false;
    }, [isAuthenticated, hasAnyRole, checkPermissions, navigate]);

    // Require authentication before executing callback
    const requireAuth = useCallback((callback: () => void) => {
        if (isAuthenticated) {
            callback();
        } else {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Require specific role before executing callback
    const requireRole = useCallback((role: UserRole, callback: () => void) => {
        if (isAuthenticated && hasRole(role)) {
            callback();
        } else if (!isAuthenticated) {
            navigate('/', { replace: true });
        } else {
            navigate('/unauthorized', { replace: true });
        }
    }, [isAuthenticated, hasRole, navigate]);

    // Require specific permission before executing callback
    const requirePermission = useCallback((permission: Permission, callback: () => void) => {
        if (isAuthenticated && hasPermission(permission)) {
            callback();
        } else if (!isAuthenticated) {
            navigate('/', { replace: true });
        } else {
            navigate('/unauthorized', { replace: true });
        }
    }, [isAuthenticated, hasPermission, navigate]);

    return useMemo(() => ({
        // Auth state
        isAuthenticated,
        isLoading,
        user,
        userProfile,
        userRoles,

        // Role checks
        isGeneralUser,
        isFreelancer,
        isAdmin,
        isModerator,

        // Permission checks
        canViewEvents,
        canCreateEvents,
        canEditEvents,
        canDeleteEvents,
        canManageUsers,
        canViewAnalytics,
        canManageBookings,
        canModerateContent,

        // Auth actions
        handleLogout,
        redirectIfUnauthorized,
        requireAuth,
        requireRole,
        requirePermission,
    }), [
        isAuthenticated,
        isLoading,
        user,
        userProfile,
        userRoles,
        isGeneralUser,
        isFreelancer,
        isAdmin,
        isModerator,
        canViewEvents,
        canCreateEvents,
        canEditEvents,
        canDeleteEvents,
        canManageUsers,
        canViewAnalytics,
        canManageBookings,
        canModerateContent,
        handleLogout,
        redirectIfUnauthorized,
        requireAuth,
        requireRole,
        requirePermission,
    ]);
};

export default useAuthUtils;
