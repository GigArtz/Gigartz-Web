import { RootState } from "../../store/store";
import React, { useState, useReducer, useEffect } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
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
  galleryFiles: [],
  eventVideoFile: null,
};

// Validation function
const validateStep = (step, formData) => {
  const errors = {};

  switch (step) {
    case 1:
      if (!formData.title?.trim()) errors.title = "Event name is required";
      if (!formData.venue?.trim()) errors.venue = "Venue is required";
      if (!formData.description?.trim())
        errors.description = "Description is required";
      if (!formData.category?.trim()) errors.category = "Category is required";
      break;
    case 2:
      if (!formData.artistLineUp?.some((artist) => artist?.trim())) {
        errors.artistLineUp = "At least one artist is required";
      }
      break;
    case 3:
      if (!formData.date) errors.date = "Event date is required";
      if (!formData.eventStartTime)
        errors.eventStartTime = "Start time is required";
      if (!formData.eventEndTime) errors.eventEndTime = "End time is required";
      break;
    case 4:
      // Tickets are optional, no validation needed
      break;
  }

  return errors;
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
  const [validationErrors, setValidationErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const { profile } = useSelector((state: RootState) => state.profile);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Validate current step whenever formData changes
  useEffect(() => {
    const errors = validateStep(step, formData);
    setValidationErrors(errors);

    // Mark step as completed if no errors
    if (Object.keys(errors).length === 0) {
      setCompletedSteps((prev) => new Set([...prev, step]));
    } else {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(step);
        return newSet;
      });
    }
  }, [formData, step]);

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
    const { name, value, type, checked, files } = e.target;
    const finalValue = type === "checkbox" ? checked : files ? files : value;
    dispatch({ type: "update", name, value: finalValue });
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file types and sizes
    const validFiles = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        dispatchRedux(
          showToast({
            message: `${file.name} is not a valid image format. Please use JPG, PNG, or WebP.`,
            type: "error",
          })
        );
        continue;
      }

      if (file.size > maxSize) {
        dispatchRedux(
          showToast({
            message: `${file.name} is too large. Please use images under 5MB.`,
            type: "error",
          })
        );
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Store files for later upload during submission
    const existingFiles = formData.galleryFiles || [];
    dispatch({
      type: "update",
      name: "galleryFiles",
      value: [...existingFiles, ...validFiles],
    });

    if (validFiles.length > 0) {
      dispatchRedux(
        showToast({
          message: `Selected ${validFiles.length} image(s) for upload`,
          type: "success",
        })
      );
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate video file
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];

    if (!allowedTypes.includes(file.type)) {
      dispatchRedux(
        showToast({
          message: "Please upload a valid video format (MP4, WebM, or OGG).",
          type: "error",
        })
      );
      return;
    }

    if (file.size > maxSize) {
      dispatchRedux(
        showToast({
          message: "Video file is too large. Please use videos under 100MB.",
          type: "error",
        })
      );
      return;
    }

    // Store file for later upload during submission
    dispatch({ type: "update", name: "eventVideoFile", value: file });

    dispatchRedux(
      showToast({
        message: "Video selected for upload",
        type: "success",
      })
    );
  };

  const handleArtistChange = (index, value) => {
    dispatch({ type: "updateArray", index, value });
  };

  const handleNextStep = () => {
    const errors = validateStep(step, formData);

    if (Object.keys(errors).length > 0) {
      dispatchRedux(
        showToast({
          message: "Please fix the validation errors before proceeding.",
          type: "error",
        })
      );
      return;
    }

    setStep((prev) => prev + 1);
  };

  // Upload files to Firebase Storage
  const uploadFiles = async () => {
    const uploadedUrls = {
      eventVideo: formData.eventVideo || "",
      gallery: [...(formData.gallery || [])],
    };

    setLoading(true);

    try {
      // Upload video if exists
      if (formData.eventVideoFile) {
        const videoRef = ref(
          storage,
          `eventVideos/${Date.now()}_${formData.eventVideoFile.name}`
        );
        const videoSnapshot = await uploadBytes(
          videoRef,
          formData.eventVideoFile
        );
        uploadedUrls.eventVideo = await getDownloadURL(videoSnapshot.ref);
      }

      // Upload gallery images if exist
      if (formData.galleryFiles && formData.galleryFiles.length > 0) {
        const galleryPromises = formData.galleryFiles.map(
          async (file, index) => {
            const imageRef = ref(
              storage,
              `eventImages/${Date.now()}_${index}_${file.name}`
            );
            const imageSnapshot = await uploadBytes(imageRef, file);
            return await getDownloadURL(imageSnapshot.ref);
          }
        );

        const newImages = await Promise.all(galleryPromises);
        uploadedUrls.gallery = [...uploadedUrls.gallery, ...newImages];
      }

      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading files:", error);
      throw new Error("Failed to upload media files");
    }
  };

  const handleSubmit = async () => {
    // Final validation
    const allErrors = {};
    for (let i = 1; i <= 4; i++) {
      const stepErrors = validateStep(i, formData);
      Object.assign(allErrors, stepErrors);
    }

    if (Object.keys(allErrors).length > 0) {
      dispatchRedux(
        showToast({
          message: "Please complete all required fields before submitting.",
          type: "error",
        })
      );
      return;
    }

    if (!event) return;

    setLoading(true);

    try {
      // Upload media files first
      const uploadedUrls = await uploadFiles();

      // Validate ticketsAvailable
      const ticketsAvailable = Object.keys(formData.ticketsAvailable).reduce(
        (acc, ticketType) => {
          const ticket = formData.ticketsAvailable[ticketType];
          if (
            ticket.price &&
            ticket.quantity &&
            ticket.ticketInfo &&
            ticket.ticketReleaseDate &&
            ticket.ticketReleaseTime
          ) {
            acc[ticketType] = {
              price: ticket.price,
              quantity: ticket.quantity,
              ticketInfo: ticket.ticketInfo,
              ticketReleaseDate: ticket.ticketReleaseDate,
              ticketReleaseTime: ticket.ticketReleaseTime,
            };
          }
          return acc;
        },
        {}
      );

      const updatedEvent = {
        ...event,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        venue: formData.venue,
        eventVideo: uploadedUrls.eventVideo,
        eventType: formData.eventType,
        category: formData.category,
        time: formData.eventStartTime,
        ticketsAvailable,
        eventStartTime: formData.eventStartTime,
        eventEndTime: formData.eventEndTime,
        gallery: uploadedUrls.gallery,
        artistLineUp: formData.artistLineUp.filter((artist) => artist.trim()),
        complimentaryTicket: formData.complimentaryTicket,
        tip: formData.tip,
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
      console.error("Error updating event:", error);
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

  return (
    <div className="justify-center items-center z-30">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
            <FaSpinner className="text-teal-500 text-4xl animate-spin mb-4" />
            <p className="text-white text-lg">
              {step === 6
                ? "Uploading files and updating event..."
                : "Processing..."}
            </p>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2">
          {
            [
              "Event Details",
              "Artist Lineup",
              "Event Schedule",
              "Event Tickets",
              "Event Media",
              "Review Your Event",
            ][step - 1]
          }
        </h2>
        <p className="text-gray-400">
          {
            [
              "Update your event information",
              "Who's performing at your event?",
              "When is your event happening?",
              "Update your ticket types and pricing",
              "Update photos and videos to showcase your event",
              "Review your event details",
            ][step - 1]
          }
        </p>
      </div>

      <div className="flex-row p-2 space-y-2 md:p-4 md:space-y-6">
        {/* Progress Header */}
        <div className="rounded-lg p-4 mb-4 ">
          <div className="flex items-center justify-between">
            {Array.from({ length: 6 }, (_, i) => i + 1).map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    stepNumber === step
                      ? "bg-teal-500 text-white"
                      : completedSteps.has(stepNumber)
                      ? "bg-green-500 text-white"
                      : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {completedSteps.has(stepNumber) && stepNumber !== step ? (
                    <FaCheckCircle className="text-sm" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 6 && (
                  <div
                    className={`h-1 w-14 hidden md:block ${
                      completedSteps.has(stepNumber)
                        ? "bg-green-500"
                        : "bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Details</span>
            <span>Artists</span>
            <span>Schedule</span>
            <span>Tickets</span>
            <span>Media</span>
            <span>Review</span>
          </div>
        </div>

        <div className="rounded-lg">
          {step === 1 && (
            <Step1
              formData={formData}
              handleChange={handleChange}
              errors={validationErrors}
            />
          )}
          {step === 2 && (
            <Step2
              formData={formData}
              handleArtistChange={handleArtistChange}
              dispatch={dispatch}
              errors={validationErrors}
            />
          )}
          {step === 3 && (
            <Step3
              formData={formData}
              handleDateChange={handleChange}
              errors={validationErrors}
            />
          )}
          {step === 4 && (
            <Step4
              formData={formData}
              dispatch={dispatch}
              errors={validationErrors}
            />
          )}
          {step === 5 && (
            <Step5
              formData={formData}
              handleGalleryChange={handleGalleryChange}
              handleVideoChange={handleVideoChange}
              dispatch={dispatch}
            />
          )}
          {step === 6 && <Step6 formData={formData} />}
        </div>

        <div className="flex justify-between ">
          {step > 1 && (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="border bg-teal-500 border-teal-500 rounded-2xl text-white w-28 text-sm p-2 flex items-center hover:bg-teal-600 transition-colors"
            >
              <FaArrowLeft className="mr-2" /> Previous
            </button>
          )}

          {step < 6 && (
            <button
              onClick={handleNextStep}
              disabled={Object.keys(validationErrors).length > 0}
              className={`border px-4 rounded-2xl text-white w-20 text-sm p-2 flex items-center transition-colors ${
                Object.keys(validationErrors).length > 0
                  ? "bg-gray-500 border-gray-500 cursor-not-allowed"
                  : "bg-teal-500 border-teal-500 hover:bg-teal-600"
              }`}
            >
              Next <FaArrowRight className="ml-2" />
            </button>
          )}

          {step === 6 && (
            <button
              onClick={handleSubmit}
              className="px-4 btn-primary w-20 text-sm p-2 text-white hover:bg-teal-600 transition-colors"
            >
              Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Step 1: Basic Event Details
const Step1 = ({ formData, handleChange, errors }) => (
  <div className="space-y-6">
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
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ${
            errors.title ? "border-red-500" : "border-gray-600"
          }`}
          placeholder="Enter your event name"
          required
        />
        {errors.title && (
          <p className="text-red-400 text-sm mt-1">{errors.title}</p>
        )}
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
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ${
            errors.venue ? "border-red-500" : "border-gray-600"
          }`}
          placeholder="Where will your event take place?"
          required
        />
        {errors.venue && (
          <p className="text-red-400 text-sm mt-1">{errors.venue}</p>
        )}
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
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ${
            errors.category ? "border-red-500" : "border-gray-600"
          }`}
          placeholder="e.g., Music, Comedy, Sports"
          required
        />
        {errors.category && (
          <p className="text-red-400 text-sm mt-1">{errors.category}</p>
        )}
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
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none ${
            errors.description ? "border-red-500" : "border-gray-600"
          }`}
          placeholder="Describe your event in detail..."
          required
        />
        {errors.description && (
          <p className="text-red-400 text-sm mt-1">{errors.description}</p>
        )}
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
const Step2 = ({ formData, handleArtistChange, dispatch, errors }) => (
  <div className="space-y-6">
    <div className="space-y-4">
      {formData.artistLineUp.map((artist, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={artist}
              onChange={(e) => handleArtistChange(index, e.target.value)}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ${
                errors.artistLineUp ? "border-red-500" : "border-gray-600"
              }`}
              placeholder={`Artist ${index + 1} name`}
            />
          </div>
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
      {errors.artistLineUp && (
        <p className="text-red-400 text-sm mt-1">{errors.artistLineUp}</p>
      )}
    </div>

    <div className="text-center">
      <button
        onClick={() => dispatch({ type: "addArtist" })}
        className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-all duration-300"
      >
        <FaPlus className="mr-2" />
        Add Artist
      </button>
    </div>
  </div>
);

// Step 3: Event Schedule
const Step3 = ({ formData, handleDateChange, errors }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Date *
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleDateChange}
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ${
            errors.date ? "border-red-500" : "border-gray-600"
          }`}
          required
        />
        {errors.date && (
          <p className="text-red-400 text-sm mt-1">{errors.date}</p>
        )}
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
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ${
            errors.eventStartTime ? "border-red-500" : "border-gray-600"
          }`}
          required
        />
        {errors.eventStartTime && (
          <p className="text-red-400 text-sm mt-1">{errors.eventStartTime}</p>
        )}
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
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ${
            errors.eventEndTime ? "border-red-500" : "border-gray-600"
          }`}
          required
        />
        {errors.eventEndTime && (
          <p className="text-red-400 text-sm mt-1">{errors.eventEndTime}</p>
        )}
      </div>
    </div>
  </div>
);

// Step 4: Tickets
const Step4 = ({ formData, dispatch, errors }) => {
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
    }
  };

  const removeTicketType = (ticketType) => {
    dispatch({ type: "removeTicket", ticketType });
  };

  return (
    <div className="space-y-6">
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
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-300">
                      <div>
                        <p>
                          R{ticket.price} • {ticket.quantity} Available
                        </p>
                        <p className="mt-2">Release Date</p>
                        <p>
                          {ticket.ticketReleaseDate} •{" "}
                          {ticket.ticketReleaseTime}
                        </p>
                      </div>
                      <div></div>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      {ticket.ticketInfo}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
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
    </div>
  );
};

// Step 5: Media Uploads
const Step5 = ({
  formData,
  handleGalleryChange,
  handleVideoChange,
  dispatch,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Event Gallery
          </label>
          <p className="text-gray-400 text-sm mb-2">
            Select images for your event gallery (Max 5MB each, JPG/PNG/WebP)
          </p>
          <div className="relative">
            <input
              type="file"
              multiple
              onChange={handleGalleryChange}
              accept="image/*"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:cursor-pointer hover:file:bg-teal-600 transition-all duration-300"
            />
          </div>
          {(formData.gallery?.length || 0) +
            (formData.galleryFiles?.length || 0) >
            0 && (
            <div className="mt-3 text-sm text-teal-400">
              ✓{" "}
              {(formData.gallery?.length || 0) +
                (formData.galleryFiles?.length || 0)}{" "}
              image(s) selected
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Event Video
          </label>
          <p className="text-gray-400 text-sm mb-2">
            Select a promotional video for your event (Max 100MB, MP4/WebM/OGG)
          </p>
          <div className="relative">
            <input
              type="file"
              onChange={handleVideoChange}
              accept="video/*"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:cursor-pointer hover:file:bg-teal-600 transition-all duration-300"
            />
          </div>
          {(formData.eventVideo || formData.eventVideoFile) && (
            <div className="mt-3 text-sm text-teal-400">✓ Video selected</div>
          )}
        </div>
      </div>

    </div>
  </div>
);

// Step 6: Confirmation
const Step6 = ({ formData }) => (
  <div className="space-y-6">
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
