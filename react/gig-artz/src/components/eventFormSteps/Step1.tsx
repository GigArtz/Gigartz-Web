import React from "react";
import VenueInput from "../VenueInput";
import ErrorMessage from "../ErrorMessage";

interface Step1Props {
  formData: {
    title: string;
    venue: string;
    description: string;
    eventType: string;
    mainCategory: string;
    subCategory: string;
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  errors: Record<string, string>;
}

const Step1: React.FC<Step1Props> = ({ formData, handleChange, errors }) => {
  const categories = {
    "Music & Concerts": [
      "Live Bands",
      "DJ Sets / Parties",
      "Classical & Opera",
      "Jazz & Blues",
      "Hip-Hop / R&B",
      "House / EDM / Amapiano",
      "Afrobeat / African Contemporary",
      "Indie / Alternative",
    ],
    "Performing Arts": [
      "Theatre / Drama",
      "Dance Performances",
      "Comedy Shows",
      "Poetry & Spoken Word",
      "Cabaret / Variety Acts",
    ],
    "Social & Lifestyle": [
      "Day Parties / Brunches",
      "Wine Tastings / Mixology Events",
      "Nightlife / Club Events",
      "Fashion Shows / Runway Events",
      "Food Markets / Pop-Ups",
    ],
    "Culture & Community": [
      "Heritage Celebrations",
      "Faith-Based Events",
      "Community Fundraisers",
      "Social Justice / Awareness Events",
    ],
    "Business & Networking": [
      "Industry Panels",
      "Conferences / Summits",
      "Networking Mixers",
      "Brand Launches / Promotions",
      "Start-up Pitches / Demo Days",
    ],
    "Education & Workshops": [
      "Creative Masterclasses (e.g. Art, Music, Writing)",
      "Professional Development (e.g. Finance, Tech, Marketing)",
      "Tech Bootcamps / Hackathons",
      "Youth Empowerment Sessions",
    ],
    "Family & Kids": [
      "Family Fun Days",
      "Storytime / Puppet Shows",
      "Educational Events for Children",
      "Teen Talent Shows",
    ],
    "Sports & Fitness": [
      "Tournaments (e.g. Football, Netball, Basketball)",
      "Outdoor Adventures (e.g. Hikes, Camps)",
      "Fitness Classes / Challenges",
      "Esports / Gaming Tournaments",
    ],
  };

  const handleNestedChange = (e) => {
    const { name, value } = e.target;

    if (name === "mainCategory") {
      handleChange({
        target: {
          name: "mainCategory",
          value,
        },
      });

      // Reset subcategory and category on main change
      handleChange({
        target: {
          name: "subCategory",
          value: "",
        },
      });
      handleChange({
        target: {
          name: "category",
          value: "",
        },
      });
    } else if (name === "subCategory") {
      handleChange({
        target: {
          name: "subCategory",
          value,
        },
      });
      // Update formData.category for backend submission
      handleChange({
        target: {
          name: "category",
          value,
        },
      });
    }
  };

  return (
    <div className="space-y-4 rounded-lg p-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Event Name *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`input-field ${errors.title ? "border-red-500" : ""}`}
          placeholder="Enter event name"
        />
        <ErrorMessage error={errors.title} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Venue *
        </label>
        <div className="relative">
          <VenueInput
            apiKey={import.meta.env.VITE_MAPS_API_KEY}
            className={`input-field ${errors.venue ? "border-red-500" : ""}`}
            defaultValue={formData.venue}
            onPlaceSelected={(place) => {
              const value = place.formatted_address || place.name || "";
              handleChange({ target: { name: "venue", value, type: "text" } });
            }}
            placeholder="Search for venue"
          />
        </div>
        <ErrorMessage error={errors.venue} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`input-field ${
            errors.description ? "border-red-500" : ""
          }`}
          placeholder="Describe your event"
          rows={4}
        />
        <ErrorMessage error={errors.description} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Event Type *
        </label>
        <select
          name="eventType"
          value={formData.eventType}
          onChange={handleChange}
          className={`input-field ${errors.eventType ? "border-red-500" : ""}`}
        >
          <option value="Public">Public</option>
          <option value="Private">Private</option>
        </select>
        <ErrorMessage error={errors.eventType} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category *
        </label>
        <select
          name="mainCategory"
          value={formData.mainCategory}
          onChange={handleNestedChange}
          className={`input-field ${
            errors.mainCategory ? "border-red-500" : ""
          }`}
        >
          <option value="">Select a category</option>
          {Object.keys(categories).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <ErrorMessage error={errors.mainCategory} />
      </div>

      {formData.mainCategory && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Subcategory *
          </label>
          <select
            name="subCategory"
            value={formData.subCategory}
            onChange={handleNestedChange}
            className={`input-field ${
              errors.subCategory ? "border-red-500" : ""
            }`}
          >
            <option value="">Select a subcategory</option>
            {categories[formData.mainCategory].map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
          <ErrorMessage error={errors.subCategory} />
        </div>
      )}
    </div>
  );
};

export default Step1;
