// Define user roles
export enum UserRole {
    GENERAL_USER = 'generalUser',
    FREELANCER = 'freelancer',
    ADMIN = 'admin',
    MODERATOR = 'moderator'
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
    [UserRole.GENERAL_USER]: [
        Permission.VIEW_EVENTS,
        Permission.MANAGE_BOOKINGS,
        Permission.VIEW_EVENTS,
        Permission.CREATE_EVENTS,
        Permission.EDIT_EVENTS,
        Permission.MANAGE_BOOKINGS,
        Permission.VIEW_ANALYTICS,
        Permission.VIEW_EVENTS,
        Permission.CREATE_EVENTS,
        Permission.EDIT_EVENTS,
        Permission.MANAGE_BOOKINGS,
        Permission.VIEW_ANALYTICS,
        Permission.MODERATE_CONTENT
    ],
    [UserRole.FREELANCER]: [
        Permission.VIEW_EVENTS,
        Permission.CREATE_EVENTS,
        Permission.EDIT_EVENTS,
        Permission.MANAGE_BOOKINGS,
        Permission.VIEW_ANALYTICS
    ],
    [UserRole.MODERATOR]: [
        Permission.VIEW_EVENTS,
        Permission.CREATE_EVENTS,
        Permission.EDIT_EVENTS,
        Permission.MANAGE_BOOKINGS,
        Permission.VIEW_ANALYTICS,
        Permission.MODERATE_CONTENT
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
