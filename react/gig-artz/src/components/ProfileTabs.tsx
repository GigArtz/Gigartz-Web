import React, { useState } from "react";
import EventCard from "./EventCard";
import { useSelector } from "react-redux";

function ProfileTabs() {
  const { profile, loading, error } = useSelector((state) => state.profile);
  const userEvents = profile?.userEvents || [];
  const userReviews = profile?.userProfile?.userEvents || [];

  // State to track active tab
  const [activeTab, setActiveTab] = useState("gigGuide");

  return (
    <div>
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="me-2">
            <button
              onClick={() => setActiveTab("gigGuide")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "gigGuide"
                  ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              Gig Guide
            </button>
          </li>
          <li className="me-2">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "reviews"
                  ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              Reviews
            </button>
          </li>
        </ul>
      </div>

      <div className="p-4">
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <>
            {activeTab === "gigGuide" && (
              <div className="border flex flex-row gap-2" >
                {userEvents.length > 0 ? (
                  userEvents.map((event) => <div className="mb-2 border">
                    <EventCard key={event.id} event={event} cardSize="md" />
                  </div>)
                ) : (
                  <p className="text-gray-400 text-center mt-4">No events found.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <p className="text-gray-500 text-center mt-4">No reviews yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileTabs;
