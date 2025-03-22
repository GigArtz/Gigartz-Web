import React from "react";
import { useNavigate } from "react-router-dom";

interface User {
  uid?: string;
  name?: string;
  userName?: string;
  profilePicUrl?: string;
}

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: User;
  rating: number;
}

interface CommentCardProps {
  comment: Comment;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    if (comment.user.uid) {
      navigate(`/people/${comment.user.uid}`);
    }
  };

  return (
    <div className="flex w-full  items-start p-4 bg-[#060512] rounded-lg shadow-md">
      {/* Profile Picture */}
      <img
        src={comment.user.profilePicUrl || "/avatar.png"}
        alt="User Avatar"
        className="w-10 h-10 rounded-full border-2 border-teal-400 cursor-pointer"
        onClick={handleUserClick}
      />

      {/* Comment Content */}
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <div className="cursor-pointer" onClick={handleUserClick}>
            <h3 className="text-sm font-semibold text-white">
              {comment.user.name || "Unknown"}
            </h3>
            <p className="text-xs text-gray-400">
              @{comment.user.userName || "username"}
            </p>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center mt-1">
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={`text-sm ${
                index < comment.rating ? "text-yellow-400" : "text-gray-500"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Comment Text */}
        <p className="text-sm text-gray-300 mt-1">{comment.text}</p>
      </div>
    </div>
  );
};

export default CommentCard;
