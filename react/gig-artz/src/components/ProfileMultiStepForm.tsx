import React, { useReducer, useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaExclamationTriangle,
  FaUser,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "../../store/profileSlice";
import { RootState, AppDispatch } from "../../store/store";
import BaseModal from "./BaseModal";

// Initial profile state based on provided object
const initialState = {
  phoneNumber: "",
  youtube: "",
  coverProfile: null,
  website: "",
  tiktok: "",
  city: "",
  rating: 0,
  twitter: "",
  acceptBookings: false,
  bio: "",
  emailAddress: "",
  linkedin: "",
  instagram: "",
  fcmToken: "",
  name: "",
  country: "",
  userName: "",
  facebook: "",
};

interface ProfileMultiStepFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: Partial<typeof initialState>;
  renderAsModal?: boolean; // New prop to control modal rendering
}

type ProfileFormAction = { type: "update"; name: string; value: unknown };

// Validation schema for each step
const validateStep = (step: number, formData: typeof initialState) => {
  const errors: Record<string, string> = {};

  switch (step) {
    case 1:
      if (!formData.name?.trim()) errors.name = "Name is required";
      if (!formData.userName?.trim()) errors.userName = "Username is required";
      if (!formData.emailAddress?.trim())
        errors.emailAddress = "Email address is required";
      break;

    case 2:
      if (!formData.phoneNumber?.trim())
        errors.phoneNumber = "Phone number is required";
      if (!formData.city?.trim()) errors.city = "City is required";
      if (!formData.country?.trim()) errors.country = "Country is required";
      break;

    // Social links (step 3) are optional, no validation required

    case 4:
      if (!formData.bio?.trim()) errors.bio = "Bio is required";
      break;

    default:
      break;
  }

  return errors;
};

function formReducer(state: typeof initialState, action: ProfileFormAction) {
  if (action.type === "update") {
    return { ...state, [action.name]: action.value };
  }
  return state;
}

const steps = [
  "Basic Info",
  "Contact & Location",
  "Social Links",
  "Other Details",
  "Confirmation",
];

