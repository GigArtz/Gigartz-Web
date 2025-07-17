import { RootState } from "../../store/store";
import React, { useState, useReducer, useEffect } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCircle,
  FaTrash,
  FaSpinner,
  FaPlus,
  FaMinus,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateEvent } from "../../store/eventsSlice";
import { showToast } from "../../store/notificationSlice";

// Initialize Firebase Storage
const storage = getStorage();

// Initial form state
const initialState = {
  // Basic Event Details
  title: "",
  description: "",
  category: "",
  eventType: "Public",
  promoterId: "",
  complimentaryTicket: false,
  tip: false,

  // Event Schedule
  date: "",
  eventStartTime: "",
  eventEndTime: "",

  // Venue
  venue: "",

  // Artist Lineup
  artistLineUp: [""],

  // Tickets Section
  ticketsAvailable: {},

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

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const formatTime = (timeString) => {
  if (!timeString) return "";
  if (timeString.includes("T")) {
    const date = new Date(timeString);
    return date.toISOString().split("T")[1].slice(0, 5);
  }
  return timeString;
};

const EditEventForm: React.FC<{ event: any; closeModal: () => void }> = ({
  event,
  closeModal,
}) => {
  const dispatchRedux = useDispatch();
  const [step, setStep] = useState(1);
  const [formData, dispatch] = useReducer(formReducer, initialState);
  const { profile } = useSelector((state: RootState) => state.profile);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ticket management state
  const [isAdding, setIsAdding] = useState(false);
  const [newTicketType, setNewTicketType] = useState("");
  const [newTicket, setNewTicket] = useState({
    price: "",
    quantity: "",
    ticketInfo: "",
    ticketReleaseDate: "",
    ticketReleaseTime: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState("");
  const [editedTicket, setEditedTicket] = useState({
    price: "",
    quantity: "",
    ticketInfo: "",
    ticketReleaseDate: "",
    ticketReleaseTime: "",
  });

  // Media upload states
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);

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
        setCurrentUser(localUser || null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
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
      // Populate form with existing event data
      dispatch({ type: "update", name: "title", value: event.title || "" });
      dispatch({
        type: "update",
        name: "description",
        value: event.description || "",
      });
      dispatch({
        type: "update",
        name: "category",
        value: event.category || "",
      });
      dispatch({
        type: "update",
        name: "eventType",
        value: event.eventType || "Public",
      });
      dispatch({ type: "update", name: "date", value: formatDate(event.date) });
      dispatch({ type: "update", name: "venue", value: event.venue || "" });
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
        value: event.artistLineUp || [""],
      });
      dispatch({
        type: "update",
        name: "ticketsAvailable",
        value: event.ticketsAvailable || {},
      });
      dispatch({ type: "update", name: "gallery", value: event.gallery || [] });
      dispatch({
        type: "update",
        name: "eventVideo",
        value: event.eventVideo || "",
      });
      dispatch({
        type: "update",
        name: "complimentaryTicket",
        value: event.complimentaryTicket || false,
      });
      dispatch({ type: "update", name: "tip", value: event.tip || false });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;
    dispatch({ type: "update", name, value: finalValue });
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles((prev) => [...prev, ...files]);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
  };

  const uploadMediaFiles = async () => {
    const uploadedImages = [...formData.gallery];
    let uploadedVideo = formData.eventVideo;

    // Upload new gallery images
    for (const file of galleryFiles) {
      const storageRef = ref(storage, `eventImages/${Date.now()}_${file.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(snapshot.ref);
        uploadedImages.push(imageUrl);
      } catch (error) {
        console.error("Error uploading image: ", error.message);
        dispatchRedux(
          showToast({
            message: "Failed to upload one or more images.",
            type: "error",
          })
        );
      }
    }

    // Upload new video
    if (videoFile) {
      const storageRef = ref(
        storage,
        `eventVideos/${Date.now()}_${videoFile.name}`
      );
      try {
        const snapshot = await uploadBytes(storageRef, videoFile);
        uploadedVideo = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error("Error uploading video: ", error.message);
        dispatchRedux(
          showToast({
            message: "Failed to upload the video.",
            type: "error",
          })
        );
      }
    }

    return { uploadedImages, uploadedVideo };
  };

  const handleArtistChange = (index, value) => {
    dispatch({ type: "updateArray", index, value });
  };

  const addArtist = () => {
    dispatch({ type: "addArtist" });
  };

  const removeArtist = (index) => {
    if (formData.artistLineUp.length > 1) {
      dispatch({ type: "removeArtist", index });
    }
  };

  // Ticket management functions
  const handleNewTicketChange = (field, value) => {
    setNewTicket((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditTicketChange = (field, value) => {
    setEditedTicket((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTicketType = () => {
    if (
      newTicketType.trim() &&
      newTicket.price &&
      newTicket.quantity &&
      newTicket.ticketInfo.trim() &&
      newTicket.ticketReleaseDate &&
      newTicket.ticketReleaseTime
    ) {
      dispatch({
        type: "addTicket",
        ticketType: newTicketType.trim(),
        ticket: { ...newTicket },
      });

      // Reset form
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

  const editTicketType = (ticketType, updatedTicket) => {
    Object.keys(updatedTicket).forEach((key) => {
      dispatch({
        type: "updateNested",
        ticketType,
        name: key,
        value: updatedTicket[key],
      });
    });
  };

  const saveEditedTicket = () => {
    if (ticketToEdit) {
      editTicketType(ticketToEdit, editedTicket);
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

  const removeTicketType = (ticketType) => {
    dispatch({ type: "removeTicket", ticketType });
  };

  const handleSubmit = async () => {
    if (!event) return;

    setLoading(true);

    try {
      // Upload media files first
      const { uploadedImages, uploadedVideo } = await uploadMediaFiles();

      const updatedEvent = {
        ...event,
        ...formData,
        gallery: uploadedImages,
        eventVideo: uploadedVideo,
      };

      await dispatchRedux(
        updateEvent(event?.id, event?.promoterId, updatedEvent)
      );

      dispatchRedux(
        showToast({
          message: "Event updated successfully!",
          type: "success",
        })
      );
      closeModal();
    } catch (error) {
      dispatchRedux(
        showToast({
          message: "Failed to update event. Please try again.",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 6) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const goToStep = (stepNumber) => {
    setStep(stepNumber);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-900 rounded-lg shadow-xl">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-4">
            <FaSpinner className="text-teal-500 text-2xl animate-spin" />
            <span className="text-white">Updating event...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Edit Event</h1>
        <p className="text-gray-400">Update your event details</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="flex flex-col items-center">
              <button
                onClick={() => goToStep(num)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step >= num
                    ? "bg-teal-500 text-white shadow-lg"
                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                }`}
              >
                {num}
              </button>
              <span className="text-xs text-gray-400 mt-1">
                {num === 1 && "Details"}
                {num === 2 && "Artists"}
                {num === 3 && "Schedule"}
                {num === 4 && "Tickets"}
                {num === 5 && "Media"}
                {num === 6 && "Review"}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(step / 6) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Form Steps */}
      <div className="min-h-[400px] mb-8">
        {step === 1 && (
          <Step1 formData={formData} handleChange={handleChange} />
        )}
        {step === 2 && (
          <Step2
            formData={formData}
            handleArtistChange={handleArtistChange}
            addArtist={addArtist}
            removeArtist={removeArtist}
          />
        )}
        {step === 3 && (
          <Step3 formData={formData} handleDateChange={handleChange} />
        )}
        {step === 4 && (
          <Step4
            formData={formData}
            isAdding={isAdding}
            setIsAdding={setIsAdding}
            newTicketType={newTicketType}
            setNewTicketType={setNewTicketType}
            newTicket={newTicket}
            handleNewTicketChange={handleNewTicketChange}
            addTicketType={addTicketType}
            removeTicketType={removeTicketType}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            ticketToEdit={ticketToEdit}
            setTicketToEdit={setTicketToEdit}
            editedTicket={editedTicket}
            setEditedTicket={setEditedTicket}
            handleEditTicketChange={handleEditTicketChange}
            saveEditedTicket={saveEditedTicket}
          />
        )}
        {step === 5 && (
          <Step5
            formData={formData}
            galleryFiles={galleryFiles}
            videoFile={videoFile}
            handleGalleryChange={handleGalleryChange}
            handleVideoChange={handleVideoChange}
          />
        )}
        {step === 6 && <Step6 formData={formData} />}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            step === 1
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          <FaArrowLeft className="mr-2" />
          Previous
        </button>

        {step < 6 ? (
          <button
            onClick={nextStep}
            className="flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-all duration-300"
          >
            Next
            <FaArrowRight className="ml-2" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaSpinner className="mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Update Event
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Step 1: Basic Event Details
const Step1 = ({ formData, handleChange }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-semibold text-white mb-2">Event Details</h2>
      <p className="text-gray-400">Tell us about your event</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Event Name *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
          placeholder="Enter your event name"
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Venue *
        </label>
        <input
          type="text"
          name="venue"
          value={formData.venue}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
          placeholder="Where will your event take place?"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category *
        </label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
          placeholder="e.g., Music, Comedy, Sports"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Event Type
        </label>
        <select
          name="eventType"
          value={formData.eventType}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
        >
          <option value="Public">Public</option>
          <option value="Private">Private</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none"
          placeholder="Describe your event in detail..."
          required
        />
      </div>

      <div className="md:col-span-2">
        <div className="flex space-x-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="complimentaryTicket"
              checked={formData.complimentaryTicket}
              onChange={handleChange}
              className="w-4 h-4 text-teal-500 bg-gray-800 border-gray-600 rounded focus:ring-teal-500 focus:ring-2"
            />
            <span className="text-gray-300">Complimentary Tickets</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="tip"
              checked={formData.tip}
              onChange={handleChange}
              className="w-4 h-4 text-teal-500 bg-gray-800 border-gray-600 rounded focus:ring-teal-500 focus:ring-2"
            />
            <span className="text-gray-300">Enable Tips</span>
          </label>
        </div>
      </div>
    </div>
  </div>
);

// Step 2: Artist Lineup
const Step2 = ({ formData, handleArtistChange, addArtist, removeArtist }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-semibold text-white mb-2">Artist Lineup</h2>
      <p className="text-gray-400">Who's performing at your event?</p>
    </div>

    <div className="space-y-4">
      {formData.artistLineUp.map((artist, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={artist}
              onChange={(e) => handleArtistChange(index, e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
              placeholder={`Artist ${index + 1} name`}
            />
          </div>
          {formData.artistLineUp.length > 1 && (
            <button
              onClick={() => removeArtist(index)}
              className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
            >
              <FaMinus />
            </button>
          )}
        </div>
      ))}
    </div>

    <div className="text-center">
      <button
        onClick={addArtist}
        className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-all duration-300"
      >
        <FaPlus className="mr-2" />
        Add Artist
      </button>
    </div>
  </div>
);

// Step 3: Event Schedule
const Step3 = ({ formData, handleDateChange }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-semibold text-white mb-2">Event Schedule</h2>
      <p className="text-gray-400">When is your event happening?</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Date *
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleDateChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Start Time *
        </label>
        <input
          type="time"
          name="eventStartTime"
          value={formData.eventStartTime}
          onChange={handleDateChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          End Time *
        </label>
        <input
          type="time"
          name="eventEndTime"
          value={formData.eventEndTime}
          onChange={handleDateChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
          required
        />
      </div>
    </div>
  </div>
);

// Step 4: Tickets (keeping the existing implementation)
const Step4 = ({
  formData,
  isAdding,
  setIsAdding,
  newTicketType,
  setNewTicketType,
  newTicket,
  handleNewTicketChange,
  addTicketType,
  removeTicketType,
  isEditing,
  setIsEditing,
  ticketToEdit,
  setTicketToEdit,
  editedTicket,
  setEditedTicket,
  handleEditTicketChange,
  saveEditedTicket,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2">
          Event Tickets
        </h2>
        <p className="text-gray-400">Configure your ticket types and pricing</p>
      </div>

      {/* Existing Tickets */}
      {Object.keys(formData.ticketsAvailable).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Current Tickets</h3>
          {Object.entries(formData.ticketsAvailable).map(
            ([ticketType, ticket]) => (
              <div
                key={ticketType}
                className="bg-gray-800 border border-gray-600 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-lg">
                      {ticketType}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-300">
                      <p>Price: ${ticket.price}</p>
                      <p>Quantity: {ticket.quantity}</p>
                      <p>Release: {ticket.ticketReleaseDate}</p>
                      <p>Time: {ticket.ticketReleaseTime}</p>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      {ticket.ticketInfo}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setTicketToEdit(ticketType);
                        setEditedTicket(ticket);
                      }}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => removeTicketType(ticketType)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Add New Ticket */}
      {isAdding ? (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-white">
            Add New Ticket Type
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ticket Type Name *
            </label>
            <input
              type="text"
              placeholder="e.g., VIP, General Admission"
              value={newTicketType}
              onChange={(e) => setNewTicketType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price *
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={newTicket.price}
                onChange={(e) => handleNewTicketChange("price", e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                placeholder="0"
                value={newTicket.quantity}
                onChange={(e) =>
                  handleNewTicketChange("quantity", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ticket Information *
            </label>
            <textarea
              placeholder="Describe what's included with this ticket"
              value={newTicket.ticketInfo}
              onChange={(e) =>
                handleNewTicketChange("ticketInfo", e.target.value)
              }
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Release Date *
              </label>
              <input
                type="date"
                value={newTicket.ticketReleaseDate}
                onChange={(e) =>
                  handleNewTicketChange("ticketReleaseDate", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Release Time *
              </label>
              <input
                type="time"
                value={newTicket.ticketReleaseTime}
                onChange={(e) =>
                  handleNewTicketChange("ticketReleaseTime", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewTicketType("");
                setNewTicket({
                  price: "",
                  quantity: "",
                  ticketInfo: "",
                  ticketReleaseDate: "",
                  ticketReleaseTime: "",
                });
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-300"
            >
              <FaTimes className="mr-2 inline" />
              Cancel
            </button>
            <button
              onClick={addTicketType}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-all duration-300"
            >
              <FaSave className="mr-2 inline" />
              Save Ticket
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-all duration-300"
          >
            <FaPlus className="mr-2" />
            Add Ticket Type
          </button>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {isEditing && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-white">
            Edit Ticket: {ticketToEdit}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price *
              </label>
              <input
                type="number"
                value={editedTicket.price}
                onChange={(e) =>
                  handleEditTicketChange("price", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                value={editedTicket.quantity}
                onChange={(e) =>
                  handleEditTicketChange("quantity", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ticket Information *
            </label>
            <textarea
              value={editedTicket.ticketInfo}
              onChange={(e) =>
                handleEditTicketChange("ticketInfo", e.target.value)
              }
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Release Date *
              </label>
              <input
                type="date"
                value={editedTicket.ticketReleaseDate}
                onChange={(e) =>
                  handleEditTicketChange("ticketReleaseDate", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Release Time *
              </label>
              <input
                type="time"
                value={editedTicket.ticketReleaseTime}
                onChange={(e) =>
                  handleEditTicketChange("ticketReleaseTime", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setTicketToEdit("");
                setEditedTicket({
                  price: "",
                  quantity: "",
                  ticketInfo: "",
                  ticketReleaseDate: "",
                  ticketReleaseTime: "",
                });
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-300"
            >
              <FaTimes className="mr-2 inline" />
              Cancel
            </button>
            <button
              onClick={saveEditedTicket}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-all duration-300"
            >
              <FaSave className="mr-2 inline" />
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Step 5: Media Uploads
const Step5 = ({
  formData,
  galleryFiles,
  videoFile,
  handleGalleryChange,
  handleVideoChange,
}) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-semibold text-white mb-2">Event Media</h2>
      <p className="text-gray-400">
        Add photos and videos to showcase your event
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Event Gallery
          </label>
          <div className="relative">
            <input
              type="file"
              multiple
              onChange={handleGalleryChange}
              accept="image/*"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:cursor-pointer hover:file:bg-teal-600 transition-all duration-300"
            />
          </div>
          {(formData.gallery?.length > 0 || galleryFiles.length > 0) && (
            <div className="mt-3 text-sm text-teal-400">
              ✓ {(formData.gallery?.length || 0) + galleryFiles.length} image(s)
              selected
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Event Video
          </label>
          <div className="relative">
            <input
              type="file"
              onChange={handleVideoChange}
              accept="video/*"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:cursor-pointer hover:file:bg-teal-600 transition-all duration-300"
            />
          </div>
          {(formData.eventVideo || videoFile) && (
            <div className="mt-3 text-sm text-teal-400">✓ Video selected</div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
        <h3 className="text-white font-medium mb-3">Media Guidelines</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• Images should be high quality (at least 1080p)</li>
          <li>• Supported formats: JPG, PNG, GIF</li>
          <li>• Videos should be under 50MB</li>
          <li>• Supported video formats: MP4, MOV, AVI</li>
          <li>• Use images that represent your event well</li>
        </ul>
      </div>
    </div>
  </div>
);

// Step 6: Confirmation
const Step6 = ({ formData }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-semibold text-white mb-2">
        Review Your Event
      </h2>
      <p className="text-gray-400">
        Double-check all the details before updating
      </p>
    </div>

    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-white border-b border-gray-600 pb-2">
            Event Details
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-300">
              <span className="text-white font-medium">Title:</span>{" "}
              {formData.title}
            </p>
            <p className="text-gray-300">
              <span className="text-white font-medium">Venue:</span>{" "}
              {formData.venue}
            </p>
            <p className="text-gray-300">
              <span className="text-white font-medium">Category:</span>{" "}
              {formData.category}
            </p>
            <p className="text-gray-300">
              <span className="text-white font-medium">Type:</span>{" "}
              {formData.eventType}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium text-white border-b border-gray-600 pb-2">
            Schedule
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-300">
              <span className="text-white font-medium">Date:</span>{" "}
              {formData.date}
            </p>
            <p className="text-gray-300">
              <span className="text-white font-medium">Start:</span>{" "}
              {formData.eventStartTime}
            </p>
            <p className="text-gray-300">
              <span className="text-white font-medium">End:</span>{" "}
              {formData.eventEndTime}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white border-b border-gray-600 pb-2">
          Description
        </h3>
        <p className="text-gray-300 text-sm">{formData.description}</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white border-b border-gray-600 pb-2">
          Artists
        </h3>
        <p className="text-gray-300 text-sm">
          {formData.artistLineUp.filter((artist) => artist.trim()).join(", ") ||
            "No artists added"}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white border-b border-gray-600 pb-2">
          Tickets
        </h3>
        {Object.keys(formData.ticketsAvailable).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(formData.ticketsAvailable).map(([type, ticket]) => (
              <div key={type} className="bg-gray-700 p-3 rounded-lg">
                <p className="text-white font-medium">{type}</p>
                <p className="text-gray-300 text-sm">
                  ${ticket.price} • {ticket.quantity} available • Release:{" "}
                  {ticket.ticketReleaseDate} at {ticket.ticketReleaseTime}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300 text-sm">No tickets configured</p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white border-b border-gray-600 pb-2">
          Options
        </h3>
        <div className="flex space-x-4 text-sm">
          <span
            className={`px-3 py-1 rounded-full ${
              formData.complimentaryTicket
                ? "bg-teal-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {formData.complimentaryTicket ? "✓" : "✗"} Complimentary Tickets
          </span>
          <span
            className={`px-3 py-1 rounded-full ${
              formData.tip
                ? "bg-teal-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {formData.tip ? "✓" : "✗"} Tips Enabled
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default EditEventForm;
