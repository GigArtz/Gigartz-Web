import React from "react";

function ProfileSectionUI() {
  return (
    // Placeholder UI
    <div className="animate-pulse p-5">
      <div className="w-full h-40 bg-gray-500 rounded mb-4"></div>
      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gray-500 border-4 border-gray-900 absolute top-16 left-10 sm:top-32 sm:left-8 md:top-18 md:left-16"></div>
      <div className="sm:mt-20 space-y-2">
        <div className="h-4 bg-gray-500 rounded w-1/3"></div>
        <div className="h-3 bg-gray-500 rounded w-1/4"></div>
        <div className="h-3 bg-gray-500 rounded w-1/5 mt-2"></div>
        <div className="flex gap-2 mt-4">
          <div className="h-5 w-16 bg-gray-500 rounded-full"></div>
          <div className="h-5 w-16 bg-gray-500 rounded-full"></div>
          <div className="h-5 w-16 bg-gray-500 rounded-full"></div>
          <div className="h-5 w-16 bg-gray-500 rounded-full"></div>
        </div>
         <div className="flex gap-2 mt-4">
          <div className="h-5 w-16 bg-gray-500 rounded-full"></div>
          <div className="h-5 w-16 bg-gray-500 rounded-full"></div>
        
        </div>
      </div>
    </div>
  );
}

export default ProfileSectionUI;
