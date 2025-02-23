import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { getMessages, sendMessage, Message } from "../store/messageSlice";
import Loader from "../components/Loader";

const Messages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { contacts, conversations, loading, error } = useSelector(
    (state: RootState) => state.messages
  );
  const currentUserId = useSelector((state: RootState) => state.auth.uid);

  const [newMessage, setNewMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState("");

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
    setNewMessage(""); // Clear the input
    setIsModalOpen(false); // Close modal after sending
  };

  return (
    <div className="main-content">
      {loading && <Loader message="Loading ..." />}
      <div className="flex md:flex-row justify-center h-screen">
        <div className="md:border-r border-gray-700  w-[26rem]">
          <h2 className="text-xl font-semibold text-white-800 mb-4">
            Messages
          </h2>
          {/* Error Alert */}
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {/* Conversations List */}
          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {loading ? (
              <p className="text-gray-500">Loading messages...</p>
            ) : conversations.length === 0 ? (
              <p className="text-gray-500">No messages yet</p>
            ) : (
              conversations.map((conversation, index) => (
                <div key={index} className="p-3 border rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-700">
                    {contacts.find((c) => c.id === conversation.contact)
                      ?.userName || "Unknown"}
                  </h3>
                  {conversation.messages.map((msg, msgIndex) => (
                    <div
                      key={msgIndex}
                      className={`p-2 rounded-md mt-2 w-fit ${
                        msg.senderId === currentUserId
                          ? "bg-blue-500 text-white ml-auto"
                          : "bg-gray-200"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <small className="text-xs opacity-75 block">
                        {new Date(msg.timestamp!).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* New Conversation Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="md:hidden fixed bottom-5 right-4 mb-4 text-white w-40 rounded-3xl btn-primary"
          >
            New Message
          </button>
        </div>

        <div className="hidden md:flex md:items-center ">
          <div className="p-8">
            <p className="mb-16">
              Select a message Choose from your existing conversations, start a
              new one, or just keep swimming.
            </p>
            {/* New Conversation Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="mb-4 text-white w-40 rounded-3xl btn-primary"
            >
              New Message
            </button>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#060512]  bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-[#1F1C29] border border-gray-700  p-5 rounded-lg shadow-lg w-96">
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
