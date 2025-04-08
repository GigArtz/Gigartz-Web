import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface User {
  uid: string;
  name?: string;
  userName?: string;
  bio?: string;
  profilePicUrl?: string;
}

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { userFollowing } = useSelector((state) => state.profile);
  const { uid } = useSelector((state) => state.auth);

  // Check if user is following current profile
  const isFollowingUser = userFollowing?.some((u) => u?.id === user?.id);

  const handleClick = () => {
    navigate(`/people/${user?.id}`);
  };

  useEffect(() => {
    console.log(userFollowing)
  })

  return (
    <div
      className="flex items-center justify-between w-full max-w-lg p-3 rounded-lg cursor-pointer hover:bg-gray-900 transition duration-300 shadow-md hover:shadow-lg"
      onClick={handleClick}
    >
      {/* Profile Info */}
      <div className="flex items-center gap-4 flex-nowrap">
        <img
          src={user.profilePicUrl || "/avatar.png"}
          alt="Avatar"
          className="w-14 h-14 rounded-full border-2 border-teal-400 object-cover"
        />
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-white">
            {user.name || "Unknown"}
          </h3>
          
          <p className="text-sm text-gray-400">
            @{user.userName || "username"}
          </p>
          <p className="text-xs text-gray-300 truncate w-52 sm:w-40">
            {user.bio || "No bio available"}
          </p>
        </div>
      </div>

      {/* Follow Button */}
      <button
        className={`border text-xs px-4 py-1 rounded-2xl ${
          isFollowingUser
            ? "border-teal-400 bg-teal-400 text-black"
            : "border-teal-400 text-teal-400"
        }`}
      >
        {isFollowingUser ? "Following" : "Follow"}
      </button>
    </div>
  );
};

export default UserCard;
