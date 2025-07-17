import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchAllProfiles,
  followUser,
  fetchAUserProfile,
} from "../../store/profileSlice";
import ProfileTabs from "../components/ProfileTabs";
import { RootState, AppDispatch } from "../../store/store";
import ProfileSection from "../components/ProfileSection";
import { useRenderLogger } from "../hooks/usePerformanceMonitor";

// Booking Form Data Type
interface BookingFormData {
  eventDetails: string;
  date: string;
  time: string;
  venue: string;
  additionalInfo: string;
}

// Component with custom comparison to prevent unnecessary re-renders
const People: React.FC = memo(() => {
  const { uid } = useParams<{ uid: string }>(); // Extract UID from URL
  const navigate = useNavigate(); // Initialize useNavigate
  const dispatch = useDispatch<AppDispatch>();

  // Monitor re-renders in development
  useRenderLogger("People", { uid });

  // Optimized selectors with shallow equality
  const authState = useSelector((state: RootState) => state.auth, shallowEqual);
  const profileState = useSelector(
    (state: RootState) => state.profile,
    shallowEqual
  );

  const { uid: user_id } = authState;
  const { userProfile } = profileState;

  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // Track if we've already fetched for this UID to prevent infinite loops
  const lastFetchedUid = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  // Extract ID separately to prevent re-renders from other profile changes
  const userProfileId = userProfile?.id;

  // Memoize profile checks to prevent unnecessary re-renders
  const shouldFetchProfile = useMemo(() => {
    // More specific check to prevent unnecessary re-renders
    return uid && (!userProfileId || userProfileId !== uid);
  }, [uid, userProfileId]); // Only depend on the ID, not the whole object

  // Reset fetch tracking when UID changes
  useEffect(() => {
    lastFetchedUid.current = null;
    isInitialMount.current = false;
  }, [uid]);

  // Optimize profile fetching with proper dependency array and aggressive deduplication
  useEffect(() => {
    // Skip if this is the initial mount to prevent double fetching
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (shouldFetchProfile && uid) {
      // Prevent duplicate fetches for the same UID
      if (lastFetchedUid.current === uid) {
        return;
      }

      // Additional check: Don't fetch if we're already loading for this user
      if (profileState.fetchingUserIds?.includes(uid)) {
        return;
      }

      lastFetchedUid.current = uid;
      dispatch(fetchAUserProfile(uid));
    }
  }, [dispatch, shouldFetchProfile, uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch all profiles only once if not already loaded
  useEffect(() => {
    // Only fetch if we don't have userList data
    if (!profileState.userList || profileState.userList.length === 0) {
      dispatch(fetchAllProfiles());
    }
  }, [dispatch, profileState.userList]);

  // Memoized event handlers to prevent child re-renders
  const handleFollow = useCallback(() => {
    if (uid && user_id) {
      setIsFollowing((prev) => !prev);
      dispatch(followUser(user_id, uid));
    }
  }, [uid, user_id, dispatch]);

  const handleMessageClick = useCallback(() => {
    navigate(`/messages?contact=${uid}`); // Navigate to Messages with contact ID
  }, [navigate, uid]);

  const handleAddGuestToList = useCallback(
    (listId: number, guestEmail: string) => {
      console.log(`Adding user ${guestEmail} to list ${listId}`);
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
      console.log(`Booking freelancer ${uid} with details:`, bookingDetails);
    },
    [user_id, uid]
  );

  const { loading } = profileState;

  // Memoize ProfileSection props to prevent unnecessary re-renders
  const profileSectionProps = useMemo(
    () => ({
      onFollow: handleFollow,
      onMessage: handleMessageClick,
      onAddGuest: handleAddGuestToList,
      onTip: handleTipFreelancer,
      onBook: handleBookFreelancer,
      isFollowing: isFollowing,
    }),
    [
      handleFollow,
      handleMessageClick,
      handleAddGuestToList,
      handleTipFreelancer,
      handleBookFreelancer,
      isFollowing,
    ]
  );

  if (loading) {
    return (
      <div className="main-content">
        <p className="text-center">loading...</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      <ProfileSection {...profileSectionProps} />
      {/* Profile Tabs */}
      <ProfileTabs uid={uid} />
    </div>
  );
});

People.displayName = "People";

export default People;
