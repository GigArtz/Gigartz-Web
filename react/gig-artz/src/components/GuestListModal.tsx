import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4">Add to Guest List</h3>
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
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
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
