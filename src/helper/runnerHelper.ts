import axios from "axios";
import nlp from "compromise";
import { getMostUniqueNouns, getTopTrendingWords } from "../helper/trendHelper";
import { MEME } from "../types/types";
import {
  getLiquidityStat,
  getMemeRequest,
  getTokenHolder,
} from "../fetch/fetch";
import { searchTokensRunner } from "../fetch/fetch";

const cache = { data: null, timestamp: 0 };
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTweets(
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
      query: `" " min_replies:${min_replies} min_faves:${min_faves} min_retweets:${min_retweets} lang:en until:${endDate} since:${startDate}`,
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
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return null;
  }
}

async function processTweets(
  startDate: any,
  endDate: any,
  min_replies: number,
  min_faves: number,
  min_retweets: number
): Promise<
  | {
      trendingWords: string[];
      tweetImpression: string[];
      tweetMention: string[];
      tweetIds: string[];
    }
  | undefined
> {
  const tweets = await fetchTweets(
    startDate,
    endDate,
    min_replies,
    min_faves,
    min_retweets
  );
  if (!tweets) return;

  const trendingWords: string[] = [];
  const tweetImpression: string[] = [];
  // Username of the person that tweet
  const tweetMention: string[] = [];
  const tweetIds: string[] = [];

  const results = tweets.timeline.map((tweet: any) => {
    // const words = extractTrendingWords(tweet.text);
    // const words = getMostUniqueNouns(tweet.text);
    // trendingWords.push(...words);
    trendingWords.push(tweet.text);
    tweetImpression.push(tweet.views);
    tweetMention.push(tweet.user_info.screen_name);
    tweetIds.push(tweet.tweet_id);
    // return { text: tweet.text, extractedWords: words };
  });

  // return getTopTrendingWords(trendingWords, 10);
  // return trendingWords;
  return {
    trendingWords,
    tweetImpression,
    tweetMention,
    tweetIds,
  };
}

//------------LIMIT OF TOKENS = 10 AND ADDING DELAY = 1SECONDS BECAUSE OF FREE PLAN--------------//
async function runnerFilter(
  startDate: any,
  endDate: any,
  engagement_score: any,
  min_replies: number,
  min_faves: number,
  min_retweets: number,
  liquidity_locked: number,
  min_market_cap: number,
  max_market_cap: number,
  buy_ratio: number,
  sell_ratio: number,
  minimum_holders: number
) {
  // MEME LIST
  let MEMES: MEME[] = [];

  // Get and capture list of trending words says maximum of 10...
  // const trendingWords: any = await processTweets(
  //   startDate,
  //   endDate,
  //   min_replies,
  //   min_faves,
  //   min_retweets
  // );
  const { trendingWords, tweetImpression, tweetMention, tweetIds } =
    (await processTweets(
      startDate,
      endDate,
      min_replies,
      min_faves,
      min_retweets
    )) || { trendingWords: [], tweetImpression: [], tweetMention: [], tweetIds: [] };
  // Check for the array mismatch
    if (
      !trendingWords ||
      !tweetImpression ||
      trendingWords.length != tweetImpression.length
    ) {
      console.error(
        "❌ Length mismatch: trendingWords and tweetImpression must be equal"
      );
      return null;
    }
  // console.log(trendingWords);
  for (let i = 0; i < Math.min(trendingWords?.length || 0, 2); i++) {
    var impressions: any = tweetImpression[i];
    var tweetMentioned: any = tweetMention[i];
    var tweetId: any = tweetIds[i];
    try {
      const memeResponse: any = await searchTokensRunner(
        trendingWords[i],
        min_market_cap,
        buy_ratio,
        sell_ratio,
        max_market_cap
      );
      console.log({ memeResponse: memeResponse });
      for (const token of memeResponse) {
        // Conditional check before pushing to MEMES
        if (
          (token.liquidityUsd != null &&
            token.liquidityUsd < liquidity_locked) ||
          (token.holders != null && token.holders < minimum_holders)
        )
          continue;

        const passedMEME: MEME = {
          tokenAddress: token.mint,
          tokenName: token.name,
          liquidityLocked: token.liquidityUsd,
          marketCap: token.marketCapUsd,
          tokenHolder: token.holders,
          buynsellRatio: buy_ratio / sell_ratio,
          rugCheck: "",
          mentions: tweetMentioned,
          currentPrice: token.priceUsd,
          volume24h: token.volume_24h,
          engagementScore: engagement_score,
          hashtagReach: impressions,
          tweetId: tweetId,
        };

        MEMES.push(passedMEME);
        // -------ADDING DELAY--------//
        await delay(1000); // wait 1 second between requests
      }
      // console.log(MEMES);
      // -------ADDING DELAY--------//
      // await delay(1000); // wait 1.5 seconds between requests
    } catch (error: any) {
      console.error("Error fetching tweets:", error);
      return null;
    }
  }

  // Return the result
  return MEMES;
}

// (async () => {
//   const startDate = "2024-06-01";
//   const endDate = "2024-06-15";
//   const engagement_score = 50;
//   const min_replies = 5;
//   const min_faves = 10;
//   const min_retweets = 3;
//   const liquidity_locked = 0; // in USD
//   const min_market_cap = 50000; // in USD
//   const max_market_cap = 100000; // in USD
//   const buy_ratio = 120; // Buy/sell ratio
//   const sell_ratio = 100; // Buy/sell ratio
//   const minimum_holders = 100; // Number of holders

//   const result = await runnerFilter(
//     startDate,
//     endDate,
//     engagement_score,
//     min_replies,
//     min_faves,
//     min_retweets,
//     liquidity_locked,
//     min_market_cap,
//     max_market_cap,
//     buy_ratio,
//     sell_ratio,
//     minimum_holders
//   );

//   console.log("Filtered MEMES:", result);
// })();

export { processTweets, runnerFilter };
