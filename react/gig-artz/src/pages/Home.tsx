import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import BottomNav from "../components/BottomNav";
import { fetchAllEvents } from "../store/eventsSlice";
import { RootState } from "../store/store";
import EventsTabs from "../components/EventsTabs";

const Home: React.FC = () => {
  const dispatch = useDispatch();

  const { events, loading, error } = useSelector(
    (state: RootState) => state.events
  );

  useEffect(() => {
    dispatch(fetchAllEvents());
  }, []);

  return (
    <div className="main-content">
     

      {/* Main Content */}
      <div className="flex flex-col justify-evenly">
        <EventsTabs events={events} loading={loading} error={error} />
      </div>

      {/* Bottom Navigation (Only visible on small screens) */}
      <div className="fixed px-2 bottom-0 w-full block md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default Home;
