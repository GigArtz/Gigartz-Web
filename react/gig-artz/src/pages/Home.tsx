import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BottomNav from "../components/BottomNav";
import { fetchAllEvents } from "../../store/eventsSlice";
import { RootState, AppDispatch } from "../../store/store";
import EventsTabs from "../components/EventsTabs";
import ReviewCard from "../components/ReviewCard"; // Import ReviewCard
import ReviewsGallery from "../components/ReviewsGallery";

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

  // Dummy reviews data
  const dummyReviews = [
    {
      id: "1",
      user: {
        name: "Alice Smith",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      eventTitle: "Jazz Night",
      rating: 4,
      comment: "Amazing event! Loved the atmosphere and the music.",
      date: "2024-06-01",
      text: "Amazing event! Loved the atmosphere and the music.",
      createdAt: "2024-06-01T12:00:00Z",
    },
    {
      id: "2",
      user: {
        name: "Bob Johnson",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      },
      eventTitle: "Rock Fest",
      rating: 5,
      comment: "Best concert ever! Can't wait for the next one.",
      date: "2024-05-28",
      text: "Best concert ever! Can't wait for the next one.",
      createdAt: "2024-05-28T15:30:00Z",
    },
    {
      id: "3",
      user: {
        name: "Carol Lee",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      },
      eventTitle: "Art Expo",
      rating: 3,
      comment: "Interesting exhibits, but the venue was crowded.",
      date: "2024-05-20",
      text: "Interesting exhibits, but the venue was crowded.",
      createdAt: "2024-05-20T09:45:00Z",
    },
  ];

  // Dummny galery data
  const dummyGallery = [
    "https://picsum.photos/200/300?random=1",
    "https://picsum.photos/200/300?random=2",
    "https://picsum.photos/200/300?random=3",
    "https://picsum.photos/200/300?random=4",
  ];

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

      {selectedTab === "reviews" && (
        <div className="flex flex-col gap-4 p-4">
          {dummyReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {dummyGallery.length > 0 && (
            <ReviewsGallery key={"gallery"} gallery={dummyGallery} />
          )}
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
