import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { FaTimesCircle } from "react-icons/fa";

interface GuestListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGuest: (listId: number, guestEmail: string) => void;
  preFilledEmail?: string;
}

const GuestListModal: React.FC<GuestListModalProps> = ({
  isOpen,
  onClose,
  onAddGuest,
  preFilledEmail,
}) => {
  const { userGuestList } = useSelector((state: RootState) => state.profile);
  const guestLists = userGuestList || [];

  const [selectedListId, setSelectedListId] = useState<number | null>(() => {
    const storedListId = Number(localStorage.getItem("selectedListId"));
    return guestLists.some((list) => list.id === storedListId) ? storedListId : null;
  });

  const [guestEmail, setGuestEmail] = useState(preFilledEmail || "");

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

  const handleListChange = (listId: number) => {
    setSelectedListId(listId);
    localStorage.setItem("selectedListId", String(listId));
  };

  const handleAddGuest = () => {
    if (selectedListId && guestEmail.trim()) {
      onAddGuest(selectedListId, guestEmail.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-dark p-6 rounded-lg w-96">
        <div className="flex items-center justify-between mb-4 pb-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add to Guest List
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <FaTimesCircle className="w-6 h-6 hover:text-red-500" />
          </button>
        </div>
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
        {preFilledEmail ? (
          <p className="text-gray-500 mb-4">Adding: {preFilledEmail}</p>
        ) : (
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="input-field mb-4 w-full"
            placeholder="Enter guest email"
          />
        )}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleAddGuest}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            disabled={!selectedListId || !guestEmail.trim()}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestListModal;
