import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { FaTimesCircle, FaTrash, FaEdit } from "react-icons/fa";
import Toast from "../components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { addGuestList } from "../store/eventsSlice";
import GuestListModal from "../components/GuestListModal";
import { fetchAUserProfile } from "../store/profileSlice";

function GuestList() {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile, userList, userGuestList } = useSelector(
    (state: RootState) => state.profile
  );

  const [guestLists, setGuestLists] = useState(userGuestList || []);

  const [selectedList, setSelectedList] = useState(null);
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newListName, setNewListName] = useState("");
  const [editingList, setEditingList] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [isGuestListModalOpen, setIsGuestListModalOpen] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const { addGuestListStatus, addGuestListMessage } = useSelector(
    (state: RootState) => state.events
  );

  useEffect(() => {
    console.log(profile);
    console.log(userList);
    console.log(guestLists);
  }, [profile]);

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

  useEffect(() => {
    // Refresh guestLists when userGuestList changes
    console.log("Refreshing guest lists...");
  }, [userGuestList]);

  useEffect(() => {
    setGuestLists(userGuestList || []);
  }, [userGuestList]);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const handleSaveList = () => {
    if (!newListName.trim()) {
      showToast("List name cannot be empty!", "error");
      return;
    }

    if (!newGuestEmail.trim()) {
      showToast("Guest email cannot be empty!", "error");
      return;
    }

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

    if (editingList) {
      // Update existing list
      dispatch(
        addGuestList({
          userId: user.uid,
          guestListName: newList.name,
          guests: newList.guests,
        })
      ).then(() => {
        dispatch(fetchAUserProfile(user.uid)); // 👈 Refresh profile here
        setSelectedList(null);
        showToast("New list created successfully!", "success");
      });
      
    } else {
      // Create new list with the first guest
      const newList = {
        id: Date.now(),
        name: newListName,
        guests: [guestInfo],
      };

      dispatch(
        addGuestList({
          userId: user.uid,
          guestListName: newList.name,
          guests: newList.guests,
        })
      ).then(() => {
        // Refresh guest lists
        setSelectedList(null);
        dispatch(fetchAUserProfile(user.uid));
        showToast("New list created successfully!", "success");
      });
    }

    setNewListName("");
    setNewGuestEmail("");
    setEditingList(null);
    setShowListModal(false);
  };

  const deleteList = (id) => {
    const updatedLists = guestLists.filter((list) => list.id !== id);
    dispatch(
      addGuestList({
        userId: user.uid,
        guestListName: null,
        guests: updatedLists,
      })
    );
    setSelectedList(null);
    showToast("List deleted!", "info");
  };

  
  

  const addGuest = () => {
    if (!newGuestEmail.trim() || !selectedList) {
      showToast("Guest email cannot be empty!", "error");
      return;
    }

    const guest = userList?.find((user) => user.emailAddress === newGuestEmail);

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

    const isGuestAlreadyAdded = selectedList.guests.some(
      (existingGuest) => existingGuest.email === guestInfo.email
    );

    if (isGuestAlreadyAdded) {
      showToast("This guest is already added to the list.", "error");
      return;
    }

    const updatedGuests = [...selectedList.guests, guestInfo];

    dispatch(
      addGuestList({
        userId: user.uid,
        guestListName: selectedList.name,
        guests: updatedGuests,
      })
    ).then(() => {
      // Refresh guest lists
      setSelectedList(null);
      showToast("Guest added successfully!", "success");
    });

    setNewGuestEmail("");
  };

  const deleteGuest = (guestEmail) => {
    if (!selectedList) return;

    const updatedGuests = selectedList.guests.filter(
      (guest) => guest.email !== guestEmail
    );

    dispatch(
      addGuestList({
        userId: user.uid,
        guestListName: selectedList.name,
        guests: updatedGuests,
      })
    ).then(() => {
      dispatch(fetchAUserProfile(user.uid)); // 👈 Add this
      showToast("Guest removed!", "info");
    });
    

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
              <span className="text-white font-medium">
                {list.guestListName}
              </span>
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

      {selectedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-[80%] relative animate-fadeIn">
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
                    className="flex justify-between p-2 rounded border border-gray-600 bg-gray-800 hover:bg-gray-700 text-white mb-2"
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
                  const email = e.target.value.trim();
                  setNewGuestEmail(email);
                }}
                placeholder="Enter guest name or email"
                className="input-field"
                autoFocus
              />
              <ul className="text-gray-300 grid overflow-y-auto max-h-60">
                {userList &&
                userList.filter(
                  (user) =>
                    user.name
                      .toLowerCase()
                      .includes(newGuestEmail.toLowerCase()) ||
                    user.emailAddress
                      .toLowerCase()
                      .includes(newGuestEmail.toLowerCase())
                ).length > 0 ? (
                  userList
                    .filter(
                      (user) =>
                        user.name
                          .toLowerCase()
                          .includes(newGuestEmail.toLowerCase()) ||
                        user.emailAddress
                          .toLowerCase()
                          .includes(newGuestEmail.toLowerCase())
                    )
                    .map((user) => (
                      <li
                        key={user.emailAddress}
                        onClick={() => setNewGuestEmail(user.emailAddress)}
                        className="cursor-pointer p-1 mr-1 rounded border border-gray-600 bg-gray-800 hover:bg-gray-700 text-white mb-2"
                      >
                        <div className="flex justify-between items-center">
                          <p>{user.name}</p>
                          <span>
                            <img
                              src={user.profilePicUrl || "/avatar.png"}
                              alt="Avatar"
                              className="w-10 h-10 rounded-full border-2 border-teal-400 object-cover"
                            />
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
              <button onClick={addGuest} className="btn-primary">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

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
            <input
              type="email"
              value={newGuestEmail}
              onChange={(e) => setNewGuestEmail(e.target.value)}
              placeholder="Enter guest email"
              className="p-2 rounded border border-gray-600 bg-gray-800 text-white w-full mb-3"
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

      <div className="fixed bottom-5 right-5 md:right-[5%] lg:right-[28%] z-10 md:z-40">
        <div className="relative">
          <button
            onClick={() => setShowFloatingMenu((prev) => !prev)}
            className="w-14 h-14 rounded-full btn-primary items-center justify-center shadow-lg transform transition-all hover:scale-105"
          >
            +
          </button>
          {showFloatingMenu && (
            <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-nowrap rounded-lg shadow-lg p-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowListModal(true);
                  setShowFloatingMenu(false);
                }}
                className="btn-primary w-full p-2"
              >
                Create List
              </button>
              <button
                onClick={() => {
                  setIsGuestListModalOpen(true);
                  setShowFloatingMenu(false);
                }}
                className="btn-primary w-full p-2"
              >
                Add Guest
              </button>
            </div>
          )}
        </div>
      </div>

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
