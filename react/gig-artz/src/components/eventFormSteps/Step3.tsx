import React from "react";
import ErrorMessage from "../ErrorMessage";

interface Step3Props {
  formData: {
    date: string;
    eventStartTime: string;
    eventEndTime: string;
  };
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Record<string, string>;
}

const Step3: React.FC<Step3Props> = ({
  formData,
  handleDateChange,
  errors,
}) => (
  <div className="space-y-4 rounded-lg p-6">
    <div>
      <label className="block text-white mb-2">Select Date *</label>
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleDateChange}
        min={new Date().toISOString().split("T")[0]}
        className={`input-field ${errors.date ? "border-red-500" : ""}`}
      />
      <ErrorMessage error={errors.date} />
    </div>

    <div>
      <label className="block text-white mb-2">Set Start Time *</label>
      <input
        type="time"
        name="eventStartTime"
        value={formData.eventStartTime}
        onChange={handleDateChange}
        className={`input-field ${
          errors.eventStartTime ? "border-red-500" : ""
        }`}
      />
      <ErrorMessage error={errors.eventStartTime} />
    </div>

    <div>
      <label className="block text-white mb-2">Set End Time *</label>
      <input
        type="time"
        name="eventEndTime"
        value={formData.eventEndTime}
        onChange={handleDateChange}
        className={`input-field ${errors.eventEndTime ? "border-red-500" : ""}`}
      />
      <ErrorMessage error={errors.eventEndTime} />
    </div>
  </div>
);

export default Step3;
