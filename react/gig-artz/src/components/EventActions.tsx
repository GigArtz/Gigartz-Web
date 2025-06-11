import {
  FaComment,
  FaEllipsisV,
  FaExclamationTriangle,
  FaHeart,
  FaRegBookmark,
  FaRetweet,
  FaShareAlt,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { UserProfile } from "../../store/profileSlice";
import { useSelector } from "react-redux";

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

  return (
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
      </p>

      {/* Share */}
      <p className="flex items-center cursor-pointer">
        <FaShareAlt
          onClick={shareEvent}
          className="w-3 h-3 md:w-4 md:h-4 hover:text-teal-500 mr-2"
        />
      </p>

      {/* More (Three dots) */}
      <p className="flex items-center cursor-pointer" onClick={toggleModal}>
        <FaEllipsisV className="w-3 h-3 md:w-4 md:h-4 hover:text-teal-500 mr-2" />
      </p>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-dark rounded-lg p-4 w-1/3 max-w-sm"
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
          >
            <h3 className="text-lg text-white font-semibold mb-4">More Options</h3>
            <div className="flex flex-col space-y-3">
              <button className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600">
                Save Event
              </button>
              <button className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600">
                Report Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventActions;
