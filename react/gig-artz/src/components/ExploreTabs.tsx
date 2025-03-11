import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProfiles } from "../store/profileSlice";
import UserCard from "./UserCard";
import { AppDispatch } from "../store/store";
import { fetchAllEvents } from "../store/eventsSlice";
import { useParams } from "react-router-dom";

function ExploreTabs() {
  
    const { search } = useParams<{ search: string }>(); // Extract search term from URL
  const dispatch: AppDispatch = useDispatch();

  // State to track active tab
  const [activeTab, setActiveTab] = useState("top");
  const [searchQuery, setSearchQuery] = useState(search || "");

  useEffect(() => {
    setSearchQuery(search || "");
  }, [search]);

  useEffect(() => {
    dispatch(fetchAllProfiles());
    dispatch(fetchAllEvents());
  }, [dispatch]);

  const { profile, userList, loading, error } = useSelector(
    (state: any) => state.profile
  );

  const { events } = useSelector((state) => state.events);

  const eventList = events || [];

  // Filter events and users based on search query
  const filteredEvents = eventList?.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = userList?.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div>

        {/* Search Bar */}
        <div className="relative rounded-lg border  border-gray-700 bg-[#060512]">
          <form>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-[#060512] dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-0 top-0 mt-2 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l5-5m0 0l-5-5m5 5H4"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Tabs */}
      <div className="text-sm font-medium text-center border-b border-gray-700">
        <ul className="flex flex-wrap w-full justify-evenly -mb-px">
          <li className="me-2">
            <button
              onClick={() => setActiveTab("top")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "top"
                  ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              Top
            </button>
          </li>
          <li className="me-2">
            <button
              onClick={() => setActiveTab("latest")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "latest"
                  ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              Latest
            </button>
          </li>

          <li className="me-2">
            <button
              onClick={() => setActiveTab("events")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "events"
                  ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              Events
            </button>
          </li>

          <li className="me-2">
            <button
              onClick={() => setActiveTab("people")}
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "people"
                  ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
            >
              People
            </button>
          </li>
        </ul>
      </div>

      <div className="p-4">
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <>
            {activeTab === "top" && (
              <>
                <div className="flex flex-row gap-2 overflow-y-auto">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <div className="mb-2" key={event.id}>
                        <EventCard event={event} cardSize="sm" />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center mt-4">
                      No events found.
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  {filteredUsers?.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div className="mb-2" key={user.id}>
                        <UserCard user={user} />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center mt-4">
                      No users found.
                    </p>
                  )}
                </div>
              </>
            )}

            {activeTab === "people" && (
              <div className="flex flex-row gap-2 overflow-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div className="mb-2" key={user.id}>
                      <UserCard user={user} />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center mt-4">
                    No users found.
                  </p>
                )}
              </div>
            )}

            {activeTab === "events" && (
              <div className="flex flex-row gap-2 overflow-auto">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div className="mb-2" key={event.id}>
                      <EventCard event={event} cardSize="sm" />
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

export default ExploreTabs;
