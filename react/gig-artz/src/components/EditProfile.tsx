import React from "react";

const EditProfile: React.FC = () => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
      {/* Reuse the same form or component used in user profile page */}
      <p>Form to edit name, username, profile picture, bio, etc.</p>
    </div>
  );
};

export default EditProfile;
