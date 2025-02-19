import { useEffect } from "react";
import AddEventForm from "./EventForm";

function Modal({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) {
  // Focus the modal when it's opened for better accessibility
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
    } else {
      document.body.style.overflow = "auto"; // Allow scrolling again
    }
  }, [isModalOpen]);

  return (
    <div>
      {/* Modal */}
      {isModalOpen && (
        <div
          id="authentication-modal"
          tabIndex={-1}
          aria-hidden={!isModalOpen} // Accessibility improvement for screen readers
          className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center w-full h-full bg-[#1F1C29] bg-opacity-70 backdrop-blur-sm transition-all duration-300 ease-in-out"
        >
          <div
            className="relative p-4 w-full max-w-lg rounded-lg shadow-lg bg-[#1F1C29] transform transition-all duration-300 ease-in-out"
            role="dialog"
            aria-labelledby="modal-title"
            aria-hidden={!isModalOpen ? "true" : "false"}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-600">
              <h3
                id="modal-title"
                className="text-xl font-semibold text-white"
              >
                Event Details
              </h3>
              {/* Close Button */}
              <button
                onClick={closeModal}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-red-300 hover:text-red-900 rounded-full p-2 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white transition"
              >
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-2 max-h-[70vh] overflow-y-auto ">
              
              {/* Ensure AddEventForm is always within the modal */}
              <AddEventForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Modal;
