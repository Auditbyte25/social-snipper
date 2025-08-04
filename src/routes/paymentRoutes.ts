import express from "express";
import { paymentPlan, subscriptionPlan } from "../controller/payment";
import { isAdmin, isAuthenticated } from "../middleware/auth";

// Initallizing the router
const router = express.Router();

router.post("/subscribeTest", isAuthenticated, paymentPlan);
router.post("/subscribe", isAuthenticated, subscriptionPlan);

export default router;