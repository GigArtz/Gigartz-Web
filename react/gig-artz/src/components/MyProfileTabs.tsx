import React, { useState, memo, useMemo, useCallback } from "react";
import { useSelector, shallowEqual } from "react-redux";
import {
  FaSpinner,
  FaThList,
  FaUser,
  FaHeart,
  FaCalendarAlt,
  FaStar,
} from "react-icons/fa";
import ScrollableEventCol from "./ScrollableEventCol";
import ReviewCard from "./ReviewCard";
import { useRenderLogger } from "../hooks/usePerformanceMonitor";

const MyProfileTabs = memo(({ uid }) => {
  // Monitor re-renders in development
  useRenderLogger("MyProfileTabs", { uid });

  // Optimized selectors with shallow equality
  const profileState = useSelector((state) => state.profile, shallowEqual);
  const events = useSelector((state) => state.events.events, shallowEqual);

  const {
    profile,
    userTickets,
    userEvents,
    userSavedEvents,
    userSavedReviews,
    likedEvents,
    loading,
    error,
    userReviews,
  } = profileState;

  const [activeTab, setActiveTab] = useState("events");
  // Filter state for events, reviews, and saved
  const [gigsFilter, setGigsFilter] = useState("all"); // all | created | liked
  const [reviewsFilter, setReviewsFilter] = useState("all"); // all | created | liked
  const [savedFilter, setSavedFilter] = useState("all"); // all | gigs | reviews

  // Filter configuration
  const filterConfig = useMemo(
    () => [
      { key: "all", label: "All", icon: <FaThList className="w-3 h-3" /> },
      {
        key: "created",
        label: "Created",
        icon: <FaUser className="w-3 h-3" />,
      },
      { key: "liked", label: "Liked", icon: <FaHeart className="w-3 h-3" /> },
    ],
    []
  );

  const savedFilterConfig = useMemo(
    () => [
      { key: "all", label: "All", icon: <FaThList className="w-3 h-3" /> },
      {
        key: "gigs",
        label: "Gigs",
        icon: <FaCalendarAlt className="w-3 h-3" />,
      },
      {
        key: "reviews",
        label: "Reviews",
        icon: <FaStar className="w-3 h-3" />,
      },
    ],
    []
  );

  // Memoize user gig guide calculation to prevent unnecessary re-computations
  const userGigGuide = useMemo(() => {
    if (!profile || !events) return [];

    // Merge userTickets and userEvents, then find matching events
    const ticketAndEventNames = [...(userTickets || []), ...(userEvents || [])]
      .map((item) => item?.eventName || item?.title)
      .filter(Boolean);

    const uniqueEventNames = Array.from(new Set(ticketAndEventNames));

    return (events || []).filter((event) =>
      uniqueEventNames.includes(event?.title)
    );
  }, [profile, events, userTickets, userEvents]);

  // Dynamic tab configuration with counts
  const tabConfig = useMemo(() => {
    const eventsCount = userGigGuide?.length || 0;
    const reviewsCount = userReviews?.length || 0;
    const savedCount =
      (userSavedEvents?.length || 0) + (userSavedReviews?.length || 0);

    return [
      { key: "events", label: "Gigs", count: eventsCount },
      { key: "reviews", label: "Reviews", count: reviewsCount },
      { key: "saved", label: "Saved", count: savedCount },
    ];
  }, [
    userGigGuide?.length,
    userReviews?.length,
    userSavedEvents?.length,
    userSavedReviews?.length,
  ]);

  // Get event counts for each filter
  const getEventFilterCounts = useCallback(() => {
    const events = userGigGuide || [];
    return {
      all: events.length,
      created: events.filter((event) => event?.createdBy === uid).length,
      liked: likedEvents?.length || 0,
    };
  }, [userGigGuide, uid, likedEvents?.length]);

  // Get review counts for each filter
  const getReviewFilterCounts = useCallback(() => {
    const reviews = userReviews || [];
    return {
      all: reviews.length,
      created: reviews.filter((item) => item?.data?.createdBy === uid).length,
      liked: reviews.filter((item) => item?.data?.likedBy?.includes?.(uid))
        .length,
    };
  }, [userReviews, uid]);

  // Get saved counts for each filter
  const getSavedFilterCounts = useCallback(() => {
    return {
      all: (userSavedEvents?.length || 0) + (userSavedReviews?.length || 0),
      gigs: userSavedEvents?.length || 0,
      reviews: userSavedReviews?.length || 0,
    };
  }, [userSavedEvents?.length, userSavedReviews?.length]);

  return (
    <div>
      {/* Tabs */}
      <div className="tabs">
        <ul className="flex flex-nowrap justify-around overflow-x-auto custom-scrollbar gap-x-4 -mb-px px-4">
          {tabConfig.map(({ key, label, count }) => (
            <li key={key}>
              <button
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-t-lg text-nowrap transition-all duration-200 ${
                  activeTab === key
                    ? "border-teal-500 text-lg text-white bg-teal-900"
                    : "border-transparent hover:text-gray-400 hover:border-gray-400"
                }`}
              >
                <span className="flex items-center gap-2">
                  {label}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      activeTab === key
                        ? "bg-teal-700 text-teal-200"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {count}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4">
        {/* Spinner */}
        {loading && (
          <div className="flex justify-center">
            <FaSpinner className="text-teal-500 text-4xl animate-spin" />
          </div>
        )}

        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <>
            {activeTab === "events" && (
              <div className="snap-start flex-shrink-0 w-full">
                {/* Gigs Filter - Compact UI */}
                <div className="mb-4">
                  <div className="flex gap-2 justify-center flex-wrap">
                    {filterConfig.map(({ key, label, icon }) => {
                      const eventCounts = getEventFilterCounts();
                      const count =
                        eventCounts[key as keyof typeof eventCounts] || 0;
                      return (
                        <button
                          key={key}
                          onClick={() => setGigsFilter(key)}
                          className={`group flex items-center gap-1.5 px-1 sm:px-3 py-1 sm:py-2 rounded-lg text-sm sm:font-medium transition-all duration-200 border ${
                            gigsFilter === key
                              ? "bg-teal-600 text-white border-teal-500 shadow-md"
                              : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-teal-800 hover:border-teal-600 hover:text-white"
                          }`}
                        >
                          <span
                            className={`transition-colors ${
                              gigsFilter === key
                                ? "text-white"
                                : "text-gray-400 group-hover:text-white"
                            }`}
                          >
                            {icon}
                          </span>
                          <span>{label}</span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              gigsFilter === key
                                ? "bg-teal-700 text-teal-100"
                                : "bg-gray-700 text-gray-300 group-hover:bg-teal-700 group-hover:text-teal-100"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Events Content */}
                <div className="pt-2">
                  <ScrollableEventCol
                    events={
                      gigsFilter === "all"
                        ? userGigGuide
                        : gigsFilter === "created"
                        ? userGigGuide.filter(
                            (event) => event?.createdBy === uid
                          )
                        : likedEvents || []
                    }
                    loading={loading}
                    error={error}
                  />
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div>
                {/* Reviews Filter - Compact UI */}
                <div className="mb-4">
                  <div className="flex gap-2 justify-center flex-wrap">
                    {filterConfig.map(({ key, label, icon }) => {
                      const reviewCounts = getReviewFilterCounts();
                      const count =
                        reviewCounts[key as keyof typeof reviewCounts] || 0;
                      return (
                        <button
                          key={key}
                          onClick={() => setReviewsFilter(key)}
                          className={`group flex items-center gap-1.5 px-1 sm:px-3 py-1 sm:py-2 rounded-lg text-sm sm:font-medium transition-all duration-200 border ${
                            gigsFilter === key
                              ? "bg-teal-600 text-white border-teal-500 shadow-md"
                              : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-teal-800 hover:border-teal-600 hover:text-white"
                          }`}
                        >
                          <span
                            className={`transition-colors ${
                              reviewsFilter === key
                                ? "text-white"
                                : "text-gray-400 group-hover:text-white"
                            }`}
                          >
                            {icon}
                          </span>
                          <span>{label}</span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              reviewsFilter === key
                                ? "bg-teal-700 text-teal-100"
                                : "bg-gray-700 text-gray-300 group-hover:bg-teal-700 group-hover:text-teal-100"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews Content */}
                <div className="pt-2">
                  {userReviews?.length > 0 ? (
                    <div className="space-y-4">
                      {userReviews
                        .filter((item) => {
                          if (reviewsFilter === "all") return true;
                          if (reviewsFilter === "created")
                            return item?.data?.createdBy === uid;
                          if (reviewsFilter === "liked")
                            return item?.data?.likedBy?.includes?.(uid);
                          return true;
                        })
                        .map((item, idx) => (
                          <ReviewCard
                            key={item.data?.id ?? idx}
                            review={item}
                          />
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">
                      You haven't received any reviews yet
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Saved Tab */}
            {activeTab === "saved" && (
              <div>
                {/* Saved Filter - Compact UI */}
                <div className="mb-4">
                  <div className="flex gap-2 justify-center flex-wrap">
                    {savedFilterConfig.map(({ key, label, icon }) => {
                      const savedCounts = getSavedFilterCounts();
                      const count =
                        savedCounts[key as keyof typeof savedCounts] || 0;
                      return (
                        <button
                          key={key}
                          onClick={() => setSavedFilter(key)}
                          className={`group flex items-center gap-1.5 px-1 sm:px-3 py-1 sm:py-2 rounded-lg text-sm sm:font-medium transition-all duration-200 border ${
                            gigsFilter === key
                              ? "bg-teal-600 text-white border-teal-500 shadow-md"
                              : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-teal-800 hover:border-teal-600 hover:text-white"
                          }`}
                        >
                          <span
                            className={`transition-colors ${
                              savedFilter === key
                                ? "text-white"
                                : "text-gray-400 group-hover:text-white"
                            }`}
                          >
                            {icon}
                          </span>
                          <span>{label}</span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              savedFilter === key
                                ? "bg-teal-700 text-teal-100"
                                : "bg-gray-700 text-gray-300 group-hover:bg-teal-700 group-hover:text-teal-100"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Saved Content */}
                <div className="pt-2">
                  {(savedFilter === "all" || savedFilter === "gigs") && (
                    <div className={savedFilter === "all" ? "mb-6" : ""}>
                      {userSavedEvents?.length > 0 ? (
                        <ScrollableEventCol
                          events={userSavedEvents}
                          loading={loading}
                          error={error}
                        />
                      ) : (
                        <p className="text-gray-400 text-center py-4">
                          No saved gigs yet
                        </p>
                      )}
                    </div>
                  )}

                  {(savedFilter === "all" || savedFilter === "reviews") && (
                    <div>
                      {userSavedReviews?.length > 0 ? (
                        <div className="space-y-4">
                          {userSavedReviews.map((review, idx) => (
                            <ReviewCard
                              key={review.data?.id ?? idx}
                              review={review}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-4">
                          No saved reviews yet
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

MyProfileTabs.displayName = "MyProfileTabs";

export default MyProfileTabs;
