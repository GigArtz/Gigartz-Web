// Define user roles
export enum UserRole {
    NORMAL = 'normal',
    PRO = 'pro',
    ADMIN = 'admin'
}

// Define permissions
export enum Permission {
    VIEW_EVENTS = 'view_events',
    CREATE_EVENTS = 'create_events',
    EDIT_EVENTS = 'edit_events',
    DELETE_EVENTS = 'delete_events',
    MANAGE_USERS = 'manage_users',
    VIEW_ANALYTICS = 'view_analytics',
    MANAGE_BOOKINGS = 'manage_bookings',
    MODERATE_CONTENT = 'moderate_content'
}

// Role to permissions mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.NORMAL]: [
        Permission.VIEW_EVENTS,
        Permission.CREATE_EVENTS,
        Permission.EDIT_EVENTS,
        Permission.MANAGE_BOOKINGS
    ],
    [UserRole.PRO]: [
        Permission.VIEW_EVENTS,
        Permission.CREATE_EVENTS,
        Permission.EDIT_EVENTS,
        Permission.MANAGE_BOOKINGS,
        Permission.VIEW_ANALYTICS
    ],
    [UserRole.ADMIN]: [
        Permission.VIEW_EVENTS,
        Permission.CREATE_EVENTS,
        Permission.EDIT_EVENTS,
        Permission.DELETE_EVENTS,
        Permission.MANAGE_USERS,
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_BOOKINGS,
        Permission.MODERATE_CONTENT
    ]
};
