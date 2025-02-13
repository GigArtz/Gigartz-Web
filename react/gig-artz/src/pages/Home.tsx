import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import BottomNav from "../components/BottomNav";
import Drawer from "../components/Drawer";
import { fetchAllEvents } from "../store/eventsSlice";
import { RootState } from "../store/store";
import EventsTabs from "../components/EventsTabs";
import SideBar from "../components/SideBar";

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector(
    (state: RootState) => state.events
  );

  

  useEffect(() => {
    dispatch(fetchAllEvents());
  }, [dispatch]);

  return (
    <div className="main-content">
      {/* Sidebar (Hidden on very small screens) */}
     {/*  <div className="  border-gray-700 ">
        <Drawer />
      </div> */}

      {/* Main Content */}
      <div className=" flex flex-col justify-start">
        <EventsTabs events={events} loading={loading} error={error} />
      </div>

     {/*  {/* Side Bar (Hidden on small screens)
      <div className="w-1/4 min-w-60 h-full hidden md:block">
        <SideBar />
      </div> */}

      {/* Bottom Navigation (Only visible on small screens) */}
      <div className="fixed bottom-0 w-full md:block hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default Home;
