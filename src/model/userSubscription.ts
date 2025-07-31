import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReferredUser {
  userId: Types.ObjectId;
  plan: "basic" | "pro" | null;
  subscribedAt: Date;
}

export interface IUserSubscription extends Document {
  userId: Types.ObjectId;
  solanaAddress: string;

  // Pricing plan the user subscribed to
  currentPlan: "basic" | "pro" | null;
  subscriptionTx: string | null;
  subscribedAt: Date | null;

  // Referral system
  referralCode: string;
  referredBy?: Types.ObjectId; // reference to another UserSubscription
  referredUsers: IReferredUser[];

  // Earnings from referrals
  referralEarnings: {
    amountUSD: number;
    userId: Types.ObjectId; // the referred user
    earnedAt: Date;
    payoutStatus: "pending" | "paid";
  }[];
}

const userSubscriptionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    solanaAddress: {
      type: String,
      required: true,
      unique: true,
    },
    currentPlan: {
      type: String,
      enum: ["basic", "pro", null],
      default: null,
    },
    subscriptionTx: {
      type: String,
      default: null,
    },
    subscribedAt: {
      type: Date,
      default: null,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "UserSubscription",
      default: null,
    },
    referredUsers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        plan: {
          type: String,
          enum: ["basic", "pro"],
        },
        subscribedAt: Date,
      },
    ],
    referralEarnings: [
      {
        amountUSD: Number,
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        payoutStatus: {
          type: String,
          enum: ["pending", "paid"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true }
);

const UserSubscription = mongoose.model<IUserSubscription>(
  "UserSubscription",
  userSubscriptionSchema
);

export default UserSubscription;
