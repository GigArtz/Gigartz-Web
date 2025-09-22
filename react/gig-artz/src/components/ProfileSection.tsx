import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
const handleCommentSubmit = (
  review: string,
  rating: number,
  taggedUserName?: string
) => {
  if (!user?.uid) {
    console.error("Missing user info for review submission.");
    return;
  }

  // When reviewing a specific user, use their ID directly
  const reviewedUserId = uid || "";

  if (!reviewedUserId) {
    console.error("Missing reviewed user ID for review submission.");
    return;
  }

  console.log("Dispatching reviewUser", {
    reviewerId: user.uid,
    reviewedUserId,
    rating,
    review,
  });

  dispatch(
    reviewUser(
      user.uid, // reviewerId
      reviewedUserId, // reviewedUserId (userId, not name)
      rating,
      review,
      "", // title
      [] // tags
    )
  );

  // Close the modal after submission
  setIsCommentModalOpen(false);
};

// Use visitedProfile for other users, userProfile for current user
const authUser = localStorage.getItem("authUser");
import {
  FaCalendarPlus,
  FaEnvelope,
  FaLink,
  FaMapMarkerAlt,
  FaMoneyBillAlt,
  FaPlus,
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaLinkedin,
  FaYoutube,
  FaGlobe,
  FaFacebook,
  FaTiktok,
  FaStar,
  FaPen,
  FaTimesCircle,
} from "react-icons/fa";
import TippingModal from "./TippingModal";
import BookingModal from "./BookingModal";
import avatar from "/avatar.png";
import cover from "../../src/assets/blue.jpg";
import Tooltip from "./Tooltip";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import FollowersModal from "./FollowersModal";
import { RootState, AppDispatch } from "../../store/store";
import { useParams } from "react-router-dom";
import ProfileSectionUI from "./ProfileSectionUI";
import GuestListModalFromGuestList from "./GuestListModalFromGuestList";
import CommentForm from "./CommentForm";
import { reviewUser } from "../../store/profileSlice";
// Social links now displayed inline

interface ProfileSectionProps {
  onFollow: () => void;
  onMessage: () => void;
  onAddGuest: (listId: number, guestEmail: string) => void;
  onTip: (amount: number) => void;
  onBook: (data: unknown) => void;
  onSocialLinks?: () => void;
  isFollowing?: boolean;
}

// Define iconMap to use with social links
const iconMap: Record<string, JSX.Element> = {
  twitter: <FaTwitter />,
  instagram: <FaInstagram />,
  facebook: <FaFacebook />,
  github: <FaGithub />,
  linkedin: <FaLinkedin />,
  youtube: <FaYoutube />,
  tiktok: <FaTiktok />,
  website: <FaGlobe />,
};

