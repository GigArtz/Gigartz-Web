import React, { useEffect, useState } from "react";
import UserCard from "./UserCard";
import { useSelector } from "react-redux";
import { FaSpinner } from "react-icons/fa";

export default function SuggestedForYou() {
  const [cachedUserList, setCachedUserList] = useState([]);
  const { userList, loading, error } = useSelector(
    (state: any) => state.profile
  );

  useEffect(() => {
    if (userList?.length > 0) {
      setCachedUserList(userList);
    }
  }, [userList]);

  const suggestedUsers = cachedUserList?.slice(0, 5);

  const isLoading = loading === "pending";
  const isError = error !== null;
  const isEmpty = cachedUserList?.length === 0;
  const isSuccess = !isLoading && !isEmpty; // Allow rendering even if there is an error

  useEffect(() => {
    console.log("Redux userList:", userList);
    console.log(
      "isSuccess:",
      isSuccess,
      "isLoading:",
      isLoading,
      "isError:",
      isError
    );
  }, [userList, isSuccess, isLoading, isError]);

  useEffect(() => {
    console.log("Cached User List:", cachedUserList);
    console.log("Suggested Users:", suggestedUsers);
    console.log("isSuccess State:", isSuccess);
  }, [cachedUserList, suggestedUsers, isSuccess]);

  if (!isSuccess || isLoading) {
    return null; // or some fallback UI
  }

  return (
    <div>
      {/* WhatsHappening Section */}
      <section className="bg-dark py-2 rounded-lg border border-gray-700 ">
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
                  <div key={index} className="">
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
