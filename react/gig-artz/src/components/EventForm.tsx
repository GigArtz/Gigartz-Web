// @ts-expect-error
interface Window {
  google: any;
  mapsReady?: boolean;
}

import { RootState } from "../../store/store";
import { addEvent } from "../../store/eventsSlice";
import { showToast } from "../../store/notificationSlice";
import React, { useState, useReducer, useEffect, useRef } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCircle,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaMinus,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import VenueInput from "./VenueInput";

// Initialize Firebase Storage
const storage = getStorage();

// Initial form state
const initialState = {
  // Basic Event Details
  title: "",
  description: "",
  category: "",
  mainCategory: "",
  subCategory: "",
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

  // Media Uploads - Store file objects instead of URLs
  eventVideoFile: null,
  galleryFiles: [],
};

// Validation schema for each step
const validateStep = (step, formData) => {
  const errors = {};

  switch (step) {
    case 1:
      if (!formData.title?.trim()) errors.title = "Event name is required";
      if (!formData.venue?.trim()) errors.venue = "Event venue is required";
      if (!formData.description?.trim())
        errors.description = "Event description is required";
      if (!formData.mainCategory)
        errors.mainCategory = "Main category is required";
      if (formData.mainCategory && !formData.subCategory)
        errors.subCategory = "Subcategory is required";
      if (!formData.eventType) errors.eventType = "Event type is required";
      break;

    case 2:
      const validArtists = formData.artistLineUp?.filter((artist) =>
        artist.trim()
      );
      if (!validArtists || validArtists.length === 0) {
        errors.artistLineUp = "At least one artist is required";
      }
      break;

    case 3:
      if (!formData.date) errors.date = "Event date is required";
      if (!formData.eventStartTime)
        errors.eventStartTime = "Start time is required";
      if (!formData.eventEndTime) errors.eventEndTime = "End time is required";

      // Validate date is not in the past
      if (
        formData.date &&
        new Date(formData.date) < new Date().setHours(0, 0, 0, 0)
      ) {
        errors.date = "Event date cannot be in the past";
      }

      // Validate end time is after start time
      if (formData.eventStartTime && formData.eventEndTime) {
        if (formData.eventEndTime <= formData.eventStartTime) {
          errors.eventEndTime = "End time must be after start time";
        }
      }
      break;

    case 4:
      if (Object.keys(formData.ticketsAvailable).length === 0) {
        errors.tickets = "At least one ticket type is required";
      }
      break;

    // Step 5 (media) is optional, no validation required
    default:
      break;
  }

  return errors;
};

// Reducer function
const formReducer = (state, action) => {
  if (action.type === "update") {
    console.log("Reducer update action:", {
      name: action.name,
      value: action.value,
    }); // Debugging log
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
  if (action.type === "removeGalleryFile") {
    const updatedFiles = [...state.galleryFiles];
    updatedFiles.splice(action.index, 1);
    return { ...state, galleryFiles: updatedFiles };
  }
  return state;
};

const AddEventForm: React.FC = () => {
  const dispatchRedux = useDispatch(); // Use Redux dispatch
  const [step, setStep] = useState(1);
  const [formData, dispatch] = useReducer(formReducer, initialState);
  const [validationErrors, setValidationErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
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

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const finalValue = type === "checkbox" ? checked : files ? files : value;
    console.log("handleChange called:", { name, value: finalValue }); // Debugging log
    dispatch({ type: "update", name, value: finalValue });
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files); // Convert file list to array

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
    const file = e.target.files[0]; // Only one video file selected
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
      eventVideo: "",
      gallery: [],
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

        uploadedUrls.gallery = await Promise.all(galleryPromises);
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

    // Ensure userId and promoterId are valid
    const userId = localUser?.uid || currentUser?.uid;
    const promoterId = localUser?.uid || userId;

    if (!userId) {
      dispatchRedux(
        showToast({
          message: "User ID is missing. Please ensure you are logged in.",
          type: "error",
        })
      );
      return;
    }

    setLoading(true); // Show loader during submission

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

      // Create event object with uploaded URLs
      const eventObject = {
        userId, // Ensure userId is included
        promoterId, // Ensure promoterId is included
        title: formData.title,
        description: formData.description,
        date: formData.date,
        venue: formData.venue,
        eventVideo: uploadedUrls.eventVideo, // Firebase video URL
        eventType: formData.eventType,
        category: formData.category,
        time: formData.eventStartTime,
        ticketsAvailable, // Validated ticketsAvailable
        eventStartTime: formData.eventStartTime,
        eventEndTime: formData.eventEndTime,
        gallery: uploadedUrls.gallery, // Firebase image URLs
        artistLineUp: formData.artistLineUp.filter((artist) => artist.trim()),
      };

      console.log("Submitting eventObject:", eventObject); // Debugging log to verify ticket information

      // Dispatch to Redux or submit to your backend
      await dispatchRedux(addEvent(eventObject));

      dispatchRedux(
        showToast({
          message: "Event created successfully!",
          type: "success",
        })
      );
    } catch (error) {
      console.error("Error creating event:", error);
      dispatchRedux(
        showToast({
          message: "Failed to create event. Please try again.",
          type: "error",
        })
      );
    } finally {
      setLoading(false); // Hide loader after submission
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
                ? "Uploading files and creating event..."
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
              "Add your event information",
              "Who's performing at your event?",
              "When is your event happening?",
              "Configure your ticket types and pricing",
              "Update photos and videos to showcase your event",
              "Review your event details before submission",
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
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Error message component
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <div className="flex items-center text-red-400 text-sm mt-1">
      <FaExclamationTriangle className="mr-1" />
      {error}
    </div>
  );
};

