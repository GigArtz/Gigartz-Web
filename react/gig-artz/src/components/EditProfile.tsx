import React, { useState } from "react";
import ProfileMultiStepForm from "./ProfileMultiStepForm";

const EditProfile: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
      <p className="mb-6 text-gray-300">
        Update your name, username, profile picture, bio, and other details below.
      </p>

      {isOpen ? (
        <>
          <ProfileMultiStepForm isOpen={isOpen} onClose={handleClose} />
          <button
            onClick={handleClose}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Cancel Editing
          </button>
        </>
      ) : (
        <button
          onClick={handleOpen}
          className="px-6 py-3 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
        >
          Edit Profile
        </button>
      )}
    </div>
  );
};

export default EditProfile;
