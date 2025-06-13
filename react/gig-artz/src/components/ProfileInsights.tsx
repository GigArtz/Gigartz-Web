import React from "react";

// Mock data
const serviceStats = {
  total: 8,
  active: 6,
  bookings: [
    { name: "Logo Design", total: 24 },
    { name: "Web Development", total: 15 },
    { name: "SEO Audit", total: 10 },
  ],
  views: 1200,
  clicks: 350,
  avgRating: 4.7,
  ratingsBreakdown: [50, 10, 5, 2, 1], // 5,4,3,2,1 stars
  earnings: [
    { name: "Logo Design", amount: 1200 },
    { name: "Web Development", amount: 900 },
    { name: "SEO Audit", amount: 400 },
  ],
  totalEarnings: 2500,
  tips: { amount: 150, frequency: 12 },
};

const socialStats = {
  profileVisits: { daily: 30, weekly: 180, monthly: 700 },
  followers: { new: 40, unfollows: 5, net: 35 },
  engagement: { likes: 120, comments: 40, shares: 18, rate: 8.2 },
  topFollowers: [
    { name: "Alice", avatar: "", interactions: 22 },
    { name: "Bob", avatar: "", interactions: 18 },
    { name: "Charlie", avatar: "", interactions: 15 },
  ],
  reposts: 12,
  mentions: 8,
  hashtags: [
    { tag: "#design", traffic: 300 },
    { tag: "#webdev", traffic: 200 },
    { tag: "#freelance", traffic: 150 },
  ],
};

const reviewStats = {
  given: 18,
  received: 25,
  byType: [
    { type: "Events", given: 10, received: 12 },
    { type: "Freelancers", given: 8, received: 13 },
  ],
  reviewEngagement: { likes: 45, replies: 12 },
  topReviewed: [
    { name: "Art Expo 2024", feedback: 8 },
    { name: "Jane Doe", feedback: 6 },
  ],
  sentiment: { positive: 70, neutral: 20, negative: 10 },
};

const promoStats = {
  promoted: [
    { name: "Logo Design", paid: 400, organic: 120 },
    { name: "Web Development", paid: 300, organic: 100 },
    { name: "Art Expo 2024", paid: 500, organic: 200 },
  ],
  adRoi: [
    { name: "Logo Design", cost: 80, sales: 320 },
    { name: "Web Development", cost: 60, sales: 200 },
    { name: "Art Expo 2024", cost: 100, sales: 450 },
  ],
  ctr: [
    { name: "Logo Design", ctr: 4.2 },
    { name: "Web Development", ctr: 3.7 },
    { name: "Art Expo 2024", ctr: 5.1 },
  ],
};

const trendStats = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  engagement: [120, 150, 180, 210, 190, 230],
  sales: [10, 14, 18, 22, 20, 25],
  benchmark: [200, 210, 220, 230, 240, 250],
  peakTimes: [
    { day: "Wed", hour: "18:00", engagement: 80 },
    { day: "Sat", hour: "20:00", engagement: 95 },
    { day: "Sun", hour: "15:00", engagement: 90 },
  ],
};

const audienceStats = {
  locations: [
    { place: "New York", count: 120 },
    { place: "London", count: 90 },
    { place: "Berlin", count: 70 },
    { place: "Tokyo", count: 60 },
  ],
  ageGender: [
    { label: "18-24", male: 30, female: 40 },
    { label: "25-34", male: 50, female: 60 },
    { label: "35-44", male: 20, female: 25 },
  ],
  interests: [
    { category: "Art", count: 80 },
    { category: "Music", count: 60 },
    { category: "Tech", count: 40 },
    { category: "Design", count: 50 },
  ],
};

const RatingBreakdown = ({ breakdown }: { breakdown: number[] }) => (
  <div className="space-y-1">
    {breakdown.map((count, idx) => (
      <div key={5 - idx} className="flex items-center">
        <span className="text-yellow-400 mr-1">★</span>
        <span className="w-6">{5 - idx}:</span>
        <div className="flex-1 mx-2 bg-gray-00 rounded h-2">
          <div
            className="bg-yellow-400 h-2 rounded"
            style={{ width: `${count}%` }}
          />
        </div>
        <span className="text-xs">{count}</span>
      </div>
    ))}
  </div>
);

