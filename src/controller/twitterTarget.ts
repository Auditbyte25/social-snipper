import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import { calculateEngagementMetrics } from "../helper/calculateEngagement";
import { processTwitterUser } from "../helper/twitterHelper";
import { fetchUserTweet } from "../fetch/twitterFetch";
import { MEME } from "../types/types";
import { searchTokens } from "../fetch/fetch";
import { fetchUserTimeline } from "../fetch/twitterFetch";
import User from "../model/user";
import TwitterTarget from "../model/twitterTarget";
import TwitterTokenSnipped from "../model/twitterTokenSnipped";

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

const snipTwitterTarget = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    let engagement_score: any = req.body.engagement_score;
    let min_followers: any = req.body.min_followers;
    const { min_replies, min_retweets, min_faves } = calculateEngagementMetrics(
      engagement_score,
      min_followers
    );
    // MEME LIST
    let MEMES: MEME[] = [];
    const usernames = req.body.usernames || [];
    const timestampInMinutes = Math.floor(Date.now() / 60000);

    try {
      // Fetch user's tweets
      for (const userObj of usernames) {
        const { username, autobuy } = userObj;
        if (!autobuy) continue;

        // 1. Fetch user
        const user: any = await processTwitterUser(
          username,
          req.body.verification_status ? req.body.verification_status : " ",
          req.body.min_followers,
          req.body.account_age ? req.body.account_age : " "
        );
        if (!user) {
          return res.status(404).json({
            success: false,
            msg: "User doesn't match the expectation...",
          });
        }
        // Fetch users tweet
        const userTweetsResponse: any = await fetchUserTweet(
          username,
          req.body.startDate,
          req.body.endDate,
          min_replies,
          min_faves,
          min_retweets
        );
        const userTweets: any[] = userTweetsResponse.timeline || [];
        const tokenList: any = userTweets
          .map((tweet: any) => extractTokenAndCA(tweet))
          .filter((result: any) => result !== null);

        console.log(`Token list for ${username}:`, tokenList);
        // Loop through the list and capture the token
        for (let i = 0; i < tokenList?.length; i++) {
          if (!tokenList[i].token_name && !tokenList[i].ca) {
            continue;
          }
          if (
            tokenList[i].token_name ||
            (tokenList[i].token_name && tokenList[i].ca)
          ) {
            const memeResponse: any = await searchTokens(
              tokenList[i].token_name
            );
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
                mention24h: req.body.mention ? req.body.mention : 0,
                currentPrice: token.priceUsd,
                tweetSource: username,
                engagementScore: engagement_score,
                time: timestampInMinutes,
                tokenDrop: "Not yet",
              };

              MEMES.push(passedMEME);

              // Save to DB
              await TwitterTokenSnipped.create({
                userId: (req as any).user._id,
                tokenName: token.name,
                tweetSource: username,
                time: timestampInMinutes,
                engagementScore: engagement_score,
                mentions: req.body.mention ? req.body.mention : 0,
                tokenDrop: "Not yet",
              });

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
                mention24h: req.body.mention ? req.body.mention : 0,
                currentPrice: token.priceUsd,
                tweetSource: username,
                engagementScore: engagement_score,
                time: timestampInMinutes,
                tokenDrop: "Not yet",
              };

              MEMES.push(passedMEME);

              // Save to DB
              await TwitterTokenSnipped.create({
                userId: (req as any).user._id,
                tokenName: token.name,
                tweetSource: username,
                time: timestampInMinutes,
                engagementScore: engagement_score,
                mentions: req.body.mention ? req.body.mention : 0,
                tokenDrop: "Not yet",
              });

              await delay(1000);
            }
            console.log(MEMES);
          }
        }
      }
      // // 1. Fetch user
      // const user: any = await processTwitterUser(
      //   req.body.username,
      //   req.body.verification_status ? req.body.verification_status : " ",
      //   req.body.min_followers,
      //   req.body.account_age ? req.body.account_age : " "
      // );

      // Fetch user's tweet if user exist
      // if (!user) {
      //   return res.status(404).json({
      //     success: false,
      //     msg: "User doesn't match the expectation...",
      //   });
      // }

      // // Fetch users tweet
      // const userTweetsResponse: any = await fetchUserTweet(
      //   req.body.username,
      //   req.body.startDate,
      //   req.body.endDate,
      //   min_replies,
      //   min_faves,
      //   min_retweets
      // );
      // const userTweets: any[] = userTweetsResponse.timeline;
      // const tokenList: any = userTweets
      //   .map((tweet: any) => extractTokenAndCA(tweet))
      //   .filter((result: any) => result !== null);

      // console.log(tokenList);
      // // Loop through the list and capture the token
      // for (let i = 0; i < tokenList?.length; i++) {
      //   if (!tokenList[i].token_name && !tokenList[i].ca) {
      //     continue;
      //   }
      //   if (tokenList[i].token_name) {
      //     const memeResponse: any = await searchTokens(tokenList[i].token_name);
      //     console.log(memeResponse);
      //     for (let j = 0; j < Math.min(memeResponse?.length || 0, 2); j++) {
      //       const token = memeResponse[j];
      //       const buys = Number(token.totalBuys);
      //       const sells = Number(token.totalSells);
      //       let bns = buys / sells;
      //       var passedMEME: MEME = {
      //         tokenAddress: token.mint,
      //         tokenName: token.name,
      //         liquidityLocked: token.liquidityUsd,
      //         marketCap: token.marketCapUsd,
      //         tokenHolder: token.holders,
      //         buynsellRatio: bns,
      //         rugCheck: "",
      //         mentions: "",
      //         currentPrice: token.priceUsd,
      //       };

      //       MEMES.push(passedMEME);
      //       await delay(1000);
      //     }
      //     console.log(MEMES);
      //   } else if (tokenList[i].ca) {
      //     const memeResponse: any = await searchTokens(tokenList[i].ca);
      //     for (let j = 0; j < Math.min(memeResponse?.length || 0, 2); j++) {
      //       const token = memeResponse[j];
      //       const buys = Number(token.totalBuys);
      //       const sells = Number(token.totalSells);
      //       let bns = buys / sells;
      //       var passedMEME: MEME = {
      //         tokenAddress: token.mint,
      //         tokenName: token.name,
      //         liquidityLocked: token.liquidityUsd,
      //         marketCap: token.marketCapUsd,
      //         tokenHolder: token.holders,
      //         buynsellRatio: bns,
      //         rugCheck: "",
      //         mentions: "",
      //         currentPrice: token.priceUsd,
      //       };

      //       MEMES.push(passedMEME);
      //       await delay(1000);
      //     }
      //     console.log(MEMES);
          
      //   }
      // }

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

