import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom"; // Import useParams
import { fetchAllProfiles, followUser } from "../store/profileSlice";
import avatar from "../assets/avater.png";
import blueBackground from "../assets/blue.jpg";
import ProfileTabs from "../components/ProfileTabs";
import { RootState, AppDispatch } from "../store/store";

// User Profile Type
interface UserProfile {
  name?: string;
  userName?: string;
  bio?: string;
  profilePicUrl?: string;
  coverProfile?: string;
  following?: number;
  followers?: number;
  genre?: { name: string }[];
}

// Component
const People: React.FC = () => {
  const { uid } = useParams<{ uid: string }>(); // Extract UID from URL
  const dispatch = useDispatch<AppDispatch>();
  const { uid: user_id, loading, error } = useSelector((state) => state.auth);
  //const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // Fetch users
  useEffect(() => {
    dispatch(fetchAllProfiles());
  }, [dispatch, uid]);

  const userList = useSelector((state: RootState) => state.profile);

  const userProfile = userList.userList.find(
    (user: UserProfile) => user?.id === uid
  );

  const [isFreelancer, setIsFreelancer] = useState<boolean>(
    userProfile?.roles?.freelancer || false
  );

  useEffect(() => {
    setIsFreelancer(userProfile?.roles?.freelancer || false);
  }, [userProfile]);

  const handleFollow = () => {
    setIsFollowing((prev) => !prev);
    dispatch(followUser(user_id, uid));
  };

  if (!userProfile) {
    return (
      <div className="main-content">
        <p className="text-center">User Not Found</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="relative">
        <img
          src={userProfile.coverProfile || blueBackground}
          alt="Cover"
          className="w-full h-40 object-cover sm:h-30 md:h-52 mb-4"
        />
        <img
          src={userProfile.profilePicUrl || avatar}
          alt="Profile"
          className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-gray-900 absolute top-10 left-4 sm:top-32 sm:left-8 md:top-18 md:left-10"
        />
      </div>

      <div className="p-5">
        <div className="flex justify-end">
          <button
            onClick={handleFollow}
            className={`border px-4 py-1 rounded-2xl ${
              isFollowing
                ? "bg-gray-500 text-white"
                : "border-teal-400 text-teal-400"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>
        <h1 className="text-2xl font-bold">{userProfile.name || "Name"}</h1>
        <p className="text-sm text-gray-400">
          @{userProfile.userName || "username"}
        </p>
        <p className="mt-2">{userProfile.bio || "No bio available"}</p>
        <div className="flex flex-row justify-between">
          <div className="flex-row gap-4 mt-2">
            <div className="flex gap-2">
              <p>
                <span className="font-bold text-teal-400">
                  {userProfile.following || 0}
                </span>{" "}
                Following
              </p>
              <p>
                <span className="font-bold text-teal-400">
                  {userProfile.followers || 0}
                </span>{" "}
                Followers
              </p>
            </div>
            <div className="flex">
              <div className="flex gap-2 my-2">
                {(userProfile.genre || [])
                  .slice(0, 3) // Only take the first 3 items
                  .map((genre, index) => (
                    <div key={index}>
                      <p className="text-xs px-2 py-1 border border-teal-400 rounded-xl font-medium text-teal-400">
                        {genre.name}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <ProfileTabs uid={userProfile?.id} />
    </div>
  );
};

export default People;
