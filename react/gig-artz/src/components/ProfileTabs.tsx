import React, { useState } from "react";
import EventCard from "./EventCard";
import { useSelector } from "react-redux";
import Loader from "./Loader";

function ProfileTabs({ uid }) {
  const { loading, error } = useSelector((state) => state.profile);

  const events = useSelector((state) => state.events);

  console.log(events);

  const userEvents = events?.events.filter((event) => event.promoterId === uid);

  // State to track active tab
  const [activeTab, setActiveTab] = useState("gigGuide");

  return (
    <div>
      <div className="text-sm font-medium text-center border-b text-gray-400 border-gray-700">
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
        {/* Spinner */}

        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin h-7 w-7 border-4 border-teal-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <>
            {activeTab === "gigGuide" && (
              <div className="flex flex-row gap-2">
                {userEvents.length > 0 ? (
                  userEvents.map((event) => (
                    <div className="mb-2">
                      <EventCard key={event.id} event={event} cardSize="md" />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center mt-4">
                    No events found.
                  </p>
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
