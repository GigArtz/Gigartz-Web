import React, { useMemo, useState, memo, useCallback } from "react";
import { useSelector } from "react-redux";
import { FaSpinner, FaUserPlus, FaUsers } from "react-icons/fa";
import ScrollableEventCol from "./ScrollableEventCol";
import ReviewCard, { Review } from "./ReviewCard";
import { useRenderLogger } from "../hooks/usePerformanceMonitor";
import type { RootState } from "../../store/store";

interface ProfileTabsProps {
  uid: string;
}

interface GuestListItem {
  id: string;
  guestListName: string;
  guests?: Array<{
    name?: string;
    email?: string;
    phoneNumber?: string;
  }>;
}

const ProfileTabs = memo(({ uid }: ProfileTabsProps) => {
  // Monitor re-renders in development
  useRenderLogger("ProfileTabs", { uid });

  // More specific selectors to prevent unnecessary re-renders
  const userEvents = useSelector(
    (state: RootState) => state.profile.userEvents
  );
  const userReviews = useSelector(
    (state: RootState) => state.profile.userReviews
  );
  const userGuestList = useSelector(
    (state: RootState) => state.profile.userGuestList
  );
  const loading = useSelector((state: RootState) => state.profile.loading);
  const error = useSelector((state: RootState) => state.profile.error);

  // Memoize user gig guide calculation
  const userGigGuide = useMemo(() => {
    return [...(userEvents || [])];
  }, [userEvents]);

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

  const handleListSelect = useCallback((list: typeof selectedList) => {
    setSelectedList(list);
  }, []);

  const [activeTab, setActiveTab] = useState("events");
  const [selectedList, setSelectedList] = useState(null);
  // Filter state for events and reviews
  const [gigsFilter, setGigsFilter] = useState("all"); // all | created | liked
  const [reviewsFilter, setReviewsFilter] = useState("all"); // all | created | liked

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
    const reviews = (userReviews as Review[]) || [];

    return reviews.filter((item) => {
      if (reviewsFilter === "all") return true;
      if (reviewsFilter === "created") return item?.userId === uid;
      if (reviewsFilter === "liked") return false; // Implement liked logic if needed
      return true;
    });
  }, [userReviews, reviewsFilter, uid]);

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
                      <ReviewCard key={item.id ?? idx} review={item} />
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
                {(userGuestList as GuestListItem[])?.length > 0 ? (
                  (userGuestList as GuestListItem[]).map((list) => (
                    <div
                      key={list.id}
                      onClick={() => handleListSelect(list)}
                      className={`cursor-pointer p-5 flex justify-between items-center bg-slate-900 rounded-3xl mb-3 shadow-md transition-all duration-200
                        
                        hover:scale-[1.025] hover:shadow-xl
                        ${
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
                      {selectedList.guests?.map((guest, idx) => (
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
        )}
      </div>
    </div>
  );
});

ProfileTabs.displayName = "ProfileTabs";

export default ProfileTabs;
