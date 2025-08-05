import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import { encrypt } from "../helper/encryption";


// Define the BotConfig TypeScript interface
interface BotConfigInterface extends Document {
  userId: Types.ObjectId;
  publicKey: string;
  privateKey: string;
  autoBuy: boolean;
  buyAmount: number;
  stopLoss: number;
  takeProfit: number;
  createdAt: Date;
}

const botConfigSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"],
  },
  publicKey: {
    type: String,
    required: [true, "Public key is required"],
  },
  privateKey: {
    type: String,
    required: [true, "Private key is required"],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 🔐 Encrypt privateKey before saving
botConfigSchema.pre<BotConfigInterface>("save", async function (next) {
  if (this.isModified("privateKey")) {
    this.privateKey = encrypt(this.privateKey); // ✅ use AES encryption
  }

  next();
});

const BotConfig = mongoose.model<BotConfigInterface>(
  "BotConfig",
  botConfigSchema
);
export default BotConfig;