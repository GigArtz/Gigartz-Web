import React, { useMemo, useState, memo, useCallback } from "react";
import { useSelector } from "react-redux";
import { FaSpinner, FaUserPlus, FaUsers } from "react-icons/fa";
import ScrollableEventCol from "./ScrollableEventCol";
import ReviewCard from "./ReviewCard";
import { useRenderLogger } from "../hooks/usePerformanceMonitor";
import type { RootState } from "../../store/store";

interface ProfileTabsProps {
  uid: string;
}

const ProfileTabs = memo(({ uid }: ProfileTabsProps) => {
  // Monitor re-renders in development
  useRenderLogger("ProfileTabs", { uid });

  // Optimized selectors with shallow equality - only get what we need
  const currentUserId = useSelector((state: RootState) => state.auth.uid);
  const loading = useSelector((state: RootState) => state.profile.loading);
  const error = useSelector((state: RootState) => state.profile.error);
  
  // Only select the profile we actually need based on uid
  const userProfile = useSelector((state: RootState) => 
    uid === currentUserId ? state.profile.userProfile : null
  );
  const visitedProfile = useSelector((state: RootState) => 
    uid !== currentUserId ? state.profile.visitedProfile : null
  );

  // Determine if viewing own profile or visited profile
  const isOwnProfile = useMemo(() => {
    return uid === currentUserId && currentUserId !== null;
  }, [uid, currentUserId]);

  // Memoize the specific data we need to prevent unnecessary re-renders
  const profileData = useMemo(() => {
    const profile = isOwnProfile ? userProfile : visitedProfile;
    
    if (!profile) {
      return {
        userEvents: [],
        userReviews: [],
        userGuestList: [],
      };
    }

    return {
      userEvents: profile.userEvents || [],
      userReviews: profile.userReviews || [],
      userGuestList: profile.userGuestList || [],
    };
  }, [isOwnProfile, userProfile, visitedProfile]);

  // Memoize user gig guide calculation with stable reference
  const userGigGuide = useMemo(() => {
    const events = profileData.userEvents;
    if (!events || events.length === 0) return [];
    return [...events];
  }, [profileData.userEvents]);

  // State for active tab and selected list
  const [activeTab, setActiveTab] = useState("events");
  const [selectedList, setSelectedList] = useState<{
    id: string;
    guestListName?: string;
    guests?: unknown[];
  } | null>(null);
  const [gigsFilter, setGigsFilter] = useState("all");
  const [reviewsFilter, setReviewsFilter] = useState("all");

  // Memoized event handlers to prevent child re-renders
  const handleSubscribe = useCallback((guestListId: string) => {
    console.log(`Subscribed to guest list with id: ${guestListId}`);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleGigsFilterChange = useCallback((filter: string) => {
    setGigsFilter(filter);
  }, []);

  const handleReviewsFilterChange = useCallback((filter: string) => {
    setReviewsFilter(filter);
  }, []);

  const handleListSelect = useCallback(
    (list: { id: string; guestListName?: string; guests?: unknown[] }) => {
      setSelectedList(list);
    },
    []
  );

  // Memoize tab configuration to prevent recreation
  const tabConfig = useMemo(
    () => [
      { key: "events", label: "Gigs" },
      { key: "reviews", label: "Reviews" },
      { key: "guestList", label: "Guest Lists" },
    ],
    []
  );

  // Memoize filter configurations
  const gigsFilterConfig = useMemo(
    () => [
      { key: "all", label: "All" },
      { key: "created", label: "Created" },
      { key: "liked", label: "Liked" },
    ],
    []
  );

  const reviewsFilterConfig = useMemo(
    () => [
      { key: "all", label: "All" },
      { key: "created", label: "Created" },
      { key: "liked", label: "Liked" },
    ],
    []
  );

  // Memoize filtered events to prevent recalculation on every render
  const filteredEvents = useMemo(() => {
    if (gigsFilter === "all") return userGigGuide;
    if (gigsFilter === "created") {
      return userGigGuide.filter((event) => event?.createdBy === uid);
    }
    return userGigGuide.filter((event) => event?.likedBy?.includes?.(uid));
  }, [userGigGuide, gigsFilter, uid]);

  // Memoize filtered reviews to prevent recalculation on every render
  const filteredReviews = useMemo(() => {
    const reviews = profileData.userReviews;
    if (!reviews) return [];

    return reviews.filter((item) => {
      if (reviewsFilter === "all") return true;
      if (reviewsFilter === "created") return item?.data?.createdBy === uid;
      if (reviewsFilter === "liked")
        return item?.data?.likedBy?.includes?.(uid);
      return true;
    });
  }, [profileData.userReviews, reviewsFilter, uid]);

  return (
    <div>
      {/* Tabs */}
      <div className="tabs">
        <ul className="flex flex-nowrap justify-around overflow-x-auto hide-scrollbar gap-x-4 -mb-px px-4">
          {tabConfig.map(({ key, label }) => (
            <li key={key}>
              <button
                onClick={() => handleTabChange(key)}
                className={`px-4 py-2 rounded-t-lg text-nowrap transition-all duration-200 ${
                  activeTab === key
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

      <div className="p-4">
        {loading && (
          <div className="flex justify-center">
            <FaSpinner className="text-teal-500 text-4xl animate-spin" />
          </div>
        )}

        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <>
            {/* Events Tab */}
            {activeTab === "events" && (
              <div className="snap-start flex-shrink-0 w-full p-1">
                {/* Gigs Filter */}
                <div className="flex gap-2 mb-4 justify-center">
                  {gigsFilterConfig.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleGigsFilterChange(key)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        gigsFilter === key
                          ? "bg-teal-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-teal-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <ScrollableEventCol events={filteredEvents} />
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="mt-4">
                {/* Reviews Filter */}
                <div className="flex gap-2 mb-4 justify-center">
                  {reviewsFilterConfig.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleReviewsFilterChange(key)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        reviewsFilter === key
                          ? "bg-teal-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-teal-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {filteredReviews.length > 0 ? (
                  <div className="space-y-4">
                    {filteredReviews.map((item, idx) => (
                      <ReviewCard key={item.data?.id ?? idx} review={item} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center mt-4">
                    No reviews yet...
                  </p>
                )}
              </div>
            )}

            {/* Guest List Tab */}
            {activeTab === "guestList" && (
              <div className="mt-4">
                {profileData.userGuestList &&
                profileData.userGuestList.length > 0 ? (
                  <div>
                    {profileData.userGuestList.map(
                      (list: unknown, index: number) => {
                        const listData = list as {
                          id: string;
                          guestListName?: string;
                          guests?: unknown[];
                        };
                        return (
                          <div
                            key={listData.id || index}
                            onClick={() => handleListSelect(listData)}
                            className={`cursor-pointer p-5 flex justify-between items-center bg-slate-900 rounded-3xl mb-3 shadow-md transition-all duration-200 hover:scale-[1.025] hover:shadow-xl ${
                              selectedList?.id === listData.id
                                ? "border-teal-400 ring-2 ring-teal-300"
                                : "border-teal-600 hover:border-teal-400"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-700 rounded-full text-white">
                                <FaUsers className="w-5 h-5" />
                              </div>
                              <span className="text-white font-semibold text-base tracking-wide">
                                {listData.guestListName || "Unnamed List"}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubscribe(listData.id);
                              }}
                              aria-label={`Subscribe to ${listData.guestListName}`}
                              className="flex items-center gap-2 text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-teal-400"
                            >
                              <FaUserPlus className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Subscribe
                              </span>
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center mt-4">
                    No guest lists available.
                  </p>
                )}

                {/* Show Guest Details */}
                {selectedList && (
                  <div className="mt-4 bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">Guests</h3>
                    {selectedList.guests && selectedList.guests.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedList.guests.map(
                          (guest: unknown, idx: number) => {
                            const guestData = guest as {
                              name?: string;
                              email?: string;
                            };
                            return (
                              <li
                                key={idx}
                                className="bg-gray-700 p-3 rounded-lg text-gray-300"
                              >
                                <span className="font-medium">
                                  {guestData.name ||
                                    guestData.email ||
                                    "Anonymous Guest"}
                                </span>
                              </li>
                            );
                          }
                        )}
                      </ul>
                    ) : (
                      <p className="text-gray-400">No guests in this list.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

ProfileTabs.displayName = "ProfileTabs";

export default ProfileTabs;
