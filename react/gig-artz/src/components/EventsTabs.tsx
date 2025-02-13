import { useState } from "react";
import EventCard from "./EventCard";

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

  return (
    <div className="min-h-screen">
      {/* For You Section */}
      <div className="mt-8">
        <h2 className="text-xl text-white font-semibold mb-4">For You</h2>
        <div className="overflow-x-auto scrollbar-hide whitespace-nowrap scroll-smooth snap-x flex space-x-4 pb-4">
          {loading && <p className="text-white">Loading events...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {getFilteredEvents().length === 0 && !loading && !error && (
            <p className="text-white text-center">No events found.</p>
          )}
          {getFilteredEvents().map((event) => (
            <div key={event.id} className="snap-start">
              <EventCard event={event} cardSize="lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Trending Events Section */}
      <div className="mt-8">
        <h2 className="text-xl text-white font-semibold mb-4">Trending Events</h2>
        <div className="overflow-x-auto scrollbar-hide whitespace-nowrap scroll-smooth snap-x flex space-x-4 pb-4">
          {loading && <p className="text-white">Loading events...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {getFilteredEvents().length === 0 && !loading && !error && (
            <p className="text-white text-center">No events found.</p>
          )}
          {getFilteredEvents().map((event) => (
            <div key={event.id} className="snap-start">
              <EventCard event={event} cardSize="lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Events Near You Section */}
      <div className="mt-8">
        <h2 className="text-xl text-white font-semibold mb-4">Events Near You</h2>
        <div className="overflow-x-auto scrollbar-hide whitespace-nowrap scroll-smooth snap-x flex space-x-4 pb-4">
          {loading && <p className="text-white">Loading events...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {getFilteredEvents().length === 0 && !loading && !error && (
            <p className="text-white text-center">No events found.</p>
          )}
          {getFilteredEvents().map((event) => (
            <div key={event.id} className="snap-start">
              <EventCard event={event} cardSize="lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsTabs;
