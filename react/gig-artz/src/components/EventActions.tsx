import { FaComment, FaHeart, FaShareAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { UserProfile } from "../store/profileSlice";
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
  const { likedEvents: profileLikedEvents } = useSelector((state) => state.profile);


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

  return (
    <div className="flex gap-4 text-gray-400 text-sm md:text-base">
      {/* Comments */}
      <p className="flex items-center cursor-pointer" onClick={showComments}>
        <FaComment className="w-4 h-4 hover:text-teal-500 mr-2" />
        {event?.comments?.length}
      </p>

      {/* Likes */}
      <p className="flex items-center cursor-pointer">
        <FaHeart
          onClick={() => handleLike(event?.id, uid || profile?.id)}
          className={`w-4 h-4 mr-2 ${
            likedEvents?.includes(event.id)
              ? "text-red-500"
              : "hover:text-red-500"
          }`}
        />
        {event?.likes}
      </p>

      {/* Share */}
      <p className="flex items-center cursor-pointer">
        <FaShareAlt
          onClick={shareEvent}
          className="w-4 h-4 hover:text-teal-500 mr-2"
        />
      </p>
    </div>
  );
};

export default EventActions;
