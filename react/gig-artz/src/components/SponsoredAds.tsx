import React from "react";

export default function SponsoredAds() {
  const Ads = [
    {
      title: "Promote Your Event!",
      description:
        "Get your event in front of thousands of users. Contact us to advertise here.",
      cta: "Advertise Now",
      image: null,
      type: "primary",
    },
    {
      title: "Brand Awareness",
      description: "Boost your brand visibility with a sponsored ad.",
      cta: "Learn More",
      image: null,
      type: "secondary",
    },
  ];

  return (
    <div>
      {/* WhatsHappening Section */}
      <section className="bg-dark py-2 rounded-lg border border-gray-700">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-2">
            <h3 className="text-lg font-bold text-gray-100">Sponsored Ads</h3>
            {/* Sponsored Ads Cards */}
            <div className="flex flex-col space-y-3 mt-4">
              {Ads.map((ad, index) =>
                ad.type === "primary" ? (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-teal-700 to-blue-800 rounded-xl p-4 flex items-center justify-between border border-teal-500 shadow-md"
                  >
                    <div>
                      <div className="text-white font-semibold text-base mb-1">
                        {ad.title}
                      </div>
                      <div className="text-gray-300 text-xs mb-2">
                        {ad.description}
                      </div>
                      <button className="bg-white text-teal-700 font-bold px-3 py-1 rounded-full text-xs hover:bg-teal-100 transition">
                        {ad.cta}
                      </button>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white opacity-70"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-xl p-4 flex items-center border border-gray-600 shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="text-teal-300 font-semibold text-base mb-1">
                        {ad.title}
                      </div>
                      <div className="text-gray-400 text-xs mb-2">
                        {ad.description}
                      </div>
                      <button className="bg-teal-700 text-white font-bold px-3 py-1 rounded-full text-xs hover:bg-teal-800 transition">
                        {ad.cta}
                      </button>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-12 h-12 bg-teal-900/30 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-teal-300 opacity-80"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 12h8"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
