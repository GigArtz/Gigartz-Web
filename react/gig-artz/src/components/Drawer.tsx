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
} from "react-icons/fa"; // Importing icons from react-icons
import avatar from "../assets/avater.png";
import { useNavigate, useLocation } from "react-router-dom";
import { AppDispatch, RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Modal from "./EventFormModal";
import { fetchUserProfile } from "../store/profileSlice"; // Import fetchDrawerUserProfile

function Drawer() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current route
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state) => state.profile);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State to control drawer visibility

  useEffect(() => {
    dispatch(fetchUserProfile(user?.uid));
  }, [user, dispatch]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const navItems = [
    { icon: FaHome, label: "Home", link: "/home" },
    { icon: FaUsers, label: "Guest Lists", link: "/guest-lists" },
    { icon: FaWallet, label: "Wallet", link: "/wallet" },
    { icon: FaQrcode, label: "Scan Ticket", link: "/scan" },
    { icon: FaTicketAlt, label: "Tickets", link: "/tickets" },
    { icon: FaCalendar, label: "Bookings", link: "/bookings" },
    { icon: FaSearch, label: "Explore", link: "/explore" },
    { icon: FaBell, label: "Notifications", link: "/notifications" },
    { icon: FaEnvelope, label: "Messages", link: "/messages" },
    { icon: FaDollarSign, label: "Monetization", link: "/monetization" },
    { icon: FaCog, label: "Settings", link: "/settings" },
    { icon: FaUser, label: "Profile", link: "/profile" },
    { icon: FaSignOutAlt, label: "Sign Out", link: "/sign-out" },
  ];

  return (
    <div className="flex">
      {/* Modal */}
      <Modal isModalOpen={isModalOpen} closeModal={closeModal} />

      {/* Profile Section */}
      <div className="md:hidden fixed z-10 top-0 left-0 w-full md:w-[20%] lg:w-[15%] shadow-md transition-all duration-300">
        <div className="p-2 px-2 bg-[#060512] shadow-sm">
          <img
            src={profile?.photoURL || avatar}
            alt="Profile"
            className="w-12 h-12 md:w-20 md:h-20 rounded-full border-4 border-gray-900 cursor-pointer"
            onClick={toggleDrawer} // Toggle drawer on click
          />
          <p>Location</p>
        </div>
      </div>

      {/* Responsive Sidebar */}
      <div
        id="drawer-navigation"
        className={`fixed top-20 md:top-[25%] lg:top-[20%] left-0 w-[65%] md:w-[20%] lg:w-[15%] min-h-screen z-10 bg-[#060512] shadow-md transition-all duration-300 ${
          isDrawerOpen ? "block" : "hidden"
        } md:block`}
      >
        {/* Profile Section */}
        <div className="fixed items-center top-0 px-3 left-0 w-[65%] md:w-[20%] lg:w-[15%] h-[10%] md:h-[20%] bg-[#060512] shadow-md">
          <div className="md:block border-b md:border-b-0 md:justify-items-center p-2">
            <img
              src={profile?.photoURL || avatar}
              alt="Profile"
              className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 border-teal-500 cursor-pointer"
              onClick={toggleDrawer} // Toggle drawer on click
            />
            <p className="text-lg font-medium text-white mt-4">
              {profile?.userName || "brooke lines"}
            </p>
            <p className="text-sm font-medium text-teal-400">
              {profile?.bio || "brooke lines"}
            </p>
          </div>
        </div>

        <hr className="mx-3 hidden md:block"/>

        {/* Navigation Links */}
        <nav className="py-4 mt-14 md:mt-1 overflow-y-auto max-h-[75vh] scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
          <ul className="space-y-2 font-medium lg:pt-3 px-4">
            {navItems.map((item, index) => {
              const isActive = location.pathname.includes(item.link); // Check if current route matches

              return (
                <li key={index}>
                  <a
                    onClick={() => {
                      navigate(item.link);
                      setIsDrawerOpen(false); // Close drawer on navigation
                    }}
                    className={`flex items-center p-2 rounded-2xl text-sm cursor-pointer transition ${
                      isActive
                        ? "bg-gray-800 text-teal-400 font-semibold"
                        : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive ? "text-teal-400" : "text-white-400"
                      }`}
                    />
                    <span className="ml-3">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-row font-medium px-2 py-1 mt-4 justify-center">
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
    </div>
  );
}

export default Drawer;
