import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useParams, useNavigate } from "react-router-dom";

// Extend the Event type for dashboard metrics (mock fields for demo)
type DashboardEvent = {
  id: string;
  title: string;
  date: string;
  promoterId: string;
  likes: number;
  // Mock/optional fields for demo/placeholder
  ticketsSold?: number;
  views?: number;
  shares?: number;
  reposts?: number;
  saves?: number;
  guestlistSignups?: number;
  guestlistConversions?: number;
  impressions?: number;
  uniqueVisitors?: number;
  reviews?: { rating: number }[];
};

const EventInsights: React.FC = () => {
  const { events } = useSelector((state: RootState) => state.events);
  const { profile } = useSelector((state: RootState) => state.profile);
  const { eventId } = useParams();
  const navigate = useNavigate();

  // If eventId is present, show insights for that event only
  const eventList = useMemo(() => {
    if (eventId) {
      const found = (events as DashboardEvent[]).find((e) => e.id === eventId);
      return found ? [found] : [];
    }
    // Otherwise, show all events for the current user
    return (events as DashboardEvent[]).filter(
      (e) => e.promoterId === profile?.id
    );
  }, [events, profile, eventId]);

  // For general insights, allow switching between all-my-events and single-event
  const showGeneral = !eventId;

  // For the general insights button
  const handleShowGeneral = () => navigate("/events/insights");

  // For the single event insights button
  const handleShowEvent = (id: string) => navigate(`/events/${id}/insights`);

  // Metrics
  const totalEvents = showGeneral ? eventList.length : 1;
  const now = new Date();
  const activeEvents = showGeneral
    ? eventList.filter((e) => new Date(e.date) >= now).length
    : eventList.length && new Date(eventList[0].date) >= now
    ? 1
    : 0;
  const ticketsSold = eventList.reduce(
    (sum, e) => sum + (e.ticketsSold ?? 0),
    0
  );
  const totalViews = eventList.reduce((sum, e) => sum + (e.views ?? 0), 0);
  const totalLikes = eventList.reduce((sum, e) => sum + (e.likes ?? 0), 0);
  const totalShares = eventList.reduce((sum, e) => sum + (e.shares ?? 0), 0);
  const totalReposts = eventList.reduce((sum, e) => sum + (e.reposts ?? 0), 0);
  const totalSaves = eventList.reduce((sum, e) => sum + (e.saves ?? 0), 0);
  const guestlistSignups = eventList.reduce(
    (sum, e) => sum + (e.guestlistSignups ?? 0),
    0
  );
  const guestlistConversions = eventList.reduce(
    (sum, e) => sum + (e.guestlistConversions ?? 0),
    0
  );
  const totalImpressions = eventList.reduce(
    (sum, e) => sum + (e.impressions ?? 0),
    0
  );
  const uniqueVisitors = eventList.reduce(
    (sum, e) => sum + (e.uniqueVisitors ?? 0),
    0
  );
  const topEvents = showGeneral
    ? [...eventList]
        .sort((a, b) => (b.ticketsSold ?? 0) - (a.ticketsSold ?? 0))
        .slice(0, 3)
    : eventList;
  const totalReviews = eventList.reduce(
    (sum, e) => sum + (e.reviews?.length ?? 0),
    0
  );
  const avgRating =
    eventList.reduce(
      (sum, e) =>
        sum + (e.reviews?.reduce((rSum, r) => rSum + (r.rating ?? 0), 0) ?? 0),
      0
    ) / (totalReviews || 1);

  // For general insights, show a dropdown to pick a specific event
  return (
    <div className="main-content p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Event Insights Dashboard</h1>
      
      <div className="flex gap-4 mb-6">
        {eventId ? (
          <button
            className="bg-gray-800 px-4 py-2 rounded hover:bg-teal-600"
            onClick={handleShowGeneral}
          >
            View General Insights
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            <span>See insights for:</span>
            <select
              className="bg-gray-800 text-white px-2 py-1 rounded"
              onChange={(e) => handleShowEvent(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Select Event
              </option>
              {events
                .filter((e: DashboardEvent) => e.promoterId === profile?.id)
                .map((e: DashboardEvent) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Events Created</h2>
          <p>
            Total: <b>{totalEvents}</b>
          </p>
          <p>
            Active/Upcoming: <b>{activeEvents}</b>
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Tickets Sold</h2>
          <p>
            Total: <b>{ticketsSold}</b>
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Event Views</h2>
          <p>
            Total: <b>{totalViews}</b>
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Event Engagement</h2>
          <p>
            Likes: <b>{totalLikes}</b>
          </p>
          <p>
            Shares: <b>{totalShares}</b>
          </p>
          <p>
            Reposts: <b>{totalReposts}</b>
          </p>
          <p>
            Saves: <b>{totalSaves}</b>
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Guestlist Performance</h2>
          <p>
            Sign-ups: <b>{guestlistSignups}</b>
          </p>
          <p>
            Conversions: <b>{guestlistConversions}</b>
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Event Reach</h2>
          <p>
            Impressions: <b>{totalImpressions}</b>
          </p>
          <p>
            Unique Visitors: <b>{uniqueVisitors}</b>
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Top Performing Events</h2>
          <ol className="list-decimal ml-5">
            {topEvents.map((e) => (
              <li key={e.id}>
                {e.title} ({e.ticketsSold ?? 0} tickets sold)
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Event Reviews</h2>
          <p>
            Average Rating: <b>{avgRating.toFixed(2)}</b>
          </p>
          <p>
            Number of Reviews: <b>{totalReviews}</b>
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-8">
        * Some metrics are placeholders. Integrate with analytics APIs for real
        data.
      </p>
    </div>
  );
};

export default EventInsights;
