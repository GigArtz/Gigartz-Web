import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "store/store";

interface User {
  uid?: string;
  name?: string;
  userName?: string;
  profilePicUrl?: string;
}

interface Review {
  id: string;
  text: string;
  createdAt: string;
  user: User;
  rating: number;
}

interface CommentCardProps {
  review: Review;
}

const CommentCard: React.FC<CommentCardProps> = ({ review }) => {
  const navigate = useNavigate();
  const { user, text, createdAt, rating } = review;

  const userList = useSelector((state: RootState) => state.profile.userList) as User[];

  // Find user reviewing
  const findUser = (uid: string) => {
    return userList?.find((user) => user?.id === uid);
  };

  const displayUser = findUser(review?.user?.uid);

  const handleUserClick = () => {
    if (displayUser.uid) {
      navigate(`/people/${displayUser.uid}`);
    }
  };

  return (
    <div className="flex w-full items-start p-4 bg-[#060512] rounded-lg shadow-md">
      {/* Profile Picture */}
      <img
        src={displayUser.profilePicUrl || "/avatar.png"}
        alt={displayUser.name ?? "User Avatar"}
        className="w-10 h-10 rounded-full border-2 border-teal-400 cursor-pointer"
        onClick={handleUserClick}
      />

      {/* Review Content */}
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <div className="cursor-pointer" onClick={handleUserClick}>
            <h3 className="text-sm font-semibold text-white">
              {displayUser.name ?? "Unknown"}
            </h3>
            <p className="text-xs text-gray-400">
              @{displayUser.userName ?? "username"}
            </p>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(createdAt).toLocaleString()}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center mt-1">
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={`text-sm ${
                index < rating ? "text-yellow-400" : "text-gray-500"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Review Text */}
        <p className="text-sm text-gray-300 mt-1">{text}</p>
      </div>
    </div>
  );
};

export default CommentCard;
