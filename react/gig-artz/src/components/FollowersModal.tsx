import React from "react";
import UserCard from "./UserCard";
import { FaUsers } from "react-icons/fa";
import BaseModal from "./BaseModal";

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
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<FaUsers />}
      maxWidth="md:max-w-md"
      minWidth="min-w-80"
    >
      {/* Followers List */}
      <div className="max-h-80 overflow-y-auto p-2">
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
    </BaseModal>
  );
};

export default FollowersModal;
