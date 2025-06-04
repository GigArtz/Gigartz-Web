import { useState } from "react";

const MultiCheckboxDropdown = ({
  categories,
  selectedCategories,
  setSelectedCategories,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="relative w-64">
      <div
        className="mt-2 p-2 w-full bg-gray-800 text-white rounded border border-gray-600 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCategories.length > 0
          ? selectedCategories.join(", ")
          : "Select"}
      </div>
      {isOpen && (
        <div className="absolute w-full bg-gray-800 text-white border border-gray-600 rounded mt-1 z-10 p-2 max-h-64 overflow-y-auto">
          {categories.map((category, index) => (
            <label
              key={index}
              className="flex items-center space-x-2 p-1 hover:bg-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="form-checkbox h-4 w-4"
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiCheckboxDropdown;
