import React, { useEffect, useState } from "react";
import {
  FaCalendarPlus,
  FaEnvelope,
  FaMoneyBillAlt,
  FaPlus,
} from "react-icons/fa";
import GuestListModal from "./GuestListModal";
import TippingModal from "./TippingModal";
import BookingModal from "./BookingModal";
import avatar from "/avatar.png";
import cover from "../../src/assets/blue.jpg";
import Tooltip from "./Tooltip";
import { useDispatch, useSelector } from "react-redux";
import FollowersModal from "./FollowersModal";
import { fetchAUserProfile } from "../store/profileSlice";
import { useParams } from "react-router-dom"; // Added for URL params

interface UserProfile {
  name?: string;
  userName?: string;
  bio?: string;
  profilePicUrl?: string;
  coverProfile?: string;
  following?: number;
  followers?: number;
  genre?: { name: string }[];
  emailAddress?: string;
  roles?: { freelancer?: boolean };
}

interface ProfileSectionProps {
  onFollow: () => void;
  onMessage: () => void;
  onAddGuest: (listId: number, guestEmail: string) => void;
  onTip: (amount: number) => void;
  onBook: (data: any) => void;
  isFollowing: boolean;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  onFollow,
  onMessage,
  onAddGuest,
  onTip,
  onBook,
  isFollowing,
}) => {
  const [isGuestListModalOpen, setIsGuestListModalOpen] = useState(false);
  const [isTippingModalOpen, setIsTippingModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  const { uid } = useParams(); // Extract uid from URL
  const dispatch = useDispatch();
  const { userProfile, userFollowing, profile } = useSelector(
    (state) => state.profile
  );

  useEffect(() => {
    if (uid) {
      dispatch(fetchAUserProfile(uid));
    }
    console.log(userProfile?.userProfile?.genre);
  }, [uid, dispatch]);

  const isFreelancer = userProfile?.userProfile?.roles?.freelancer || false;

  // Check if user is following current profile
  const isFollowingUser = userFollowing?.some((user) => user.id === uid);

  return (
    <div className="">
      <div className="relative">
        <img
          src={userProfile?.userProfile?.coverProfile || cover}
          alt="Cover"
          className="w-full h-40 object-cover sm:h-30 md:h-52 mb-4"
        />
        <img
          src={userProfile?.userProfile?.profilePicUrl || avatar}
          alt="Profile"
          className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-gray-900 absolute top-10 left-4 sm:top-32 sm:left-8 md:top-18 md:left-10"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-end gap-4 md:text-sm">
          <div className="flex items-center gap-1">
            <Tooltip text="Add to Guest List">
              <button
                className="border p-[0.25rem] rounded-full border-gray-300 text-gray-400 hover:text-teal-400"
                onClick={() => setIsGuestListModalOpen(true)}
              >
                <FaPlus className="w-3 h-3" />
              </button>
            </Tooltip>
            <Tooltip text="Send Message">
              <button
                className="border p-[0.25rem] rounded-full border-gray-300 text-gray-400 hover:text-teal-400"
                onClick={onMessage}
              >
                <FaEnvelope className="w-3 h-3" />
              </button>
            </Tooltip>
            {isFreelancer && (
              <div className="flex items-center gap-1">
                <Tooltip text="Tip Freelancer">
                  <button
                    onClick={() => setIsTippingModalOpen(true)}
                    className="border p-[0.25rem] rounded-full border-gray-300 text-gray-400 hover:text-teal-400"
                  >
                    <FaMoneyBillAlt className="w-3 h-3" />
                  </button>
                </Tooltip>
                <Tooltip text="Book Freelancer">
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="border p-[0.25rem] rounded-full border-gray-300 text-gray-400 hover:text-teal-400"
                  >
                    <FaCalendarPlus className="w-3 h-3" />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
          <Tooltip text={isFollowingUser ? "Unfollow" : "Follow"}>
            <button
              onClick={onFollow}
              className={`border sm:text-xs px-4 py-1 rounded-2xl ${
                isFollowingUser
                  ? "border-teal-400 text-teal-400"
                  : "border-teal-400 text-teal-400"
              }`}
            >
              {isFollowingUser ? "Following" : "Follow"}
            </button>
          </Tooltip>
        </div>
        <h1 className="text-2xl font-bold">
          {userProfile?.userProfile?.name || "Name"}
        </h1>
        <p className="text-sm text-gray-400">
          @{userProfile?.userProfile?.userName || "username"}
        </p>
        <p className="mt-2">
          {userProfile?.userProfile?.bio || "No bio available"}
        </p>

        <div className="flex flex-row justify-between">
          <div className="flex-row gap-4 mt-2">
            <div className="flex gap-2 mb-2 text-gray-500">
              <p
                className="border-b border-transparent hover:border-gray-600 hover:border-b cursor-pointer"
                onClick={() => setIsFollowingModalOpen(true)}
              >
                <span className="font-bold text-teal-400">
                  {userProfile?.userFollowing?.length || 0}
                </span>{" "}
                Following
              </p>
              <p
                className="border-b border-transparent hover:border-gray-600 hover:border-b cursor-pointer"
                onClick={() => setIsFollowersModalOpen(true)}
              >
                <span className="font-bold text-teal-400">
                  {userProfile?.userFollowers?.length || 0}
                </span>{" "}
                Followers
              </p>
            </div>
            <div className="flex">
              {userProfile?.userProfile?.genre?.length > 0 && (
                <div className="flex gap-2 my-2">
                  {userProfile.userProfile.genre
                    .slice(0, 3)
                    .map((genre, index) => (
                      <p
                        key={index}
                        className="text-xs px-2 py-1 border border-teal-400 rounded-xl font-medium text-teal-400"
                      >
                        {genre.name || genre}
                      </p>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <GuestListModal
        isOpen={isGuestListModalOpen}
        onClose={() => setIsGuestListModalOpen(false)}
        onAddGuest={onAddGuest}
        preFilledEmail={userProfile?.userProfile?.emailAddress}
      />

      <TippingModal
        isOpen={isTippingModalOpen}
        onClose={() => setIsTippingModalOpen(false)}
        onSubmit={onTip}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={onBook}
      />

      <FollowersModal
        title="Followers"
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        users={userProfile?.userFollowers}
      />

      <FollowersModal
        title="Following"
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        users={userProfile?.userFollowing}
      />
    </div>
  );
};

export default ProfileSection;
