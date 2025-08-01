import mongoose, { Document, Schema, Types } from "mongoose";

// Define the BotConfig TypeScript interface
interface TwitterTargetConfigInterface extends Document {
  userId: Types.ObjectId;
  twitterUsername: string;
  mentionHour: number;
  followers: string;
  lastActivity: number;
  autoBuy: boolean;
  buyAmount: number;
  stopLoss: number;
  takeProfit: number;
  status: string;
  createdAt: Date;
}

// Define the schema
const twitterTargetSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"],
  },
  twitterUsername: {
    type: String,
    required: [true, "Twitter username is required"],
  },
  mentionHour: {
    type: Number,
  },
  followers: {
    type: String,
  },
  lastActivity: {
    type: Number,
    default: 0,
  },
  autoBuy: {
    type: Boolean,
    default: false,
  },
  buyAmount: {
    type: Number,
    default: 1,
  },
  stopLoss: {
    type: Number,
    default: 0,
  },
  takeProfit: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "Inactive",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the model
const TwitterTarget = mongoose.model<TwitterTargetConfigInterface>(
  "TwitterTarget",
  twitterTargetSchema
);

export default TwitterTarget;
