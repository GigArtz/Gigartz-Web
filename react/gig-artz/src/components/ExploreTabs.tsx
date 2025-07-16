import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProfiles } from "../../store/profileSlice";
import UserCard from "./UserCard";
import { AppDispatch, RootState } from "../../store/store";
import { fetchAllEvents } from "../../store/eventsSlice";
import { FaFilter, FaSearch, FaSpinner } from "react-icons/fa";
import ScrollableEventRow from "./ScrollableEventRow";
import LgScrollableEventRow from "./LgScrollableEventRow";
import ScrollableEventCol from "./ScrollableEventCol";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  eventCategories,
  freelancerCategories,
} from "../constants/EventCategories";
import SwitchToProCard from "./SwitchToProCard";
import PreferencesModal from "./PreferencesModal";

function ExploreTabs() {
  const dispatch: AppDispatch = useDispatch();
  const { search } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab and search state
  const [activeTab, setActiveTab] = useState("top");
  const [searchTerm, setSearchTerm] = useState("");

  // Unified filter state
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Modal visibility state
  const [showFilters, setShowFilters] = useState(false);

  // Infinite scroll state for all tabs
  const [tabPages, setTabPages] = useState({
    top: 1,
    latest: 1,
    gigs: 1,
    people: 1,
  });
  const [tabLoadingMore, setTabLoadingMore] = useState({
    top: false,
    latest: false,
    gigs: false,
    people: false,
  });
  const itemsPerPage = 10;

  // Derived filters from interests
  const selectedEventCategories = selectedInterests.filter((interest) =>
    Object.values(eventCategories).flat().includes(interest)
  );
  const selectedFreelancers = selectedInterests.filter((interest) =>
    Object.values(freelancerCategories).flat().includes(interest)
  );

  // Dummy user preferences for demonstration
  const userPreferences = {
    interests: ["music", "art", "technology", "sports", "gaming", "fashion"],
    locations: ["New York", "Los Angeles"],
  };

  // Handle search term from route
  useEffect(() => {
    if (search) setSearchTerm(search);
  }, [search]);

  // Handle tab query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "events" || tab === "people") {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Load data
  useEffect(() => {
    // fetchAllProfiles now uses cache by default, only fetches if cache is invalid
    dispatch(fetchAllProfiles());
    dispatch(fetchAllEvents());
  }, [dispatch]);

  // Redux state
  const { userList, loading, error } = useSelector(
    (state: RootState) => state.profile
  );
  const { events } = useSelector((state: RootState) => state.events);
  const eventList = events || [];

  // Filtered Events
  const filteredEvents = Array.isArray(eventList)
    ? eventList.filter((event) => {
        const title = event?.title?.toLowerCase() || "";
        const description = event?.description?.toLowerCase() || "";
        const matchesSearch =
          title.includes(searchTerm.toLowerCase()) ||
          description.includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedEventCategories.length === 0 ||
          selectedEventCategories.includes(event?.category);

        return matchesSearch && matchesCategory;
      })
    : [];

  // Filtered Freelancers
  const filteredUsers = Array.isArray(userList)
    ? userList.filter((user) => {
        const name = user?.name?.toLowerCase() || "";
        const username = user?.userName?.toLowerCase() || "";
        const matchesSearch =
          name.includes(searchTerm.toLowerCase()) ||
          username.includes(searchTerm.toLowerCase());

        const userGenres = Array.isArray(user?.genre)
          ? user.genre.map((g) =>
              typeof g === "string"
                ? g
                : g && typeof g.name === "string"
                ? g.name
                : ""
            )
          : typeof user?.genre === "string"
          ? [user.genre]
          : [];

        const matchesFreelancer =
          selectedFreelancers.length === 0 ||
          selectedFreelancers.some((f) =>
            user?.roles?.freelancer ? userGenres.includes(f) : false
          );

        return matchesSearch && matchesFreelancer;
      })
    : [];

  // Navigate on "See All"
  const handleSeeAll = (section: string) => {
    let tab = "gigs";
    if (section === "Popular Freelancers" || section === "People") {
      tab = "people";
    }
    navigate(`/explore?tab=${tab}`);
  };

  // Infinite scroll handler for all tabs
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 &&
        !tabLoadingMore[activeTab]
      ) {
        setTabLoadingMore((prev) => ({ ...prev, [activeTab]: true }));
        setTimeout(() => {
          setTabPages((prev) => ({
            ...prev,
            [activeTab]: prev[activeTab] + 1,
          }));
          setTabLoadingMore((prev) => ({ ...prev, [activeTab]: false }));
        }, 500);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab, tabLoadingMore]);

  // Sectioned event/user lists for each tab
  const getSectionedData = (tab) => {
    const page = tabPages[tab] || 1;
    if (tab === "gigs") {
      return {
        trendingEvents: filteredEvents.slice(0, page * itemsPerPage),
        forYouEvents: filteredEvents
          .filter((e) =>
            userPreferences.interests.some((i) =>
              e.category?.toLowerCase().includes(i.toLowerCase())
            )
          )
          .slice(0, page * itemsPerPage),
        // Gigs Near You: events where city matches any preferred location
        gigsNearYou: filteredEvents
          .filter((e) =>
            userPreferences.locations.some((loc) =>
              (e.city || "").toLowerCase().includes(loc.toLowerCase())
            )
          )
          .slice(0, page * itemsPerPage),
        preferenceEvents: filteredEvents
          .filter((e) =>
            selectedInterests.length === 0
              ? false
              : selectedInterests.some((i) =>
                  e.category?.toLowerCase().includes(i.toLowerCase())
                )
          )
          .slice(0, page * itemsPerPage),
        interestSections: userPreferences.interests.map((interest) => ({
          interest,
          events: filteredEvents
            .filter((e) =>
              e.category?.toLowerCase().includes(interest.toLowerCase())
            )
            .slice(0, page * itemsPerPage),
        })),
        // Gigs in [Location] sections
        locationSections: userPreferences.locations.map((loc) => ({
          loc,
          events: filteredEvents
            .filter((e) =>
              (e.city || "").toLowerCase().includes(loc.toLowerCase())
            )
            .slice(0, page * itemsPerPage),
        })),
        professionals: filteredUsers.slice(0, page * itemsPerPage),
      };
    } else if (tab === "top" || tab === "latest") {
      return {
        trendingEvents: filteredEvents.slice(0, page * itemsPerPage),
        forYouEvents: filteredEvents
          .filter((e) =>
            userPreferences.interests.some((i) =>
              e.category?.toLowerCase().includes(i.toLowerCase())
            )
          )
          .slice(0, page * itemsPerPage),
        interestSections: userPreferences.interests.map((interest) => ({
          interest,
          events: filteredEvents
            .filter((e) =>
              e.category?.toLowerCase().includes(interest.toLowerCase())
            )
            .slice(0, page * itemsPerPage),
        })),
        // Gigs in [Location] sections
        locationSections: userPreferences.locations.map((loc) => ({
          loc,
          events: filteredEvents
            .filter((e) =>
              (e.city || "").toLowerCase().includes(loc.toLowerCase())
            )
            .slice(0, page * itemsPerPage),
        })),
        professionals: filteredUsers.slice(0, page * itemsPerPage),
      };
    } else if (tab === "people") {
      return {
        professionals: filteredUsers.slice(0, page * itemsPerPage),
        interestSections: userPreferences.interests.map((interest) => ({
          interest,
          users: filteredUsers
            .filter((user) => {
              const userGenres = Array.isArray(user?.genre)
                ? user.genre.map((g) =>
                    typeof g === "string" ? g : g?.name || ""
                  )
                : typeof user?.genre === "string"
                ? [user.genre]
                : [];
              return userGenres.some((g) =>
                g.toLowerCase().includes(interest.toLowerCase())
              );
            })
            .slice(0, page * itemsPerPage),
        })),
        locationSections: [],
      };
    }
    return {};
  };

  const gigsData = getSectionedData("gigs");
  const topData = getSectionedData("top");
  const latestData = getSectionedData("latest");
  const peopleData = getSectionedData("people");

  // Helper to ensure UserCard gets a uid
  const safeUser = (user) => ({
    ...user,
    uid: user.uid || user.id || "unknown",
  });

  return (
    <div className="px-2">
      <div className="my-2">
        <div className="relative rounded-lg border border-gray-700 bg-[#060512] dark:bg-gray-700">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchTerm.trim() !== "") {
                window.history.replaceState(
                  null,
                  "",
                  `/explore/${encodeURIComponent(searchTerm)}`
                );
              }
            }}
          >
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-[#060512] text-gray-900 dark:text-gray-100 focus:outline-none"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="button-group flex gap-3">
              <button className="absolute right-5 top-0 mt-2 mr-3">
                <FaSearch className="absolute right-2 top-1 text-gray-400" />
              </button>
              <button
                type="button"
                className="absolute right-0 top-0 mt-2 mr-3"
                onClick={() => setShowFilters(true)}
              >
                <FaFilter className="absolute right-2 top-1 text-gray-400" />
              </button>
            </div>
          </form>
        </div>

        {/* Filters Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <PreferencesModal
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              selectedInterests={selectedInterests}
              setSelectedInterests={setSelectedInterests}
              selectedLocations={selectedLocations}
              setSelectedLocations={setSelectedLocations}
              title={"Select Your Filters"}
            />
          </div>
        )}

        {/* End Filters Modal */}
      </div>

      <div className="tabs">
        <ul className="flex flex-nowrap justify-between overflow-x-auto hide-scrollbar gap-x-4 -mb-px px-4">
          {[
            { key: "top", label: "Top" },
            { key: "latest", label: "Latest" },
            { key: "gigs", label: "Promoted" },
            { key: "people", label: "People" },
          ].map(({ key, label }) => (
            <li key={key}>
              <button
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-t-lg transition-all duration-200 ${
                  activeTab === key
                    ? " border-teal-500 text-lg text-white bg-teal-900"
                    : "border-transparent hover:text-gray-400 hover:border-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="py-4">
        {loading && (
          <div className="flex mt-8 justify-center items-center">
            <FaSpinner className="text-teal-500 text-4xl animate-spin" />
          </div>
        )}

        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <>
            {activeTab === "top" && (
              <div className="flex flex-col gap-6">
                {/* Trending */}
                <div className="w-full p-2 rounded-xl">
                  <h2 className="text-white text-lg font-semibold mb-2">
                    Trending
                  </h2>
                  <ScrollableEventRow
                    events={topData.trendingEvents}
                    loading={loading}
                    error={error}
                  />
                </div>
                {/* For You */}
                <div className="w-full p-2 rounded-xl">
                  <h2 className="text-white text-lg font-semibold mb-2">
                    For You
                  </h2>
                  <ScrollableEventRow
                    events={topData.forYouEvents}
                    loading={loading}
                    error={error}
                  />
                </div>

                {/* Popular Professionals */}
                <div className="w-full p-2 rounded-xl">
                  <h2 className="text-white text-lg font-semibold mb-2">
                    Popular Professionals
                  </h2>
                  <div className="flex flex-col gap-2 md:grid md:grid-cols-1 overflow-auto">
                    {topData.professionals.map((user) => (
                      <div className="mb-2" key={user.id}>
                        <UserCard user={safeUser(user)} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Dynamic interest sections for events */}
                {(
                  topData.interestSections as {
                    interest: string;
                    events: any[];
                  }[]
                ).map(({ interest, events }) =>
                  events.length > 0 ? (
                    <div className="w-full p-2 rounded-xl" key={interest}>
                      <h2 className="text-white text-lg font-semibold mb-2">
                        {interest.charAt(0).toUpperCase() + interest.slice(1)}
                      </h2>
                      <ScrollableEventRow
                        events={events}
                        loading={loading}
                        error={error}
                      />
                    </div>
                  ) : null
                )}
                {/* Dynamic location sections for events */}
                {(
                  topData.locationSections as { loc: string; events: any[] }[]
                ).map(({ loc, events }) =>
                  events.length > 0 ? (
                    <div className="w-full p-2 rounded-xl" key={loc}>
                      <h2 className="text-white text-lg font-semibold mb-2">
                        Gigs in {loc}
                      </h2>
                      <ScrollableEventRow
                        events={events}
                        loading={loading}
                        error={error}
                      />
                    </div>
                  ) : null
                )}
                {tabLoadingMore.top && (
                  <div className="flex justify-center items-center py-4">
                    <FaSpinner className="text-teal-500 text-2xl animate-spin" />
                  </div>
                )}
              </div>
            )}

            {activeTab === "latest" && (
              <div className="flex flex-col gap-6">
                {/* Trending */}
                <div className="w-full p-2 rounded-xl">
                  <h2 className="text-white text-lg font-semibold mb-2">
                    Trending
                  </h2>
                  <ScrollableEventRow
                    events={latestData.trendingEvents}
                    loading={loading}
                    error={error}
                  />
                </div>
                {/* For You */}
                <div className="w-full p-2 rounded-xl">
                  <h2 className="text-white text-lg font-semibold mb-2">
                    For You
                  </h2>
                  <ScrollableEventRow
                    events={latestData.forYouEvents}
                    loading={loading}
                    error={error}
                  />
                </div>
                {/* Popular Professionals */}
                <div className="w-full p-2 rounded-xl">
                  <h2 className="text-white text-lg font-semibold mb-2">
                    Popular Professionals
                  </h2>
                  <div className="flex flex-col gap-2 md:grid md:grid-cols-1 overflow-auto">
                    {latestData.professionals.map((user) => (
                      <div className="mb-2" key={user.id}>
                        <UserCard user={safeUser(user)} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Dynamic interest sections for events */}
                {(
                  latestData.interestSections as {
                    interest: string;
                    events: any[];
                  }[]
                ).map(({ interest, events }) =>
                  events.length > 0 ? (
                    <div className="w-full p-2 rounded-xl" key={interest}>
                      <h2 className="text-white text-lg font-semibold mb-2">
                        {interest.charAt(0).toUpperCase() + interest.slice(1)}
                      </h2>
                      <ScrollableEventRow
                        events={events}
                        loading={loading}
                        error={error}
                      />
                    </div>
                  ) : null
                )}
                {/* Dynamic location sections for events */}
                {(
                  latestData.locationSections as {
                    loc: string;
                    events: any[];
                  }[]
                ).map(({ loc, events }) =>
                  events.length > 0 ? (
                    <div className="w-full p-2 rounded-xl" key={loc}>
                      <h2 className="text-white text-lg font-semibold mb-2">
                        Gigs in {loc}
                      </h2>
                      <ScrollableEventRow
                        events={events}
                        loading={loading}
                        error={error}
                      />
                    </div>
                  ) : null
                )}
                {tabLoadingMore.latest && (
                  <div className="flex justify-center items-center py-4">
                    <FaSpinner className="text-teal-500 text-2xl animate-spin" />
                  </div>
                )}
              </div>
            )}

            {activeTab === "people" && (
              <div className="flex flex-col gap-6">
                {/* Popular Professionals */}
                <div className="w-full p-2 rounded-xl">
                  <h2 className="text-white text-lg font-semibold mb-2">
                    Popular Professionals
                  </h2>
                  <div className="flex flex-col gap-2 md:grid md:grid-cols-1 overflow-auto">
                    {peopleData.professionals.map((user) => (
                      <div className="mb-2" key={user.id}>
                        <UserCard user={safeUser(user)} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Dynamic interest sections for users */}
                {(
                  peopleData.interestSections as {
                    interest: string;
                    users: any[];
                  }[]
                ).map(({ interest, users }) =>
                  users.length > 0 ? (
                    <div className="w-full p-2 rounded-xl" key={interest}>
                      <h2 className="text-white text-lg font-semibold mb-2">
                        {interest.charAt(0).toUpperCase() + interest.slice(1)}{" "}
                        Professionals
                      </h2>
                      <div className="flex flex-col gap-2 md:grid md:grid-cols-1 overflow-auto">
                        {users.map((user) => (
                          <div className="mb-2" key={user.id}>
                            <UserCard user={safeUser(user)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
                {tabLoadingMore.people && (
                  <div className="flex justify-center items-center py-4">
                    <FaSpinner className="text-teal-500 text-2xl animate-spin" />
                  </div>
                )}
              </div>
            )}

            {activeTab === "gigs" && (
              <div className="flex flex-col gap-6">
                {/* Trending */}
                <div className="w-full p-2 rounded-xl">
                  <h2 className="text-white text-lg font-semibold mb-2">
                    Trending
                  </h2>
                  <ScrollableEventRow
                    events={gigsData.trendingEvents}
                    loading={loading}
                    error={error}
                  />
                </div>
                {/* For You */}
                <div className="w-full p-2 rounded-xl">
                  <h2 className="text-white text-lg font-semibold mb-2">
                    For You
                  </h2>
                  <ScrollableEventRow
                    events={gigsData.forYouEvents}
                    loading={loading}
                    error={error}
                  />
                </div>
                {/* Popular Professionals */}
                <div className="w-full p-2 rounded-xl">
                  <h2 className="text-white text-lg font-semibold mb-2">
                    Popular Professionals
                  </h2>
                  <div className="flex flex-col gap-2 md:grid md:grid-cols-1 overflow-auto">
                    {gigsData.professionals.map((user) => (
                      <div className="mb-2" key={user.id}>
                        <UserCard user={safeUser(user)} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Gigs Near You */}
                <div className="w-full p-2 rounded-xl">
                  <h2 className="text-white text-lg font-semibold mb-2">
                    Gigs Near You
                  </h2>
                  <ScrollableEventRow
                    events={gigsData.gigsNearYou}
                    loading={loading}
                    error={error}
                  />
                </div>
                {/* Based on your preference */}
                <div className="w-full p-2 rounded-xl">
                  <h2 className="text-white text-lg font-semibold mb-2">
                    Based on your preference
                  </h2>
                  <ScrollableEventRow
                    events={gigsData.preferenceEvents}
                    loading={loading}
                    error={error}
                  />
                </div>
                {/* Dynamic interest sections for events */}
                {(
                  gigsData.interestSections as {
                    interest: string;
                    events: any[];
                  }[]
                ).map(({ interest, events }) =>
                  events.length > 0 ? (
                    <div className="w-full p-2 rounded-xl" key={interest}>
                      <h2 className="text-white text-lg font-semibold mb-2">
                        {interest.charAt(0).toUpperCase() + interest.slice(1)}
                      </h2>
                      <ScrollableEventRow
                        events={events}
                        loading={loading}
                        error={error}
                      />
                    </div>
                  ) : null
                )}
                {/* Dynamic location sections for events */}
                {(
                  gigsData.locationSections as { loc: string; events: any[] }[]
                ).map(({ loc, events }) =>
                  events.length > 0 ? (
                    <div className="w-full p-2 rounded-xl" key={loc}>
                      <h2 className="text-white text-lg font-semibold mb-2">
                        Gigs in {loc}
                      </h2>
                      <ScrollableEventRow
                        events={events}
                        loading={loading}
                        error={error}
                      />
                    </div>
                  ) : null
                )}
                {tabLoadingMore.gigs && (
                  <div className="flex justify-center items-center py-4">
                    <FaSpinner className="text-teal-500 text-2xl animate-spin" />
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

export default ExploreTabs;
