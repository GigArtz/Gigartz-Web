import React, { useState } from "react";
import Header from "../components/Header";
import { FaTimes, FaTimesCircle, FaTrash } from "react-icons/fa";

function GuestList() {
  const [guestLists, setGuestLists] = useState([
    { id: 1, name: "Wedding Guests", guests: ["Alice", "Bob"] },
    { id: 2, name: "Birthday Party", guests: ["Charlie", "David"] },
  ]);
  const [selectedList, setSelectedList] = useState(null);
  const [newGuestName, setNewGuestName] = useState("");

  const deleteList = (id) => {
    setGuestLists(guestLists.filter((list) => list.id !== id));
  };

  const addGuest = () => {
    if (!newGuestName.trim() || !selectedList) return;
    setGuestLists(
      guestLists.map((list) =>
        list.id === selectedList.id
          ? { ...list, guests: [...list.guests, newGuestName] }
          : list
      )
    );
    setNewGuestName(""); // Clear input
  };

  const deleteGuest = (guestName) => {
    if (!selectedList) return;
    setGuestLists(
      guestLists.map((list) =>
        list.id === selectedList.id
          ? {
              ...list,
              guests: list.guests.filter((guest) => guest !== guestName),
            }
          : list
      )
    );
  };

  const createNewList = () => {
    const newList = { id: Date.now(), name: "New List", guests: [] };
    setGuestLists([...guestLists, newList]);
    setSelectedList(newList);
  };

  return (
    <div className="main-content p-6">
      <Header title="Guest List" />
      <div className="rounded-lg shadow-md">
        {guestLists.length === 0 ? (
          <p className="text-gray-400">No guest lists available.</p>
        ) : (
          guestLists.map((list) => (
            <div
              key={list.id}
              onClick={() => setSelectedList(list)}
              className="cursor-pointer bg-gray-700 hover:bg-gray-600 p-4 rounded-lg mb-3 flex justify-between items-center transition"
            >
              <span className="text-white font-medium">{list.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening modal when deleting
                  deleteList(list.id);
                }}
                className="text-red-400 hover:text-red-500"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Guest List Modal */}
      {selectedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 relative">
            <div className="flex flex-row justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-white mb-3">
                {selectedList.name}
              </h3>
              <button
                onClick={() => setSelectedList(null)}
                className=" text-white hover:text-gray-400"
              >
                <FaTimesCircle className="w-6 h-6" />
              </button>
            </div>

            <ul className="space-y-2 mb-3">
              {selectedList.guests.length > 0 ? (
                selectedList.guests.map((guest, index) => (
                  <li
                    key={index}
                    className="flex justify-between text-gray-300"
                  >
                    {guest}
                    <button
                      onClick={() => deleteGuest(guest)}
                      className="text-red-400 hover:text-red-500 text-sm"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-400">No guests added.</p>
              )}
            </ul>

            <div className="flex gap-2">
              <input
                type="text"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                placeholder="Enter guest name"
                className="p-2 rounded border border-gray-600 bg-gray-800 text-white w-full"
              />
              <button
                onClick={addGuest}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          onClick={createNewList}
          className="fixed bottom-6 right-6 w-36 rounded-3xl btn-primary"
        >
          Create List
        </button>
      </div>
    </div>
  );
}

export default GuestList;
