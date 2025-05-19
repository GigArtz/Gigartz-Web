import { fetchAUserProfile } from "../../store/profileSlice";
import { reassignTicket } from "../../store/eventsSlice";
import Header from "../components/Header";
import React, { useEffect, useState } from "react";
import { FaEllipsisV, FaEye, FaTimesCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";

function Tickets() {
  const [menuOpen, setMenuOpen] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [email, setEmail] = useState(""); // Add this line
  const dispatch = useDispatch<AppDispatch>();
  const { userList, profile, userTickets } = useSelector(
    (state) => state.profile
  );
  const { uid } = useSelector((state) => state.auth);

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

  return (
    <div className="main-content p-4">
      <Header title="Tickets" />
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
                  target="_blank"
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
                  <button className="block w-full btn-primary text-left px-4 py-2">
                    Claim Refund
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
                {modalType === "shared" ? "Share Ticket" : "Reassign Ticket"}
              </h2>
              <div>
                <FaTimesCircle
                  className="w-4 h-4 hover:text-red-500"
                  onClick={closeModal}
                />
              </div>
            </div>
            <p className="text-gray-300 mb-3">
              Enter the email to {modalType} this ticket:
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                const email = e.target.value.trim();
                setEmail(email);
              }}
              placeholder="Enter guest name or email"
              className="input-field mb-2"
              autoFocus
            />
            <ul className="text-gray-300 grid overflow-y-auto max-h-60">
              {userList &&
              userList.filter(
                (user) =>
                  user.name.toLowerCase().includes(email.toLowerCase()) ||
                  user.emailAddress.toLowerCase().includes(email.toLowerCase())
              ).length > 0 ? (
                userList
                  .filter(
                    (user) =>
                      user.name.toLowerCase().includes(email.toLowerCase()) ||
                      user.emailAddress
                        .toLowerCase()
                        .includes(email.toLowerCase())
                  )
                  .map((user) => (
                    <li
                      key={user.emailAddress}
                      onClick={() => setNewGuestEmail(user.emailAddress)}
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
