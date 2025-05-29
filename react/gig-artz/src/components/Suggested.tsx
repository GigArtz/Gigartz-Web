import React, { useEffect } from "react";
import UserCard from "./UserCard";
import { useSelector } from "react-redux";
import { FaSpinner } from "react-icons/fa";


export default function SuggestedForYou() {
  
  const { userList, loading, error } = useSelector(
    (state: any) => state.profile
  );


  const suggestedUsers = userList?.slice(0, 5);

  const isLoading = loading === "pending";
  const isError = error !== null;
  const isEmpty = userList?.length === 0;
  const isSuccess = !isLoading && !isError && !isEmpty;

  
  if (!isSuccess) {
    return null; // or some fallback UI
  }

  return (
    <div>
      {/* WhatsHappening Section */}
      <section className="bg-dark py-2 rounded-lg border border-gray-700">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-2">
            <h2 className="text-lg font-bold text-gray-100">
              Suggested For You
            </h2>
            {/* Trending cards */}

            {loading ? (
              <div className="flex items-center justify-center h-full">
                <FaSpinner className="text-teal-500 text-2xl animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col space-y-1 mt-4 fade">
                {suggestedUsers?.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-dark py-2 "
                  >
                    <UserCard user={user} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
