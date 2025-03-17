import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Message } from "../store/messageSlice";
import { FaRegSmile, FaPaperclip, FaPaperPlane } from "react-icons/fa";

interface ChatProps {
  conversation:
    | {
        contact: string;
        messages: Message[];
      }
    | undefined;
}

const reactions = ["👍", "❤️", "😂", "😮", "😢"];

const Chat: React.FC<ChatProps> = ({ conversation }) => {
  const currentUserId = useSelector((state: RootState) => state.auth.uid);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reactionsMap, setReactionsMap] = useState<{ [key: string]: string }>(
    {}
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && !selectedFile) return;

    // TODO: Dispatch sendMessage action with text or file
    console.log("Sending message:", newMessage, selectedFile);

    setNewMessage("");
    setSelectedFile(null);
  };

  const handleAttachFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleAddReaction = (messageId: string, reaction: string) => {
    setReactionsMap((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === reaction ? "" : reaction,
    }));
  };

  if (!conversation) {
    return <div className="flex-1 p-4">No conversation selected.</div>;
  }

  return (
    <div className="flex flex-col h-screen md:w-full p-5">
      {/* Chat Header */}
      <div className="p-4 bg-gray-800 text-white flex items-center rounded-3xl">
        <h2 className="text-lg font-semibold">{conversation.contact}</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {conversation.messages.map((msg) => (
          <div
            key={msg.timestamp}
            className={`flex ${
              msg.senderId === currentUserId ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs ${
                msg.senderId === currentUserId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              <p>{msg.message}</p>
              {reactionsMap[msg.timestamp] && (
                <span className="text-lg">{reactionsMap[msg.timestamp]}</span>
              )}
              <div className="text-xs text-gray-600 mt-1">
                {new Date(msg.timestamp!).toLocaleTimeString()}
              </div>
             
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Chat Input */}
      <div className="p-4  flex items-center border-t">
        <label className="cursor-pointer mr-2">
          <FaPaperclip size={20} />
          <input type="file" className="hidden" onChange={handleAttachFile} />
        </label>

        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded-3xl bg-transparent"
        />

        {selectedFile && (
          <span className="text-sm ml-2">{selectedFile.name}</span>
        )}

        <button className="ml-2" onClick={handleSendMessage}>
          <FaPaperPlane size={20} className="text-blue-500" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
