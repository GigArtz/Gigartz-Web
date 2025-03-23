import React from "react";
import EventCard from "./EventCard";
import { FaSpinner } from "react-icons/fa";

function ScrollableEventRow({ events = [], loading = false, error = null }) {
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
    <div className="flex flex-row gap-2 overflow-x-auto">
      {events.map((event) => (
        <EventCard key={event.id} event={event} cardSize="sm" />
      ))}
    </div>
  );
}
export default ScrollableEventRow;
