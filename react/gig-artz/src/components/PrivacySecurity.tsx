import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "store/store";
import {
  deleteUserAccount,
  suspendUserAccount,
  resetPasswordWithoutEmail,
} from "../../store/authSlice";

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

  const blockedModalRef = useRef<HTMLDivElement>(null);
  const changePasswordModalRef = useRef<HTMLDivElement>(null);
  const deleteAccountModalRef = useRef<HTMLDivElement>(null);

  // Password states for change password modal
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  // Import profile
  const { profile } = useSelector(
    (state: RootState) => state.profile
  );
  const dispatch = useDispatch();

  // Handle suspend profile toggle
  const handleSuspendProfileToggle = () => {
    if (!profile || !profile.uid) {
      alert("User not found.");
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
      alert("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangePasswordModalOpen(false);
    } catch (err) {
      setPasswordError("Failed to change password.");
    }
  };

  // Handle delete account
  const handleDeleteAccountConfirm = async () => {
    if (!profile || !profile.uid) {
      alert("User not found.");
      return;
    }
    if (!deletePassword) {
      alert("Please enter your password.");
      return;
    }
    try {
      await dispatch(deleteUserAccount(profile.uid, deletePassword));
      alert("Account deleted.");
      setIsDeleteAccountModalOpen(false);
    } catch (err) {
      alert("Failed to delete account.");
    }
  };

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsBlockedModalOpen(false);
        setIsChangePasswordModalOpen(false);
        setIsDeleteAccountModalOpen(false);
      }
    };
    if (
      isBlockedModalOpen ||
      isChangePasswordModalOpen ||
      isDeleteAccountModalOpen
    ) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isBlockedModalOpen, isChangePasswordModalOpen, isDeleteAccountModalOpen]);

  // Close modal if clicking outside content
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isBlockedModalOpen &&
        blockedModalRef.current &&
        !blockedModalRef.current.contains(event.target as Node)
      ) {
        setIsBlockedModalOpen(false);
      }
      if (
        isChangePasswordModalOpen &&
        changePasswordModalRef.current &&
        !changePasswordModalRef.current.contains(event.target as Node)
      ) {
        setIsChangePasswordModalOpen(false);
      }
      if (
        isDeleteAccountModalOpen &&
        deleteAccountModalRef.current &&
        !deleteAccountModalRef.current.contains(event.target as Node)
      ) {
        setIsDeleteAccountModalOpen(false);
      }
    };
    if (
      isBlockedModalOpen ||
      isChangePasswordModalOpen ||
      isDeleteAccountModalOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isBlockedModalOpen, isChangePasswordModalOpen, isDeleteAccountModalOpen]);

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
      {isBlockedModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="blocked-users-title"
        >
          <div
            ref={blockedModalRef}
            className="bg-gray-900 rounded-lg max-w-md w-full max-h-[80vh] p-6 overflow-y-auto shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                id="blocked-users-title"
                className="text-xl font-semibold text-white"
              >
                Blocked Accounts
              </h2>
              <button
                onClick={() => setIsBlockedModalOpen(false)}
                aria-label="Close modal"
                className="text-gray-400 hover:text-white transition focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {blockedUsersSample.length === 0 ? (
              <p className="text-gray-400">You have not blocked any users.</p>
            ) : (
              <ul className="divide-y divide-gray-700">
                {blockedUsersSample.map(({ id, name, userName }) => (
                  <li
                    key={id}
                    className="py-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-white">{name}</p>
                      <p className="text-gray-400 text-sm">@{userName}</p>
                    </div>
                    <button
                      onClick={() => alert(`Unblock ${name}`)}
                      className="text-sm text-teal-400 hover:text-teal-600 focus:outline-none"
                    >
                      Unblock
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
        >
          <div
            ref={changePasswordModalRef}
            className="bg-gray-900 rounded-lg max-w-md w-full p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                id="change-password-title"
                className="text-xl font-semibold text-white"
              >
                Change Password
              </h2>
              <button
                onClick={() => setIsChangePasswordModalOpen(false)}
                aria-label="Close modal"
                className="text-gray-400 hover:text-white transition focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

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
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteAccountModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div
            ref={deleteAccountModalRef}
            className="bg-gray-900 rounded-lg max-w-md w-full p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                id="delete-account-title"
                className="text-xl font-semibold text-white"
              >
                Delete Account
              </h2>
              <button
                onClick={() => setIsDeleteAccountModalOpen(false)}
                aria-label="Close modal"
                className="text-gray-400 hover:text-white transition focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

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
          </div>
        </div>
      )}
    </>
  );
};

export default PrivacySecurity;
