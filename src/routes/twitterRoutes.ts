import express from "express";
import {
  getTwitterTarget,
  twitterTarget,
  getAllTwitterTargets,
  deleteTwitterTargetByUsername,
} from "../controller/twitterTarget";
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
router.post("/twitterTarget", isAuthenticated, twitterTarget);
router.get("/getAllTargets", isAuthenticated, getAllTwitterTargets);
router.delete("/deleteTarget", isAuthenticated, deleteTwitterTargetByUsername);

export default router;
