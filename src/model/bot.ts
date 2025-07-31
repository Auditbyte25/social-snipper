import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";


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

// Hash publicKey and privateKey before saving
botConfigSchema.pre<BotConfigInterface>("save", async function (next) {
  if (this.isModified("publicKey")) {
    const salt = await bcrypt.genSalt(10);
    this.publicKey = await bcrypt.hash(this.publicKey, salt);
  }

  if (this.isModified("privateKey")) {
    const salt = await bcrypt.genSalt(10);
    this.privateKey = await bcrypt.hash(this.privateKey, salt);
  }

  next();
});

const BotConfig = mongoose.model<BotConfigInterface>(
  "BotConfig",
  botConfigSchema
);
export default BotConfig;