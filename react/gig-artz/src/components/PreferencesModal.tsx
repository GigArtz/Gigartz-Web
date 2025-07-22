import React, { useState } from "react";
import Autocomplete from "react-google-autocomplete";
import BaseModal from "./BaseModal";
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
  const [searchTerm, setSearchTerm] = useState("");

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
    setSearchTerm("");
  };

  const expandAll = () => {
    const allCategories = { ...eventCategories, ...freelancerCategories };
    setOpenDropdowns(
      Object.keys(allCategories).reduce(
        (acc, category) => ({
          ...acc,
          [category]: true,
        }),
        {}
      )
    );
  };

  const collapseAll = () => {
    setOpenDropdowns({});
  };

  // Filter categories based on search term
  const filterCategories = (categories: any) => {
    if (!searchTerm) return categories;

    return Object.entries(categories).reduce((acc, [category, options]) => {
      const matchingOptions = (options as string[]).filter(
        (option) =>
          option.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (
        matchingOptions.length > 0 ||
        category.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        acc[category] = matchingOptions.length > 0 ? matchingOptions : options;
      }
      return acc;
    }, {} as any);
  };

  const filteredEventCategories = filterCategories(eventCategories);
  const filteredFreelancerCategories = filterCategories(freelancerCategories);

  const renderCategorySection = (
    categories: any,
    sectionName: string,
    idPrefix: string
  ) => (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      role="list"
    >
      {Object.entries(categories).map(([category, options]) => (
        <article
          key={category}
          className=" rounded-xl p-1 transition-all duration-200 hover:bg-gray-750 "
          role="listitem"
        >
          <button
            type="button"
            onClick={() => toggleDropdown(category)}
            aria-expanded={!!openDropdowns[category]}
            aria-controls={`${category}-${idPrefix}-list`}
            className="w-full flex justify-between items-center text-white hover:text-teal-300 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-lg p-2"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-base">{category}</span>
              <span className="text-xs bg-teal-600 text-white px-2 py-1 rounded-full">
                {
                  (options as string[]).filter((opt) =>
                    selectedInterests.includes(opt)
                  ).length
                }
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-teal-400 transition-transform duration-200 ${
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
              id={`${category}-${idPrefix}-list`}
              className="mt-4 space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-700"
            >
              {(options as string[]).map((interest) => (
                <label
                  key={interest}
                  className={`flex items-center gap-3 p-2 mr-2 rounded-lg cursor-pointer transition-all duration-150 ${
                    selectedInterests.includes(interest)
                      ? "bg-teal-500 text-white shadow-md"
                      : " text-gray-200 hover:bg-gray-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedInterests.includes(interest)}
                    onChange={() => toggleInterest(interest)}
                    className="w-4 h-4 input-field rounded focus:ring-teal-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium">{interest}</span>
                </label>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-[60%]"
      minWidth="min-w-[80%]"
      className="max-h-[90vh] overflow-hidden animate-fadeInModal"
    >
      <div className="flex flex-col h-full max-h-[75vh]">
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-2 rounded-lg animate-fadeInUp">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search categories and interests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 focus:scale-105"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-4 py-2 text-sm bg-gray-700 hover:bg-teal-500 hover:scale-105 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md"
            >
              <span className="inline-block animate-bounceX">⤵️</span> Expand
              All
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 hover:scale-105 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md"
            >
              <span className="inline-block animate-bounceX">⤴️</span> Collapse
              All
            </button>
          </div>
        </div>

        {/* Selected Items Summary */}
        {(selectedInterests.length > 0 || selectedLocations.length > 0) && (
          <div className="mb-6 p-3 bg-teal-900/20 border border-teal-500/30 rounded-lg animate-fadeInUp">
            <h4 className="text-teal-400 font-medium mb-2">
              Selected ({selectedInterests.length + selectedLocations.length}{" "}
              items)
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedLocations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-full shadow-md animate-popIn"
                >
                  {loc}
                  <button
                    onClick={() => removeLocation(loc)}
                    className="ml-1 hover:text-red-300 transition-colors duration-150"
                    aria-label={`Remove ${loc}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedInterests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-teal-600 text-white text-sm rounded-full shadow-md animate-popIn"
                >
                  {interest}
                  <button
                    onClick={() => toggleInterest(interest)}
                    className="ml-1 hover:text-red-300 transition-colors duration-150"
                    aria-label={`Remove ${interest}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto space-y-8 pr-2 scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-700 animate-fadeInUp">
          {/* Location Selection */}
          <section>
            <h3 className="text-teal-400 font-semibold mb-4 text-lg">
              Locations
            </h3>
            <div className="rounded-lg p-2 animate-fadeInUp">
              <Autocomplete
                apiKey={import.meta.env.VITE_MAPS_API_KEY}
                onPlaceSelected={addLocation}
                placeholder="Search for a city, venue, or location..."
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 focus:scale-105"
              />
            </div>
          </section>

          {/* Event Categories */}
          {Object.keys(filteredEventCategories).length > 0 && (
            <section>
              <h3 className="text-teal-400 font-semibold mb-4 text-lg">
                Event Categories
              </h3>
              {renderCategorySection(filteredEventCategories, "Event", "event")}
            </section>
          )}

          {/* Freelancer Categories */}
          {Object.keys(filteredFreelancerCategories).length > 0 && (
            <section>
              <h3 className="text-teal-400 font-semibold mb-4 text-lg">
                Professional Categories
              </h3>
              {renderCategorySection(
                filteredFreelancerCategories,
                "Freelancer",
                "freelancer"
              )}
            </section>
          )}

          {/* No Results */}
          {searchTerm &&
            Object.keys(filteredEventCategories).length === 0 &&
            Object.keys(filteredFreelancerCategories).length === 0 && (
              <div className="text-center py-12 animate-fadeIn">
                <div className="text-gray-400 text-lg mb-2 animate-bounce">
                  🔍
                </div>
                <p className="text-gray-400">
                  No categories found matching "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-teal-400 hover:text-teal-300 underline transition-colors duration-150 animate-fadeInUp"
                >
                  Clear search
                </button>
              </div>
            )}
        </main>

        {/* Footer with buttons */}
        <footer className="flex-shrink-0 flex justify-between items-center gap-4 pt-6 border-t border-gray-700 bg-dark animate-fadeInUp">
          <div className="text-sm text-gray-400 animate-fadeIn">
            {selectedInterests.length + selectedLocations.length} items selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearAll}
              className="px-6 py-3 border border-gray-500 hover:bg-red-600 hover:scale-105 rounded-lg text-white font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-md"
            >
              <span className="inline-block animate-shake">🧹</span> Clear All
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 hover:scale-105 rounded-lg text-white font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md"
            >
              <span className="inline-block animate-popIn">✅</span> Apply
              Filters
            </button>
          </div>
        </footer>
      </div>
    </BaseModal>
  );
};

// Animations (Tailwind CSS custom classes)
// Add these to your tailwind.config.js if not present:
// fadeIn, fadeInUp, popIn, shake, bounceX
// Example:
// theme: {
//   extend: {
//     keyframes: {
//       fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
//       fadeInUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
//       popIn: { '0%': { transform: 'scale(0.8)' }, '100%': { transform: 'scale(1)' } },
//       shake: { '0%, 100%': { transform: 'translateX(0)' }, '20%, 60%': { transform: 'translateX(-5px)' }, '40%, 80%': { transform: 'translateX(5px)' } },
//       bounceX: { '0%, 100%': { transform: 'translateX(0)' }, '50%': { transform: 'translateX(8px)' } },
//     },
//     animation: {
//       fadeIn: 'fadeIn 0.5s ease',
//       fadeInUp: 'fadeInUp 0.5s ease',
//       popIn: 'popIn 0.3s cubic-bezier(.68,-0.55,.27,1.55)',
//       shake: 'shake 0.4s',
//       bounceX: 'bounceX 0.6s',
//     },
//   },
// }

export default PreferencesModal;
