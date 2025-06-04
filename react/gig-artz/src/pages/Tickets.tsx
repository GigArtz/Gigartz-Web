import { fetchAUserProfile } from "../../store/profileSlice";
import {
  reassignTicket,
  resaleTicket,
  refundTicket,
} from "../../store/eventsSlice";
import Header from "../components/Header";
import React, { useEffect, useState } from "react";
import { FaEllipsisV, FaEye, FaTimesCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
// Use RootState for type safety
import type { RootState } from "../../store/store";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Tickets() {
  const [menuOpen, setMenuOpen] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [email, setEmail] = useState(""); // Add this line
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

  const toggleMenu = (id) => {
    setMenuOpen(menuOpen === id ? null : id);
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
      <div className="flex flex-wrap md:grid md:grid-cols-2 gap-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="w-full bg-gray-900 p-4 rounded-lg shadow-md flex items-center gap-4 relative"
          >
            {/* Event Image */}
            <img
              src={ticket.image}
              alt={ticket.eventName}
              className="w-16 h-16 rounded-md border-2 border-teal-400"
            />

            {/* Event Details */}
            <div className="flex-grow">
              <h2 className="text-lg font-semibold text-white">
                {ticket.eventName}
              </h2>
              <p className="text-sm text-gray-400">{ticket.location}</p>
              <p className="text-xs text-gray-300">{ticket.eventDate}</p>
            </div>

            {/* Options Button */}
            <div className="relative">
              <div className="flex ">
                <a
                  href={ticket.pdfURL}
                  target="_self"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:underline"
                >
                  <FaEye className="w-4 h-4" />
                </a>
                <button
                  onClick={() => toggleMenu(ticket.id)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaEllipsisV />
                </button>
              </div>

              {/* Dropdown Menu */}
              {menuOpen === ticket.id && (
                <div className="absolute right-0 mt-2 w-auto shadow-lg rounded-md z-10 text-nowrap gap-2">
                  <button
                    className="block w-full text btn-primary text-left px-4 py-2 mb-2"
                    onClick={() => openModal("reassigned", ticket)}
                  >
                    Reassign Ticket
                  </button>
                  <button
                    className="block w-full btn-primary text-left px-4 py-2 mb-2"
                    onClick={() => openModal("refund", ticket)}
                  >
                    Claim Refund
                  </button>
                  <button
                    className="block w-full btn-primary text-left px-4 py-2"
                    onClick={() => openModal("resale", ticket)}
                  >
                    Resale Ticket
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Sharing/Reassigning Ticket */}
      {modalType && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="p-4 w-11/12 md:max-w-2xl bg-dark rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-1">
              <h2 className="text-lg font-semibold text-white ">
                {modalType === "shared"
                  ? "Share Ticket"
                  : modalType === "reassigned"
                  ? "Reassign Ticket"
                  : modalType === "refund"
                  ? "Claim Refund"
                  : modalType === "resale"
                  ? "Resale Ticket"
                  : ""}
              </h2>
              <div>
                <FaTimesCircle
                  className="w-4 h-4 hover:text-red-500"
                  onClick={closeModal}
                />
              </div>
            </div>
            {modalType === "reassigned" && (
              <>
                <p className="text-gray-300 mb-3">
                  Enter the email to reassign this ticket:
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  placeholder="Enter guest name or email"
                  className="input-field mb-2"
                  autoFocus
                />
                <ul className="text-gray-300 grid overflow-y-auto max-h-60">
                  {userList &&
                  userList.filter(
                    (user) =>
                      user.name.toLowerCase().includes(email.toLowerCase()) ||
                      user.emailAddress
                        .toLowerCase()
                        .includes(email.toLowerCase())
                  ).length > 0 ? (
                    userList
                      .filter(
                        (user) =>
                          user.name
                            .toLowerCase()
                            .includes(email.toLowerCase()) ||
                          user.emailAddress
                            .toLowerCase()
                            .includes(email.toLowerCase())
                      )
                      .map((user) => (
                        <li
                          key={user.emailAddress}
                          onClick={() => setEmail(user.emailAddress)}
                          className="cursor-pointer p-1 mr-1 rounded border border-gray-600 bg-gray-800 hover:bg-gray-700 text-white mb-2"
                        >
                          <div className="flex justify-between items-center">
                            <p>{user.name}</p>
                            <span>
                              <img
                                src={user.profilePicUrl || "/avatar.png"}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full border-2 border-teal-400 object-cover"
                              />
                            </span>
                          </div>
                        </li>
                      ))
                  ) : (
                    <p className="text-gray-400 text-center">
                      No matching users found.
                    </p>
                  )}
                </ul>
                <div className="flex justify-end gap-2">
                  <button onClick={handleSubmit} className="btn-primary">
                    Confirm
                  </button>
                </div>
              </>
            )}
            {modalType === "refund" && (
              <>
                <p className="text-gray-300 mb-3">
                  Enter your bank details for refund:
                </p>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) =>
                    setBankDetails({
                      ...bankDetails,
                      accountName: e.target.value,
                    })
                  }
                  placeholder="Account Name"
                  className="input-field mb-2"
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
                  className="input-field mb-2"
                />
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) =>
                    setBankDetails({ ...bankDetails, bankName: e.target.value })
                  }
                  placeholder="Bank Name"
                  className="input-field mb-2"
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
                  className="input-field mb-2"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={handleRefund} className="btn-primary">
                    Submit Refund
                  </button>
                </div>
              </>
            )}
            {modalType === "resale" && (
              <>
                <p className="text-gray-300 mb-3">
                  Enter resale price and options:
                </p>
                <input
                  type="number"
                  value={resalePrice}
                  onChange={(e) => setResalePrice(Number(e.target.value))}
                  placeholder="Resale Price"
                  className="input-field mb-2"
                  min={1}
                />
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={sellToPublic}
                    onChange={(e) => setSellToPublic(e.target.checked)}
                    className="mr-2"
                  />
                  Sell to Public
                </label>
                <div className="flex justify-end gap-2">
                  <button onClick={handleResale} className="btn-primary">
                    List for Resale
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
