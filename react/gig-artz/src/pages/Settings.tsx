import React, { useState } from "react";
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

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "Edit Profile":
        return (
          <>
           
            {isEditProfileModalOpen && <EditProfile useModal={true} />}
          </>
        );
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

  return (
    <div className="main-content flex h-screen animate-fade-in-up">
      {/* Sidebar - Made more compact */}
      <div className="md:w-64 w-full md:border-r border-gray-700/50 p-4  animate-slide-in-left">
        <div className="mb-6 animate-bounce-in">
          <h2 className="text-xl font-bold text-white mb-2 animate-slide-in-left">
            Settings
          </h2>
          <p className="text-gray-400 text-xs animate-fade-in animation-delay-200">
            Manage your account preferences
          </p>
        </div>

        {/* Navigation - More compact */}
        <nav className="space-y-2 animate-fade-in-up animation-delay-300">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <div
                key={tab.id}
                className={`group cursor-pointer p-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] animate-slide-in-up ${
                  isActive
                    ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-500/25 border border-teal-400/30"
                    : "bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-700/30 hover:border-gray-600/50"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-700 text-gray-400 group-hover:bg-gray-600 group-hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-sm transition-colors duration-300 ${
                        isActive
                          ? "text-white"
                          : "text-gray-300 group-hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </h3>
                  </div>

                  <FaChevronRight
                    className={`w-2.5 h-2.5 transition-all duration-300 ${
                      isActive
                        ? "text-white/70 transform rotate-90"
                        : "text-gray-500 group-hover:text-gray-400 group-hover:translate-x-0.5"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom section - More compact */}
        <div className="mt-6 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 animate-fade-in animation-delay-1000">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full flex items-center justify-center">
              <FaUser className="w-2.5 h-2.5 text-white" />
            </div>
            <div>
              <p className="text-xs text-white font-medium">Settings Hub</p>
              <p className="text-[10px] text-gray-400">Customize everything</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Much larger now */}
      <div className="flex-1 p-8 overflow-y-auto  animate-slide-in-right">
        <div className="max-w-5xl mx-auto">
          <div className="animate-fade-in-up animation-delay-500">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
