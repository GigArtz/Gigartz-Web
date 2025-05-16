import { useEffect, useState } from "react";
import EventCard from "./EventCard";
import UserCard from "./UserCard";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProfiles } from "../store/profileSlice";
import ScrollableEventRow from "./ScrollableEventRow";
import { FaSpinner } from "react-icons/fa";
import LgScrollableEventRow from "./LgScrollableEventRow";

interface EventsTabsProps {
  events: any[];
  loading: boolean;
  error: string | null;
}

const EventsTabs: React.FC<EventsTabsProps> = ({ events, loading, error }) => {
  const getFilteredEvents = () => {
    // Assuming these categories are all just displaying the same events for now
    return events;
  };

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchAllProfiles());
  }, [dispatch]);

  const { userList } = useSelector((state: RootState) => state.profile);

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <FaSpinner className="text-teal-500 text-4xl animate-spin" />
      </div>
    );

  return (
    <div className="">
      {/* Trending Events Section */}
      <div className="mt-2 w-full p-2 rounded-xl">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-xl text-white font-semibold mb-4">Trending</h2>
          <span className="text-teal-500 text-sm hover:underline">See All</span>
        </div>

        {/* Scrollable Row */}
        <LgScrollableEventRow
          events={getFilteredEvents()}
          loading={loading}
          error={error}
        />
      </div>

      {/* For You Section */}
      <div className="mt-2 w-full p-2 rounded-xl">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-xl text-white font-semibold mb-4">For You</h2>
          <span className="text-teal-500 text-sm hover:underline">See All</span>
        </div>

        {/* Scrollable Row */}
        <ScrollableEventRow
          events={getFilteredEvents()}
          loading={loading}
          error={error}
        />
      </div>

      {/* Freelancers */}
      <div className="mt-8 px-4 w-full">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-xl text-white font-semibold mb-4">Popular Freelancers</h2>
          <span className="text-teal-500 text-sm hover:underline cursor-pointer">See All</span>
        </div>
        <div className="flex flex-row w-full gap-2 overflow-auto scroll-smooth snap-x space-x-2 ">
          {userList && userList.length > 0 ? (
            userList
              .filter((user) => user.roles?.freelancer) // ✅ Filter first
              .map(
                (
                  user // ✅ Then map
                ) => (
                  <div key={user.uid} className="mb-2 w-full flex flex-row">
                    <UserCard user={user} />
                  </div>
                )
              )
          ) : (
            <p className="text-gray-400 text-center mt-4">No users found.</p>
          )}
        </div>
      </div>

      {/* Events Near You Section */}
      <div className="mt-2 w-full p-2 rounded-xl">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-xl text-white font-semibold mb-4">Events Near You</h2>
          <span className="text-teal-500 text-sm hover:underline cursor-pointer">See All</span>
        </div>

        {/* Scrollable Row */}
        <ScrollableEventRow
          events={getFilteredEvents()}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default EventsTabs;
