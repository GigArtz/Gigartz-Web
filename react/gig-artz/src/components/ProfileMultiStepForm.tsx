import React, { useReducer, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile } from "../../store/profileSlice";
import { RootState, AppDispatch } from "../../store/store";

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
}

type ProfileFormAction = { type: "update"; name: string; value: any };

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
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const uid = useSelector((state: RootState) => state.auth.uid);
  const [step, setStep] = useState(1);
  const [formData, dispatchForm] = useReducer(formReducer, {
    ...initialState,
    ...initialValues,
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <form
        onSubmit={handleSubmit}
        className="p-4 max-w-lg mx-auto bg-gray-900 rounded-lg shadow-lg relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Basic Info</h2>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="input-field"
            />
            <input
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Username"
              className="input-field"
            />
            <input
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              placeholder="Email Address"
              className="input-field"
            />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Contact & Location</h2>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              className="input-field"
            />
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="input-field"
            />
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
              className="input-field"
            />
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Social Links</h2>
            <input
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="Facebook"
              className="input-field"
            />
            <input
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="Instagram"
              className="input-field"
            />
            <input
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="Twitter"
              className="input-field"
            />
            <input
              name="tiktok"
              value={formData.tiktok}
              onChange={handleChange}
              placeholder="TikTok"
              className="input-field"
            />
            <input
              name="youtube"
              value={formData.youtube}
              onChange={handleChange}
              placeholder="YouTube"
              className="input-field"
            />
            <input
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="LinkedIn"
              className="input-field"
            />
            <input
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="Website"
              className="input-field"
            />
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Other Details</h2>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Bio"
              className="input-field"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="acceptBookings"
                checked={formData.acceptBookings}
                onChange={handleChange}
              />{" "}
              Accept Bookings
            </label>
            <input
              name="fcmToken"
              value={formData.fcmToken}
              onChange={handleChange}
              placeholder="FCM Token"
              className="input-field"
            />
            <input
              name="rating"
              type="number"
              value={formData.rating}
              onChange={handleChange}
              placeholder="Rating"
              className="input-field"
            />
          </div>
        )}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Confirmation</h2>
            <pre className="bg-gray-800 text-white p-2 rounded">
              {JSON.stringify(
                Object.fromEntries(
                  Object.keys(initialState).map((key) => [
                    key,
                    formData[key as keyof typeof initialState],
                  ])
                ),
                null,
                2
              )}
            </pre>
          </div>
        )}
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="border bg-teal-500 border-teal-500 rounded-2xl text-white w-28 text-sm p-2 flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Previous
            </button>
          )}
          {step < steps.length && (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="border px-4 bg-teal-500 border-teal-500 rounded-2xl text-white w-20 text-sm p-2 flex items-center"
            >
              Next <FaArrowRight className="ml-2" />
            </button>
          )}
          {step === steps.length && (
            <button
              type="submit"
              className="px-4 btn-primary w-20 text-sm p-2  text-white"
            >
              Submit
            </button>
          )}
        </div>
        <div className="flex flex-row items-center justify-center gap-1 p-1 rounded-lg mt-2">
          {steps.map((_, i) => (
            <FaCircle
              key={i}
              className={`text-xs ${
                i + 1 === step ? "text-teal-500" : "text-gray-500"
              }`}
            />
          ))}
        </div>
      </form>
    </div>
  );
};

export default ProfileMultiStepForm;
