import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { addGuestsToGuestList } from "../../store/eventsSlice";
import Toast from "./Toast";
import { FaTimesCircle } from "react-icons/fa";

interface GuestListModalFromGuestListProps {
  isOpen: boolean;
  onClose: () => void;
  preFilledEmail?: string;
}

const GuestListModalFromGuestList: React.FC<
  GuestListModalFromGuestListProps
> = ({ isOpen, onClose, preFilledEmail }) => {
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
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );

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
      setToast({ message: success, type: "success" });
      dispatch({ type: "events/resetError" });
    } else if (error) {
      setToast({ message: error, type: "error" });
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
        setToast({
          message: "No matching guest found with this email!",
          type: "error",
        });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-dark p-6 rounded-lg w-96">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 p-1 py-2 border-b border-gray-500 ">
          <h3 className="text-xl font-semibold text-white">
            Add to Guest List
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center"
          >
            <FaTimesCircle className="w-6 h-6 hover:text-red-500" />
          </button>
        </div>
        <h3 className="text-lg font-semibold mb-4">Add to Guest List</h3>
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

export default GuestListModalFromGuestList;
