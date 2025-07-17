import React, { memo } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { useRenderLogger } from "../hooks/usePerformanceMonitor";

interface User {
  uid: string;
  id?: string; // Add optional id property
  name?: string;
  userName?: string;
  bio?: string;
  profilePicUrl?: string;
}

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  // Monitor re-renders in development
  useRenderLogger("UserCard", { userId: user.uid || user.id });

  const navigate = useNavigate();
  const { userFollowing } = useSelector(
    (state: RootState) => state.profile,
    shallowEqual
  );

  // Check if user is following current profile
  const isFollowingUser =
    userFollowing?.some((u) => u?.id === user?.id) || false;

  const handleClick = () => {
    navigate(`/people/${user?.uid || user?.id}`);
  };

  // Removed useEffect with console.log to prevent unnecessary re-renders

  return (
    <div
      className="flex items-center scroll-smooth delay-150 ease-in-out hover:-translate-y-1 hover:scale-95 w-full max-w-lg p-3 rounded-lg cursor-pointer transition duration-300 shadow-md hover:shadow-lg"
      onClick={handleClick}
    >
      {/* Profile Info + Button in a row with gap */}
      <div className="flex items-center gap-4 justify-between w-full">
        <div className="flex items-center gap-3 flex-nowrap sm:w-[40%] md:w-[55%] lg:w-[65%]">
          <img
            src={user.profilePicUrl || "/avatar.png"}
            alt="Avatar"
            className="w-9 h-9 min-w-9 min-h-9 max-w-9 max-h-9 rounded-full border-2 border-teal-400 object-cover"
          />
          <div className="flex flex-col gap-1 overflow-hidden">
            <h3 className="md:text-lg font-semibold truncate w-full sm:min-w-12 text-white ">
              {user.name || "Unknown"}
            </h3>
            <div className="flex flex-col ">
              <p className="text-sm text-gray-400 truncate w-full sm:min-w-12">
                @{user.userName || "username"}
              </p>
              <p className="text-xs text-gray-300 truncate w-full sm:min-w-12">
                {user.bio || "No bio available"}
              </p>
            </div>
          </div>
        </div>
        {/* Follow Button */}
        <button
          className={`border text-xs px-2 flex-shrink-0 py-1 rounded-2xl ${
            isFollowingUser
              ? "border-teal-400 bg-teal-400 text-black "
              : "border-teal-400 text-teal-400 ml-auto"
          }`}
        >
          {isFollowingUser ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
};

export default memo(UserCard);
