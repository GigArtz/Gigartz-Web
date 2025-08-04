import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import {
  FaTrash,
  FaEdit,
  FaUserPlus,
  FaUsers,
  FaBullhorn,
  FaPlus,
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
import BroadcastModal from "../components/BroadcastModal";
import BaseModal from "../components/BaseModal";
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
  const [newListDescription, setNewListDescription] = useState("");
  const [editingList, setEditingList] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [isGuestListModalOpen, setIsGuestListModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastingList, setBroadcastingList] = useState(null);
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
        console.error("Error updating guest list:", error);
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
        description: newListDescription,
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
    setNewListDescription("");
    setEditingList(null);
    setShowListModal(false);
  };

  const deleteList = async () => {
    // You would call a delete slice action here once implemented
    // await dispatch(deleteGuestList(user.uid, selectedList.id));
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
  const deleteGuest = async (username) => {
    console.log(selectedList);
    console.log("Deleting guest with username:", username);
    if (!selectedList) return;
    const guest = selectedList?.guests?.find(
      (user) => user.userName === username
    );
    if (!guest) {
      showToast("No matching guest found for this username!", "error");
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
    const guest = userList?.find((user) => user.userName === guestName);
    if (!guest) {
      showToast("No matching guest found with this userName!", "error");
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

  const handleBroadcastMessage = async (
    message: string,
    attachments?: File[]
  ) => {
    if (!broadcastingList || !message.trim()) {
      showToast("Invalid message or guest list", "error");
      return;
    }

    try {
      // Here you would implement the actual broadcast logic
      // For now, we'll just show a success message
      console.log("Broadcasting message:", message);
      console.log("To list:", broadcastingList.guestListName);
      console.log("Recipients:", broadcastingList.guests.length);
      console.log("Attachments:", attachments?.length || 0);

      showToast(
        `Message broadcasted to ${broadcastingList.guests.length} recipients!`,
        "success"
      );
    } catch (error) {
      console.error("Error broadcasting message:", error);
      showToast("Failed to broadcast message", "error");
    }
  };

  useEffect(() => {
    console.log("Selected List ", selectedList);
  }, [selectedList]);

  return (
    <div className="main-content p-6 animate-fade-in-up">
       <Header
            title="Guest List"
            renderRight={() => (
              <button
                onClick={() => {
                  setShowListModal(true);
                  setEditingList(null);
                  setNewListName("");
                  setNewListDescription("");
                  setShowFloatingMenu(false);
                }}
                className="w-10 h-10 rounded-full btn-primary flex items-center justify-center shadow-lg transform transition-all hover:scale-105 hover:shadow-xl hover:shadow-teal-500/25 animate-pulse-glow"
              >
                +
              </button>
            )}
          />

      {/* Compact Statistics Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4 animate-fade-in-up">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-3 rounded-lg text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 animate-slide-in-left">
          <p className="text-lg font-bold text-white animate-bounce-in">
            {guestLists.length}
          </p>
          <p className="text-xs text-white opacity-90">Lists</p>
        </div>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-lg text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 animate-fade-in-up animation-delay-100">
          <p className="text-lg font-bold text-white animate-bounce-in animation-delay-150">
            {guestLists.reduce(
              (total, list) => total + (list.guests?.length || 0),
              0
            )}
          </p>
          <p className="text-xs text-white opacity-90">Guests</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 rounded-lg text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 animate-slide-in-right animation-delay-200">
          <p className="text-lg font-bold text-white animate-bounce-in animation-delay-300">
            {guestLists.filter((list) => list.guests?.length > 0).length}
          </p>
          <p className="text-xs text-white opacity-90">Active</p>
        </div>
      </div>

      <div className="rounded-lg shadow-md animate-fade-in-left">
        {guestLists.length === 0 ? (
          <div className="bg-gray-800 border-2 border-dashed border-gray-600 p-6 rounded-lg text-center animate-fade-in transform hover:scale-105 transition-transform duration-300">
            <svg
              className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <p className="text-gray-400 text-sm animate-fade-in animation-delay-200">
              No guest lists available.
            </p>
            <p className="text-gray-500 text-xs mt-1 animate-fade-in animation-delay-400">
              Create your first guest list to get started
            </p>
          </div>
        ) : (
          guestLists.map((list, index) => (
            <div
              key={list.id}
              onClick={() => setSelectedList(list)}
              className={`cursor-pointer p-3 flex justify-between items-center bg-slate-900 rounded-xl mb-2 shadow-md transition-all duration-300 transform
    hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/20 animate-slide-in-up
    ${
      selectedList?.id === list.id
        ? "border border-teal-400 ring-1 ring-teal-300/50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
        : "border border-teal-600/30 hover:border-teal-400/50"
    }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                {/* Compact List icon */}
                <div className="p-1.5 bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg text-white transform hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                  <FaUsers className="w-3.5 h-3.5 animate-bounce-in animation-delay-200" />
                </div>

                {/* Compact Guest List Info */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm truncate hover:text-teal-300 transition-colors duration-200 animate-slide-in-left animation-delay-300">
                      {list.guestListName || "Unnamed List"}
                    </span>
                    <span className="text-xs text-teal-400 bg-teal-900/30 px-1.5 py-0.5 rounded-md flex-shrink-0">
                      {list.guests?.length || 0}
                    </span>
                  </div>
                  {list.description && (
                    <span className="text-gray-400 text-xs truncate animate-fade-in animation-delay-400">
                      {list.description}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-1 animate-slide-in-right animation-delay-400">
                {/* Compact Action Buttons */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBroadcastModalOpen(true);
                    setBroadcastingList(list);
                    setShowFloatingMenu(false);
                  }}
                  className="group relative text-white hover:text-green-400 hover:bg-gray-700 p-1.5 rounded-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-green-400"
                  title="Broadcast Message"
                >
                  <FaBullhorn className="w-3 h-3" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGuestListModalOpen(true);
                    setEditingList(list);
                    setShowFloatingMenu(false);
                  }}
                  className="group relative text-white hover:text-green-400 hover:bg-gray-700 p-1.5 rounded-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-green-400"
                  title="Add Guest"
                >
                  <FaUserPlus className="w-3 h-3" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingList(list);
                    setNewListName(list.guestListName || "");
                    setNewListDescription(list.description || "");
                    setSelectedList(list);
                    setShowListModal(true);
                  }}
                  className="group relative text-white hover:text-blue-400 hover:bg-gray-700 p-1.5 rounded-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  title="Edit List"
                >
                  <FaEdit className="w-3 h-3" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteList();
                  }}
                  className="group relative text-red-400 hover:text-red-600 hover:bg-gray-700 p-1.5 rounded-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-red-400"
                  title="Delete List"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for viewing/editing guests in a list */}
      <BaseModal
        isOpen={!!selectedList}
        onClose={() => setSelectedList(null)}
        title={selectedList?.guestListName}
        icon={<FaUsers className="w-5 h-5" />}
        closeOnClickOutside={true}
        minWidth="min-w-96"
        maxWidth="md:max-w-3xl"
      >
        <div className="flex flex-col gap-3 animate-fade-in-up">
          {selectedList?.guests && selectedList.guests.length > 0 ? (
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-300 text-sm font-medium animate-slide-in-left">
                Members ({selectedList.guests.length})
              </p>
              <span className="text-xs text-teal-400 bg-teal-900/30 px-2 py-1 rounded-md">
                Active List
              </span>
            </div>
          ) : (
            <div className="text-center py-4 animate-fade-in">
              <svg
                className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <p className="text-gray-400 text-sm animate-fade-in animation-delay-200">
                No guests added yet.
              </p>
            </div>
          )}

          <div className="space-y-2 overflow-y-auto max-h-64 animate-fade-in-up animation-delay-300">
            {selectedList?.guests && selectedList.guests.length > 0
              ? selectedList.guests.map((guest, index) => (
                  <div
                    key={`${guest.email}-${index}`}
                    className="flex justify-between items-center p-2.5 rounded-lg border border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 text-white transition-all duration-300 transform hover:scale-[1.01] animate-slide-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="relative flex-shrink-0">
                        <img
                          src={guest.profilePicUrl || "/avatar.png"}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full border border-teal-400/50 object-cover"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-gray-800 rounded-full"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-white truncate">
                          {guest.name}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          @{guest.userName || guest.emailAddress}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGuest(guest?.userName)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-600/20 rounded-lg p-1.5 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-red-400 flex-shrink-0"
                      title="Remove Guest"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                ))
              : null}
          </div>
        </div>
      </BaseModal>

      {/* GuestListModal for adding guests to a list */}
      <GuestListModal
        isOpen={isGuestListModalOpen && !!editingList}
        editingList={editingList}
        onClose={() => {
          setIsGuestListModalOpen(false);
          setEditingList(null);
        }}
      />

      {/* BroadcastModal for sending messages to guest list */}
      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => {
          setIsBroadcastModalOpen(false);
          setBroadcastingList(null);
        }}
        guestList={broadcastingList}
        onSend={handleBroadcastMessage}
        loading={false}
      />

      {/* Modal for creating/editing a list */}
      <BaseModal
        isOpen={showListModal}
        onClose={() => {
          setShowListModal(false);
          setEditingList(null);
          setNewListName("");
          setNewListDescription("");
        }}
        title={editingList ? "Edit List" : "Create New List"}
        icon={<FaEdit className="w-5 h-5" />}
        closeOnClickOutside={true}
        minWidth="min-w-96"
        maxWidth="md:max-w-lg"
      >
        <div className="space-y-4 animate-fade-in-up">
          <div className="space-y-3">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder={selectedList?.guestListName || "Enter list name"}
              className="input-field transform focus:scale-[1.01] transition-all duration-300 animate-slide-in-left"
              autoFocus
            />

            {/* Compact Description field */}
            <textarea
              value={newListDescription}
              onChange={(e) => setNewListDescription(e.target.value)}
              placeholder="Enter list description (optional)"
              className="input-field resize-none transform focus:scale-[1.01] transition-all duration-300 animate-slide-in-right animation-delay-100"
              rows={2}
            />
          </div>

          {/* Compact toggles in a row */}
          <div className="flex items-center justify-between gap-4 animate-fade-in animation-delay-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="public-private-toggle"
                className="toggle-checkbox transform hover:scale-110 transition-transform duration-200"
              />
              <label
                htmlFor="public-private-toggle"
                className="toggle-label text-gray-400 ml-2 text-sm hover:text-teal-300 transition-colors duration-200"
              >
                Public
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="paid-private-toggle"
                className="toggle-checkbox transform hover:scale-110 transition-transform duration-200"
              />
              <label
                htmlFor="paid-private-toggle"
                className="toggle-label text-gray-400 ml-2 text-sm hover:text-teal-300 transition-colors duration-200"
              >
                Paid Event
              </label>
            </div>
          </div>

          {!editingList && (
            <div className="animate-fade-in animation-delay-400 bg-teal-900/20 border border-teal-500/30 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-teal-300 text-xs">
                  Create a list first, then add guests through the add guest
                  button.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 animate-slide-in-up animation-delay-500">
            <button
              onClick={() => {
                setShowListModal(false);
                setEditingList(null);
                setNewListName("");
                setNewListDescription("");
              }}
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-300 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveList}
              className="btn-primary transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 text-sm px-4 py-2"
            >
              {editingList ? "Update List" : "Create List"}
            </button>
          </div>
        </div>
      </BaseModal>

      <div className="fixed sm:hidden bottom-4 right-4 z-20 animate-bounce-in animation-delay-1000">
        <div className="relative">
          <button
            onClick={() => setShowFloatingMenu((prev) => !prev)}
            className="w-12 h-12 rounded-xl btn-primary flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-teal-500/25 animate-pulse-glow"
          >
            <span className="text-xl font-bold text-white">+</span>
          </button>
          {showFloatingMenu && (
            <div className="absolute bottom-14 right-0 bg-gray-900 text-white rounded-xl shadow-xl border border-teal-500/20 p-2 flex flex-col gap-1 animate-slide-in-up min-w-max">
              <button
                onClick={() => {
                  setShowListModal(true);
                  setEditingList(null);
                  setNewListName("");
                  setNewListDescription("");
                  setShowFloatingMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-teal-600 rounded-lg transition-all duration-200 animate-slide-in-left"
              >
                <FaPlus className="w-3 h-3" />
                Create List
              </button>
              <button
                onClick={() => {
                  setIsGuestListModalOpen(true);
                  setShowFloatingMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-600 rounded-lg transition-all duration-200 animate-slide-in-right animation-delay-50"
              >
                <FaUserPlus className="w-3 h-3" />
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
