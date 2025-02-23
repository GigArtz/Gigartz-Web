import React from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../store/profileSlice"; // Import fetchUserProfile
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import People from "../pages/People";

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
      className="flex w-56 items-center p-4 bg rounded-lg cursor-pointer hover:bg-gray-700 transition"
      onClick={handleClick}
    >
      <img
        src={user.profilePicUrl || "/avatar.png"}
        alt="Avatar"
        className="w-12 h-12 rounded-full border-2 border-teal-400"
      />
      <div className="ml-3">
        <h3 className="text-lg font-semibold">{user.name || "Unknown"}</h3>
        <p className="text-sm text-gray-400">@{user.userName || "username"}</p>
        <p className="text-xs text-gray-300 line-clamp-2">
          {user.bio || "No bio available"}
        </p>
      </div>
    </div>
  );
};

export default UserCard;
