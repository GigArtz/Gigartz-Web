import React, { useState } from "react";
import EventCard from "./EventCard";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

function WalletTabs({ uid }) {
  // Use RootState for type safety
  const { loading, error, userBookings, userBookingsRequests, userEventProfit } = useSelector(
    (state: RootState) => state.profile
  );

  // State to track active tab
  const [activeTab, setActiveTab] = useState("walletOverview");

  // Bookings data from Redux (same as Bookings page)
  const confirmedBookings = (userBookings || []).map((booking) => ({
    id: booking.id,
    title: booking.eventDetails || "No Title",
    location: booking.venue || "No Venue",
    date:
      booking.date && booking.date.seconds
        ? new Date(booking.date.seconds * 1000).toLocaleDateString()
        : typeof booking.date === "string"
        ? booking.date
        : "N/A",
    guests: booking.additionalInfo || "N/A",
    price: "N/A",
    status: booking.status,
    image:
      typeof booking.image === "string"
        ? booking.image
        : "https://placehold.co/150x150?text=No+Image",
  }));
  const pendingBookings = (userBookingsRequests || []).map((booking) => ({
    id: booking.id,
    title: booking.eventDetails || "No Title",
    location: booking.venue || "No Venue",
    date:
      booking.date && booking.date.seconds
        ? new Date(booking.date.seconds * 1000).toLocaleDateString()
        : typeof booking.date === "string"
        ? booking.date
        : "N/A",
    guests: booking.additionalInfo || "N/A",
    price: "N/A",
    status: booking.status,
    image:
      typeof booking.image === "string"
        ? booking.image
        : "https://placehold.co/150x150?text=No+Image",
  }));

  // Modal state for booking actions
  const [selectedBooking, setSelectedBooking] = useState(null);

  const openModal = (booking) => setSelectedBooking(booking);
  const closeModal = () => setSelectedBooking(null);
  const handleAccept = () => {
    if (selectedBooking) {
      // TODO: Add accept logic here
      console.log(`Accepted booking: ${selectedBooking.title}`);
      closeModal();
    }
  };
  const handleDecline = () => {
    if (selectedBooking) {
      // TODO: Add decline logic here
      console.log(`Declined booking: ${selectedBooking.title}`);
      closeModal();
    }
  };

  // --- New: Demo event revenue data ---
  const eventRevenueData = [
    {
      id: "CnKf8wmJkm96J2dOnYR2",
      vipTicketCount: 2,
      totalPlatformRevenue: 80,
      totalSales: 400,
      eventInfo: {
        eventType: "Public",
        comments: [],
        likes: 0,
        title: "Fall of the stars",
        ticketsAvailable: {
          Vip: {
            price: "200",
            ticketReleaseDate: "2025-02-25T09:15:00.000Z",
            ticketReleaseTime: "2025-02-14T04:25:00.000Z",
            quantity: "50",
          },
        },
        eventStartTime: "2025-02-14T00:08:00.000Z",
        eventEndTime: "2025-02-14T03:08:00.000Z",
        description: "Dance with the stars",
        hostName: "Tshepo",
        venue: "Australia",
        promoterId: "jPzLK6KsU5bxFMSX7HFpBtc1Adz1",
        gallery: [],
        time: "",
        date: "2025-02-28T09:08:00.000Z",
        category: "Jazz",
        artistLineUp: ["DJ eve"],
        tip: false,
        complimentaryTicket: false,
        eventVideo: "",
      },
      totalRevenue: 320,
    },
    {
      id: "EaVX28vBQF45M8ECNp4i",
      totalPlatformRevenue: 70,
      vipTicketCount: 1,
      eventInfo: {
        description: "some text",
        ticketsAvailable: {
          VIP: {
            ticketReleaseDate: "2025-11-02",
            quantity: "20",
            ticketReleaseTime: "04:50",
            price: "350",
          },
          Student: {
            ticketReleaseTime: "10:00",
            price: "100",
            quantity: "20",
            ticketReleaseDate: "2025-03-23",
          },
        },
        likes: 0,
        date: "2025-03-29",
        eventStartTime: "06:00",
        category: "event",
        eventType: "Public",
        venue: "Venue",
        title: "Names",
        gallery: [
          "https://firebasestorage.googleapis.com/v0/b/test-1c2c1.appspot.com/o/eventImages%2F1742619739345_20250317_120138.jpg?alt=media&token=833d753b-c836-42e8-a27a-4a83c54e4d64",
          "https://firebasestorage.googleapis.com/v0/b/test-1c2c1.appspot.com/o/eventImages%2F1742619745445_20250317_120125.jpg?alt=media&token=ea9d4f2a-1ab0-41ec-9da8-a6ee12a78f45",
          "https://firebasestorage.googleapis.com/v0/b/test-1c2c1.appspot.com/o/eventImages%2F1742619752222_20250317_120145.jpg?alt=media&token=c73e58d1-840d-4e69-84b9-7c319d3a6d4e",
        ],
        eventEndTime: "10:00",
        promoterId: "jPzLK6KsU5bxFMSX7HFpBtc1Adz1",
        hostName: "Tshepo",
        tip: false,
        complimentaryTicket: false,
        comments: [],
        artistLineUp: ["james"],
        eventVideo:
          "https://firebasestorage.googleapis.com/v0/b/test-1c2c1.appspot.com/o/eventVideos%2F1742619715440_Screen%20Recording%202025-03-04%20111351.mp4?alt=media&token=f4c74837-7fd5-4293-8df6-01fef4bbe136",
        time: "06:00",
      },
      totalSales: 350,
      totalRevenue: 280,
    },
    {
      id: "aJb8VxdEUM4tvE5HOIdR",
      vipTicketCount: 4,
      totalSales: 800,
      totalRevenue: 640,
      totalPlatformRevenue: 160,
      eventInfo: {
        artistLineUp: ["Dacing DJ"],
        gallery: [],
        category: "Jazz",
        title: "Soul dance",
        tip: false,
        venue: "Kimberley",
        eventStartTime: "2025-02-13T15:24:00.000Z",
        eventType: "Public",
        likes: 0,
        ticketsAvailable: {
          vip: {
            ticketReleaseDate: "2025-02-20T12:03:00.000Z",
            ticketReleaseTime: "2025-02-13T16:03:00.000Z",
            quantity: "10",
            price: "200",
          },
        },
        promoterId: "jPzLK6KsU5bxFMSX7HFpBtc1Adz1",
        date: "2025-02-21T12:00:00.000Z",
        time: "",
        comments: [],
        description: "Dance with the soul",
        eventEndTime: "2025-02-13T15:30:00.000Z",
        hostName: "Tshepo",
        complimentaryTicket: false,
        eventVideo: "",
      },
    },
    {
      id: "cf6TmHu9dt5Fpy0d3bD5",
      eventInfo: {
        ticketsAvailable: {
          VIP: {
            quantity: "50",
            price: "350",
            ticketReleaseDate: "2025-03-22",
            ticketReleaseTime: "09:09",
          },
        },
        venue: "FNB",
        eventEndTime: "23:55",
        artistLineUp: ["Jazziq", "MoMo"],
        comments: [],
        eventVideo: "",
        time: "20:00",
        tip: false,
        description: "Enjoy men sweating 😓 ",
        date: "2025-03-22",
        complimentaryTicket: false,
        eventType: "Public",
        hostName: "Tshepo",
        category: "Sports",
        gallery: [],
        promoterId: "jPzLK6KsU5bxFMSX7HFpBtc1Adz1",
        likes: 1,
        eventStartTime: "20:00",
        title: "Rugby",
      },
      vipTicketCount: 2,
      totalSales: 700,
      totalPlatformRevenue: 140,
      totalRevenue: 560,
    },
    {
      id: "nkWXDH5qh2iJaXii6tx7",
      totalPlatformRevenue: 10,
      eventInfo: {
        artistLineUp: ["Birds"],
        eventType: "Public",
        likes: 0,
        time: "06:00",
        date: "2025-03-25",
        eventEndTime: "06:45",
        title: "Sunrise 🌅 ",
        eventStartTime: "06:00",
        hostName: "Tshepo",
        complimentaryTicket: false,
        description: "Smell the coffee",
        gallery: [],
        eventVideo: "",
        ticketsAvailable: {
          General: {
            quantity: "10",
            ticketReleaseTime: "05:00",
            ticketReleaseDate: "2025-03-23",
            price: "50",
          },
        },
        tip: false,
        category: "Nature",
        promoterId: "jPzLK6KsU5bxFMSX7HFpBtc1Adz1",
        comments: [],
        venue: "Outside",
      },
      totalRevenue: 40,
      generalTicketCount: 1,
      totalSales: 50,
    },
    {
      id: "qmlOev8WBmlZRNDYJphO",
      totalPlatformRevenue: 100,
      totalSales: 500,
      totalRevenue: 400,
      vipTicketCount: 1,
      eventInfo: {
        title: "name",
        description: "nmae",
        hostName: "Tshepo",
        promoterId: "jPzLK6KsU5bxFMSX7HFpBtc1Adz1",
        date: "2025-03-22",
        comments: [],
        venue: "name",
        eventStartTime: "20:48",
        tip: false,
        artistLineUp: ["name"],
        time: "20:48",
        complimentaryTicket: false,
        eventVideo:
          "https://firebasestorage.googleapis.com/v0/b/test-1c2c1.appspot.com/o/eventVideos%2F1742582785106_Screen%20Recording%202025-03-04%20111351.mp4?alt=media&token=526870d8-c705-4892-842f-be51b094979e",
        ticketsAvailable: {
          VIP: {
            price: "500",
            ticketReleaseDate: "2025-03-22",
            ticketReleaseTime: "20:52",
            quantity: "50",
          },
        },
        likes: 0,
        eventEndTime: "01:45",
        eventType: "Public",
        category: "nmae",
        gallery: [
          "https://firebasestorage.googleapis.com/v0/b/test-1c2c1.appspot.com/o/eventImages%2F1742582793418_20250317_120138.jpg?alt=media&token=1b3b3573-ef98-453a-8024-8d488791dbc5",
          "https://firebasestorage.googleapis.com/v0/b/test-1c2c1.appspot.com/o/eventImages%2F1742582799114_20250317_120125.jpg?alt=media&token=922f841e-4d07-4e81-ad79-8d8d672f1ee9",
          "https://firebasestorage.googleapis.com/v0/b/test-1c2c1.appspot.com/o/eventImages%2F1742582805354_20250317_120145.jpg?alt=media&token=feb277b8-3a38-4c34-836a-5a7f26efb152",
        ],
      },
    },
  ];

  return (
    <div className=" rounded-lg shadow-md">
      {/* Tabs */}
      <div className="tabs">
        <ul className="flex flex-nowrap justify-between overflow-x-auto hide-scrollbar gap-x-4 -mb-px px-4">
          {[
            { key: "walletOverview", label: "Overview" },
            { key: "earnings", label: "Earnings" },
            { key: "payouts", label: "Payouts" },
            { key: "bookings", label: "Bookings" },
            // --- New tab for Event Revenue ---
            { key: "eventRevenue", label: "Event Revenue" },
          ].map(({ key, label }) => (
            <li key={key}>
              <button
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-t-lg transition-all duration-200 ${
                  activeTab === key
                    ? " border-teal-500 text-lg text-white bg-teal-900"
                    : "border-transparent hover:text-gray-400 hover:border-gray-400 dark:hover:text-gray-300"
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
                  <p className="text-2xl font-bold mt-2">R {"0" || "00"}</p>
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
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Confirmed Bookings
                  </h3>
                  {confirmedBookings.length > 0 ? (
                    confirmedBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-gray-900 p-4 rounded-lg shadow-md w-full flex items-center gap-4 mb-2 cursor-pointer"
                        onClick={() => openModal(booking)}
                      >
                        <img
                          src={booking.image}
                          alt={booking.title}
                          className="w-16 h-16 rounded-md border-2 border-teal-400"
                        />
                        <div className="flex-grow">
                          <h2 className="text-lg font-semibold text-white line-clamp-1">
                            {booking.title}
                          </h2>
                          <p className="text-sm text-gray-400">
                            {booking.location}
                          </p>
                          <p className="text-xs text-gray-300">
                            {booking.date}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center mt-4">
                      No confirmed bookings.
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                    Pending Bookings
                  </h3>
                  {pendingBookings.length > 0 ? (
                    pendingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-gray-800 p-4 rounded-lg shadow-md w-full flex items-center gap-4 mb-2 cursor-pointer"
                        onClick={() => openModal(booking)}
                      >
                        <img
                          src={booking.image}
                          alt={booking.title}
                          className="w-16 h-16 rounded-md border-2 border-teal-400"
                        />
                        <div className="flex-grow">
                          <h2 className="text-lg font-semibold text-white line-clamp-1">
                            {booking.title}
                          </h2>
                          <p className="text-sm text-gray-400">
                            {booking.location}
                          </p>
                          <p className="text-xs text-gray-300">
                            {booking.date}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center mt-4">
                      No pending bookings.
                    </p>
                  )}
                </div>
                {/* Modal for Booking Details */}
                {selectedBooking && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-900 p-6 rounded-lg w-96 shadow-lg">
                      <h2 className="text-lg font-semibold text-white mb-4">
                        Booking Details
                      </h2>
                      <img
                        src={selectedBooking.image}
                        alt={selectedBooking.title}
                        className="w-full rounded-lg mb-3"
                      />
                      <p className="text-gray-300">
                        <strong>Title:</strong> {selectedBooking.title}
                      </p>
                      <p className="text-gray-300">
                        <strong>Location:</strong> {selectedBooking.location}
                      </p>
                      <p className="text-gray-300">
                        <strong>Date:</strong> {selectedBooking.date}
                      </p>
                      <p className="text-gray-300">
                        <strong>Guests:</strong> {selectedBooking.guests}
                      </p>
                      <p className="text-gray-300">
                        <strong>Status:</strong> {selectedBooking.status}
                      </p>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={closeModal}
                          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                          Close
                        </button>
                        <button
                          onClick={handleDecline}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                          Decline
                        </button>
                        <button
                          onClick={handleAccept}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- New: Event Revenue Tab --- */}
            {activeTab === "eventRevenue" && (
              <div className="text-white space-y-4">
                <h3 className="text-lg font-semibold mb-4">Event Revenue</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-800 rounded-lg">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Event</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Venue</th>
                        <th className="px-4 py-2 text-left">Total Sales</th>
                        <th className="px-4 py-2 text-left">Total Revenue</th>
                        <th className="px-4 py-2 text-left">
                          Platform Revenue
                        </th>
                        <th className="px-4 py-2 text-left">VIP Tickets</th>
                        <th className="px-4 py-2 text-left">Gallery</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userEventProfit?.map((event) => (
                        <tr key={event.id} className="border-b border-gray-700">
                          <td className="px-4 py-2">
                            {event.eventInfo?.title || "-"}
                          </td>
                          <td className="px-4 py-2">
                            {event.eventInfo?.date
                              ? new Date(
                                  event.eventInfo.date
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-2">
                            {event.eventInfo?.venue || "-"}
                          </td>
                          <td className="px-4 py-2">
                            {event.totalSales || "-"}
                          </td>
                          <td className="px-4 py-2">
                            {event.totalRevenue || "-"}
                          </td>
                          <td className="px-4 py-2">
                            {event.totalPlatformRevenue || "-"}
                          </td>
                          <td className="px-4 py-2">
                            {event.vipTicketCount ||
                              event.generalTicketCount ||
                              "-"}
                          </td>
                          <td className="px-4 py-2">
                            {event.eventInfo?.gallery &&
                            event.eventInfo.gallery.length > 0 ? (
                              <div className="flex gap-1">
                                {event.eventInfo.gallery
                                  .slice(0, 2)
                                  .map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt="gallery"
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default WalletTabs;