const ProfileSection: React.FC<ProfileSectionProps> = React.memo(
  ({ onFollow, onMessage, onAddGuest, onTip, onBook }) => {
    const [isGuestListModalOpen, setIsGuestListModalOpen] = useState(false);
    const [isTippingModalOpen, setIsTippingModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
    const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
    const [isSocialDropdownOpen, setIsSocialDropdownOpen] = useState(false);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const socialLinksDropdownRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch<AppDispatch>();

    const { uid } = useParams(); // Extract uid from URL
    const {
      userProfile,
      visitedProfile,
      userFollowing,
      userFollowers,
      loading,
    } = useSelector((state: RootState) => state.profile, shallowEqual);
    const { user } = useSelector((state: RootState) => state.auth);

    // Use visitedProfile for other users, userProfile for current user
    const authUser = localStorage.getItem("authUser");

    const handleCommentSubmit = (review: string, rating: number) => {
      if (!user?.uid) {
        console.error("Missing user info for review submission.");
        return;
      }

      // When reviewing a specific user, use their ID directly
      const reviewedUserId = uid || "";

      if (!reviewedUserId) {
        console.error("Missing reviewed user ID for review submission.");
        return;
      }

      console.log("Dispatching reviewUser", {
        reviewerId: user.uid,
        reviewedUserId,
        rating,
        review,
      });

      dispatch(
        reviewUser(
          user.uid, // reviewerId
          reviewedUserId, // reviewedUserId (userId, not name)
          rating,
          review,
          "", // title
          [] // tags
        )
      );

      // Close the modal after submission
      setIsCommentModalOpen(false);
    };
    let currentUserId = null;
    try {
      if (authUser) {
        const parsedAuthUser = JSON.parse(authUser);
        currentUserId = parsedAuthUser?.uid || parsedAuthUser?.id;
      }
    } catch (error) {
      console.error("Error parsing authUser from localStorage:", error);
    }

    const isOwnProfile = uid === currentUserId && currentUserId !== null;

    // Get the correct profile data based on whether it's own profile or visited profile
    // Now visitedProfile has a dedicated userProfile field
    const displayProfile = isOwnProfile
      ? userProfile
      : visitedProfile?.userProfile || userProfile;

    // Determine followers/following data based on profile type
    const followersData = useMemo(() => {
      return isOwnProfile ? userFollowers : visitedProfile?.userFollowers || [];
    }, [isOwnProfile, userFollowers, visitedProfile?.userFollowers]);

    const followingData = useMemo(() => {
      return isOwnProfile ? userFollowing : visitedProfile?.userFollowing || [];
    }, [isOwnProfile, userFollowing, visitedProfile?.userFollowing]);

    // Profile data usage debug logging removed to improve performance
    console.log("visitedProfile:", visitedProfile);
    console.log("isOwnProfile:", isOwnProfile);
    console.log("displayProfile:", displayProfile);

    const isFreelancer =
      displayProfile?.roles?.freelancer ||
      displayProfile?.roles?.admin ||
      false;
    const isAcceptingBookings = displayProfile?.acceptBookings || false;
    const isAcceptingTips = displayProfile?.acceptTips || false;

    // Check if user is following current profile
    const isFollowingUser = userFollowing?.some((user) => user.id === uid);

    // Handle profile tags
    const [showAllTags, setShowAllTags] = useState(false);
    const defaultTagCount = 3; // or whatever your default number is

    // State for social links
    const [formattedSocialLinks, setFormattedSocialLinks] = useState<
      { platform: string; url: string }[]
    >([]);

    const handleSocialLinks = useCallback(() => {
      if (!displayProfile) return;

      const profile = displayProfile;

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

      setFormattedSocialLinks(socialLinks);
    }, [displayProfile]);

    useEffect(() => {
      if (displayProfile) {
        handleSocialLinks();
      }
    }, [displayProfile, handleSocialLinks]);

    // Handle click outside for social links dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          socialLinksDropdownRef.current &&
          !socialLinksDropdownRef.current.contains(event.target as Node)
        ) {
          setIsSocialDropdownOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div className="">
        <div className="block justify-center items-center bg-dark rounded-lg shadow-md">
          {loading ? (
            <ProfileSectionUI />
          ) : (
            <div>
              <div className="relative">
                <img
                  src={displayProfile?.coverProfile || cover}
                  alt="Cover"
                  className="w-full h-40 object-cover rounded-2xl sm:h-30 md:h-52 mb-4"
                />
                <img
                  src={displayProfile?.profilePicUrl || avatar}
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

                          {/* Review Button */}
                          {!isOwnProfile && (
                            <Tooltip text="Review Profile">
                              <button
                                onClick={() => setIsCommentModalOpen(true)}
                                className="p-[0.25rem] rounded-full hover:bg-teal-500 hover:text-white bg-dark text-gray-400"
                              >
                                <FaPen className="w-3 h-3" />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      )}

                      {/* Social Media Links Dropdown */}
                      {formattedSocialLinks.length > 0 && (
                        <div className="relative" ref={socialLinksDropdownRef}>
                          <Tooltip text="Social Links">
                            <button
                              onClick={() =>
                                setIsSocialDropdownOpen(!isSocialDropdownOpen)
                              }
                              className="p-[0.25rem] rounded-full hover:bg-teal-500 hover:text-white bg-dark text-gray-400"
                            >
                              <FaLink className="w-3 h-3" />
                            </button>
                          </Tooltip>

                          {/* Dropdown Menu */}
                          {isSocialDropdownOpen && (
                            <div className="absolute right-0 mt-1 rounded-md shadow-lg z-50 p-1">
                              {formattedSocialLinks.map(
                                ({ platform, url }, index) => (
                                  <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 text-sm rounded-full text-white hover:bg-gray-700 transition-colors"
                                  >
                                    <span className="text-teal-400">
                                      {iconMap[platform.toLowerCase()] || (
                                        <FaGlobe />
                                      )}
                                    </span>
                                  </a>
                                )
                              )}
                            </div>
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
                    {displayProfile?.name || "Name"}
                  </h1>
                  <p className="text-sm text-gray-400">
                    @{displayProfile?.userName || "username"}
                  </p>
                  <p className="mt-2">
                    {displayProfile?.bio || "No bio available"}
                  </p>
                  <div className="flex gap-1 items-center text-sm text-gray-400 mb-2">
                    <FaMapMarkerAlt />
                    {displayProfile?.city || "location"}
                  </div>
                  {/* Rating display - always show, grayed out stars for no rating */}
                  <div className="flex gap-1 items-center text-sm text-gray-400">
                    <div className="flex gap-1">
                      {displayProfile?.rating && displayProfile.rating > 0 ? (
                        <>
                          {[...Array(Math.floor(displayProfile.rating))].map(
                            (_, index) => (
                              <FaStar key={index} className="text-yellow-400" />
                            )
                          )}
                          {/* Show partial star if rating has decimal */}
                          {displayProfile.rating % 1 >= 0.5 && (
                            <FaStar className="text-yellow-200" />
                          )}
                          {/* Fill remaining stars with gray */}
                          {[...Array(5 - Math.ceil(displayProfile.rating))].map(
                            (_, index) => (
                              <FaStar
                                key={`gray-${index}`}
                                className="text-gray-600"
                              />
                            )
                          )}
                        </>
                      ) : (
                        // Show 5 grayed out stars when no rating
                        [...Array(5)].map((_, index) => (
                          <FaStar key={index} className="text-gray-600" />
                        ))
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        displayProfile?.rating && displayProfile.rating > 0
                          ? "text-yellow-400"
                          : "text-gray-500"
                      }`}
                    >
                      {displayProfile?.rating && displayProfile.rating > 0
                        ? displayProfile.rating.toFixed(1)
                        : "No rating"}
                    </span>
                    <span className="text-gray-400">
                      ({displayProfile?.reviews?.reviewReceived || 0} reviews)
                    </span>
                  </div>
                  <div className="flex flex-row justify-between">
                    <div className="flex-row gap-4 mt-2">
                      <div className="flex gap-2 mb-2 text-gray-500">
                        <p
                          className="border-b border-transparent hover:border-gray-600 hover:border-b cursor-pointer"
                          onClick={() => setIsFollowingModalOpen(true)}
                        >
                          <span className="font-bold text-teal-400">
                            {followingData?.length || 0}
                          </span>{" "}
                          Following
                        </p>
                        <p
                          className="border-b border-transparent hover:border-gray-600 hover:border-b cursor-pointer"
                          onClick={() => setIsFollowersModalOpen(true)}
                        >
                          <span className="font-bold text-teal-400">
                            {followersData?.length || 0}
                          </span>{" "}
                          Followers
                        </p>
                      </div>
                      <div className="flex flex-row mb-1 max-w-[85%] justify-between w-full text-wrap">
                        {Array.isArray(displayProfile?.genre) &&
                          displayProfile.genre.length > 0 && (
                            <div className="flex items-start flex-wrap">
                              <div className="flex gap-2 my-2 pb-2 overflow-x-auto whitespace-nowrap px-1 custom-scrollbar ">
                                {displayProfile.genre
                                  .map((genre, index) => (
                                    <span
                                      key={index}
                                      className="text-xs px-3 py-1 border border-teal-400 rounded-full font-medium text-teal-500 shrink-0"
                                    >
                                      {typeof genre === "string"
                                        ? genre
                                        : genre.name}
                                    </span>
                                  ))}
                              </div>
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
          preFilledEmail={displayProfile?.emailAddress}
        />
        <TippingModal
          isOpen={isTippingModalOpen}
          onClose={() => setIsTippingModalOpen(false)}
          onSubmit={onTip}
          artistId={uid || ""}
          customerUid={currentUserId || ""}
        />
        <BookingModal
          services={displayProfile?.services}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onSubmit={onBook}
        />
        {/* Social Links Modal removed - now displayed as dropdown */}
        <FollowersModal
          title="Followers"
          isOpen={isFollowersModalOpen}
          onClose={() => setIsFollowersModalOpen(false)}
          users={followersData}
        />
        <FollowersModal
          title="Following"
          isOpen={isFollowingModalOpen}
          onClose={() => setIsFollowingModalOpen(false)}
          users={followingData}
        />

        {/* Review Modal */}
        {isCommentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-dark rounded-2xl shadow-2xl p-6 w-full max-w-xl relative animate-fade-in border border-gray-800">
              <button
                onClick={() => setIsCommentModalOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
                aria-label="Close review modal"
              >
                <FaTimesCircle className="w-6 h-6" />
              </button>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-6 w-32 bg-gray-700 rounded mb-4"></div>
                  <div className="h-24 bg-gray-700 rounded mb-4"></div>
                  <div className="flex space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-gray-700"
                      ></div>
                    ))}
                  </div>
                  <div className="h-10 w-full bg-gray-700 rounded-full"></div>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Review {displayProfile?.name || "User"}
                  </h3>
                  <CommentForm
                    buttonText="Submit Review"
                    loading={loading}
                    initialTaggedUser={displayProfile?.userName}
                    onSubmit={(review, rating) => {
                      handleCommentSubmit(review, rating);
                    }}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default ProfileSection;
