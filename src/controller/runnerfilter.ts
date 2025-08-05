import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import { runnerFilter } from "../helper/runnerHelper";
import { MEME } from "../types/types";
import RunnerHistory from "../model/runnerHistory";
import { calculateEngagementMetrics } from "../helper/calculateEngagement";
import BotConfig from "../model/bot";
import { botSwap } from "./bot";
import { decrypt } from "../helper/encryption";
import { getTokenInfo } from "../fetch/fetch";

const productionCreateRunnerFilter = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { min_replies, min_retweets, min_faves } = calculateEngagementMetrics(
      req.body.engagement_score,
      req.body.min_followers
    );
    try {
      const getRunnerResponse: MEME[] =
        (await runnerFilter(
          req.body.startdate,
          req.body.endDate,
          req.body.engagement_score,
          min_replies,
          min_faves,
          min_retweets,
          req.body.liquidity_locked,
          req.body.min_market_cap,
          req.body.max_market_cap,
          req.body.buy_ratio,
          req.body.sell_ratio,
          req.body.minimum_holders
        )) || [];

      const userId = (req as any).user._id;
      if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
      }
      if (!Array.isArray(getRunnerResponse) || getRunnerResponse.length === 0) {
        return res.status(200).json({
          success: true,
          result: [],
          message: "No runner data matched the filter.",
        });
      }

      // ✅ Fetch bot config once
      const isBotConfig: any = await BotConfig.findOne({ userId });
      const decryptedPrivateKey = decrypt(isBotConfig?.privateKey);
      // Map to bulkWrite operations
      // const bulkOps = getRunnerResponse.map((meme) => ({

      //   // Check if autoBuy

      //   updateOne: {
      //     filter: { tokenAddress: meme.tokenAddress, userId },
      //     update: {
      //       $set: {
      //         userId,
      //         marketCap: meme.marketCap,
      //         currentPrice: meme.currentPrice,
      //         tokenAddress: meme.tokenAddress,
      //         tokenName: meme.tokenName,
      //         liquidityLocked: meme.liquidityLocked,
      //         tokenHolder: meme.tokenHolder,
      //         buynsellRatio: meme.buynsellRatio,
      //         rugCheck: meme.rugCheck,
      //         mentions: meme.mentions,
      //         volume24h: meme.volume24h,
      //         engagementScore: meme.engagementScore,
      //         hashtagReach: meme.hashtagReach,
      //         tweetId: meme.tweetId,
      //       },
      //     },
      //     upsert: true,
      //   },
      // }));
      // ✅ Prepare bulk operations
      const bulkOps = await Promise.all(
        getRunnerResponse.map(async (meme) => {
          const updateData: any = {
            userId,
            marketCap: meme.marketCap,
            currentPrice: meme.currentPrice,
            tokenAddress: meme.tokenAddress,
            tokenName: meme.tokenName,
            liquidityLocked: meme.liquidityLocked,
            tokenHolder: meme.tokenHolder,
            buynsellRatio: meme.buynsellRatio,
            rugCheck: meme.rugCheck,
            mentions: meme.mentions,
            volume24h: meme.volume24h,
            engagementScore: meme.engagementScore,
            hashtagReach: meme.hashtagReach,
            tweetId: meme.tweetId,
          };

          // ✅ Conditionally add buyPrice if autoBuy is true
          if (
            isBotConfig?.autoBuy &&
            isBotConfig?.buyAmount &&
            meme.tokenAddress
          ) {
            const result: any = await botSwap(
              meme.tokenAddress,
              isBotConfig.buyAmount,
              isBotConfig.publicKey,
              10,
              decryptedPrivateKey
            );
            if (result?.success === true) {
              updateData.buyPrice = meme.currentPrice;
              updateData.bought = true;
            }
          }

          return {
            updateOne: {
              filter: { tokenAddress: meme.tokenAddress, userId },
              update: { $set: updateData },
              upsert: true,
            },
          };
        })
      );

      // Perform bulk write to save all at once
      const bulkResult = await RunnerHistory.bulkWrite(bulkOps);

      res.status(201).json({
        success: true,
        result: getRunnerResponse,
        message: "Runner History Created or Updated Successfully!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Buy the token with the bot
// Get all runnerHistory
const buyToken = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const runnerHistoryToken: any = await RunnerHistory.findById(
        req.params.id
      );
      if (!runnerHistoryToken.tokenAddress) {
        return next(new ErrorHandler("Token address is required", 400));
      }
      const getTokenInformation: any = await getTokenInfo(
        runnerHistoryToken.tokenAddress
      );
      const buyPrice = getTokenInformation.pools[1].price.usd;
      const rugged = getTokenInformation.risk.rugged;
      const riskScore = getTokenInformation.score;
      // Filter user bot Configuration
      const botConfiguration: any = await BotConfig.find({
        userId: (req as any).user._id,
      });
      if (
        !botConfiguration ||
        !botConfiguration.privateKey ||
        !botConfiguration.publicKey
      ) {
        return next(
          new ErrorHandler(
            "User is not allowed to execute this function because there is incomplete or incorrect configuration",
            401
          )
        );
      }

      // Decrypt the private key encrypted while saving it during the creation initialisation.
      const decryptedPrivateKey = decrypt(botConfiguration.privateKey);

      const buyAmount = req.body.buyAmount
        ? req.body.buyAmount
        : botConfiguration.buyAmount;

      // Now Buy/Swap the token
      const result: any = await botSwap(
        runnerHistoryToken.tokenAddress,
        buyAmount,
        botConfiguration.publicKey,
        10,
        decryptedPrivateKey
      );
      if (result.success != true) {
        return next(new ErrorHandler("Failed to buy the token", 500));
      }

      // Now update the database again
      runnerHistoryToken.bought = true;
      runnerHistoryToken.buyAmount = buyAmount;
      runnerHistoryToken.buyPrice = buyPrice
        ? buyPrice
        : runnerHistoryToken.buyPrice;
      runnerHistoryToken.rugged = rugged;
      runnerHistoryToken.riskScore = riskScore
        ? riskScore
        : runnerHistoryToken.riskScore;

      // Save runnerHistoryToken to database
      const savedRunnerHistoryToken = await runnerHistoryToken.save();

      res.status(201).json({
        success: true,
        result: savedRunnerHistoryToken,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error, 400));
    }
  }
);

