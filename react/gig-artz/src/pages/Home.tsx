import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BottomNav from "../components/BottomNav";
import { fetchAllEvents } from "../../store/eventsSlice";
import { RootState, AppDispatch } from "../../store/store";
import EventsTabs from "../components/EventsTabs";

// Define types for Event fields
interface TicketPrice {
  platinum: number;
  students: number;
  goldenCircle: number;
  general: number;
}
interface Comment {
  userId: string;
  timestamp: { seconds: number; nanoseconds: number };
  comment: string;
  replies: Comment[];
}
interface Event {
  id: string;
  ticketsPrices: TicketPrice;
  time: string;
  mapLink: string;
  title: string;
  gallery: string[];
  comments: Comment[];
  eventType: string;
  eventVideo: string;
  city: string;
  description: string;
  likes: number;
  venue: string;
  artistLineUp: string[];
  category: string;
  promoterId: string;
  eventPic: string;
  eventEndTime: string;
  date: string;
  eventStartTime: string;
}

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Use correct type for thunk
  const { events, loading, error } = useSelector(
    (state: RootState) => state.events
  );

  // Add state for selected tab
  const [selectedTab, setSelectedTab] = useState("events");

  const followingUserIds: string[] = []; // TODO: Replace with actual following user IDs
  const filteredEvents =
    selectedTab === "events"
      ? events
      : events.filter((event: Event) =>
          followingUserIds.includes(event.promoterId)
        );

  useEffect(() => {
    dispatch(fetchAllEvents());
  }, [dispatch]);

  return (
    <div className="main-content">
      {/* Tabs */}
      <div className="tabs">
        <ul className="flex flex-nowrap justify-around overflow-x-auto hide-scrollbar gap-x-4 -mb-px px-4">
          {[
            { key: "events", label: "Events" },
            { key: "reviews", label: "Reviews" },
          ].map(({ key, label }) => (
            <li key={key}>
              <button
                onClick={() => setSelectedTab(key)}
                className={`px-4 py-2 rounded-t-lg text-nowrap transition-all duration-200 ${
                  selectedTab === key
                    ? "border-teal-500 text-lg text-white bg-teal-900"
                    : "border-transparent hover:text-gray-400 hover:border-gray-400"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedTab === "events" && (
        // Main Content
        <div className="flex flex-col justify-evenly">
          <EventsTabs events={filteredEvents} loading={loading} error={error} />
        </div>
      )}

      {/* Bottom Navigation (Only visible on small screens) */}
      <div className="fixed px-2 bottom-0 w-full block md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default Home;
