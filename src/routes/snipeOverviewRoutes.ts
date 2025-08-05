import express from "express";
import { snipeOverview } from "../controller/snipeOverview";
import { isAuthenticated } from "../middleware/auth";
import { checkSubscription } from "../middleware/checkSubscription";

const router = express.Router();
// checkSubscription("pro"),
router.get("/overview", isAuthenticated, snipeOverview);

export default router;
