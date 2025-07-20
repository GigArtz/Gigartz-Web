import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "store/store";
import {
  deleteUserAccount,
  suspendUserAccount,
  resetPasswordWithoutEmail,
} from "../../store/authSlice";
import BaseModal from "./BaseModal";
import { showToast } from "../../store/notificationSlice";

const blockedUsersSample = [
  { id: "1", name: "Alice Johnson", userName: "alicej" },
  { id: "2", name: "Bob Smith", userName: "bobsmith" },
  { id: "3", name: "Charlie Brown", userName: "charlieb" },
];

const PrivacySecurity: React.FC = () => {
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);
  const [isProfileSuspended, setIsProfileSuspended] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  // Password states for change password modal
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  // Import profile
  const { profile } = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch();

  // Handle suspend profile toggle
  const handleSuspendProfileToggle = () => {
    if (!profile || !profile.uid) {
      dispatch(showToast({ message: "User not found.", type: "error" }));
      return;
    }
    dispatch(suspendUserAccount(profile.uid, !isProfileSuspended));
    setIsProfileSuspended((prev) => !prev);
  };

  // Handle change password
  const handleChangePasswordSubmit = async () => {
    setPasswordError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    try {
      // You may need to get a token from your auth state or context
      const token = profile?.token || localStorage.getItem("authToken") || "";
      await dispatch(resetPasswordWithoutEmail(newPassword, token));
      dispatch(
        showToast({
          message: "Password changed successfully!",
          type: "success",
        })
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangePasswordModalOpen(false);
    } catch (error) {
      setPasswordError("Failed to change password.");
      console.error("Password change error:", error);
    }
  };

  // Handle delete account
  const handleDeleteAccountConfirm = async () => {
    if (!profile || !profile.uid) {
      dispatch(showToast({ message: "User not found.", type: "error" }));
      return;
    }
    if (!deletePassword) {
      dispatch(
        showToast({ message: "Please enter your password.", type: "error" })
      );
      return;
    }
    try {
      await dispatch(deleteUserAccount(profile.uid, deletePassword));
      dispatch(showToast({ message: "Account deleted.", type: "success" }));
      setIsDeleteAccountModalOpen(false);
    } catch (error) {
      console.error("Account deletion error:", error);
      dispatch(
        showToast({ message: "Failed to delete account.", type: "error" })
      );
    }
  };

  // No useEffect needed here as BaseModal handles closing on escape key and clicking outside

  return (
    <>
      <div className="max-w-md p-6 rounded-lg shadow-lg text-white">
        <h3 className="text-2xl font-semibold mb-6">Privacy & Security</h3>

        <ul className="space-y-6">
          <li>
            <button
              onClick={() => setIsBlockedModalOpen(true)}
              className="w-full text-left px-4 py-3 bg-gray-800 rounded-md hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              Blocked Accounts
            </button>
          </li>

          <li>
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="w-full text-left px-4 py-3 bg-gray-800 rounded-md hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              Change Password
            </button>
          </li>

          <li className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-md">
            <span>Private Profile</span>
            <label className="relative inline-block w-12 h-7">
              <input
                type="checkbox"
                checked={isPrivateProfile}
                onChange={() => setIsPrivateProfile(!isPrivateProfile)}
                className="peer sr-only"
                aria-checked={isPrivateProfile}
                aria-label="Toggle private profile"
              />
              <span className="block bg-gray-600 rounded-full w-12 h-7 transition peer-checked:bg-teal-500"></span>
              <span className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></span>
            </label>
          </li>

          <li className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-md">
            <span>Suspend Profile</span>
            <label className="relative inline-block w-12 h-7">
              <input
                type="checkbox"
                checked={isProfileSuspended}
                onChange={handleSuspendProfileToggle}
                className="peer sr-only"
                aria-checked={isProfileSuspended}
                aria-label="Toggle suspend profile"
              />
              <span className="block bg-gray-600 rounded-full w-12 h-7 transition peer-checked:bg-teal-500"></span>
              <span className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></span>
            </label>
          </li>

          <li>
            <button
              onClick={() => setIsDeleteAccountModalOpen(true)}
              className="w-full text-left px-4 py-3 bg-red-700 rounded-md hover:bg-red-800 transition focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Delete Account
            </button>
          </li>
        </ul>
      </div>

      {/* Blocked Accounts Modal */}
      <BaseModal
        isOpen={isBlockedModalOpen}
        onClose={() => setIsBlockedModalOpen(false)}
        title="Blocked Accounts"
        maxWidth="md:max-w-md"
        className="max-h-[80vh] overflow-y-auto"
      >
        {blockedUsersSample.length === 0 ? (
          <p className="text-gray-400">You have not blocked any users.</p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {blockedUsersSample.map(({ id, name, userName }) => (
              <li key={id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white">{name}</p>
                  <p className="text-gray-400 text-sm">@{userName}</p>
                </div>
                <button
                  onClick={() =>
                    dispatch(
                      showToast({
                        message: `Unblock ${name}`,
                        type: "info",
                      })
                    )
                  }
                  className="text-sm text-teal-400 hover:text-teal-600 focus:outline-none"
                >
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        )}
      </BaseModal>

      {/* Change Password Modal */}
      <BaseModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        title="Change Password"
        maxWidth="md:max-w-md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleChangePasswordSubmit();
          }}
          noValidate
        >
          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>

          {passwordError && (
            <p className="text-red-500 text-sm mb-4" role="alert">
              {passwordError}
            </p>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsChangePasswordModalOpen(false)}
              className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-teal-500 hover:bg-teal-600 transition focus:outline-none focus:ring-2 focus:ring-teal-400 text-white"
            >
              Save
            </button>
          </div>
        </form>
      </BaseModal>

      {/* Delete Account Modal */}
      <BaseModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        title="Delete Account"
        maxWidth="md:max-w-md"
      >
        <p className="text-gray-300 mb-4">
          Are you sure you want to{" "}
          <span className="font-semibold text-red-500">
            delete your account
          </span>
          ? This action is{" "}
          <span className="font-semibold text-red-500">irreversible</span>.
        </p>

        <input
          type="password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-4 py-2 mb-6 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setIsDeleteAccountModalOpen(false)}
            className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteAccountConfirm}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400 text-white"
          >
            Delete Account
          </button>
        </div>
      </BaseModal>
    </>
  );
};

export default PrivacySecurity;
