import {
  FaComment,
  FaEllipsisV,
  FaHeart,
  FaBookmark,
  FaRetweet,
  FaShareAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import React, { useEffect, useState } from "react";
import CRUDModal from "../components/CRUDModal";
import EditEventModal from "../components/EditEventModal";
import EditEventDateTimeModal from "../components/EditEventDateTimeModal";
import ReportModal from "./ReportModal";
import "./EventActions.css";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ShareModal from "./ShareModal";
import CommentsModal from "./CommentsModal";
import BaseModal from "./BaseModal";
import { repostEvent, saveEvent, reportEvent } from "../../store/eventsSlice";
import { showToast } from "../../store/notificationSlice";
import { AppDispatch, RootState } from "../../store/store";

// Define Event type locally - made compatible with CRUDModal's Event type
interface Event {
  id: string;
  ticketsPrices?: Record<string, unknown>;
  time?: string;
  mapLink?: string;
  title: string;
  gallery?: string[];
  comments: unknown[];
  eventType?: string;
  eventVideo?: string;
  city?: string;
  description?: string;
  likes: number;
  venue?: string;
  artistLineUp?: string[];
  category?: string;
  promoterId?: string;
  eventPic?: string;
  eventEndTime?: string;
  date?: string;
  eventStartTime?: string;
  repostCount?: number;
  // Make compatible with CRUDModal's Event type
  [key: string]:
    | string
    | string[]
    | number
    | boolean
    | undefined
    | unknown[]
    | Record<string, unknown>;
}

interface UserActions {
  isLiked: boolean;
  isSaved: boolean;
  isReviewed: boolean;
  hasTickets: boolean;
}

interface EventActionsProps {
  event: Event;
  uid: string;
  showComments: () => void;
  shareEvent: () => void;
  handleLike: (eventId: string, uid: string) => void;
  userActions?: UserActions;
}

const EventActions: React.FC<EventActionsProps> = ({
  event,
  uid,
  showComments,
  shareEvent,
  handleLike,
  userActions,
}) => {
  // Use AppDispatch for type safety
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Helper function to check if an event ID exists in an array that might contain
  // either string IDs or objects with eventId/id properties
  const isEventInArray = (
    array: unknown[] | undefined,
    eventId: string
  ): boolean => {
    if (!array || !Array.isArray(array)) return false;

    return array.some((item) => {
      if (typeof item === "string") {
        return item === eventId;
      }
      if (item && typeof item === "object") {
        const itemObj = item as Record<string, unknown>;
        return itemObj.eventId === eventId || itemObj.id === eventId;
      }
      return false;
    });
  };

  // Get profile directly from Redux store
  const profile = useSelector((state: RootState) => state.profile);

  // Local state for tracking user interactions to provide immediate UI feedback
  // Initialize based on profile data first, then fall back to userActions prop
  const [isLiked, setIsLiked] = useState(() => {
    // Directly check if this event ID exists in the profile's likedEvents array using our helper function
    const isInLikedEvents = isEventInArray(profile?.likedEvents, event.id);

    // Fallback to userActions if needed
    const likedFromUserActions = userActions?.isLiked === true;

    // Use profile data first, then fall back to userActions
    return isInLikedEvents || likedFromUserActions;
  });

  // Initialize saved state - prioritizing profile data first
  const [isSaved, setIsSaved] = useState(() => {
    // Directly check if this event ID exists in the profile's userSavedEvents array using our helper function
    const isInSavedEvents = isEventInArray(profile?.userSavedEvents, event.id);

    // Fallback to userActions if needed
    const savedFromUserActions = userActions?.isSaved === true;

    // Use profile data first, then fall back to userActions
    return isInSavedEvents || savedFromUserActions;
  }); // Update local state when userActions changes from props or when profile changes
  // Update local state whenever profile changes or userActions prop changes
  useEffect(() => {
    // Start with default values
    let eventIsLiked = false;
    let eventIsSaved = false;

    // First priority: Check profile data from Redux (source of truth)
    if (profile) {
      // Check if this event is in the user's liked events
      if (profile.likedEvents && Array.isArray(profile.likedEvents)) {
        eventIsLiked = isEventInArray(profile.likedEvents, event.id);
      }

      // Check if this event is in the user's saved events
      if (profile.userSavedEvents && Array.isArray(profile.userSavedEvents)) {
        eventIsSaved = isEventInArray(profile.userSavedEvents, event.id);
      }
    }

    // Second priority: Use userActions if available and profile check was negative
    if (userActions?.isLiked === true && !eventIsLiked) {
      eventIsLiked = true;
    }

    if (userActions?.isSaved === true && !eventIsSaved) {
      eventIsSaved = true;
    }

    // Only update if states are different to avoid render loops
    if (isLiked !== eventIsLiked) {
      setIsLiked(eventIsLiked);
    }

    if (isSaved !== eventIsSaved) {
      setIsSaved(eventIsSaved);
    }
  }, [userActions, profile, event.id, isLiked, isSaved]);

  // Modal states
  const [isCRUDVisible, setIsCRUDVisible] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDateEditMode, setIsDateEditMode] = useState(false);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isShareVisible, setIsShareVisible] = useState(false);

  // Open report modal
  const handleReport = () => {
    setIsCRUDVisible(false); // Close CRUD modal first
    setIsReportModalOpen(true);
  };

  // Handle report submission
  const handleSelectReportReason = (
    reason: string,
    additionalDetails?: string
  ) => {
    setIsReportModalOpen(false);
    // Dispatch reportEvent action
    // Cast to any to avoid TypeScript errors with thunk actions
    dispatch(
      reportEvent(event.id, {
        userId: uid,
        reason,
        additionalDetails,
      })
    );
  };

  // Edit Event Modal
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const isCreator = uid === event?.promoterId;

  const handleCRUD = () => {
    setIsCRUDVisible(true);
  };

  const handleEditEvent = (event: Event) => {
    setIsDateEditMode(false);
    setEventToEdit(event);
    setIsEditModalOpen(true);
  };

  const handleInsights = (event: Event) => {
    if (event && event.id) {
      navigate(`/events/${event.id}/insights`);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEventToEdit(null);
  };

  // Event action handlers
  const handleRepostEvent = () => {
    // Cast to unknown to avoid TypeScript errors with thunk actions
    dispatch(repostEvent(event.id, uid));
  };

  // Enhanced handleLikeEvent to provide immediate UI feedback
  const handleLikeEvent = () => {
    // Toggle the local state for immediate UI feedback
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    // Temporarily update the likes count in the UI for immediate feedback
    if (typeof event.likes === "number") {
      // If we're liking, increment; if unliking, decrement
      event.likes = newLikedState ? event.likes + 1 : event.likes - 1;
    }

    // Call the provided handleLike function to update backend
    handleLike(event.id, uid);
  };

  const handleSaveEvent = () => {
    // Update local state for immediate UI feedback
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    // Dispatch the save action to update the backend
    dispatch(saveEvent(event.id, uid));

    // Provide immediate UI feedback by showing toast
    if (newSavedState) {
      dispatch(
        showToast({ message: "Event saved successfully", type: "success" })
      );
    } else {
      dispatch(
        showToast({ message: "Event removed from saved events", type: "info" })
      );
    }
  };

  // Update event date (open date/time-only modal)
  const handleEditDate = (event: Event) => {
    setIsDateEditMode(true);
    setEventToEdit(event);
    // Close CRUD modal before opening the date modal
    setIsCRUDVisible(false);
    setIsEditModalOpen(true);
  };

  const { error, success } = useSelector(
    (state: { events: { error: string; success: string } }) => state.events
  );

  useEffect(() => {
    if (error && error.includes("reposted")) {
      dispatch(showToast({ message: error, type: "error" }));
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success && success.includes("reposted")) {
      dispatch(showToast({ message: success, type: "success" }));
    }
  }, [success, dispatch]);

  // Variables are now set directly in the state hooks and useEffect

  return (
    <>
      {/* Modals rendered outside the card component */}
      {/* Edit Event Modal (full edit) */}
      <EditEventModal
        isModalOpen={isEditModalOpen && !isDateEditMode}
        closeModal={closeEditModal}
        event={eventToEdit}
      />

      {/* Edit Date/Time Modal (postpone) */}
      <EditEventDateTimeModal
        isOpen={isEditModalOpen && isDateEditMode}
        onClose={closeEditModal}
        event={eventToEdit}
      />

      {/* CRUD Modal */}
      <BaseModal
        isOpen={isCRUDVisible}
        onClose={() => setIsCRUDVisible(false)}
        title="Event Options"
        icon={<FaEllipsisV />}
        className="bg-dark p-0 rounded-xl overflow-hidden shadow-2xl"
        maxWidth="md:max-w-xs"
        minWidth="min-w-fit"
        showCloseButton={false}
      >
        {/* Pass the full event so CRUD actions (Edit/Postpone) receive all fields */}
        <CRUDModal
          setIsCRUDVisible={setIsCRUDVisible}
          onEdit={(e) => handleEditEvent(e as Event)}
          onPostpone={(e) => handleEditDate(e as Event)}
          onDelete={() => {
            // Handle delete logic here
            setIsCRUDVisible(false); // Close modal after deleting
          }}
          onInsights={() => {
            handleInsights(event);
            setIsCRUDVisible(false); // Close modal after viewing insights
          }}
          onReport={handleReport}
          event={event}
          isCreator={isCreator}
        />
      </BaseModal>

      {/* Reviews Modal */}
      <CommentsModal
        user={{
          uid: uid,
          // Pass necessary user properties that CommentsModal expects
          // This adapter pattern helps work with the profile from Redux
          ...(profile || {}),
        }}
        event={{
          id: event.id,
          comments: event.comments || [],
        }}
        isCommentsVisible={isCommentsVisible}
        onClose={() => setIsCommentsVisible(false)}
      />

      {/* Share Modal */}
      <ShareModal
        isVisible={isShareVisible}
        shareUrl={window.location.href} // Gets the current URL
        onClose={() => setIsShareVisible(false)}
      />

      {/* Report Modal */}
      <BaseModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Event"
        icon={<FaExclamationTriangle />}
        className="bg-dark p-0 rounded-xl overflow-hidden shadow-2xl"
        maxWidth="md:max-w-md"
        showCloseButton={false}
      >
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={handleSelectReportReason}
        />
      </BaseModal>

      {/* Event Action Buttons */}

      {/* Toast is now global, not local */}
      <div className="flex w-full justify-between gap-1 md:gap-4 text-gray-400 text-sm md:text-base">
        {/* Reviews */}
        <p className="flex items-center cursor-pointer" onClick={showComments}>
          <FaComment className="w-3 h-3 md:w-4 md:h-4 event-action-icon mr-2" />
          {/* If event.comments is not an array, fallback to 0 */}
          {Array.isArray(event?.comments) ? event.comments.length : 0}
        </p>

        {/* Likes */}
        <p className="flex items-center cursor-pointer">
          <FaHeart
            onClick={handleLikeEvent}
            className={`w-3 h-3 md:w-4 md:h-4 mr-2 ${
              isLiked ? "event-action-heart-active" : "event-action-heart"
            }`}
            style={{ color: isLiked ? "#ef4444" : "" }}
            data-testid="like-button"
            data-liked={isLiked}
            aria-label={isLiked ? "Unlike event" : "Like event"}
          />
          {/* If event.likes is not a number, fallback to 0 */}
          {typeof event?.likes === "number" ? event.likes : 0}
        </p>

        {/* Repost Event */}
        <p className="flex items-center cursor-pointer">
          <FaRetweet
            onClick={handleRepostEvent}
            className="w-4 h-4 md:w-5 md:h-5 event-action-icon mr-2"
          />
          {event?.repostCount || 0}
        </p>

        {/* Save Event */}
        <p className="flex items-center cursor-pointer">
          <FaBookmark
            onClick={handleSaveEvent}
            className={`w-3 h-3 md:w-4 md:h-4 mr-2 ${
              isSaved ? "event-action-bookmark-active" : "event-action-bookmark"
            }`}
            style={{ color: isSaved ? "#eab308" : "" }}
            data-testid="save-button"
            data-saved={isSaved}
            aria-label={isSaved ? "Unsave event" : "Save event"}
          />
        </p>

        {/* Share */}
        <p className="flex items-center cursor-pointer">
          <FaShareAlt
            onClick={shareEvent}
            className="w-3 h-3 md:w-4 md:h-4 event-action-icon mr-2"
          />
        </p>

        {/* More (Three dots) */}
        <p className="flex items-center cursor-pointer" onClick={handleCRUD}>
          <FaEllipsisV className="w-3 h-3 md:w-4 md:h-4 event-action-icon mr-2" />
        </p>
      </div>
    </>
  );
};

export default EventActions;
