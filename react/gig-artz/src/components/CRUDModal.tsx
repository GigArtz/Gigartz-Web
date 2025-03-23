import { FaTimesCircle, FaEdit, FaTrash } from "react-icons/fa";

const CRUDModal = ({ setIsCRUDVisible, onEdit, onDelete, event }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-950 p-6 rounded-lg shadow-lg relative w-80 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={() => setIsCRUDVisible(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
        >
          <FaTimesCircle className="w-6 h-6" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col gap-4 items-center">
          <h3 className="text-lg font-semibold text-white">Manage Event</h3>

          {/* Edit Button */}
          <button
            onClick={() => {
              onEdit(event);
              setIsCRUDVisible(false); // Close modal after editing
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition"
          >
            <FaEdit className="w-5 h-5" />
            Edit Event
          </button>

          {/* Delete Button */}
          <button
            onClick={() => {
              onDelete();
              setIsCRUDVisible(false); // Close modal after deleting
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition"
          >
            <FaTrash className="w-5 h-5" />
            Delete Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default CRUDModal;
