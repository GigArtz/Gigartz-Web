import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  getMessages,
  sendMessage,
  Message,
  addConversation, // Import action to add a new conversation
} from "../../store/messageSlice";
import {
  getDisplayNameByContactId,
  getConversationUserData,
} from "../../store/profileSlice";
import Loader from "../components/Loader";
import Chat from "../components/Chat";
import BaseModal from "../components/BaseModal";
import { FaSearch, FaPlus, FaUsers } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Messages: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const contactFromQuery = queryParams.get("contact");

  const dispatch = useDispatch<AppDispatch>();
  const { conversations, loading } = useSelector(
    (state: RootState) => state.messages
  );
  const { userList } = useSelector((state: RootState) => state.profile);
  const currentUserId = useSelector((state: RootState) => state.auth.uid);

  const [newMessage, setNewMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    contactFromQuery || null
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Memoized local conversations with deduplication
  const localConversations = useMemo(() => {
    if (!conversations) return [];

    // Remove duplicates based on contact ID
    const uniqueConversations = conversations.filter(
      (conversation, index, arr) =>
        arr.findIndex((conv) => conv.contact === conversation.contact) === index
    );

    return uniqueConversations;
  }, [conversations]);

  const fetchConversations = useCallback(() => {
    if (currentUserId) {
      dispatch(getMessages(currentUserId));
    }
  }, [dispatch, currentUserId]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (contactFromQuery) {
      const existingConversation = localConversations.find(
        (conversation) => conversation.contact === contactFromQuery
      );

      if (!existingConversation) {
        // Persistently create a new conversation if it doesn't exist
        dispatch(addConversation({ contact: contactFromQuery, messages: [] }));
      }

      setActiveConversation(contactFromQuery);
      setSelectedContact(contactFromQuery);
    } else {
      setActiveConversation(null);
      setSelectedContact(null);
    }
  }, [contactFromQuery, localConversations, dispatch]);

  const handleSendMessage = (
    newMessage: string,
    selectedFile: File | null,
    e?: React.FormEvent
  ) => {
    if (e) e.preventDefault();
    if (!newMessage || !selectedContact) return;

    const messageData: Message = {
      senderId: currentUserId!,
      receiverId: selectedContact,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    dispatch(sendMessage(messageData)).then(fetchConversations);
    setNewMessage("");
  };

  const handleConversationClick = (contactId: string) => {
    const existingConversation = localConversations.find(
      (conversation) => conversation.contact === contactId
    );

    if (!existingConversation) {
      dispatch(addConversation({ contact: contactId, messages: [] }));
    }

    setActiveConversation(contactId);
    setSelectedContact(contactId);
    navigate(`/messages?contact=${contactId}`);
  };

  const handleCloseConversation = () => {
    setActiveConversation(null);
    setSelectedContact(null);
    navigate("/messages");
  };

  const getUsernameById = useCallback(
    (contactId: string) => {
      return getDisplayNameByContactId(contactId, userList || []);
    },
    [userList]
  );

  // Get full conversation user data for enhanced display
  const getConversationData = useCallback(
    (contactId: string) => {
      return getConversationUserData(contactId, userList || []);
    },
    [userList]
  );

  // Filter conversations based on search term
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return localConversations;
    return localConversations.filter((conversation) => {
      const username = getUsernameById(conversation.contact) || "Unknown";
      return username.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [localConversations, searchTerm, getUsernameById]);

  return (
    <div className="main-content animate-fade-in-up transition-all duration-500">
     <div>
        <Header title="Messages" />
      </div>
    <div className=" flex h-screen bg-dark">
     
      {!activeConversation || window.innerWidth >= 768 ? (
        <div className="md:w-[30%] w-full md:border-r border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
           

            {/* Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 input-field"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading && !conversations?.length ? (
              <div className="p-4 flex flex-col items-center justify-center h-full text-gray-400">
                <div className="animate-pulse w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">
                  Loading conversations...
                </h3>
                <p className="text-sm">
                  Please wait while we fetch your messages.
                </p>
              </div>
            ) : (
              <div className="p-2">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    {searchTerm ? (
                      <div>
                        <FaSearch className="mx-auto text-2xl mb-2 opacity-50" />
                        <p>No conversations found</p>
                      </div>
                    ) : (
                      <div>
                        <FaUsers className="mx-auto text-2xl mb-2 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">Start a new conversation</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredConversations.map((conversation) => {
                      const lastMessage = conversation.messages.at(-1);
                      const isActive =
                        activeConversation === conversation.contact;
                      const hasUnread =
                        lastMessage && lastMessage.senderId !== currentUserId;

                      // Get comprehensive user data for this conversation
                      const conversationData = getConversationData(
                        conversation.contact
                      );

                      return (
                        <div
                          key={conversation.contact}
                          className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                            isActive
                              ? "bg-teal-600 text-white border-teal-500 shadow-lg transform scale-[1.02]"
                              : "bg-gray-800 hover:bg-gray-700 border-transparent hover:border-gray-600"
                          }`}
                          onClick={() =>
                            handleConversationClick(conversation.contact)
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {/* Profile picture or avatar */}
                              {conversationData.profilePic ? (
                                <img
                                  src={conversationData.profilePic}
                                  alt={conversationData.displayName}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                                  onError={(e) => {
                                    // Fallback to gradient avatar if image fails to load
                                    e.currentTarget.style.display = "none";
                                    const nextElement = e.currentTarget
                                      .nextElementSibling as HTMLElement;
                                    if (nextElement)
                                      nextElement.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg ${
                                  conversationData.profilePic
                                    ? "hidden"
                                    : "flex"
                                }`}
                              >
                                {(conversationData.displayName ||
                                  "U")[0].toUpperCase()}
                              </div>
                              {hasUnread && !isActive && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-800"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm truncate">
                                  {conversationData.displayName}
                                </h3>
                              </div>

                              {lastMessage && (
                                <p
                                  className={`text-xs truncate ${
                                    isActive ? "text-gray-200" : "text-gray-400"
                                  }`}
                                >
                                  {lastMessage.senderId === currentUserId
                                    ? "You: "
                                    : ""}
                                  {lastMessage.message}
                                </p>
                              )}
                              {lastMessage && (
                                <p
                                  className={`text-xs ${
                                    isActive ? "text-gray-300" : "text-gray-500"
                                  }`}
                                >
                                  {new Date(
                                    typeof lastMessage.timestamp === "string"
                                      ? lastMessage.timestamp
                                      : Date.now()
                                  ).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* New Message Button */}
          <div className="p-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 btn-primary-sm transition-all transform hover:scale-105"
            >
              <FaPlus className="text-sm" />
              Message
            </button>
          </div>
        </div>
      ) : null}

      <div
        className={`${
          activeConversation && window.innerWidth < 768
            ? "flex"
            : "hidden md:flex"
        } flex-1 flex flex-col`}
      >
        {activeConversation ? (
          <Chat
            conversation={localConversations.find(
              (c) => c.contact === activeConversation
            )}
            handleSendMessage={handleSendMessage}
            handleCloseConversation={handleCloseConversation}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-teal-900 rounded-full p-4 mb-6 border border-teal-500 opacity-80">
              <FaUsers className="text-4xl text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Welcome to Messages
            </h3>
            <p className="text-gray-400 mb-8 max-w-md">
              Select a conversation from the sidebar to start chatting, or
              create a new message to get started.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 btn-primary transition-all transform hover:scale-105"
              >
                <FaPlus className="text-sm text-center" />
                Start New Conversation
              </button>
            </div>
          </div>
        )}
      </div>

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Message"
        icon={<FaPlus />}
        maxWidth="md:max-w-md"
        minWidth="min-w-80"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Contact
            </label>
            <select
              value={selectedContact || ""}
              onChange={(e) => setSelectedContact(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            >
              <option value="">Choose a contact</option>
              {userList?.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.userName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              handleSendMessage(newMessage, null, e);
              setIsModalOpen(false);
            }}
            disabled={!selectedContact || !newMessage.trim()}
            className="px-6 py-2 btn-primary-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            Send Message
          </button>
        </div>
      </BaseModal>
    </div>
    </div>
  );
};

export default Messages;
