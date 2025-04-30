import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CommentCard from "./CommentCard";
import CommentForm from "./CommentForm";
import { Event, addReview } from "../store/eventsSlice"; // Assuming Event type is defined here
import { FaTimesCircle } from "react-icons/fa";

interface User {
  uid?: string;
  name?: string;
  userName?: string;
  profilePicUrl?: string;
}

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: User;
  rating: number;
}

interface CommentsProps {
  user: User;
  event: Event;
  isCommentsVisible: boolean;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsProps> = ({
  user,
  event,
  isCommentsVisible,
  onClose,
}) => {
  const [comments, setComments] = useState<Comment[]>(event.comments || []);
  const dispatch = useDispatch();
  const { uid } = useSelector((state) => state.auth);

  const handleCommentSubmit = (commentText: string, rating: number) => {
    const newComment: Comment = {
      id: `${Date.now()}`,
      text: commentText,
      createdAt: new Date().toISOString(),
      user,
      rating,
    };
    setComments([...comments, newComment]);

    // Dispatch the addReview function
    dispatch(
      addReview(event.id, {
        userId: uid || user?.id,
        title: "User Review", // Example title
        reviewText: commentText,
        rating,
      })
    );
  };

  if (!isCommentsVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-70">
      <div className="p-4 w-11/12 md:max-w-2xl bg-dark rounded-lg shadow-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-500 ">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Comments
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <FaTimesCircle className="w-6 h-6 hover:text-red-500" />
          </button>
        </div>

        {/* Comments List */}
        <div className="p-4 space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))
          ) : (
            <p className="text-gray-400 text-sm">No comments yet.</p>
          )}

          {/* Comment Form */}
          <CommentForm user={user} onSubmit={handleCommentSubmit} />
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
