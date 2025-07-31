import express from "express";
import { getTwitterTarget } from "../controller/twitterTarget";
import { isAdmin, isAuthenticated } from "../middleware/auth";
import { checkSubscription } from "../middleware/checkSubscription";

// Initallizing the router
const router = express.Router();

// After isAuthenticated, we can check the subscription:::checkSubscription("basic"),
router.post(
  "/getTwitterTarget",
  isAuthenticated,
  getTwitterTarget
);

export default router;
