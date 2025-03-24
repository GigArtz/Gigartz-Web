import { useState } from "react";
import { FaHome, FaSearch, FaPlus, FaBell, FaEnvelope } from "react-icons/fa"; // Importing icons from react-icons
import { useNavigate } from "react-router-dom";
import Modal from "./EventFormModal"; // Import the Modal component

function BottomNav() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Function to open the modal
  const openModal = () => setIsModalOpen(true);

  // Function to close the modal
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      {/* Modal */}
      <Modal isModalOpen={isModalOpen} closeModal={closeModal} />

      {/* Bottom Navigation */}
      <div
        className="fixed z-50 h-16 max-w-lg -translate-x-1/2 bg-[#060512] border border-teal-700 rounded-full bottom-4 left-1/2 dark:bg-gray-800 dark:border-gray-600 w-4/5"
        hidden={isModalOpen}
      >
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
          {/* Home Button */}
          <button
            onClick={() => navigate("/home")}
            data-tooltip-target="tooltip-home"
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 rounded-s-full hover:bg-gray-700 dark:hover:bg-gray-600 group"
          >
            <FaHome className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-teal-500 dark:group-hover:text-teal-400" />
            <span className="sr-only">Home</span>
          </button>

          {/* Search Button */}
          <button
            onClick={() => navigate("/explore")}
            data-tooltip-target="tooltip-search"
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-700 dark:hover:bg-gray-600 group"
          >
            <FaSearch className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-teal-500 dark:group-hover:text-teal-400" />
            <span className="sr-only">Search</span>
          </button>

          {/* Add Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={openModal} // Open modal on click
              data-tooltip-target="tooltip-add"
              type="button"
              className="inline-flex items-center justify-center w-12 h-12 bg-teal-500 rounded-full hover:bg-teal-600 group focus:ring-4 focus:ring-teal-300 focus:outline-none dark:focus:ring-teal-800"
            >
              <FaPlus className="w-6 h-6 text-white" />
              <span className="sr-only">Add item</span>
            </button>
          </div>

          {/* Notifications Button */}
          <button
            onClick={() => navigate("/notifications")}
            data-tooltip-target="tooltip-notifications"
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-700 dark:hover:bg-gray-600 group"
          >
            <FaBell className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-teal-500 dark:group-hover:text-teal-400" />
            <span className="sr-only">Notifications</span>
          </button>

          {/* Messages Button */}
          <button
            onClick={() => navigate("/messages")}
            data-tooltip-target="tooltip-messages"
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-700 dark:hover:bg-gray-600 group"
          >
            <FaEnvelope className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-teal-500 dark:group-hover:text-teal-400" />
            <span className="sr-only">Messages</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BottomNav;
