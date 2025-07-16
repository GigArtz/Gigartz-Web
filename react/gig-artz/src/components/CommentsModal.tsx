import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CommentCard from "./CommentCard";
import CommentForm from "./CommentForm";
import { addReview, resetError } from "../../store/eventsSlice";
import Toast from "./Toast";
import { FaTimesCircle } from "react-icons/fa";
import { RootState, AppDispatch } from "../../store/store";
import { Root } from "postcss";

interface User {
  uid?: string;
  name?: string;
  userName?: string;
  profilePicUrl?: string;
}

interface Review {
  id: string;
  text: string;
  createdAt: string;
  user: User;
  rating: number;
}

interface CommentsProps {
  user: {
    uid?: string;
    name?: string;
    userName?: string;
    profilePicUrl?: string;
  };
  event: { id: string; comments: unknown[] };
  isCommentsVisible: boolean;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsProps> = ({
  user,
  event,
  isCommentsVisible,
  onClose,
}) => {
  const [comments, setComments] = useState<Review[]>([]); // Start with empty, fill only with new comments
  const dispatch = useDispatch<AppDispatch>();
  const uid = useSelector((state: RootState) => state.auth.uid);
  const { error, success, loading } = useSelector(
    (state: RootState) => state.events
  );
  const [showToast, setShowToast] = useState(true);

  // Fetch userList from Redux store
  const userList = useSelector(
    (state: RootState) => state.profile.userList
  ) as { userName: string }[];

  // Fetch profile
  const userTickets = useSelector(
    (state: RootState) => state.profile.userTickets
  );

  // Filter userList to only include users with a userName and name
  const filteredUser = userList
    .filter((user) => user?.userName && user?.name && user?.profilePicUrl)
    ?.find((u) => u.userName === user?.userName);

  const handleCommentSubmit = (commentText: string, rating: number) => {
    // Only dispatch, do not update UI yet
    dispatch(
      addReview(event.id, {
        userId: uid || user?.uid,
        title: "User Review",
        reviewText: commentText,
        rating,
      })
    );
    // Store pending review in state for later
    setPendingComment({ commentText, rating });
  };

  // Add this state and effect
  const [pendingComment, setPendingComment] = useState<{
    commentText: string;
    rating: number;
  } | null>(null);
  React.useEffect(() => {
    if (success && pendingComment) {
      const newComment: Review = {
        id: `${Date.now()}`,
        text: pendingComment.commentText,
        createdAt: new Date().toISOString(),
        user,
        rating: pendingComment.rating,
      };
      setComments((prev) => [...prev, newComment]);
      setPendingComment(null);
      // Only reset success, not error, to avoid hiding unrelated errors
      dispatch(resetError());
    }
    // If success and no pendingComment, reset success (prevents loop)
    if (success && !pendingComment) {
      dispatch(resetError());
    }
  }, [success, pendingComment, user, dispatch]);

  const handleToastClose = () => {
    setShowToast(false);
  };

  // Fetch comments when modal opens
  useEffect(() => {
    if (isCommentsVisible) {
      // Simulate fetching comments from event
      const fetchedComments: Review[] = event.comments.map((review: any) => ({
        id: review.id,
        text: review.reviewText,
        createdAt: review.date,
        user: {
          uid: review.userId,
          name: filteredUser?.name,
          userName: filteredUser?.userName,
          profilePicUrl: filteredUser?.profilePicUrl,
        },
        rating: review.rating || 0, // Default to 0 if no rating
      }));
      setComments(fetchedComments);
    }
  }, [isCommentsVisible, event.comments]);

  const [userCanComment, setUserCanComment] = useState(false);

  useEffect(() => {
    let canComment = false;

    for (const eventId in userTickets) {
      if (Object.prototype.hasOwnProperty.call(userTickets, eventId)) {
        const ticket = userTickets[eventId];
        if (ticket?.eventId === event.id) {
          canComment = true;
          break;
        }
      }
    }

    setUserCanComment(canComment);
  }, [user, event.id, userTickets]);

  if (!isCommentsVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-70">
      <div className="p-4 w-11/12 md:max-w-2xl bg-dark rounded-lg shadow-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-500 ">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Reviews
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <FaTimesCircle className="w-6 h-6 hover:text-red-500" />
          </button>
        </div>

        {/* Reviews List */}
        <div className="p-4 space-y-4">
          {comments.length > 0 ? (
            comments.map((review) => (
              <CommentCard key={review.id} review={review} />
            ))
          ) : (
            <p className="text-gray-400 text-sm">No comments yet.</p>
          )}

          {/* Review Form */}
          {userCanComment ? (
            // Show message for non-ticket holders
            <div className="text-red-400 text-sm text-center">
              You must have a ticket to comment on this event.
            </div>
          ) : (
            <CommentForm onSubmit={handleCommentSubmit} loading={loading} />
          )}
        </div>
      </div>
      {showToast && error && (
        <Toast message={error} type="error" onClose={handleToastClose} />
      )}
      {/* Only show success toast if there is a success and no pending review */}
      {showToast && success && !pendingComment && (
        <Toast message={success} type="success" onClose={handleToastClose} />
      )}
    </div>
  );
};

export default CommentsModal;
