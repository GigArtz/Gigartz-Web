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
} from "react-icons/fa"; // Importing icons from react-icons
import avatar from "../assets/avater.png";
import { useNavigate, useLocation } from "react-router-dom";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

function Drawer() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current route
  const { user } = useSelector((state: RootState) => state.auth);

  const navItems = [
    { icon: FaHome, label: "Home", link: "/home" },
    { icon: FaSearch, label: "Explore", link: "/explore" },
    { icon: FaBell, label: "Notifications", link: "/notifications" },
    { icon: FaEnvelope, label: "Messages", link: "/messages" },
    { icon: FaUser, label: "Profile", link: "/profile" },
    { icon: FaCog, label: "Settings", link: "/settings" },
    { icon: FaWallet, label: "Wallet", link: "/wallet" },
    { icon: FaDollarSign, label: "Monetization", link: "/monetization" },
    { icon: FaUsers, label: "Guest Lists", link: "/guest-lists" },
  ];

  return (
    <div className="flex">
      {/* Responsive Sidebar */}
      <div
        id="drawer-navigation"
        className="fixed top-0 left-0 w-16 md:w-56 min-h-screen border bg-white dark:bg-[#060512] shadow-md transition-all duration-300"
      >
        {/* Profile Section */}
        <div className="flex md:flex-col hidden md:block items-center py-4 px-4">
          <img
            src={user?.photoURL || avatar}
            alt="Profile"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-900"
          />
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 hidden md:block">
            {user?.displayName || "brooke lines"}
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-2 hidden md:block">
            Description
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
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    <span className="ml-3 hidden md:block">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Drawer;
