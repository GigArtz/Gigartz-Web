import React from "react";
import EventCard from "./EventCard";
import { FaSpinner } from "react-icons/fa";

function LgScrollableEventRow({ events = [], loading = false, error = null }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <FaSpinner className="text-teal-500 text-4xl animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (events.length === 0) {
    return <p className="text-gray-400 text-center">No events found.</p>;
  }

  return (
    <div className="overflow-x-auto scrollbar-hide scroll-smooth snap-x flex space-x-4 pb-4 rounded-xl w-full">
      {error && <p className="text-red-500">Error: {error}</p>}

      {events.length === 0 && !loading && !error && (
        <p className="text-white text-center w-full">No events found.</p>
      )}

      {events.map((event) => (
        <div key={event.id} className="snap-start flex-shrink-0 w-[100%] p-1">
          <EventCard event={event} cardSize="lg" />
        </div>
      ))}
    </div>
  );
}
export default LgScrollableEventRow;
