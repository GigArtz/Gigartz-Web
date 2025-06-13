import {
  FaUser,
  FaCog,
  FaWallet,
  FaDollarSign,
  FaUsers,
  FaHome,
  FaSearch,
  FaBell,
  FaEnvelope,
  FaQrcode,
  FaTicketAlt,
  FaCalendar,
  FaSignOutAlt,
  FaArrowLeft,
  FaEllipsisH,
  FaTimesCircle,
  FaPlus,
} from "react-icons/fa";
import avatar from "../assets/avater.png";
import { useNavigate, useLocation } from "react-router-dom";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Modal from "./EventFormModal";
import { fetchUserProfile } from "../../store/profileSlice";
import CommentForm from "./CommentForm";
import Loader from "./Loader";

function Drawer() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile, loading } = useSelector((state: RootState) => state.profile);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCommentOpen, setIsCommentModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isMoreExpanded, setIsMoreExpanded] = useState(false);

  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [userReview, setUserReview] = useState();

  // Add this handler:
  const handleAddOption = (option: string) => {
    setIsAddDropdownOpen(false);
    if (option === "event") {
      openModal(); // existing event modal
    } else if (option === "review") {
      setIsCommentModalOpen(true);
    }
  };

  // Fetch user profile on mount or user change
  useEffect(() => {
    if (user?.uid) dispatch(fetchUserProfile(user.uid));
  }, [user, dispatch]);

  // Fallback for persisted user
  useEffect(() => {
    if (!user) {
      const persistedUser = localStorage.getItem("authUser");
      if (persistedUser) {
        dispatch(fetchUserProfile(JSON.parse(persistedUser).uid));
      }
    }
  }, [user, dispatch]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((open) => !open);

  const handleLogout = () => {
    dispatch({ type: "auth/logout" }); // Clear auth state
    dispatch({ type: "profile/logout" }); // Clear profile state
    localStorage.removeItem("authUser");
    navigate("/", { replace: true });
  };

  const goBack = () => navigate(-1);

  type NavItem = {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
    link?: string;
    action?: () => void;
  };

  const navItems: NavItem[] = [
    { icon: FaHome, label: "Home", link: "/home" },
    { icon: FaUser, label: "Profile", link: "/profile" },
    { icon: FaUsers, label: "Guest Lists", link: "/guest-list" },
    { icon: FaWallet, label: "Wallet", link: "/wallet" },
    { icon: FaSearch, label: "Explore", link: "/explore" },
    { icon: FaBell, label: "Notifications", link: "/notifications" },
    { icon: FaEnvelope, label: "Messages", link: "/messages" },
  ];

  const moreNavItems: NavItem[] = [
    { icon: FaDollarSign, label: "Monetization", link: "/monetization" },
    { icon: FaTicketAlt, label: "Tickets", link: "/tickets" },
    { icon: FaQrcode, label: "Scan Ticket", link: "/scanner" },
    { icon: FaCalendar, label: "Bookings", link: "/bookings" },
    { icon: FaCog, label: "Settings", link: "/settings" },
    { icon: FaSignOutAlt, label: "Sign Out", action: handleLogout },
  ];

  const activeLink =
    [...(navItems || []), ...(moreNavItems || [])].find((item) =>
      location.pathname.startsWith(item.link || "")
    )?.link || "/explore";

  // Handler for navigation item click
  const handleNavClick = (item: NavItem) => {
    if (item.action) {
      item.action();
    } else if (item.link) {
      navigate(item.link);
      setIsDrawerOpen(false);
    }
  };

  const handleUsernameClick = () => {
    navigate(`/profile`);
    setIsDrawerOpen(false);
  };

  function handleCommentSubmit(review: string, rating: number) {
    // Placeholder: You can dispatch an action or call an API here
    // For now, just log the review and rating
    console.log("Submitted review:", review, "Rating:", rating);
    // Optionally, show a toast or notification to the user
    // Example: toast.success("Review submitted!");
  }

  return (
    <div className="relative flex">
      {/* Modal */}
      <Modal isModalOpen={isModalOpen} closeModal={closeModal} />

      {/* Review Modals */}
      {isModalCommentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          {/* Modal Container */}
          <div className="bg-dark rounded-lg shadow-xl p-6 w-full max-w-xl relative animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-end justify-end p-2 md:p-5 rounded-t">
              {/* Close Button */}
              <button
                onClick={() => setIsCommentModalOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
              >
                <FaTimesCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Review Form */}
            <CommentForm
              buttonText="Submit"
              loading={loading}
              onSubmit={(review, rating) => {
                handleCommentSubmit(review, rating);
                setIsCommentModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Top bar for mobile */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-[#060512] shadow-md z-30 p-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <FaArrowLeft
            className="text-white text-lg cursor-pointer"
            onClick={goBack}
          />
          <p className="text-white text-lg font-semibold capitalize">
            {location.pathname.split("/")[1] || "Explore"}
          </p>
        </div>
        <img
          src={profile?.profilePicUrl || avatar}
          className="w-10 h-10 rounded-full border-2 border-gray-800 cursor-pointer"
          onClick={toggleDrawer}
        />
      </div>

      {/* Drawer */}
      <div
        className={`fixed top-0  md:left-[2%] xl:left-[2%] h-full w-[65%] md:w-[20%] lg:w-[15%] bg-[#060512] shadow-md transition-transform z-40 overflow-auto duration-300 ease-in-out
        ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Profile */}
        {loading ? (
          <div className="p-4 border-b border-gray-700 text-center animate-pulse">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-gray-700 mb-2" />
            <div className="h-5 w-24 mx-auto bg-gray-700 rounded mb-1" />
            <div className="h-4 w-32 mx-auto bg-gray-800 rounded" />
          </div>
        ) : (
          <div className="p-4 pl-8 border-b border-gray-700 text-center">
            <img
              src={profile?.profilePicUrl || avatar}
              alt="Profile"
              className="w-14 h-14 md:w-20 md:h-20 min-w-14 min-h-14 max-w-20 max-h-20 rounded-full border-2 mx-auto border-teal-500 object-cover cursor-pointer"
              onClick={toggleDrawer}
            />
            <p
              className="text-white text-lg font-semibold mt-2 hover:underline cursor-pointer"
              onClick={() => handleUsernameClick()}
            >
              {profile?.userName || "brooke lines"}
            </p>
            <p className="text-teal-400 text-sm">
              {profile?.bio || "brooke lines"}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="py-4 px-4 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {loading ? (
            <ul className="space-y-2 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <li key={i}>
                  <div className="flex items-center gap-3 p-2 rounded-2xl">
                    <div className="w-5 h-5 bg-gray-700 rounded" />
                    <div className="h-4 w-20 bg-gray-700 rounded" />
                  </div>
                </li>
              ))}
              <div className="pt-4 mt-2">
                <div className="w-full h-10 bg-gray-700 rounded-2xl" />
              </div>
            </ul>
          ) : (
            <>
              <ul className="space-y-2">
                {navItems.map((item, index) => {
                  const isActive = activeLink === item.link;
                  return (
                    <li key={index}>
                      <a
                        onClick={() => handleNavClick(item)}
                        className={`flex items-center gap-3 p-2 rounded-2xl text-sm font-medium cursor-pointer transition 
                          ${
                            isActive
                              ? "bg-teal-700 text-white"
                              : "text-white hover:bg-gray-700"
                          }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>

              {/* More Options Button */}
              <div className="border-gray-700 pt-4">
                <button
                  className="w-full flex items-center px-2 py-2 rounded-2xl text-sm font-semibold text-white bg-dark hover:bg-gray-700 transition mb-2"
                  onClick={() => setIsMoreExpanded((open) => !open)}
                  type="button"
                >
                  <FaEllipsisH className="w-5 h-5 me-3" />
                  <span className="text-white hover:bg-gray-700">More</span>
                </button>
                {isMoreExpanded && (
                  <ul className="space-y-2">
                    {moreNavItems.map((item, index) => {
                      const isActive = activeLink === item.link;
                      return (
                        <li key={index}>
                          <a
                            onClick={() => handleNavClick(item)}
                            className={`flex items-center gap-3 p-2 rounded-2xl text-sm font-medium cursor-pointer transition 
                          ${
                            isActive
                              ? "bg-teal-700 text-white"
                              : "text-white hover:bg-gray-700"
                          }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Create Button */}
        {!loading && (
          <div
            className="flex flex-row font-medium px-2 py-1 mt-4 justify-center relative"
            hidden={loading}
          >
            <button
              onClick={() => setIsAddDropdownOpen((open) => !open)}
              type="button"
              className="inline-flex items-center text-white text-lg pb-4 gap-1 justify-center w-full h-10 btn-primary rounded-full hover:bg-teal-600  focus:outline-none"
            >
              <FaPlus className="w-4 h-4 mt-1" /> Post
            </button>

            <div
              className="bg-dark ml-2 text-center rounded-xl shadow-lg z-50 animate-fade-in"
              hidden={!isAddDropdownOpen}
            >
              <button
                className="inline-flex items-center text-white text-lg justify-center w-28 h-10 btn-primary rounded-full mb-2"
                onClick={() => handleAddOption("event")}
              >
                Gig
              </button>
              <button
                className="inline-flex items-center text-white text-lg justify-center w-28 h-10 btn-primary rounded-full"
                onClick={() => handleAddOption("review")}
              >
                Review
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleDrawer}
        />
      )}
    </div>
  );
}

export default Drawer;
