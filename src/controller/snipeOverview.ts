import { Request, Response, NextFunction } from "express";
import User from "../model/user";
import TwitterTokenSnipped from "../model/twitterTokenSnipped";
import RunnerHistory from "../model/runnerHistory";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import BotConfig from "../model/bot";

const snipeOverview = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;
    try {
      const config: any = await BotConfig.findOne({ userId: userId });
      let tokenSnippedInformation: any = {};
      // Get user Twitter snipped token
      const twitterSnippped: any = await TwitterTokenSnipped.find({
        userId: userId,
      });
      const runnerSnipped: any = await RunnerHistory.find({
        userId: userId,
        bought: true,
      });
      const getRunnerRugged: any = await RunnerHistory.find({
        userId: userId,
        bought: true,
        rugged: true,
      });
      const totalTokenSnipped: number =
        twitterSnippped.length + runnerSnipped.length;
      // Updating tokenSnippedInformation
      tokenSnippedInformation.totalTokenSnipped = totalTokenSnipped;
      tokenSnippedInformation.autoBuyActive = twitterSnippped.length;
      tokenSnippedInformation.getRunnerRugged = getRunnerRugged.length;
      tokenSnippedInformation.twitterTargets = twitterSnippped;
      tokenSnippedInformation.runnerReports = runnerSnipped;
      tokenSnippedInformation.publicKey = config.publicKey;

      // return the response
      res.status(201).json({
        success: true,
        result: tokenSnippedInformation,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export { snipeOverview };