// Step 1: Basic Event Details
const Step1 = ({ formData, handleChange, errors }) => {
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
            value={formData.venue}
            onPlaceSelected={(place) => {
              const value =
                place?.formattedAddress ||
                place?.displayName ||
                place?.name ||
                "";
              console.log("Selected place:", place); // Debugging log
              if (value) {
                handleChange({
                  target: { name: "venue", value, type: "text" },
                });
              } else {
                console.error("Invalid place object received:", place);
              }
            }}
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
          <option value="">Select Type</option>
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
          <option value="">Select Category</option>
          {Object.keys(categories).map((main) => (
            <option key={main} value={main}>
              {main}
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
            <option value="">Select Subcategory</option>
            {categories[formData.mainCategory].map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
          <ErrorMessage error={errors.subCategory} />
        </div>
      )}
    </div>
  );
};

// Step 2: Artist Lineup
const Step2 = ({ formData, handleArtistChange, dispatch, errors }) => (
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

// Step 3: Event Schedule
const Step3 = ({ formData, handleDateChange, errors }) => (
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
  const [ticketErrors, setTicketErrors] = useState({});

  const handleNewTicketChange = (field, value) => {
    setNewTicket((prev) => ({ ...prev, [field]: value }));

    // Clear specific error when user starts typing
    if (ticketErrors[field]) {
      setTicketErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateTicket = () => {
    const errors = {};

    if (!newTicketType.trim()) errors.ticketType = "Ticket type is required";
    if (!newTicket.price || newTicket.price <= 0)
      errors.price = "Valid price is required";
    if (!newTicket.quantity || newTicket.quantity <= 0)
      errors.quantity = "Valid quantity is required";
    if (!newTicket.ticketInfo.trim())
      errors.ticketInfo = "Ticket information is required";
    if (!newTicket.ticketReleaseDate)
      errors.ticketReleaseDate = "Release date is required";
    if (!newTicket.ticketReleaseTime)
      errors.ticketReleaseTime = "Release time is required";

    // Check if ticket type already exists
    if (formData.ticketsAvailable[newTicketType]) {
      errors.ticketType = "This ticket type already exists";
    }

    return errors;
  };

  const addTicketType = () => {
    const errors = validateTicket();
    setTicketErrors(errors);

    if (Object.keys(errors).length === 0) {
      dispatch({
        type: "addTicket",
        ticketType: newTicketType,
        ticket: newTicket,
      });

      setNewTicketType("");
      setNewTicket({
        price: "",
        quantity: "",
        ticketInfo: "",
        ticketReleaseDate: "",
        ticketReleaseTime: "",
      });
      setTicketErrors({});
      setIsAdding(false);
    }
  };

  const removeTicketType = (ticketType) => {
    dispatch({ type: "removeTicket", ticketType });
  };

  return (
    <div className="space-y-4 rounded-lg p-6">
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
                          R{formData.ticketsAvailable[ticketType].price} •{" "}
                          {formData.ticketsAvailable[ticketType].quantity}{" "}
                          Available
                        </p>
                        <p className="mt-2">Release Date</p>
                        <p>
                          {
                            formData.ticketsAvailable[ticketType]
                              .ticketReleaseDate
                          }{" "}
                          •{" "}
                          {
                            formData.ticketsAvailable[ticketType]
                              .ticketReleaseTime
                          }
                        </p>
                        <p className="text-gray-400 text-sm">
                          {ticket.ticketInfo}
                        </p>
                      </div>
                      <div></div>
                    </div>
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

      <ErrorMessage error={errors.tickets} />

      {/* Add New Ticket Section */}
      {isAdding ? (
        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <div>
            <input
              type="text"
              placeholder="Enter Ticket Type (e.g., General, VIP, Early Bird)"
              value={newTicketType}
              onChange={(e) => {
                setNewTicketType(e.target.value);
                if (ticketErrors.ticketType) {
                  setTicketErrors((prev) => ({ ...prev, ticketType: null }));
                }
              }}
              className={`input-field ${
                ticketErrors.ticketType ? "border-red-500" : ""
              }`}
            />
            <ErrorMessage error={ticketErrors.ticketType} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-white mb-1 text-sm">
                Ticket Price (R) *
              </label>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={newTicket.price}
                onChange={(e) => handleNewTicketChange("price", e.target.value)}
                className={`input-field ${
                  ticketErrors.price ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage error={ticketErrors.price} />
            </div>

            <div>
              <label className="block text-white mb-1 text-sm">
                Tickets Available *
              </label>
              <input
                type="number"
                placeholder="0"
                min="1"
                value={newTicket.quantity}
                onChange={(e) =>
                  handleNewTicketChange("quantity", e.target.value)
                }
                className={`input-field ${
                  ticketErrors.quantity ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage error={ticketErrors.quantity} />
            </div>
          </div>

          <div>
            <label className="block text-white mb-1 text-sm">
              Ticket Information *
            </label>
            <textarea
              placeholder="Describe what's included with this ticket"
              value={newTicket.ticketInfo}
              onChange={(e) =>
                handleNewTicketChange("ticketInfo", e.target.value)
              }
              className={`input-field ${
                ticketErrors.ticketInfo ? "border-red-500" : ""
              }`}
              rows={2}
            />
            <ErrorMessage error={ticketErrors.ticketInfo} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-white mb-1 text-sm">
                Release Date *
              </label>
              <input
                type="date"
                value={newTicket.ticketReleaseDate}
                onChange={(e) =>
                  handleNewTicketChange("ticketReleaseDate", e.target.value)
                }
                className={`input-field ${
                  ticketErrors.ticketReleaseDate ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage error={ticketErrors.ticketReleaseDate} />
            </div>

            <div>
              <label className="block text-white mb-1 text-sm">
                Release Time *
              </label>
              <input
                type="time"
                value={newTicket.ticketReleaseTime}
                onChange={(e) =>
                  handleNewTicketChange("ticketReleaseTime", e.target.value)
                }
                className={`input-field ${
                  ticketErrors.ticketReleaseTime ? "border-red-500" : ""
                }`}
              />
              <ErrorMessage error={ticketErrors.ticketReleaseTime} />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => {
                setIsAdding(false);
                setTicketErrors({});
                setNewTicketType("");
                setNewTicket({
                  price: "",
                  quantity: "",
                  ticketInfo: "",
                  ticketReleaseDate: "",
                  ticketReleaseTime: "",
                });
              }}
              className="p-2 px-4 text-gray-400 border border-gray-500 rounded-lg hover:bg-gray-600 transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={addTicketType}
              className="p-2 px-4 text-green-500 border border-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
              type="button"
            >
              Save Ticket
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-all duration-300"
          >
            + Add Ticket Type
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
  <div className="space-y-4 rounded-lg p-6">
    <div>
      <label className="block text-white mb-2">Event Video</label>
      <p className="text-gray-400 text-sm mb-2">
        Select a promotional video for your event (Max 100MB, MP4/WebM/OGG)
      </p>
      <input
        type="file"
        name="eventVideo"
        accept="video/mp4,video/webm,video/ogg"
        onChange={handleVideoChange}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:cursor-pointer hover:file:bg-teal-600 transition-all duration-300"
      />
      {formData.eventVideoFile && (
        <div className="mt-2 text-green-400 text-sm flex items-center">
          <FaCheckCircle className="mr-1" />
          Video selected: {formData.eventVideoFile.name}
        </div>
      )}
    </div>

    <div>
      <label className="block text-white mb-2">Event Gallery</label>
      <p className="text-gray-400 text-sm mb-2">
        Select images for your event gallery (Max 5MB each, JPG/PNG/WebP)
      </p>
      <input
        type="file"
        name="gallery"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleGalleryChange}
        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:cursor-pointer hover:file:bg-teal-600 transition-all duration-300"
      />
      {formData.galleryFiles && formData.galleryFiles.length > 0 && (
        <div className="mt-2">
          <div className="text-green-400 text-sm flex items-center mb-2">
            <FaCheckCircle className="mr-1" />
            {formData.galleryFiles.length} image(s) selected
          </div>
          <div className="space-y-2">
            {formData.galleryFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-700 rounded p-2"
              >
                <span className="text-white text-sm">{file.name}</span>
                <button
                  onClick={() => dispatch({ type: "removeGalleryFile", index })}
                  className="text-red-500 hover:text-red-400 transition-colors"
                  type="button"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Step 6: Confirmation
const Step6 = ({ formData }) => (
  <div className="space-y-4">
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
      {/* Event Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2">
          {formData.title || "Untitled Event"}
        </h2>
        <p className="text-gray-300 text-sm">
          {formData.description || "No description provided"}
        </p>
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Date & Time */}
        <div className="bg-gray-700 rounded-lg p-3">
          <h3 className="text-teal-400 font-semibold mb-2">Date & Time</h3>
          <p className="text-white text-sm">
            📅 {formData.date || "Date not set"}
          </p>
          <p className="text-white text-sm">
            🕐 {formData.eventStartTime || "Start time not set"} -{" "}
            {formData.eventEndTime || "End time not set"}
          </p>
        </div>

        {/* Venue */}
        <div className="bg-gray-700 rounded-lg p-3">
          <h3 className="text-teal-400 font-semibold mb-2">Venue</h3>
          <p className="text-white text-sm">
            📍 {formData.venue || "Venue not specified"}
          </p>
        </div>

        {/* Category */}
        <div className="bg-gray-700 rounded-lg p-3">
          <h3 className="text-teal-400 font-semibold mb-2">Category</h3>
          <p className="text-white text-sm">
            {formData.category ||
              formData.subCategory ||
              "No category selected"}
          </p>
          <p className="text-gray-300 text-xs">
            {formData.eventType || "Public"} Event
          </p>
        </div>

        {/* Artist Lineup */}
        <div className="bg-gray-700 rounded-lg p-3">
          <h3 className="text-teal-400 font-semibold mb-2">Artist Lineup</h3>
          {formData.artistLineUp && formData.artistLineUp.length > 0 ? (
            <div className="space-y-1">
              {formData.artistLineUp
                .filter((artist) => artist.trim())
                .map((artist, index) => (
                  <p key={index} className="text-white text-sm">
                    🎤 {artist}
                  </p>
                ))}
            </div>
          ) : (
            <p className="text-gray-300 text-sm">No artists added</p>
          )}
        </div>
      </div>

      {/* Tickets Section */}
      <div className="bg-gray-700 rounded-lg p-3 mb-4">
        <h3 className="text-teal-400 font-semibold mb-2">Tickets</h3>
        {Object.keys(formData.ticketsAvailable).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(formData.ticketsAvailable).map(
              ([ticketType, ticket]) => (
                <div key={ticketType} className="bg-gray-600 rounded p-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{ticketType}</span>
                    <span className="text-teal-400 font-semibold">
                      R{ticket.price}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs">
                    Available: {ticket.quantity}
                  </p>
                  <p className="text-gray-300 text-xs">
                    Release: {ticket.ticketReleaseDate} at{" "}
                    {ticket.ticketReleaseTime}
                  </p>
                  {ticket.ticketInfo && (
                    <p className="text-gray-300 text-xs mt-1">
                      {ticket.ticketInfo}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-gray-300 text-sm">No tickets configured</p>
        )}
      </div>

      {/* Media Section */}
      <div className="bg-gray-700 rounded-lg p-3">
        <h3 className="text-teal-400 font-semibold mb-2">Media</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white text-sm">📹 Event Video</p>
            <p className="text-gray-300 text-xs">
              {formData.eventVideoFile
                ? `✅ ${formData.eventVideoFile.name}`
                : "❌ No video selected"}
            </p>
          </div>
          <div>
            <p className="text-white text-sm">🖼️ Gallery</p>
            <p className="text-gray-300 text-xs">
              {formData.galleryFiles && formData.galleryFiles.length > 0
                ? `✅ ${formData.galleryFiles.length} image(s) selected`
                : "❌ No images selected"}
            </p>
          </div>
        </div>
      </div>

      {/* File List if available */}
      {formData.galleryFiles && formData.galleryFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-teal-400 font-semibold mb-2">Selected Images</h4>
          <div className="grid grid-cols-1 gap-2">
            {formData.galleryFiles.map((file, index) => (
              <div key={index} className="bg-gray-600 rounded p-2">
                <span className="text-white text-sm">{file.name}</span>
                <span className="text-gray-300 text-xs ml-2">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default AddEventForm;
