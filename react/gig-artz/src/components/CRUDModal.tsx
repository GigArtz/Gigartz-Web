import {
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaEye,
  FaBookmark,
  FaExclamationTriangle,
} from "react-icons/fa";

const CRUDModal = ({
  setIsCRUDVisible,
  onEdit,
  onDelete,
  onInsights,
  event,
  isCreator,
}) => {
  function onSave(event: any) {
    throw new Error("Function not implemented.");
  }

  function onReport(event: any) {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex justify-center items-center">
      <div className="bg-dark p-6 rounded-lg shadow-lg relative w-80 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pb-1 border-b border-gray-500 ">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            More Options
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
          <div className="w-full flex-row transition">
            {/* Save Button */}
            <button
              onClick={() => {
                onSave(event);
                setIsCRUDVisible(false); // Close modal after deleting
              }}
              className="w-full flex gap-4 py-2 px-4  hover:bg-gray-900 transition text-gray-500"
            >
              <FaBookmark className="w-5 h-5" />
              Save
            </button>

            {/* Report Button */}
            <button
              onClick={() => {
                onReport(event);
                setIsCRUDVisible(false); // Close modal after deleting
              }}
              className="w-full flex gap-4 py-2 px-4  hover:bg-gray-900 transition text-gray-500"
            >
              <FaExclamationTriangle className="w-5 h-5" />
              Report
            </button>
            
          {isCreator && (
            <>
              {/* Edit Button */}
              <button
                onClick={() => {
                  onEdit(event);
                  setIsCRUDVisible(false); // Close modal after editing
                }}
                className="w-full flex gap-4 py-2 px-4  hover:bg-gray-900 transition text-gray-500"
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
                className="w-full flex gap-4 py-2 px-4  hover:bg-gray-900 transition text-gray-500"
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
                className="w-full flex gap-4 py-2 px-4  hover:bg-gray-900 transition text-gray-500"
              >
                <FaTrash className="w-5 h-5" />
                Delete
              </button>
            </>
          )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CRUDModal;
