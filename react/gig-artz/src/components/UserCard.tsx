import React, { memo, useMemo, useCallback } from "react";
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

const UserCard: React.FC<UserCardProps> = memo(({ user }) => {
  // Monitor re-renders in development
  useRenderLogger("UserCard", { userId: user.uid || user.id });

  const navigate = useNavigate();

  // Optimized selector - only get what we need
  const isFollowingUser = useSelector((state: RootState) => {
    const userFollowing = state.profile.userFollowing;
    const userId = user?.id || user?.uid;
    return userFollowing?.some((u) => u?.id === userId) || false;
  }, shallowEqual);

  // Memoize user data to prevent prop drilling issues
  const userData = useMemo(
    () => ({
      id: user?.uid || user?.id,
      name: user?.name || "Unknown",
      userName: user?.userName || "username",
      bio: user?.bio || "No bio available",
      profilePicUrl: user?.profilePicUrl || "/avatar.png",
    }),
    [
      user?.uid,
      user?.id,
      user?.name,
      user?.userName,
      user?.bio,
      user?.profilePicUrl,
    ]
  );

  const handleClick = useCallback(() => {
    navigate(`/people/${userData.id}`);
  }, [navigate, userData.id]);

  return (
    <div
      className="flex items-center scroll-smooth delay-150 ease-in-out hover:-translate-y-1 hover:scale-95 w-full max-w-lg p-3 rounded-lg cursor-pointer transition duration-300 shadow-md hover:shadow-lg"
      onClick={handleClick}
    >
      {/* Profile Info + Button in a row with gap */}
      <div className="flex items-center gap-4 justify-between w-full">
        <div className="flex items-center gap-3 flex-nowrap sm:w-[40%] md:w-[55%] lg:w-[65%]">
          <img
            src={userData.profilePicUrl}
            alt="Avatar"
            className="w-9 h-9 min-w-9 min-h-9 max-w-9 max-h-9 rounded-full border-2 border-teal-400 object-cover"
          />
          <div className="flex flex-col gap-1 overflow-hidden">
            <h3 className="md:text-lg font-semibold truncate w-full sm:min-w-12 text-white ">
              {userData.name}
            </h3>
            <div className="flex flex-col ">
              <p className="text-sm text-gray-400 truncate w-full sm:min-w-12">
                @{userData.userName}
              </p>
              <p className="text-xs text-gray-300 truncate w-full sm:min-w-12">
                {userData.bio}
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
});

UserCard.displayName = "UserCard";

export default UserCard;
