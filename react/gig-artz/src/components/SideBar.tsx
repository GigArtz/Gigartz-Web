import React from "react";
import SearchBar from "./SearchBar";
import Subscribe from "./Subscribe";
import SuggestedForYou from "./Suggested";
import SponsoredAds from "./SponsoredAds";
import SwitchToProCard from "./SwitchToProCard";


function SideBar() {
  
  return (
    <div className="items-center justify-center flex-row h-screen pt-4 fixed top-0 md:right-[2%] lg:w-[25%] md:hidden min-h-screen dark:bg-[#060512] shadow-md transition-all duration-300 min-w-60 hidden lg:block">
      {/* Sidebar */}
      <aside className="w-full h-full sticky-top px-4 overflow-y-scroll  hide-scrollbar">
        <div>
          <SearchBar />
        </div>
        <div className="py-2">
          <SponsoredAds />
        </div>
        <div className="py-2">
          <SuggestedForYou />
        </div>
        <div className="py-2">
          <SwitchToProCard />
        </div>
      </aside>
    </div>
  );
}

export default SideBar;
