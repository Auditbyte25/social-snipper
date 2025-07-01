import { fetchTwitterUser, fetchUserTweet } from "../fetch/twitterFetch";

const cache = { data: null, timestamp: 0 };
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function convertToTimestamp(dateStr: string): number {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return date.getTime(); // returns timestamp in milliseconds
}

function convertDaysToTimestamp(days: number): number {
  const msInADay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * ms
  const timestampOffset = days * msInADay;

  return timestampOffset;
}

async function processTwitterUser(
  username: string,
  verification_status: boolean,
  min_followers: number,
  account_age: number
): Promise<any> {
  const user: any = await fetchTwitterUser(username);

  // Now convert the account age and created at to timeStamp
  const account_age_timestamp: any = convertDaysToTimestamp(account_age);
  const created_at_timestamp: any = convertToTimestamp(
    user.result.core.created_at
  );

  try {
    // The comparison
    if (
      user.result.is_blue_verified == verification_status &&
      user.result.legacy.followers_count >= min_followers &&
      created_at_timestamp + account_age_timestamp <= Date.now()
    ) {
      return user;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching tweets:", error);
    return null;
  }
}

/**
 * TESTING SIMULATION DATA
 */

// (async () => {
//   const result = await processTwitterUser(
//     "elonmusk", // Twitter username
//     true, // Verified status (expects `user.result.is_blue_verified == true`)
//     100000, // Minimum number of followers
//     2 // Account age in years (convertDaysToTimestamp should support this)
//   );

//   if (result) {
//     console.log("✅ Matching user found:", result);
//   } else {
//     console.log("🚫 No user matched the criteria.");
//   }
// })();


export { processTwitterUser };
