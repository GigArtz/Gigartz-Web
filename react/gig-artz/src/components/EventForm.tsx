import { AppDispatch } from "@/store/store";
import { addEvent } from "../store/eventsSlice";
import React, { useState, useReducer, useCallback } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useDispatch } from "react-redux";

// Initial form data
const initialState = {
  title: "",
  description: "",
  category: "",
  eventType: "",
  hostName: "",
  promoterId: "AUTO_GENERATED_ID", // Could be hidden or auto-filled
  complimentaryTicket: false,
  tip: false,
  date: "",
  eventStartTime: "",
  eventEndTime: "",
  venue: "",
  artistLineUp: [""], // Dynamic array
  ticketsAvailable: {
    vip: {
      quantity: 0,
      price: 0,
      ticketReleaseDate: "",
      ticketReleaseTime: "",
    },
    general: {
      quantity: 0,
      price: 0,
      ticketReleaseDate: "",
      ticketReleaseTime: "",
    },
  },
  eventVideo: null,
  gallery: [],
};

// Reducer function
const formReducer = (state, action) => {
  if (action.type === "update") {
    return { ...state, [action.name]: action.value };
  }
  if (action.type === "updateNested") {
    return {
      ...state,
      ticketsAvailable: {
        ...state.ticketsAvailable,
        [action.ticketType]: {
          ...state.ticketsAvailable[action.ticketType],
          [action.name]: action.value,
        },
      },
    };
  }
  if (action.type === "updateArray") {
    const updatedArray = [...state.artistLineUp];
    updatedArray[action.index] = action.value;
    return { ...state, artistLineUp: updatedArray };
  }
  if (action.type === "addArtist") {
    return { ...state, artistLineUp: [...state.artistLineUp, ""] };
  }
  if (action.type === "removeArtist") {
    const updatedArray = [...state.artistLineUp];
    updatedArray.splice(action.index, 1);
    return { ...state, artistLineUp: updatedArray };
  }
  return state;
};

const AddEventForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, dispatch] = useReducer(formReducer, initialState);

