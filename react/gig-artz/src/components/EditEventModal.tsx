import { useEffect } from "react";
import { FaTimesCircle } from "react-icons/fa";
import EditEventForm from "./EditEventForm";

function EditEventModal({
  isModalOpen,
  closeModal,
  event,
}: {
  isModalOpen: boolean;
  closeModal: () => void;
  event: any; // Pass the event to the form
}) {
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
          className="fixed top-0 left-0 right-0 z-10 flex justify-center items-center px-5 md:px-2  w-full h-full bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300 ease-in-out"
        >
          <div
            className="relative p-4 w-full md:w-[50%] max-w-lg rounded-lg shadow-lg bg-[#1F1C29] transform transition-all duration-300 ease-in-out"
            role="dialog"
            aria-labelledby="modal-title"
            aria-hidden={!isModalOpen ? "true" : "false"}
          >
            {/* Modal Header */}
            <div className="flex items-end justify-end p-2 md:p-5 rounded-t">
              {/* Close Button */}
              <button
                onClick={() => closeModal()}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
              >
                <FaTimesCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-2 md:max-h-[70vh] max-h-[60vh]  overflow-y-auto ">
              {/* Ensure AddEventForm is always within the modal */}
              <EditEventForm event={event} closeModal={closeModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditEventModal;
