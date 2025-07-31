import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import {
  Connection,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  Keypair,
  clusterApiUrl,
} from "@solana/web3.js";
import bs58 from "bs58";
import UserSubscription from "../model/userSubscription";
import User from "../model/user";

// User subscribing to payment plan
const PLAN: any = {
  basic: { amount: 25 },
  pro: { amount: 50 },
};
const paymentPlan = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const splToken = await import("@solana/spl-token");
    const {
      getOrCreateAssociatedTokenAccount,
      createTransferInstruction,
      mintTo,
      createMint,
      TOKEN_PROGRAM_ID,
    } = splToken;
    try {
      // plan should be basic or pro
      const { privateKeyBase58Encoded, plan } = req.body;
      // ReferralCode
      const referralCode = req.body.referralCode;

      const amountSubscribed: any = PLAN[plan].amount * 1000000;
      // Setting up the private key
      const privateKeyBytes = bs58.decode(privateKeyBase58Encoded);
      const sender = Keypair.fromSecretKey(privateKeyBytes);

      // Replace below with the address of the recipient
      const recipient = new PublicKey(
        "BkLpQmxqaZWyrQVHDdXzzCYZLZd1nYruvDwQ5kba9Sdf"
      );

      // Change this to mainnet address during deployment
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

      // NOTE::STEP 1, 2 & 4 ARE NOT IMPORTANT FOR DEPLOYMENT JUST FOR TESTING PHASE
      // 1. Airdrop SOL for transaction fees
      const balance = await connection.getBalance(sender.publicKey);
      if (balance < 0.5 * 1e9) {
        console.log("💧 Airdropping 1 SOL...");
        const sig = await connection.requestAirdrop(sender.publicKey, 1e9);
        await connection.confirmTransaction(sig);
      }
      // 2. Create USDC-like mint
      console.log("🏗️ Creating USDC token mint...");
      const usdcMint = await createMint(
        connection,
        sender,
        sender.publicKey,
        null,
        6 // USDC has 6 decimal places
      );
      console.log("✅ Mint address:", usdcMint.toBase58());

      // 3. Create sender's associated token account
      // Fetch the sender's USDC token account
      const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        sender,
        usdcMint,
        sender.publicKey
      );
      // 4. Mint 10 USDC to sender
      console.log("💸 Minting 500 USDC to sender...");
      await mintTo(
        connection,
        sender,
        usdcMint,
        senderTokenAccount.address,
        sender,
        5000_000_000 // 10 USDC = 10_000_000 since 6 decimals
      );

      // 5. Create recipient token account
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        sender,
        usdcMint,
        recipient
      );
      // 6. Transfer 1 USDC
      const transferIx = createTransferInstruction(
        senderTokenAccount.address,
        recipientTokenAccount.address,
        sender.publicKey,
        amountSubscribed, // AMOUNT IN USDC
        [],
        TOKEN_PROGRAM_ID
      );

      const tx = new Transaction().add(transferIx);
      const signature = await sendAndConfirmTransaction(connection, tx, [
        sender,
      ]);

      // Check whether user has subscribed before
      const user: any = await User.findById((req as any).user.id);
      let isUserSubscribed: any = await UserSubscription.findOne({
        userId: (req as any).user.id,
      });
      if (!isUserSubscribed) {
        isUserSubscribed = await UserSubscription.create({
          userId: (req as any).user.id,
          solanaAddress: user.publicKey,
          currentPlan: plan,
          subscribedAt: new Date(),
          subscriptionTx: signature,
        });
      }

      // Perform upgrade
      isUserSubscribed.currentPlan = plan;
      isUserSubscribed.solanaAddress = user.publicKey;
      isUserSubscribed.subscribedAt = new Date();
      isUserSubscribed.subscriptionTx = signature;
      await isUserSubscribed.save();

      // STEP 1: Handle Referral Logic
      if (referralCode && !user.referredBy) {
        const referrer: any = await User.findOne({ referralCode });
        if (referrer && user.referredBy === null) {
          // Only allow referral setting if user hasn't already been referred
          // STEP 2: Update subscriber’s user record
          user.referredBy = referrer._id;
          user.referralReward = 0; // subscriber gets no reward
          await user.save();

          // STEP 3: Update referrer reward
          const rewardAmount = plan == "basic" ? 5 : plan == "pro" ? 15 : 0;
          referrer.referralReward += rewardAmount;
          await referrer.save();
        }
      }

      res.status(201).json({
        success: true,
        isUserSubscribed,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export { paymentPlan };
