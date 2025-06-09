import React from "react";
import ProfileInsights from "./ProfileInsights";
import Header from "../components/Header";

function Settings() {
  return (
    <div className="main-content p-2">
       <Header title='Settings' />
      <ProfileInsights />
    </div>
  );
}

export default Settings;
