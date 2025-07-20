import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Message } from "../../store/messageSlice";
import { getConversationUserData } from "../../store/profileSlice";
import {
  FaPaperclip,
  FaPaperPlane,
  FaChevronLeft,
  FaUser,
  FaImage,
} from "react-icons/fa";

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

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // Convert timestamps efficiently
  const parseTimestamp = (msg: Message): number | null => {
    if (
      msg.timestamp &&
      typeof msg.timestamp === "object" &&
      msg.timestamp &&
      "seconds" in msg.timestamp
    ) {
      return (msg.timestamp as { seconds: number }).seconds * 1000;
    } else if (
      msg.timestamp &&
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

  // Get comprehensive user data for the conversation header
  const conversationData = getConversationUserData(
    conversation?.contact || "",
    userList || []
  );

  return (
    <div className="flex-1 flex flex-col h-full text-white">
      {/* Chat Header */}
      <div className="sticky top-0 z-50 p-4 border-b border-gray-700 flex items-center justify-between bg-gray-900 bg-opacity-95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCloseConversation}
            className="md:hidden p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          {/* Enhanced profile display */}
          <div className="relative">
            {conversationData.profilePic ? (
              <img
                src={conversationData.profilePic}
                alt={conversationData.displayName}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const nextElement = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center text-white font-bold ${
                conversationData.profilePic ? "hidden" : "flex"
              }`}
            >
              {(conversationData.displayName || "U")[0].toUpperCase()}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {conversationData.displayName}
            </h2>
            {conversationData.user &&
              conversationData.displayName !== conversationData.userName && (
                <p className="text-sm text-gray-400">
                  @{conversationData.userName}
                </p>
              )}
            {conversationData.user &&
              (conversationData.city || conversationData.country) && (
                <p className="text-xs text-gray-500">
                  {[conversationData.city, conversationData.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden md:block p-2 rounded-full hover:bg-gray-700 transition-colors">
            <FaUser className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 p-4 overflow-y-auto"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(20, 184, 166, 0.05) 0%, transparent 50%)",
        }}
      >
        <div className="space-y-4">
          {Object.entries(messagesGrouped).map(([date, messages]) => (
            <div key={date}>
              <div className="text-center text-xs text-gray-500 my-4 relative">
                <span className="bg-gray-800 px-3 py-1 rounded-full border border-gray-600">
                  {date}
                </span>
              </div>
              <div className="space-y-3">
                {messages.map((msg) => (
                  <MessageBubble
                    key={parseTimestamp(msg) || Math.random()}
                    msg={msg}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4  border-gray-700">
        {selectedFile && (
          <div className="mb-3 p-3 bg-gray-800 rounded-lg flex items-center gap-3">
            <FaImage className="text-teal-400" />
            <span className="text-sm text-gray-300 flex-1 truncate">
              {selectedFile.name}
            </span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              ×
            </button>
          </div>
        )}
        <form onSubmit={onSendMessage} className="flex items-center gap-3">
          <label className="cursor-pointer p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
            <FaPaperclip className="w-4 h-4 text-gray-400" />
            <input
              type="file"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </label>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full p-3 pl-4 pr-12 rounded-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() && !selectedFile}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gradient-to-r from-teal-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-600 hover:to-purple-700 transition-all"
            >
              <FaPaperPlane className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Memoized Message Bubble Component
const MessageBubble = React.memo(
  ({ msg, currentUserId }: { msg: Message; currentUserId: string }) => {
    const isSender = msg.senderId === currentUserId;

    // Parse timestamp properly
    const parseTimestamp = (
      timestamp: string | { seconds: number } | null
    ): number => {
      if (
        timestamp &&
        typeof timestamp === "object" &&
        "seconds" in timestamp
      ) {
        return timestamp.seconds * 1000;
      } else if (
        typeof timestamp === "string" &&
        !isNaN(Date.parse(timestamp))
      ) {
        return new Date(timestamp).getTime();
      }
      return Date.now();
    };

    const timestamp = parseTimestamp(msg.timestamp);

    return (
      <div
        className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3`}
      >
        <div
          className={`relative max-w-xs lg:max-w-md px-4 py-3 shadow-lg text-sm ${
            isSender
              ? "bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-2xl rounded-br-sm"
              : "bg-gray-700 text-white rounded-2xl rounded-bl-sm border border-gray-600"
          }`}
        >
          <p className="leading-relaxed">{msg.message}</p>
          <div
            className={`text-xs mt-2 ${
              isSender ? "text-gray-200" : "text-gray-400"
            }`}
          >
            {new Date(timestamp).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
          {/* Message tail */}
          <div
            className={`absolute bottom-0 w-3 h-3 ${
              isSender
                ? "right-0 transform translate-x-1 bg-gradient-to-br from-teal-500 to-purple-600"
                : "left-0 transform -translate-x-1 bg-gray-700 border-l border-b border-gray-600"
            }`}
            style={{
              clipPath: isSender
                ? "polygon(0 0, 0 100%, 100% 100%)"
                : "polygon(100% 0, 0 100%, 100% 100%)",
            }}
          />
        </div>
      </div>
    );
  }
);

export default Chat;
