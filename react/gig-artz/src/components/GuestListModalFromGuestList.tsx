import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface GuestListModalFromGuestListProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGuest: (listId: number, guestEmail: string) => void;
}

const GuestListModalFromGuestList: React.FC<
  GuestListModalFromGuestListProps
> = ({ isOpen, onClose, onAddGuest }) => {
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const guestLists = JSON.parse(localStorage.getItem("guestLists") || "[]");
  const userList = useSelector((state: RootState) => state.profile.userList);

  const handleAddGuest = () => {
    if (selectedListId && guestEmail.trim()) {
      onAddGuest(selectedListId, guestEmail);
      setGuestEmail("");
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
        <input
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          placeholder="Enter guest email"
          className="input-field mb-4 w-full"
        />
        <ul className="text-gray-300">
          {userList
            ?.filter((user) => user.emailAddress.includes(guestEmail))
            .map((user) => (
              <li
                key={user.emailAddress}
                className="text-sm cursor-pointer hover:text-blue-400"
                onClick={() => setGuestEmail(user.emailAddress)}
              >
                {user.name || "Unnamed User"} ({user.emailAddress})
              </li>
            ))}
        </ul>
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

export default GuestListModalFromGuestList;
