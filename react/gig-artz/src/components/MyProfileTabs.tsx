import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaSpinner } from "react-icons/fa";
import ScrollableEventCol from "./ScrollableEventCol";
import ReviewCard from "./ReviewCard";

function MyProfileTabs({ uid }) {
  const {
    profile,
    userList,
    userEvents,
    userTickets,
    userSavedEvents,
    userSavedReviews,
    likedEvents,
    loading,
    error,
    userReviews,
  } = useSelector((state) => state.profile);
  const { events } = useSelector((state) => state.events);

  const [userGigGuide, setUserGigGuide] = useState([]);
  // const [userSaves, setUserSaves] = useState(userList?.savedPosts || []); // No longer used
  const [activeTab, setActiveTab] = useState("events");
  // Filter state for events, reviews, and saved
  const [gigsFilter, setGigsFilter] = useState("all"); // all | created | liked
  const [reviewsFilter, setReviewsFilter] = useState("all"); // all | created | liked
  const [savedFilter, setSavedFilter] = useState("gigs"); // gigs | reviews

  useEffect(() => {
    if (profile) {
      console.log("Profile found:", profile);

      console.log("Saved Events:", userSavedEvents);

      // Merge userTickets and userEvents, then find matching events
      const ticketAndEventNames = [
        ...(userTickets || []),
        ...(userEvents || []),
      ]
        .map((item) => item?.eventName || item?.title)
        .filter(Boolean);

      const uniqueEventNames = Array.from(new Set(ticketAndEventNames));

      const matchedEvents = (events || []).filter((event) =>
        uniqueEventNames.includes(event?.title)
      );

      setUserGigGuide(matchedEvents);
    } else {
      console.log("No profile found, clearing gig guide.");
      setUserGigGuide([]);
    }
  }, [profile, userTickets, userEvents, events]);

  return (
    <div>
      {/* Tabs */}
      <div className="tabs">
        <ul className="flex flex-nowrap justify-around overflow-x-auto hide-scrollbar gap-x-4 -mb-px px-4">
          {[
            { key: "events", label: "Gigs" },
            { key: "reviews", label: "Reviews" },
            { key: "saved", label: "Saved" },
          ].map(({ key, label }) => (
            <li key={key}>
              <button
                onClick={() => setActiveTab(key)}
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
              <div className="snap-start flex-shrink-0 w-[100%] p-1">
                {/* Gigs Filter */}
                <div className="flex gap-2 mb-4 justify-center">
                  {[
                    { key: "all", label: "All" },
                    { key: "created", label: "Created" },
                    { key: "liked", label: "Liked" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setGigsFilter(key)}
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
                  events={
                    gigsFilter === "all"
                      ? userGigGuide
                      : gigsFilter === "created"
                      ? userGigGuide.filter((event) => event?.createdBy === uid)
                      : likedEvents
                  }
                  loading={loading}
                  error={error}
                />
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="mt-4">
                {/* Reviews Filter */}
                <div className="flex gap-2 mb-4 justify-center">
                  {[
                    { key: "all", label: "All" },
                    { key: "created", label: "Created" },
                    { key: "liked", label: "Liked" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setReviewsFilter(key)}
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

            {/* Saved Tab */}
            {activeTab === "saved" && (
              <div className="mt-4">
                {/* Show both saved gigs and reviews by default, but allow filtering if a filter is selected */}
                <div className="flex gap-2 mb-4 justify-center">
                  {[
                    { key: "all", label: "All" },
                    { key: "gigs", label: "Gigs" },
                    { key: "reviews", label: "Reviews" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setSavedFilter(key)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        savedFilter === key
                          ? "bg-teal-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-teal-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {(savedFilter === "all" || savedFilter === "gigs") && (
                  <div>
                    {userSavedEvents?.length > 0 ? (
                      <ScrollableEventCol
                        events={userSavedEvents}
                        loading={loading}
                        error={error}
                      />
                    ) : (
                      <p className="text-gray-500 text-center mt-4">
                        No saved gigs yet...
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
                      <p className="text-gray-500 text-center mt-4">
                        No saved reviews yet...
                      </p>
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
}

export default MyProfileTabs;
