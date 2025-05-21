import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile } from "../../store/profileSlice";
import avatar from "../assets/avater.png";
import blueBackground from "../assets/blue.jpg";
import MyProfileTabs from "../components/MyProfileTabs";
import { AppDispatch, RootState } from "../../store/store";
import FollowersModal from "../components/FollowersModal";
import { FaMapMarkerAlt, FaPenSquare } from "react-icons/fa";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../config/firebase";
import ProfileSectionUI from "../components/ProfileSectionUI";
import ProfileMultiStepForm from "../components/ProfileMultiStepForm";

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const { uid } = useSelector((state: RootState) => state.auth);
  const { profile, userFollowers, userFollowing, loading } = useSelector(
    (state: RootState) => state.profile
  );

  const [isFollowersModalOpen, setIsFollowersModalOpen] = React.useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = React.useState(false);
  const [multiStepOpen, setMultiStepOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uid) {
      dispatch(fetchUserProfile(uid));
    }
  }, [uid, dispatch]);

  const handleProfilePicUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // setLoading(true);
    const storageRef = ref(storage, `profilePics/${Date.now()}_${file.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      dispatch(
        updateUserProfile(uid, {
          profilePicture: downloadURL,
        })
      );
    } catch (error) {
      console.error(
        "Error uploading profile picture:",
        (error as Error).message
      );
      alert("Failed to upload profile picture. Please try again.");
    }
    // setLoading(false);
  };

  const handleCoverPicUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // setLoading(true);
    const storageRef = ref(storage, `coverPics/${Date.now()}_${file.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      dispatch(
        updateUserProfile(uid, {
          coverProfile: downloadURL,
        })
      );
    } catch (error) {
      console.error("Error uploading cover picture:", (error as Error).message);
      alert("Failed to upload cover picture. Please try again.");
    }
    // setLoading(false);
  };

  if (!profile) {
    return (
      <div className="main-content">
        <p className="text-center">Please Login</p>
      </div>
    );
  }
  return (
    <div className="main-content">
      <div className="">
        {loading ? (
          <ProfileSectionUI />
        ) : (
          <div>
            <div className="relative">
              <img
                src={profile?.coverProfile || blueBackground}
                alt="Cover"
                onClick={() => coverInputRef.current?.click()}
                className="w-full h-40 object-cover sm:h-30 md:h-52 mb-4 cursor-pointer"
              />
              <input
                type="file"
                accept="image/*"
                ref={coverInputRef}
                style={{ display: "none" }}
                onChange={handleCoverPicUpload}
              />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-gray-900 opacity-50"></div>
              <img
                src={profile?.profilePicUrl || avatar}
                alt="Profile"
                className="w-20 h-20 sm:w-28 sm:h-28 min-w-28 min-h-28 max-w-28 max-h-28 rounded-full border-4 border-gray-900 absolute top-10 left-4 sm:top-32 sm:left-8 md:top-18 md:left-10 cursor-pointer object-cover"
                onClick={() => fileInputRef.current?.click()}
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleProfilePicUpload}
              />
              <FaPenSquare
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-2 right-2 w-6 h-6 text-white bg-teal-500 rounded-full p-1 cursor-pointer shadow-lg hover:bg-teal-600 z-10"
                title="Edit cover photo"
              />
            </div>
            <div className="p-5">
              <div className="flex gap-4 items-end">
                <h1 className="text-2xl font-bold">
                  {profile?.name || "Name"}
                </h1>
                <FaPenSquare
                  onClick={() => setMultiStepOpen(true)}
                  className="w-4 h-4 mb-2 text-teal-500"
                />
              </div>
              <p className="text-sm text-gray-400">
                @{profile?.userName || "username"}
              </p>
              <p className="mt-2">{profile?.bio || "Add a bio"}</p>
              <div className="flex gap-1 items-center text-sm text-gray-400">
                <FaMapMarkerAlt />
                {profile?.city || "location"}
              </div>
              <div className="flex flex-row justify-between">
                <div className="flex-row gap-4 mt-2">
                  <div className="flex gap-2 mb-2 text-gray-500">
                    <p
                      className="border-b border-transparent hover:border-gray-600 hover:border-b cursor-pointer"
                      onClick={() => setIsFollowingModalOpen(true)}
                    >
                      <span className="font-bold text-teal-400">
                        {userFollowing?.length || 0}
                      </span>{" "}
                      Following
                    </p>
                    <p
                      className="border-b border-transparent hover:border-gray-600 hover:border-b cursor-pointer"
                      onClick={() => setIsFollowersModalOpen(true)}
                    >
                      <span className="font-bold text-teal-400">
                        {userFollowers?.length || 0}
                      </span>{" "}
                      Followers
                    </p>
                  </div>
                  <div className="flex">
                    <div className="flex gap-2 my-2">
                      {(Array.isArray(profile?.genre) ? profile.genre : [])
                        .slice(0, 4)
                        .map((genre, index) => (
                          <div key={index}>
                            <p className="text-xs px-2 py-1 border border-teal-400 rounded-xl font-medium text-teal-400">
                              {genre?.name || genre}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <FollowersModal
        title="Followers"
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        users={userFollowers}
      />

      <FollowersModal
        title="Following"
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        users={userFollowing}
      />

      {multiStepOpen && (
        <ProfileMultiStepForm
          isOpen={multiStepOpen}
          onClose={() => setMultiStepOpen(false)}
          initialValues={profile}
        />
      )}

      {/* Profile Tabs */}
      <MyProfileTabs uid={profile?.id} />
    </div>
  );
}
