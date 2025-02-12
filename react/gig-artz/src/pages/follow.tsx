import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { followUser } from "../store/profileSlice"; // Import the followUser action

const Follow = () => {
  const dispatch = useDispatch();
  
  // Local state to store the follower and following user IDs
  const [followerId, setFollowerId] = useState("");
  const [followingId, setFollowingId] = useState("");

  // Optional: You can use the selector to get the current user's profile or error states if needed
  const {error, success} = useSelector((state: any) => state.profile);

  // Handler for the input change for follower ID
  const handleFollowerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFollowerId(e.target.value);
  };

  // Handler for the input change for following ID
  const handleFollowingIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFollowingId(e.target.value);
  };

  // Dispatch follow action when the button is clicked
  const handleFollowClick = () => {
    if (!followerId || !followingId) {
      alert("Please provide both follower and following IDs.");
      return;
    }

    // Dispatch the followUser action
    dispatch(followUser(followerId, followingId));
  };

  return (
    <div className="follow-component">
      <h2>Follow User</h2>
      <div>
        <label htmlFor="followerId">Follower ID:</label>
        <input
          type="text"
          id="followerId"
          value={followerId}
          onChange={handleFollowerIdChange}
          placeholder="Enter your user ID"
        />
      </div>
      <div>
        <label htmlFor="followingId">Following ID:</label>
        <input
          type="text"
          id="followingId"
          value={followingId}
          onChange={handleFollowingIdChange}
          placeholder="Enter the user ID to follow"
        />
      </div>
      <button onClick={handleFollowClick}>Follow</button>

      {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error if any */}
      {success && <p style={{ color: "green" }}>{success}</p>} {/* Display error if any */}
    </div>
  );
};

export default Follow;