const dispatchTwo = useDispatch<AppDispatch>();

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const finalValue = type === "checkbox" ? checked : files ? files : value;
    dispatch({ type: "update", name, value: finalValue });
  };

  const handleTicketChange = (e, ticketType) => {
    const { name, value } = e.target;
    dispatch({ type: "updateNested", ticketType, name, value });
  };

  const handleArtistChange = (index, value) => {
    dispatch({ type: "updateArray", index, value });
  };

  const handleNext = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handlePrevious = useCallback(() => {
    setStep((prev) => prev - 1);
  }, []);

  const handleSubmit = useCallback(() => {
    console.log("Form Submitted", formData);

    // dispatch action
    dispatchTwo(addEvent(formData))
    alert("Event Submitted Successfully!");
  }, [formData]);

  return (
    <div className="justify-center items-center z-20">
      <div className="flex-row p-8 space-y-6">
        <div className="flex justify-between">
          {step > 1 && (
            <button
              onClick={handlePrevious}
              className="text-white flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Previous
            </button>
          )}
          {step < 5 && (
            <button
              onClick={handleNext}
              className="text-white flex items-center"
            >
              Next <FaArrowRight className="ml-2" />
            </button>
          )}
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          {step === 1 && (
            <Step1 formData={formData} handleChange={handleChange} />
          )}
          {step === 2 && (
            <Step2
              formData={formData}
              handleArtistChange={handleArtistChange}
              dispatch={dispatch}
            />
          )}
          {step === 3 && (
            <Step3
              formData={formData}
              handleTicketChange={handleTicketChange}
            />
          )}
          {step === 4 && (
            <Step4 formData={formData} handleChange={handleChange} />
          )}
          {step === 5 && (
            <Step5 formData={formData} handleSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </div>
  );
};

// Step components wrapped in React.memo
const Step1 = React.memo(({ formData, handleChange }) => (
  <div className="space-y-4">
    <label className="block text-white">Event Title</label>
    <input
      type="text"
      name="title"
      value={formData.title}
      onChange={handleChange}
      className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
    />

    <label className="block text-white">Event Description</label>
    <textarea
      name="description"
      value={formData.description}
      onChange={handleChange}
      className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
    />

    <label className="block text-white">Category</label>
    <input
      type="text"
      name="category"
      value={formData.category}
      onChange={handleChange}
      className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
    />

    <label className="block text-white">Event Type</label>
    <input
      type="text"
      name="eventType"
      value={formData.eventType}
      onChange={handleChange}
      className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
    />

    <label className="block text-white">Host Name</label>
    <input
      type="text"
      name="hostName"
      value={formData.hostName}
      onChange={handleChange}
      className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
    />

    <label className="block text-white">Event Date</label>
    <input
      type="date"
      name="date"
      value={formData.date}
      onChange={handleChange}
      className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
    />

    <label className="block text-white">Event Start Time</label>
    <input
      type="time"
      name="eventStartTime"
      value={formData.eventStartTime}
      onChange={handleChange}
      className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
    />

    <label className="block text-white">Event End Time</label>
    <input
      type="time"
      name="eventEndTime"
      value={formData.eventEndTime}
      onChange={handleChange}
      className="mt-2 p-3 w-full rounded-lg bg-gray-700 text-white"
    />

    <label className="block text-white">Complimentary Ticket</label>
    <input
      type="checkbox"
      name="complimentaryTicket"
      checked={formData.complimentaryTicket}
      onChange={handleChange}
      className="mt-2"
    />

    <label className="block text-white">Tip</label>
    <input
      type="checkbox"
      name="tip"
      checked={formData.tip}
      onChange={handleChange}
      className="mt-2"
    />
  </div>
));

const Step2 = React.memo(({ formData, handleArtistChange, dispatch }) => (
  <div className="space-y-4">
    <label className="block text-white">Artist Lineup</label>
    {formData.artistLineUp.map((artist, index) => (
      <div key={index} className="flex">
        <input
          type="text"
          value={artist}
          onChange={(e) => handleArtistChange(index, e.target.value)}
          className="p-3 bg-gray-700 text-white rounded-lg w-full"
        />
        <button
          onClick={() => dispatch({ type: "removeArtist", index })}
          className="ml-2 text-red-500"
        >
          X
        </button>
      </div>
    ))}
    <button
      onClick={() => dispatch({ type: "addArtist" })}
      className="text-green-500"
    >
      + Add Artist
    </button>
  </div>
));

const Step3 = React.memo(({ formData, handleTicketChange }) => (
  <div className="space-y-4">
    <h2 className="text-white text-xl">Ticket Prices</h2>
    {["vip", "general"].map((type) => (
      <div key={type} className="space-y-2">
        <h3 className="text-white">{type.toUpperCase()} Tickets</h3>
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.ticketsAvailable[type].quantity}
          onChange={(e) => handleTicketChange(e, type)}
          className="p-3 bg-gray-700 text-white rounded-lg w-full"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.ticketsAvailable[type].price}
          onChange={(e) => handleTicketChange(e, type)}
          className="p-3 bg-gray-700 text-white rounded-lg w-full"
        />
        <input
          type="date"
          name="ticketReleaseDate"
          placeholder="Release Date"
          value={formData.ticketsAvailable[type].ticketReleaseDate}
          onChange={(e) => handleTicketChange(e, type)}
          className="p-3 bg-gray-700 text-white rounded-lg w-full"
        />
        <input
          type="time"
          name="ticketReleaseTime"
          placeholder="Release Time"
          value={formData.ticketsAvailable[type].ticketReleaseTime}
          onChange={(e) => handleTicketChange(e, type)}
          className="p-3 bg-gray-700 text-white rounded-lg w-full"
        />
      </div>
    ))}
  </div>
));

const Step4 = React.memo(({ formData, handleChange }) => (
  <div className="space-y-4">
    <label className="block text-white">Event Video</label>
    <input
      type="file"
      name="eventVideo"
      onChange={handleChange}
      className="p-3 w-full bg-gray-700 text-white rounded-lg"
    />

    <label className="block text-white">Gallery</label>
    <input
      type="file"
      name="gallery"
      multiple
      onChange={handleChange}
      className="p-3 w-full bg-gray-700 text-white rounded-lg"
    />
  </div>
));

const Step5 = React.memo(({ formData, handleSubmit }) => (
  <div className="space-y-4">
    <h2 className="text-white text-2xl">Confirm Your Event Details</h2>
    <pre className="text-white">{JSON.stringify(formData, null, 2)}</pre>
    <button
      onClick={handleSubmit}
      className="mt-4 p-3 bg-blue-500 text-white rounded-lg"
    >
      Submit Event
    </button>
  </div>
));

export default AddEventForm;
