import React from "react";
import { FaMinus } from "react-icons/fa";
import ErrorMessage from "../ErrorMessage";

interface Step2Props {
  formData: {
    artistLineUp: string[];
  };
  handleArtistChange: (index: number, value: string) => void;
  dispatch: React.Dispatch<
    { type: "addArtist" } | { type: "removeArtist"; index: number }
  >;

  errors: Record<string, string>;
}

const Step2: React.FC<Step2Props> = ({
  formData,
  handleArtistChange,
  dispatch,
  errors,
}) => (
  <div className="space-y-4 rounded-lg p-6">
    {formData.artistLineUp.map((artist, index) => (
      <div key={index} className="flex space-x-2">
        <input
          type="text"
          value={artist}
          onChange={(e) => handleArtistChange(index, e.target.value)}
          className="input-field flex-1"
          placeholder={`Artist ${index + 1} name`}
        />
        {formData.artistLineUp.length > 1 && (
          <button
            onClick={() => dispatch({ type: "removeArtist", index })}
            className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            <FaMinus />
          </button>
        )}
      </div>
    ))}

    <ErrorMessage error={errors.artistLineUp} />

    <div className="flex justify-center">
      <button
        onClick={() => dispatch({ type: "addArtist" })}
        className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-all duration-300"
        type="button"
      >
        + Add Artist
      </button>
    </div>
  </div>
);

export default Step2;
