import express from "express";
import {
  createRunnerFilter,
  getAllRunnerHistory,
  deleteAllRunnerHistory,
} from "../controller/runnerfilter";
import { isAdmin, isAuthenticated } from "../middleware/auth";
import { checkSubscription } from "../middleware/checkSubscription";

// Initallizing the router
const router = express.Router();

// After isAuthenticated, we can check the subscription:::checkSubscription("basic"),
router.post(
  "/create-runnerHistory",
  isAuthenticated,
  createRunnerFilter
);

// The id is userId and user the id passed from isAuthenticated
router.get("/get-runnerHistory", isAuthenticated, getAllRunnerHistory);
router.delete(
  "/delete-runnerHistory",
  isAuthenticated,
  deleteAllRunnerHistory
);

export default router;