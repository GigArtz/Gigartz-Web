import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProfiles } from "../store/profileSlice";
import UserCard from "./UserCard";
import { AppDispatch } from "../store/store";
import { fetchAllEvents } from "../store/eventsSlice";
import SearchBar from "./SearchBar";
import { FaSpinner } from "react-icons/fa";

function ExploreTabs() {
  const dispatch: AppDispatch = useDispatch();

  // State to track active tab
  const [activeTab, setActiveTab] = useState("top");

  useEffect(() => {
    dispatch(fetchAllProfiles());
    dispatch(fetchAllEvents());
  }, [dispatch]);

  const { profile, userList, loading, error } = useSelector(
    (state: any) => state.profile
  );

  const { events } = useSelector((state) => state.events);

  const eventList = events || [];

  console.log(eventList);

  return (
    <div className="px-2">
      <div className="mt-2">
        <div className="relative rounded-lg border border-gray-700 dark:border-gray-700 bg-[#060512] dark:bg-gray-700">
          <form>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-[#060512] text-gray-900 dark:text-gray-100 focus:outline-none"
              placeholder="Search..."
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

      <div className="text-sm font-medium text-center  text-gray-500 border-b border-gray-700">
        <ul className="flex flex-wrap justify-between -mb-px">
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

      <div className="py-4">
        {loading && (
          <div className="flex mt-8 justify-center items-center">
            <FaSpinner className="text-teal-500 text-4xl animate-spin" />
          </div>
        )}

        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <>
            {activeTab === "top" && (
              <>
                <div className="flex flex-row gap-2 overflow-y-auto">
                  {/* Scrollable Row */}

                  {eventList?.length === 0 && !loading && !error && (
                    <p className="text-white text-center w-full">
                      No events found.
                    </p>
                  )}

                  {eventList?.map((event) => (
                    <div
                      key={event.id}
                      className="snap-start flex-shrink-0 w-[100%] p-1"
                    >
                      <EventCard event={event} cardSize="lg" />
                    </div>
                  ))}
                </div>

                <div className="mt-2 w-full p-2 rounded-xl">
                  <h2 className="text-xl text-white font-semibold mb-4">
                    Trending
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {userList.length > 0 ? (
                    userList.map((user) => (
                      <div className="mb-2">
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
                {userList.length > 0 ? (
                  userList.map((user) => (
                    <div className="mb-2">
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
