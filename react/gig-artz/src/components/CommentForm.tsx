import React, { useRef, useState } from "react";
import {
  FaBullhorn,
  FaFileImage,
  FaLocationArrow,
  FaPaperclip,
  FaSearchLocation,
  FaSpinner,
  FaStar,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "store/store";

interface CommentFormProps {
  placeholder?: string;
  buttonText: string;
  onSubmit: (review: string, rating: number) => void;
  loading?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, loading }) => {
  const [review, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [dropdownUsers, setDropdownUsers] = useState<string[]>([]);
  const [dropdownIndex, setDropdownIndex] = useState(0);
  const [taggedUser, setTaggedUser] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Import userList from Redux store or props if needed
  const userList = useSelector(
    (state: RootState) => state.profile.userList
  ) as { userName: string }[];

  const handleFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) return;
    onSubmit(review, rating);
    setComment("");
    setRating(0);
    setTaggedUser(null);
  };

  // Detect @ and show dropdown
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setComment(value);
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
    const textUpToCursor = review.slice(0, cursor);
    const match = /@([\w]*)$/.exec(textUpToCursor);
    if (match) {
      const before = textUpToCursor.slice(0, match.index);
      const after = review.slice(cursor);
      const newComment = before + `@${userName} ` + after;
      setComment(newComment);
      setShowUserDropdown(false);
      setTaggedUser(userName);
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

  return (
    <form onSubmit={handleSubmit} className="w-full py-4">
      <div className="flex flex-col input-field border-gray-800 bg-dark rounded-lg shadow-md p-4">
        {/* Review Input */}
        <div className="relative w-full">
          <textarea
            ref={textareaRef}
            value={review}
            onChange={handleCommentChange}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Write your review..."
            className="w-full bg-dark"
            rows={3}
            required
          />
          {/* User Dropdown */}
          {showUserDropdown && (
            <ul className="absolute left-0 z-10 bg-dark rounded shadow max-h-40 overflow-y-auto mt-1 w-48">
              {dropdownUsers.map((user, idx) => (
                <li
                  key={user}
                  className={`px-3 py-2 cursor-pointer ${
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
        <div className="flex justify-between items-center mt-2 border-t pt-2 border-gray-600">
          {/* File and Broadcast Buttons */}
          <div className="relative flex items-center sm:gap-2 text-teal-500">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => console.log(e.target.files)}
            />
            {/* Custom Button */}
            <button
              type="button"
              onClick={handleFileSelection}
              className="p-2 rounded-3xl bg-dark hover:bg-gray-600 transition"
            >
              <FaFileImage className="w-5 h-5" />
            </button>
            {/* Broadcast Button */}
            <button
              type="button"
              onClick={handleFileSelection}
              className="p-2 rounded-3xl bg-dark hover:bg-gray-600 transition"
            >
              <FaSearchLocation className="w-5 h-5" />
            </button>

            {/* Desktop View - Stars */}
            <div className="flex flex-row sm:flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-xl ${
                    star <= rating ? "text-yellow-400" : "text-gray-500"
                  }`}
                >
                  <FaStar className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-row gap-1 sm:gap-3 align-baseline">
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 rounded-3xl transition w-12 sm:w-20 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center justify-center bg-opacity-50 z-50">
                  <FaSpinner className="text-teal-500 text-4xl animate-spin" />
                </div>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
