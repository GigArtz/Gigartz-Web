import React, { useMemo, useState, memo, useCallback, useRef } from "react";
import { useSelector, shallowEqual } from "react-redux";
import {
  FaSpinner,
  FaUserPlus,
  FaUsers,
  FaCalendarAlt,
  FaLock,
  FaThList,
  FaUser,
  FaHeart,
  FaFilter,
} from "react-icons/fa";
import ScrollableEventCol from "./ScrollableEventCol";
import ReviewCard from "./ReviewCard";
import BaseModal from "./BaseModal";
import type { RootState } from "../../store/store";

interface ProfileTabsProps {
  uid: string;
}

// Define the shape of a user profile
interface UserProfile {
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
  description?: string;
  eventDate?: string;
  eventDetails?: string;
}

interface Guest {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

// ProfileTabs Component

const ProfileTabs = memo(({ uid }: ProfileTabsProps) => {
  // State declarations
  const [activeTab, setActiveTab] = useState("events");
  const [selectedList, setSelectedList] = useState<GuestList | null>(null);
  const [gigsFilter, setGigsFilter] = useState("all");
  const [reviewsFilter, setReviewsFilter] = useState("all");
  const [isGuestListModalOpen, setIsGuestListModalOpen] = useState(false);
  const [subscribedLists, setSubscribedLists] = useState<string[]>([]);

  // Debounce state updates
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);

  const debouncedStateUpdate = useCallback((updateFn: () => void) => {
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }
    updateTimeout.current = setTimeout(() => {
      updateFn();
      updateTimeout.current = null;
    }, 50);
  }, []);

  // Get profile data from Redux
  const profileData = useSelector((state: RootState) => {
    const {
      userList,
      loading,
      error,
      userProfile,
      userGuestList,
      visitedProfile,
    } = state.profile;

    const profile = userList?.find((user) => user.id === uid) || null;

    // Determine if viewing own profile
    const authUser = localStorage.getItem("authUser");
    let currentUserId = null;
    try {
      if (authUser) {
        const parsedAuthUser = JSON.parse(authUser);
        currentUserId = parsedAuthUser?.uid || parsedAuthUser?.id;
      }
    } catch (error) {
      console.error("Error parsing authUser from localStorage:", error);
    }

    const isOwnProfile = uid === currentUserId && currentUserId !== null;

    // Use appropriate data source based on profile type
    const activeProfileData = isOwnProfile ? {
      userProfile: userProfile || null,
      userEvents: userProfile?.userEvents || [],
      userReviews: userProfile?.userReviews || [],
      userGuestList: userGuestList || [],
      userFollowers: userProfile?.userFollowers || [],
      userFollowing: userProfile?.userFollowing || [],
      userTickets: userProfile?.userTickets || [],
      userSavedEvents: userProfile?.userSavedEvents || [],
      userBookings: userProfile?.userBookings || [],
    } : visitedProfile || {
      userProfile: null,
      userEvents: [],
      userReviews: [],
      userGuestList: [],
      userFollowers: [],
      userFollowing: [],
      userTickets: [],
      userSavedEvents: [],
      userBookings: [],
    };

    return {
      profile,
      loading,
      error,
      userProfile,
      userGuestList,
      isOwnProfile,
      currentUserId,
      activeProfileData,
      // Legacy support - keeping visitedProfile for backward compatibility
      visitedProfile: visitedProfile
        ? {
            userProfile: visitedProfile.userProfile || null,
            userEvents: visitedProfile.userEvents || [],
            userReviews: visitedProfile.userReviews || [],
            userGuestList: visitedProfile.userGuestList || [],
          }
        : null,
    };
  }, shallowEqual);

  // Handlers
  const handleSubscribe = useCallback((guestListId: string) => {
    console.log(`Subscribed to guest list with id: ${guestListId}`);
    // Add to subscribed lists
    setSubscribedLists((prev) => [...prev, guestListId]);
    // Keep modal open to show the newly accessible guest list
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsGuestListModalOpen(false);
  }, []);

  const handleTabChange = useCallback(
    (tab: string) => {
      debouncedStateUpdate(() => setActiveTab(tab));
    },
    [debouncedStateUpdate]
  );

  const handleGigsFilterChange = useCallback(
    (filter: string) => {
      debouncedStateUpdate(() => setGigsFilter(filter));
    },
    [debouncedStateUpdate]
  );

  const handleReviewsFilterChange = useCallback(
    (filter: string) => {
      debouncedStateUpdate(() => setReviewsFilter(filter));
    },
    [debouncedStateUpdate]
  );

  const handleListSelect = useCallback((list: GuestList) => {
    setSelectedList(list);
    setIsGuestListModalOpen(true);
  }, []);

