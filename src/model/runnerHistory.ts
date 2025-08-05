import mongoose, { Document, Schema, Types } from "mongoose";

interface IRunnerHistory extends Document {
  userId: Types.ObjectId;
  marketCap: number;
  currentPrice: number;
  tokenAddress: string;
  tokenName: string;
  liquidityLocked: number;
  tokenHolder: number | null;
  buynsellRatio: number;
  rugCheck: string;
  mentions: string;
  volume24h: number;
  engagementScore: number;
  hashtagReach: number;
  tweetId: string;
  bought: boolean;
  buyPrice: number;
  sellPrice: number;
  profitnloss: number;
  rugged: boolean;
  riskScore: number;
  buyAmount: number
}

const runnerHistorySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    marketCap: {
      type: Number,
    },
    currentPrice: {
      type: Number,
    },
    tokenAddress: {
      type: String,
    },
    tokenName: {
      type: String,
    },
    liquidityLocked: {
      type: Number,
    },
    tokenHolder: {
      type: Number,
    },
    buynsellRatio: {
      type: Number,
    },
    rugCheck: {
      type: String,
    },
    mentions: {
      type: String,
    },
    volume24h: {
      type: Number,
    },
    engagementScore: {
      type: Number,
    },
    hashtagReach: {
      type: Number,
    },
    tweetId: {
      type: String,
    },
    bought: {
      type: Boolean,
      default: false,
    },
    buyPrice: {
      type: Number
    },
    sellPrice: {
      type: Number
    },
    profitnloss: {
      type: Number
    },
    rugged: {
      type: Boolean,
    },
    riskScore: {
      type: Number
    },
    buyAmount: {
      type: Number
    }
  },
  { timestamps: true }
);

const RunnerHistory = mongoose.model<IRunnerHistory>(
  "RunnerHistory",
  runnerHistorySchema
);

export default RunnerHistory;
