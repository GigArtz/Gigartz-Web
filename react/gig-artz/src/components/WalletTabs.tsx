import React, { useState } from "react";
import EventCard from "./EventCard";
import { useSelector } from "react-redux";

function WalletTabs({ uid }) {
  const { loading, error } = useSelector((state) => state.profile);
  const events = useSelector((state) => state.events);

  const userEvents = events?.events.filter((event) => event.promoterId === uid);

  // State to track active tab
  const [activeTab, setActiveTab] = useState("walletOverview");

  return (
    <div className=" rounded-lg shadow-md">
      {/* Tabs */}
      <div className="text-sm font-medium text-center border-b text-gray-400 border-gray-700">
        <ul className="flex flex-wrap justify-between -mb-px">
          {[
            { key: "walletOverview", label: "Overview" },
            { key: "earnings", label: "Earnings" },
            { key: "payouts", label: "Payouts" },
            { key: "bookings", label: "Bookings" },
          ].map(({ key, label }) => (
            <li key={key} className="me-2">
              <button
                onClick={() => setActiveTab(key)}
                className={`inline-block p-4 border-b-2 rounded-t-lg transition ${
                  activeTab === key
                    ? "text-blue-500 border-blue-500"
                    : "border-transparent hover:text-gray-300 hover:border-gray-600"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Spinner */}
        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin h-7 w-7 border-4 border-teal-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <>
            {/* Wallet Overview */}
            {activeTab === "walletOverview" && (
              <div className="text-white space-y-4">
                <div className="bg-gray-800 p-4 rounded-md">
                  <h3 className="text-lg font-semibold">Wallet Balance</h3>
                  <p className="text-2xl font-bold mt-2">R 2,340.50</p>
                  <button className="mt-3 w-36 btn-primary rounded-3xl">
                    Withdraw Funds
                  </button>
                </div>

                {/* Recent Transactions */}
                <div className="bg-gray-800 p-4 rounded-md">
                  <h3 className="text-lg font-semibold">Recent Transactions</h3>
                  <ul className="mt-2 space-y-2">
                    {[
                      { id: 1, type: "Event Earnings", amount: "R450.00" },
                      { id: 2, type: "Tips", amount: "R20.00" },
                      { id: 3, type: "Booking Fee", amount: "R75.00" },
                    ].map((txn) => (
                      <li
                        key={txn.id}
                        className="flex justify-between text-gray-300"
                      >
                        <span>{txn.type}</span>
                        <span className="text-teal-400">{txn.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Earnings */}
            {activeTab === "earnings" && (
              <div className="text-white space-y-4">
                <h3 className="text-lg font-semibold">Earnings Breakdown</h3>
                <ul className="space-y-2">
                  {[
                    { label: "Event Revenue", amount: "R1,200.00" },
                    { label: "Tips Received", amount: "R320.00" },
                    { label: "Booking Fees", amount: "R820.00" },
                  ].map((earning) => (
                    <li
                      key={earning.label}
                      className="flex justify-between text-gray-300"
                    >
                      <span>{earning.label}</span>
                      <span className="text-teal-400">{earning.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Payout Requests */}
            {activeTab === "payouts" && (
              <div className="text-white space-y-4">
                <h3 className="text-lg font-semibold">Payout Requests</h3>
                <p className="text-gray-400">No pending payout requests.</p>
                <button className="w-36 btn-primary rounded-3xl">
                  Request Payout
                </button>
              </div>
            )}

            {/* Bookings */}
            {activeTab === "bookings" && (
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-white">
                  Event Bookings
                </h3>
                {userEvents.length > 0 ? (
                  userEvents.map((event) => (
                    <EventCard key={event.id} event={event} cardSize="md" />
                  ))
                ) : (
                  <p className="text-gray-400 text-center mt-4">
                    No bookings found.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default WalletTabs;