  // Dynamic tab configuration with counts
  const tabConfig = useMemo(() => {
    const eventsCount = profileData.activeProfileData?.userEvents?.length || 0;
    const reviewsCount = profileData.activeProfileData?.userReviews?.length || 0;
    const guestListsCount = profileData.activeProfileData?.userGuestList?.length || 0;

    return [
      { key: "events", label: "Gigs", count: eventsCount },
      { key: "reviews", label: "Reviews", count: reviewsCount },
      { key: "guestList", label: "Guest Lists", count: guestListsCount },
    ];
  }, [
    profileData.activeProfileData?.userEvents?.length,
    profileData.activeProfileData?.userReviews?.length,
    profileData.activeProfileData?.userGuestList?.length,
  ]);

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

  // Get filtered events based on current filter
  const getFilteredEvents = useCallback(() => {
    const events = profileData.activeProfileData?.userEvents || [];
    if (gigsFilter === "all") return events;
    if (gigsFilter === "created") {
      // For own profile, show created by current user; for visited profile, show created by visited user
      const targetUserId = profileData.isOwnProfile ? profileData.currentUserId : uid;
      return events.filter((event) => event?.userId === targetUserId || event?.promoterId === targetUserId);
    }
    if (gigsFilter === "liked") {
      // Show events liked by the current logged-in user
      return events.filter((event) => event?.likedBy?.includes?.(profileData.currentUserId));
    }
    return events;
  }, [profileData.activeProfileData?.userEvents, gigsFilter, uid, profileData.isOwnProfile, profileData.currentUserId]);

  // Get event counts for each filter
  const getEventFilterCounts = useCallback(() => {
    const events = profileData.activeProfileData?.userEvents || [];
    const targetUserId = profileData.isOwnProfile ? profileData.currentUserId : uid;
    
    return {
      all: events.length,
      created: events.filter((event) => event?.userId === targetUserId || event?.promoterId === targetUserId).length,
      liked: events.filter((event) => event?.likedBy?.includes?.(profileData.currentUserId)).length,
    };
  }, [profileData.activeProfileData?.userEvents, uid, profileData.isOwnProfile, profileData.currentUserId]);

  // Get filtered reviews based on current filter
  const getFilteredReviews = useCallback(() => {
    const reviews = profileData.activeProfileData?.userReviews || [];
    if (!reviews.length) return [];

    return reviews.filter((item) => {
      if (reviewsFilter === "all") return true;
      if (reviewsFilter === "created") {
        // For own profile, show created by current user; for visited profile, show created by visited user
        const targetUserId = profileData.isOwnProfile ? profileData.currentUserId : uid;
        return item?.userId === targetUserId || item?.createdBy === targetUserId || item?.data?.createdBy === targetUserId;
      }
      if (reviewsFilter === "liked") {
        // Show reviews liked by the current logged-in user
        return item?.likedBy?.includes?.(profileData.currentUserId) || item?.data?.likedBy?.includes?.(profileData.currentUserId);
      }
      return true;
    });
  }, [profileData.activeProfileData?.userReviews, reviewsFilter, uid, profileData.isOwnProfile, profileData.currentUserId]);

