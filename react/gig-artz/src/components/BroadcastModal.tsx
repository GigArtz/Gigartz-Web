import React, { useRef, useState } from "react";
import {
  FaBullhorn,
  FaFileImage,
  FaSpinner,
  FaTimesCircle,
  FaSearchLocation,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import BaseModal from "./BaseModal";

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestList: {
    id: string;
    guestListName: string;
    guests: Array<{ name: string; userName?: string; emailAddress?: string }>;
  } | null;
  onSend: (message: string, attachments?: File[]) => void;
  loading?: boolean;
}

const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  guestList,
  onSend,
  loading = false,
}) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [dropdownUsers, setDropdownUsers] = useState<string[]>([]);
  const [dropdownIndex, setDropdownIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Import userList from Redux store
  const userList = useSelector(
    (state: RootState) => state.profile.userList
  ) as { userName: string }[];

  const handleFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachments(Array.from(files));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    onSend(message, attachments);
    setMessage("");
    setAttachments([]);
    onClose();
  };

  // Detect @ and show dropdown for user tagging
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    const cursor = e.target.selectionStart;
    const textUpToCursor = value.slice(0, cursor);
    const match = /@([\w]*)$/.exec(textUpToCursor);

    if (match) {
      const search = match[1].toLowerCase();
      const filtered = userList
        .filter(
          (u) => u.userName && u.userName.toLowerCase().startsWith(search)
        )
        .map((u) => u.userName);
      setDropdownUsers(filtered);
      setShowUserDropdown(filtered.length > 0);
      setDropdownIndex(0);
    } else {
      setShowUserDropdown(false);
    }
  };

  // Handle dropdown selection
  const handleUserSelect = (userName: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const cursor = textarea.selectionStart;
    const textUpToCursor = message.slice(0, cursor);
    const match = /@([\w]*)$/.exec(textUpToCursor);

    if (match) {
      const before = textUpToCursor.slice(0, match.index);
      const after = message.slice(cursor);
      const newMessage = before + `@${userName} ` + after;
      setMessage(newMessage);
      setShowUserDropdown(false);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = (
          before + `@${userName} `
        ).length;
      }, 0);
    }
  };

  // Keyboard navigation for dropdown
  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (showUserDropdown && dropdownUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setDropdownIndex((i) => (i + 1) % dropdownUsers.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setDropdownIndex(
          (i) => (i - 1 + dropdownUsers.length) % dropdownUsers.length
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleUserSelect(dropdownUsers[dropdownIndex]);
      } else if (e.key === "Escape") {
        setShowUserDropdown(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast Message"
      subtitle={`Send to: ${guestList?.guestListName} (${
        guestList?.guests?.length || 0
      } recipients)`}
      icon={<FaBullhorn className="w-5 h-5" />}
      closeOnClickOutside={true}
      minWidth="min-w-96"
      maxWidth="md:max-w-2xl"
    >
      {/* Broadcast Form */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col input-field border-gray-800 bg-dark rounded-lg shadow-md p-4">
          {/* Message Input */}
          <div className="relative w-full">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Type your broadcast message here... Use @ to mention specific users."
              className="w-full bg-dark text-white placeholder-gray-400 border-none outline-none resize-none"
              rows={4}
              required
            />

            {/* User Dropdown */}
            {showUserDropdown && (
              <ul className="absolute left-0 z-10 bg-dark border border-gray-600 rounded shadow max-h-40 overflow-y-auto mt-1 w-48">
                {dropdownUsers.map((user, idx) => (
                  <li
                    key={user}
                    className={`px-3 py-2 cursor-pointer text-white hover:bg-gray-700 ${
                      idx === dropdownIndex ? "bg-teal-400" : ""
                    }`}
                    onMouseDown={() => handleUserSelect(user)}
                  >
                    @{user}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mt-3 border-t border-gray-600 pt-3">
              <p className="text-sm text-gray-400 mb-2">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2"
                  >
                    <FaFileImage className="w-4 h-4 text-teal-400" />
                    <span className="text-sm text-white">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <FaTimesCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-3 border-t pt-3 border-gray-600">
            {/* Action Buttons */}
            <div className="relative flex items-center gap-2 text-teal-500">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileChange}
                accept="image/*,video/*,.pdf,.doc,.docx"
              />

              {/* File Attachment Button */}
              <button
                type="button"
                onClick={handleFileSelection}
                className="p-2 rounded-3xl bg-dark hover:bg-gray-600 transition"
                title="Attach Files"
              >
                <FaFileImage className="w-5 h-5" />
              </button>

              {/* Location Button */}
              <button
                type="button"
                className="p-2 rounded-3xl bg-dark hover:bg-gray-600 transition"
                title="Add Location"
              >
                <FaSearchLocation className="w-5 h-5" />
              </button>
            </div>

            {/* Send Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-3xl hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="btn-primary px-6 py-2 rounded-3xl transition flex items-center justify-center min-w-[100px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <FaSpinner className="text-white animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FaBullhorn className="w-4 h-4" />
                    <span>Broadcast</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default BroadcastModal;
