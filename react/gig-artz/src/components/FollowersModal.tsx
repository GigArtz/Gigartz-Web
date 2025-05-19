import React from "react";
import UserCard from "./UserCard";
import { FaTimesCircle } from "react-icons/fa";

interface FollowersModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  users: { id: string; name: string; profilePicUrl?: string }[];
}

const FollowersModal: React.FC<FollowersModalProps> = ({
  title,
  isOpen,
  onClose,
  users = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 min-h-screen bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-dark w-96 p-4 rounded-lg shadow-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="hover:bg-gray-700 rounded-lg text-sm w-8 h-8 flex justify-center items-center"
          >
            <FaTimesCircle className="w-6 h-6 hover:text-red-500" />
          </button>
        </div>

        {/* Followers List */}
        <div className="max-h-80 overflow-y-auto border-t border-gray-700 p-2">
          {users.length > 0 ? (
            users.map((user) => (
              <button
                key={user.id}
                className="mb-2 w-full text-left bg-transparent border-none p-0 focus:outline-none"
                onClick={onClose}
                type="button"
              >
                <UserCard user={user} />
              </button>
            ))
          ) : (
            <p className="text-gray-400 text-center mt-4">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
