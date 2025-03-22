import React from "react";
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


  const handleClick = () => { // Fetch user profile
   
    navigate(`/people/${user.id}`);
  };

  return (
    <div
    className="flex w-auto items-center p-2 rounded-lg cursor-pointer hover:bg-gray-700 transition shadow-md"
    onClick={handleClick}
  >
    {/* Profile Info */}
    <div className="flex items-center gap-4 flex-grow mr-5">
      <img
        src={user.profilePicUrl || "/avatar.png"}
        alt="Avatar"
        className="w-12 h-12 rounded-full border-2 border-teal-400"
      />
      <div>
        <h3 className="text-lg font-semibold text-white">
          {user.name || "Unknown"}
        </h3>
        <p className="text-sm text-gray-400">@{user.userName || "username"}</p>
        <p className="text-xs text-gray-300 line-clamp-2">
          {user.bio || "No bio available"}
        </p>
      </div>
    </div>
  
    {/* Follow Button */}
    <button className="bg-blue-500 text-white px-4 py-2 rounded-3xl hover:bg-blue-600 transition">
      Follow
    </button>
  </div>
  
  );
};

export default UserCard;
