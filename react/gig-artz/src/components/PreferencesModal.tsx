import React, { useState } from "react";
import Autocomplete from "react-google-autocomplete";
import {
  eventCategories,
  freelancerCategories,
} from "../constants/EventCategories";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInterests: string[];
  setSelectedInterests: React.Dispatch<React.SetStateAction<string[]>>;
  selectedLocations: string[];
  setSelectedLocations: React.Dispatch<React.SetStateAction<string[]>>;
  title: string;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  selectedInterests,
  setSelectedInterests,
  selectedLocations,
  setSelectedLocations,
  title,
}) => {
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleDropdown = (category: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const addLocation = (place: google.maps.places.PlaceResult) => {
    const value = place.formatted_address || place.name || "";
    if (value && !selectedLocations.includes(value)) {
      setSelectedLocations((prev) => [...prev, value]);
    }
  };

  const removeLocation = (location: string) => {
    setSelectedLocations((prev) => prev.filter((loc) => loc !== location));
  };

  const clearAll = () => {
    setSelectedInterests([]);
    setSelectedLocations([]);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6"
      aria-modal="true"
      role="dialog"
      aria-labelledby="preferences-modal-title"
    >
      <div className="bg-gray-900 text-white w-full max-w-[50%] rounded-xl shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
        <header className="p-6 border-b border-gray-700">
          <h2
            id="preferences-modal-title"
            className="text-xl font-bold text-center select-none"
          >
            {title}
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-4 space-y-10">
          {/* Location Selection */}
          <section>
            <h3 className="text-teal-400 font-semibold mb-5">Location</h3>

            <div className="flex items-center gap-2 mb-4">
              <Autocomplete
                apiKey={import.meta.env.VITE_MAPS_API_KEY}
                onPlaceSelected={addLocation}
                placeholder="Search for a city or venue"
                className="w-full px-4 py-3 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedLocations.map((loc) => (
                <div
                  key={loc}
                  className="bg-gray-700 text-white px-4 py-2 rounded-full flex items-center gap-2"
                >
                  <span>{loc}</span>
                  <button
                    type="button"
                    onClick={() => removeLocation(loc)}
                    className="text-red-400 hover:text-red-600 focus:outline-none"
                    aria-label={`Remove ${loc}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Event Categories */}
          <section>
            <h3 className="text-teal-400 font-semibold mb-5">
              Event Categories
            </h3>
            <div
              className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2"
              role="list"
            >
              {Object.entries(eventCategories).map(([category, options]) => (
                <article
                  key={category}
                  className="rounded-xl p-2 flex flex-col"
                  role="listitem"
                >
                  <button
                    type="button"
                    onClick={() => toggleDropdown(category)}
                    aria-expanded={!!openDropdowns[category]}
                    aria-controls={`${category}-list`}
                    className="w-full flex justify-between items-center bg-gray-700 hover:bg-gray-600 text-white px-5 py-3 rounded-full transition-shadow focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <span className="font-medium text-base">{category}</span>
                    <svg
                      className={`w-6 h-6 text-teal-400 transition-transform duration-300 ${
                        openDropdowns[category] ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openDropdowns[category] && (
                    <div
                      id={`${category}-list`}
                      className="mt-4 flex flex-wrap gap-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-700"
                    >
                      {options.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full border transition focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                            selectedInterests.includes(interest)
                              ? "bg-teal-500 text-white border-teal-400"
                              : "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600"
                          }`}
                          aria-pressed={selectedInterests.includes(interest)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedInterests.includes(interest)}
                            onChange={() => toggleInterest(interest)}
                            onClick={(e) => e.stopPropagation()}
                            className="form-checkbox text-white h-4 w-4"
                            aria-label={`Select ${interest}`}
                          />
                          {interest}
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* Freelancer Categories */}
          <section>
            <h3 className="text-teal-400 font-semibold mb-5">
              Freelancer Categories
            </h3>
            <div
              className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2"
              role="list"
            >
              {Object.entries(freelancerCategories).map(
                ([category, options]) => (
                  <article
                    key={category}
                    className="rounded-xl p-2 flex flex-col"
                    role="listitem"
                  >
                    <button
                      type="button"
                      onClick={() => toggleDropdown(category)}
                      aria-expanded={!!openDropdowns[category]}
                      aria-controls={`${category}-freelancer-list`}
                      className="w-full flex justify-between items-center bg-gray-700 hover:bg-gray-600 text-white px-5 py-3 rounded-full transition-shadow focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      <span className="font-medium text-base">{category}</span>
                      <svg
                        className={`w-6 h-6 text-teal-400 transition-transform duration-300 ${
                          openDropdowns[category] ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {openDropdowns[category] && (
                      <div
                        id={`${category}-freelancer-list`}
                        className="mt-4 flex flex-wrap gap-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-700"
                      >
                        {options.map((interest) => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full border transition focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                              selectedInterests.includes(interest)
                                ? "bg-teal-500 text-white border-teal-400"
                                : "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600"
                            }`}
                            aria-pressed={selectedInterests.includes(interest)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedInterests.includes(interest)}
                              onChange={() => toggleInterest(interest)}
                              onClick={(e) => e.stopPropagation()}
                              className="form-checkbox text-white h-4 w-4"
                              aria-label={`Select ${interest}`}
                            />
                            {interest}
                          </button>
                        ))}
                      </div>
                    )}
                  </article>
                )
              )}
            </div>
          </section>
        </main>

        {/* Done Button */}
        <footer className="p-6 border-t border-gray-700 flex justify-end gap-2">
          <button
            onClick={() => {
              setSelectedInterests([]);
              setSelectedLocations([]);
            }}
            className="px-8 py-3 border border-gray-500  hover:bg-gray-600 rounded-full text-white font-semibold text-lg transition focus:outline-none focus:ring-4 focus:ring-teal-400"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-teal-500 hover:bg-teal-600 rounded-full text-white font-semibold text-lg transition focus:outline-none focus:ring-4 focus:ring-teal-400"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PreferencesModal;
