import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import {
  fetchAllProfiles,
  followUser,
  bookFreelancer,
  fetchAUserProfile,
} from "../../store/profileSlice";
import avatar from "../assets/avater.png";
import blueBackground from "../assets/blue.jpg";
import ProfileTabs from "../components/ProfileTabs";
import { RootState, AppDispatch } from "../../store/store";
import {
  FaCalendarPlus,
  FaEnvelope,
  FaMoneyBillAlt,
  FaPlus,
  FaTimesCircle,
} from "react-icons/fa";
import GuestListModal from "../components/GuestListModal";
import ProfileSection from "../components/ProfileSection";
import BookingModal from "../components/BookingModal";
import TippingModal from "../components/TippingModal";

// User Profile Type
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
}

// Booking Form Data Type
interface BookingFormData {
  eventDetails: string;
  date: string;
  time: string;
  venue: string;
  additionalInfo: string;
}

// Component
const People: React.FC = () => {
  const { uid } = useParams<{ uid: string }>(); // Extract UID from URL
  const navigate = useNavigate(); // Initialize useNavigate
  const dispatch = useDispatch<AppDispatch>();
  const { uid: user_id, loading, error } = useSelector((state) => state.auth);
  //const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isGuestListModalOpen, setIsGuestListModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false); // State for booking modal
  const [isTippingModalOpen, setIsTippingModalOpen] = useState(false); // State for tipping modal

  // Fetch users - use cache by default
  useEffect(() => {
    // fetchAllProfiles now uses cache by default, only fetches if cache is invalid
    dispatch(fetchAllProfiles());
  }, [dispatch, uid]);

  const userList = useSelector((state: RootState) => state.profile);

  const { userProfile } = useSelector((state: RootState) => state.profile);

  const [isFreelancer, setIsFreelancer] = useState<boolean>(
    userProfile?.roles?.freelancer || false
  );

  useEffect(() => {
    if (uid) {
      dispatch(fetchAUserProfile(uid));
    }
    // Only set freelancer status when userProfile changes
  }, [dispatch, uid]);

  useEffect(() => {
    setIsFreelancer(userProfile?.roles?.freelancer || false);
  }, [userProfile]);

  const handleFollow = () => {
    setIsFollowing((prev) => !prev);
    dispatch(followUser(user_id, uid));
  };

  const handleMessageClick = () => {
    navigate(`/messages?contact=${uid}`); // Navigate to Messages with contact ID
  };

  const handleAddGuestToList = (listId: number, guestEmail: string) => {
    console.log(`Adding user ${guestEmail} to list ${listId}`);
    setIsGuestListModalOpen(false);
  };

  const handleTipFreelancer = (amount: number) => {
    console.log(`Tipping freelancer ${uid} with amount: $${amount}`);
    // Add logic for tipping (e.g., dispatch an action or navigate to payment page)
  };

  const handleBookFreelancer = (data: BookingFormData) => {
    const bookingDetails = {
      userId: user_id,
      freelancerId: uid,
      ...data,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    dispatch(bookFreelancer(bookingDetails));
    console.log(`Booking freelancer ${uid} with details:`, bookingDetails);
    setIsBookingModalOpen(false);
  };

  const handleSocialLinks = () => {
    console.log(userProfile);
  };

  if (loading) {
    return (
      <div className="main-content">
        <p className="text-center">loading...</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      <ProfileSection
        userProfile={userProfile}
        // uid={userProfile?.userProfile?.id}
        onFollow={handleFollow}
        onMessage={handleMessageClick}
        onAddGuest={handleAddGuestToList}
        onTip={handleTipFreelancer}
        onBook={handleBookFreelancer}
        onSocialLinks={handleSocialLinks}
        isFollowing={isFollowing}
      />
      {/* Profile Tabs */}
      <ProfileTabs uid={uid} />
    </div>
  );
};

export default People;
