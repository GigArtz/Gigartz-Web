import { useEffect, useState } from "react";
import EventCard from "./EventCard";
import UserCard from "./UserCard";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProfiles } from "../store/profileSlice";

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
      <div className="flex mt-8 justify-center items-center">
        <div className="animate-spin h-7 w-7 border-4 border-teal-500 border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="">
      {/* Spinner */}

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin h-7 w-7 border-4 border-teal-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Trending Events Section */}
      <div className="mt-2 w-full p-2 rounded-xl">
        <h2 className="text-xl text-white font-semibold mb-4">Trending</h2>

        {/* Scrollable Row */}
        <div className="overflow-x-auto scrollbar-hide scroll-smooth snap-x flex space-x-4 pb-4 rounded-xl w-full">
          {error && <p className="text-red-500">Error: {error}</p>}

          {getFilteredEvents().length === 0 && !loading && !error && (
            <p className="text-white text-center w-full">No events found.</p>
          )}

          {getFilteredEvents().map((event) => (
            <div
              key={event.id}
              className="snap-start flex-shrink-0 w-[100%] p-1"
            >
              <EventCard event={event} cardSize="lg" />
            </div>
          ))}
        </div>
      </div>

      {/* For You Section */}
      <div className="mt-2 w-full p-2 rounded-xl">
        <h2 className="text-xl text-white font-semibold mb-4">For You</h2>

        {/* Scrollable Row */}
        <div className="overflow-x-auto scrollbar-hide scroll-smooth snap-x flex space-x-4 pb-4 rounded-xl w-full justify-evenly">
          {error && <p className="text-red-500">Error: {error}</p>}

          {getFilteredEvents().length === 0 && !loading && !error && (
            <p className="text-white text-center w-full">No events found.</p>
          )}

          {getFilteredEvents().map((event) => (
            <div
              key={event.id}
              className="snap-start flex-shrink-0 w-[49%] p-1"
            >
              <EventCard event={event} cardSize="md" />
            </div>
          ))}
        </div>
      </div>

      {/* Freelancers */}
      <div className="mt-8">
        <h2 className="text-xl text-white font-semibold mb-4">
          Popular Freelancers
        </h2>
        <div className="flex flex-row gap-2 overflow-auto">
          {userList && userList.length > 0 ? (
            userList
              .filter((user) => user.roles?.freelancer) // ✅ Filter first
              .map(
                (
                  user // ✅ Then map
                ) => (
                  <div key={user.uid} className="mb-2">
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
        <h2 className="text-xl text-white font-semibold mb-4">
          Events Near You
        </h2>

        {/* Scrollable Row */}
        <div className="overflow-x-auto scrollbar-hide scroll-smooth snap-x flex space-x-4 pb-4 rounded-xl w-full justify-evenly">
          {error && <p className="text-red-500">Error: {error}</p>}

          {getFilteredEvents().length === 0 && !loading && !error && (
            <p className="text-white text-center w-full">No events found.</p>
          )}

          {getFilteredEvents().map((event) => (
            <div
              key={event.id}
              className="snap-start flex-shrink-0 w-[49%] p-1"
            >
              <EventCard event={event} cardSize="md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsTabs;
