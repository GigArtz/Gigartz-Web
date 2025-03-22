import React, { useState } from "react";

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
    <form
      onSubmit={handleSubmit}
      className="w-full p-4 bg-gray-800 rounded-lg shadow-md"
    >
      {/* Comment Input */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your comment..."
        className="w-full p-2 text-sm text-white bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-teal-400 focus:outline-none"
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
        className="w-full mt-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg px-4 py-2 text-center transition"
      >
        {loading ? "Submitting..." : "Post Comment"}
      </button>
    </form>
  );
};

export default CommentForm;
