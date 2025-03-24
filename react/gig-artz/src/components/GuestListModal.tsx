import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { FaTimesCircle } from "react-icons/fa";

interface GuestListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGuest: (listId: number, guestEmail: string) => void;
  preFilledEmail?: string; // New prop for pre-filled email
}

const GuestListModal: React.FC<GuestListModalProps> = ({
  isOpen,
  onClose,
  onAddGuest,
  preFilledEmail,
}) => {
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const guestEmail = preFilledEmail || ""; // Use pre-filled email if provided
  const guestLists = JSON.parse(localStorage.getItem("guestLists") || "[]");

  const handleAddGuest = () => {
    if (selectedListId && guestEmail.trim()) {
      onAddGuest(selectedListId, guestEmail); // Call onAddGuest with correct data
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-dark p-6 rounded-lg w-96">
        {/* Modal Header */}
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
          onChange={(e) => setSelectedListId(Number(e.target.value))}
          className="input-field mb-4 w-full"
        >
          <option value="">Select a guest list</option>
          {guestLists.map((list: { id: number; name: string }) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>
        {preFilledEmail ? (
          <p className="text-gray-500 mb-4">Adding: {preFilledEmail}</p>
        ) : (
          <input
            type="email"
            value={guestEmail}
            readOnly
            className="input-field mb-4 w-full"
          />
        )}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleAddGuest}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestListModal;
