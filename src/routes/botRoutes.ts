import express from "express";
import { setBotWalletConfig, updateBotWalletConfig } from "../controller/bot";
import { isAuthenticated } from "../middleware/auth";
import { checkSubscription } from "../middleware/checkSubscription";

const router = express.Router();
// checkSubscription("pro"),
router.post("/set-wallet", isAuthenticated, setBotWalletConfig);
router.put("/update-wallet", isAuthenticated, updateBotWalletConfig);

export default router;