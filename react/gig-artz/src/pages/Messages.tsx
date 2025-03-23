import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { getMessages, sendMessage, Message } from "../store/messageSlice";
import Loader from "../components/Loader";
import Chat from "../components/Chat";
import { FaTimesCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom"; // Import useLocation

const Messages: React.FC = () => {
  const location = useLocation(); // Get the current location
  const queryParams = new URLSearchParams(location.search);
  const contactFromQuery = queryParams.get("contact"); // Extract contact from query

  const dispatch = useDispatch<AppDispatch>();
  const { contacts, conversations, loading } = useSelector(
    (state: RootState) => state.messages
  );
  const currentUserId = useSelector((state: RootState) => state.auth.uid);

  const [newMessage, setNewMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    contactFromQuery || null
  );

  // Memoize local conversations to avoid recalculating on every render
  const localConversations = useMemo(() => {
    if (!conversations) return [];
    return conversations.map((conv) => {
      if (conv.contact === activeConversation) {
        return { ...conv }; // Ensure active conversation is preserved
      }
      return conv;
    });
  }, [conversations, activeConversation]);

  // Fetch conversations on component mount
  const fetchConversations = useCallback(() => {
    if (currentUserId) {
      dispatch(getMessages(currentUserId));
    }
  }, [dispatch, currentUserId]);

  // Refresh conversations and merge new messages
  const refreshConversations = useCallback(() => {
    if (currentUserId) {
      dispatch(getMessages(currentUserId));
    }
  }, [dispatch, currentUserId]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      refreshConversations();
    }, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchConversations, refreshConversations]);

  const handleSendMessage = (
    newMessage: string,
    selectedFile: File | null,
    e?: React.FormEvent | null
  ) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newMessage || !selectedContact) {
      console.error("Message or selected contact is missing.");
      return;
    }

    const messageData: Message = {
      senderId: currentUserId!,
      receiverId: selectedContact,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update Redux store and refresh conversations
    dispatch(sendMessage(messageData)).then(() => {
      refreshConversations();
    });

    setNewMessage(""); // Clear input field
  };

  const handleConversationClick = (contactId: string) => {
    setActiveConversation(contactId);
    setSelectedContact(contactId);
  };

  const getConversation = (contactId: string) => {
    return localConversations.find(
      (conversation) => conversation.contact === contactId
    );
  };

  const handleCloseConversation = () => {
    setActiveConversation(null);
    setSelectedContact(null);
  };

  return (
    <div className="main-content flex h-screen">
      {/* Sidebar - Conversations List */}
      <div className="md:w-[30%] w-full md:border-r border-gray-700 p-4">
        <h2 className="hidden md:block text-xl font-semibold text-white-800 mb-4">
          Messages
        </h2>

        {loading && !conversations?.length ? (
          <Loader />
        ) : (
          <div className="max-h-[100vh] overflow-y-auto space-y-3">
            {localConversations.length === 0 ? (
              <p className="text-gray-500">No messages yet</p>
            ) : (
              localConversations.map((conversation) => {
                const contact = contacts?.find(
                  (c) =>
                    c.userName === conversation.contact ||
                    c.id === conversation.contact
                );
                const lastMessage = conversation.messages.at(-1);

                return (
                  <div
                    key={conversation.contact}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      activeConversation === conversation.contact
                        ? "bg-blue-500 text-white"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                    onClick={() =>
                      handleConversationClick(conversation.contact)
                    }
                  >
                    <h3 className="font-semibold">
                      {contact?.userName || "Unknown"}
                    </h3>
                    {lastMessage && (
                      <p className="text-sm text-gray-300 truncate">
                        {lastMessage.senderId === currentUserId ? "You: " : ""}
                        {lastMessage.message}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-5 right-4 md:hidden text-white w-40 rounded-3xl btn-primary"
        >
          New Message
        </button>
      </div>

      {/* Desktop Chat Panel */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        {activeConversation ? (
          <Chat
            conversation={getConversation(activeConversation)}
            handleSendMessage={handleSendMessage}
            handleCloseConversation={handleCloseConversation}
          />
        ) : (
          <div className="text-center p-8">
            <p className="mb-16">Select a conversation to start chatting.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden md:block mb-4 text-white w-40 rounded-3xl btn-primary"
            >
              New Message
            </button>
          </div>
        )}
      </div>

      {/* Mobile Chat Modal */}
      {activeConversation && (
        <div className="fixed z-10 inset-0 bg-black bg-opacity-70 flex md:hidden">
          <div className="bg-[#060512] h-full w-full flex flex-col relative">
            <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-[#060512] sticky top-0 z-10">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {contacts?.find(
                  (c) =>
                    c.userName === activeConversation ||
                    c.id === activeConversation
                )?.userName || "Unknown"}
              </h3>
              <button
                onClick={() => setActiveConversation(null)}
                className="text-gray-500 hover:text-red-500 transition"
              >
                <FaTimesCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <Chat
                conversation={getConversation(activeConversation)}
                handleSendMessage={handleSendMessage}
                handleCloseConversation={handleCloseConversation}
              />
            </div>
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#060512] z-30 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-[#1F1C29] border border-gray-700 p-5 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold mb-3">New Message</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 rounded-full hover:bg-red-400"
              >
                <FaTimesCircle className="w-5 h-5" />
              </button>
            </div>
            <select
              value={selectedContact || ""}
              onChange={(e) => setSelectedContact(e.target.value)}
              className="input-field mb-4"
            >
              <option value="">Select a contact</option>
              {contacts?.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.userName}
                </option>
              ))}
            </select>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="input-field mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={(e) => handleSendMessage(newMessage, null, e)}
                className="w-28 rounded-3xl btn-primary"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
