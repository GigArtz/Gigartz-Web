import React, { useState, useReducer, useCallback } from "react";
import { FaArrowLeft, FaArrowRight, FaCircle, FaTrash } from "react-icons/fa";

// Initial form state
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
  time: "",
  venue: "",
  artistLineUp: [""], // Dynamic array
  ticketsAvailable: [{}],
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

  return (
    <div className="justify-center items-center z-30">
      <div className="flex-row p-2 space-y-2 md:p-4 md:space-y-6">
        <div className="rounded-lg">
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
          {step === 3 && <Step3 formData={formData} dispatch={dispatch} />}
          {step === 4 && (
            <Step4
              formData={formData}
              handleTicketChange={handleTicketChange}
            />
          )}
          {step === 5 && (
            <Step5 formData={formData} handleChange={handleChange} />
          )}
          {step === 6 && <Step6 formData={formData} />}
        </div>

        <div className="flex justify-between ">
          {step > 1 && (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="text-teal-500 flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Previous
            </button>
          )}

          {step < 6 && (
            <button
              onClick={() => setStep((prev) => prev + 1)}
              className="text-teal-500 flex items-center"
            >
              Next <FaArrowRight className="ml-2" />
            </button>
          )}

          {
            // Show submit button on the last step
            step === 6 && (
              <button className="p-2 px-4 bg-teal-500 rounded-lg text-white">
                Submit
              </button>
            )
          }
        </div>
        <div className="flex flex-row items-center justify-center gap-1 p-1 rounded-lg">
          {
            // Show step indicators
            Array.from({ length: 6 }, (_, i) => i + 1).map((indicator) => (
              <FaCircle
                key={indicator}
                className={`text-xs ${
                  indicator === step ? "text-teal-500" : "text-gray-500"
                }`}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
};

// Step 1: Basic Event Details
const Step1 = ({ formData, handleChange }) => (
  <div className="space-y-2">
    <label className="block text-white text-lg font-semibold border-b border-gray-500 pb-3 mb-4 text-center">Event Details</label>
    <label className="block text-white">Event Name</label>
    <input
      type="text"
      name="title"
      value={formData.title}
      onChange={handleChange}
      className="input-field"
      placeholder="Event Name"
    />

    <label className="block text-white">Event Venue</label>
    <input
      type="text"
      name="title"
      value={formData.venue}
      onChange={handleChange}
      className="input-field"
      placeholder="Event Venue"
    />

    <label className="block text-white">Event Description</label>
    <textarea
      name="description"
      value={formData.description}
      onChange={handleChange}
      className="input-field"
      placeholder="Event Description"
    />

    <label className="block text-white">Event Category</label>
    <input
      type="text"
      name="title"
      value={formData.category}
      onChange={handleChange}
      className="input-field"
      placeholder="Event Category"
    />
  </div>
);

// Step 2: Artist Lineup
const Step2 = ({ formData, handleArtistChange, dispatch }) => (
  <div className="space-y-2">
    <label className="block text-white text-lg font-semibold border-b border-gray-500 pb-3 mb-5 text-center">Artist Line Up</label>
    {formData.artistLineUp.map((artist, index) => (
      <div key={index} className="flex">
        <input
          type="text"
          value={artist}
          onChange={(e) => handleArtistChange(index, e.target.value)}
          className="input-field"
          placeholder="Artist Name"
        />
        <button
          onClick={() => dispatch({ type: "removeArtist", index })}
          className="ml-2 text-red-500"
        >
          <FaTrash />
        </button>
      </div>
    ))}
    <div className="flex justify-center">
      <button
        onClick={() => dispatch({ type: "addArtist" })}
        className="p-1 px-3 text-green-500 border border-green-500 rounded-lg"
      >
        + Add Artist
      </button>
    </div>
  </div>
);

// Step 3: Event Schedule
const Step3 = ({ formData, handleChange }) => (
  <div className="space-y-2">
    
    <label className="block text-white text-lg font-semibold border-b border-gray-500 pb-3 mb-4 text-center">Event Date and Time</label>
    <label className="block text-white">Select Date</label>
    <input
      type="date"
      name="date"
      value={formData.date}
      onChange={handleChange}
      className="input-field"
    />

    <label className="block text-white">Set Start Time</label>
    <input
      type="time"
      name="eventStartTime"
      value={formData.eventStartTime}
      onChange={handleChange}
      className="input-field"
    />

    <label className="block text-white">Set End Time</label>
    <input
      type="time"
      name="eventEndTime"
      value={formData.eventEndTime}
      onChange={handleChange}
      className="input-field"
    />
  </div>
);

// Step 4: Tickets
const Step4 = () => {
  // State to manage ticket list
  const [tickets, setTickets] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isTypeSelected, setIsTypeSelected] = useState(false);

  // Default new ticket structure
  const [newTicket, setNewTicket] = useState({
    type: "",
    quantity: "",
    price: "",
    info: "",
    ticketReleaseDate: "",
    ticketReleaseTime: "",
  });

  // Handle input changes for new ticket
  const handleNewTicketChange = (field, value) => {
    setNewTicket((prev) => ({ ...prev, [field]: value }));
  };

  // Add new ticket to the list
  const addTicketType = () => {
    if (
      newTicket.type &&
      newTicket.quantity &&
      newTicket.price &&
      newTicket.ticketReleaseDate &&
      newTicket.ticketReleaseTime &&
      newTicket.info 
    ) {
      setTickets([...tickets, newTicket]);

      // Reset new ticket form
      setNewTicket({
        type: "",
        quantity: "",
        price: "",
        info: "",
        ticketReleaseDate: "",
        ticketReleaseTime: "",
      });

      setIsAdding(false);
      setIsTypeSelected(false);
    } else {
      alert("Please fill in all required fields.");
    }
  };

  // Remove a ticket from the list
  const removeTicketType = (index) => {
    setTickets(tickets.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      
    <label className="block text-white text-lg font-semibold border-b border-gray-500 pb-3 mb-4 text-center">Event Tickets</label>
      {/* Existing Tickets List */}
      {tickets.map((ticket, index) => (
        <div key={index} className="space-y-2 border-b border-gray-500 pb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white">Ticket Type: {ticket.type}</h3>
            <button
              onClick={() => removeTicketType(index)}
              className="text-red-500"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}

      {/* Add New Ticket Section */}
      {isAdding ? (
        <div className="space-y-2">
          {!isTypeSelected && ( <h3 className="text-white">Add New Ticket</h3>)}
         

          {!isTypeSelected ? (
            <div>
              <input
                type="text"
                placeholder="Enter Ticket Type"
                value={newTicket.type}
                onChange={(e) => handleNewTicketChange("type", e.target.value)}
                className="input-field"
              />
              <button
                onClick={() =>
                  newTicket.type.trim()
                    ? setIsTypeSelected(true)
                    : alert("Please enter a ticket type first.")
                }
                className="p-1 px-3 mt-2 text-green-500 border border-green-500 rounded-lg"
              >
                Next
              </button>
            </div>
          ) : (
            <>
              <label className="block text-white text-center font-semibold">
                {newTicket.type} Ticket
              </label>
              <label className="block text-white">Ticket Price</label>
              <input
                type="number"
                placeholder="Price"
                value={newTicket.price}
                onChange={(e) => handleNewTicketChange("price", e.target.value)}
                className="input-field"
              />

              <label className="block text-white">Tickets Available</label>
              <input
                type="number"
                placeholder="Quantity"
                value={newTicket.quantity}
                onChange={(e) =>
                  handleNewTicketChange("quantity", e.target.value)
                }
                className="input-field"
              />

              <label className="block text-white">Tickets Information</label>
              <textarea
                placeholder="Ticket Information"
                value={newTicket.info}
                onChange={(e) => handleNewTicketChange("info", e.target.value)}
                className="input-field"
              />

              <label className="block text-white">Release Date</label>
              <input
                type="date"
                placeholder="Release Date"
                value={newTicket.ticketReleaseDate}
                onChange={(e) =>
                  handleNewTicketChange("ticketReleaseDate", e.target.value)
                }
                className="input-field"
              />

              <label className="block text-white">Release Time</label>
              <input
                type="time"
                placeholder="Release Time"
                value={newTicket.ticketReleaseTime}
                onChange={(e) =>
                  handleNewTicketChange("ticketReleaseTime", e.target.value)
                }
                className="input-field"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setIsTypeSelected(false);
                  }}
                  className="p-1 px-3 text-gray-500 border border-gray-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={addTicketType}
                  className="p-1 px-3 text-green-500 border border-green-500 rounded-lg"
                >
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 px-3 text-green-500 border border-green-500 rounded-lg"
          >
            + Add Ticket Type
          </button>
        </div>
      )}
    </div>
  );
};

// Step 4: Media Uploads
const Step5 = ({ formData, handleChange }) => (
  <div className="space-y-2">
    
    <label className="block text-white text-lg font-semibold border-b border-gray-500 pb-3 text-center mb-4">Event Gallery</label>
    <label className="block text-white">Event Video</label>
    <input
      type="file"
      name="eventVideo"
      onChange={handleChange}
      className="input-field"
    />

    <label className="block text-white">Gallery</label>
    <input
      type="file"
      name="gallery"
      multiple
      onChange={handleChange}
      className="input-field"
    />
  </div>
);

// Step 5: Confirmation
const Step6 = ({ formData }) => (
  <div className="space-y-4">
    <label className="block text-white text-lg font-semibold border-b border-gray-500 pb-3 text-center">Event Summary</label>
    <pre className="text-white">{JSON.stringify(formData, null, 2)}</pre>
  </div>
);

export default AddEventForm;
