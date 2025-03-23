import React from "react";
import EventCard from "./EventCard";
import { FaSpinner } from "react-icons/fa";

function ScrollableEventCol({ events = [], loading = false, error = null }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="text-teal-500 text-4xl animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">Error: {error}</p>;
  }

  if (events.length === 0) {
    return <p className="text-gray-400 text-center">No events found.</p>;
  }

  return (
    <div className="flex flex-col space-y-4 w-full pb-4">
      {events.map((event) => (
        <div key={event.id} className="w-full">
          <EventCard event={event} cardSize="lg" />
        </div>
      ))}
    </div>
  );
}

export default ScrollableEventCol;
