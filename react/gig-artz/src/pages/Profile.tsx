import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, updateUserProfile } from "../store/profileSlice";
import avatar from "../assets/avater.png";
import blueBackground from "../assets/blue.jpg";

export default function Profile() {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.profile);
  const { uid } = useSelector((state) => state.auth);

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

  return (
    <div className=" bg-gray-900 text-white">
      <div className="relative">
        <img
          src={profile?.coverProfile || blueBackground}
          alt="Cover"
          className="w-full h-40 object-cover"
        />
        <img
          src={profile?.profilePicUrl || avatar}
          alt="Profile"
          className="w-28 h-28 rounded-full border-4 border-gray-900 absolute top-20 left-5"
        />
      </div>
      <div className="p-5">
        <h1 className="text-2xl font-bold">{profile?.name || "Name"}</h1>
        <p className="text-sm text-gray-400">@{profile?.userName || "username"}</p>
        <p className="mt-2">{profile?.bio || "Add a bio"}</p>
        <div className="flex gap-4 mt-4">
          <p>
            <span className="font-bold text-teal-400">{profile?.following || 0}</span>{" "}
            Following
          </p>
          <p>
            <span className="font-bold text-teal-400">{profile?.followers || 0}</span>{" "}
            Followers
          </p>
        </div>
        <button
          onClick={() => setModalVisible(true)}
          className="mt-5 px-4 py-2 bg-teal-500 rounded-md"
        >
          Edit Profile
        </button>
      </div>

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
    </div>
  );
}
