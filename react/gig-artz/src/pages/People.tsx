import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import {
  fetchAllProfiles,
  followUser,
  bookFreelancer,
} from "../store/profileSlice";
import avatar from "../assets/avater.png";
import blueBackground from "../assets/blue.jpg";
import ProfileTabs from "../components/ProfileTabs";
import { RootState, AppDispatch } from "../store/store";
import { FaEnvelope, FaPlus, FaTimesCircle } from "react-icons/fa";
import GuestListModal from "../components/GuestListModal";

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

const BookingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<BookingFormData>({
    eventDetails: "",
    date: "",
    time: "",
    venue: "",
    additionalInfo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      eventDetails: "",
      date: "",
      time: "",
      venue: "",
      additionalInfo: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-dark rounded-lg shadow-lg w-11/12 max-w-md p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold mb-4">Book Freelancer</h2>
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-2 rounded hover:bg-red-500"
            >
              <FaTimesCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Event Details</label>
            <input
              type="text"
              name="eventDetails"
              value={formData.eventDetails}
              onChange={handleChange}
              className="input-field"
              placeholder="Event details"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="input-field"
              placeholder="Venue"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Additional Info</label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="Additional information"
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="btn-primary"
            >
              Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TippingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | "">(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAmount && selectedAmount > 0) {
      onSubmit(Number(selectedAmount));
      setSelectedAmount(10); // Reset to default
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-dark rounded-lg shadow-lg w-11/12 max-w-md p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold mb-4">Tip Freelancer</h2>
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-2 rounded hover:bg-red-500"
            >
              <FaTimesCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Select an amount:</p>
            <div className="flex gap-2 flex-wrap">
              {[10, 20, 50, 100, 200].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setSelectedAmount(amount)}
                  className={`px-4 py-2 border border-teal-500 rounded ${
                    selectedAmount === amount
                      ? "bg-teal-400 text-white"
                      : "border border-teal-500"
                  }`}
                >
                  R{amount}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Custom Amount</label>
            <input
              type="number"
              min="1"
              value={selectedAmount === "" ? "" : selectedAmount}
              onChange={(e) =>
                setSelectedAmount(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="input-field"
              placeholder="Enter custom amount"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="submit" className="btn-primary">
              Tip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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

  // Fetch users
  useEffect(() => {
    dispatch(fetchAllProfiles());
  }, [dispatch, uid]);

  const userList = useSelector((state: RootState) => state.profile);

  const userProfile = userList.userList.find(
    (user: UserProfile) => user?.id === uid
  );

  const [isFreelancer, setIsFreelancer] = useState<boolean>(
    userProfile?.roles?.freelancer || false
  );

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

  const handleOpenBookingModal = () => {
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
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

  if (loading) {
    return (
      <div className="main-content">
        <p className="text-center">loading...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="main-content">
        <p className="text-center">User Not Found</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="relative">
        <img
          src={userProfile.coverProfile || blueBackground}
          alt="Cover"
          className="w-full h-40 object-cover sm:h-30 md:h-52 mb-4"
        />
        <img
          src={userProfile.profilePicUrl || avatar}
          alt="Profile"
          className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-gray-900 absolute top-10 left-4 sm:top-32 sm:left-8 md:top-18 md:left-10"
        />
      </div>

      <div className="p-5">
        <div className="flex justify-end gap-4">
          <button onClick={() => setIsGuestListModalOpen(true)}>
            <FaPlus />
          </button>
          <button onClick={handleMessageClick}>
            <FaEnvelope />
          </button>{" "}
          {/* Add onClick */}
          <button
            onClick={handleFollow}
            className={`border px-4 py-1 rounded-2xl ${
              isFollowing
                ? "bg-gray-500 text-white"
                : "border-teal-400 text-teal-400"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
          {isFreelancer && (
            <>
              <button
                onClick={() => setIsTippingModalOpen(true)}
                className="border px-4 py-1 rounded-2xl border-yellow-400 text-yellow-400"
              >
                Tip
              </button>
              <button
                onClick={handleOpenBookingModal}
                className="border px-4 py-1 rounded-2xl border-green-400 text-green-400"
              >
                Book
              </button>
            </>
          )}
        </div>
        <h1 className="text-2xl font-bold">{userProfile.name || "Name"}</h1>
        <p className="text-sm text-gray-400">
          @{userProfile.userName || "username"}
        </p>
        <p className="mt-2">{userProfile.bio || "No bio available"}</p>
        <div className="flex flex-row justify-between">
          <div className="flex-row gap-4 mt-2">
            <div className="flex gap-2">
              <p>
                <span className="font-bold text-teal-400">
                  {userProfile.following || 0}
                </span>{" "}
                Following
              </p>
              <p>
                <span className="font-bold text-teal-400">
                  {userProfile.followers || 0}
                </span>{" "}
                Followers
              </p>
            </div>
            <div className="flex">
              <div className="flex gap-2 my-2">
                {(userProfile.genre || [])
                  .slice(0, 3) // Only take the first 3 items
                  .map((genre, index) => (
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

      {/* Profile Tabs */}
      <ProfileTabs uid={userProfile?.id} />

      <GuestListModal
        isOpen={isGuestListModalOpen}
        onClose={() => setIsGuestListModalOpen(false)}
        onAddGuest={handleAddGuestToList}
        preFilledEmail={userProfile?.emailAddress} // Pass user's email
      />

      {/* Tipping Modal */}
      <TippingModal
        isOpen={isTippingModalOpen}
        onClose={() => setIsTippingModalOpen(false)}
        onSubmit={handleTipFreelancer}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleBookFreelancer}
      />
    </div>
  );
};

export default People;
