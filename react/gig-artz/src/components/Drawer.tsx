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

function Drawer() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile, loading } = useSelector((state: RootState) => state.profile);
  const { notifications } = useSelector(
    (state: RootState) => state.notification
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCommentOpen, setIsCommentModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isMoreExpanded, setIsMoreExpanded] = useState(false);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);

  // Auto-hide Create dropdown on outside click
  useEffect(() => {
    if (!isAddDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const dropdown = document.getElementById("create-dropdown");
      const button = document.getElementById("create-btn");
      if (
        dropdown &&
        !dropdown.contains(e.target as Node) &&
        button &&
        !button.contains(e.target as Node)
      ) {
        setIsAddDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isAddDropdownOpen]);

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Add this handler:
  const handleAddOption = (option: string) => {
    setIsAddDropdownOpen(false);
    if (option === "event") {
      openModal(); // existing event modal
    } else if (option === "review") {
      setIsCommentModalOpen(true);
    }
  };

  // Combined user profile fetch logic with improved caching
  useEffect(() => {
    let userId = user?.uid;

    // If no active user, try to get from local storage
    if (!userId && !loading) {
      const persistedUser = localStorage.getItem("authUser");
      if (persistedUser) {
        try {
          const parsedUser = JSON.parse(persistedUser);
          userId = parsedUser.uid;
        } catch (error) {
          console.error("Failed to parse persisted user:", error);
        }
      }
    }

    // Only fetch if we have a userId and either:
    // 1. We don't have a profile yet, or
    // 2. The profile we have doesn't match the current user
    if (userId && (!profile || profile.id !== userId) && !loading) {
      dispatch(fetchUserProfile(userId));
    }
  }, [user?.uid, dispatch, loading, profile]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((open) => !open);

  const handleLogout = async () => {
    dispatch({ type: "auth/logout" }); // Clear auth state
    dispatch({ type: "profile/logout" }); // Clear profile state
    localStorage.removeItem("authUser");

    // Add notification for logout using the new simple API
    const { notify } = await import("../helpers/notify");
    notify("You have been logged out successfully.", "info");

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

  // Responsive Drawer: improved overlay, transitions, and accessibility
  return (
    <div className="relative flex">
      {/* Modal */}
      <Modal isModalOpen={isModalOpen} closeModal={closeModal} />

      {/* Review Modal */}
      {isModalCommentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-dark rounded-2xl shadow-2xl p-6 w-full max-w-xl relative animate-fade-in border border-gray-800">
            <button
              onClick={() => setIsCommentModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
              aria-label="Close review modal"
            >
              <FaTimesCircle className="w-6 h-6" />
            </button>
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-32 bg-gray-700 rounded mb-4"></div>
                <div className="h-24 bg-gray-700 rounded mb-4"></div>
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-gray-700"
                    ></div>
                  ))}
                </div>
                <div className="h-10 w-full bg-gray-700 rounded-full"></div>
              </div>
            ) : (
              <CommentForm
                buttonText="Submit"
                loading={loading}
                onSubmit={(review, rating) => {
                  handleCommentSubmit(review, rating);
                  setIsCommentModalOpen(false);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Top bar for mobile */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-[#060512] shadow-lg z-40 p-3 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-4">
          <FaArrowLeft
            className="text-white text-xl cursor-pointer hover:text-teal-400 transition"
            onClick={goBack}
            aria-label="Go back"
          />
          {loading ? (
            <div className="h-6 w-20 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <span className="text-white text-lg font-semibold capitalize truncate max-w-[120px]">
              {location.pathname.split("/")[1]
                ? location.pathname.split("/")[1]
                : ""}
            </span>
          )}
        </div>
        {loading ? (
          <div className="w-10 h-10 rounded-full border-2 border-gray-800 bg-gray-700 animate-pulse"></div>
        ) : (
          <img
            src={profile?.profilePicUrl || avatar}
            className="w-10 h-10 rounded-full border-2 border-gray-800 cursor-pointer object-cover hover:scale-105 transition"
            onClick={toggleDrawer}
            alt="Open drawer"
            onError={(e) => {
              e.currentTarget.src = avatar;
            }}
          />
        )}
      </div>

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-[80vw] max-w-xs md:w-[20vw] md:max-w-xs lg:w-[15vw] bg-[#060512] shadow-2xl transition-transform z-50 overflow-y-auto duration-300 ease-in-out
        ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 border-r border-gray-800`}
        aria-label="Sidebar navigation"
      >
        {/* Profile */}
        {loading ? (
          <div className="p-6 border-b border-gray-700 text-center animate-pulse">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-gray-700 mb-2" />
            <div className="h-5 w-24 mx-auto bg-gray-700 rounded mb-1" />
            <div className="h-4 w-32 mx-auto bg-gray-800 rounded" />
          </div>
        ) : (
          <div className="p-6 border-b border-gray-700 text-center">
            <img
              src={profile?.profilePicUrl || avatar}
              alt="Profile"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 mx-auto border-teal-500 object-cover cursor-pointer hover:scale-105 transition"
              onClick={toggleDrawer}
              onError={(e) => {
                e.currentTarget.src = avatar;
              }}
            />
            <p
              className="text-white text-lg font-semibold mt-2 hover:underline cursor-pointer truncate"
              onClick={handleUsernameClick}
              title={profile?.userName || ""}
            >
              {profile?.userName || ""}
            </p>
            {profile?.bio && (
              <p className="text-teal-400 text-sm truncate" title={profile.bio}>
                {profile.bio}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="py-4 px-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
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
              <ul className="space-y-1">
                {navItems.map((item, index) => {
                  const isActive = activeLink === item.link;
                  const showNotificationBadge =
                    item.label === "Notifications" && unreadCount > 0;

                  return (
                    <li key={index}>
                      <a
                        onClick={() => handleNavClick(item)}
                        className={`relative flex items-center gap-3 p-2 rounded-xl text-base font-medium cursor-pointer transition
                          ${
                            isActive
                              ? "bg-teal-700 text-white shadow"
                              : "text-white hover:bg-gray-800 hover:text-teal-300"
                          }`}
                        tabIndex={0}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <div className="relative">
                          <item.icon className="w-5 h-5" />
                          {showNotificationBadge && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-red-500 to-red-400 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-gray-800 animate-pulse shadow-lg">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </div>
                          )}
                        </div>
                        <span className="flex-1">{item.label}</span>
                        {showNotificationBadge && (
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>

              {/* More Options Button */}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <button
                  className="w-full flex items-center px-2 py-2 rounded-xl text-base font-semibold text-white bg-dark hover:bg-gray-800 transition mb-2"
                  onClick={() => setIsMoreExpanded((open) => !open)}
                  type="button"
                  aria-expanded={isMoreExpanded}
                >
                  <FaEllipsisH className="w-5 h-5 me-3" />
                  <span className="text-white">More</span>
                </button>
                {isMoreExpanded && (
                  <ul className="space-y-1">
                    {moreNavItems.map((item, index) => {
                      const isActive = activeLink === item.link;
                      return (
                        <li key={index}>
                          <a
                            onClick={() => handleNavClick(item)}
                            className={`flex items-center gap-3 p-2 rounded-xl text-base font-medium cursor-pointer transition
                              ${
                                isActive
                                  ? "bg-teal-700 text-white shadow"
                                  : "text-white hover:bg-gray-800 hover:text-teal-300"
                              }`}
                            tabIndex={0}
                            aria-current={isActive ? "page" : undefined}
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
        {loading ? (
          <div className="flex flex-row font-medium px-2 py-2 mt-4 justify-center relative">
            <div className="w-full h-11 rounded-full bg-gray-700 animate-pulse"></div>
          </div>
        ) : (
          <div className="flex flex-row font-medium px-2 py-2 mt-4 justify-center relative">
            <button
              id="create-btn"
              onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
              type="button"
              className={`inline-flex items-center text-white text-lg gap-1 justify-center w-48 h-11 btn-primary-sm rounded-full shadow-lg transition-all duration-200 focus:outline-none ${
                isAddDropdownOpen
                  ? "ring-2 ring-teal-400 scale-105 transform transition-transform"
                  : "hover:bg-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              }`}
              aria-haspopup="true"
              aria-expanded={isAddDropdownOpen}
              aria-controls="create-dropdown"
              aria-label="Create post button"
            >
              <FaPlus className="w-4 h-4 mt-1" /> Post
            </button>

            {/* Dropdown: only visible when isAddDropdownOpen */}
            {isAddDropdownOpen && (
              <div
                id="create-dropdown"
                className="absolute left-1/2 -translate-x-1/2 -top-14 text-center rounded-xl shadow-2xl z-50 transition-all duration-200 animate-fade-in"
                style={{
                  minWidth: "8rem",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                }}
                role="menu"
                aria-label="Create options"
              >
                <button
                  className="inline-flex items-center justify-center w-32 h-10 text-white text-base font-semibold btn-primary rounded-full mb-2 hover:bg-teal-700 focus:bg-teal-800 focus:outline-none transition-all duration-150 shadow-md"
                  onClick={() => handleAddOption("event")}
                  role="menuitem"
                  tabIndex={0}
                >
                  Gig
                </button>
                <button
                  className="inline-flex items-center justify-center w-32 h-10 text-white text-base font-semibold btn-primary rounded-full hover:bg-teal-700 focus:bg-teal-800 focus:outline-none transition-all duration-150 shadow-md"
                  onClick={() => handleAddOption("review")}
                  role="menuitem"
                  tabIndex={0}
                >
                  Review
                </button>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Overlay for mobile drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300"
          onClick={toggleDrawer}
          aria-label="Close sidebar overlay"
        />
      )}
    </div>
  );
}

export default Drawer;
