import express from "express";
import { paymentPlan } from "../controller/payment";
import { isAdmin, isAuthenticated } from "../middleware/auth";

// Initallizing the router
const router = express.Router();

router.post("/subscribe", isAuthenticated, paymentPlan);

export default router;