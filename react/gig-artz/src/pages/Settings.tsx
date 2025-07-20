import React, { useState, useEffect } from "react";
import EditProfile from "../components/EditProfile";
import PaymentDetails from "../components/PaymentDetails";
import ProfileInsights from "../components/ProfileInsights";
import Preferences from "../components/Preferences";
import PrivacySecurity from "../components/PrivacySecurity";
import {
  FaUser,
  FaCreditCard,
  FaChartBar,
  FaCog,
  FaShieldAlt,
  FaChevronRight,
  FaUserEdit,
} from "react-icons/fa";

const tabs = [
  {
    id: "Edit Profile",
    label: "Edit Profile",
    icon: FaUser,
    description: "Update your personal information",
    isLarge: true,
  },
  {
    id: "Payment Details",
    label: "Payment Details",
    icon: FaCreditCard,
    description: "Manage payment methods",
    isLarge: true,
  },
  {
    id: "Profile Insights",
    label: "Profile Insights",
    icon: FaChartBar,
    description: "View analytics and stats",
    isLarge: false,
  },
  {
    id: "Preferences",
    label: "Preferences",
    icon: FaCog,
    description: "Customize your experience",
    isLarge: true,
  },
  {
    id: "Privacy & Security",
    label: "Privacy & Security",
    icon: FaShieldAlt,
    description: "Security and privacy settings",
    isLarge: true,
  },
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Edit Profile");
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Track screen width for responsive logic
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      // Always close mobile menu when switching to desktop
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "Edit Profile":
        return <>{ <EditProfile useModal={true} />}</>;
      case "Payment Details":
        return <PaymentDetails />;
      case "Profile Insights":
        return <ProfileInsights />;
      case "Preferences":
        return <Preferences />;
      case "Privacy & Security":
        return <PrivacySecurity />;
      default:
        return null;
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    // Close the mobile menu when a tab is clicked on mobile
    if (screenWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="main-content flex h-screen bg-dark">
      {/* Sidebar (Tabs) - always rendered, hidden on mobile when tab is selected */}
      <div
        className={`md:w-[30%] w-full md:border-r border-gray-700 flex flex-col bg-dark ${
          screenWidth < 768 && activeTab ? "hidden" : ""
        }`}
      >
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <FaCog className="text-teal-400" />
            Settings
          </h2>
          <p className="text-gray-400 text-xs">
            Manage your account preferences
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border flex items-center gap-3 ${
                    isActive
                      ? "bg-teal-600 text-white border-teal-500 shadow-lg scale-[1.02]"
                      : "bg-gray-800 hover:bg-gray-700 border-transparent hover:border-gray-600 text-gray-300 hover:text-white"
                  }`}
                  onClick={() => handleTabClick(tab.id)}
                  tabIndex={0}
                  aria-selected={isActive}
                  aria-label={tab.label}
                >
                  <Icon className="w-6 h-6" />
                  <span className="flex-1 font-semibold text-sm truncate">
                    {tab.label}
                  </span>
                  {isActive && (
                    <FaChevronRight className="w-4 h-4 text-white/70" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col ${
          activeTab && screenWidth < 768 ? "" : "md:flex"
        }`}
      >
        {activeTab ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
            {/* Back button for mobile */}
            {screenWidth < 768 && (
              <button
                className="absolute left-4 top-4 px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium shadow hover:bg-gray-700 transition-all"
                onClick={() => setActiveTab(null)}
                aria-label="Back to tabs"
              >
                &larr; Back
              </button>
            )}
            <div className="w-full max-w-3xl mx-auto animate-fade-in-up animation-delay-500">
              {renderActiveComponent()}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-teal-900 rounded-full p-4 mb-6 border border-teal-500 opacity-80">
              <FaCog className="text-4xl text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Welcome to Settings
            </h3>
            <p className="text-gray-400 mb-8 max-w-md">
              Select a tab from the sidebar to view or update your settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
