import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Message } from "../../store/messageSlice";
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
  handleCloseConversation: () => void;
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
  const { userList } = useSelector((state: RootState) => state.profile);

  // Convert timestamps efficiently
  const parseTimestamp = (msg: Message): number | null => {
    if (
      msg.timestamp &&
      typeof msg.timestamp === "object" &&
      "seconds" in msg.timestamp
    ) {
      return msg.timestamp.seconds * 1000;
    } else if (
      typeof msg.timestamp === "string" &&
      !isNaN(Date.parse(msg.timestamp))
    ) {
      return new Date(msg.timestamp).getTime();
    }
    return null;
  };

  // Memoized message grouping for better performance
  const messagesGrouped = useMemo(() => {
    const grouped: { [date: string]: Message[] } = {};
    conversation?.messages.forEach((msg) => {
      const timestamp = parseTimestamp(msg);
      if (timestamp) {
        const date = new Date(timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(msg);
      }
    });
    return grouped;
  }, [conversation?.messages]);

  if (!conversation)
    return (
      <div className="flex-1 p-4 text-gray-500">No conversation selected.</div>
    );

  const onSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() || selectedFile) {
      handleSendMessage(newMessage, selectedFile, e);
      setNewMessage("");
      setSelectedFile(null);
    }
  };

  const getUsernameById = (userId: string) => {
    const user = userList?.find((user) => user.id === userId);
    return user ? user.userName : "Unknown User";
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-dark text-white">
      {/* Chat Header */}
      <div className="p-4 bg-gray-800 flex items-center shadow-md sticky top-0 z-10 justify-between rounded-2xl">
        <h2 className="text-lg text-teal-400 font-semibold">
          {getUsernameById(conversation?.contact)}
        </h2>
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
            {messages.map((msg) => (
              <MessageBubble
                key={parseTimestamp(msg) || Math.random()}
                msg={msg}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Chat Input */}
      <form
        onSubmit={onSendMessage}
        className="p-4 flex items-center sticky rounded-2xl bottom-0 bg-gray-900 z-10 mb-1"
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
          className="flex-1 p-2 rounded-lg bg-gray-900 text-white outline-none"
        />
        {selectedFile && (
          <span className="text-sm ml-2 text-gray-400">
            {selectedFile.name}
          </span>
        )}
        <button
          type="submit"
          className="ml-2 text-blue-400 hover:text-blue-300"
        >
          <FaPaperPlane size={20} />
        </button>
      </form>
    </div>
  );
};

// Memoized Message Bubble Component
const MessageBubble = React.memo(
  ({ msg, currentUserId }: { msg: Message; currentUserId: string }) => {
    const isSender = msg.senderId === currentUserId;
    const timestamp = msg.timestamp.seconds
      ? msg.timestamp.seconds * 1000
      : Date.parse(msg.timestamp as string);

    return (
      <div
        className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2`}
      >
        <div
          className={`px-4 py-2 max-w-xs shadow-md text-sm ${
            isSender
              ? "bg-blue-500 text-white rounded-2xl rounded-tr-none"
              : "bg-gray-300 text-black rounded-2xl rounded-tl-none"
          }`}
        >
          <p>{msg.message}</p>
          <div className="text-xs text-gray-400 text-right">
            {timestamp
              ? new Date(timestamp).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              : "Unknown time"}
          </div>
        </div>
      </div>
    );
  }
);

export default Chat;
