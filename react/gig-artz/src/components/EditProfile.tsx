import React, { useState } from "react";
import ProfileMultiStepForm from "./ProfileMultiStepForm";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import { FaUserEdit, FaUser } from "react-icons/fa";

interface EditProfileProps {
  useModal?: boolean; // Optional prop to control modal behavior
}

const EditProfile: React.FC<EditProfileProps> = ({ useModal = true }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading] = useState(false);
  const { profile } = useSelector((state: RootState) => state.profile);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // If useModal is false, render the form directly
  if (!useModal) {
    return (
      <div className="animate-fade-in-up">
        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="p-4 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center">
              <div className="w-16 h-16 border-t-4 border-teal-500 border-solid rounded-full animate-spin"></div>
              <p className="mt-4 text-white font-medium">Updating profile...</p>
            </div>
          </div>
        )}

        {/* Header section */}
        <div className="mb-8 animate-slide-in-left">
          <h2 className="text-3xl font-bold text-white mb-2">
            Edit Your Profile
          </h2>
          <p className="text-gray-400 text-lg">
            Update your profile information and preferences
          </p>
        </div>

        {/* Direct form integration */}
        <div className="animate-fade-in-up animation-delay-300">
          <ProfileMultiStepForm
            isOpen={true}
            onClose={() => {}} // No-op since we're not using a modal
            initialValues={profile}
            renderAsModal={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="p-4 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-teal-500 border-solid rounded-full animate-spin"></div>
            <p className="mt-4 text-white font-medium">Updating profile...</p>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="mb-8 animate-slide-in-left">
        <h2 className="text-3xl font-bold text-white mb-2">
          Edit Your Profile
        </h2>
        <p className="text-gray-400 text-lg">
          Update your profile information and preferences
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700/50 animate-fade-in-up animation-delay-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full flex items-center justify-center">
            <FaUser className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              {profile?.name || "Your Profile"}
            </h3>
            <p className="text-gray-400">
              {profile?.emailAddress || "Update your information"}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-medium hover:from-teal-700 hover:to-teal-800 transition-all duration-300 transform hover:scale-[1.02]"
        >
          <FaUserEdit className="w-4 h-4" />
          Edit Profile Information
        </button>
      </div>

      {/* ProfileMultiStepForm with its own BaseModal */}
      <ProfileMultiStepForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialValues={profile}
        renderAsModal={true}
      />
    </div>
  );
};

export default EditProfile;
