import React, { useState } from "react";
import { FaSpinner } from "react-icons/fa";

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
      {/* Comment Input */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your comment..."
        className="input-field"
        rows={3}
        required
      />

      {/* Star Rating */}
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
    </form>
  );
};

export default CommentForm;
