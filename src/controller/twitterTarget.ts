import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import { calculateEngagementMetrics } from "../helper/calculateEngagement";
import { processTwitterUser } from "../helper/twitterHelper";
import { fetchUserTweet } from "../fetch/twitterFetch";
import { MEME } from "../types/types";
import { searchTokens } from "../fetch/fetch";

function extractTokenAndCA(tweet: any) {
  const tokenMatch = tweet.text.match(/\$(\w+)/);
  //   const caMatch = tweet.text.match(/([A-Za-z0-9]{32,})pump/);
  const caMatch = tweet.text.match(
    /CA:\s*([A-Za-z0-9]{32,}pump|[A-HJ-NP-Za-km-z1-9]{32,44}|0x[a-fA-F0-9]{40})/
  );

  const token = tokenMatch ? tokenMatch[1] : null;
  const ca = caMatch ? caMatch[1] : null;

  // Only return if either token or CA are found
  if (token || ca) {
    return {
      token_name: token,
      ca: ca,
    };
  }

  return null;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getTwitterTarget = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    let engagement_score: any = req.body.engagement_score;
    let min_followers: any = req.body.min_followers;
    const { min_replies, min_retweets, min_faves } = calculateEngagementMetrics(
      engagement_score,
      min_followers
    );
    // MEME LIST
    let MEMES: MEME[] = [];

    try {
      // Fetch user's tweets
      // 1. Fetch user
      const user: any = await processTwitterUser(
        req.body.username,
        req.body.verification_status ? req.body.verification_status : " ",
        req.body.min_followers,
        req.body.account_age ? req.body.account_age : " "
      );

      // Fetch user's tweet if user exist
      if (!user) {
        return res.status(404).json({
          success: false,
          msg: "User doesn't match the expectation...",
        });
      }

      // Fetch users tweet
      const userTweetsResponse: any = await fetchUserTweet(
        req.body.username,
        req.body.startDate,
        req.body.endDate,
        min_replies,
        min_faves,
        min_retweets
      );
      const userTweets: any[] = userTweetsResponse.timeline;
      const tokenList: any = userTweets
        .map((tweet: any) => extractTokenAndCA(tweet))
        .filter((result: any) => result !== null);

      console.log(tokenList);
      // Loop through the list and capture the token
      for (let i = 0; i < tokenList?.length; i++) {
        if (!tokenList[i].token_name && !tokenList[i].ca) {
          continue;
        }
        if (tokenList[i].token_name) {
          const memeResponse: any = await searchTokens(tokenList[i].token_name);
          console.log(memeResponse);
          for (let j = 0; j < Math.min(memeResponse?.length || 0, 2); j++) {
            const token = memeResponse[j];
            const buys = Number(token.totalBuys);
            const sells = Number(token.totalSells);
            let bns = buys / sells;
            var passedMEME: MEME = {
              tokenAddress: token.mint,
              tokenName: token.name,
              liquidityLocked: token.liquidityUsd,
              marketCap: token.marketCapUsd,
              tokenHolder: token.holders,
              buynsellRatio: bns,
              rugCheck: "",
              mentions: "",
              currentPrice: token.priceUsd,
            };

            MEMES.push(passedMEME);
            await delay(1000);
          }
          console.log(MEMES);
        } else if (tokenList[i].ca) {
          const memeResponse: any = await searchTokens(tokenList[i].ca);
          for (let j = 0; j < Math.min(memeResponse?.length || 0, 2); j++) {
            const token = memeResponse[j];
            const buys = Number(token.totalBuys);
            const sells = Number(token.totalSells);
            let bns = buys / sells;
            var passedMEME: MEME = {
              tokenAddress: token.mint,
              tokenName: token.name,
              liquidityLocked: token.liquidityUsd,
              marketCap: token.marketCapUsd,
              tokenHolder: token.holders,
              buynsellRatio: bns,
              rugCheck: "",
              mentions: "",
              currentPrice: token.priceUsd,
            };

            MEMES.push(passedMEME);
            await delay(1000);
          }
          console.log(MEMES);
          
        }
      }

      // Return the response
      console.log(MEMES);
      res.status(201).json({
        success: true,
        result: MEMES,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// -------- Testing Data for Getting Twitter Target... ----------- //

// const getTwitterTargetx = async (
//   username: string,
//   verification_status: boolean | string,
//   min_followers: number,
//   engagement_score: number,
//   account_age: number | string,
//   startDate: string,
//   endDate: string
// ): Promise<MEME[] | null> => {
//   const { min_replies, min_retweets, min_faves } = calculateEngagementMetrics(
//     engagement_score,
//     min_followers
//   );

//   let MEMES: MEME[] = [];
//   const verified =
//     verification_status === "true" || verification_status === true;
//   const age =
//     typeof account_age === "string" ? parseFloat(account_age) : account_age;

//   try {
//     const user: any = await processTwitterUser(
//       username,
//       verified,
//       min_followers,
//       isNaN(age) ? 0 : age
//     );

//     if (!user) {
//       console.log("User doesn't match the expectation...");
//       return null;
//     }

//     const userTweetsResponse: any = await fetchUserTweet(
//       username,
//       startDate,
//       endDate,
//       min_replies,
//       min_faves,
//       min_retweets
//     );

//     const userTweets: any[] = userTweetsResponse.timeline;
//     const tokenList: any = userTweets
//       .map((tweet: any) => extractTokenAndCA(tweet))
//       .filter((result: any) => result !== null);

//     // for (let i = 0; i < tokenList?.length; i++) {
//     //   const tokenData = tokenList[i];

//     //   if (!tokenData.token_name && !tokenData.ca) {
//     //     continue;
//     //   }

//     //   const memeResponse: any = await searchTokens(
//     //     tokenData.token_name || tokenData.ca
//     //   );
//     //   memeResponse.slice(0, 5).forEach((token: any) => {
//     //     const buys = Number(token.totalBuys);
//     //     const sells = Number(token.totalSells);
//     //     let bns = buys / (sells || 1); // Avoid division by 0

//     //     const passedMEME: MEME = {
//     //       tokenAddress: token.mint,
//     //       tokenName: token.name,
//     //       liquidityLocked: token.liquidityUsd,
//     //       marketCap: token.marketCapUsd,
//     //       tokenHolder: token.holders,
//     //       buynsellRatio: bns,
//     //       rugCheck: "",
//     //       mentions: "",
//     //       currentPrice: token.priceUsd,
//     //     };

//     //     MEMES.push(passedMEME);
//     //   });
//     // }

//     console.log(MEMES);
//     return MEMES;
//   } catch (error: any) {
//     console.error("Failed to get Twitter target:", error.message);
//     return null;
//   }
// };

// const startDate = "2025-06-01";
// const endDate = "2025-06-28";

// (async () => {
//   const memes = await getTwitterTargetx(
//     "TheCryptoCajun", // username
//     true, // verification_status
//     1404, // min_followers
//     0,
//     2,
//     startDate,
//     endDate
//   );

//   if (memes && memes.length > 0) {
//     console.log("🎯 Retrieved MEMEs:", memes);
//   } else {
//     console.log("🚫 No MEMEs matched the criteria.");
//   }
// })();

export { getTwitterTarget };
