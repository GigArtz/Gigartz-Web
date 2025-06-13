import React, { useState } from "react";
import EditProfile from "../components/EditProfile";
import PaymentDetails from "../components/PaymentDetails";
import ProfileInsights from "../components/ProfileInsights";
import Preferences from "../components/Preferences";
import PrivacySecurity from "../components/PrivacySecurity";

const tabs = [
  "Edit Profile",
  "Payment Details",
  "Profile Insights",
  "Preferences",
  "Privacy & Security",
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Edit Profile");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "Edit Profile":
        return <EditProfile />;
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
    <div className="main-content flex h-screen">
      <div className="md:w-[30%] w-full md:border-r border-gray-700 p-4">
        <h2 className="text-xl font-semibold text-white-800 mb-4">Settings</h2>
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li
              key={tab}
              className={`cursor-pointer p-2 rounded-lg transition ${
                activeTab === tab
                  ? "bg-teal-500 text-white"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 p-1 overflow-y-auto">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default Settings;
