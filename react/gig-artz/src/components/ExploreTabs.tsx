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
import { eventCategories } from "../constants/EventCategories";
import { freelancers } from "../constants/Filters";
import { categoriesList, genres } from "../constants/Categories";
import AdCard from "./AdCard";
import SwitchToProCard from "./SwitchToProCard";

function ExploreTabs() {
  const dispatch: AppDispatch = useDispatch();
  const { search } = useParams();
  const location = useLocation();

  // State to track active tab
  const [activeTab, setActiveTab] = useState("top");
  // State for search term
  const [searchTerm, setSearchTerm] = useState("");

  // Multi-select filter state
  const [selectedMainCategories, setSelectedMainCategories] = useState<
    string[]
  >([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    []
  );
  const [selectedFreelancers, setSelectedFreelancers] = useState<string[]>([]);

  // Modal state for filters
  const [showFilters, setShowFilters] = useState(false);

  const nagivate = useNavigate();

  // Update searchTerm if search param changes (from EventsTabs)
  useEffect(() => {
    if (search) setSearchTerm(search);
  }, [search]);

  // Optionally, update the input field and filter when the URL changes
  useEffect(() => {
    if (search) setSearchTerm(search);
  }, [search]);

  // Get tab from query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "events" || tab === "people") {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Helper to handle See All navigation with tab selection
  const handleSeeAll = (section: string) => {
    let tab = "events";
    if (section === "Popular Freelancers" || section === "People") {
      tab = "people";
    }
    nagivate(`/explore?tab=${tab}`);
  };

  useEffect(() => {
    dispatch(fetchAllProfiles());
    dispatch(fetchAllEvents());
  }, [dispatch]);

  const { userList, loading, error } = useSelector(
    (state: RootState) => state.profile
  );
  const { events } = useSelector((state: RootState) => state.events);

  const eventList = events || [];

  const [selectedEventCategories, setSelectedEventCategories] = useState([]);

  // Filtered lists based on search term and filters
  const filteredEvents = Array.isArray(eventList)
    ? eventList.filter((event) => {
        const title = event?.title?.toLowerCase() || "";
        const description = event?.description?.toLowerCase() || "";
        const matchesSearch =
          title.includes(searchTerm.toLowerCase()) ||
          description.includes(searchTerm.toLowerCase());
        const matchesMainCategory =
          selectedMainCategories.length === 0 ||
          selectedMainCategories.some((main) => {
            const subs = eventCategories[main] || [];
            return subs.includes(event?.category) || main === event?.category;
          });
        const matchesSubCategory =
          selectedSubCategories.length === 0 ||
          selectedSubCategories.includes(event?.category);
        return matchesSearch && matchesMainCategory && matchesSubCategory;
      })
    : [];
  const filteredUsers = Array.isArray(userList)
    ? userList.filter((user) => {
        const name = user?.name?.toLowerCase() || "";
        const username = user?.userName?.toLowerCase() || "";
        const matchesSearch =
          name.includes(searchTerm.toLowerCase()) ||
          username.includes(searchTerm.toLowerCase());
        // Use genre (string or array) for freelancer type matching
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
          selectedFreelancers.some(
            (f) => user?.roles?.freelancer && userGenres.includes(f)
          );
        return matchesSearch && matchesFreelancer;
      })
    : [];

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
            <div className="modal">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-dark">
                <h2 className="text-lg font-bold text-teal-400 tracking-wide">
                  Filters
                </h2>
                <button
                  className="text-gray-400 hover:text-white text-2xl transition-colors"
                  onClick={() => setShowFilters(false)}
                  aria-label="Close filters"
                >
                  ×
                </button>
              </div>
              {/* Modal Content */}
              <div className="px-6 py-4 flex flex-col gap-4">
                {/* Main Categories */}
                <label className="text-xs text-gray-400 mb-1 font-semibold">
                  Event Categories
                </label>

                <div className="space-y-4 md:max-h-64 max-h-28 overflow-y-auto">
                  {/* show all sub categories */}
                  {Object.entries(eventCategories).map(
                    ([categoryName, items]) => (
                      <div key={categoryName}>
                        <h4 className="text-gray-400 text-sm font-semibold mb-1">
                          {categoryName}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                          {(items as string[]).map((item) => (
                            <label
                              key={item}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedEventCategories.includes(item)}
                                onChange={() => {
                                  setSelectedEventCategories((prev) =>
                                    prev.includes(item)
                                      ? prev.filter((x) => x !== item)
                                      : [...prev, item]
                                  );
                                }}
                                className="accent-teal-500"
                              />
                              <span className="text-gray-200 text-sm">
                                {item}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Subcategories (only show for selected main categories) */}
                {selectedMainCategories.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 font-semibold">
                      Subcategories
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedMainCategories
                        .flatMap((main) => eventCategories[main])
                        .map((sub) => (
                          <label
                            key={sub}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubCategories.includes(sub)}
                              onChange={() => {
                                setSelectedSubCategories((prev) =>
                                  prev.includes(sub)
                                    ? prev.filter((s) => s !== sub)
                                    : [...prev, sub]
                                );
                              }}
                              className="accent-teal-500"
                            />
                            <span className="text-gray-200 text-sm">{sub}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* Freelancers multi-select */}

                <div>
                  <label className="text-xs text-gray-400 mb-1 font-semibold">
                    Professionals
                  </label>

                  {/* show all sub categories */}
                  <div className="space-y-4 md:max-h-64 max-h-28 overflow-y-auto">
                    {categoriesList.map((category) => (
                      <div key={category.id}>
                        <h4 className="text-gray-400 text-sm font-semibold mb-1">
                          {category.name}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                          {category.items.map((item) => (
                            <label
                              key={item.id}
                              className="flex items-center gap-2 cursor-pointer text-nowrap"
                            >
                              <input
                                type="checkbox"
                                checked={selectedFreelancers.includes(
                                  item.name
                                )}
                                onChange={() => {
                                  setSelectedFreelancers((prev) =>
                                    prev.includes(item.name)
                                      ? prev.filter((x) => x !== item.name)
                                      : [...prev, item.name]
                                  );
                                }}
                                className="accent-teal-500"
                              />
                              <span className="text-gray-200 text-sm">
                                {item.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-700 bg-dark rounded-b-2xl">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 font-semibold transition-colors"
                  onClick={() => {
                    setSelectedMainCategories([]);
                    setSelectedSubCategories([]);
                    setSelectedFreelancers([]);
                  }}
                >
                  Clear
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-teal-500 text-white font-bold hover:bg-teal-600 transition-colors"
                  onClick={() => setShowFilters(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
        {/* End Filters Modal */}
      </div>

      <div className="tabs">
        <ul className="flex flex-nowrap justify-between overflow-x-auto hide-scrollbar gap-x-4 -mb-px px-4">
          {[
            { key: "top", label: "Top" },
            { key: "latest", label: "Latest" },
            { key: "events", label: "Events" },
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
                          <UserCard
                            user={{
                              uid: user.id || "", // fallback to empty string if id is missing
                              name: user.name,
                              userName: user.userName,
                              bio: user.bio,
                              profilePicUrl: user.profilePicUrl,
                            }}
                          />
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

            {activeTab === "events" && (
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
