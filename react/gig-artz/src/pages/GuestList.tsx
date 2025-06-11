import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import {
  FaTimesCircle,
  FaTrash,
  FaEdit,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import Toast from "../components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  addGuestsToGuestList,
  createGuestList,
  deleteGuestFromGuestList,
  updateGuestList,
} from "../../store/eventsSlice";
import GuestListModal from "../components/GuestListModal";
import { fetchAUserProfile } from "../../store/profileSlice";

function GuestList() {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile, userList, userGuestList } = useSelector(
    (state: RootState) => state.profile
  );

  const [guestLists, setGuestLists] = useState(userGuestList || []);

  const [selectedList, setSelectedList] = useState(null);
  const [newGuestName, setNewGuestName] = useState("");
  const [newListName, setNewListName] = useState("");
  const [editingList, setEditingList] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [isGuestListModalOpen, setIsGuestListModalOpen] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  useEffect(() => {
    console.log(profile);
    console.log(userList);
    console.log(guestLists);
  }, [profile, userList, guestLists]);

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

  // Edit guest list name
  const handleSaveList = async () => {
    if (!newListName.trim()) {
      showToast("List name cannot be empty!", "error");
      return;
    }
    if (editingList) {
      try {
        await dispatch(updateGuestList(user.uid, editingList.id, newListName));
        showToast("Guest list updated successfully!", "success");
        setEditingList(null);
        setShowListModal(false);
      } catch (error) {
        showToast("Failed to update guest list.", "error");
      }
      return;
    }

    if (!editingList) {
      // Optimistically add new guest list
      const tempId = `temp-${Date.now()}`;
      const optimisticList = {
        id: tempId,
        guestListName: newListName,
        guests: [],
      };
      setGuestLists((prev) => [...prev, optimisticList]);

      try {
        const actionResult = await dispatch(
          createGuestList({ userId: user.uid, guestListName: newListName })
        );
        let guestListId = undefined;
        if (actionResult && typeof actionResult === "object") {
          if (
            actionResult.payload &&
            (actionResult.payload.id ||
              typeof actionResult.payload === "string")
          ) {
            guestListId = actionResult.payload.id || actionResult.payload;
          } else if (actionResult.id) {
            guestListId = actionResult.id;
          }
        } else if (typeof actionResult === "string") {
          guestListId = actionResult;
        }
        // Replace temp list with real one if possible
        if (guestListId) {
          setGuestLists((prev) =>
            prev.map((list) =>
              list.id === tempId ? { ...list, id: guestListId } : list
            )
          );
        }
        const guest = userList?.find((user) => user.name === newGuestName);
        if (guestListId && guest?.name) {
          await dispatch(
            addGuestsToGuestList(user.uid, String(guestListId), guest.name)
          );
          dispatch(fetchAUserProfile(user.uid));
          setSelectedList(null);
          showToast("New list created successfully!", "success");
        } else {
          showToast("Failed to create guest list or invalid guest.", "error");
        }
      } catch (error) {
        // Remove optimistically added list on error
        setGuestLists((prev) => prev.filter((list) => list.id !== tempId));
        console.error("Error creating guest list or adding guest:", error);
        showToast("Failed to create guest list.", "error");
      }
    } else {
      showToast("Editing guest lists is not yet implemented.", "info");
    }

    setNewListName("");
    setNewGuestName("");
    setEditingList(null);
    setShowListModal(false);
  };

  const deleteList = async () => {
    // You would call a delete slice action here once implemented
    await dispatch();
    showToast("List deleted! (API logic not implemented)", "info");
    setSelectedList(null);
  };

  const addGuest = async () => {
    if (!newGuestName.trim() || !selectedList) {
      showToast("Guest email cannot be empty!", "error");
      return;
    }

    const guest = userList?.find((user) => user.emailAddress === newGuestName);

    if (!guest || !guest.name) {
      showToast("Each guest must have a valid username.", "error");
      return;
    }

    const isGuestAlreadyAdded = selectedList.guests.some(
      (existingGuest) => existingGuest.name === guest.name
    );

    if (isGuestAlreadyAdded) {
      showToast("This guest is already added to the list.", "error");
      return;
    }

    try {
      await dispatch(
        addGuestsToGuestList(user.uid, String(selectedList.id), guest.userName)
      );
      setSelectedList(null);
      showToast("Guest added successfully!", "success");
    } catch (error) {
      console.error("Error adding guest:", error);
      showToast("Failed to add guest.", "error");
    }

    setNewGuestName("");
  };

  // Delete guest from guest list
  const deleteGuest = async (guestEmail) => {
    console.log("Deleting guest with email:", guestEmail);
    if (!selectedList) return;
    const guest = userList?.find((user) => user.emailAddress === guestEmail);
    if (!guest) {
      showToast("No matching guest found for this email!", "error");
      return;
    }
    await dispatch(
      deleteGuestFromGuestList(
        user.uid,
        String(selectedList.id),
        guest.userName || guest.emailAddress
      )
    );
    showToast("Guest removed!", "success");
  };

  const handleAddGuestToList = (listId, guestName) => {
    const guest = userList?.find((user) => user.emailAddress === guestName);
    if (!guest) {
      showToast("No matching guest found with this email!", "error");
      return;
    }
    setGuestLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              guests: [...list.guests, { name: guest.name }],
            }
          : list
      )
    );
    showToast("Guest added successfully!", "success");
  };

  useEffect(() => {
    console.log("Selected List ", selectedList);
  }, [selectedList]);

  return (
    <div className="main-content p-6">
      <div className="relative flex justify-end h-20 mb-12 top-0">
        <div className="absolute w-full left-0">
          <Header title="Guest List" />
        </div>

        {/* Floating action button + menu */}
        <div className="relative md:flex items-center justify-center h-full me-4 hidden">
          <button
            onClick={() => {
              setShowListModal(true);
              setEditingList(null);
              setNewListName("");
              setShowFloatingMenu(false);
            }}
            className="w-10 h-10 rounded-full btn-primary flex items-center justify-center shadow-lg transform transition-all hover:scale-105"
          >
            +
          </button>

          {showFloatingMenu && (
            <div className="absolute right-0 top-16 bg-dark text-white whitespace-nowrap rounded-lg shadow-lg p-2 flex flex-col gap-2 z-10">
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

      <div className="rounded-lg shadow-md">
        {guestLists.length === 0 ? (
          <p className="text-gray-400 text-center">No guest lists available.</p>
        ) : (
          guestLists.map((list) => (
            <div
              key={list.id}
              onClick={() => setSelectedList(list)}
              className={`cursor-pointer p-5 flex justify-between items-center bg-slate-900 rounded-3xl mb-3 shadow-md transition-all duration-200
    hover:scale-[1.025] hover:shadow-xl
    ${
      selectedList?.id === list.id
        ? "border-teal-400 ring-2 ring-teal-300"
        : "border-teal-600 hover:border-teal-400"
    }`}
            >
              <div className="flex items-center gap-3">
                {/* List icon */}
                <div className="p-2 bg-gray-700 rounded-full text-white">
                  <FaUsers className="w-5 h-5" />
                </div>

                {/* Guest List Name */}
                <span className="text-white font-semibold text-base tracking-wide">
                  {list.guestListName || "Unnamed List"}
                </span>
              </div>

              <div className="flex gap-2">
                {/* Add Guest */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGuestListModalOpen(true);
                    setEditingList(list);
                    setShowFloatingMenu(false);
                  }}
                  className="group relative text-white hover:text-green-400 hover:bg-gray-700 p-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <FaUserPlus className="w-4 h-4" />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-black text-xs text-white px-2 py-1 rounded shadow">
                    Add Guest
                  </span>
                </button>

                {/* Edit List */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingList(list);
                    setNewListName(list.name);
                    setSelectedList(list);
                    setShowListModal(true);
                  }}
                  className="group relative text-white hover:text-blue-400 hover:bg-gray-700 p-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <FaEdit className="w-4 h-4" />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-black text-xs text-white px-2 py-1 rounded shadow">
                    Edit
                  </span>
                </button>

                {/* Delete List */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteList();
                  }}
                  className="group relative text-red-400 hover:text-red-600 hover:bg-gray-700 p-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <FaTrash className="w-4 h-4" />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-black text-xs text-white px-2 py-1 rounded shadow">
                    Delete
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for editing/adding guests to a list */}
      {selectedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="p-4 min-w-96  md:max-w-11/12 bg-dark rounded-lg shadow-lg relative animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 p-1 py-2 border-b border-gray-500 ">
              {/* editing list modal header */}
              <h3 className="text-xl font-semibold text-teal-500">
                {selectedList?.guestListName}
              </h3>
              <button
                onClick={() => setSelectedList(null)}
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <FaTimesCircle className="w-6 h-6 hover:text-red-500" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {selectedList.guests && selectedList.guests.length > 0 ? (
                <p>Existing Members</p>
              ) : (
                <p></p>
              )}
              <ul className="space-y-2 mb-3 overflow-y-auto max-h-60">
                {selectedList.guests && selectedList.guests.length > 0 ? (
                  selectedList.guests.map((guest, index) => (
                    <li
                      key={`${guest.email}-${index}`}
                      className="flex justify-between items-center p-2 rounded-lg border border-gray-700 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 hover:bg-gray-700 text-white mb-1 transition-transform transform hover:scale-[1.01] shadow"
                    >
                      <span className="flex items-center gap-2">
                        <img
                          src={guest.profilePicUrl || "/avatar.png"}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full border-2 border-teal-400 shadow object-cover"
                        />
                        <span className="font-medium text-sm">
                          {guest.name}
                        </span>
                        <span className="text-gray-400 text-xs">
                          @{guest.userName || guest.emailAddress}
                        </span>
                      </span>
                      <button
                        onClick={() => deleteGuest(guest?.emailAddress)}
                        className="text-red-400 hover:text-red-600 bg-gray-700 hover:bg-gray-600 rounded-full p-1 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                        title="Remove Guest"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">No guests added.</p>
                )}
              </ul>
            </div>

            {/* 
            <div className="flex flex-col gap-2">
              <p>Add Members</p>
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

              {newGuestName.trim().length > 0 && (
                <ul className="text-gray-300 grid overflow-y-auto max-h-32 mt-2">
                  {userList &&
                  userList.filter(
                    (user) =>
                      user.name
                        .toLowerCase()
                        .includes(newGuestName.toLowerCase()) ||
                      user.emailAddress
                        .toLowerCase()
                        .includes(newGuestName.toLowerCase())
                  ).length > 0 ? (
                    userList
                      .filter(
                        (user) =>
                          user.name
                            .toLowerCase()
                            .includes(newGuestName.toLowerCase()) ||
                          user.emailAddress
                            .toLowerCase()
                            .includes(newGuestName.toLowerCase())
                      )
                      .map((user) => (
                        <li
                          key={user.emailAddress}
                          onClick={() => setNewGuestName(user.emailAddress)}
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

              <button onClick={addGuest} className="btn-primary">
                Add
              </button>
            </div>
         
          */}
          </div>
        </div>
      )}

      {/* GuestListModal for adding guests to a list */}
      <GuestListModal
        isOpen={isGuestListModalOpen && !!editingList}
        editingList={editingList}
        onClose={() => {
          setIsGuestListModalOpen(false);
          setEditingList(null);
        }}
      />

      {/* Modal for creating a new list */}
      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="p-4 md:max-w-11/12 min-w-96 bg-dark rounded-lg shadow-lg relative animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 p-1 py-2 border-b border-gray-500 ">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingList ? "Edit List" : "Create New List"}
              </h3>
              <button
                onClick={() => {
                  setShowListModal(false);
                  setEditingList(null);
                }}
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <FaTimesCircle className="w-6 h-6 hover:text-red-500" />
              </button>
            </div>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder={selectedList?.guestListName || "Enter list name"}
              className="input-field mb-3"
              autoFocus
            />
            {/* Public or Private */}
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="public-private-toggle"
                className="toggle-checkbox"
              />
              <label
                htmlFor="public-private-toggle"
                className="toggle-label text-gray-400 ml-2"
              >
                Public
              </label>
            </div>
            {editingList ? (
              <div></div>
            ) : (
              <p className="text-gray-400 mb-3">
                Create a list first, then add guests.
              </p>
            )}
            <div className="flex justify-end">
              <button onClick={handleSaveList} className="btn-primary">
                {editingList ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed sm:hidden  bottom-5 right-5 md:right-[5%] lg:right-[28%] z-10 md:z-40">
        <div className="relative">
          <button
            onClick={() => setShowFloatingMenu((prev) => !prev)}
            className="w-14 h-14 rounded-full btn-primary items-center justify-center shadow-lg transform transition-all hover:scale-105"
          >
            +
          </button>
          {showFloatingMenu && (
            <div className="absolute bottom-16 right-0 bg-dark text-white text-nowrap rounded-lg shadow-lg p-2 flex flex-col gap-2">
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
