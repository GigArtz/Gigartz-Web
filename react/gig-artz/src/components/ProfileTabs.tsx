import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import { useSelector } from "react-redux";

function ProfileTabs() {
  const { profile, loading, error } = useSelector((state) => state.profile);
  const [userEvents, setUserEvents] = useState([]);

  useEffect(() => {
    if (profile?.userEvents) {
      setUserEvents(profile.userEvents);
    }
  }, [profile]);

  // State to track active tab
  const [activeTab, setActiveTab] = useState("gigGuide");

  return (
    <div>
       {/* Tabs */}
       <div className="tabs">
        <ul className="flex flex-nowrap justify-between overflow-x-auto hide-scrollbar gap-x-4 -mb-px px-4">
          {[
            { key: "events", label: "Events" },
            { key: "gigGuide", label: "Gig Guide" },
            { key: "reviews", label: "Reviews" },
            { key: "likes", label: "Likes" },
          ].map(({ key, label }) => (
            <li key={key}>
              <button
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-t-lg transition-all duration-200 ${
                  activeTab === key
                    ? " border-teal-500 text-lg text-white bg-teal-900"
                    : "border-transparent hover:text-gray-400 hover:border-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
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
              <div className="snap-start flex-shrink-0 w-[100%] p-1">
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
