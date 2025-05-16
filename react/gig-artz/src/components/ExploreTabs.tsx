import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProfiles } from "../store/profileSlice";
import UserCard from "./UserCard";
import { AppDispatch } from "../store/store";
import { fetchAllEvents } from "../store/eventsSlice";
import { FaSpinner } from "react-icons/fa";
import ScrollableEventRow from "./ScrollableEventRow";
import LgScrollableEventRow from "./LgScrollableEventRow";
import ScrollableEventCol from "./ScrollableEventCol";

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
      <div className="my-2">
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

      <div className="tabs">
        <ul className="flex flex-nowrap justify-between overflow-x-auto hide-scrollbar gap-x-4 -mb-px px-4">
          {[
            { key: "top", label: "Top" },
            { key: "latest", label: "Latest" },
            { key: "events", label: "Events" },
            { key: "people", label: "People" },
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
                <div className="mt-2 w-full p-2 rounded-xl">
                  {/* Scrollable Row */}
                  <LgScrollableEventRow
                    events={eventList}
                    loading={loading}
                    error={error}
                  />
                </div>

                <div className="mt-2 w-full p-2 rounded-xl">
                  <div className="flex flex-row justify-between items-center">
                    <h2 className="text-xl text-white font-semibold mb-4">
                      Trending
                    </h2>
                    <span className="text-teal-500 text-sm hover:underline cursor-pointer">
                      See All
                    </span>
                  </div>
                  <ScrollableEventRow
                    events={eventList}
                    loading={loading}
                    error={error}
                  />
                </div>

                <div className="mt-2 w-full p-2 rounded-xl">
                  <div className="flex flex-row justify-between items-center">
                    <h2 className="text-xl text-white font-semibold mb-4">
                      People
                    </h2>
                    <span className="text-teal-500 text-sm hover:underline cursor-pointer">
                      See All
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 md:grid md:grid-cols-2 overflow-auto">
                    {userList?.length > 0 ? (
                      userList?.map((user) => (
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
                </div>
              </>
            )}

            {activeTab === "people" && (
              <div className="flex flex-col gap-2 md:grid md:grid-cols-2 overflow-auto">
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

            {activeTab === "events" && (
              <div className="mt-2 w-full p-2 rounded-xl">
                <ScrollableEventCol
                  events={eventList}
                  loading={loading}
                  error={error}
                />
              </div>
            )}

            {activeTab === "latest" && (
              <div className="mt-2 w-full p-2 rounded-xl">
                <ScrollableEventCol
                  events={eventList}
                  loading={loading}
                  error={error}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ExploreTabs;
