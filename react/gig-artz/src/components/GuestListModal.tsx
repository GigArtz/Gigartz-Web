import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { FaUserPlus } from "react-icons/fa";
import { addGuestsToGuestList } from "../../store/eventsSlice";
import Toast from "./Toast";
import BaseModal from "./BaseModal";

interface GuestListModalProps {
  isOpen: boolean;
  onClose: () => void;
  preFilledEmail?: string;
}

const GuestListModal: React.FC<GuestListModalProps & { editingList?: any }> = ({
  isOpen,
  onClose,
  preFilledEmail,
  editingList,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { userGuestList, userList } = useSelector(
    (state: RootState) => state.profile
  );
  const { loading, error, success } = useSelector(
    (state: RootState) => state.events
  );
  const guestLists = useMemo(() => userGuestList || [], [userGuestList]);

  const [newGuestName, setNewGuestName] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Reset modal state when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setNewGuestName("");
      setToast(null);
    }
  }, [isOpen]);

  // Handle success/error alerts
  useEffect(() => {
    if (success) {
      setToast({ message: success, type: "success" });
      dispatch({ type: "events/resetError" });
    } else if (error) {
      setToast({ message: error, type: "error" });
      dispatch({ type: "events/resetError" });
    }
  }, [success, error, dispatch]);

  const handleAddGuest = async () => {
    if (!editingList) {
      setToast({ message: "No guest list selected.", type: "error" });
      return;
    }
    if (!newGuestName.trim()) {
      setToast({ message: "Please enter a guest username.", type: "error" });
      return;
    }
    if (!user) {
      setToast({ message: "User not authenticated.", type: "error" });
      return;
    }
    const guest = userList?.find((u) => u.userName === newGuestName.trim());
    if (!guest) {
      setToast({
        message: "No matching guest found with this email!",
        type: "error",
      });
      return;
    }
    await dispatch(
      addGuestsToGuestList(user.uid, editingList.id, guest.userName)
    );
    setNewGuestName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add to List: ${
        editingList ? editingList?.guestListName : "(No list selected)"
      }`}
      icon={<FaUserPlus className="w-5 h-5" />}
      closeOnClickOutside={true}
      minWidth="min-w-96"
      maxWidth="md:max-w-lg"
    >
      {guestLists.length === 0 && (
        <p className="text-red-500 text-sm mb-4">No guest lists available.</p>
      )}

      {preFilledEmail ? (
        <p className="text-gray-500 mb-4">Adding: {preFilledEmail}</p>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            value={newGuestName}
            onChange={(e) => {
              const input = e.target.value;
              setNewGuestName(input);
            }}
            placeholder="Enter guest name or username"
            className="input-field"
            autoFocus
          />

          {newGuestName && newGuestName.trim().length > 0 && (
            <ul className="text-gray-300 grid overflow-y-auto max-h-32">
              {userList &&
              userList.filter(
                (user) =>
                  user.name
                    .toLowerCase()
                    .includes(newGuestName.toLowerCase()) ||
                  user.userName
                    .toLowerCase()
                    .includes(newGuestName.toLowerCase())
              ).length > 0 ? (
                userList
                  .filter(
                    (user) =>
                      user.name
                        .toLowerCase()
                        .includes(newGuestName.toLowerCase()) ||
                      user.userName
                        .toLowerCase()
                        .includes(newGuestName.toLowerCase())
                  )
                  .map((user) => (
                    <li
                      key={user.emailAddress}
                      onClick={() => setNewGuestName(user.userName)}
                      className="cursor-pointer p-2 rounded border border-gray-600 bg-gray-800 hover:bg-gray-700 text-white mb-2 transition-transform transform"
                    >
                      <div className="flex justify-between gap-3">
                        <p className="flex items-center gap-2">
                          <img
                            src={user.profilePicUrl || "/avatar.png"}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full border-2 border-teal-400 object-cover"
                          />
                          {user.name}
                        </p>
                        <span className="text-gray-400 text-sm min-w-32">
                          @{user.userName || user.emailAddress}
                        </span>
                      </div>
                    </li>
                  ))
              ) : (
                <p className="text-gray-400 text-center">
                  No matching users found.
                </p>
              )}
            </ul>
          )}
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <button
          onClick={handleAddGuest}
          className="btn-primary px-4 py-2"
          disabled={!editingList || loading}
        >
          {loading ? "Adding..." : "Add here"}
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </BaseModal>
  );
};

export default GuestListModal;
