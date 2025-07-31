import { Request, Response, NextFunction } from "express";
import User from "../model/user";
import ErrorHandler from "../utils/ErrorHandler";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import sendToken from "../utils/jwtToken";

cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_secret_key,
});

// Helper to generate a random 6-digit number
const generateReferralCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // e.g., "492781"
};

// Create user
const connectWallet = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const publicKey = req.body.publicKey;
      if (!publicKey) {
        return next(new ErrorHandler("Public key is required", 400));
      }

      let user: any = await User.findOne({ publicKey: publicKey });
      if (!user) {
        user = await User.create({ publicKey: publicKey });
        console.log(user);
        let token: any = sendToken(user, 201, res);
        return res.status(201).json({
          success: true,
          token: token,
          message: "Account connected successfully!",
        });
      }

      let token: any = sendToken(user, 201, res);
      res.status(201).json({
        success: true,
        token: token,
        message: "Account connected already!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// create referral id
const createReferralCode = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?._id;
      if (!userId) {
        return next(new ErrorHandler("User not authenticated", 401));
      }

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Return existing referral code if already present
      if (user.referralCode) {
        return res.status(200).json({
          success: true,
          referralCode: user.referralCode,
          message: "Referral code already exists",
        });
      }

      // Generate a new random numeric referral code
      let referralCode: any;
      let exists = true;

      // Ensure referralCode is unique
      while (exists) {
        referralCode = generateReferralCode();
        const codeCheck = await User.findOne({ referralCode });
        exists = !!codeCheck;
      }

      user.referralCode = referralCode;
      await user.save();

      res.status(201).json({
        success: true,
        referralCode,
        message: "Referral code created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

/**
 *Update user profile
 * @param {object} req, username, profilePicture
 * @param {object} res
 * @returns {object} success message
 */
const updateUserInfo = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publicKey, username, profilePicture } = req.body;
      const existedUser = await User.findOne({ publicKey: publicKey });
      if (!existedUser) {
        return next(new ErrorHandler("Connect wallet first", 403));
      }
      const user: any = await User.findById((req as any).user.id);

      if (existedUser.id != user.id)
        return next(new ErrorHandler("Wallet not match the userId", 403));

      // profile picture upload
      var myCloud: any;
      if (profilePicture && profilePicture != "") {
        myCloud = await cloudinary.uploader.upload(profilePicture, {
          folder: "profilePictures",
        });
      }
      // Console log the mycloud
      console.log(myCloud);

      const profilePic = {
        public_id: (myCloud && myCloud.public_id) || "",
        url: (myCloud && myCloud.secure_url) || "",
      };
      // updating the user profile
      user.username = username ? username : user.username;
      user.profilePicture = profilePic ? profilePic : user.profilePicture;

      await user.save();
      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get all users by the admin
const getAllUsers = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await User.find().sort({
        createdAt: -1,
      });
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const disconnectUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
// Delete user by the admin
const deleteUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: any = await User.findById(req.params.id);
      if (!user) {
        return next(
          new ErrorHandler("User is not available with this id", 400)
        );
      }
      const imageId = user.profilePicture.public_id;
      imageId && (await cloudinary.uploader.destroy(imageId));

      await User.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "User deleted successfully!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 *Get user profile
 * @param {object} req
 * @param {object} res, all the information about the user
 * @returns {object} success message
 */
const getUserInfo = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: any = await User.findById((req as any).user.id);
      if (!user) {
        return next(
          new ErrorHandler("User is not available with this id", 400)
        );
      }
      res.status(201).json({
        success: true,
        results: user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Export the functions
export {
  connectWallet,
  updateUserInfo,
  getAllUsers,
  deleteUser,
  getUserInfo,
  disconnectUser,
  createReferralCode,
};
