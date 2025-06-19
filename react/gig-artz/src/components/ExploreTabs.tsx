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
import { eventCategories, freelancerCategories } from "../constants/EventCategories";
import AdCard from "./AdCard";
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

  // Derived filters from interests
  const selectedEventCategories = selectedInterests.filter((interest) =>
    Object.values(eventCategories).flat().includes(interest)
  );
  const selectedFreelancers = selectedInterests.filter((interest) =>
    Object.values(freelancerCategories).flat().includes(interest)
  );

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
            { key: "gigs", label: "Gigs" },
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
              <>
                <div className="mt-2 w-full p-2 rounded-xl">
                  {/* Scrollable Row */}
                  <LgScrollableEventRow
                    events={filteredEvents}
                    loading={loading}
                    error={error}
                  />
                </div>

                <div className="mt-2 w-full p-2 rounded-xl">
                  <div className="flex flex-row justify-between items-center">
                    <h2 className="text-xl text-white font-semibold mb-4">
                      Trending
                    </h2>
                    <span
                      onClick={() => handleSeeAll("trending")}
                      className="text-teal-500 text-sm hover:underline cursor-pointer"
                    >
                      See All
                    </span>
                  </div>
                  <ScrollableEventRow
                    events={filteredEvents}
                    loading={loading}
                    error={error}
                  />
                </div>

                <div className="mt-2 w-full p-2 rounded-xl">
                  <div className="flex flex-row justify-between items-center">
                    <h2 className="text-xl text-white font-semibold mb-4">
                      People
                    </h2>
                    <span
                      onClick={() => handleSeeAll("People")}
                      className="text-teal-500 text-sm hover:underline cursor-pointer"
                    >
                      See All
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 md:grid md:grid-cols-2 overflow-auto">
                    {filteredUsers?.length > 0 ? (
                      filteredUsers?.map((user) => (
                        <div className="mb-2" key={user.id}>
                          <UserCard user={user} />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center mt-4">
                        No users found.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === "people" && (
              <div className="flex flex-col gap-2 md:grid md:grid-cols-2 overflow-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <React.Fragment key={user.id}>
                      <div className="mb-2">
                        <UserCard
                          user={{
                            uid: user.id || "",
                            name: user.name,
                            userName: user.userName,
                            bio: user.bio,
                            profilePicUrl: user.profilePicUrl,
                          }}
                        />
                      </div>

                      {(index + 1) % 8 === 0 && (
                        <div className="mb-4">
                          <SwitchToProCard />
                        </div>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <p className="text-gray-400 text-center mt-4">
                    No users found.
                  </p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <p className="text-gray-500 text-center mt-4">No reviews yet.</p>
            )}

            {activeTab === "gigs" && (
              <div className="mt-2 w-full p-2 rounded-xl">
                <ScrollableEventCol
                  events={filteredEvents}
                  loading={loading}
                  error={error}
                />
              </div>
            )}

            {activeTab === "latest" && (
              <div className="mt-2 w-full p-2 rounded-xl">
                <ScrollableEventCol
                  events={filteredEvents}
                  loading={loading}
                  error={error}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ExploreTabs;
