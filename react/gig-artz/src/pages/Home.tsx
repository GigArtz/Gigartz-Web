import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BottomNav from "../components/BottomNav";
import { fetchAllEvents, fetchAllReviews } from "../../store/eventsSlice";
import { RootState, AppDispatch } from "../../store/store";
import EventsTabs from "../components/EventsTabs";
import ReviewCard from "../components/ReviewCard"; // Import ReviewCard
import CommentForm from "../components/CommentForm";
import AdCard from "../components/AdCard";
import PreferencesModal from "../components/PreferencesModal";
import ScrollableEventRow from "../components/ScrollableEventRow";
import { FaSpinner } from "react-icons/fa";
import LgScrollableEventRow from "../components/LgScrollableEventRow";
import UserCard from "../components/UserCard";

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
  const { userList } = useSelector((state: RootState) => state.profile);

  // Add state for selected tab
  const [selectedTab, setSelectedTab] = useState("reviews");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [eventsPage, setEventsPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const eventsPerPage = 10;

  const followingUserIds: string[] = []; // TODO: Replace with actual following user IDs
  const filteredEvents =
    selectedTab === "events"
      ? events
      : events.filter((event: Event) =>
          followingUserIds.includes(event.promoterId)
        );

  const professionals = Array.isArray(userList)
    ? userList.filter((user) => user.roles?.freelancer)
    : [];

  useEffect(() => {
    dispatch(fetchAllEvents());
    dispatch(fetchAllReviews(uid?.uid));
    console.log("Fetch..", reviews);
  }, [dispatch, uid]);

  // Infinite scroll for events tab
  useEffect(() => {
    if (selectedTab !== "events") return;
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 &&
        !loadingMore
      ) {
        setLoadingMore(true);
        setTimeout(() => {
          setEventsPage((prev) => prev + 1);
          setLoadingMore(false);
        }, 500);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedTab, loadingMore]);

  // Dummny galery data
  const dummyGallery = [
    "https://picsum.photos/200/300?random=1",
    "https://picsum.photos/200/300?random=2",
    "https://picsum.photos/200/300?random=3",
    "https://picsum.photos/200/300?random=4",
  ];

  // Dummy user preferences for demonstration
  const userPreferences = {
    interests: ["music", "art", "technology", "sports", "gaming", "fashion"],
    locations: ["New York", "Los Angeles"],
  };

  // Sectioned event lists (show all events, no filtering for now)
  const trendingEvents = filteredEvents.slice(0, eventsPage * eventsPerPage);
  const gigsNearYou = filteredEvents.slice(0, eventsPage * eventsPerPage);
  const preferenceEvents = filteredEvents.slice(0, eventsPage * eventsPerPage);
  const interestSections = userPreferences.interests.map((interest) => ({
    interest,
    events: filteredEvents.slice(0, eventsPage * eventsPerPage),
  }));
  const locationSections = userPreferences.locations.map((loc) => ({
    loc,
    events: filteredEvents.slice(0, eventsPage * eventsPerPage),
  }));

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
        <div className="flex flex-col gap-6">
          {/* Preferences Modal */}
          {showFilters && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
              <PreferencesModal
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                selectedInterests={selectedInterests}
                setSelectedInterests={setSelectedInterests}
                selectedLocations={selectedLocations}
                setSelectedLocations={setSelectedLocations}
                title={"Select Your Preferences"}
              />
            </div>
          )}

          {/* Trending */}
          <div className="w-full p-2 rounded-xl">
            <h2 className="text-xl text-white font-semibold mb-2">Trending</h2>
            <LgScrollableEventRow
              events={trendingEvents}
              loading={loading}
              error={error}
            />
          </div>

          <div className="w-full p-2 rounded-xl">
            <h2 className="text-xl text-white font-semibold mb-2">
              Gigs near you
            </h2>
            <ScrollableEventRow
              events={gigsNearYou}
              loading={loading}
              error={error}
            />
          </div>

          {/* Popular Professionals */}
          <div className="w-full p-2 rounded-xl">
            <h2 className="text-xl text-white font-semibold mb-2">
              Popular Professionals
            </h2>
            <div className="flex flex-row w-full gap-2 overflow-auto scroll-smooth space-x-2 pb-2">
              {professionals.length > 0 ? (
                professionals.map((user) => {
                  const userWithUid = { ...user, uid: user.uid || user.id };
                  return (
                    <div
                      key={user.id}
                      className="mb-2 w-full min-w-[220px] max-w-xs"
                    >
                      <UserCard user={userWithUid} />
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400 text-center mt-4">
                  No users found.
                </p>
              )}
            </div>
          </div>

          {/* Update Preferences Button */}
          <div className="w-full p-2 rounded-2xl border border-gray-800 bg-gray-900 flex justify-between items-center">
            <h2 className="text-xl text-white font-semibold mb-2">For you</h2>
            <button
              className="text-teal-500 text-sm hover:underline"
              onClick={() => setShowFilters(true)}
            >
              Update Preferences
            </button>
          </div>

          {/* Gigs near X (location) */}
          {userPreferences.locations.map((loc) => (
            <div className="w-full p-2 rounded-xl" key={loc}>
              <h2 className=" text-white font-semibold mb-2">
                Gigs near {loc}
              </h2>
              <ScrollableEventRow
                events={gigsNearYou}
                loading={loading}
                error={error}
              />
            </div>
          ))}

          {/* Because you went to X gig (interest) */}
          {userPreferences.interests.map((interest) => (
            <div className="w-full p-2 rounded-xl" key={interest}>
              <h2 className=" text-white font-semibold mb-2">
                Because you liked a {interest} gig
              </h2>
              <ScrollableEventRow
                events={preferenceEvents}
                loading={loading}
                error={error}
              />
            </div>
          ))}

          {/* Infinite scroll loader */}
          {loadingMore && (
            <div className="flex justify-center items-center py-4">
              <FaSpinner className="text-teal-500 text-2xl animate-spin" />
            </div>
          )}
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
