import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import {
  likeReview,
  repostReview,
  saveReview,
  commentOnReview,
  reportReview,
} from "../../store/eventsSlice";
import {
  FaHeart,
  FaRetweet,
  FaComment,
  FaShareAlt,
  FaEllipsisV,
  FaExclamationTriangle,
  FaBookmark,
} from "react-icons/fa";
import ReportModal from "./ReportModal";

interface ReviewActionsProps {
  reviewId: string;
  userId: string;
}

const ReviewActions: React.FC<ReviewActionsProps> = ({ reviewId, userId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleLike = () => {
    dispatch(likeReview(reviewId, userId));
  };
  const handleRepost = () => {
    dispatch(repostReview(reviewId, userId));
  };
  const handleSave = () => {
    dispatch(saveReview(reviewId, userId));
  };
  const handleComment = () => {
    if (comment.trim()) {
      dispatch(commentOnReview(reviewId, { userId, comment }));
      setComment("");
      setShowCommentBox(false);
    }
  };
  const handleShare = () => {
    // Implement share logic (e.g., copy link, open share modal, etc.)
    if (navigator.share) {
      navigator.share({
        title: "Check out this review!",
        url: window.location.href,
      });
    } else {
      window.prompt("Copy this link:", window.location.href);
    }
  };
  const handleReport = () => {
    setIsModalOpen(false);
    setIsReportModalOpen(true);
  };

  const handleSelectReportReason = (
    reason: string,
    additionalDetails?: string
  ) => {
    setIsReportModalOpen(false);
    // Dispatch reportReview action
    dispatch(reportReview(reviewId, { userId, reason, additionalDetails }));
  };

  return (
    <div className="flex-1">
      <div className="mt-3 flex-wrap g border-t p-2 border-gray-700 pt-3 px-4 flex w-full justify-between gap-1 md:gap-4 text-gray-400 text-sm md:text-base">
        {/* Comment Button */}
        <button
          onClick={() => setShowCommentBox((v) => !v)}
          className="flex items-center text-gray-500 hover:text-teal-400 transition-colors text-sm"
          title="Comment"
        >
          <FaComment className="mr-1 w-3 h-3 md:w-4 md:h-4" />
        </button>
        {/* Like Button */}
        <button
          onClick={handleLike}
          className="flex items-center text-gray-500 hover:text-red-400 transition-colors"
          title="Like"
        >
          <FaHeart className="mr-1 w-3 h-3 md:w-4 md:h-4" />
        </button>
        {/* Repost Button */}
        <button
          onClick={handleRepost}
          className="flex items-center text-gray-500 hover:text-teal-400 transition-colors text-sm"
          title="Repost"
        >
          <FaRetweet className="mr-1 w-4 h-4 md:w-5 md:h-5" />
        </button>
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center text-gray-500 hover:text-teal-400 transition-colors text-sm"
          title="Share"
        >
          <FaShareAlt className="mr-1 w-3 h-3 md:w-4 md:h-4" />
        </button>
        {/* More Button (Three dots) */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex w-5 h-5 md:w-4 md:h-4 items-center text-gray-500 hover:text-teal-400 transition-colors text-sm"
          title="More"
        >
          <FaEllipsisV className="mr-1 w-3 h-3 md:w-4 md:h-4" />
        </button>
        {/* Modal for Report/Save */}
        {isModalOpen && (
          <div
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-dark rounded-lg p-4 w-1/3 max-w-sm"
              onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
            >
              <h3 className="text-lg font-semibold mb-4 text-white">
                More Options
              </h3>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleReport}
                  className="py-2 px-4 flex gap-4 bg-dark text-gray-500 hover:bg-gray-800"
                >
                  <FaExclamationTriangle className="h-4 w-4" /> Report
                </button>
                <button
                  onClick={handleSave}
                  className="py-2 px-4 flex gap-4 bg-dark text-gray-500 hover:bg-gray-800"
                >
                  <FaBookmark className="h-4 w-4" /> Save
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Report Modal */}
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSelectReason={handleSelectReportReason}
        />
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {/* Comment Box */}
        {showCommentBox && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleComment();
            }}
            className="w-full py-2"
          >
            <div className="flex flex-col input-field border border-gray-800 bg-dark rounded-lg shadow-md p-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-dark text-white rounded resize-none focus:outline-none"
                rows={2}
                required
              />
              <div className="flex justify-end items-center mt-2 border-t pt-2 border-gray-600">
                <button
                  type="submit"
                  className="btn-primary rounded-3xl transition w-20 flex items-center justify-center font-bold"
                >
                  Post
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewActions;
