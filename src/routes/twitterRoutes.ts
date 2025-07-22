import express from "express";
import { getTwitterTarget } from "../controller/twitterTarget";
import { isAdmin, isAuthenticated } from "../middleware/auth";

// Initallizing the router
const router = express.Router();

router.post("/getTwitterTarget", isAuthenticated, getTwitterTarget);

export default router;