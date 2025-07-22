import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, switchUserProfile } from "../../store/profileSlice";
import { AppDispatch } from "../../store/store";
import MultiCheckboxDropdown from "../components/Dropdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Loader";
import ServicesForm from "../components/ServicesForm";
import BaseModal from "../components/BaseModal";
import { useNavigate } from "react-router-dom";
import { categories } from "../constants/Categories";

const Monetization = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [acceptTips, setAcceptTips] = useState(false);
  const [acceptBookings, setAcceptBookings] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [loading, setLoading] = useState(false); // Loader state
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [services, setServices] = useState([]);

  const dispatch = useDispatch<AppDispatch>();
  const { profile, error } = useSelector((state: any) => state.profile);
  const { uid } = useSelector((state: any) => state.auth);

  // Fetch user profile when component mounts - use cache by default
  useEffect(() => {
    // fetchUserProfile now uses cache by default, only fetches if cache is invalid
    dispatch(fetchUserProfile(uid));
  }, [uid, dispatch]);

  // Update `isFreelancer` state based on Redux profile
  useEffect(() => {
    setIsFreelancer(profile?.roles?.freelancer || false);
  }, [profile]);

  // Auto-check Accept Bookings if there are services added
  useEffect(() => {
    // Check if at least one service has all required fields
    const hasService = services.some(
      (srv) =>
        srv &&
        typeof srv.name === "string" &&
        srv.name.trim() !== "" &&
        typeof srv.description === "string" &&
        srv.description.trim() !== "" &&
        typeof srv.baseFee === "string" &&
        srv.baseFee.trim() !== "" &&
        typeof srv.additionalCosts === "string" &&
        srv.additionalCosts.trim() !== ""
    );
    setAcceptBookings(hasService);

    console.log(services);
  }, [services]);

  const handleSwitch = async () => {
    if (!agreedToTerms) {
      toast.error("Please accept the terms and conditions.");
      return;
    }

    setLoading(true); // Start loader

    console.log("Switching profile with data:", {
      uid,
      acceptBookings,
      acceptTips, // log acceptTips for debugging
    });

    try {
      await dispatch(
        switchUserProfile(
          uid,
          selectedCategories,
          acceptTips, // use current state value
          acceptBookings,
          services
        )
      );

      if (error) {
        toast.error("Error switching profile. Try again.");
        return;
      }

      toast.success("Switched successfully!");
      setIsFreelancer((prev) => !prev); // Update UI instantly
      await dispatch(fetchUserProfile(uid, true)); // Force refresh profile after update

      // Clear inputs
      setSelectedCategories([]);
      setAcceptTips(false);
      setAcceptBookings(false);
      setAgreedToTerms(false);

      // nagivate to profile page
      navigate("/profile");
    } catch (error) {
      toast.error("Error switching profile. Try again.");
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <div className="main-content min-h-screen flex flex-col items-center justify-center py-10 px-2">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Services Modal */}

      {/* Services Modal using BaseModal */}
      <BaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Manage Services"
        maxWidth="max-w-lg"
      >
        <ServicesForm
          onClose={() => setShowModal(false)}
          services={services}
          setServices={setServices}
        />
      </BaseModal>

      {/* Loader Modal using BaseModal */}
      <BaseModal
        isOpen={loading}
        onClose={() => {}}
        showCloseButton={false}
        maxWidth="max-w-xs"
        minWidth="min-w-0"
      >
        <Loader message="Switching Profile..." />
      </BaseModal>

      <div className="flex flex-col items-center text-white w-full max-w-lg bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 rounded-3xl shadow-2xl p-8 mb-8 border border-gray-800">
        <img
          src="/White.png"
          alt="Logo"
          className="w-20 h-20 mb-4 drop-shadow-lg"
        />
        <h1 className="text-3xl font-extrabold mb-2 tracking-tight text-teal-300">
          {isFreelancer ? "Are You Sure?" : "Professional Community"}
        </h1>
        <p className="text-gray-400 text-center mb-4">
          {isFreelancer
            ? "Switching back will disable your professional features."
            : "Join the professional community to unlock bookings, tips, and more!"}
        </p>

        {!isFreelancer ? (
          <div className="flex flex-col items-center w-full">
            <div className="w-full mb-4">
              <label className="block mb-1 text-sm font-semibold text-teal-300 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7h18M3 12h18M3 17h18"
                  />
                </svg>
                Select Categories
              </label>
              <div className="rounded-xl border border-teal-700 bg-gray-950/80 shadow-inner hover:shadow-lg transition-all">
                <MultiCheckboxDropdown
                  categories={categories}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                />
              </div>
              {selectedCategories.length === 0 && (
                <p className="text-xs text-red-400 mt-1">
                  Please select at least one category.
                </p>
              )}
            </div>

            {/* Toggle Switches */}
            <div className="mt-2 w-full space-y-3">
              <div className="flex justify-between items-center bg-gray-800 rounded-xl px-4 py-2 hover:bg-gray-700 transition">
                <span className="text-gray-200">Accept Tips</span>
                <input
                  type="checkbox"
                  className="toggle cursor-pointer accent-teal-400"
                  checked={acceptTips}
                  onChange={() => setAcceptTips(!acceptTips)}
                  aria-label="Accept Tips"
                />
              </div>
              <div className="flex justify-between items-center bg-gray-800 rounded-xl px-4 py-2 hover:bg-gray-700 transition">
                <span className="text-gray-200">Accept Bookings</span>
                <input
                  type="checkbox"
                  className="toggle cursor-pointer accent-teal-400"
                  checked={acceptBookings}
                  onChange={() => setShowModal(true)}
                  aria-label="Accept Bookings"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mt-6 flex items-center space-x-2 w-full">
              <input
                type="checkbox"
                className="cursor-pointer accent-teal-400"
                checked={agreedToTerms}
                onChange={() => setAgreedToTerms(!agreedToTerms)}
                id="terms"
              />
              <label
                htmlFor="terms"
                className="text-teal-400 cursor-pointer underline text-sm"
              >
                I agree to the{" "}
                <span className="font-semibold">Terms & Conditions</span>
              </label>
            </div>

            {/* Switch Button with Loader */}
            <button
              className="mt-8 w-full py-3 btn-primary transition flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2"
              onClick={handleSwitch}
              disabled={loading || !agreedToTerms}
            >
              {loading ? (
                <span className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></span>
              ) : (
                "Switch to Professional"
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-col items-center w-full">
              {/* Terms and Conditions */}
              <div className="flex items-center space-x-2 w-full justify-center">
                <input
                  type="checkbox"
                  className="cursor-pointer accent-teal-400"
                  checked={agreedToTerms}
                  onChange={() => setAgreedToTerms(!agreedToTerms)}
                  id="terms-back"
                />
                <label
                  htmlFor="terms-back"
                  className="text-teal-400 cursor-pointer underline text-sm"
                >
                  I agree to the{" "}
                  <span className="font-semibold">Terms & Conditions</span>
                </label>
              </div>

              {/* Switch Button with Loader */}
              <button
                className="mt-8 w-full py-3 btn-primary transition flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2"
                onClick={handleSwitch}
                disabled={loading || !agreedToTerms}
              >
                {loading ? (
                  <span className="animate-spin h-6 w-6 border-4 border-teal-300 border-t-transparent rounded-full"></span>
                ) : (
                  "Switch to General"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Monetization;
