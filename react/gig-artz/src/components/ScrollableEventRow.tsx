import React, { memo } from "react";
import EventCard from "./EventCard";
import AdCard from "./AdCard"; // Ensure this exists
import { FaSpinner } from "react-icons/fa";

import { useSelector } from "react-redux";

function ScrollableEventRow({ events = [] }) {
  const AD_FREQUENCY = 4;
  const loadingByEventId = useSelector(
    (state) => state.events.loadingByEventId
  );
  const errorByEventId = useSelector((state) => state.events.errorByEventId);

  if (events.length === 0) {
    return <p className="text-gray-400 text-center">No events found.</p>;
  }

  const itemsWithAds = [];
  events.forEach((event, index) => {
    itemsWithAds.push({ type: "event", data: event });
    if ((index + 1) % AD_FREQUENCY === 0 && index + 1 < events.length) {
      itemsWithAds.push({ type: "ad", key: `ad-${index}` });
    }
  });

  return (
    <div className="flex flex-row overflow-x-auto custom-scrollbar scroll-smooth snap-x space-x-2 pb-4">
      {itemsWithAds.map((item, idx) => (
        <div
          key={item.type === "event" ? item.data.id : item.key}
          className="snap-start flex-shrink-0 w-[49%] p-1"
        >
          {item.type === "event" ? (
            <EventCard
              event={item.data}
              cardSize="md"
              loading={loadingByEventId?.[item.data.id]}
              error={errorByEventId?.[item.data.id]}
            />
          ) : (
            <AdCard
              title="Advertise With Us"
              description="Get your event in front of thousands!"
              ctaLabel="Book Now"
              ctaLink="/advertise"
              image="https://picsum.photos/300/200?random=2"
              badge="Sponsored"
              size="sm"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default memo(ScrollableEventRow);
