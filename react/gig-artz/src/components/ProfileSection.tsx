import React, { useState } from "react";
import {
  FaCalendarPlus,
  FaEnvelope,
  FaMoneyBillAlt,
  FaPlus,
} from "react-icons/fa";
import GuestListModal from "./GuestListModal";
import TippingModal from "./TippingModal";
import BookingModal from "./BookingModal";
import avatar from "../../public/avatar.png";
import cover from "../../src/assets/blue.jpg";
import Tooltip from "./Tooltip";

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
  userProfile: UserProfile;
  onFollow: () => void;
  onMessage: () => void;
  onAddGuest: (listId: number, guestEmail: string) => void;
  onTip: (amount: number) => void;
  onBook: (data: any) => void;
  isFollowing: boolean;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  userProfile,
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

  const isFreelancer = userProfile?.roles?.freelancer || false;
  const [currentUser, setCurrentUser] = useState();

  return (
    <div className="">
      <div className="relative">
        <img
          src={userProfile?.coverProfile || cover}
          alt="Cover"
          className="w-full h-40 object-cover sm:h-30 md:h-52 mb-4"
        />
        <img
          src={userProfile?.profilePicUrl || avatar}
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
              <>
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
              </>
            )}
          </div>
          <Tooltip text={isFollowing ? "Unfollow" : "Follow"}>
            <button
              onClick={onFollow}
              className={`border px-4 py-1 rounded-2xl ${
                isFollowing
                  ? "bg-gray-500 text-white"
                  : "border-teal-400 text-teal-400"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </Tooltip>
        </div>
        <h1 className="text-2xl font-bold">{userProfile?.name || "Name"}</h1>
        <p className="text-sm text-gray-400">
          @{userProfile?.userName || "username"}
        </p>
        <p className="mt-2">{userProfile?.bio || "No bio available"}</p>
        <div className="flex flex-row justify-between">
          <div className="flex-row gap-4 mt-2">
            <div className="flex gap-2">
              <p>
                <span className="font-bold text-teal-400">
                  {userProfile?.following || 0}
                </span>{" "}
                Following
              </p>
              <p>
                <span className="font-bold text-teal-400">
                  {userProfile?.followers || 0}
                </span>{" "}
                Followers
              </p>
            </div>
            <div className="flex">
              <div className="flex gap-2 my-2">
                {(userProfile?.genre || []).slice(0, 3).map((genre, index) => (
                  <div key={index}>
                    <p className="text-xs px-2 py-1 border border-teal-400 rounded-xl font-medium text-teal-400">
                      {genre.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <GuestListModal
        isOpen={isGuestListModalOpen}
        onClose={() => setIsGuestListModalOpen(false)}
        onAddGuest={onAddGuest}
        preFilledEmail={userProfile?.emailAddress}
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
    </div>
  );
};

export default ProfileSection;
