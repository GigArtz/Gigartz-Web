import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Message } from "../store/messageSlice";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";

interface ChatProps {
  conversation?: {
    contact: string;
    messages: Message[];
  };
}

const Chat: React.FC<ChatProps> = ({ conversation }) => {
  const currentUserId = useSelector((state: RootState) => state.auth.uid);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const groupMessagesByDate = () => {
    const grouped: { [date: string]: Message[] } = {};
    conversation?.messages.forEach((msg) => {
      const date = formatDate(msg.timestamp.seconds);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    return grouped;
  };

  if (!conversation) return <div className="flex-1 p-4">No conversation selected.</div>;

  const messagesGrouped = groupMessagesByDate();

  return (
    <div className="flex flex-col h-screen md:w-full p-4">
      {/* Chat Header */}
      <div className="p-4 bg-gray-800 text-white flex items-center rounded-3xl shadow-md">
        <h2 className="text-lg font-semibold">{conversation.contact}</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {Object.entries(messagesGrouped).map(([date, messages]) => (
          <div key={date}>
            <div className="text-center text-xs text-gray-500 my-2">{date}</div>
            {messages.map((msg) => (
              <div key={msg.timestamp.seconds} className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"} mb-2`}>
                <div className={`p-3 rounded-lg max-w-xs shadow-md ${msg.senderId === currentUserId ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
                  <p>{msg.message}</p>
                  <div className="text-xs text-gray-600 mt-1 text-right">{formatTime(msg.timestamp.seconds)}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Chat Input */}
      <div className="p-4 flex items-center border-t shadow-md">
        <label className="cursor-pointer mr-2">
          <FaPaperclip size={20} />
          <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
        </label>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded-3xl bg-gray-100"
        />
        {selectedFile && <span className="text-sm ml-2">{selectedFile.name}</span>}
        <button className="ml-2 text-blue-500" onClick={() => setNewMessage("")}> {/* handleSendMessage should be implemented */}
          <FaPaperPlane size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chat;