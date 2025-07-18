import { useEffect, useMemo, useRef } from "react";
import UserCard from "./UserCard";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProfiles } from "../../store/profileSlice";
import ScrollableEventRow from "./ScrollableEventRow";
import { FaSpinner } from "react-icons/fa";
import LgScrollableEventRow from "./LgScrollableEventRow";
import { useNavigate } from "react-router-dom";

interface EventsTabsProps {
  events: any[];
  loading: boolean;
  error: string | null;
}

const EventsTabs: React.FC<EventsTabsProps> = ({ events, loading, error }) => {
  const getFilteredEvents = () => {
    // Assuming these categories are all just displaying the same events for now
    return events;
  };

  const dispatch = useDispatch<AppDispatch>();

  // Track if we've already attempted to fetch to prevent infinite loops
  const hasFetchedRef = useRef(false);

  const { userList, loading, error } = useSelector(
    (state: RootState) => state.profile
  );

  useEffect(() => {
    // Only fetch once and avoid during errors to prevent infinite loops
    if (!hasFetchedRef.current && !error?.includes("fetch_error")) {
      // fetchAllProfiles now uses cache by default, only fetches if cache is invalid
      dispatch(fetchAllProfiles());
      hasFetchedRef.current = true;
    }
  }, [dispatch, error]);

  // Memoize users with uid to prevent UserCard re-renders
  const usersWithUid = useMemo(() => {
    return (
      userList
        ?.filter((user) => user.roles?.freelancer)
        .map((user) => ({
          ...user,
          uid: user.id,
        })) || []
    );
  }, [userList]);

  const nagivate = useNavigate();

  // Helper to handle See All navigation with tab selection
  const handleSeeAll = (section: string) => {
    let tab = "gigs";
    if (section === "Popular Freelancers") {
      tab = "people";
    }
    nagivate(`/explore?tab=${tab}`);
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <FaSpinner className="text-teal-500 text-4xl animate-spin" />
      </div>
    );

  return (
    <div className="">
      {/* Trending Events Section */}
      <div className="mt-2 w-full p-2 rounded-xl">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-xl text-white font-semibold mb-4">Trending</h2>
          <span
            className="text-teal-500 text-sm hover:underline cursor-pointer"
            onClick={() => handleSeeAll("Trending")}
          >
            See All
          </span>
        </div>

        {/* Scrollable Row */}
        <LgScrollableEventRow
          events={getFilteredEvents()}
          loading={loading}
          error={error}
        />
      </div>

      {/* For You Section */}
      <div className="mt-2 w-full p-2 rounded-xl">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-xl text-white font-semibold mb-4">For You</h2>
          <span
            className="text-teal-500 text-sm hover:underline cursor-pointer"
            onClick={() => handleSeeAll("For You")}
          >
            See All
          </span>
        </div>

        {/* Scrollable Row */}
        <ScrollableEventRow
          events={getFilteredEvents()}
          loading={loading}
          error={error}
        />
      </div>

      {/* Freelancers */}
      <div className="mt-8 px-4 w-full">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-xl text-white font-semibold mb-4">
            Popular Professionals
          </h2>
          <span
            className="text-teal-500 text-sm hover:underline cursor-pointer"
            onClick={() => handleSeeAll("Popular Freelancers")}
          >
            See All
          </span>
        </div>
        <div className="flex flex-row w-full gap-2 overflow-auto scroll-smooth space-x-2 ">
          {usersWithUid.length > 0 ? (
            usersWithUid.map((user) => (
              <div
                key={user.id}
                className="mb-2 w-full transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-95 snap-start flex flex-row"
              >
                <UserCard user={user} />
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center mt-4">No users found.</p>
          )}
        </div>
      </div>

      {/* Events Near You Section */}
      <div className="mt-2 w-full p-2 rounded-xl">
        <div className="flex flex-row justify-between items-center">
          <h2 className="text-xl text-white font-semibold mb-4">
            Gigs Near You
          </h2>
          <span
            className="text-teal-500 text-sm hover:underline cursor-pointer"
            onClick={() => handleSeeAll("Events Near You")}
          >
            See All
          </span>
        </div>

        {/* Scrollable Row */}
        <ScrollableEventRow
          events={getFilteredEvents()}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default EventsTabs;
