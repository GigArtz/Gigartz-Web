import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { getMessages, sendMessage, Message } from "../store/messageSlice";
import Loader from "../components/Loader";
import Chat from "../components/Chat";

const Messages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { contacts, conversations, loading, error } = useSelector(
    (state: RootState) => state.messages
  );
  const currentUserId = useSelector((state: RootState) => state.auth.uid);

  const [newMessage, setNewMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState("");
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (currentUserId) {
      dispatch(getMessages(currentUserId));
    }
  }, [dispatch, currentUserId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const messageData: Message = {
      senderId: currentUserId!,
      receiverId: selectedContact,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    dispatch(sendMessage(messageData));
    setNewMessage("");
    setIsModalOpen(false);
  };

  const getConversation = (contactId: string) => {
    return conversations.find(
      (conversation) => conversation.contact === contactId
    );
  };

  return (
    <div className="main-content flex h-screen">
      {/* Sidebar - Conversations List */}
      <div className="md:w-[30%] w-full md:border-r border-gray-700 p-4">
        <h2 className="text-xl font-semibold text-white-800 mb-4">Messages</h2>

        {loading && <Loader message="Loading..." />}
        {error && <div className="text-red-500 text-sm">{error}</div>}

        {/* Conversations */}
        <div className="max-h-[75vh] overflow-y-auto space-y-3">
          {conversations.length === 0 ? (
            <p className="text-gray-500">No messages yet</p>
          ) : (
            conversations.map((conversation) => {
              const contact = contacts.find(
                (c) => c.id === conversation.contact
              );
              const lastMessage = conversation.messages.length
                ? conversation.messages[conversation.messages.length - 1]
                : null;

              return (
                <div
                  key={conversation.contact}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    activeConversation === conversation.contact
                      ? "bg-blue-500 text-white"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                  onClick={() => setActiveConversation(conversation.contact)}
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

        {/* New Conversation Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-5 right-4 md:hidden text-white w-40 rounded-3xl btn-primary"
        >
          New Message
        </button>
      </div>

      {/* Chat Panel */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        {activeConversation ? (
          <Chat conversation={getConversation(activeConversation)} />
        ) : (
          <div className="text-center p-8">
            <p className="mb-16">Select a conversation to start chatting.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mb-4 text-white w-40 rounded-3xl btn-primary"
            >
              New Message
            </button>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#060512] bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-[#1F1C29] border border-gray-700 p-5 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-3">New Message</h3>
            <select
              value={selectedContact}
              onChange={(e) => setSelectedContact(e.target.value)}
              className="input-field mb-4"
            >
              <option value="">Select a contact</option>
              {contacts.map((contact) => (
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
                onClick={() => setIsModalOpen(false)}
                className="bg-red-300 px-3 py-1 rounded-lg hover:bg-red-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
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
