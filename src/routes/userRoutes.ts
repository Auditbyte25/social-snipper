import express from "express";
import {
  connectWallet,
  updateUserInfo,
  getAllUsers,
  deleteUser,
  getUserInfo,
} from "../controller/user";
import { isAdmin, isAuthenticated } from "../middleware/auth";

// Initallizing the router
const router = express.Router();

router.post("/connect-wallet", connectWallet);
router.put("/update-profile", isAuthenticated, updateUserInfo);
router.get("/get-userprofile", isAuthenticated, getUserInfo);
router.get("/get-all-users", isAuthenticated, isAdmin("Admin"), getAllUsers);
router.delete("/delete-user/:id", isAuthenticated, isAdmin("Admin"), deleteUser);

export default router;