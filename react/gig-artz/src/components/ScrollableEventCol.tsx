import React from "react";
import EventCard from "./EventCard";
import AdCard from "./AdCard"; // Make sure you have this component
import { FaSpinner } from "react-icons/fa";

function ScrollableEventCol({ events = [], loading = false, error = null }) {
  const AD_FREQUENCY = 3;

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

  // Build an array with events and ads interleaved
  const itemsWithAds = [];
  events.forEach((event, index) => {
    itemsWithAds.push({ type: "event", data: event });

    // Insert ad after every AD_FREQUENCY events but not after the last one
    if ((index + 1) % AD_FREQUENCY === 0 && index + 1 < events.length) {
      itemsWithAds.push({ type: "ad", key: `ad-${index}` });
    }
  });

  return (
    <div className="flex flex-col space-y-4 w-full pb-4">
      {itemsWithAds.map((item) =>
        item.type === "event" ? (
          <div key={item.data.id} className="w-full">
            <EventCard event={item.data} cardSize="lg" />
          </div>
        ) : (
          <div key={item.key} className="w-full">
            <AdCard
              title="Promote Your Event Here!"
              description="Reach thousands of local event-goers. Book your slot today and boost your visibility."
              ctaLabel="Advertise Now"
              ctaLink="/advertise"
              image="https://picsum.photos/600/200?random=10"
              badge="Sponsored"
              size="lg"
            />
          </div>
        )
      )}
    </div>
  );
}

export default ScrollableEventCol;