const SentimentBar = ({
  sentiment,
}: {
  sentiment: { positive: number; neutral: number; negative: number };
}) => (
  <div className="flex items-center w-full">
    <div
      className="bg-green-400 h-4"
      style={{ width: `${sentiment.positive}%` }}
      title="Positive"
    />
    <div
      className="bg-yellow-400 h-4"
      style={{ width: `${sentiment.neutral}%` }}
      title="Neutral"
    />
    <div
      className="bg-red-500 h-4"
      style={{ width: `${sentiment.negative}%` }}
      title="Negative"
    />
    <span className="ml-2 text-xs">
      {sentiment.positive}% / {sentiment.neutral}% / {sentiment.negative}%
    </span>
  </div>
);

// Simple Bar Graph for Bookings/Earnings/Visits
const BarGraph = ({
  data,
  labelKey,
  valueKey,
  color = "bg-blue-500",
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
          <div className="flex-1 mx-2 bg-gray-200 rounded h-3">
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

const StackedBarGraph = ({
  data,
  labelKey,
  valueKeys,
  colors,
  max,
}: {
  data: any[];
  labelKey: string;
  valueKeys: string[];
  colors: string[];
  max?: number;
}) => {
  const maxValue =
    max !== undefined
      ? max
      : Math.max(
          ...data.map((d) => valueKeys.reduce((sum, k) => sum + d[k], 0)),
          1
        );
  return (
    <div className="space-y-2">
      {data.map((item, idx) => {
        const total = valueKeys.reduce((sum, k) => sum + item[k], 0);
        let acc = 0;
        return (
          <div key={idx} className="flex items-center">
            <span className="w-32 truncate text-xs">{item[labelKey]}</span>
            <div className="flex-1 mx-2 flex h-3 rounded overflow-hidden bg-gray-700">
              {valueKeys.map((k, i) => {
                const width = ((item[k] / maxValue) * 100).toFixed(2) + "%";
                acc += item[k];
                return (
                  <div
                    key={k}
                    className={`${colors[i]} h-3`}
                    style={{ width }}
                    title={k}
                  />
                );
              })}
            </div>
            <span className="text-xs">{total}</span>
          </div>
        );
      })}
    </div>
  );
};

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
      {/* Dots */}
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

const AgeGenderBar = ({
  data,
}: {
  data: { label: string; male: number; female: number }[];
}) => {
  const max = Math.max(...data.map((d) => d.male + d.female), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center">
          <span className="w-16 text-xs">{d.label}</span>
          <div className="flex-1 mx-2 flex h-3 rounded overflow-hidden bg-gray-700">
            <div
              className="bg-teal-400 h-3"
              style={{ width: `${(d.male / max) * 100}%` }}
              title="Male"
            />
            <div
              className="bg-pink-400 h-3"
              style={{ width: `${(d.female / max) * 100}%` }}
              title="Female"
            />
          </div>
          <span className="text-xs text-teal-300">{d.male}</span>
          <span className="text-xs text-pink-300 ml-1">{d.female}</span>
        </div>
      ))}
    </div>
  );
};

