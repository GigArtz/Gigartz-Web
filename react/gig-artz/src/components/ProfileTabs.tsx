import React, {
  useMemo,
  useState,
  memo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useSelector, shallowEqual } from "react-redux";
import { FaSpinner, FaUserPlus, FaUsers } from "react-icons/fa";
import ScrollableEventCol from "./ScrollableEventCol";
import ReviewCard from "./ReviewCard";
import { useRenderLogger } from "../hooks/usePerformanceMonitor";
import type { RootState } from "../../store/store";

interface ProfileTabsProps {
  uid: string;
}

interface User {
  id: string;
  userEvents?: Event[];
  userReviews?: Review[];
}

interface Event {
  id: string;
  createdBy?: string;
  likedBy?: string[];
}

interface Review {
  data?: {
    id: string;
    createdBy?: string;
    likedBy?: string[];
  };
}

interface GuestList {
  id: string;
  guestListName?: string;
  guests?: Guest[];
}

interface Guest {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

// Global component cache to prevent unnecessary re-renders across instances
const globalComponentCache = new Map<
  string,
  {
    data: {
      profile: User | null;
      loading: boolean;
      error: string | null;
      userProfile: User | null;
      userGuestList: GuestList[] | null;
      userEvents: Event[];
      userReviews: Review[];
    };
    timestamp: number;
    renderCount: number;
  }
>();

// Create an ultra-stable selector that truly ignores ALL state changes except critical data
const createStableProfileSelector = () => {
  let lastResult: {
    profile: User | null;
    loading: boolean;
    error: string | null;
    userProfile: User | null;
    userGuestList: GuestList[] | null;
    userEvents: Event[];
    userReviews: Review[];
  } | null = null;
  let lastUid: string | null = null;
  let lastStateSnapshot: string | null = null;
  let stableCounter = 0;
  let forceStableCount = 0;

  return (uid: string) => (state: RootState) => {
    // Check global component cache first
    const cacheKey = `profile-${uid}`;
    const cached = globalComponentCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < 5000) {
      // 5 second cache
      if (cached.renderCount > 3) {
        console.log(
          `[ProfileSelector] Using global cache for ${uid} (age: ${
            now - cached.timestamp
          }ms)`
        );
        return cached.data;
      }
    }

    // CRITICAL: If we just returned the same result multiple times in a row, keep returning it
    if (uid === lastUid && lastResult && forceStableCount < 3) {
      forceStableCount++;
      stableCounter++;

      // Update global cache
      globalComponentCache.set(cacheKey, {
        data: lastResult,
        timestamp: now,
        renderCount: (cached?.renderCount || 0) + 1,
      });

      if (stableCounter % 5 === 0) {
        console.log(
          `[ProfileSelector] FORCED STABLE for ${stableCounter} calls (forceCount: ${forceStableCount})`
        );
      }
      return lastResult;
    }

    // Reset force counter and proceed with normal logic
    forceStableCount = 0;

    // Create a snapshot of only the critical profile data we care about
    const { userList, loading, error, userProfile, userGuestList } =
      state.profile;
    const profile = userList?.find((user: User) => user.id === uid) || null;

    // More conservative snapshot - only include truly essential data
    const currentSnapshot = JSON.stringify({
      profileExists: !!profile,
      profileId: profile?.id,
      loading,
      hasError: !!error,
      userProfileExists: !!userProfile,
      userProfileId: userProfile?.id,
      userEventsLength: profile?.userEvents?.length || 0,
      userReviewsLength:
        profile?.userReviews?.length || userProfile?.userReviews?.length || 0,
      guestListLength: userGuestList?.length || 0,
    });

    // If uid and critical data snapshot haven't changed, return cached result
    if (
      uid === lastUid &&
      currentSnapshot === lastStateSnapshot &&
      lastResult
    ) {
      stableCounter++;

      // Update global cache
      globalComponentCache.set(cacheKey, {
        data: lastResult,
        timestamp: now,
        renderCount: (cached?.renderCount || 0) + 1,
      });

      if (stableCounter % 10 === 0) {
        console.log(`[ProfileSelector] Stable for ${stableCounter} calls`);
      }
      return lastResult;
    }

    // Reset counter when data changes
    stableCounter = 0;
    console.log(
      `[ProfileSelector] Data actually changed, recomputing for uid: ${uid}`
    );
    console.log(`[ProfileSelector] Old snapshot:`, lastStateSnapshot);
    console.log(`[ProfileSelector] New snapshot:`, currentSnapshot);

    // Only compute new result if data actually changed
    const result = {
      profile,
      loading,
      error,
      userProfile,
      userGuestList,
      userEvents: profile?.userEvents || [],
      userReviews: profile?.userReviews || userProfile?.userReviews || [],
    };

    lastResult = result;
    lastUid = uid;
    lastStateSnapshot = currentSnapshot;

    // Update global cache
    globalComponentCache.set(cacheKey, {
      data: result,
      timestamp: now,
      renderCount: 1,
    });

    return result;
  };
};

