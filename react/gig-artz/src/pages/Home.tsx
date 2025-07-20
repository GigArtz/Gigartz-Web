import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import BottomNav from "../components/BottomNav";
import { fetchAllEvents, fetchAllReviews } from "../../store/eventsSlice";
import { RootState, AppDispatch } from "../../store/store";
import ReviewCard from "../components/ReviewCard";
import CommentForm from "../components/CommentForm";
import AdCard from "../components/AdCard";
import PreferencesModal from "../components/PreferencesModal";
import ScrollableEventRow from "../components/ScrollableEventRow";
import { FaSpinner } from "react-icons/fa";
import LgScrollableEventRow from "../components/LgScrollableEventRow";
import UserCard from "../components/UserCard";
import { showToast } from "../../store/notificationSlice";
import { fetchAllProfiles } from "../../store/profileSlice";

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
  const dispatch = useDispatch<AppDispatch>();

  // Memoized selectors to prevent unnecessary re-renders with shallow equality
  const eventsState = useSelector(
    (state: RootState) => state.events,
    shallowEqual
  );
  const authState = useSelector((state: RootState) => state.auth, shallowEqual);
  const profileState = useSelector(
    (state: RootState) => state.profile,
    shallowEqual
  );
  const toastState = useSelector(
    (state: RootState) => state.notification.toast
  );

  // Extract specific values with memoization
  const { events, loading, error, reviews, success } = useMemo(
    () => eventsState,
    [eventsState]
  );
  const uid = useMemo(() => authState, [authState]);
  const { userList, loading: profileLoading } = useMemo(
    () => profileState,
    [profileState]
  );

  // Add state for selected tab
  const [selectedTab, setSelectedTab] = useState("reviews");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [eventsPage, setEventsPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  // Remove local toast state, use Redux
  const eventsPerPage = 10;

  // Memoize following user IDs to prevent re-computation
  const followingUserIds = useMemo(() => [], []); // TODO: Replace with actual following user IDs logic

  // Memoize filtered events to prevent unnecessary re-computation
  const filteredEvents = useMemo(() => {
    return selectedTab === "events"
      ? events
      : events.filter((event: Event) =>
          followingUserIds.includes(event.promoterId)
        );
  }, [events, selectedTab, followingUserIds]);

  // Memoize professionals list to prevent unnecessary re-computation
  const professionals = useMemo(() => {
    if (Array.isArray(userList)) {
      // Filter to show freelancer users or users with events (professionals)
      const filteredUsers = userList.filter((user) => {
        // Show freelancers OR users who have created events (content creators/professionals)
        return (
          user.roles?.freelancer === true ||
          (user.userEvents &&
            Array.isArray(user.userEvents) &&
            user.userEvents.length > 0)
        );
      });

      return filteredUsers.map((user) => ({
        ...user,
        uid: user.uid || user.id, // Normalize uid property once
      }));
    }
    return [];
  }, [userList]);

  const currentUid = uid?.uid;

  useEffect(() => {
    // Only fetch if we have a user ID and haven't fetched recently
    if (currentUid && events.length === 0) {
      dispatch(fetchAllEvents());
    }
    if (currentUid && reviews.length === 0) {
      dispatch(fetchAllReviews(currentUid));
    }
    // Fetch all profiles for Popular Professionals section
    if (currentUid && (!userList || userList.length === 0)) {
      dispatch(fetchAllProfiles());
    }
  }, [dispatch, currentUid, events.length, reviews.length, userList]);

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

  useEffect(() => {
    if (error) {
      dispatch(showToast({ message: error, type: "error" }));
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      dispatch(showToast({ message: success, type: "success" }));
    }
  }, [success, dispatch]);

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
            <h2 className="text-white text-lg font-semibold mb-2">Trending</h2>
            <LgScrollableEventRow
              events={trendingEvents}
              loading={loading}
              error={error}
            />
          </div>

          <div className="w-full p-2 rounded-xl">
            <h2 className="text-white text-lg font-semibold mb-2">
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
            <h2 className="text-white text-lg font-semibold mb-2">
              Popular Professionals
            </h2>

            <div className="flex flex-row w-full gap-2 overflow-auto scroll-smooth space-x-2 pb-2">
              {profileLoading ? (
                <div className="flex justify-center items-center py-4">
                  <FaSpinner className="text-teal-500 text-2xl animate-spin" />
                  <span className="text-gray-400 ml-2">
                    Loading professionals...
                  </span>
                </div>
              ) : professionals.length > 0 ? (
                professionals.map((user) => (
                  <div
                    key={user.uid || user.id}
                    className="mb-2 w-full min-w-[220px] max-w-xs"
                  >
                    <UserCard user={user} />
                  </div>
                ))
              ) : (
                <div className="text-center mt-4">
                  <p className="text-gray-400">No users found.</p>
                  <p className="text-gray-500 text-sm">
                    {userList
                      ? `Total users: ${userList.length}`
                      : "User list not loaded"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Gigs near X (location) */}
          {userPreferences.locations.map((loc) => (
            <div className="w-full p-2 rounded-xl" key={loc}>
              <h2 className="text-white text-lg font-semibold mb-2">
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
              <h2 className="text-white text-lg font-semibold mb-2">
                Because you liked a {interest} gig
              </h2>
              <ScrollableEventRow
                events={preferenceEvents}
                loading={loading}
                error={error}
              />
            </div>
          ))}

          {/* Update Preferences Button */}
          <div className="w-full p-2 flex justify-center items-center">
            <button
              className="text-teal-500 text-sm hover:underline"
              onClick={() => setShowFilters(true)}
            >
              Update Preferences
            </button>
          </div>

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
        <BottomNav onOpenNotifications={() => setNotificationsOpen(true)} />
      </div>

      {/* Toast moved to App.tsx for global visibility */}
    </div>
  );
};

export default Home;
