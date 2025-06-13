import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BottomNav from "../components/BottomNav";
import { fetchAllEvents, fetchAllReviews } from "../../store/eventsSlice";
import { RootState, AppDispatch } from "../../store/store";
import EventsTabs from "../components/EventsTabs";
import ReviewCard from "../components/ReviewCard"; // Import ReviewCard
import ReviewsGallery from "../components/ReviewsGallery";
import { Review } from "@material-ui/icons";
import CommentForm from "../components/CommentForm";
import AdCard from "../components/AdCard";

// Define types for Event fields
interface TicketPrice {
  platinum: number;
  students: number;
  goldenCircle: number;
  general: number;
}
interface Review {
  userId: string;
  timestamp: { seconds: number; nanoseconds: number };
  review: string;
  replies: Review[];
}
interface Event {
  id: string;
  ticketsPrices: TicketPrice;
  time: string;
  mapLink: string;
  title: string;
  gallery: string[];
  comments: Review[];
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
  const { events, loading, error, reviews } = useSelector(
    (state: RootState) => state.events
  );
  const uid = useSelector((state: RootState) => state.auth);

  // Add state for selected tab
  const [selectedTab, setSelectedTab] = useState("reviews");

  const followingUserIds: string[] = []; // TODO: Replace with actual following user IDs
  const filteredEvents =
    selectedTab === "events"
      ? events
      : events.filter((event: Event) =>
          followingUserIds.includes(event.promoterId)
        );

  useEffect(() => {
    dispatch(fetchAllEvents());
    dispatch(fetchAllReviews(uid?.uid));
    console.log("Fetch..", reviews);
  }, [dispatch, uid]);

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
      imageUrls: [
        "https://picsum.photos/200/300?random=1",
        "https://picsum.photos/200/300?random=5",
      ],
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      review: "Amazing event! Loved the atmosphere and the music.",
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
      imageUrls: ["https://picsum.photos/200/300?random=2"],
      review: "Best concert ever! Can't wait for the next one.",
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
      imageUrls: [
        "https://picsum.photos/200/300?random=3",
        "https://picsum.photos/200/300?random=4",
      ],
      review: "Interesting exhibits, but the venue was crowded.",
      date: "2024-05-20",
      text: "Interesting exhibits, but the venue was crowded.",
      createdAt: "2024-05-20T09:45:00Z",
    },
    {
      id: "4",
      user: {
        name: "David Kim",
        avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      },
      eventTitle: "Food Truck Fiesta",
      rating: 5,
      imageUrls: ["https://picsum.photos/200/300?random=6"],
      review: "Incredible food, great vibes, and perfect weather!",
      date: "2024-06-02",
      text: "Incredible food, great vibes, and perfect weather! Every stall had something unique. Definitely bringing more friends next time. Loved the live band too!",
      createdAt: "2024-06-02T18:00:00Z",
    },
    {
      id: "5",
      user: {
        name: "Ella Rivera",
        avatar: "https://randomuser.me/api/portraits/women/5.jpg",
      },
      eventTitle: "Outdoor Movie Night",
      rating: 4,
      imageUrls: ["https://picsum.photos/200/300?random=7"],
      review: "Cozy and fun evening under the stars.",
      date: "2024-06-03",
      text: "Cozy and fun evening under the stars. The sound system could’ve been better, but overall it was a lovely night with friends and snacks.",
      createdAt: "2024-06-03T20:30:00Z",
    },
    {
      id: "6",
      user: {
        name: "Frank Dorsey",
        avatar: "https://randomuser.me/api/portraits/men/6.jpg",
      },
      eventTitle: "Tech Meetup 2024",
      rating: 2,
      imageUrls: [],
      review: "Not well organized. Speakers were late.",
      date: "2024-06-04",
      text: "Not well organized. The speakers were late, some sessions were canceled without notice, and the venue had poor Wi-Fi. Hoping for a better experience next year.",
      createdAt: "2024-06-04T10:15:00Z",
    },
    {
      id: "7",
      user: {
        name: "Grace Liu",
        avatar: "https://randomuser.me/api/portraits/women/7.jpg",
      },
      eventTitle: "Book Fair",
      rating: 5,
      imageUrls: ["https://picsum.photos/200/300?random=8"],
      review: "Book heaven! Found so many great deals.",
      date: "2024-06-05",
      text: "Book heaven! Found so many great deals and rare finds. The author signing corner was a highlight. Loved the children's reading area too. Great family-friendly vibe!",
      createdAt: "2024-06-05T11:00:00Z",
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
            { key: "reviews", label: "Reviews" },
            { key: "events", label: "Gigs" },
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
          {/* Review Form */}
          <CommentForm
            placeholder="Share your experience..."
            buttonText="Post Review"
            onSubmit={(review) => {
              console.log("Review submitted:", review);
              // TODO: Hook into API/state update
            }}
          />

          {/* Reviews with Ads injected */}
          {reviews?.length > 0 ? (
            reviews
              .reduce((acc, review, index) => {
                acc.push({ type: "review", data: review });

                // Inject an ad after every 3 reviews (but not at the end)
                if ((index + 1) % 3 === 0 && index + 1 < reviews?.length) {
                  acc.push({ type: "ad", key: `ad-${index}` });
                }

                return acc;
              }, [])
              .map((item, idx) =>
                item.type === "review" ? (
                  <ReviewCard key={item.data.id} review={item.data} />
                ) : (
                  <AdCard
                    key={item.key}
                    title="Boost Your Business"
                    description="Place your ad here to reach local audiences."
                    ctaLabel="Advertise Now"
                    ctaLink="/advertise"
                    image="https://picsum.photos/seed/reviewad/400/200"
                    badge="Sponsored"
                    size="sm"
                  />
                )
              )
          ) : (
            <p className="text-gray-400 italic">No reviews yet.</p>
          )}

          {/* Optional Gallery */}
          {dummyGallery?.length > 0 && (
            <ReviewsGallery gallery={dummyGallery} />
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