const ProfileInsights: React.FC = () => (
  <div className="p-2 min-h-screen text-gray-100">
    <h1 className="text-3xl font-bold mb-6 ">Profile Insights</h1>

    {/* Freelance Service Insights */}
    <h2 className="text-xl text-teal font-semibold mb-2 pb-2 text-teal-400 border-b border-gray-800">
      Freelance Service Insights
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div className="bg-gray-800 rounded shadow p-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-teal-400">
          {serviceStats.total}
        </div>
        <div className="text-gray-400">Total Services</div>
        <div className="text-xl font-bold mt-2 text-teal-300">
          {serviceStats.active}
        </div>
        <div className="text-gray-400">Active Listings</div>
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="text-lg font-bold mb-2 text-teal-300">
          Total Bookings:{" "}
          {serviceStats.bookings.reduce((a, b) => a + b.total, 0)}
        </div>
        <BarGraph
          data={serviceStats.bookings}
          labelKey="name"
          valueKey="total"
          color="bg-teal-400"
        />
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="text-lg font-bold mb-2 text-teal-300">
          Service Views & Clicks
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <div className="text-xl font-bold text-teal-400">
              {serviceStats.views}
            </div>
            <div className="text-gray-400 text-xs">Views</div>
          </div>
          <div>
            <div className="text-xl font-bold text-teal-400">
              {serviceStats.clicks}
            </div>
            <div className="text-gray-400 text-xs">Clicks</div>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xs text-gray-500">Views/Clicks Progress</div>
          <div className="w-full bg-gray-700 rounded h-2">
            <div
              className="bg-teal-400 h-2 rounded"
              style={{
                width: `${Math.min(
                  (serviceStats.clicks / serviceStats.views) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="text-lg font-bold mb-2 text-teal-300">
          Avg. Rating:{" "}
          <span className="text-yellow-400">{serviceStats.avgRating}★</span>
        </div>
        <RatingBreakdown breakdown={serviceStats.ratingsBreakdown} />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="text-lg font-bold mb-2 text-teal-300">
          Total Earnings: ${serviceStats.totalEarnings}
        </div>
        <BarGraph
          data={serviceStats.earnings}
          labelKey="name"
          valueKey="amount"
          color="bg-teal-400"
        />
      </div>
      <div className="bg-gray-800 rounded shadow p-4 flex flex-col items-center">
        <div className="text-lg font-bold mb-2 text-teal-300">
          Tips Received
        </div>
        <div className="text-2xl font-bold text-teal-400">
          ${serviceStats.tips.amount}
        </div>
        <div className="text-gray-400 text-xs">
          {serviceStats.tips.frequency} times
        </div>
      </div>
    </div>

    {/* Social & Community Engagement */}
    <h2 className="text-xl font-semibold mb-2  pb-2 text-teal-400 border-b border-gray-800">
      Social & Community Engagement
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold text-teal-300">Profile Visits</div>
        <BarGraph
          data={[
            { label: "Daily", value: socialStats.profileVisits.daily },
            { label: "Weekly", value: socialStats.profileVisits.weekly },
            { label: "Monthly", value: socialStats.profileVisits.monthly },
          ]}
          labelKey="label"
          valueKey="value"
          color="bg-teal-400"
        />
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2 text-teal-300">Follower Growth</div>
        <div className="flex items-center space-x-4">
          <div>
            <div className="text-xl font-bold text-teal-400">
              {socialStats.followers.new}
            </div>
            <div className="text-gray-400 text-xs">New</div>
          </div>
          <div>
            <div className="text-xl font-bold text-teal-400">
              {socialStats.followers.unfollows}
            </div>
            <div className="text-gray-400 text-xs">Unfollows</div>
          </div>
          <div>
            <div className="text-xl font-bold text-teal-400">
              {socialStats.followers.net}
            </div>
            <div className="text-gray-400 text-xs">Net</div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2 text-teal-300">Engagement Rate</div>
        <div className="text-2xl font-bold text-teal-400">
          {socialStats.engagement.rate}%
        </div>
        <div className="flex space-x-4 mt-2">
          <div className="flex items-center text-teal-300">
            <span className="mr-1">👍</span>
            {socialStats.engagement.likes}
          </div>
          <div className="flex items-center text-teal-300">
            <span className="mr-1">💬</span>
            {socialStats.engagement.comments}
          </div>
          <div className="flex items-center text-teal-300">
            <span className="mr-1">🔄</span>
            {socialStats.engagement.shares}
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2 text-teal-300">
          Most Engaged Followers
        </div>
        <ul>
          {socialStats.topFollowers.map((f) => (
            <li key={f.name} className="flex items-center space-x-2 text-sm">
              <span className="inline-block w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                <span role="img" aria-label="user">
                  👤
                </span>
              </span>
              <span>{f.name}</span>
              <span className="text-gray-400">({f.interactions})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold text-teal-300">Reposts & Mentions</div>
        <div className="flex space-x-8 mt-2">
          <div>
            <div className="text-xl font-bold text-teal-400">
              {socialStats.reposts}
            </div>
            <div className="text-gray-400 text-xs">Reposts</div>
          </div>
          <div>
            <div className="text-xl font-bold text-teal-400">
              {socialStats.mentions}
            </div>
            <div className="text-gray-400 text-xs">Mentions</div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2 text-teal-300">Top Hashtags</div>
        <BarGraph
          data={socialStats.hashtags}
          labelKey="tag"
          valueKey="traffic"
          color="bg-teal-400"
        />
      </div>
    </div>

    {/* Promotional & Marketing Insights */}
    <h2 className="text-xl font-semibold mb-2 pb-2 text-teal-400 border-b border-gray-800">
      Promotional & Marketing Insights
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2">
          Promoted Events/Services Performance
        </div>
        <StackedBarGraph
          data={promoStats.promoted}
          labelKey="name"
          valueKeys={["paid", "organic"]}
          colors={["bg-teal-400", "bg-gray-400"]}
        />
        <div className="flex justify-between text-xs mt-1">
          <span className="text-teal-400">Paid</span>
          <span className="text-gray-400">Organic</span>
        </div>
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2">Ad/Boost ROI</div>
        <StackedBarGraph
          data={promoStats.adRoi}
          labelKey="name"
          valueKeys={["cost", "sales"]}
          colors={["bg-red-400", "bg-teal-400"]}
        />
        <div className="flex justify-between text-xs mt-1">
          <span className="text-red-400">Cost</span>
          <span className="text-teal-400">Sales</span>
        </div>
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2">Click-Through Rates (CTR)</div>
        <BarGraph
          data={promoStats.ctr}
          labelKey="name"
          valueKey="ctr"
          color="bg-teal-400"
        />
      </div>
    </div>

    {/* Comparative & Trend Data */}
    <h2 className="text-xl font-semibold mb-2 pb-2 text-teal-400 border-b border-gray-800">
      Comparative & Trend Data
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2">Performance Over Time (Engagement)</div>
        <LineGraph
          labels={trendStats.months}
          values={trendStats.engagement}
          color="stroke-teal-400"
          height={32}
        />
        <div className="flex justify-between text-xs mt-1 text-gray-400">
          {trendStats.months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2">Performance Over Time (Sales)</div>
        <LineGraph
          labels={trendStats.months}
          values={trendStats.sales}
          color="stroke-pink-400"
          height={32}
        />
        <div className="flex justify-between text-xs mt-1 text-gray-400">
          {trendStats.months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2">Benchmarking</div>
        <LineGraph
          labels={trendStats.months}
          values={trendStats.benchmark}
          color="stroke-gray-400"
          height={32}
        />
        <div className="flex justify-between text-xs mt-1 text-gray-400">
          {trendStats.months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
    </div>
    <div className="bg-gray-800 rounded shadow p-4 mb-8">
      <div className="font-bold mb-2 text-teal-200">Peak Engagement Times</div>
      <div className="flex flex-wrap gap-4">
        {trendStats.peakTimes.map((t, i) => (
          <div
            key={i}
            className="bg-teal-900 text-teal-200 rounded px-4 py-2 flex flex-col items-center"
          >
            <span className="font-bold">{t.day}</span>
            <span className="text-xs">{t.hour}</span>
            <span className="text-teal-400 font-bold">{t.engagement}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Audience Demographics */}
    <h2 className="text-xl font-semibold mb-2 pb-2 text-teal-400 border-b border-gray-800">
      Audience Demographics
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2">Top Locations</div>
        <BarGraph
          data={audienceStats.locations}
          labelKey="place"
          valueKey="count"
          color="bg-teal-400"
        />
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2">Age & Gender Breakdown</div>
        <AgeGenderBar data={audienceStats.ageGender} />
        <div className="flex justify-between text-xs mt-1">
          <span className="text-teal-400">Male</span>
          <span className="text-pink-400">Female</span>
        </div>
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2">Interests</div>
        <BarGraph
          data={audienceStats.interests}
          labelKey="category"
          valueKey="count"
          color="bg-teal-400"
        />
      </div>
    </div>

    {/* Review & Reputation Insights */}
    <h2 className="text-xl font-semibold mb-2 pb-2 text-teal-400 border-b border-gray-800">
      Review & Reputation Insights
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2 text-teal-300">
          Reviews Given/Received
        </div>
        <div className="flex space-x-4">
          <div>
            <div className="text-xl font-bold text-teal-400">
              {reviewStats.given}
            </div>
            <div className="text-gray-400 text-xs">Given</div>
          </div>
          <div>
            <div className="text-xl font-bold text-teal-400">
              {reviewStats.received}
            </div>
            <div className="text-gray-400 text-xs">Received</div>
          </div>
        </div>
        <ul className="mt-2 text-xs">
          {reviewStats.byType.map((t) => (
            <li key={t.type}>
              {t.type}: Given {t.given}, Received {t.received}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2 text-teal-300">
          Review Likes & Replies
        </div>
        <div className="flex space-x-4">
          <div>
            <div className="text-xl font-bold text-teal-400">
              {reviewStats.reviewEngagement.likes}
            </div>
            <div className="text-gray-400 text-xs">Likes</div>
          </div>
          <div>
            <div className="text-xl font-bold text-teal-400">
              {reviewStats.reviewEngagement.replies}
            </div>
            <div className="text-gray-400 text-xs">Replies</div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2 text-teal-300">Top Reviewed</div>
        <ul className="text-xs">
          {reviewStats.topReviewed.map((r) => (
            <li key={r.name}>
              {r.name}: {r.feedback} feedback
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-gray-800 rounded shadow p-4">
        <div className="font-bold mb-2 text-teal-300">Review Sentiment</div>
        <SentimentBar sentiment={reviewStats.sentiment} />
      </div>
    </div>
  </div>
);

export default ProfileInsights;
