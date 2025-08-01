import express from "express";
import {
  getTwitterTarget,
  twitterTarget,
  getAllTwitterTargets,
  deleteTwitterTargetByUsername,
  snipTwitterTarget,
  getAllTwitterTokenSnippedByUserId,
  deleteTwitterTokenSnippedById,
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
// Token snipper routes
router.post("/snipTwitterTarget", isAuthenticated, snipTwitterTarget);
router.get(
  "/getAllsnipTarget",
  isAuthenticated,
  getAllTwitterTokenSnippedByUserId
);
router.delete(
  "/deleteSnipTarget",
  isAuthenticated,
  deleteTwitterTokenSnippedById
);

export default router;
