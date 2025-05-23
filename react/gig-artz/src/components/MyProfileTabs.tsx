import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaSpinner } from "react-icons/fa";
import ScrollableEventCol from "./ScrollableEventCol";

function MyProfileTabs({ uid }) {
  const { profile, userList, userEvents, userTickets, likedEvents, loading, error } =
    useSelector((state) => state.profile);
  const { events } = useSelector((state) => state.events);

  const [userGigGuide, setUserGigGuide] = useState([]);
  const [activeTab, setActiveTab] = useState("events");


  useEffect(() => {
    if (profile) {
      console.log("Profile found:", profile);

      const events =
        Array.from(
          new Set(
            (userTickets || userEvents || [])
              .map((ticket) => {
                const matchedEvent = (events || []).find(
                  (event) => event.title === ticket.eventName
                );
                return matchedEvent;
              })
              .filter(Boolean)
          )
        );
      setUserGigGuide(events);
    } else {
      console.log("No profile found, clearing gig guide.");
      setUserGigGuide([]);
    }
  }, [profile, userTickets, events]);

  return (
    <div>
      {/* Tabs */}
      <div className="tabs">
        <ul className="flex flex-nowrap justify-around overflow-x-auto hide-scrollbar gap-x-4 -mb-px px-4">
          {[
            { key: "events", label: "Events" },
            { key: "reviews", label: "Reviews" },
          ].map(({ key, label }) => (
            <li key={key}>
              <button
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-t-lg text-nowrap transition-all duration-200 ${
                  activeTab === key
                    ? "border-teal-500 text-lg text-white bg-teal-900"
                    : "border-transparent hover:text-gray-400 hover:border-gray-400"
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
            <FaSpinner className="text-teal-500 text-4xl animate-spin" />
          </div>
        )}

        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <>

            {activeTab === "events" && (
              <div className="snap-start flex-shrink-0 w-[100%] p-1">
                {/* Scrollable Col */}
                <ScrollableEventCol
                  events={userGigGuide}
                  loading={loading}
                  error={error}
                />
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

export default MyProfileTabs;
