import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile } from "../store/profileSlice";
import avatar from "../assets/avater.png";
import blueBackground from "../assets/blue.jpg";
import ProfileTabs from "../components/ProfileTabs";
import { AppDispatch } from "../store/store";
import FollowersModal from "../components/FollowersModal";

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const { uid } = useSelector((state) => state.auth);
  const [userProfile, setUserProfile] = useState({});
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (uid) {
      dispatch(fetchUserProfile(uid));
    }
  }, [uid, dispatch]);

  const { userList, profile } = useSelector((state) => state.profile);

  console.log(profile);

  useEffect(() => {
    if (profile) {
      setUserProfile(profile);
      setUserName(profile?.userName || "");
      setPhoneNumber(profile?.phoneNumber || "");
      setCity(profile?.city || "");
      setBio(profile?.bio || "");
      setName(profile?.name || "");
    }
  }, [profile, dispatch]);

  //console.log("profile" , profile.userProfile)

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
          src={profile?.coverProfile || blueBackground}
          alt="Cover"
          className="w-full h-40 object-cover sm:h-30 md:h-52 mb-4"
        />
        <img
          src={profile?.profilePicUrl || avatar}
          alt="Profile"
          className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-gray-900 absolute top-10 left-4 sm:top-32 sm:left-8 md:top-18 md:left-10"
        />
      </div>

      <div className="p-5">
        <div className="flex justify-end">
          <button
            onClick={() => setModalVisible(true)}
            className="border border-teal-400 px-2 py-1 rounded-2xl"
          >
            Edit Profile
          </button>
        </div>
        <h1 className="text-2xl font-bold">{profile?.name || "Name"}</h1>
        <p className="text-sm text-gray-400">
          @{profile?.userName || "username"}
        </p>
        <p className="mt-2">{profile?.bio || "Add a bio"}</p>
        <div className="flex flex-row justify-between">
          <div className="flex-row gap-4 mt-2">
            <div className="flex gap-2 mb-2 text-gray-500">
              <p
                className="border-b border-transparent hover:border-gray-600 hover:border-b cursor-pointer"
                onClick={() => setIsFollowingModalOpen(true)}
              >
                <span className="font-bold text-teal-400">
                  {profile?.following || 0}
                </span>{" "}
                Following
              </p>
              <p
                className="border-b border-transparent hover:border-gray-600 hover:border-b cursor-pointer"
                onClick={() => setIsFollowersModalOpen(true)}
              >
                <span className="font-bold text-teal-400">
                  {profile?.followers || 0}
                </span>{" "}
                Followers
              </p>
            </div>

            <div className="flex">
              <div className="flex gap-2 my-2">
                {(profile?.genre || [])
                  .slice(0, 4) // Only take the first 3 items
                  .map((genre, index) => (
                    <div key={index}>
                      <p className="text-xs px-2 py-1 border border-teal-400 rounded-xl font-medium text-teal-400">
                        {genre || genre.name}
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
        users={userList}
      />

      <FollowersModal
        title="Following"
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        users={userList}
      />

      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
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
      <ProfileTabs uid={profile?.id} />
    </div>
  );
}
