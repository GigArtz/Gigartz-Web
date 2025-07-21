import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { RootState, AppDispatch } from "../../store/store";
import { fetchAllEvents } from "../../store/eventsSlice";
import EventCard from "./EventCard";
import AdCard from "./AdCard";
import { FaSpinner, FaArrowLeft } from "react-icons/fa";
import Header from "./Header";

interface SeeAllEventsPageProps {
  sectionTitle?: string;
  sectionType?: "trending" | "forYou" | "interest" | "location";
  filterCriteria?: {
    interest?: string;
    location?: string;
    userPreferences?: {
      interests: string[];
      locations: string[];
    };
  };
}

const SeeAllEventsPage: React.FC<SeeAllEventsPageProps> = ({
  sectionTitle = "All Events",
  sectionType = "trending",
  filterCriteria = {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // Get section info from URL params if not provided as props
  const urlParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const urlSectionType = urlParams.get("section") as
    | "trending"
    | "forYou"
    | "interest"
    | "location"
    | null;
  const urlInterest = urlParams.get("interest");
  const urlLocation = urlParams.get("location");
  const urlTitle = urlParams.get("title");

  const finalSectionType = urlSectionType || sectionType;
  const finalSectionTitle = urlTitle || sectionTitle;

  const finalFilterCriteria = useMemo(
    () => ({
      ...filterCriteria,
      interest: urlInterest || filterCriteria.interest,
      location: urlLocation || filterCriteria.location,
    }),
    [filterCriteria, urlInterest, urlLocation]
  );

  // State for infinite scroll
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const itemsPerPage = 12;

  // Ad configuration
  const AD_FREQUENCY = 6; // Show ad every 6 events

  // Dummy user preferences for demonstration
  const userPreferences = useMemo(
    () => ({
      interests: ["music", "art", "technology", "sports", "gaming", "fashion"],
      locations: ["New York", "Los Angeles"],
      ...finalFilterCriteria.userPreferences,
    }),
    [finalFilterCriteria.userPreferences]
  );

  // Redux state
  const { events, loading, error } = useSelector(
    (state: RootState) => state.events
  );
  const loadingByEventId = useSelector(
    (state: RootState) => state.events.loadingByEventId
  );
  const errorByEventId = useSelector(
    (state: RootState) => state.events.errorByEventId
  );

  const eventList = useMemo(() => events || [], [events]);

  // Track if we've already attempted to fetch
  const hasFetchedRef = useRef(false);

  // Load initial data
  useEffect(() => {
    if (!hasFetchedRef.current) {
      dispatch(fetchAllEvents());
      hasFetchedRef.current = true;
    }
  }, [dispatch]);

  // Filter events based on section type and criteria
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(eventList)) return [];

    let filtered = eventList;

    switch (finalSectionType) {
      case "trending":
        // Show all events for trending (could add trending logic here)
        break;

      case "forYou":
        // Filter events based on user interests
        filtered = eventList.filter((event) =>
          userPreferences.interests.some((interest) =>
            event?.category?.toLowerCase().includes(interest.toLowerCase())
          )
        );
        break;

      case "interest":
        // Filter by specific interest
        if (finalFilterCriteria.interest) {
          filtered = eventList.filter((event) =>
            event?.category
              ?.toLowerCase()
              .includes(finalFilterCriteria.interest!.toLowerCase())
          );
        }
        break;

      case "location":
        // Filter by specific location
        if (finalFilterCriteria.location) {
          filtered = eventList.filter((event) =>
            (event?.city || "")
              .toLowerCase()
              .includes(finalFilterCriteria.location!.toLowerCase())
          );
        }
        break;

      default:
        break;
    }

    return filtered;
  }, [eventList, finalSectionType, finalFilterCriteria, userPreferences]);

  // Generate different ad content based on index
  const getAdData = useCallback((adIndex: number) => {
    const ads = [
      {
        title: "Advertise With Us",
        description:
          "Get your event in front of thousands of potential attendees!",
        ctaLabel: "Book Now",
        ctaLink: "/advertise",
        image: "https://picsum.photos/300/200?random=1",
        badge: "Sponsored",
      },
      {
        title: "Promote Your Gig",
        description: "Reach more people and boost your event attendance.",
        ctaLabel: "Get Started",
        ctaLink: "/promote",
        image: "https://picsum.photos/300/200?random=2",
        badge: "Featured",
      },
      {
        title: "Event Management Tools",
        description:
          "Streamline your event planning with our professional tools.",
        ctaLabel: "Learn More",
        ctaLink: "/tools",
        image: "https://picsum.photos/300/200?random=3",
        badge: "New",
      },
    ];

    return ads[adIndex % ads.length];
  }, []);

  // Get paginated events with ads
  const paginatedEventsWithAds = useMemo(() => {
    const totalEvents = filteredEvents.slice(0, page * itemsPerPage);
    const itemsWithAds = [];

    totalEvents.forEach((event, index) => {
      itemsWithAds.push({ type: "event", data: event });

      // Add ad every AD_FREQUENCY events (but not after the last event)
      if ((index + 1) % AD_FREQUENCY === 0 && index + 1 < totalEvents.length) {
        itemsWithAds.push({
          type: "ad",
          key: `ad-${Math.floor(index / AD_FREQUENCY)}`,
          adData: getAdData(Math.floor(index / AD_FREQUENCY)),
        });
      }
    });

    return itemsWithAds;
  }, [filteredEvents, page, getAdData]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 &&
        !isLoadingMore &&
        hasMoreItems &&
        !loading
      ) {
        setIsLoadingMore(true);

        setTimeout(() => {
          setPage((prevPage) => {
            const newPage = prevPage + 1;
            const totalItemsShown = newPage * itemsPerPage;

            // Check if we have more items to show
            if (totalItemsShown >= filteredEvents.length) {
              setHasMoreItems(false);
            }

            return newPage;
          });
          setIsLoadingMore(false);
        }, 500); // Simulate loading delay
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore, hasMoreItems, loading, filteredEvents.length]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Loading state
  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="text-teal-500 text-4xl animate-spin" />
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && page === 1) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-red-500">Error loading events: {error}</p>
          <button
            onClick={() => dispatch(fetchAllEvents())}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky hidden sm:block top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
        <Header title={finalSectionTitle} />
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <p className="text-gray-400 text-lg mb-4">No events found</p>
            <p className="text-gray-500 text-sm">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <>
            {/* Events Column */}
            <div className="flex flex-col gap-4 mb-8">
              {paginatedEventsWithAds.map((item, idx) => {
                if (item.type === "event") {
                  return (
                    <div
                      key={item.data.id || idx}
                      className="animate-in fade-in-0 duration-300"
                    >
                      <EventCard
                        event={item.data}
                        cardSize="lg"
                        loading={loadingByEventId?.[item.data.id]}
                        error={errorByEventId?.[item.data.id]}
                      />
                    </div>
                  );
                } else {
                  const adData = item.adData || getAdData(0);
                  return (
                    <div
                      key={item.key}
                      className="animate-in fade-in-0 duration-300"
                    >
                      <AdCard
                        title={adData.title}
                        description={adData.description}
                        ctaLabel={adData.ctaLabel}
                        ctaLink={adData.ctaLink}
                        image={adData.image}
                        badge={adData.badge}
                        size="md"
                        external={true}
                      />
                    </div>
                  );
                }
              })}
            </div>

            {/* Loading More Indicator */}
            {isLoadingMore && (
              <div className="flex justify-center items-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <FaSpinner className="text-teal-500 text-2xl animate-spin" />
                  <p className="text-gray-400 text-sm">
                    Loading more events...
                  </p>
                </div>
              </div>
            )}

            {/* End of Results */}
            {!hasMoreItems && filteredEvents.length > 0 && (
              <div className="flex justify-center items-center py-8">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">
                    You've reached the end!
                  </p>
                  <p className="text-gray-500 text-xs">
                    Showing all {filteredEvents.length} events
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SeeAllEventsPage;
