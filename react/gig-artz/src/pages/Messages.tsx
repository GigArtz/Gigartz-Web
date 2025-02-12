import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { getMessages, sendMessage, Message } from "../store/messageSlice";

// Define Contact and Conversation types for better typing
import { Contact, Conversation } from "../store/messageSlice";

const Messages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { contacts, conversations, loading, error } = useSelector(
    (state: RootState) => state.messages
  );
  const currentUserId = useSelector((state: RootState) => state.auth.uid); // Get the current user's ID from the state
  const [newMessage, setNewMessage] = useState("");

 

  useEffect(() => {
    if (currentUserId) {
      dispatch(getMessages(currentUserId)); // Fetch messages when the component mounts
    }
  }, [dispatch, currentUserId]);

  console.log(contacts)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim() === "") return;

    const messageData: Message = {
      senderId: currentUserId!,
      receiverId: conversations[0].contact, // Replace with the actual receiver ID
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    dispatch(sendMessage(messageData));
    setNewMessage(""); // Clear the input after sending
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h4>Direct Messages</h4>

          {/* Error Alert */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Loading Spinner */}
          {loading ? (
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <div>
              <div
                style={{ maxHeight: "500px", overflowY: "auto" }}
                className="mb-3"
              >
                {/* Display conversations */}
                {conversations.length === 0 ? (
                  <div className="card">
                    <div className="card-body">No messages yet</div>
                  </div>
                ) : (
                  conversations.map((conversation, index) => (
                    <div key={index}>
                      {/* Assuming each conversation has messages */}
                      {conversation.messages.map((msg, msgIndex) => (
                        <div
                          key={msgIndex}
                          className={`card my-2 ${
                            msg.senderId === currentUserId
                              ? "bg-primary text-white"
                              : "bg-light"
                          }`}
                        >
                          <div className="card-body">
                            <strong>
                              {msg.senderId === currentUserId ? "You" : contacts[index].userName}
                            </strong>
                            <p>{msg.message}</p>
                            <small>
                              {new Date(msg.timestamp!).toLocaleString()}
                            </small>
                          </div>
                        </div>
                      ))}
                      <hr />
                    </div>

                  ))
                )}
              </div>

              {/* Send Message Form */}
              <form onSubmit={handleSendMessage}>
                <div className="row">
                  <div className="col-10">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                    />
                  </div>
                  <div className="col-2">
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