// Get all TwitterTokenSnipped documents created by a specific user
const getAllTwitterTokenSnippedByUserId = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokens = await TwitterTokenSnipped.find({
        userId: (req as any).user._id,
      });

      res.status(200).json({
        success: true,
        result: tokens,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Delete a TwitterTokenSnipped document by ID
const deleteTwitterTokenSnippedById = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const deletedToken = await TwitterTokenSnipped.findByIdAndDelete(id);

      if (!deletedToken) {
        return next(new ErrorHandler("Token not found", 404));
      }

      res.status(200).json({
        success: true,
        message: "Token successfully deleted",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// FUNCTION TO COUNT RECENT TWEETS MENTIONS
function countRecentTweets(tweets: any[]): number {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  let count = 0;

  for (const tweet of tweets) {
    const tweetDate = new Date(tweet.created_at);
    if (tweetDate >= twentyFourHoursAgo && tweetDate <= now) {
      count += tweet.entities?.user_mentions?.length || 0;
    }
  }

  return count;
}

// TWITTERTARGET GENERATOR FUNCTION
const twitterTarget = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    // const user: any = await fetchUserTimeline(req.body.username);
    const user: any = await fetchUserTimeline(req.body.twitterUsername);
    const {twitterUsername, buyAmount, takeProfit, stopLoss, autoBuy} = req.body;
    // Fetch user's tweet if user exist
    try {
      if (!user) {
        return res.status(404).json({
          success: false,
          msg: "User doesn't match the expectation...",
        });
      }
      console.log(user);
      const userId: any = await User.findById((req as any).user._id);
      if (!userId) {
        return next(
          new ErrorHandler("User is not available with this id", 400)
        );
      }
      // const isTwitterTargetExist = await TwitterTarget.findOne({ userId: userId._id });
      // Converting time of the last activity to minutes of the day
      const date = new Date(user.timeline[0].created_at);
      const minutesOfDay = date.getUTCHours() * 60 + date.getUTCMinutes();
      // Now get the user mentions
      const mentionsCount: any = countRecentTweets(user.timeline);

      // CHECK IF TwitterTarget EXISTS FOR THE USERID AND twitterUsername
      const existingTarget = await TwitterTarget.findOne({
        userId: userId._id,
        twitterUsername: twitterUsername,
      });
      let twitterTarget;
      if (existingTarget) {
        // ✅ Update existing TwitterTarget
        existingTarget.mentionHour = mentionsCount;
        existingTarget.followers = user.user.sub_count;
        existingTarget.lastActivity = minutesOfDay;
        existingTarget.autoBuy =
          autoBuy != null ? autoBuy : existingTarget.autoBuy;
        existingTarget.buyAmount =
          buyAmount != null ? buyAmount : existingTarget.buyAmount;
        existingTarget.stopLoss =
          stopLoss != null ? stopLoss : existingTarget.stopLoss;
        existingTarget.takeProfit =
          takeProfit != null ? takeProfit : existingTarget.takeProfit;
        existingTarget.status = user.user.status;

        twitterTarget = await existingTarget.save();
      } else {
        // ➕ Create new TwitterTarget
        twitterTarget = await TwitterTarget.create({
          userId: userId._id,
          twitterUsername: twitterUsername,
          mentionHour: mentionsCount,
          followers: user.user.sub_count,
          lastActivity: minutesOfDay,
          autoBuy: autoBuy,
          buyAmount: buyAmount,
          stopLoss: stopLoss,
          takeProfit: takeProfit,
          status: user.user.status,
        });
      }
      return res.status(existingTarget ? 200 : 201).json({
        success: true,
        result: twitterTarget,
        message: existingTarget
          ? "Twitter target updated successfully!"
          : "New twitter target added successfully!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get all TwitterTarget entries created by a specific user
const getAllTwitterTargets = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const twitterTargets = await TwitterTarget.find({
        userId: (req as any).user._id,
      });

      res.status(200).json({
        success: true,
        result: twitterTargets,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Delete a specific TwitterTarget by ID
const deleteTwitterTargetByUsername = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const twitterTarget = await TwitterTarget.findOneAndDelete({
        twitterUsername: req.params.twitterUsername,
        userId: (req as any).user._id, // Ensures the user owns the target
      });

      if (!twitterTarget) {
        return next(
          new ErrorHandler("Twitter target not found or access denied", 404)
        );
      }

      return res.status(200).json({
        success: true,
        message: "Twitter target deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


// async function main() {
//   const data = await fetchUserTimeline("elonmusk");
//   console.log(data.timeline[0]);
//   const date = new Date(data.timeline[0].created_at);
//   const minutesOfDay = date.getUTCHours() * 60 + date.getUTCMinutes();
//   console.log("Minutes into the day:", minutesOfDay);
//   console.log("User Mentions in the last 24 hours:", countRecentTweets(data.timeline));
// }
// main();

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

export {
  getTwitterTarget,
  twitterTarget,
  getAllTwitterTargets,
  deleteTwitterTargetByUsername,
  snipTwitterTarget,
  getAllTwitterTokenSnippedByUserId,
  deleteTwitterTokenSnippedById,
};
