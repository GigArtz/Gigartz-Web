import React from "react";
import PermissionGuard from "./PermissionGuard";
import { useAuthUtils } from "../hooks/useAuthUtils";
import { UserRole, Permission } from "../constants/authTypes";

const AuthExamples: React.FC = () => {
  const authUtils = useAuthUtils();

  return (
    <div className="p-6 bg-dark min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">
        Authentication System Examples
      </h1>

      {/* Basic Auth Info */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
        <p>Authenticated: {authUtils.isAuthenticated ? "Yes" : "No"}</p>
        <p>Loading: {authUtils.isLoading ? "Yes" : "No"}</p>
        <p>Username: {authUtils.user?.userName || "Not logged in"}</p>
        <p>Roles: {authUtils.userRoles.join(", ") || "None"}</p>
      </div>

      {/* Role-based visibility */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Role-based Content</h2>

        <PermissionGuard roles={[UserRole.GENERAL_USER]}>
          <div className="p-3 bg-blue-900 rounded mb-2">
            ✅ This content is visible to General Users
          </div>
        </PermissionGuard>

        <PermissionGuard roles={[UserRole.FREELANCER]}>
          <div className="p-3 bg-green-900 rounded mb-2">
            ✅ This content is visible to Freelancers
          </div>
        </PermissionGuard>

        <PermissionGuard roles={[UserRole.ADMIN]}>
          <div className="p-3 bg-red-900 rounded mb-2">
            ✅ This content is visible to Admins only
          </div>
        </PermissionGuard>
      </div>

      {/* Permission-based visibility */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Permission-based Content</h2>

        <PermissionGuard permissions={[Permission.CREATE_EVENTS]}>
          <div className="p-3 bg-purple-900 rounded mb-2">
            ✅ Can create events
          </div>
        </PermissionGuard>

        <PermissionGuard permissions={[Permission.MANAGE_USERS]}>
          <div className="p-3 bg-orange-900 rounded mb-2">
            ✅ Can manage users
          </div>
        </PermissionGuard>

        <PermissionGuard permissions={[Permission.VIEW_ANALYTICS]}>
          <div className="p-3 bg-indigo-900 rounded mb-2">
            ✅ Can view analytics
          </div>
        </PermissionGuard>
      </div>

      {/* Action buttons with auth checks */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Protected Actions</h2>

        <div className="space-y-2">
          <button
            onClick={() =>
              authUtils.requirePermission(Permission.CREATE_EVENTS, () => {
                alert("Creating event...");
              })
            }
            className="block w-full text-left p-3 bg-teal-600 hover:bg-teal-700 rounded transition"
          >
            Create Event (Requires CREATE_EVENTS permission)
          </button>

          <button
            onClick={() =>
              authUtils.requireRole(UserRole.FREELANCER, () => {
                alert("Accessing freelancer features...");
              })
            }
            className="block w-full text-left p-3 bg-blue-600 hover:bg-blue-700 rounded transition"
          >
            Freelancer Features (Requires FREELANCER role)
          </button>

          <button
            onClick={() =>
              authUtils.requirePermission(Permission.MANAGE_USERS, () => {
                alert("Managing users...");
              })
            }
            className="block w-full text-left p-3 bg-red-600 hover:bg-red-700 rounded transition"
          >
            Manage Users (Requires MANAGE_USERS permission)
          </button>
        </div>
      </div>

      {/* Conditional rendering examples */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Conditional Rendering</h2>

        {authUtils.canCreateEvents && (
          <div className="p-3 bg-green-800 rounded mb-2">
            ✅ You can create events
          </div>
        )}

        {authUtils.canManageUsers && (
          <div className="p-3 bg-red-800 rounded mb-2">
            ✅ You can manage users
          </div>
        )}

        {authUtils.isFreelancer && (
          <div className="p-3 bg-blue-800 rounded mb-2">
            ✅ You are a freelancer
          </div>
        )}

        {authUtils.isAdmin && (
          <div className="p-3 bg-purple-800 rounded mb-2">
            ✅ You are an admin
          </div>
        )}
      </div>

      {/* Logout button */}
      <div className="mb-8">
        <button
          onClick={authUtils.handleLogout}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AuthExamples;
