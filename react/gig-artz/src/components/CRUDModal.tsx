import { FaTimesCircle, FaEdit, FaTrash, FaEye } from "react-icons/fa";

const CRUDModal = ({ setIsCRUDVisible, onEdit, onDelete, onInsights, event }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex justify-center items-center">
      <div className="bg-dark p-6 rounded-lg shadow-lg relative w-80 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pb-1 border-b border-gray-500 ">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Manage Event
          </h3>
          <button
            onClick={() => setIsCRUDVisible(false)}
            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <FaTimesCircle className="w-6 h-6 hover:text-red-500" />
          </button>
        </div>
        {/* Modal Content */}
        <div className="flex flex-col gap-4 items-center">
          {/* Edit Button */}
          <button
            onClick={() => {
              onEdit(event);
              setIsCRUDVisible(false); // Close modal after editing
            }}
            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg transition"
          >
            <FaEdit className="w-5 h-5" />
            Edit
          </button>

          {/* Insights Button */}
          <button
            onClick={() => {
              onInsights(event);
              setIsCRUDVisible(false); // Close modal after deleting
            }}
            className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-white py-2 px-4 rounded-lg transition"
          >
            <FaEye className="w-5 h-5" />
            Insights
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
            Delete
          </button>

          
        </div>
      </div>
    </div>
  );
};

export default CRUDModal;
