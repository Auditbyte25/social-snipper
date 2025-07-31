import { Request, Response, NextFunction } from "express";
import catchAsyncErrors from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import UserSubscription from "../model/userSubscription";

// Creating checkSubscription middleware
/**
 * checkSubscription("basic") — What It Means:
 * A user on the basic plan can access this route 
 * A user on the pro plan can also access this route
 * A user with no plan or null will be blocked
 * 
 * checkSubscription("pro") — What It Means:
 * A user on the pro plan allowed
 * A user on the basic plan blocked
 * A user with no plan or null blocked
 * @param requiredPlan 
 * @returns next
 */
const checkSubscription = (requiredPlan: string) => {
  return catchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as any).user.id;
      const subscription = await UserSubscription.findOne({ userId: userId });

      if (!subscription || !subscription.currentPlan) {
        return next(
          new ErrorHandler("No active subscription found for this user.", 403)
        );
      }

      const userPlan = subscription.currentPlan;
      // Allow access if user's plan matches or is pro (since pro covers basic)
      if (
        (requiredPlan === "basic" &&
          (userPlan === "basic" || userPlan === "pro")) ||
        (requiredPlan === "pro" && userPlan === "pro")
      ) {
        return next();
      }

      return next(
        new ErrorHandler(
          `Access denied. This feature requires a '${requiredPlan}' plan.`,
          403
        )
      );
    }
  );
};

export { checkSubscription };
