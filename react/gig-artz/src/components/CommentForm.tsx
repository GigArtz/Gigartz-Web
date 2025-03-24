import React, { useRef, useState } from "react";
import { FaPaperclip, FaSpinner } from "react-icons/fa";

interface User {
  uid?: string;
  name?: string;
  userName?: string;
  profilePicUrl?: string;
}

interface CommentFormProps {
  user: User;
  onSubmit: (comment: string, rating: number) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ user, onSubmit }) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    setTimeout(() => {
      onSubmit(comment, rating);
      setComment("");
      setRating(0);
      setLoading(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full py-4">
      {/* Star Rating */}
      <div className="flex justify-center mb-2">
        <div className="flex items-center mt-3 space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className={`text-xl ${
                star <= rating ? "text-yellow-400" : "text-gray-500"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-row input-field">
        {/* Comment Input */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your comment..."
          className="w-full bg-dark"
          rows={3}
          required
        />
        <div className="relative flex items-center gap-2">
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
            className="p-2 rounded-lg bg-dark text-white hover:bg-gray-600 transition"
          >
            <FaPaperclip className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-row gap-3 align-baseline">
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-2 rounded-3xl transition"
        >
          {loading ? (
            <div className="flex items-center justify-center bg-opacity-50 z-50">
              <FaSpinner className="text-teal-500 text-4xl animate-spin" />
            </div>
          ) : (
            "Post Comment"
          )}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
