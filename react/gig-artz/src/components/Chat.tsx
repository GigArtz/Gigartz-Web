import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Message } from "../store/messageSlice";
import { FaPaperclip, FaPaperPlane, FaTimesCircle } from "react-icons/fa";

interface ChatProps {
  conversation?: {
    contact: string;
    messages: Message[];
  };
  handleSendMessage: (
    message?: string,
    file?: File | null,
    e?: React.FormEvent
  ) => void;
  handleCloseConversation: () => void; // Callback to close the conversation
}

const Chat: React.FC<ChatProps> = ({
  conversation,
  handleSendMessage,
  handleCloseConversation,
}) => {
  const currentUserId = useSelector((state: RootState) => state.auth.uid);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]); // Automatically scroll when messages update

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const groupMessagesByDate = () => {
    const grouped: { [date: string]: Message[] } = {};
    conversation?.messages.forEach((msg) => {
      if (
        msg.timestamp &&
        typeof msg.timestamp === "object" &&
        "seconds" in msg.timestamp
      ) {
        const date = formatDate(msg.timestamp.seconds);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(msg);
      } else if (
        typeof msg.timestamp === "string" &&
        !isNaN(Date.parse(msg.timestamp))
      ) {
        // Handle ISO string timestamps
        const date = formatDate(new Date(msg.timestamp).getTime() / 1000);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(msg);
      } else {
        console.warn("Invalid timestamp in message:", msg);
      }
    });
    return grouped;
  };

  if (!conversation)
    return <div className="flex-1 p-4">No conversation selected.</div>;

  const messagesGrouped = groupMessagesByDate();

  const onSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() || selectedFile) {
      handleSendMessage(newMessage, selectedFile, e);
      setNewMessage("");
      setSelectedFile(null);
    }
  };

  return (
    <div className="flex flex-col h-[100%] md:w-full">
      {/* Chat Header */}
      <div className=" p-4 bg-gray-800 text-white flex items-center shadow-md sticky top-0 z-10 justify-between">
        <h2 className="text-lg text-teal-500 font-semibold">{conversation.contact}</h2>
        <button
          onClick={handleCloseConversation}
          className="text-gray-400 hover:text-red-500 transition"
        >
          <FaTimesCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {Object.entries(messagesGrouped).map(([date, messages]) => (
          <div key={date}>
            <div className="text-center text-xs text-gray-500 my-2">{date}</div>
            {messages?.map((msg) => (
              <div
                key={msg.timestamp.seconds}
                className={`flex ${
                  msg.senderId === currentUserId
                    ? "justify-end"
                    : "justify-start"
                } mb-2`}
              >
                <div
                  className={`px-3  max-w-xs shadow-md ${
                    msg.senderId === currentUserId
                      ? "bg-blue-500 text-white p-1 rounded-2xl rounded-tr-none"
                      : "bg-gray-300 text-black p-1 rounded-2xl rounded-tl-none"
                  }`}
                >
                  <p className="text-[0.8em] ">{msg.message}</p>
                  <div className="text-[0.6em] text-gray-600 text-right">
                    {formatTime(msg.timestamp.seconds)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Chat Input */}
      <form
        onSubmit={onSendMessage}
        className="p-4 flex items-center sticky bottom-0 bg-gray-900"
      >
        <label className="cursor-pointer mr-2">
          <FaPaperclip size={20} />
          <input
            type="file"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
        </label>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="input-field flex-1"
        />
        {selectedFile && (
          <span className="text-sm ml-2">{selectedFile.name}</span>
        )}
        <button type="submit" className="ml-2 text-blue-500">
          <FaPaperPlane size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