// Global stable selector instance
const stableProfileSelector = createStableProfileSelector();

const ProfileTabs = memo(({ uid }: ProfileTabsProps) => {
  // Monitor re-renders in development
  useRenderLogger("ProfileTabs", { uid });

  // State first to prevent closure issues
  const [activeTab, setActiveTab] = useState("events");
  const [selectedList, setSelectedList] = useState<GuestList | null>(null);
  const [gigsFilter, setGigsFilter] = useState("all");
  const [reviewsFilter, setReviewsFilter] = useState("all");

  // State lock to prevent rapid updates
  const stateUpdateLock = useRef(false);

  // Protected state setters
  const safeSetActiveTab = useCallback(
    (tab: string) => {
      if (!stateUpdateLock.current && tab !== activeTab) {
        stateUpdateLock.current = true;
        setActiveTab(tab);
        setTimeout(() => {
          stateUpdateLock.current = false;
        }, 50);
      }
    },
    [activeTab]
  );

  const safeSetGigsFilter = useCallback(
    (filter: string) => {
      if (!stateUpdateLock.current && filter !== gigsFilter) {
        stateUpdateLock.current = true;
        setGigsFilter(filter);
        setTimeout(() => {
          stateUpdateLock.current = false;
        }, 50);
      }
    },
    [gigsFilter]
  );

  const safeSetReviewsFilter = useCallback(
    (filter: string) => {
      if (!stateUpdateLock.current && filter !== reviewsFilter) {
        stateUpdateLock.current = true;
        setReviewsFilter(filter);
        setTimeout(() => {
          stateUpdateLock.current = false;
        }, 50);
      }
    },
    [reviewsFilter]
  );

  // Use cached selector to prevent recreation
  const profileData = useSelector(stableProfileSelector(uid), shallowEqual);

  // Enhanced render guard with debouncing
  const lastRenderDataRef = useRef<string | null>(null);
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  const currentRenderData = JSON.stringify({
    uid,
    profileId: profileData.profile?.id,
    loading: profileData.loading,
    error: profileData.error,
    eventsLength: profileData.userEvents.length,
    reviewsLength: profileData.userReviews.length,
    activeTab,
    gigsFilter,
    reviewsFilter,
  });

  // Enhanced render guard with timing
  const now = Date.now();
  const timeSinceLastRender = now - lastRenderTime.current;

  if (lastRenderDataRef.current === currentRenderData) {
    renderCount.current++;
    if (renderCount.current > 2 && timeSinceLastRender < 100) {
      console.warn(
        `[ProfileTabs] Rapid re-render detected! Count: ${renderCount.current}, Time: ${timeSinceLastRender}ms`
      );
    }
  } else {
    renderCount.current = 0;
  }

  lastRenderDataRef.current = currentRenderData;
  lastRenderTime.current = now;

  // Prevent renders during rapid-fire state changes
  useEffect(() => {
    if (renderCount.current > 5) {
      console.error(
        "[ProfileTabs] Too many rapid renders, component may be unstable"
      );
    }
  }, [currentRenderData]);

  // Memoized handlers with stable references
  const handleSubscribe = useCallback((guestListId: string) => {
    console.log(`Subscribed to guest list with id: ${guestListId}`);
  }, []);

  const handleTabChange = useCallback(
    (tab: string) => {
      safeSetActiveTab(tab);
    },
    [safeSetActiveTab]
  );

  const handleGigsFilterChange = useCallback(
    (filter: string) => {
      safeSetGigsFilter(filter);
    },
    [safeSetGigsFilter]
  );

  const handleReviewsFilterChange = useCallback(
    (filter: string) => {
      safeSetReviewsFilter(filter);
    },
    [safeSetReviewsFilter]
  );

  const handleListSelect = useCallback((list: GuestList) => {
    setSelectedList(list);
  }, []);

  // Memoized static configurations
  const tabConfig = useMemo(
    () => [
      { key: "events", label: "Gigs" },
      { key: "reviews", label: "Reviews" },
      { key: "guestList", label: "Guest Lists" },
    ],
    []
  );

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

  // Memoized filtered data
  const filteredEvents = useMemo(() => {
    const events = profileData.userEvents;
    if (gigsFilter === "all") return events;
    if (gigsFilter === "created") {
      return events.filter((event: Event) => event?.createdBy === uid);
    }
    return events.filter((event: Event) => event?.likedBy?.includes?.(uid));
  }, [profileData.userEvents, gigsFilter, uid]);

  const filteredReviews = useMemo(() => {
    const reviews = profileData.userReviews;
    if (!reviews) return [];

    return reviews.filter((item: Review) => {
      if (reviewsFilter === "all") return true;
      if (reviewsFilter === "created") return item?.data?.createdBy === uid;
      if (reviewsFilter === "liked")
        return item?.data?.likedBy?.includes?.(uid);
      return true;
    });
  }, [profileData.userReviews, reviewsFilter, uid]);

  // Circuit breaker - completely disable if too many rapid renders
  if (renderCount.current > 5 && timeSinceLastRender < 100) {
    console.error(
      "[ProfileTabs] EMERGENCY CIRCUIT BREAKER - Infinite loop detected!"
    );
    console.error(
      `[ProfileTabs] Render count: ${renderCount.current}, Time: ${timeSinceLastRender}ms`
    );
    return (
      <div className="p-4">
        <div className="text-red-500 text-center border border-red-500 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-2">⚠️ Component Disabled</h3>
          <p>Infinite render loop detected and stopped</p>
          <p className="text-sm mt-2 text-red-400">
            Renders: {renderCount.current} in {timeSinceLastRender}ms
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Handle persistent fetch errors to prevent infinite loops
  if (profileData.error && profileData.error.includes("fetch_error")) {
    return (
      <div className="p-4">
        <div className="text-red-500 text-center">
          <p>Unable to load profile data</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Early return during loading to prevent unnecessary renders
  if (profileData.loading) {
    return (
      <div className="p-4">
        <div className="flex justify-center">
          <FaSpinner className="text-teal-500 text-4xl animate-spin" />
        </div>
      </div>
    );
  }

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
        {profileData.error && (
          <p className="text-red-500">Error: {profileData.error}</p>
        )}

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
              <ScrollableEventCol
                events={filteredEvents}
                loading={profileData.loading}
                error={profileData.error}
              />
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
                  {filteredReviews.map((item: Review, idx: number) => (
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
            <>
              {profileData.userGuestList?.length > 0 ? (
                profileData.userGuestList.map((list: GuestList) => (
                  <div
                    key={list.id}
                    onClick={() => handleListSelect(list)}
                    className={`cursor-pointer p-5 flex justify-between items-center bg-slate-900 rounded-3xl mb-3 shadow-md transition-all duration-200 hover:scale-[1.025] hover:shadow-xl ${
                      selectedList?.id === list.id
                        ? "border-teal-400 ring-2 ring-teal-300"
                        : "border-teal-600 hover:border-teal-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* List icon */}
                      <div className="p-2 bg-gray-700 rounded-full text-white">
                        <FaUsers className="w-5 h-5" />
                      </div>

                      {/* Guest List Name */}
                      <span className="text-white font-semibold text-base tracking-wide">
                        {list.guestListName || "Unnamed List"}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubscribe(list.id);
                      }}
                      aria-label={`Subscribe to ${list.guestListName}`}
                      className="flex items-center gap-2 text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      <FaUserPlus className="w-4 h-4" />
                      <span className="text-sm font-medium">Subscribe</span>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center mt-4">
                  No guest lists available.
                </p>
              )}

              {/* Show Guest Details */}
              {selectedList && (
                <div className="mt-4 bg-gray-800 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Guests</h3>
                  <ul className="space-y-2">
                    {selectedList.guests?.map((guest: Guest, idx: number) => (
                      <li
                        key={idx}
                        className="text-white text-sm flex flex-col sm:flex-row sm:justify-between"
                      >
                        <span>
                          {guest.name || "Unnamed"} —{" "}
                          {guest.email || "No email"}
                        </span>
                        <span className="text-gray-400">
                          {guest.phoneNumber || "No phone"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </>
      </div>
    </div>
  );
});

// Custom comparison function for memo to prevent unnecessary re-renders
const ProfileTabsComparison = (
  prevProps: ProfileTabsProps,
  nextProps: ProfileTabsProps
) => {
  // Only re-render if uid actually changes
  return prevProps.uid === nextProps.uid;
};

ProfileTabs.displayName = "ProfileTabs";

export default memo(ProfileTabs, ProfileTabsComparison);
