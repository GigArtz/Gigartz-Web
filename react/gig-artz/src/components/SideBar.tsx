import React from "react";
import SearchBar from "./SearchBar";
import Subscribe from "./Subscribe";
import WhatsHappening from "./WhatsHappening";

function SideBar() {
  
  return (
    <div className="items-center justify-center flex-row h-screen pt-4 fixed top-0 right-0 w-16 md:w-80 min-h-screen border bg-white dark:bg-[#060512] shadow-md transition-all duration-300 min-w-60 hidden md:block">
      {/* Sidebar */}
      <aside className="w-full h-full sticky-top px-4">
        <div>
          <SearchBar />
        </div>
        <div className="py-2">
          <Subscribe />
        </div>
        <div className="py-">
          <WhatsHappening />
        </div>
      </aside>
    </div>
  );
}

export default SideBar;
