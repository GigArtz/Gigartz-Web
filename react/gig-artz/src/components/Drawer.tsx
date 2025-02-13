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
} from "react-icons/fa"; // Importing icons from react-icons
import avatar from "../assets/avater.png";
import { useNavigate, useLocation } from "react-router-dom";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useState } from "react";
import Modal from "./EventFormModal";

function Drawer() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current route
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state) => state.profile);

  const [isModalOpen, setIsModalOpen] = useState(false);
  // Function to open the modal
  const openModal = () => setIsModalOpen(true);

  // Function to close the modal
  const closeModal = () => setIsModalOpen(false);

  const navItems = [
    { icon: FaHome, label: "Home", link: "/home" },
    { icon: FaSearch, label: "Explore", link: "/explore" },
    { icon: FaBell, label: "Notifications", link: "/notifications" },
    { icon: FaEnvelope, label: "Messages", link: "/messages" },
    { icon: FaUser, label: "Profile", link: "/profile" },
    { icon: FaCog, label: "Settings", link: "/settings" },
    { icon: FaWallet, label: "Wallet", link: "/wallet" },
    { icon: FaDollarSign, label: "Monetization", link: "/monetization" },
   // { icon: FaUsers, label: "Guest Lists", link: "/guest-lists" },
  ];

  return (
    <div className="flex">
      {/* Modal */}
      <Modal isModalOpen={isModalOpen} closeModal={closeModal} />

      {/* Responsive Sidebar */}
      <div
        id="drawer-navigation"
        className="fixed top-0 left-0 lg:w-56 min-h-screen bg-white dark:bg-[#060512] shadow-md transition-all duration-300"
      >
        {/* Profile Section */}
        <div className="lg:flex-col hidden md:block items-center py-4 px-4">
          <img
            src={profile?.userProfile?.photoURL || avatar}
            alt="Profile"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-900"
          />
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 hidden md:block">
            {profile?.userProfile?.name || "brooke lines"}
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-2 hidden md:block">
            @{profile?.userProfile?.userName || "brooke lines"}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="py-4">
          <ul className="space-y-2 font-medium px-4">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.link; // Check if current route matches

              return (
                <li key={index}>
                  <a
                    onClick={() => navigate(item.link)}
                    className={`flex items-center p-2 rounded-lg cursor-pointer transition ${
                      isActive
                        ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    <span className="ml-3 hidden md:block">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-row  gap-3 font-medium ml-4 px-2 py-1 mb-2 justify-center rounded-2xl">
            {/* Add Button */}
            <button
              onClick={openModal} // Open modal on click
              data-tooltip-target="tooltip-add"
              type="button"
              className="inline-flex items-center text-white text-lg justify-center w-full h-10 btn-primary rounded-full hover:bg-teal-600 group focus:ring-4 focus:ring-teal-300 focus:outline-none dark:focus:ring-teal-800"
            >
              {/* <FaPlus className="w-4 h-4 text-white" /> */}
              Post
            </button>
          
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Drawer;
