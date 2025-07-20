# Authentication & Authorization System

This comprehensive authentication and authorization system provides secure access control for the GigArtz React application with role-based permissions, protected routes, and user management.

## 🚀 Features

### ✅ **Protected Routes**
- Wrap components that need authentication
- Automatic redirect to login for unauthenticated users
- Loading states during auth checks
- Flexible route protection with role and permission requirements

### ✅ **Role-based Access Control**
- **Normal**: Basic access with event viewing, creation, and booking management
- **Pro**: All Normal features plus analytics and advanced features
- **Admin**: Full system access including user management and content moderation

### ✅ **Permission System**
- Granular permissions for specific actions
- Permission inheritance through roles
- Easy permission checking throughout the app

### ✅ **Error Pages**
- **404 Not Found**: Catches all unmatched routes
- **403 Unauthorized**: For permission denied scenarios
- User-friendly error messages with navigation options

### ✅ **Auth Context**
- Centralized authentication state management
- React Context API for global auth state
- Type-safe auth hooks and utilities

### ✅ **Loading States**
- Shows loading spinner while checking auth status
- Prevents flash of unauthorized content
- Smooth user experience during auth transitions

### ✅ **Redirect Logic**
- Intelligent redirects after login/logout
- Preserves intended destination before auth
- Redirects authenticated users away from public pages

## 📁 File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Main auth context provider
├── components/
│   ├── ProtectedRoute.tsx       # Route protection wrapper
│   ├── RoleBasedRoute.tsx       # Role-specific route component
│   ├── PermissionGuard.tsx      # Permission-based content guard
│   ├── AuthRedirect.tsx         # Automatic redirect handler
│   ├── AuthLoading.tsx          # Loading state component
│   ├── Unauthorized.tsx         # 403 error page
│   ├── NotFound.tsx            # 404 error page (existing)
│   ├── withAuth.tsx            # HOC for auth protection
│   └── AuthExamples.tsx        # Usage examples
├── hooks/
│   └── useAuthUtils.ts         # Auth utility hook
└── auth/
    └── index.ts               # Centralized exports
```

## 🛠 Usage Examples

### Basic Route Protection

```tsx
import { ProtectedRoute } from './auth';

// Simple authentication check
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### Role-based Route Protection

```tsx
import { ProtectedRoute, UserRole } from './auth';

// Freelancer-only route
<Route path="/monetization" element={
  <ProtectedRoute requiredRoles={[UserRole.FREELANCER]}>
    <Monetization />
  </ProtectedRoute>
} />

// Admin-only route
<Route path="/admin" element={
  <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
    <AdminPanel />
  </ProtectedRoute>
} />
```

### Permission-based Route Protection

```tsx
import { ProtectedRoute, Permission } from './auth';

// Requires specific permissions
<Route path="/analytics" element={
  <ProtectedRoute requiredPermissions={[Permission.VIEW_ANALYTICS]}>
    <Analytics />
  </ProtectedRoute>
} />
```

### Component-level Permission Guards

```tsx
import { PermissionGuard, UserRole, Permission } from './auth';

function EventCard() {
  return (
    <div className="event-card">
      <h3>Event Title</h3>
      
      {/* Only show to freelancers */}
      <PermissionGuard roles={[UserRole.FREELANCER]}>
        <button>Edit Event</button>
      </PermissionGuard>
      
      {/* Only show if user can delete events */}
      <PermissionGuard permissions={[Permission.DELETE_EVENTS]}>
        <button>Delete Event</button>
      </PermissionGuard>
    </div>
  );
}
```

### Using Auth Utilities Hook

```tsx
import { useAuthUtils } from './auth';

function MyComponent() {
  const authUtils = useAuthUtils();
  
  const handleCreateEvent = () => {
    authUtils.requirePermission(Permission.CREATE_EVENTS, () => {
      // Only executes if user has permission
      createEvent();
    });
  };
  
  return (
    <div>
      {authUtils.isFreelancer && (
        <button onClick={handleCreateEvent}>
          Create Event
        </button>
      )}
      
      {authUtils.canManageUsers && (
        <UserManagementPanel />
      )}
    </div>
  );
}
```

