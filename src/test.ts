import axios from "axios";
import nlp from "compromise";
import { getMostUniqueNouns, getTopTrendingWords } from "./helper/trendHelper";
import { MEME } from "./types/types";
import { getLiquidityStat, getMemeRequest, getTokenHolder } from "./fetch/fetch";

const cache = { data: null, timestamp: 0 };
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

/**
 * Extracts key trending words from text using NLP.
 */
function extractTrendingWords(text: string): string[] {
  const doc = nlp(text);
  const keywords = doc.nouns().out("array");
  return keywords;
}

async function processTweets(
  startDate: any,
  endDate: any,
  min_replies: number,
  min_faves: number,
  min_retweets: number
) {
  const tweets = await fetchTweets(
    startDate,
    endDate,
    min_replies,
    min_faves,
    min_retweets
  );
  if (!tweets) return;

  const trendingWords: string[] = [];

  const results = tweets.timeline.map((tweet: any) => {
    // const words = extractTrendingWords(tweet.text);
    const words = getMostUniqueNouns(tweet.text);
    trendingWords.push(...words);
    return { text: tweet.text, extractedWords: words };
  });

  console.log("\n🔥 Trending Words:", [...new Set(trendingWords)]);
  console.log(getTopTrendingWords(trendingWords, 10));

  return getTopTrendingWords(trendingWords, 10);
}

// Date - format: 2025-03-30, min_replies:5500 min_faves:51000 min_retweets:25500

processTweets("2025-05-01", "2025-05-05", 1000,700,300);

// SEQUENCE OF STEPS REQUIRED TO RETURN "LIQUIDITY_LOCKED", "MARKET_CAP", "BUY&SELL_RATIO", "MINIMUM_HOLDERS"

/**
 * STEP 1: Capture the list of trending words returned from "processTweet()" function
 * STEP 2: Loop through the list of trending words
 * STEP 3: Inside each loop query the moralis API to search for tokens by name
 * STEP 4: Capture the "MARKET_CAP" and "TOKEN_ADDRESS" values from each query returned from step 3 
 * STEP 5: In the same block of query in STEP 4, query the moralis API again to search for token holder by address
 * STEP 6: In the same block query for "LIQUIDITY" using moralis API search by token address...
 */


// async function runnerFilter(
//   startDate: any,
//   endDate: any,
//   min_replies: number,
//   min_faves: number,
//   min_retweets: number,
//   liquidity_locked: number,
//   market_cap: number,
//   buynsell_ratio: number,
//   minimum_holders: number
// ) {

//   // MEME LIST
//   let MEMES: MEME[] = [];

//   // Get and capture list of trending words says maximum of 10...
//   const trendingWords: string[] = await processTweets(startDate, endDate, min_replies, min_faves, min_retweets) || [];

//   for (let i = 0; i < trendingWords?.length; i++) {
//     try {
//       const getMemeResponse: any = await getMemeRequest(trendingWords[i]);
//       if (!getMemeResponse.result) continue;

//       if (getMemeResponse.result.length > 1) {
//         // shorten the word
//         var memeRes: any[] = getMemeResponse.result;
//         for (let i = 0; i < getMemeResponse.result.length; i++) {
//           // Capture the "MARKET_CAP" and "TOKEN_ADDRESS"
//           // query the moralis API again to search for token holder by address
//           const tokenHolderResponse: any = await getTokenHolder(
//             memeRes[i].tokenAddress
//           );
//           // query for "LIQUIDITY" using moralis API search by token address
//           const liquidityStatResponse: any = await getLiquidityStat(
//             memeRes[i].tokenAddress
//           );

//           // Now check for the result meeting the passed criteria before returning the response
//           var bns_ratio: any = liquidityStatResponse.buyVolume["24h"] /
//             liquidityStatResponse.sellVolume["24h"];
//           if (
//             !(memeRes[i].marketCap >= market_cap) && !(
//               liquidityStatResponse.totalLiquidityUsd >= liquidity_locked
//             ) &&
//             !(
//               bns_ratio >=
//               buynsell_ratio
//             ) &&
//             !(tokenHolderResponse.totalHolders >= minimum_holders)
//           )
//             continue;
          
//           // Push the passedMeme to the MEMES list
//           var passedMEME: MEME = {
//             tokenAddress: memeRes[i].tokenAddress,
//             tokenName: memeRes[i].name,
//             liquidityLocked: liquidityStatResponse.totalLiquidityUsd,
//             marketCap: memeRes[i].marketCap,
//             tokenHolder: tokenHolderResponse.totalHolders,
//             buynsellRatio: bns_ratio,
//             rugCheck: "",
//             mentions: "",
//           };
//           MEMES.push(passedMEME);

//         }
//       } else {
//         // Capture the "MARKET_CAP" and "TOKEN_ADDRESS"
//         // query the moralis API again to search for token holder by address
//         const memeResponse: any = getMemeResponse.result[0];
//         const TokenHolderResponse: any = await getTokenHolder(
//           memeResponse.tokenAddress
//         );
//         // query for "LIQUIDITY" using moralis API search by token address
//         const liquidityStatResponse: any = await getLiquidityStat(
//           memeResponse.tokenAddress
//         );
//         // query the moralis API again to search for token holder by address
//         const tokenHolderResponse: any = await getTokenHolder(
//           memeResponse.tokenAddress
//         );

//         // Now check for the result meeting the passed criteria before returning the response
//         var bns_ratio: any =
//           liquidityStatResponse.buyVolume["24h"] /
//           liquidityStatResponse.sellVolume["24h"];

//         // Push the passedMeme to the MEMES list
//         var passedMEMES: MEME = {
//           tokenAddress: memeResponse.tokenAddress,
//           tokenName: memeResponse.name,
//           liquidityLocked: liquidityStatResponse.totalLiquidityUsd,
//           marketCap: memeResponse.marketCap,
//           tokenHolder: tokenHolderResponse.totalHolders,
//           buynsellRatio: bns_ratio,
//           rugCheck: "",
//           mentions: "",
//         };
//         MEMES.push(passedMEMES);
//       }
//     } catch (error: any) {
//       console.error("Error fetching tweets:", error);
//       return null;
//     }

//   }

//   // Return the result
//   return MEMES;
// }

console.log("first")