  // Get review counts for each filter
  const getReviewFilterCounts = useCallback(() => {
    const reviews = profileData.activeProfileData?.userReviews || [];
    const targetUserId = profileData.isOwnProfile ? profileData.currentUserId : uid;
    
    return {
      all: reviews.length,
      created: reviews.filter((item) => 
        item?.userId === targetUserId || 
        item?.createdBy === targetUserId || 
        item?.data?.createdBy === targetUserId
      ).length,
      liked: reviews.filter((item) => 
        item?.likedBy?.includes?.(profileData.currentUserId) || 
        item?.data?.likedBy?.includes?.(profileData.currentUserId)
      ).length,
    };
  }, [profileData.activeProfileData?.userReviews, uid, profileData.isOwnProfile, profileData.currentUserId]);

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
          {tabConfig.map(({ key, label, count }) => (
            <li key={key}>
              <button
                onClick={() => handleTabChange(key)}
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
        {profileData.error && (
          <p className="text-red-500">Error: {profileData.error}</p>
        )}

        <>
          {/* Events Tab */}
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
                        onClick={() => handleGigsFilterChange(key)}
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

              {/* Dynamic Profile Events */}
              <div className="pt-2">
                {profileData.activeProfileData?.userEvents?.length > 0 ? (
                  <div>
                    <ScrollableEventCol
                      events={getFilteredEvents()}
                      loading={false}
                      error={null}
                    />
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    {profileData.isOwnProfile 
                      ? "You haven't created any events yet" 
                      : `No events found for ${profileData.activeProfileData?.userProfile?.name || 'this user'}`
                    }
                  </p>
                )}
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
                        onClick={() => handleReviewsFilterChange(key)}
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

              {/* Dynamic Profile Reviews */}
              <div className="pt-2">
                {profileData.activeProfileData?.userReviews?.length > 0 ? (
                  <div className="space-y-4">
                    {getFilteredReviews().map(
                      (review: Review, idx: number) => (
                        <ReviewCard
                          key={review.data?.id ?? idx}
                          review={review}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    {profileData.isOwnProfile 
                      ? "You haven't received any reviews yet" 
                      : `No reviews found for ${profileData.activeProfileData?.userProfile?.name || 'this user'}`
                    }
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Guest List Tab */}
          {activeTab === "guestList" && (
            <>
              {/* Dynamic User's Guest Lists */}
              <div className="mb-8">
                {profileData.activeProfileData?.userGuestList?.length > 0 ? (
                  profileData.activeProfileData?.userGuestList?.map(
                    (list: GuestList) => (
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

                        {subscribedLists.includes(list.id) ? (
                          <div className="flex items-center gap-2 text-emerald-300 bg-gray-800 px-4 py-2 rounded-full">
                            <span className="text-sm font-medium">
                              ✓ Subscribed
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubscribe(list.id);
                            }}
                            aria-label={`Subscribe to ${list.guestListName}`}
                            className="flex items-center gap-2 btn-primary-sm px-4 py-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-teal-400"
                          >
                            <FaUserPlus className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Subscribe
                            </span>
                          </button>
                        )}
                      </div>
                    )
                  )
                ) : (
                  <p className="text-gray-500 text-center mt-4">
                    {profileData.isOwnProfile 
                      ? "You haven't created any guest lists yet" 
                      : `No guest lists available for ${profileData.activeProfileData?.userProfile?.name || 'this user'}`
                    }
                  </p>
                )}
              </div>
            </>
          )}
        </>
      </div>

      {/* Guest List Description Modal using BaseModal */}
      {selectedList && (
        <BaseModal
          isOpen={isGuestListModalOpen}
          onClose={handleCloseModal}
          title={selectedList.guestListName || "Guest List"}
          icon={<FaUsers />}
          maxWidth="md:max-w-lg"
          className="bg-gray-900"
        >
          <div className="px-2">
            <div className="mb-6">
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <h4 className="text-white font-medium mb-2">Description</h4>
                <p className="text-gray-300 text-sm">
                  {selectedList.description ||
                    "No description provided for this guest list."}
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Event Details</h4>
                <div className="flex items-center text-gray-300 text-sm mb-1">
                  <FaCalendarAlt className="mr-2 text-gray-400" />
                  <span>
                    {selectedList.eventDate || "No event date specified"}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  {selectedList.eventDetails || "No additional event details."}
                </p>
              </div>
            </div>

            {/* Guest List Preview - Only shown if subscribed */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">Guests</h4>
                {!subscribedLists.includes(selectedList.id) && (
                  <span className="text-xs text-amber-400 flex items-center">
                    <FaLock className="mr-1" /> Subscribe to view
                  </span>
                )}
              </div>

              {subscribedLists.includes(selectedList.id) ? (
                <div className="bg-gray-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {selectedList.guests && selectedList.guests.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedList.guests.map((guest, idx) => (
                        <li
                          key={idx}
                          className="text-gray-300 text-sm flex justify-between"
                        >
                          <span>{guest.name || "Unnamed Guest"}</span>
                          <span className="text-gray-400">
                            {guest.email || "No email"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm text-center">
                      No guests in this list yet
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center opacity-70">
                  <div className="p-3 bg-gray-700 rounded-full mb-3">
                    <FaLock className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-gray-400 text-sm text-center">
                    Subscribe to access the guest list details
                  </p>
                </div>
              )}
            </div>

            {/* Subscribe Button - Show only if not already subscribed */}
            {!subscribedLists.includes(selectedList.id) ? (
              <button
                onClick={() => handleSubscribe(selectedList.id)}
                className="w-full btn-primary py-3 flex items-center justify-center transition-colors"
              >
                <FaUserPlus className="mr-2" />
                Subscribe to Guest List
              </button>
            ) : (
              <div className="w-full primary-btn py-3 font-medium flex items-center justify-center">
                <span className="text-emerald-300 mr-2">✓</span>
                Subscribed
              </div>
            )}
          </div>
        </BaseModal>
      )}
    </div>
  );
});

// Set the display name for better debugging
ProfileTabs.displayName = "ProfileTabs";

// Export with custom comparison function to prevent unnecessary re-renders
export default memo(ProfileTabs, (prevProps, nextProps) => {
  // Only re-render if uid actually changes
  return prevProps.uid === nextProps.uid;
});
