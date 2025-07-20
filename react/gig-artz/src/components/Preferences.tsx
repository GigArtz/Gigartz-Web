import React, { useState } from "react";
import PreferencesModal from "./PreferencesModal";

const Preferences: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  return (
    <div className="p-6 max-w-2xl mx-auto text-white overflow-auto h-full bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">User Preferences</h1>

      {/* Interests */}
      {selectedInterests.length > 0 && (
        <div className="mb-4">
          <label className="block font-medium mb-1">Your Interests:</label>
          <div className="bg-gray-800 px-4 py-3 rounded-md text-sm text-gray-300 min-h-[40px]">
            {selectedInterests.join(", ")}
          </div>
        </div>
      )}
      {/* Locations */}
      {selectedLocations.length > 0 && (
        <div className="mb-4">
          <label className="block font-medium mb-1">
            Your Preferred Locations:
          </label>
          <div className="bg-gray-800 px-4 py-3 rounded-md text-sm text-gray-300 min-h-[40px]">
            {selectedLocations.join(", ")}
          </div>
        </div>
      )}

      {selectedInterests.length === 0 || selectedLocations.length === 0 ? (
        <p className="text-gray-400 mb-4">
          Please select your interests and preferred locations to personalize
          your experience.
        </p>
      ) : (
        <p className="text-gray-400 mb-4">
          Your preferences are set! You can edit them anytime.
        </p>
      )}

      <button
        onClick={() => setModalOpen(true)}
        className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-4 py-2 rounded-md"
      >
        Edit Preferences
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <PreferencesModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            selectedInterests={selectedInterests}
            setSelectedInterests={setSelectedInterests}
            selectedLocations={selectedLocations}
            setSelectedLocations={setSelectedLocations}
            title={"Select Your Preferences"}
          />
        </div>
      )}
    </div>
  );
};

export default Preferences;
