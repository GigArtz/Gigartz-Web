import { useEffect, useState } from "react";
import EventCard from "./EventCard";
import UserCard from "./UserCard";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProfiles } from "../store/profileSlice";
import Loader from "./Loader";

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

  return (
    <div className="min-h-screen max-w-full">
      {loading && <Loader message="Loading ..." />}

      {/* Trending Events Section */}
      <div className="mt-2">
        <h2 className="text-xl text-white font-semibold mb-4">Trending</h2>
        <div className="overflow-x-auto scrollbar-hide whitespace-nowrap scroll-smooth snap-x flex space-x-4 pb-4 rounded-xl">
          {error && <p className="text-red-500">Error: {error}</p>}
          {getFilteredEvents().length === 0 && !loading && !error && (
            <p className="text-white text-center">No events found.</p>
          )}
          {getFilteredEvents().map((event) => (
            <div key={event.id} className="snap-start max-w-full">
              <EventCard event={event} cardSize="lg" />
            </div>
          ))}
        </div>
      </div>

      {/* For You Section */}
      <div className="mt-8">
        <h2 className="text-xl text-white font-semibold mb-4">
          Upcoming Events
        </h2>
        <div className="overflow-x-auto scrollbar-hide whitespace-nowrap scroll-smooth snap-x flex space-x-4 pb-4">
          {loading && <p className="text-white">Loading events...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {getFilteredEvents().length === 0 && !loading && !error && (
            <p className="text-white text-center">No events found.</p>
          )}
          {getFilteredEvents().map((event) => (
            <div key={event.id} className="snap-start">
              <EventCard event={event} cardSize="sm" />
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
      <div className="mt-8">
        <h2 className="text-xl text-white font-semibold mb-4">
          Events Near You
        </h2>
        <div className="overflow-x-auto scrollbar-hide whitespace-nowrap scroll-smooth snap-x flex space-x-4 pb-4">
          {loading && <p className="text-white">Loading events...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {getFilteredEvents().length === 0 && !loading && !error && (
            <p className="text-white text-center">No events found.</p>
          )}
          {getFilteredEvents().map((event) => (
            <div key={event.id} className="snap-start">
              <EventCard event={event} cardSize="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsTabs;
