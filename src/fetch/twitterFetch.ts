import axios, { AxiosRequestConfig } from "axios";
import ErrorHandler from "../utils/ErrorHandler";

// Fetch user profile by username search...
async function fetchTwitterUser(username: string) {
  const options: AxiosRequestConfig = {
    method: "GET",
    url: "https://twitter241.p.rapidapi.com/user",
    params: {
      username: `${username}`,
    },
    headers: {
      "x-rapidapi-key": "6df1fee834msh246a434b012aa0dp1d1f9fjsne02c45376812",
      "x-rapidapi-host": "twitter241.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data.result.data.user;
  } catch (error: any) {
      console.error("Error fetching Twitter user:", error.message);
      return { status: 500, msg: error.message };
  }
}

async function fetchUserTimeline(screenname: string) {
  const options: AxiosRequestConfig = {
    method: "GET",
    url: "https://twitter-api45.p.rapidapi.com/timeline.php",
    params: {
      screenname,
    },
    headers: {
      "x-rapidapi-key": "6df1fee834msh246a434b012aa0dp1d1f9fjsne02c45376812",
      "x-rapidapi-host": "twitter-api45.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user timeline:", error.message);
    return { status: 500, msg: error.message };
  }
}

const cache = { data: null, timestamp: 0 };
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchUserTweet(
  username: string,
  startDate: any,
  endDate: any,
  min_replies: number,
  min_faves: number,
  min_retweets: number
) {
     const now = Date.now();
     if (cache.data && now - cache.timestamp < CACHE_DURATION) {
       console.log("Returning cached tweets.");
       return cache.data;
     }
    
    const options = {
      method: "GET",
      url: "https://twitter-api45.p.rapidapi.com/search.php",
      params: {
        query: `from:${username} min_replies:${min_replies} min_faves:${min_faves} min_retweets:${min_retweets} lang:en until:${endDate} since:${startDate}`,
        search_type: "Top",
      },
      headers: {
        "x-rapidapi-key": "6df1fee834msh246a434b012aa0dp1d1f9fjsne02c45376812",
        "x-rapidapi-host": "twitter-api45.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      cache.data = response.data;
      cache.timestamp = now;
      return response.data;
    } catch (error: any) {
      console.error("Error fetching tweets:", error);
      return { status: 500, msg: error.message };
    }
}

// async function main() {
//   const user = await fetchUserTweet(
//     "MrBeast",
//     "2024-06-01",
//     "2024-06-13",
//     500,
//     5000,
//     200
//   );
//   console.log(user);
// }
// main();

export {fetchTwitterUser, fetchUserTweet, fetchUserTimeline}