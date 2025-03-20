import React, { useState } from "react";
import CommentCard from "./CommentCard";
import CommentForm from "./CommentForm";

interface User {
  uid: string;
  name?: string;
  userName?: string;
  bio?: string;
  profilePicUrl?: string;
}

interface CommentsProps {
  user: User;
  eventId: string;
}

function CommentsModal({ user, eventId }: CommentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Open Comments
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="p-4 w-full max-w-2xl bg-[#060512] rounded-lg shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Comments
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  className="w-3 h-3"
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
                    d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <CommentCard user={user} eventId={eventId} />
              <CommentForm user={user} eventId={eventId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentsModal;
