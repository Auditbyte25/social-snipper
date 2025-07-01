import mongoose, { Schema} from "mongoose";
import jwt from "jsonwebtoken";
import { NextFunction } from "express";
import { userModel } from "../types/types";

const userSchema: Schema = new Schema({
  publicKey: {
    type: String,
    required: [true, "Wallet public key is required"],
  },
  username: {
    type: String,
  },
  profilePicture: {
    public_id: {
      type: String,
      default: 1,
    },
    url: {
      type: String,
      default: "",
    },
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// JWT token
userSchema.methods.getJwtToken = function (this: userModel): string {
  const JWT_SECRET_KEY: any = process.env.JWT_SECRET_KEY;
  // const JWT_EXPIRES: any = process.env.JWT_EXPIRES;
  return jwt.sign({ id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
};

const User = mongoose.model("User", userSchema);
export default User;