import React, { useState, useRef, useEffect } from "react";

const interestOptions = [
  "Music",
  "Outdoors",
  "Sports",
  "Reading",
  "Travel",
  "Cooking",
];

const Preferences: React.FC = () => {
  const [interests, setInterests] = useState<string[]>([]);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="max-w-md p-6 rounded-lg shadow-lg text-white">
      <h3 className="text-2xl font-semibold mb-6">Preferences</h3>

      {/* Interests dropdown */}
      <div className="mb-8 relative" ref={dropdownRef}>
        <label className="font-semibold mb-2 block">Select your interests</label>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          className="w-full bg-gray-800 rounded-md px-4 py-3 flex justify-between items-center text-left cursor-pointer
                     hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
        >
          <span className={`${interests.length === 0 ? "text-gray-400" : ""}`}>
            {interests.length > 0
              ? interests.join(", ")
              : "Select interests..."}
          </span>
          <svg
            className={`w-5 h-5 text-teal-400 transition-transform duration-300 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <ul
            role="listbox"
            aria-multiselectable="true"
            tabIndex={-1}
            className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-md bg-gray-800 border border-gray-700 shadow-lg focus:outline-none"
          >
            {interestOptions.map((interest) => (
              <li
                key={interest}
                role="option"
                aria-selected={interests.includes(interest)}
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-700"
                onClick={() => toggleInterest(interest)}
              >
                <input
                  type="checkbox"
                  checked={interests.includes(interest)}
                  onChange={() => toggleInterest(interest)}
                  className="form-checkbox h-5 w-5 rounded text-teal-400"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${interest}`}
                />
                <span className="ml-3">{interest}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Notifications toggles */}
      <div>
        <h4 className="font-semibold mb-4">Notifications</h4>

        <div className="flex items-center justify-between mb-5">
          <span>Push Notifications</span>
          <label className="relative inline-block w-12 h-7">
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={() => setPushNotifications(!pushNotifications)}
              className="peer sr-only"
              aria-checked={pushNotifications}
              aria-label="Toggle push notifications"
            />
            <span className="block bg-gray-600 rounded-full w-12 h-7 transition peer-checked:bg-teal-500"></span>
            <span className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></span>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span>Email Notifications</span>
          <label className="relative inline-block w-12 h-7">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={() => setEmailNotifications(!emailNotifications)}
              className="peer sr-only"
              aria-checked={emailNotifications}
              aria-label="Toggle email notifications"
            />
            <span className="block bg-gray-600 rounded-full w-12 h-7 transition peer-checked:bg-teal-500"></span>
            <span className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
