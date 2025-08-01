import mongoose, { Document, Schema, Types } from "mongoose";

// Define the interface for a TwitterTokenSnipped document
export interface TwitterTokenSnippedInterface extends Document {
  userId: Types.ObjectId;
  tokenName: string;
  tweetSource: string;
  time: number;
  engagementScore: number;
  mentions: number;
  tokenDrop: string;
  createdAt: Date;
}

const twitterTokenSnippedSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"],
  },
  tokenName: {
    type: String,
    required: [true, "Token name is required"],
  },
  tweetSource: {
    type: String,
    required: [true, "Tweet source is required"],
  },
  time: {
    type: Date,
  },
  engagementScore: {
    type: Number,
  },
  mentions: {
    type: Number,
  },
  tokenDrop: {
    type: String,
    default: "Not yet",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TwitterTokenSnipped = mongoose.model<TwitterTokenSnippedInterface>(
  "TwitterTokenSnipped",
  twitterTokenSnippedSchema
);

export default TwitterTokenSnipped;
