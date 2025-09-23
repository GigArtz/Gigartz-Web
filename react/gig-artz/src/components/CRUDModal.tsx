import {
  FaEdit,
  FaTrash,
  FaEye,
  FaBookmark,
  FaExclamationTriangle,
  FaCalendarAlt,
} from "react-icons/fa";
import React from "react";

interface CRUDModalProps {
  setIsCRUDVisible: (isVisible: boolean) => void;
  onEdit: (event: Record<string, unknown>) => void;
  onPostpone: (event: Record<string, unknown>) => void;
  onDelete: () => void;
  onInsights: () => void;
  onReport: () => void;
  event: Record<string, unknown>;
  isCreator: boolean;
}

const CRUDModal: React.FC<CRUDModalProps> = ({
  setIsCRUDVisible,
  onEdit,
  onPostpone,
  onDelete,
  onInsights,
  onReport,
  event,
  isCreator,
}) => {
  const handleSave = () => {
    // Implement save logic
    console.log("Save event:", event.id);
    setIsCRUDVisible(false);
  };

  return (
    <div className="rounded-lg relative overflow-hidden">
      {/* Modal Content */}
      <div className="flex flex-col items-center">
        <div className="w-full flex-row transition divide-y divide-gray-800">
          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full flex gap-3 items-center py-1.5 px-3 hover:bg-gray-900 transition text-gray-500"
          >
            <FaBookmark className="w-4 h-4" />
            <span className="text-sm">Save</span>
          </button>

          {/* Report Button */}
          <button
            onClick={onReport}
            className="w-full flex gap-3 items-center py-1.5 px-3 hover:bg-gray-900 transition text-gray-500"
          >
            <FaExclamationTriangle className="w-4 h-4" />
            <span className="text-sm">Report</span>
          </button>

          {/* Creator options are separated naturally by the divide-y class */}
          {isCreator && (
            <>
              {/* Edit Button */}
              <button
                onClick={() => {
                  onEdit(event);
                  setIsCRUDVisible(false); // Close modal after editing
                }}
                className="w-full flex gap-3 items-center py-1.5 px-3 hover:bg-gray-900 transition text-gray-500"
              >
                <FaEdit className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </button>

              {/* Postpone Button */}
              <button
                onClick={() => {
                  onPostpone(event);
                  setIsCRUDVisible(false); // Close modal after editing
                }}
                className="w-full flex gap-3 items-center py-1.5 px-3 hover:bg-gray-900 transition text-gray-500"
              >
                <FaCalendarAlt className="w-4 h-4" />
                <span className="text-sm">Postpone</span>
              </button>

              {/* Insights Button */}
              <button
                onClick={() => {
                  onInsights();
                  setIsCRUDVisible(false); // Close modal after viewing insights
                }}
                className="w-full flex gap-3 items-center py-1.5 px-3 hover:bg-gray-900 transition text-gray-500"
              >
                <FaEye className="w-4 h-4" />
                <span className="text-sm">Insights</span>
              </button>
              {/* Delete Button */}
              <button
                onClick={() => {
                  onDelete();
                  setIsCRUDVisible(false); // Close modal after deleting
                }}
                className="w-full flex gap-3 items-center py-1.5 px-3 hover:bg-gray-900 transition text-gray-500 hover:text-red-500"
              >
                <FaTrash className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRUDModal;
