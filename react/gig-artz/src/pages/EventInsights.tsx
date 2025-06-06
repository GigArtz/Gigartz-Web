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

// Simple Bar Graph for Event Metrics
const BarGraph = ({
  data,
  labelKey,
  valueKey,
  color = "bg-teal-400",
  max = undefined,
}: {
  data: any[];
  labelKey: string;
  valueKey: string;
  color?: string;
  max?: number;
}) => {
  const maxValue =
    max !== undefined
      ? max
      : Math.max(...data.map((d) => d[valueKey] as number), 1);
  return (
    <div className="space-y-2">
      {data.map((item, idx) => (
        <div key={idx} className="flex items-center">
          <span className="w-32 truncate text-xs">{item[labelKey]}</span>
          <div className="flex-1 mx-2 bg-gray-700 rounded h-3">
            <div
              className={`${color} h-3 rounded`}
              style={{
                width: `${((item[valueKey] as number) / maxValue) * 100}%`,
              }}
            />
          </div>
          <span className="text-xs">{item[valueKey]}</span>
        </div>
      ))}
    </div>
  );
};

// Simple Line Graph for Trends
const LineGraph = ({
  labels,
  values,
  color = "stroke-teal-400",
  height = 48,
  max = undefined,
}: {
  labels: string[];
  values: number[];
  color?: string;
  height?: number;
  max?: number;
}) => {
  const maxValue = max !== undefined ? max : Math.max(...values, 1);
  const points = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * 100},${100 - (v / maxValue) * 100}`
    )
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" className={`w-full h-${height}`}>
      <polyline fill="none" strokeWidth="3" className={color} points={points} />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={(i / (values.length - 1)) * 100}
          cy={100 - (v / maxValue) * 100}
          r="2"
          className={color.replace("stroke-", "fill-")}
        />
      ))}
    </svg>
  );
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

  // Prepare data for bar/line graphs
  const ticketsSoldData = eventList.map((e) => ({
    label: e.title,
    value: e.ticketsSold ?? 0,
  }));
  const viewsData = eventList.map((e) => ({
    label: e.title,
    value: e.views ?? 0,
  }));
  const likesData = eventList.map((e) => ({
    label: e.title,
    value: e.likes ?? 0,
  }));
  const sharesData = eventList.map((e) => ({
    label: e.title,
    value: e.shares ?? 0,
  }));

  // For trend demo, use mock months and values
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const ticketsTrend = [10, 20, 18, 25, 30, 28];
  const viewsTrend = [100, 200, 180, 250, 300, 280];

  // For general insights, show a dropdown to pick a specific event
  return (
    <div className="main-content p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-teal-400">
        Event Insights Dashboard
      </h1>
      <div className="flex gap-4 mb-6">
        {eventId ? (
          <button
            className="bg-gray-800 px-4 py-2 rounded hover:bg-teal-600 text-teal-300"
            onClick={handleShowGeneral}
          >
            View General Insights
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            <span className="text-teal-300">See insights for:</span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-2 text-teal-300">
            Events Created
          </h2>
          <div className="text-2xl font-bold text-teal-400">{totalEvents}</div>
          <div className="text-gray-400">
            Active/Upcoming:{" "}
            <span className="text-teal-300">{activeEvents}</span>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-2 text-teal-300">
            Tickets Sold
          </h2>
          <div className="text-2xl font-bold text-teal-400">{ticketsSold}</div>
          <BarGraph
            data={ticketsSoldData}
            labelKey="label"
            valueKey="value"
            color="bg-teal-400"
          />
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-2 text-teal-300">
            Event Views
          </h2>
          <div className="text-2xl font-bold text-teal-400">{totalViews}</div>
          <BarGraph
            data={viewsData}
            labelKey="label"
            valueKey="value"
            color="bg-teal-300"
          />
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-2 text-teal-300">
            Event Engagement
          </h2>
          <div className="flex space-x-6 mb-2">
            <div>
              <div className="font-bold text-teal-400">{totalLikes}</div>
              <div className="text-gray-400 text-xs">Likes</div>
            </div>
            <div>
              <div className="font-bold text-teal-400">{totalShares}</div>
              <div className="text-gray-400 text-xs">Shares</div>
            </div>
            <div>
              <div className="font-bold text-teal-400">{totalReposts}</div>
              <div className="text-gray-400 text-xs">Reposts</div>
            </div>
            <div>
              <div className="font-bold text-teal-400">{totalSaves}</div>
              <div className="text-gray-400 text-xs">Saves</div>
            </div>
          </div>
          <BarGraph
            data={likesData}
            labelKey="label"
            valueKey="value"
            color="bg-teal-400"
          />
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-2 text-teal-300">
            Guestlist Performance
          </h2>
          <div className="flex space-x-8">
            <div>
              <div className="font-bold text-teal-400">{guestlistSignups}</div>
              <div className="text-gray-400 text-xs">Sign-ups</div>
            </div>
            <div>
              <div className="font-bold text-teal-400">
                {guestlistConversions}
              </div>
              <div className="text-gray-400 text-xs">Conversions</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-2 text-teal-300">
            Event Reach
          </h2>
          <div className="flex space-x-8">
            <div>
              <div className="font-bold text-teal-400">{totalImpressions}</div>
              <div className="text-gray-400 text-xs">Impressions</div>
            </div>
            <div>
              <div className="font-bold text-teal-400">{uniqueVisitors}</div>
              <div className="text-gray-400 text-xs">Unique Visitors</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-2 text-teal-300">
            Top Performing Events
          </h2>
          <ol className="list-decimal ml-5 text-teal-200">
            {topEvents.map((e) => (
              <li key={e.id}>
                {e.title}{" "}
                <span className="text-teal-400">
                  ({e.ticketsSold ?? 0} tickets sold)
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-2 text-teal-300">
            Event Reviews
          </h2>
          <div className="font-bold text-teal-400">
            Average Rating: {avgRating.toFixed(2)}
          </div>
          <div className="text-gray-400">
            Number of Reviews:{" "}
            <span className="text-teal-300">{totalReviews}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-2 text-teal-300">
            Tickets Sold Trend
          </h2>
          <LineGraph
            labels={months}
            values={ticketsTrend}
            color="stroke-teal-400"
            height={32}
          />
          <div className="flex justify-between text-xs mt-1 text-gray-400">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-2 text-teal-300">
            Views Trend
          </h2>
          <LineGraph
            labels={months}
            values={viewsTrend}
            color="stroke-teal-300"
            height={32}
          />
          <div className="flex justify-between text-xs mt-1 text-gray-400">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-8">
        * Some metrics are placeholders. Integrate with analytics APIs for real
        data.
      </p>
    </div>
  );
};

export default EventInsights;
