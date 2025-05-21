import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, switchUserProfile } from "../../store/profileSlice";
import { AppDispatch } from "../../store/store";
import MultiCheckboxDropdown from "../components/Dropdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Loader";
import ServicesForm from "../components/ServicesForm";
import { useNavigate } from "react-router-dom";

const Monetization = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [acceptTips, setAcceptTips] = useState(false);
  const [acceptBookings, setAcceptBookings] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [loading, setLoading] = useState(false); // Loader state
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [service, setService] = useState({ name: "", description: "" });
  const [services, setServices] = useState([
    {
      name: "",
      description: "",
      offeringOptions: "",
      baseFee: "",
      additionalCosts: "",
    },
  ]);

  const dispatch = useDispatch<AppDispatch>();
  const { profile, error } = useSelector((state: any) => state.profile);
  const { uid } = useSelector((state: any) => state.auth);

  // Fetch user profile when component mounts
  useEffect(() => {
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
        srv.name.trim() !== "" &&
        srv.description.trim() !== "" &&
        srv.offeringOptions.trim() !== "" &&
        srv.baseFee.trim() !== "" &&
        srv.additionalCosts.trim() !== ""
    );
    if (hasService) {
      setAcceptBookings(true);
    }
  }, [services]);

  const categories = [
    "General",
    "Musician",
    "Digital Creator",
    "Health",
    "Establishment",
  ];

  const handleSwitch = async () => {
    if (!agreedToTerms) {
      toast.error("Please accept the terms and conditions.");
      return;
    }

    setLoading(true); // Start loader

    try {
      await dispatch(
        switchUserProfile(
          uid,
          selectedCategories,
          acceptTips,
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
      await dispatch(fetchUserProfile(uid)); // Refresh profile

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
    <div className="main-content flex flex-col items-center justify-center">
      <ToastContainer position="top-left" autoClose={3000} />

      {/* Services Modal */}
      <div className=" items-center justify-center flex flex-col text-white">
        {showModal && (
          <ServicesForm
            onClose={() => setShowModal(false)}
            services={services}
            setServices={setServices}
          />
        )}
      </div>

      {loading && <Loader message="Switching Profile..." />}

      <div className=" items-center justify-center flex flex-col text-white">
        <div className="mb-6">
          <img src="/White.png" alt="Logo" className="w-20 h-20 mb-4" />
        </div>
        <h1 className="text-3xl font-bold">
          {isFreelancer ? "Are You Sure?" : "Professional Community"}
        </h1>
      </div>

      {!isFreelancer ? (
        <div className="flex flex-col items-center justify-center w-2/4 text-white p-5">
          <p className="mt-3 text-gray-300">Select Category</p>

          {/* Multi-checkbox Dropdown */}
          <MultiCheckboxDropdown
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />

          {/* Toggle Switches */}
          <div className="mt-6 w-64 space-y-3">
            <div className="flex justify-between items-center">
              <span>Accept Tips</span>
              <input
                type="checkbox"
                className="toggle cursor-pointer"
                checked={acceptTips}
                onChange={() => setAcceptTips(!acceptTips)}
              />
            </div>
            <div className="flex justify-between items-center">
              <span>Accept Bookings</span>
              <input
                type="checkbox"
                className="toggle cursor-pointer"
                checked={acceptBookings}
                onChange={() => setShowModal(true)}
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mt-4 flex items-center space-x-1">
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={agreedToTerms}
              onChange={() => setAgreedToTerms(!agreedToTerms)}
            />
            <span className="text-teal-400 cursor-pointer underline">
              Terms & Conditions
            </span>
          </div>

          {/* Switch Button with Loader */}
          <button
            className="mt-6 w-64 btn-primary transition duration-300 flex items-center justify-center"
            onClick={handleSwitch}
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></span>
            ) : (
              "Switch to Professional"
            )}
          </button>
        </div>
      ) : (
        <>
          <p className="mt-4 text-gray-300 text-center px-6">
            Are you sure you want to switch back? Your professional mode
            features will be disabled.
          </p>

          {/* Terms and Conditions */}
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={agreedToTerms}
              onChange={() => setAgreedToTerms(!agreedToTerms)}
            />
            <span className="text-teal-400 cursor-pointer underline">
              Terms & Conditions
            </span>
          </div>

          {/* Switch Button with Loader */}
          <button
            className="mt-6 w-64 btn-primary transition duration-300 flex items-center justify-center"
            onClick={handleSwitch}
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></span>
            ) : (
              "Switch to General"
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default Monetization;
