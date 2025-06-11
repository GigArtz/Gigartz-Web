import React from "react";
import EventCard from "./EventCard";
import { FaSpinner } from "react-icons/fa";
import AdCard from "./AdCard";

function LgScrollableEventRow({ events = [], loading = false, error = null }) {
  const AD_FREQUENCY = 3;

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

  // Build a combined array of events and ads
  const itemsWithAds = [];
  events.forEach((event, index) => {
    itemsWithAds.push({ type: "event", data: event });

    // Insert ad after every AD_FREQUENCY events (but not after the last one)
    if ((index + 1) % AD_FREQUENCY === 0 && index + 1 < events.length) {
      itemsWithAds.push({ type: "ad", key: `ad-${index}` });
    }
  });

  return (
    <div className="overflow-x-auto scrollbar-hide scroll-smooth snap-x flex space-x-4 pb-4 rounded-xl w-full">
      {itemsWithAds.map((item, idx) => (
        <div
          key={item.type === "event" ? item.data.id : item.key}
          className="snap-start flex-shrink-0 w-[100%] p-1"
        >
          {item.type === "event" ? (
            <EventCard event={item.data} cardSize="lg" />
          ) : (
            <AdCard
              title="Promote Your Event Here!"
              description="Reach thousands of local event-goers. Book your slot today and boost your visibility."
              ctaLabel="Advertise Now"
              ctaLink="/advertise"
              image="https://picsum.photos/200/300?random=1"
              badge="Sponsored"
              size="md"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default LgScrollableEventRow;
