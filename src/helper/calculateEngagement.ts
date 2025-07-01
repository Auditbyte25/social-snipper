type EngagementMetrics = {
  min_replies: number;
  min_retweets: number;
  min_faves: number;
};

function calculateEngagementMetrics(
  engagement_score: number,
  min_followers: number
): EngagementMetrics {
  // Convert score to decimal (e.g., 80% -> 0.8)
  const scoreDecimal = engagement_score / 100;

  // Total engagement = % of followers
  const totalEngagement = min_followers * scoreDecimal;

  // Distribute based on assumed weights (adjust as needed)
  const min_replies = Math.floor(totalEngagement * 0.1); // 10%
  const min_retweets = Math.floor(totalEngagement * 0.3); // 30%
  const min_faves = Math.floor(totalEngagement * 0.6); // 60%

  return { min_replies, min_retweets, min_faves };
}

export { calculateEngagementMetrics };
