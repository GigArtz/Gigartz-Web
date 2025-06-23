import React, { useEffect, useState } from "react";
import {
  FaCalendarPlus,
  FaEnvelope,
  FaLink,
  FaMapMarkerAlt,
  FaMoneyBillAlt,
  FaPlus,
  FaSpinner,
} from "react-icons/fa";
import GuestListModal from "./GuestListModal";
import TippingModal from "./TippingModal";
import BookingModal from "./BookingModal";
import avatar from "/avatar.png";
import cover from "../../src/assets/blue.jpg";
import Tooltip from "./Tooltip";
import { useDispatch, useSelector } from "react-redux";
import FollowersModal from "./FollowersModal";
import { fetchAUserProfile } from "../../store/profileSlice";
import { useParams } from "react-router-dom"; // Added for URL params
import Profile from "@/pages/Profile";
import ProfileSectionUI from "./ProfileSectionUI";
import GuestListModalFromGuestList from "./GuestListModalFromGuestList";
import SocialLinksModal from "./SocialLinksModal";

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
  const { userProfile, userFollowing, loading } = useSelector(
    (state) => state.profile
  );

  useEffect(() => {
    if (uid) {
      dispatch(fetchAUserProfile(uid));

      // Check if the user is following the current profile
    }
  }, [uid, dispatch]);

  const isFreelancer = userProfile?.userProfile?.roles?.freelancer || false;
  const isAcceptingBookings = userProfile?.userProfile?.acceptBookings || false;
  const isAcceptingTips = userProfile?.userProfile?.acceptTips || false;

  // Check if user is following current profile
  const isFollowingUser = userFollowing?.some((user) => user.id === uid);

  // Handle profile tags
  const [showAllTags, setShowAllTags] = useState(false);
  const defaultTagCount = 3; // or whatever your default number is

  const [showSocialLinksModal, setShowSocialLinksModal] = useState(false);
  const [formattedSocialLinks, setFormattedSocialLinks] = useState<
    { platform: string; url: string }[]
  >([]);

  const handleSocialLinks = () => {
    if (!userProfile?.userProfile) return;

    const profile = userProfile?.userProfile;

    const knownPlatforms = [
      "twitter",
      "facebook",
      "instagram",
      "linkedin",
      "youtube",
      "tiktok",
      "website",
    ];

    const socialLinks = knownPlatforms
      .filter((key) => profile[key]) // only include non-empty
      .map((platform) => ({
        platform,
        url: profile[platform], // assume it's either a label or URL
      }));

    console.log("✅ Social Links:", socialLinks);

    // You can now open the modal and pass these:
   // setShowSocialLinksModal(true);
    setFormattedSocialLinks(socialLinks);
  };

  useEffect(() => {
  if (userProfile?.userProfile) {
    handleSocialLinks();
  }
}, [userProfile?.userProfile]);
  
  return (
    <div className="">
      <div className="block justify-center items-center bg-dark rounded-lg shadow-md">
        {loading ? (
          <ProfileSectionUI />
        ) : (
          <div>
            <div className="relative">
              <img
                src={userProfile?.userProfile?.coverProfile || cover}
                alt="Cover"
                className="w-full h-40 object-cover rounded-2xl sm:h-30 md:h-52 mb-4"
              />
              <img
                src={userProfile?.userProfile?.profilePicUrl || avatar}
                alt="Profile"
                className="w-20 h-20 sm:w-28 sm:h-28 min-w-20 min-h-20 max-w-28 max-h-28 rounded-full border-4 border-gray-900 absolute top-10 left-4 sm:top-32 sm:left-8 md:top-18 md:left-10 cursor-pointer object-cover"
              />
              <div></div>
              <div className="p-5">
                <div className="flex justify-end gap-4 md:text-sm">
                  <div className="flex items-center gap-1">
                    <Tooltip text="Add to Guest List">
                      <button
                        className="p-[0.25rem] rounded-full hover:bg-teal-500 hover:text-white bg-dark text-gray-400"
                        onClick={() => setIsGuestListModalOpen(true)}
                      >
                        <FaPlus className="w-3 h-3" />
                      </button>
                    </Tooltip>
                    <Tooltip text="Send Message">
                      <button
                        className="p-[0.25rem] rounded-full hover:bg-teal-500 hover:text-white bg-dark text-gray-400"
                        onClick={onMessage}
                      >
                        <FaEnvelope className="w-3 h-3" />
                      </button>
                    </Tooltip>
                    {isFreelancer && (
                      <div className="flex items-center gap-1">
                        {isAcceptingTips && (
                          <Tooltip text="Tip Freelancer">
                            <button
                              onClick={() => setIsTippingModalOpen(true)}
                              className="p-[0.25rem] rounded-full hover:bg-teal-500 hover:text-white bg-dark text-gray-400"
                            >
                              <FaMoneyBillAlt className="w-3 h-3" />
                            </button>
                          </Tooltip>
                        )}
                        {isAcceptingBookings && (
                          <Tooltip text="Book Freelancer">
                            <button
                              onClick={() => setIsBookingModalOpen(true)}
                              className="p-[0.25rem] rounded-full hover:bg-teal-500 hover:text-white bg-dark text-gray-400"
                            >
                              <FaCalendarPlus className="w-3 h-3" />
                            </button>
                          </Tooltip>
                        )}

                        {formattedSocialLinks.length > 0 && (
                    <Tooltip text="Link Tree">
                      <button
                        onClick={() => setShowSocialLinksModal(true)}
                        className="p-[0.25rem] rounded-full hover:bg-teal-500 hover:text-white bg-dark text-gray-400"
                      >
                        <FaLink className="w-3 h-3" />
                      </button>
                    </Tooltip>
                  )}
                      </div>
                    )}
                  </div>
                  <Tooltip text={isFollowingUser ? "Unfollow" : "Follow"}>
                    <button
                      onClick={onFollow}
                      className={`border text-xs px-4 py-1 rounded-2xl ${
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
                <div className="flex gap-1 items-center text-sm text-gray-400">
                  <FaMapMarkerAlt />
                  {userProfile?.userProfile?.city || "location"}
                </div>
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
                      {Array.isArray(userProfile?.userProfile?.genre) &&
                        userProfile.userProfile.genre.length > 0 && (
                          <div className="flex items-center">
                            <div className="flex gap-2 my-2 overflow-x-auto whitespace-nowrap px-1 hide-scrollbar md:max-w-96 max-w-56 pb-1">
                              {userProfile.userProfile.genre
                                ?.slice(
                                  0,
                                  showAllTags
                                    ? userProfile.userProfile.genre.length
                                    : defaultTagCount
                                )
                                .map((genre, index) => (
                                  <p
                                    key={index}
                                    className="text-xs inline-block px-2 py-1 border border-teal-400 rounded-xl font-medium text-teal-400"
                                  >
                                    {typeof genre === "string"
                                      ? genre
                                      : genre.name}
                                  </p>
                                ))}
                            </div>

                            {userProfile.userProfile.genre.length >
                              defaultTagCount && (
                              <p
                                className="ml-1 text-xs text-gray-500 cursor-pointer hover:text-teal-400"
                                onClick={() => setShowAllTags((prev) => !prev)}
                              >
                                {showAllTags
                                  ? "See less"
                                  : `+${
                                      userProfile.userProfile.genre.length -
                                      defaultTagCount
                                    } more`}
                              </p>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <GuestListModalFromGuestList
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
        services={userProfile?.userProfile?.services}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={onBook}
      />
      <SocialLinksModal
        isOpen={showSocialLinksModal}
        onClose={() => setShowSocialLinksModal(false)}
        links={formattedSocialLinks}
        userName={userProfile?.userProfile?.userName || ""}
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
