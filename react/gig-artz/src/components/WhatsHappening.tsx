import React from "react";
import { FaEllipsisH } from "react-icons/fa";

export default function WhatsHappening() {
  const Trending = [
    {
      location: "Trending in South Africa",
      title: "Lady M",
      numbers: "10.7K posts",
    },
    {
      title: "#IsencaneLengane",
      posts: "1,868 posts",
      category: "Entertainment",
      trendingStatus: "Trending",
    },
    {
      title: "#BBMzanzi",
      posts: "4,612 posts",
      trendingStatus: "Trending in South Africa",
      location: "Lesotho",
    },
    {
      title: "Lesotho",
      posts: "3,065 posts",
      trendingStatus: "Trending",
    },
  ];

  return (
    <div>
      {/* WhatsHappening Section */}
      <section className="bg-gray-100 dark:bg-[#060512] py-2 rounded-lg border border-gray-700">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              What's Happening
            </h2>
            {/* Trending cards */}
            <div className="flex flex-col space-y-1 mt-4">
              {Trending.map((trend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-200 dark:bg-[#060512] py-2 rounded-lg"
                >
                  <div>
                    <h3 className="text-gray-900 dark:text-gray-100 font-medium text-sm">
                      {trend.location || "Trending"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {trend.title}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {trend.numbers || trend.posts}
                    </p>
                  </div>
                  <button className="text-blue-500 dark:text-blue-400 font-medium">
                    <FaEllipsisH />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
