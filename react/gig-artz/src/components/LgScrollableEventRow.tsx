import React from "react";
import EventCard from "./EventCard";
import { FaSpinner } from "react-icons/fa";
import AdCard from "./AdCard";

import { useSelector } from "react-redux";

function LgScrollableEventRow({ events = [] }) {
  const AD_FREQUENCY = 3;
  const loadingByEventId = useSelector(
    (state) => state.events.loadingByEventId
  );
  const errorByEventId = useSelector((state) => state.events.errorByEventId);

  if (events.length === 0) {
    return <p className="text-gray-400 text-center">No events found.</p>;
  }

  // Build a combined array of events and ads
  const itemsWithAds = [];
  events.forEach((event, index) => {
    itemsWithAds.push({ type: "event", data: event });
    if ((index + 1) % AD_FREQUENCY === 0 && index + 1 < events.length) {
      itemsWithAds.push({ type: "ad", key: `ad-${index}` });
    }
  });

  return (
    <div className="overflow-x-auto custom-scrollbar scroll-smooth snap-x flex space-x-4 pb-4 rounded-xl w-full">
      {itemsWithAds.map((item, idx) => (
        <div
          key={item.type === "event" ? item.data.id : item.key}
          className="snap-start flex-shrink-0 w-[100%] p-1"
        >
          {item.type === "event" ? (
            <EventCard
              event={item.data}
              cardSize="lg"
              loading={loadingByEventId?.[item.data.id]}
              error={errorByEventId?.[item.data.id]}
            />
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
