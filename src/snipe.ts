import axios from "axios";

const options = {
  method: "GET",
  url: "https://twitter-api45.p.rapidapi.com/search.php",
  params: {
    query:
      '"#memecoin2025" OR "#memes" OR "#memecoins" OR "CA" OR "GMGN" OR "pump token" OR "pumpdotfun" OR "dexscreener"',
    search_type: "Top",
  },
  headers: {
    "x-rapidapi-key": "6df1fee834msh246a434b012aa0dp1d1f9fjsne02c45376812",
    "x-rapidapi-host": "twitter-api45.p.rapidapi.com",
  },
};

function getRelativeTime(createdAt: string): string {
  const tweetDate = new Date(createdAt);
  const now = new Date();

  // Calculate difference in milliseconds and convert to hours
  const diffInMs = now.getTime() - tweetDate.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  // Return formatted string
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  }
}

// Function to calculate engagement score
function calculateEngagementScore(tweet: any): number | null {
  const totalEngagements = (tweet.favorites || 0) + (tweet.retweets || 0) + (tweet.replies || 0) + (tweet.quotes || 0);
  const impressions = parseInt(tweet.views, 10) || 0;

  if (impressions === 0) return null;

  const engagementScore = (totalEngagements * 100) / impressions;
  return parseFloat(engagementScore.toFixed(2));
}

// Function to extract token and CA from text
function extractTokenAndCA(tweet: any) {
  const tokenMatch = tweet.text.match(/\$(\w+)/);
//   const caMatch = tweet.text.match(/([A-Za-z0-9]{32,})pump/);
    const caMatch = tweet.text.match(
      /CA:\s*([A-Za-z0-9]{32,}pump|[A-HJ-NP-Za-km-z1-9]{32,44}|0x[a-fA-F0-9]{40})/
    );

  const token = tokenMatch ? tokenMatch[1] : null;
  const ca = caMatch ? caMatch[1] : null;

  // Only return if both token and CA are found
  if (token || ca) {
    return {
      token_name: token,
      ca: ca,
      engagement_score: calculateEngagementScore(tweet),
      user_verified: tweet.user_info.verified,
      followers: tweet.user_info.followers_count,
      impressions: tweet.views,
      time: getRelativeTime(tweet.created_at),
    };
  }

  return null;
}

// Fetch tweets and filter results
async function fetchAndFilterTweets() {
  try {
    const response = await axios.request(options);
    const tweets = response.data;
    console.log(tweets);
    // Filter tweets that contain both token and CA, returning only token_name and ca
    const filteredList = tweets.timeline
      .map((tweet: any) => extractTokenAndCA(tweet))
      .filter((result: any) => result !== null);

      console.log({ filteredList: filteredList });
    return filteredList;
  } catch (error) {
    console.error(error);
  }
}

// Run the function
fetchAndFilterTweets();
