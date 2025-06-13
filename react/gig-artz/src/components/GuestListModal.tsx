import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { FaTimesCircle } from "react-icons/fa";
import { addGuestsToGuestList } from "../../store/eventsSlice";
import Toast from "./Toast";

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

  const [guestEmail, setGuestEmail] = useState(preFilledEmail || "");
  const [newGuestName, setNewGuestName] = useState("");
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );

  // Reset modal state when opened/closed
  useEffect(() => {
    if (!isOpen) {
      setGuestEmail(preFilledEmail || "");
      setNewGuestName("");
      setToast(null);
    }
  }, [isOpen, preFilledEmail]);

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
    setGuestEmail("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-dark p-6 rounded-lg w-96">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 p-1 py-2 border-b border-gray-500 ">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add to List:{" "}
            <span className="text-teal-500">
              {editingList ? editingList?.guestListName : "(No list selected)"}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <FaTimesCircle className="w-6 h-6 hover:text-red-500" />
          </button>
        </div>

        {guestLists.length === 0 && (
          <p className="text-red-500 text-sm">No guest lists available.</p>
        )}
        {preFilledEmail ? (
          <p className="text-gray-500 mb-4">Adding: {preFilledEmail}</p>
        ) : (
          <>
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
              <ul className="text-gray-300 grid overflow-y-auto max-h-32 mt-2">
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
          </>
        )}

        <div className="flex justify-end gap-4 p-2">
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
      </div>
    </div>
  );
};

export default GuestListModal;