// Runnerfilters to fetch trending memes and save it
// @audit Write an algorithm that breaks the engagement score to min_replies, min_faves, min_retweets...
const createRunnerFilter = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { min_replies, min_retweets, min_faves } = calculateEngagementMetrics(
      req.body.engagement_score,
      req.body.min_followers
    );
    try {
      const getRunnerResponse: MEME[] =
        (await runnerFilter(
          req.body.startdate,
          req.body.endDate,
          req.body.engagement_score,
          min_replies,
          min_faves,
          min_retweets,
          req.body.liquidity_locked,
          req.body.min_market_cap,
          req.body.max_market_cap,
          req.body.buy_ratio,
          req.body.sell_ratio,
          req.body.minimum_holders
        )) || [];

      const userId = (req as any).user._id;
      if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
      }
      if (!Array.isArray(getRunnerResponse) || getRunnerResponse.length === 0) {
        return res.status(200).json({
          success: true,
          result: [],
          message: "No runner data matched the filter.",
        });
      }

      // Map to bulkWrite operations
      const bulkOps = getRunnerResponse.map((meme) => ({
        updateOne: {
          filter: { tokenAddress: meme.tokenAddress, userId },
          update: {
            $set: {
              userId,
              marketCap: meme.marketCap,
              currentPrice: meme.currentPrice,
              tokenAddress: meme.tokenAddress,
              tokenName: meme.tokenName,
              liquidityLocked: meme.liquidityLocked,
              tokenHolder: meme.tokenHolder,
              buynsellRatio: meme.buynsellRatio,
              rugCheck: meme.rugCheck,
              mentions: meme.mentions,
              volume24h: meme.volume24h,
              engagementScore: meme.engagementScore,
              hashtagReach: meme.hashtagReach,
              tweetId: meme.tweetId,
            },
          },
          upsert: true,
        },
      }));

      // Perform bulk write to save all at once
      const bulkResult = await RunnerHistory.bulkWrite(bulkOps);

      res.status(201).json({
        success: true,
        result: getRunnerResponse,
        message: "Runner History Created or Updated Successfully!",
      });

      // Save to the database
      // let runnerResponse: any[] = [];
      // if (getRunnerResponse.length > 1) {
      //   for (let i = 0; i < getRunnerResponse.length; i++) {
      //     try {
      //       const userId = req.body.userId;
      //       console.log(getRunnerResponse);
      //       const runnerHistory = {
      //         userId: userId,
      //         marketCap: getRunnerResponse[i].marketCap,
      //         currentPrice: getRunnerResponse[i].currentPrice,
      //         tokenAddress: getRunnerResponse[i].tokenAddress,
      //         tokenName: getRunnerResponse[i].tokenName,
      //         liquidityLocked: getRunnerResponse[i].liquidityLocked,
      //         tokenHolder: getRunnerResponse[i].tokenHolder,
      //         buynsellRatio: getRunnerResponse[i].buynsellRatio,
      //         rugCheck: getRunnerResponse[i].rugCheck,
      //         mentions: getRunnerResponse[i].mentions,
      //       };
      //       const newRunnerHistory = await RunnerHistory.create(runnerHistory);
      //       runnerResponse.push(newRunnerHistory);
      //     } catch (error: any) {
      //       return next(new ErrorHandler(error.message, 500));
      //     }
      //   }
      // }
      // -------- Continue the rest of the operation... ----------- //
      // res.status(201).json({
      //   success: true,
      //   result: runnerResponse,
      //   message: "Runner History Created Successfully!",
      // });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Get all runnerHistory
const getAllRunnerHistory = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const runnerHistory = await RunnerHistory.find({
        userId: (req as any).user._id,
      });

      res.status(201).json({
        success: true,
        result: runnerHistory,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error, 400));
    }
  }
);

// Delete all runnerHistory
const deleteAllRunnerHistory = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await RunnerHistory.deleteMany({ userId: (req as any).user._id });

      return res.status(200).json({
        success: true,
        message: "Runner history deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error, 400));
    }
  }
);

export {
  createRunnerFilter,
  getAllRunnerHistory,
  deleteAllRunnerHistory,
  buyToken,
};
