import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import {
  fetchAllProfiles,
  followUser,
  bookFreelancer,
  fetchVisitedUserProfile,
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
  }, [dispatch]); // Removed uid from dependencies as it is not directly related to fetching all profiles

  const userList = useSelector((state: RootState) => state.profile);

  const { visitedProfile } = useSelector((state: RootState) => state.profile);

  const [isFreelancer, setIsFreelancer] = useState<boolean>(
    visitedProfile?.userProfile?.roles?.freelancer ||
      visitedProfile?.userProfile?.roles?.admin ||
      false
  );

  useEffect(() => {
    if (uid) {
      dispatch(fetchVisitedUserProfile(uid));
    }
  }, [dispatch, uid]);

  useEffect(() => {
    setIsFreelancer(
      visitedProfile?.userProfile?.roles?.freelancer ||
        visitedProfile?.userProfile?.roles?.admin ||
        false
    );
  }, [visitedProfile]);

  // Stabilized props using useCallback
  const handleFollow = useCallback(() => {
    setIsFollowing((prev) => !prev);
    dispatch(followUser(user_id, uid));
  }, [dispatch, user_id, uid]);

  const handleMessageClick = useCallback(() => {
    navigate(`/messages?contact=${uid}`);
  }, [navigate, uid]);

  const handleAddGuestToList = useCallback(
    (listId: number, guestEmail: string) => {
      console.log(`Adding user ${guestEmail} to list ${listId}`);
      setIsGuestListModalOpen(false);
    },
    []
  );

  const handleTipFreelancer = useCallback(
    (amount: number) => {
      console.log(`Tipping freelancer ${uid} with amount: $${amount}`);
    },
    [uid]
  );

  const handleBookFreelancer = useCallback(
    (data: BookingFormData) => {
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
    },
    [dispatch, user_id, uid]
  );

  const handleSocialLinks = useCallback(() => {
    console.log(visitedProfile?.userProfile);
  }, [visitedProfile]);

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
        //uid={userProfile?.userProfile?.id}
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
