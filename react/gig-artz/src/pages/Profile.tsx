import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile } from "../store/profileSlice";
import avatar from "../assets/avater.png";
import blueBackground from "../assets/blue.jpg";
import MyProfileTabs from "../components/MyProfileTabs";
import { AppDispatch, RootState } from "../store/store";
import FollowersModal from "../components/FollowersModal";
import { FaMapMarkerAlt, FaPenSquare } from "react-icons/fa";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../config/firebase";

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const { uid } = useSelector((state: RootState) => state.auth);
  const { profile, userFollowers, userFollowing } = useSelector(
    (state: RootState) => state.profile
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uid) {
      dispatch(fetchUserProfile(uid));
    }
  }, [uid, dispatch]);

  useEffect(() => {
    if (profile) {
      setUserName(profile?.userName || "");
      setPhoneNumber(profile?.phoneNumber || "");
      setCity(profile?.city || "");
      setBio(profile?.bio || "");
      setName(profile?.name || "");
    }
  }, [profile]);

  const handleSave = () => {
    dispatch(
      updateUserProfile(uid, {
        userName,
        phoneNumber,
        city,
        bio,
        name,
      })
    );
    setModalVisible(false);
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const storageRef = ref(storage, `profilePics/${Date.now()}_${file.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      dispatch(updateUserProfile(uid, { profilePicUrl: downloadURL, name: "Profile Pic"}));
    } catch (error) {
      console.error("Error uploading profile picture:", (error as Error).message);
      alert("Failed to upload profile picture. Please try again.");
    }
    setLoading(false);
  };

  const uploadCover = () => {
    console.log("Upload cover picture function not implemented yet.");
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
      <div className="relative">
        <img
          src={profile?.coverPic || blueBackground}
          alt="Cover"
          onClick={uploadCover}
          className="w-full h-40 object-cover sm:h-30 md:h-52 mb-4"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-gray-900 opacity-50"></div>

        <img
          src={profile?.profilePicUrl || avatar}
          alt="Profile"
          className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-gray-900 absolute top-10 left-4 sm:top-32 sm:left-8 md:top-18 md:left-10 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleProfilePicUpload}
        />
      </div>

      <div className="p-5">
        <div className="flex gap-4 items-end">
          <h1 className="text-2xl font-bold">{profile?.name || "Name"}</h1>
          <FaPenSquare
            onClick={() => setModalVisible(true)}
            className="w-4 h-4 mb-2 text-teal-500"
          />
        </div>
        <p className="text-sm text-gray-400">
          @{profile?.userName || "username"}
        </p>
        <p className="my-2">{profile?.bio || "Add a bio"}</p>
        <div className="flex gap-1 items-center text-sm text-gray-400">
          <FaMapMarkerAlt />
          {profile?.userName || "username"}
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
                {(Array.isArray(profile?.genre) ? profile.genre : []).slice(0, 4).map((genre, index) => (
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

      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-3/4 max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={profile?.name || "Enter Name"}
                  className="w-full px-4 py-2 bg-gray-700 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Username</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={profile?.userName || "Enter Username"}
                  className="w-full px-4 py-2 bg-gray-700 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={profile?.phoneNumber || "Enter Phone Number"}
                  className="w-full px-4 py-2 bg-gray-700 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={profile?.city || "Enter City"}
                  className="w-full px-4 py-2 bg-gray-700 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={profile?.bio || "Enter Bio"}
                  className="w-full px-4 py-2 bg-gray-700 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-teal-500 rounded-md"
              >
                Save
              </button>
              <button
                onClick={() => setModalVisible(false)}
                className="px-4 py-2 bg-gray-600 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Tabs */}
      <MyProfileTabs uid={profile?.id} />
    </div>
  );
}
