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

  // Function to open the modal
  const openModal = () => setIsModalOpen(true);

  // Function to close the modal
  const closeModal = () => setIsModalOpen(false);

  // Function to toggle the drawer
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  useEffect(() => {
    dispatch(fetchUserProfile(user?.uid));
  }, [user, dispatch]);

  console.log(profile);

  const navItems = [
    { icon: FaHome, label: "Home", link: "/home" },
    { icon: FaUsers, label: "Guest Lists", link: "/guest-lists" },
    { icon: FaWallet, label: "Wallet", link: "/wallet" },
    { icon: FaSearch, label: "Explore", link: "/explore" },
    { icon: FaBell, label: "Notifications", link: "/notifications" },
    { icon: FaEnvelope, label: "Messages", link: "/messages" },
    { icon: FaDollarSign, label: "Monetization", link: "/monetization" },
    { icon: FaCog, label: "Settings", link: "/settings" },
    { icon: FaUser, label: "Profile", link: "/profile" },
  ];

  return (
    <div className="flex">
      {/* Modal */}
      <Modal isModalOpen={isModalOpen} closeModal={closeModal} />

      {/* Profile Section */}
      <div className="md:block fixed top-0  left-0 w-[55%] md:w-[20%] lg:w-[15%] h-[10%] md:h-[20%] bg-[#060512] shadow-md transition-all duration-300">
        <div className="lg:flex-col md:block justify-items-left md:justify-items-center p-2 bg-[#060512] shadow-sm md:mx-4 md:mb-1 md:border-b">
          <img
            src={profile?.photoURL || avatar}
            alt="Profile"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-900"
            onClick={toggleDrawer} // Toggle drawer on click
          />
          <p className="text-lg font-medium text-white mt-4 hidden md:block">
            {profile?.userName || "brooke lines"}
          </p>
          <p className="text-sm font-medium text-teal-400 hidden md:block">
            {profile?.bio || "brooke lines"}
          </p>
        </div>
      </div>

      {/* Responsive Sidebar */}
      <div
        id="drawer-navigation"
        className={`fixed top-20 md:top-[25%] left-0 w-[55%] z-10 md:w-[20%] lg:w-[15%] min-h-screen bg-[#060512] shadow-md transition-all duration-300 ${
          isDrawerOpen ? "block" : "hidden"
        } md:block`}
      >
        {/* Navigation Links */}
        <nav className="py-4">
          <ul className="space-y-2 font-medium px-4">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.link; // Check if current route matches

              return (
                <li key={index}>
                  <a
                    onClick={() => {
                      navigate(item.link);
                      setIsDrawerOpen(false); // Close drawer on navigation
                    }}
                    className={`flex items-center p-2 rounded-lg cursor-pointer transition ${
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
                    <span className="ml-3 md:block">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-row font-medium px-2 py-1 mb-2 mt-2 justify-center rounded-2xl">
            {/* Add Button */}
            <button
              onClick={openModal} // Open modal on click
              data-tooltip-target="tooltip-add"
              type="button"
              className="inline-flex items-center text-white text-lg justify-center w-full h-10 btn-primary rounded-full hover:bg-teal-600 group focus:ring-4 focus:ring-teal-300 focus:outline-none dark:focus:ring-teal-800"
            >
              {/* <FaPlus className="w-4 h-4 text-white" /> */}
              Create
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Drawer;
