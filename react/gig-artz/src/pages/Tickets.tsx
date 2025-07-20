import { fetchAUserProfile } from "../../store/profileSlice";
import {
  reassignTicket,
  resaleTicket,
  refundTicket,
} from "../../store/eventsSlice";
import Header from "../components/Header";
import BaseModal from "../components/BaseModal";
import React, { useEffect, useState } from "react";
import {
  FaEllipsisV,
  FaEye,
  FaExchangeAlt,
  FaDollarSign,
  FaTag,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
// Use RootState for type safety
import type { RootState } from "../../store/store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Tickets() {
  const [modalType, setModalType] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [email, setEmail] = useState(""); // Add this line
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    routingNumber: "",
  });
  const [resalePrice, setResalePrice] = useState(0);
  const [sellToPublic, setSellToPublic] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { userList, profile, userTickets } = useSelector(
    (state: RootState) => state.profile
  );
  const { uid } = useSelector((state: RootState) => state.auth);
  const { error, success } = useSelector((state: RootState) => state.events); // Add this line

  // Toast notifications for success and error
  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success(success);
    }
  }, [error, success]);

  useEffect(() => {
    if (profile) {
      setTickets(userTickets);
    }
  }, [profile, userTickets]);

  useEffect(() => {
    dispatch(fetchAUserProfile(profile?.id));
  }, [dispatch, profile?.id]);

  // Group tickets by event name
  const groupTicketsByEvent = (tickets: any[]) => {
    const grouped = tickets.reduce((acc, ticket) => {
      const eventName = ticket.eventName || "Unknown Event";
      if (!acc[eventName]) {
        acc[eventName] = [];
      }
      acc[eventName].push(ticket);
      return acc;
    }, {});
    return grouped;
  };

  const groupedTickets = React.useMemo(
    () => groupTicketsByEvent(tickets),
    [tickets]
  );

  // Set all groups as collapsed by default
  React.useEffect(() => {
    if (tickets.length > 0) {
      const allGroups = new Set(
        Object.keys(groupedTickets).map((name) => `tickets-${name}`)
      );
      setCollapsedGroups(allGroups);
    }
  }, [tickets, groupedTickets]);

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const openModal = (type, ticket) => {
    setModalType(type);
    setSelectedTicket(ticket);
    setEmail(""); // Reset input
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedTicket(null);
    setEmail("");
  };

  const handleViewTicket = (ticket) => {
    if (ticket.pdfURL) {
      // Open PDF in new tab
      window.open(ticket.pdfURL, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Ticket PDF not available");
    }
  };

  const handleSubmit = () => {
    if (!email) return alert("Please enter an email.");

    const existingUser = userList.find((user) => user.emailAddress === email);

    if (modalType === "reassigned") {
      if (existingUser) {
        // Assign ticket to existing user
        dispatch(
          reassignTicket(
            uid || profile?.id, // Current user ID
            existingUser.id, // Existing user's ID
            selectedTicket.id // Ticket ID
          )
        );
      } else {
        // Send invitation to new user
        console.log(`Sending invitation to ${email} to reassign ticket.`);
        alert(`User not found. Invitation sent to ${email}.`);
      }
    } else {
      console.log(`Ticket "${selectedTicket.title}" ${modalType} to ${email}`);
    }

    closeModal();
  };

  const handleRefund = () => {
    if (
      !bankDetails.accountName ||
      !bankDetails.accountNumber ||
      !bankDetails.bankName ||
      !bankDetails.routingNumber
    ) {
      alert("Please fill in all bank details.");
      return;
    }
    dispatch(refundTicket(uid || profile?.id, selectedTicket.id, bankDetails));
    closeModal();
  };

  const handleResale = () => {
    if (!resalePrice || resalePrice <= 0) {
      alert("Please enter a valid resale price.");
      return;
    }
    dispatch(
      resaleTicket(
        uid || profile?.id,
        selectedTicket.id,
        resalePrice,
        sellToPublic
      )
    );
    closeModal();
  };

  return (
    <div className="main-content p-4">
      <Header title="Tickets" />
      {/* ToastContainer for toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-3 rounded-lg text-center">
            <p className="text-lg font-bold text-white">{tickets.length}</p>
            <p className="text-xs text-white opacity-90">Total Tickets</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-lg text-center">
            <p className="text-lg font-bold text-white">
              {tickets.filter((t) => t.status === "active").length ||
                tickets.length}
            </p>
            <p className="text-xs text-white opacity-90">Active</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 rounded-lg text-center">
            <p className="text-lg font-bold text-white">
              {tickets.filter((t) => t.status === "used").length || 0}
            </p>
            <p className="text-xs text-white opacity-90">Used</p>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              My Tickets
            </h3>
            {Object.keys(groupedTickets).length > 0 && (
              <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full">
                {tickets.length}
              </span>
            )}
          </div>

          {Object.keys(groupedTickets).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedTickets).map(
                ([eventName, eventTickets]) => (
                  <div key={eventName} className="space-y-2">
                    {/* Event Group Header */}
                    <div
                      className="bg-gray-900 p-3 rounded-lg border border-teal-400/30 cursor-pointer hover:bg-gray-800 transition-colors"
                      onClick={() => toggleGroup(`tickets-${eventName}`)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-semibold text-teal-300 flex items-center gap-2">
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              collapsedGroups.has(`tickets-${eventName}`)
                                ? "rotate-0"
                                : "rotate-90"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2H5zM5 21a2 2 0 01-2-2v-3a1 1 0 011-1h1a1 1 0 011 1v3a2 2 0 01-2 2H5z"
                            />
                          </svg>
                          {eventName}
                        </h4>
                        <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full">
                          {(eventTickets as any[]).length} ticket
                          {(eventTickets as any[]).length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>📍 {(eventTickets as any[])[0].location}</span>
                        <span>📅 {(eventTickets as any[])[0].eventDate}</span>
                      </div>
                    </div>

                    {/* Individual Tickets - Collapsible */}
                    {!collapsedGroups.has(`tickets-${eventName}`) && (
                      <div className="space-y-2">
                        {(eventTickets as any[]).map((ticket) => (
                          <div
                            key={ticket.id}
                            className="bg-gray-800 border border-gray-700 hover:border-teal-500 transition-all duration-200 p-3 rounded-lg group relative ml-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={ticket.image}
                                  alt={ticket.eventName}
                                  className="w-10 h-10 rounded-lg object-cover border border-teal-400"
                                />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full"></div>
                              </div>

                              <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h5 className="text-sm text-gray-300 truncate group-hover:text-teal-300">
                                    Ticket #{ticket.id.slice(-6)}
                                  </h5>
                                  <div className="flex items-center gap-2">
                                    <span className="bg-teal-100 text-teal-800 text-xs px-1.5 py-0.5 rounded-full">
                                      🎫
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                      </svg>
                                      {ticket.status || "Active"}
                                    </span>
                                  </div>

                                  {/* Compact Action Buttons */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleViewTicket(ticket)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors flex items-center"
                                      title="View Ticket"
                                    >
                                      <FaEye className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        openModal("options", ticket)
                                      }
                                      className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs transition-colors"
                                      title="Options"
                                    >
                                      <FaEllipsisV className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="bg-gray-800 border-2 border-dashed border-gray-600 p-8 rounded-lg text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2H5zM5 21a2 2 0 01-2-2v-3a1 1 0 011-1h1a1 1 0 011 1v3a2 2 0 01-2 2H5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 5a2 2 0 012 2v3a1 1 0 01-1 1h-1a1 1 0 01-1-1V7a2 2 0 012-2h-1z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21a2 2 0 002-2v-3a1 1 0 00-1-1h-1a1 1 0 00-1 1v3a2 2 0 002 2h-1z"
                />
              </svg>
              <p className="text-gray-400 text-lg">No tickets found</p>
              <p className="text-gray-500 text-sm mt-2">
                Your purchased tickets will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Options Modal */}
      <BaseModal
        isOpen={modalType === "options"}
        onClose={closeModal}
        title="Ticket Options"
        maxWidth="md:max-w-md"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="space-y-3">
              <button
                onClick={() => {
                  closeModal();
                  openModal("reassigned", selectedTicket);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors flex items-center gap-3"
              >
                <FaExchangeAlt className="w-4 h-4" />
                Reassign Ticket
              </button>
              <button
                onClick={() => {
                  closeModal();
                  openModal("refund", selectedTicket);
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-lg transition-colors flex items-center gap-3"
              >
                <FaDollarSign className="w-4 h-4" />
                Request Refund
              </button>
              <button
                onClick={() => {
                  closeModal();
                  openModal("resale", selectedTicket);
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors flex items-center gap-3"
              >
                <FaTag className="w-4 h-4" />
                Resale Ticket
              </button>
            </div>
          </div>
        )}
      </BaseModal>

      {/* Other Modals using BaseModal */}
      <BaseModal
        isOpen={modalType === "reassigned"}
        onClose={closeModal}
        title="Reassign Ticket"
        icon={<FaExchangeAlt />}
      >
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            placeholder="Enter guest name or email"
            className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto space-y-2">
            {userList
              ?.filter(
                (user) =>
                  user.name.toLowerCase().includes(email.toLowerCase()) ||
                  user.emailAddress.toLowerCase().includes(email.toLowerCase())
              )
              .map((user) => (
                <div
                  key={user.emailAddress}
                  onClick={() => setEmail(user.emailAddress)}
                  className="cursor-pointer p-3 rounded-lg border border-gray-600 bg-gray-700 hover:bg-gray-600"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">
                        {user.emailAddress}
                      </p>
                    </div>
                    <img
                      src={user.profilePicUrl || "/avatar.png"}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full border-2 border-teal-400 object-cover"
                    />
                  </div>
                </div>
              ))}
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
          >
            Confirm Reassignment
          </button>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={modalType === "refund"}
        onClose={closeModal}
        title="Request Refund"
        icon={<FaDollarSign />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={bankDetails.accountName}
              onChange={(e) =>
                setBankDetails({ ...bankDetails, accountName: e.target.value })
              }
              placeholder="Account Name"
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg"
            />
            <input
              type="text"
              value={bankDetails.accountNumber}
              onChange={(e) =>
                setBankDetails({
                  ...bankDetails,
                  accountNumber: e.target.value,
                })
              }
              placeholder="Account Number"
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg"
            />
            <input
              type="text"
              value={bankDetails.bankName}
              onChange={(e) =>
                setBankDetails({ ...bankDetails, bankName: e.target.value })
              }
              placeholder="Bank Name"
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg"
            />
            <input
              type="text"
              value={bankDetails.routingNumber}
              onChange={(e) =>
                setBankDetails({
                  ...bankDetails,
                  routingNumber: e.target.value,
                })
              }
              placeholder="Routing Number"
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg"
            />
          </div>
          <button
            onClick={handleRefund}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg"
          >
            Submit Refund Request
          </button>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={modalType === "resale"}
        onClose={closeModal}
        title="Resale Ticket"
        icon={<FaTag />}
      >
        <div className="space-y-4">
          <input
            type="number"
            value={resalePrice}
            onChange={(e) => setResalePrice(Number(e.target.value))}
            placeholder="Enter resale price"
            className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg"
            min={1}
          />
          <div className="flex items-center p-4 bg-gray-700 rounded-lg">
            <input
              type="checkbox"
              id="sellToPublic"
              checked={sellToPublic}
              onChange={(e) => setSellToPublic(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded"
            />
            <label
              htmlFor="sellToPublic"
              className="ml-3 text-white font-medium"
            >
              Make available to public
            </label>
          </div>
          <button
            onClick={handleResale}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
          >
            List for Resale
          </button>
        </div>
      </BaseModal>
    </div>
  );
}

export default Tickets;
