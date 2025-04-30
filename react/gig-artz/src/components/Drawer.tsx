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
  FaPlus,
  FaQrcode,
  FaTicketAlt,
  FaCalendar,
  FaSignOutAlt,
  FaArrowAltCircleLeft,
  FaArrowLeft,
} from "react-icons/fa"; // Importing icons from react-icons
import avatar from "../assets/avater.png";
import { useNavigate, useLocation } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Modal from "./EventFormModal";
import { fetchUserProfile } from "../store/profileSlice"; // Import fetchDrawerUserProfile
import Loader from "./Loader";

// ...imports remain unchanged...

function Drawer() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile, loading } = useSelector((state: RootState) => state.profile);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUserProfile(user?.uid));
  }, [user, dispatch]);

  useEffect(() => {
    const persistedUser = localStorage.getItem("authUser");
    if (persistedUser) {
      dispatch(fetchUserProfile(JSON.parse(persistedUser).uid));
    }
  }, [dispatch]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    navigate("/", { replace: true });
  };

  const goBack = () => navigate(-1);

  const navItems = [
    { icon: FaHome, label: "Home", link: "/home" },
    { icon: FaUsers, label: "Guest Lists", link: "/guest-list" },
    { icon: FaWallet, label: "Wallet", link: "/wallet" },
    { icon: FaQrcode, label: "Scan Ticket", link: "/scanner" },
    { icon: FaTicketAlt, label: "Tickets", link: "/tickets" },
    { icon: FaCalendar, label: "Bookings", link: "/bookings" },
    { icon: FaSearch, label: "Explore", link: "/explore" },
    { icon: FaBell, label: "Notifications", link: "/notifications" },
    { icon: FaEnvelope, label: "Messages", link: "/messages" },
    { icon: FaDollarSign, label: "Monetization", link: "/monetization" },
    { icon: FaCog, label: "Settings", link: "/settings" },
    { icon: FaUser, label: "Profile", link: "/profile" },
    { icon: FaSignOutAlt, label: "Sign Out", action: handleLogout },
  ];

  const activeLink =
    navItems.find((item) => location.pathname.startsWith(item.link))?.link ||
    "/explore";

  return (
    <div className="relative flex">
      {/* Modal */}
      <Modal isModalOpen={isModalOpen} closeModal={closeModal} />

      {/* Top bar for mobile */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-[#060512] shadow-md z-30 p-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <FaArrowLeft className="text-white text-lg cursor-pointer" onClick={goBack} />
          <p className="text-white text-lg font-semibold capitalize">
            {location.pathname.split("/")[1] || "Explore"}
          </p>
        </div>
        <img
          src={profile?.photoURL || avatar}
          className="w-10 h-10 rounded-full border-2 border-gray-800 cursor-pointer"
          onClick={toggleDrawer}
        />
      </div>

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[65%] md:w-[20%] lg:w-[15%] bg-[#060512] shadow-md transition-transform z-40 duration-300 ease-in-out
        ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Profile */}
        <div className="p-4 border-b border-gray-700 text-center">
          <img
            src={profile?.photoURL || avatar}
            alt="Profile"
            className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full border-2 border-teal-500 cursor-pointer"
            onClick={toggleDrawer}
          />
          <p className="text-white text-lg font-semibold mt-2">
            {profile?.userName || "brooke lines"}
          </p>
          <p className="text-teal-400 text-sm">{profile?.bio || "brooke lines"}</p>
        </div>

        {/* Navigation */}
        <nav className="py-4 px-4 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <ul className="space-y-2">
            {navItems.map((item, index) => {
              const isActive = activeLink === item.link;
              return (
                <li key={index}>
                  <a
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else {
                        navigate(item.link);
                        setIsDrawerOpen(false); // Close drawer on mobile
                      }
                    }}
                    className={`flex items-center gap-3 p-2 rounded-2xl text-sm font-medium cursor-pointer transition 
                      ${isActive ? "bg-teal-700 text-white" : "text-white hover:bg-gray-700"}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Create Button */}
          <div className="flex flex-row font-medium px-2 py-1 mt-4 mb-5 justify-center">
            {/* Add Button */}
            <button
              onClick={openModal} // Open modal on click
              type="button"
              className="inline-flex items-center text-white text-lg justify-center w-full h-10 btn-primary rounded-full hover:bg-teal-600 focus:ring-4 focus:ring-teal-300 focus:outline-none"
            >
              Create
            </button>
          </div>
        </nav>
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
