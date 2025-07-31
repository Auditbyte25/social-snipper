import { Document } from "mongoose";

// Defining the interface for the profile picture
interface profilePicture {
  public_id: string;
  url: string;
}

export type MEME = {
  tokenAddress?: string;
  tokenName?: string;
  liquidityLocked?: number;
  marketCap?: number;
  tokenHolder?: number;
  buynsellRatio?: number;
  rugCheck?: string;
  mentions?: string;
  currentPrice?: number;
  volume24h?: number;
  engagementScore?: number;
  hashtagReach?: number;
  tweetId?: string; // Array of usernames
};

export interface userModel extends Document {
  publicKey: string;
  username: string;
  profilePicture?: profilePicture;
  role: string;
  createdAt: Date;
  getJwtToken: () => string;
}
