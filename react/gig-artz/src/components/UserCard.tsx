import React, { memo, useMemo, useCallback } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { followUser } from "../../store/profileSlice";
import { useRenderLogger } from "../hooks/usePerformanceMonitor";
import { FaUserPlus, FaUserTimes } from "react-icons/fa";

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

  // Get the current user's id from profile slice
  const currentUserId = useSelector(
    (state: RootState) =>
      state.profile.profile?.userId || state.profile.profile?.id
  );

  const dispatch = useDispatch();

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

  // Follow/Unfollow toggle handler
  const handleFollowToggle = () => {
    if (!currentUserId || !userData.id) return;
    // Only dispatch follow if not already following
    if (!isFollowingUser) {
      dispatch(followUser(currentUserId, userData.id));
    } else {
      // Optionally, dispatch unfollow action if implemented
      // dispatch(unfollowUser(currentUserId, userData.id));
      // For now, just log
      console.log("Unfollow", userData.id);
    }
  };

  return (
    <div
      className="card-animate flex w-full items-start px-2 pt-3 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 shadow-lg rounded-3xl transition-colors duration-200 hover:shadow-xl group cursor-pointer"
      style={{ minHeight: 90 }}
      onClick={handleClick}
    >
      <div className="mx-2 flex-1">
        <div className="flex items-center justify-between">
          {/* User Info Section */}
          <div className="flex items-center gap-2">
            {/* User Avatar */}
            <div className="relative">
              <img
                src={userData.profilePicUrl}
                alt="User Avatar"
                className="object-cover w-10 h-10 min-w-10 min-h-10 max-w-10 max-h-10 rounded-full border-2 border-teal-400 cursor-pointer transition-transform duration-200 group-hover:scale-105 group-hover:border-teal-300 shadow-md"
                onError={(e) => {
                  e.currentTarget.src = "/avatar.png";
                }}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full"></span>
            </div>

            {/* User Name & Bio */}
            <div
              className="cursor-pointer text-truncate w-20 mr-1"
              onClick={handleClick}
            >
              <h3 className="text-base font-bold text-white leading-tight hover:underline truncate w-full">
                {userData.name}
              </h3>
              <p className="text-xs text-gray-400 truncate w-full">
                @{userData.userName}
              </p>
              <p className="text-xs text-gray-300 truncate w-full">
                {userData.bio}
              </p>
            </div>
          </div>

          <button
            className={`hidden lg:flex items-center border text-xs px-3 py-1 rounded-2xl font-semibold transition-colors duration-200 group ${
              isFollowingUser
                ? "border-teal-400 bg-teal-400 text-black shadow-md hover:bg-red-500 hover:border-red-500 hover:text-white"
                : "border-teal-400 text-teal-400 bg-transparent hover:bg-teal-900 hover:text-white"
            }`}
            style={{ minWidth: 80 }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              handleFollowToggle();
            }}
          >
            <span className="flex items-center">
              {isFollowingUser ? (
                <>
                  <span className="group-hover:hidden">Following</span>
                  <span className="hidden group-hover:inline">Unfollow</span>
                </>
              ) : (
                "Follow"
              )}
              <span className="ml-1">
                {isFollowingUser ? (
                  <FaUserTimes className="inline-block" />
                ) : (
                  <FaUserPlus className="inline-block" />
                )}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

UserCard.displayName = "UserCard";

export default UserCard;
