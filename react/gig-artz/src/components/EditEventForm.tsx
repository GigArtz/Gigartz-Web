import { RootState } from "../../store/store";
import React, { useState, useReducer, useEffect } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCircle,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateEvent } from "../../store/eventsSlice"; // Adjust the path if needed
import { showToast } from "../../store/notificationSlice";

// Initialize Firebase Storage
const storage = getStorage();

// Initial form state
const initialState = {
  // Basic Event Details
  title: "",
  description: "",
  category: "",
  eventType: "Public", // Default to Public, can be changed to Private
  promoterId: "", // Could be hidden or auto-filled
  complimentaryTicket: false,
  tip: false,

  // Event Schedule
  date: "",
  eventStartTime: "",
  eventEndTime: "",

  // Venue
  venue: "",

  // Artist Lineup
  artistLineUp: [""], // Dynamic array for artists

  // Tickets Section
  ticketsAvailable: {}, // Each ticket will be an object with type, price, quantity, etc.

  // Media Uploads
  eventVideo: "",
  gallery: [],
};

// Reducer function
const formReducer = (state, action) => {
  if (action.type === "update") {
    return { ...state, [action.name]: action.value };
  }
  if (action.type === "updateNested") {
    const updatedTickets = { ...state.ticketsAvailable };
    updatedTickets[action.ticketType] = {
      ...updatedTickets[action.ticketType],
      [action.name]: action.value,
    };
    return { ...state, ticketsAvailable: updatedTickets };
  }
  if (action.type === "addTicket") {
    return {
      ...state,
      ticketsAvailable: {
        ...state.ticketsAvailable,
        [action.ticketType]: {
          price: action.ticket.price,
          quantity: action.ticket.quantity,
          ticketInfo: action.ticket.ticketInfo,
          ticketReleaseDate: action.ticket.ticketReleaseDate,
          ticketReleaseTime: action.ticket.ticketReleaseTime,
        },
      },
    };
  }
  if (action.type === "removeTicket") {
    const updatedTickets = { ...state.ticketsAvailable };
    delete updatedTickets[action.ticketType];
    return { ...state, ticketsAvailable: updatedTickets };
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

const EditEventForm: React.FC<{ event: any; closeModal: () => void }> = ({
  event,
  closeModal,
}) => {
  const dispatchRedux = useDispatch(); // Use Redux dispatch
  const [step, setStep] = useState(1);
  const [formData, dispatch] = useReducer(formReducer, initialState);
  const { profile } = useSelector((state: RootState) => state.profile);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false); // Loader state

  const localUser = (() => {
    const storedAuthUser = localStorage.getItem("authUser");
    return storedAuthUser ? JSON.parse(storedAuthUser) : null;
  })();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        // Fallback to localStorage user
        setCurrentUser(localUser || null);
      }
    });

    return () => unsubscribe();
  }, []); // Dependency array ensures this runs only once on mount

  useEffect(() => {
    // Extract UID from Firebase or localStorage
    const uid = profile?.id || currentUser?.uid || localUser?.uid;

    if (uid && formData.promoterId !== uid) {
      dispatch({
        type: "update",
        name: "promoterId",
        value: uid,
      });
    }
  }, [profile?.id, currentUser?.uid, localUser?.uid, formData.promoterId]);

  useEffect(() => {
    if (event) {
      // Function to format date to YYYY-MM-DD
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      };

      // Function to format time to HH:MM
      const formatTime = (timeString) => {
        if (!timeString) return ""; // Return an empty string if the time is invalid

        // Check if the time is in ISO 8601 format
        if (timeString.includes("T")) {
          const date = new Date(timeString);
          return date.toISOString().split("T")[1].slice(0, 5); // Format as HH:MM
        }

        // If the time is already in HH:MM format, return it as is
        return timeString;
      };

      // Dispatching updates for event fields
      dispatch({ type: "update", name: "title", value: event.title });
      dispatch({
        type: "update",
        name: "description",
        value: event.description,
      });
      dispatch({ type: "update", name: "category", value: event.category });
      dispatch({ type: "update", name: "date", value: formatDate(event.date) });
      dispatch({ type: "update", name: "venue", value: event.venue });
      dispatch({
        type: "update",
        name: "eventStartTime",
        value: formatTime(event.eventStartTime),
      });
      dispatch({
        type: "update",
        name: "eventEndTime",
        value: formatTime(event.eventEndTime),
      });
      dispatch({
        type: "update",
        name: "artistLineUp",
        value: event.artistLineUp,
      });
      dispatch({
        type: "update",
        name: "ticketsAvailable",
        value: event.ticketsAvailable,
      });
      dispatch({ type: "update", name: "gallery", value: event.gallery });
      dispatch({ type: "update", name: "eventVideo", value: event.eventVideo });

      // Format ticketReleaseDate and ticketReleaseTime
      if (event.ticketsAvailable && event.ticketsAvailable.Vip) {
        const vipTicket = event.ticketsAvailable.Vip;

        dispatch({
          type: "update",
          name: "ticketReleaseDate",
          value: formatDate(vipTicket.ticketReleaseDate),
        });
        dispatch({
          type: "update",
          name: "ticketReleaseTime",
          value: formatTime(vipTicket.ticketReleaseTime),
        });
      }
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const finalValue = type === "checkbox" ? checked : files ? files : value;
    dispatch({ type: "update", name, value: finalValue });
  };

  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files); // Convert file list to array
    const uploadedImages = [];
    setLoading(true); // Show loader during upload

    for (const file of files) {
      const storageRef = ref(storage, `eventImages/${Date.now()}_${file.name}`);

      try {
        const snapshot = await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(snapshot.ref); // Correct usage of snapshot.ref
        uploadedImages.push(imageUrl); // Save the URL to the array
      } catch (error: any) {
        console.error("Error uploading image: ", error.message); // Log error message
        dispatchRedux(
          showToast({
            message:
              "Failed to upload one or more images. Please check your permissions.",
            type: "error",
          })
        );
      }
    }

    dispatch({ type: "update", name: "gallery", value: uploadedImages });
    setLoading(false); // Hide loader after upload
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0]; // Only one video file selected
    if (!file) return;

    setLoading(true); // Show loader during upload
    const storageRef = ref(storage, `eventVideos/${Date.now()}_${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const videoUrl = await getDownloadURL(snapshot.ref); // Correct usage of snapshot.ref
      dispatch({ type: "update", name: "eventVideo", value: videoUrl });
    } catch (error: any) {
      console.error("Error uploading video: ", error.message); // Log error message
      dispatchRedux(
        showToast({
          message: "Failed to upload the video. Please check your permissions.",
          type: "error",
        })
      );
    }
    setLoading(false); // Hide loader after upload
  };

  const handleArtistChange = (index, value) => {
    dispatch({ type: "updateArray", index, value });
  };

  const handleSubmit = async () => {
    if (!event) return;
    const updatedEvent = {
      ...event,
      ...formData,
    };
    console.log("Updating event:", updatedEvent);
    // Dispatch updateEvent with correct params
    dispatchRedux(
      updateEvent(
        event?.id, // eventId
        event?.promoterId, // userId
        updatedEvent // eventData
      )
    );
    setLoading(false);
    dispatchRedux(
      showToast({
        message: "Event updated successfully!",
        type: "success",
      })
    );
    closeModal(); // Close modal after successful update
  };

  const editTicketType = (ticketType, updatedTicket) => {
    dispatch({
      type: "updateNested",
      ticketType,
      name: "price",
      value: updatedTicket.price,
    });
    dispatch({
      type: "updateNested",
      ticketType,
      name: "quantity",
      value: updatedTicket.quantity,
    });
    dispatch({
      type: "updateNested",
      ticketType,
      name: "ticketInfo",
      value: updatedTicket.ticketInfo,
    });
    dispatch({
      type: "updateNested",
      ticketType,
      name: "ticketReleaseDate",
      value: updatedTicket.ticketReleaseDate,
    });
    dispatch({
      type: "updateNested",
      ticketType,
      name: "ticketReleaseTime",
      value: updatedTicket.ticketReleaseTime,
    });
  };

  return (
    <div className="justify-center items-center z-30">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <FaSpinner className="text-teal-500 text-4xl animate-spin" />
        </div>
      )}
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
          {step === 3 && (
            <Step3 formData={formData} handleDateChange={handleChange} />
          )}
          {step === 4 && (
            <Step4
              formData={formData}
              dispatch={dispatch}
              editTicketType={editTicketType} // Pass the edit function to Step4
            />
          )}
          {step === 5 && (
            <Step5
              formData={formData}
              handleGalleryChange={handleGalleryChange}
              handleVideoChange={handleVideoChange}
            />
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
              <button
                onClick={handleSubmit}
                className="p-2 px-4 bg-teal-500 rounded-lg text-white"
              >
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
    <label className="block text-white text-lg font-semibold border-b border-gray-500 pb-3 mb-4 text-center">
      Event Details
    </label>
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
      name="venue"
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
      name="category"
      value={formData.category}
      onChange={handleChange}
      className="input-field"
      placeholder="Event Category"
    />

    <label className="block text-white">Event Type</label>
    <select
      name="eventType"
      value={formData.eventType}
      onChange={handleChange}
      className="input-field"
    >
      <option value="Public">Public</option>
      <option value="Private">Private</option>
    </select>
  </div>
);

// Step 2: Artist Lineup
const Step2 = ({ formData, handleArtistChange, dispatch }) => (
  <div className="space-y-2">
    <label className="block text-white text-lg font-semibold border-b border-gray-500 pb-3 mb-5 text-center">
      Artist Lineup
    </label>
    {formData.artistLineUp.map((artist, index) => (
      <div key={index} className="flex items-center mb-2">
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
const Step3 = ({ formData, handleDateChange }) => (
  <div className="space-y-2">
    <label className="block text-white text-lg font-semibold border-b border-gray-500 pb-3 mb-4 text-center">
      Event Date and Time
    </label>
    <label className="block text-white">Select Date</label>
    <input
      type="date"
      name="date"
      value={formData.date} // Ensure the formatted date is displayed
      onChange={handleDateChange}
      className="input-field"
    />

    <label className="block text-white">Set Start Time</label>
    <input
      type="time"
      name="eventStartTime"
      value={formData.eventStartTime} // Ensure the formatted start time is displayed
      onChange={handleDateChange}
      className="input-field"
    />

    <label className="block text-white">Set End Time</label>
    <input
      type="time"
      name="eventEndTime"
      value={formData.eventEndTime} // Ensure the formatted end time is displayed
      onChange={handleDateChange}
      className="input-field"
    />
  </div>
);

// Step 4: Tickets
const Step4 = ({ formData, dispatch, editTicketType }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTicketType, setNewTicketType] = useState("");
  const [newTicket, setNewTicket] = useState({
    price: "",
    quantity: "",
    ticketInfo: "",
    ticketReleaseDate: "",
    ticketReleaseTime: "",
  });

  const handleNewTicketChange = (field, value) => {
    setNewTicket((prev) => ({
      ...prev,
      [field]:
        field === "ticketReleaseDate"
          ? formatDate(value) // Format date if adding ticketReleaseDate
          : field === "ticketReleaseTime"
          ? formatTime(value) // Format time if adding ticketReleaseTime
          : value,
    }));
  };

  const addTicketType = () => {
    if (
      newTicketType &&
      newTicket.price &&
      newTicket.quantity &&
      newTicket.ticketInfo &&
      newTicket.ticketReleaseDate &&
      newTicket.ticketReleaseTime
    ) {
      const formattedTicket = {
        ...newTicket,
        ticketReleaseDate: formatDate(newTicket.ticketReleaseDate),
        ticketReleaseTime: formatTime(newTicket.ticketReleaseTime),
      };

      dispatch({
        type: "addTicket", // Use the correct action type
        ticketType: newTicketType, // Pass the ticket type as a key
        ticket: formattedTicket, // Pass the formatted ticket details
      });

      setNewTicketType("");
      setNewTicket({
        price: "",
        quantity: "",
        ticketInfo: "",
        ticketReleaseDate: "",
        ticketReleaseTime: "",
      });

      setIsAdding(false);
    } else {
      dispatchRedux(
        showToast({
          message: "Please fill in all required fields.",
          type: "error",
        })
      );
    }
  };

  const removeTicketType = (ticketType) => {
    dispatch({ type: "removeTicket", ticketType });
  };

  const [isEditing, setIsEditing] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState("");
  const [editedTicket, setEditedTicket] = useState({
    price: "",
    quantity: "",
    ticketInfo: "",
    ticketReleaseDate: "",
    ticketReleaseTime: "",
  });

  const handleEditTicketChange = (field, value) => {
    setEditedTicket((prev) => ({
      ...prev,
      [field]:
        field === "ticketReleaseDate"
          ? formatDate(value) // Format date if editing ticketReleaseDate
          : field === "ticketReleaseTime"
          ? formatTime(value) // Format time if editing ticketReleaseTime
          : value,
    }));
  };

  const saveEditedTicket = () => {
    if (ticketToEdit) {
      const formattedTicket = {
        ...editedTicket,
        ticketReleaseDate: formatDate(editedTicket.ticketReleaseDate),
        ticketReleaseTime: formatTime(editedTicket.ticketReleaseTime),
      };

      editTicketType(ticketToEdit, formattedTicket);
      setIsEditing(false);
      setTicketToEdit("");
      setEditedTicket({
        price: "",
        quantity: "",
        ticketInfo: "",
        ticketReleaseDate: "",
        ticketReleaseTime: "",
      });
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-white text-lg font-semibold border-b border-gray-500 pb-3 mb-4 text-center">
        Event Tickets
      </label>
      {/* Existing Tickets List */}
      {Object.keys(formData.ticketsAvailable).map((ticketType) => (
        <div
          key={ticketType}
          className="space-y-2 border-b border-gray-500 pb-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-white">Ticket Type: {ticketType}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setTicketToEdit(ticketType);
                  setEditedTicket(formData.ticketsAvailable[ticketType]);
                }}
                className="text-blue-500"
              >
                Edit
              </button>
              <button
                onClick={() => dispatch({ type: "removeTicket", ticketType })}
                className="text-red-500"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Add New Ticket Section */}
      {isAdding ? (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter Ticket Type"
            value={newTicketType}
            onChange={(e) => setNewTicketType(e.target.value)}
            className="input-field"
          />
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
            placeholder="Available"
            value={newTicket.quantity}
            onChange={(e) => handleNewTicketChange("quantity", e.target.value)}
            className="input-field"
          />
          <label className="block text-white">Ticket Information</label>
          <textarea
            placeholder="Ticket Information"
            value={newTicket.ticketInfo}
            onChange={(e) =>
              handleNewTicketChange("ticketInfo", e.target.value)
            }
            className="input-field"
          />
          <label className="block text-white">Release Date</label>
          <input
            type="date"
            value={newTicket.ticketReleaseDate}
            onChange={(e) =>
              handleNewTicketChange("ticketReleaseDate", e.target.value)
            }
            className="input-field"
          />
          <label className="block text-white">Release Time</label>
          <input
            type="time"
            value={newTicket.ticketReleaseTime}
            onChange={(e) =>
              handleNewTicketChange("ticketReleaseTime", e.target.value)
            }
            className="input-field"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsAdding(false)}
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

      {/* Edit Ticket Section */}
      {isEditing && (
        <div className="space-y-2">
          <h3 className="text-white">Editing Ticket: {ticketToEdit}</h3>
          <label className="block text-white">Ticket Price</label>
          <input
            type="number"
            placeholder="Price"
            value={editedTicket.price}
            onChange={(e) => handleEditTicketChange("price", e.target.value)}
            className="input-field"
          />
          <label className="block text-white">Tickets Available</label>
          <input
            type="number"
            placeholder="Available"
            value={editedTicket.quantity}
            onChange={(e) => handleEditTicketChange("quantity", e.target.value)}
            className="input-field"
          />
          <label className="block text-white">Ticket Information</label>
          <textarea
            placeholder="Ticket Information"
            value={editedTicket.ticketInfo}
            onChange={(e) =>
              handleEditTicketChange("ticketInfo", e.target.value)
            }
            className="input-field"
          />
          <label className="block text-white">Release Date</label>
          <input
            type="date"
            value={editedTicket.ticketReleaseDate}
            onChange={(e) =>
              handleEditTicketChange("ticketReleaseDate", e.target.value)
            }
            className="input-field"
          />
          <label className="block text-white">Release Time</label>
          <input
            type="time"
            value={editedTicket.ticketReleaseTime}
            onChange={(e) =>
              handleEditTicketChange("ticketReleaseTime", e.target.value)
            }
            className="input-field"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 px-3 text-gray-500 border border-gray-500 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={saveEditedTicket}
              className="p-1 px-3 text-green-500 border border-green-500 rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Step 4: Media Uploads
const Step5 = ({ formData, handleGalleryChange, handleVideoChange }) => (
  <div className="space-y-2">
    <label className="block text-white text-lg font-semibold border-b border-gray-500 pb-3 text-center mb-4">
      Event Gallery
    </label>
    <label className="block text-white">Event Video</label>
    <input
      type="file"
      name="eventVideo"
      onChange={handleVideoChange}
      className="input-field"
    />

    <label className="block text-white">Gallery</label>
    <input
      type="file"
      name="gallery"
      multiple
      onChange={handleGalleryChange}
      className="input-field"
    />
  </div>
);

// Step 5: Confirmation
const Step6 = ({ formData }) => (
  <div className="space-y-4">
    <label className="block text-white text-lg font-semibold border-b border-gray-500 pb-3 text-center">
      Event Summary
    </label>
    <pre className="text-white">{JSON.stringify(formData, null, 2)}</pre>
  </div>
);

export default EditEventForm;
