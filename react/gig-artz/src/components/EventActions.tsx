import {
  FaComment,
  FaEllipsisV,
  FaHeart,
  FaRegBookmark,
  FaRetweet,
  FaShareAlt,
} from "react-icons/fa";
import CRUDModal from "../components/CRUDModal";
import EditEventModal from "../components/EditEventModal";
import ReportModal from "./ReportModal";
import { useEffect, useState } from "react";
import type { UserProfile } from "../../store/profileSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ShareModal from "./ShareModal";
import CommentsModal from "./CommentsModal";
import { repostEvent, saveEvent, reportEvent } from "../../store/eventsSlice";
import { showToast } from "../../store/notificationSlice";

// Define Event type locally (copy from Home.tsx)
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
}

interface EventActionsProps {
  event: Event;
  profile: UserProfile | null;
  uid: string;
  showComments: () => void;
  shareEvent: () => void;
  handleLike: (eventId: string, uid: string) => void;
}

const EventActions: React.FC<EventActionsProps> = ({
  event,
  profile,
  uid,
  showComments,
  shareEvent,
  handleLike,
}) => {
  // Use AppDispatch if available for type safety
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const { likedEvents: profileLikedEvents } = useSelector(
    (state: { profile: { likedEvents: { eventId: string }[] } }) =>
      state.profile
  );

  // Load liked events from profile
  useEffect(() => {
    if (profile) {
      const likedEventIds =
        profileLikedEvents?.map((event) => event.eventId) || [];
      setLikedEvents(likedEventIds);
    }
  }, [profile, profileLikedEvents]);

  // Ensure liked events stay updated
  useEffect(() => {
    if (event?.id && !likedEvents.includes(event?.id)) {
      // No-op: no profile.likedEvents in UserProfile
    }
  }, [event?.id, profile, likedEvents]);

  // CRUD Modal
  const [isCRUDVisible, setIsCRUDVisible] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const handleReport = () => {
    setIsReportModalOpen(true);
  };

  const handleSelectReportReason = (
    reason: string,
    additionalDetails?: string
  ) => {
    setIsReportModalOpen(false);
    // Dispatch reportEvent action
    dispatch(reportEvent(event.id, { userId: uid, reason, additionalDetails }));
  };

  // Edit Event Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const isCreator = uid === event?.promoterId;

  const handleCRUD = () => {
    setIsCRUDVisible(true);
  };

  const handleEditEvent = (event: Event) => {
    setEventToEdit(event);
    setIsEditModalOpen(true);
  };

  const handleInsights = (event: Event) => {
    if (event && event.id) {
      navigate(`/events/${event.id}/insights`);
    }
  };

  // Reviews Modal
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);

  // Share Modal
  const [isShareVisible, setIsShareVisible] = useState(false);

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEventToEdit(null);
  };

  // Event action handlers
  const handleRepostEvent = () => {
    dispatch(repostEvent(event.id, uid));
  };
  const handleSaveEvent = () => {
    dispatch(saveEvent(event.id, uid));
  };

  const { error, success } = useSelector((state: any) => state.events);

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

  return (
    <>
      <div>
        {/* Edit Event Modal */}
        {isEditModalOpen && (
          <EditEventModal
            isModalOpen={isEditModalOpen}
            closeModal={closeEditModal}
            event={eventToEdit}
          />
        )}

        {/* CRUD Modal */}
        {isCRUDVisible && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={() => setIsCRUDVisible(false)} // Close on backdrop click
          >
            <div
              className="bg-white rounded-lg p-6 shadow-lg relative"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <CRUDModal
                setIsCRUDVisible={setIsCRUDVisible}
                onEdit={handleEditEvent}
                onDelete={() => {
                  console.log("Delete event");
                  setIsCRUDVisible(false); // Close modal after deleting
                }}
                onInsights={() => {
                  handleInsights(event);
                  setIsCRUDVisible(false); // Close modal after viewing insights
                }}
                event={event}
                isCreator={isCreator}
              />
            </div>
          </div>
        )}

        {/* Reviews Modal */}
        {isCommentsVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <CommentsModal
              user={profile}
              event={event}
              isCommentsVisible={isCommentsVisible}
              onClose={() => setIsCommentsVisible(false)}
            />
          </div>
        )}

        {/* Share Modal */}
        {isShareVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <ShareModal
              isVisible={isShareVisible}
              shareUrl={window.location.href} // Gets the current URL
              onClose={() => setIsShareVisible(false)}
            />
          </div>
        )}
      </div>
      
      {/* Toast is now global, not local */}
      <div className="flex w-full justify-between gap-1 md:gap-4 text-gray-400 text-sm md:text-base">
        {/* Reviews */}
        <p className="flex items-center cursor-pointer" onClick={showComments}>
          <FaComment className=" w-3 h-3 md:w-4 md:h-4 hover:text-teal-500 mr-2" />
          {/* If event.comments is not an array, fallback to 0 */}
          {Array.isArray(event?.comments) ? event.comments.length : 0}
        </p>

        {/* Likes */}
        <p className="flex items-center cursor-pointer">
          <FaHeart
            onClick={() => handleLike(event?.id, uid)}
            className={`w-3 h-3 md:w-4 md:h-4 mr-2 ${
              likedEvents?.includes(event.id)
                ? "text-red-500"
                : "hover:text-red-500"
            }`}
          />
          {/* If event.likes is not a number, fallback to 0 */}
          {typeof event?.likes === "number" ? event.likes : 0}
        </p>

        {/* Repost Event */}
        <p className="flex items-center cursor-pointer">
          <FaRetweet
            onClick={handleRepostEvent}
            className="w-4 h-4 md:w-5 md:h-5 hover:text-teal-500 mr-2"
          />
          {typeof event?.repostCount === "number" ? event?.repostCount : 0}
        </p>

        {/* Save Event */}
        <p className="flex items-center cursor-pointer">
          <FaRegBookmark
            onClick={handleSaveEvent}
            className="w-3 h-3 md:w-4 md:h-4 hover:text-teal-500 mr-2"
          />
        </p>

        {/* Share */}
        <p className="flex items-center cursor-pointer">
          <FaShareAlt
            onClick={shareEvent}
            className="w-3 h-3 md:w-4 md:h-4 hover:text-teal-500 mr-2"
          />
        </p>

        {/* More (Three dots) */}
        <p className="flex items-center cursor-pointer" onClick={handleCRUD}>
          <FaEllipsisV className="w-3 h-3 md:w-4 md:h-4 hover:text-teal-500 mr-2" />
        </p>
      </div>
    </>
  );
};

export default EventActions;
