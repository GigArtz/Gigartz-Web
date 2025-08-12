import React from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {

  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
 
  const handleSearch = (event) => {
    event.preventDefault();
    if (search.trim() === "") return;
    navigate(`/explore/${search}`);
    setSearch("");
  };
  
  return (
    <div>
      <div className="relative rounded-lg border-gray-700 bg-[#060512] dark:bg-gray-700">
        <form onSubmit={(event) => handleSearch(event)}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full px-4 py-2 mt-1"
            placeholder="Search..."
          />
          <button type="submit" className="absolute right-0 top-0 mt-2 mr-3">
            <FaSearch className="text-gray-400 mt-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
