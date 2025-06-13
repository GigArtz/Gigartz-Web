import {
  FaComment,
  FaEllipsisV,
  FaExclamationTriangle,
  FaHeart,
  FaRegBookmark,
  FaRetweet,
  FaShareAlt,
} from "react-icons/fa";
import CRUDModal from "../components/CRUDModal";
import EditEventModal from "../components/EditEventModal";
import { useEffect, useState } from "react";
import { UserProfile } from "../../store/profileSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface EventActionsProps {
  event: Event;
  profile: UserProfile | null;
  uid: string;
  showComments: () => void;
  shareEvent: () => void;
  handleLike: (uid: string, eventId: string) => void;
}

const EventActions: React.FC<EventActionsProps> = ({
  event,
  profile,
  uid,
  showComments,
  shareEvent,
  handleLike,
}) => {
  const navigate = useNavigate();
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const { likedEvents: profileLikedEvents } = useSelector(
    (state) => state.profile
  );

  // Load liked events from profile
  useEffect(() => {
    if (profile) {
      const likedEventIds =
        profileLikedEvents?.map((event) => event.eventId) || [];
      setLikedEvents(likedEventIds);
    }
  }, [profile]);

  // Ensure liked events stay updated
  useEffect(() => {
    if (event?.id && !likedEvents.includes(event?.id)) {
      const isLiked = profile?.likedEvents?.some((e) => e.eventId === event.id);
      if (isLiked) {
        setLikedEvents((prevLikedEvents) => [...prevLikedEvents, event.id]);
      }
    }
  }, [event?.id, profile, likedEvents]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toggles the "More" modal
  const toggleModal = () => setIsModalOpen(!isModalOpen);

    // CRUD Modal
    const [isCRUDVisible, setIsCRUDVisible] = useState(false);
  
    // Edit Event Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
    const [isCreator, setIsCreator] = useState(uid === event?.promoterId );
  

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

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEventToEdit(null);
  };
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
      </div>
      <div className="flex w-full justify-between gap-1 md:gap-4 text-gray-400 text-sm md:text-base">
        {/* Reviews */}
        <p className="flex items-center cursor-pointer" onClick={showComments}>
          <FaComment className=" w-3 h-3 md:w-4 md:h-4 hover:text-teal-500 mr-2" />
          {event?.comments?.length}
        </p>

        {/* Likes */}
        <p className="flex items-center cursor-pointer">
          <FaHeart
            onClick={() => handleLike(event?.id, uid || profile?.id)}
            className={`w-3 h-3 md:w-4 md:h-4 mr-2 ${
              likedEvents?.includes(event.id)
                ? "text-red-500"
                : "hover:text-red-500"
            }`}
          />
          {event?.likes}
        </p>

        {/* Share */}
        <p className="flex items-center cursor-pointer">
          <FaRetweet
            onClick={shareEvent}
            className="w-4 h-4 md:w-5 md:h-5 hover:text-teal-500 mr-2"
          />
          {event?.likes}
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
