import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { FaTimesCircle, FaTrash, FaEdit } from "react-icons/fa";
import Toast from "../components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { addGuestList } from "../store/eventsSlice";
import GuestListModal from "../components/GuestListModal";

function GuestList() {
  const [guestLists, setGuestLists] = useState(() => {
    const savedLists = localStorage.getItem("guestLists");
    return savedLists ? JSON.parse(savedLists) : [];
  });

  const [selectedList, setSelectedList] = useState(null);
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newListName, setNewListName] = useState("");
  const [editingList, setEditingList] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [isGuestListModalOpen, setIsGuestListModalOpen] = useState(false);

  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state: RootState) => state.profile);
  const { userList } = useSelector((state: RootState) => state.profile);
  const { addGuestListStatus, addGuestListMessage } = useSelector(
    (state: RootState) => state.events
  );

  useEffect(() => {
    localStorage.setItem("guestLists", JSON.stringify(guestLists));
    console.log(profile);
    console.log(userList);
    console.log(user);
  }, [guestLists, profile]);

  useEffect(() => {
    if (addGuestListStatus === "success") {
      showToast(
        addGuestListMessage || "Guest list added successfully!",
        "success"
      );
    } else if (addGuestListStatus === "error") {
      showToast(addGuestListMessage || "Failed to add guest list.", "error");
    }
  }, [addGuestListStatus, addGuestListMessage]);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const handleSaveList = () => {
    if (!newListName.trim()) {
      showToast("List name cannot be empty!", "error");
      return;
    }

    if (editingList) {
      // Update existing list
      setGuestLists((prevLists) =>
        prevLists.map((list) =>
          list.id === editingList.id ? { ...list, name: newListName } : list
        )
      );
      showToast("List updated successfully!", "success");
    } else {
      // Create new list without guests initially
      const newList = {
        id: Date.now(),
        name: newListName,
        guests: [],
      };

      setGuestLists((prevLists) => [...prevLists, newList]);
      showToast(
        "New list created successfully! Add guests to finalize.",
        "info"
      );
    }

    setNewListName("");
    setEditingList(null);
    setShowListModal(false);
  };

  const deleteList = (id) => {
    setGuestLists(guestLists.filter((list) => list.id !== id));
    setSelectedList(null);
    showToast("List deleted!", "info");
  };

  const addGuest = () => {
    if (!newGuestEmail.trim() || !selectedList) {
      showToast("Guest email cannot be empty!", "error");
      return;
    }

    // Ensure the email exists in the userList
    const guest = userList?.find((user) => user.emailAddress === newGuestEmail);

    if (!guest) {
      showToast("No matching guest found with this email!", "error");
      return;
    }

    if (!guest.name || !guest.emailAddress || !guest.phoneNumber) {
      showToast(
        "Each guest must have a valid name, email, and phone number.",
        "error"
      );
      return;
    }

    const guestInfo = {
      name: guest.name,
      email: guest.emailAddress,
      phoneNumber: guest.phoneNumber,
    };

    // Check if the guest is already in the selected list
    const isGuestAlreadyAdded = selectedList.guests.some(
      (existingGuest) => existingGuest.email === guestInfo.email
    );

    if (isGuestAlreadyAdded) {
      showToast("This guest is already added to the list.", "error");
      return;
    }

    setGuestLists((prevLists) =>
      prevLists.map((list) =>
        list.id === selectedList.id
          ? { ...list, guests: [...list.guests, guestInfo] }
          : list
      )
    );

    // Dispatch when guests are added to a new list
    if (!editingList) {
      dispatch(
        addGuestList({
          userId: user.uid,
          guestListName: selectedList.name,
          guests: [...selectedList.guests, guestInfo],
        })
      );
    }

    showToast("Guest added successfully!", "success");
    setNewGuestEmail("");
  };

  const deleteGuest = (guestEmail) => {
    if (!selectedList) return;
    setGuestLists(
      guestLists.map((list) =>
        list.id === selectedList.id
          ? {
              ...list,
              guests: list.guests.filter((guest) => guest.email !== guestEmail),
            }
          : list
      )
    );
    showToast("Guest removed!", "info");
  };

  const handleAddGuestToList = (listId: number, guestEmail: string) => {
    const guest = userList?.find((user) => user.emailAddress === guestEmail);
    if (!guest) {
      showToast("No matching guest found with this email!", "error");
      return;
    }

    setGuestLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              guests: [
                ...list.guests,
                {
                  name: guest.name,
                  email: guest.emailAddress,
                  phoneNumber: guest.phoneNumber,
                },
              ],
            }
          : list
      )
    );

    // Save updated guest lists to localStorage
    const updatedLists = guestLists.map((list) =>
      list.id === listId
        ? {
            ...list,
            guests: [
              ...list.guests,
              {
                name: guest.name,
                email: guest.emailAddress,
                phoneNumber: guest.phoneNumber,
              },
            ],
          }
        : list
    );
    localStorage.setItem("guestLists", JSON.stringify(updatedLists));

    showToast("Guest added successfully!", "success");
  };

  return (
    <div className="main-content p-6">
      <Header title="Guest List" />

      {/* Guest List Cards */}
      <div className="rounded-lg shadow-md">
        {guestLists.length === 0 ? (
          <p className="text-gray-400 text-center">No guest lists available.</p>
        ) : (
          guestLists.map((list) => (
            <div
              key={list.id}
              onClick={() => setSelectedList(list)}
              className="cursor-pointer border border-teal-500 hover:bg-gray-900 p-4 rounded-lg mb-3 flex justify-between items-center transition"
            >
              <span className="text-white font-medium">{list.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingList(list);
                    setNewListName(list.name);
                    setShowListModal(true);
                  }}
                  className="text-blue-400 hover:text-blue-500"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteList(list.id);
                  }}
                  className="text-red-400 hover:text-red-500"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Guest List Modal */}
      {selectedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-11/12 relative animate-fadeIn">
            <div className="flex flex-row justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-white">
                {selectedList.name}
              </h3>
              <button
                onClick={() => setSelectedList(null)}
                className="hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                <FaTimesCircle className="w-5 h-5" />
              </button>
            </div>

            <ul className="space-y-2 mb-3">
              {selectedList.guests.length > 0 ? (
                selectedList.guests.map((guest, index) => (
                  <li
                    key={`${guest.email}-${index}`}
                    className="flex justify-between text-gray-300"
                  >
                    <span>
                      {guest.name} ({guest.email})
                    </span>
                    <button
                      onClick={() => deleteGuest(guest.email)}
                      className="text-red-400 hover:text-red-500 text-sm pr-4"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-400">No guests added.</p>
              )}
            </ul>

            <div className="flex flex-col gap-2">
              <input
                type="email"
                value={newGuestEmail}
                onChange={(e) => {
                  const email = e.target.value;
                  setNewGuestEmail(email);
                }}
                placeholder="Enter guest email"
                className="p-2 rounded border border-gray-600 bg-gray-800 text-white w-full"
                autoFocus
              />
              <ul className="text-gray-300">
                {userList &&
                  userList
                    .filter((user) => user.emailAddress.includes(newGuestEmail))
                    .map((user) => (
                      <li
                        key={user.emailAddress}
                        className="text-sm cursor-pointer hover:text-blue-400"
                        onClick={() => {
                          setNewGuestEmail(user.emailAddress);
                          addGuest();
                        }}
                      >
                        {user.name || "Unnamed User"} ({user.emailAddress})
                      </li>
                    ))}
              </ul>
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

      {/* Create/Edit List Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-11/12 relative animate-fadeIn">
            <div className="flex flex-row justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-white">
                {editingList ? "Edit List" : "Create New List"}
              </h3>
              <button
                onClick={() => setShowListModal(false)}
                className="hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                <FaTimesCircle className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Enter list name"
              className="p-2 rounded border border-gray-600 bg-gray-800 text-white w-full mb-3"
              autoFocus
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveList}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
              >
                {editingList ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Create List Button */}
      <div className="fixed bottom-5 right-5 md:right-[5%] lg:right-[28%] z-10 md:z-40">
        <button
          onClick={() => setShowListModal(true)}
          className="w-40 btn-primary transform transition-all hover:scale-105"
        >
          + Create List
        </button>
      </div>

      <button
        onClick={() => setIsGuestListModalOpen(true)}
        className="w-40 btn-primary transform transition-all hover:scale-105"
      >
        + Add Guest
      </button>
      <GuestListModal
        isOpen={isGuestListModalOpen}
        onClose={() => setIsGuestListModalOpen(false)}
        onAddGuest={handleAddGuestToList}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default GuestList;
