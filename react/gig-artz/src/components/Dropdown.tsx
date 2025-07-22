import { useState, useEffect, useRef } from "react";

const MultiCheckboxDropdown = ({
  categories = [],
  selectedCategories = [],
  setSelectedCategories,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const closeDropdown = () => setIsOpen(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        type="button"
        className={`p-2 w-full bg-gray-800 text-white rounded-lg border border-teal-700 min-h-[44px] flex flex-wrap items-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-400 transition`}
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex flex-wrap gap-2 flex-1 text-left">
          {selectedCategories.length > 0 ? (
            selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center bg-teal-700 text-white text-xs font-semibold px-2 py-1 rounded-full shadow hover:bg-teal-600 transition"
              >
                {cat}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategories(
                      selectedCategories.filter((c) => c !== cat)
                    );
                  }}
                  className="ml-1 hover:text-red-300 focus:outline-none"
                  aria-label={`Remove ${cat}`}
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400">Select categories...</span>
          )}
        </div>
        {/* Icon */}
        <svg
          className={`w-5 h-5 ml-auto transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute mt-1 z-20 w-full bg-gray-900 text-white border border-teal-700 rounded-lg shadow-lg p-2 max-h-64 overflow-y-auto animate-fadeIn space-y-1">
          {categories.length === 0 ? (
            <div className="text-sm text-gray-400 p-2">
              No categories found.
            </div>
          ) : (
            categories.map((category) => (
              <label
                key={category}
                className="flex items-center space-x-2 p-2 rounded hover:bg-teal-900/60 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="form-checkbox h-4 w-4 accent-teal-500"
                />
                <span className="text-sm">{category}</span>
              </label>
            ))
          )}
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="w-full mt-2 text-sm text-teal-300 hover:underline focus:outline-none"
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiCheckboxDropdown;