const ProfileMultiStepForm: React.FC<ProfileMultiStepFormProps> = ({
  isOpen,
  onClose,
  initialValues,
  renderAsModal = true, // Default to modal behavior
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const uid = useSelector((state: RootState) => state.auth.uid);
  const [step, setStep] = useState(1);
  const [formData, dispatchForm] = useReducer(formReducer, {
    ...initialState,
    ...initialValues,
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Validate current step whenever formData changes
  useEffect(() => {
    const errors = validateStep(step, formData);
    setValidationErrors(errors);

    // Mark step as completed if no errors
    if (Object.keys(errors).length === 0) {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.add(step);
        return newSet;
      });
    } else {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(step);
        return newSet;
      });
    }
  }, [formData, step]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    dispatchForm({
      type: "update",
      name,
      value: type === "checkbox" ? checked : value,
    });
  };

  const handleNextStep = () => {
    const errors = validateStep(step, formData);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation
    const allErrors: Record<string, string> = {};
    for (let i = 1; i <= 4; i++) {
      const stepErrors = validateStep(i, formData);
      Object.assign(allErrors, stepErrors);
    }

    if (Object.keys(allErrors).length > 0) {
      // If there are errors, go to the first step with errors
      for (let i = 1; i <= 4; i++) {
        const stepErrors = validateStep(i, formData);
        if (Object.keys(stepErrors).length > 0) {
          setStep(i);
          setValidationErrors(stepErrors);
          return;
        }
      }
      return;
    }

    if (uid) {
      // Only send fields present in initialState
      const updateData = Object.fromEntries(
        Object.keys(initialState).map((key) => [
          key,
          formData[key as keyof typeof initialState],
        ])
      );
      dispatch(updateUserProfile(uid, updateData));
    }
    onClose();
  };

  // Error message component
  const ErrorMessage: React.FC<{ error?: string }> = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center text-red-400 text-sm mt-1">
        <FaExclamationTriangle className="mr-1" />
        {error}
      </div>
    );
  };

  // Step 1: Basic Info
  const Step1 = () => (
    <div className="space-y-4 rounded-lg p-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Name
        </label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          className={`input-field ${
            validationErrors.name ? "border-red-500" : ""
          }`}
        />
        <ErrorMessage error={validationErrors.name} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Username
        </label>
        <input
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          placeholder="Choose a username"
          className={`input-field ${
            validationErrors.userName ? "border-red-500" : ""
          }`}
        />
        <ErrorMessage error={validationErrors.userName} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Email Address
        </label>
        <input
          name="emailAddress"
          value={formData.emailAddress}
          onChange={handleChange}
          placeholder="Your email address"
          className={`input-field ${
            validationErrors.emailAddress ? "border-red-500" : ""
          }`}
        />
        <ErrorMessage error={validationErrors.emailAddress} />
      </div>
    </div>
  );

  // Step 2: Contact & Location
  const Step2 = () => (
    <div className="space-y-4 rounded-lg p-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Phone Number
        </label>
        <input
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Your phone number"
          className={`input-field ${
            validationErrors.phoneNumber ? "border-red-500" : ""
          }`}
        />
        <ErrorMessage error={validationErrors.phoneNumber} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          City
        </label>
        <input
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Your city"
          className={`input-field ${
            validationErrors.city ? "border-red-500" : ""
          }`}
        />
        <ErrorMessage error={validationErrors.city} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Country
        </label>
        <input
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Your country"
          className={`input-field ${
            validationErrors.country ? "border-red-500" : ""
          }`}
        />
        <ErrorMessage error={validationErrors.country} />
      </div>
    </div>
  );

  // Step 3: Social Links
  const Step3 = () => (
    <div className="space-y-4 rounded-lg p-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Facebook
        </label>
        <input
          name="facebook"
          value={formData.facebook}
          onChange={handleChange}
          placeholder="Facebook profile URL"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Instagram
        </label>
        <input
          name="instagram"
          value={formData.instagram}
          onChange={handleChange}
          placeholder="Instagram handle"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Twitter
        </label>
        <input
          name="twitter"
          value={formData.twitter}
          onChange={handleChange}
          placeholder="Twitter handle"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          TikTok
        </label>
        <input
          name="tiktok"
          value={formData.tiktok}
          onChange={handleChange}
          placeholder="TikTok handle"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          YouTube
        </label>
        <input
          name="youtube"
          value={formData.youtube}
          onChange={handleChange}
          placeholder="YouTube channel URL"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          LinkedIn
        </label>
        <input
          name="linkedin"
          value={formData.linkedin}
          onChange={handleChange}
          placeholder="LinkedIn profile URL"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Website
        </label>
        <input
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="Your personal website URL"
          className="input-field"
        />
      </div>
    </div>
  );

  // Step 4: Other Details
  const Step4 = () => (
    <div className="space-y-4 rounded-lg p-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Bio
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Write something about yourself"
          className={`input-field min-h-[120px] ${
            validationErrors.bio ? "border-red-500" : ""
          }`}
        />
        <ErrorMessage error={validationErrors.bio} />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="acceptBookings"
            checked={formData.acceptBookings}
            onChange={handleChange}
          />
          <span className="text-sm font-medium text-gray-300">
            Accept Bookings
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          FCM Token
        </label>
        <input
          name="fcmToken"
          value={formData.fcmToken}
          onChange={handleChange}
          placeholder="Firebase Cloud Messaging Token"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Rating
        </label>
        <input
          name="rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={formData.rating}
          onChange={handleChange}
          placeholder="Your rating (0-5)"
          className="input-field"
        />
      </div>
    </div>
  );

  // Step 5: Confirmation
  const Step5 = () => (
    <div className="space-y-4 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-2">Review Your Information</h3>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Name:</p>
            <p className="text-white">{formData.name}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Username:</p>
            <p className="text-white">{formData.userName}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Email:</p>
            <p className="text-white">{formData.emailAddress}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Phone:</p>
            <p className="text-white">{formData.phoneNumber}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Location:</p>
            <p className="text-white">
              {formData.city}, {formData.country}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Accept Bookings:</p>
            <p className="text-white">
              {formData.acceptBookings ? "Yes" : "No"}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-400 text-sm">Bio:</p>
          <p className="text-white">{formData.bio}</p>
        </div>

        <div className="mt-4">
          <p className="text-gray-400 text-sm">Social Links:</p>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {formData.facebook && <p className="text-white">Facebook</p>}
            {formData.instagram && <p className="text-white">Instagram</p>}
            {formData.twitter && <p className="text-white">Twitter</p>}
            {formData.tiktok && <p className="text-white">TikTok</p>}
            {formData.youtube && <p className="text-white">YouTube</p>}
            {formData.linkedin && <p className="text-white">LinkedIn</p>}
            {formData.website && <p className="text-white">Website</p>}
          </div>
        </div>
      </div>
    </div>
  );

  // Form content that can be rendered with or without modal
  const formContent = (
    <>
      <div className="flex-1 flex justify-center">
        <div className="flex items-center justify-center gap-2">
          {steps.map((stepName, i) => (
            <div
              key={i}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                // Allow clicking on completed steps or current step
                if (completedSteps.has(i + 1) || i + 1 === step) {
                  setStep(i + 1);
                }
              }}
            >
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all duration-200 ${
                  i + 1 === step
                    ? "bg-teal-500 text-white scale-110"
                    : completedSteps.has(i + 1)
                    ? "bg-teal-700 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs mt-1 hidden md:block ${
                  i + 1 === step
                    ? "text-teal-500"
                    : completedSteps.has(i + 1)
                    ? "text-teal-700"
                    : "text-gray-500"
                }`}
              >
                {stepName}
              </span>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
        {step === 5 && <Step5 />}

        <div className="flex justify-between p-4 pt-6 border-t border-gray-700">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="border bg-teal-500 border-teal-500 rounded-2xl text-white w-28 text-sm p-2 flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" /> Previous
            </button>
          )}

          {step < steps.length ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="border px-4 bg-teal-500 border-teal-500 rounded-2xl text-white w-24 text-sm p-2 flex items-center justify-center"
            >
              Next <FaArrowRight className="ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 bg-teal-500 border border-teal-500 rounded-2xl text-white w-24 text-sm p-2 flex items-center justify-center"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </>
  );

  // Conditional rendering based on renderAsModal prop
  if (!renderAsModal) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 animate-fade-in-up">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            {`Update Profile: ${steps[step - 1]}`}
          </h3>
          <p className="text-gray-400">Complete your profile details</p>
        </div>
        {formContent}
      </div>
    );
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Profile: ${steps[step - 1]}`}
      subtitle="Complete your profile details"
      icon={<FaUser className="w-5 h-5" />}
      maxWidth="md:max-w-2xl"
    >
      {formContent}
    </BaseModal>
  );
};

export default ProfileMultiStepForm;
