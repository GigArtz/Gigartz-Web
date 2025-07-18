import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { addGuestsToGuestList } from "../../store/eventsSlice";
import { showToast, clearToast } from "../../store/notificationSlice";
import { FaUserPlus } from "react-icons/fa";
import BaseModal from "./BaseModal";

interface GuestListModalFromGuestListProps {
  isOpen: boolean;
  onClose: () => void;
  preFilledEmail?: string;
  onAddGuest?: (listId: number, guestEmail: string) => void;
}

const GuestListModalFromGuestList: React.FC<
  GuestListModalFromGuestListProps
> = ({ isOpen, onClose, preFilledEmail, onAddGuest }) => {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { userGuestList, userList } = useSelector(
    (state: RootState) => state.profile
  );
  const { loading, error, success } = useSelector(
    (state: RootState) => state.events
  );
  const guestLists = useMemo(() => userGuestList || [], [userGuestList]);

  const [selectedListId, setSelectedListId] = useState<number | null>(() => {
    const storedListId = Number(localStorage.getItem("selectedListId"));
    return guestLists.some((list) => list.id === storedListId)
      ? storedListId
      : null;
  });
  const [guestEmail, setGuestEmail] = useState(preFilledEmail || "");
  // Remove local toast state, use global Toast

  useEffect(() => {
    if (isOpen) {
      const storedListId = Number(localStorage.getItem("selectedListId"));
      if (guestLists.some((list) => list.id === storedListId)) {
        setSelectedListId(storedListId);
      } else {
        setSelectedListId(null);
      }
    }
  }, [isOpen, guestLists]);

  useEffect(() => {
    if (success) {
      dispatch(showToast({ message: success, type: "success" }));
      dispatch({ type: "events/resetError" });
    } else if (error) {
      dispatch(showToast({ message: error, type: "error" }));
      dispatch({ type: "events/resetError" });
    }
  }, [success, error, dispatch]);

  const handleListChange = (listId: number) => {
    setSelectedListId(listId);
    localStorage.setItem("selectedListId", String(listId));
  };

  const handleAddGuest = async () => {
    if (selectedListId && guestEmail.trim() && user) {
      const guest = userList?.find((u) => u.emailAddress === guestEmail.trim());
      if (!guest) {
        dispatch(
          showToast({
            message: "No matching guest found with this email!",
            type: "error",
          })
        );
        return;
      }
      // Convert selectedListId to string for thunk
      await dispatch(
        addGuestsToGuestList(user.uid, String(selectedListId), guest.userName)
      );
      setGuestEmail("");
      onClose();
    }
  };

  const handleCustomAddGuest = async () => {
    if (selectedListId && guestEmail.trim()) {
      if (onAddGuest) {
        onAddGuest(selectedListId, guestEmail.trim());
      } else {
        await handleAddGuest();
      }
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Guest List"
      icon={<FaUserPlus />}
      maxWidth="md:max-w-md"
      minWidth="min-w-80"
    >
      <div className="p-4">
        <select
          value={selectedListId || ""}
          onChange={(e) => handleListChange(Number(e.target.value))}
          className="input-field mb-4 w-full"
          disabled={guestLists.length === 0}
        >
          <option value="">Select a guest list</option>
          {guestLists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.guestListName}
            </option>
          ))}
        </select>
        {guestLists.length === 0 && (
          <p className="text-red-500 text-sm">No guest lists available.</p>
        )}
        <input
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          placeholder="Enter guest email"
          className="input-field mb-4 w-full"
        />
        <p className="text-sm text-gray-400 mb-4">
          You can add guests to your guest list, they will receive an email
          invitation.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={handleAddGuest}
            className="px-4 py-2 btn-primary rounded-2xl hover:bg-blue-600 text-white"
            disabled={!selectedListId || !guestEmail.trim() || loading}
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
        {/* Toast is now global, not local */}
      </div>
    </BaseModal>
  );
};

export default GuestListModalFromGuestList;