### Higher-Order Component Protection

```tsx
import { withAuth, UserRole } from './auth';

const FreelancerDashboard = withAuth(Dashboard, {
  requiredRoles: [UserRole.FREELANCER]
});

// Use the protected component
<FreelancerDashboard />
```

## 🔧 Configuration

### User Roles

```typescript
enum UserRole {
  GENERAL_USER = 'generalUser',
  FREELANCER = 'freelancer',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}
```

### Permissions

```typescript
enum Permission {
  VIEW_EVENTS = 'view_events',
  CREATE_EVENTS = 'create_events',
  EDIT_EVENTS = 'edit_events',
  DELETE_EVENTS = 'delete_events',
  MANAGE_USERS = 'manage_users',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_BOOKINGS = 'manage_bookings',
  MODERATE_CONTENT = 'moderate_content'
}
```

### Role-Permission Mapping

| Role | Permissions |
|------|-------------|
| **General User** | view_events, manage_bookings |
| **Freelancer** | All General User + create_events, edit_events, view_analytics |
| **Moderator** | All Freelancer + moderate_content |
| **Admin** | All Moderator + delete_events, manage_users |

## 🚦 Route Structure

```
Public Routes:
├── / (Login)
├── /register
├── /forgot
└── /reset-password

Protected Routes:
├── /home
├── /profile
├── /explore
├── /messages
├── /notifications
├── /bookings
├── /tickets
├── /wallet
└── /settings

Role-specific Routes:
├── /monetization (Freelancer+)
├── /scanner (Freelancer+)
└── /guest-list (Booking management permission)

Analytics Routes:
├── /events/insights (View analytics permission)
└── /events/:eventId/insights (View analytics permission)

Error Routes:
├── /unauthorized (403)
└── * (404)
```

## 🔒 Security Features

1. **Route-level Protection**: All sensitive routes wrapped with authentication checks
2. **Component-level Guards**: Fine-grained permission control within components
3. **Automatic Redirects**: Users redirected appropriately based on auth state
4. **Loading States**: Prevents unauthorized content flash during auth checks
5. **Type Safety**: Full TypeScript support for roles and permissions
6. **Centralized Auth State**: Single source of truth for authentication
7. **Permission Inheritance**: Roles automatically inherit appropriate permissions

## 🚀 Quick Setup

1. **Wrap your app with AuthProvider**:
```tsx
import { AuthProvider } from './auth';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Your routes */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

2. **Protect your routes**:
```tsx
import { ProtectedRoute } from './auth';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

3. **Use auth utilities in components**:
```tsx
import { useAuthUtils } from './auth';

function MyComponent() {
  const { isAuthenticated, canCreateEvents } = useAuthUtils();
  // Use auth state and permissions
}
```

## 📊 Component Props Reference

### ProtectedRoute Props
- `children`: React.ReactNode - Protected content
- `requireAuth?: boolean` - Require authentication (default: true)
- `requiredRoles?: UserRole[]` - Required user roles
- `requiredPermissions?: Permission[]` - Required permissions
- `requireAllRoles?: boolean` - Require all roles (default: false)
- `requireAllPermissions?: boolean` - Require all permissions (default: true)
- `fallbackPath?: string` - Custom redirect path
- `showUnauthorized?: boolean` - Show 403 page (default: true)

### PermissionGuard Props
- `children`: React.ReactNode - Guarded content
- `roles?: UserRole[]` - Required roles
- `permissions?: Permission[]` - Required permissions
- `requireAllRoles?: boolean` - Require all roles (default: false)
- `requireAllPermissions?: boolean` - Require all permissions (default: true)
- `fallback?: React.ReactNode` - Fallback content
- `showFallback?: boolean` - Show fallback (default: false)

This authentication system provides a robust, scalable foundation for secure access control in your React application.
