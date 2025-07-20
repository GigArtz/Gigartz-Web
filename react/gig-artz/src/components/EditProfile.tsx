import React, { useState } from "react";
import ProfileMultiStepForm from "./ProfileMultiStepForm";
import { useSelector } from "react-redux";
import { RootState } from "store/store";
import BaseModal from "./BaseModal";
import { FaUserEdit } from "react-icons/fa";

const EditProfile: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading] = useState(false);

  const { profile } = useSelector((state: RootState) => state.profile);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="justify-center items-center z-30">
      {/* Loading overlay - matches EventForm.tsx */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="p-4 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-teal-500 border-solid rounded-full animate-spin"></div>
            <p className="mt-4 text-white font-medium">Updating profile...</p>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Edit Your Profile</h2>
        <p className="text-gray-400">Update your profile information below</p>
      </div>

      {/* Main content */}
      <div className="flex-row p-2 space-y-2 md:p-4 md:space-y-6">
        <div className="flex justify-center">
          <button
            onClick={handleOpen}
            className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-all duration-300"
          >
            Edit Profile
          </button>
        </div>

        {/* Using BaseModal component */}
        <BaseModal
          isOpen={isOpen}
          onClose={handleClose}
          title="Edit Profile"
          subtitle="Update your profile information"
          icon={<FaUserEdit />}
          maxWidth="md:max-w-3xl"
        >
          <div className="p-2">
            <ProfileMultiStepForm
              isOpen={isOpen}
              onClose={handleClose}
              initialValues={profile}
            />
          </div>
        </BaseModal>
      </div>
    </div>
  );
};

export default EditProfile;
