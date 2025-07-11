// import { Request, Response, NextFunction } from "express";
// import ErrorHandler from "../utils/ErrorHandler";
// import catchAsyncErrors from "../middleware/catchAsyncErrors";
// import {
//   Connection,
//   Transaction,
//   SystemProgram,
//   PublicKey,
//   Keypair,
// } from "@solana/web3.js";
// import bs58 from "bs58";

// const paymentPlan = catchAsyncErrors(
//   async (req: Request, res: Response, next: NextFunction) => {
//         try {
//         // plan should be basic or pro
//       const { userPublicKey, plan } = req.body;
//       const userPubKey = new PublicKey(userPublicKey);
      
//       // Generate a new keypair (do this ONCE and save the secret key securely)
//       // const OwnerWallet = Keypair.generate();

//       // Replace with your exported Phantom private key string
//       const privateKeyBase58Encoded =
//         "2aCrKHCuR5Ni4cuJAvJDYkj784Fwy776twZMRLKJ5KXc18pi5bnD5VUT1nSefpb8yzbQkFB63FbjPBfVRpL2i8Gi"; // from Phantom export
//       const privateKeyBytes = bs58.decode(privateKeyBase58Encoded); // Uint8Array(64)

//       // Create the Keypair
//       const OwnerWallet = Keypair.fromSecretKey(privateKeyBytes);

//       const connection = new Connection("https://api.devnet.solana.com");
//       const latestBlockhash = await connection.getLatestBlockhash();

//       const reward = 1_000_000_000; // 1 SOL (example)
//       const _pretx = new Transaction().add(
//         SystemProgram.transfer({
//           fromPubkey: OwnerWallet.publicKey, // OwnerWallet is your backend wallet
//           toPubkey: userPubKey,
//           lamports: reward,
//         })
//       );
//       _pretx.setSigners(userPubKey, OwnerWallet.publicKey);
//       _pretx.recentBlockhash = latestBlockhash.blockhash;
//       _pretx.partialSign(OwnerWallet);

//       const _tx = _pretx.serialize({
//         requireAllSignatures: false,
//         verifySignatures: false,
//       });
//       // console.log({ tx: Buffer.from(_tx).toString("base64") });
//       res.status(201).json({
//         success: true,
//         tx: Buffer.from(_tx).toString("base64"),
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

// export { paymentPlan };


// const {
//   Connection,
//   Transaction,
//   SystemProgram,
//   PublicKey,
// } = require("@solana/web3.js");
// const base64 = require("base64-js");

// app.post("/api/create-tx", async (req, res) => {
//   const { userPublicKey } = req.body;
//   const userPubKey = new PublicKey(userPublicKey);
//   const connection = new Connection("https://api.devnet.solana.com");
//   const latestBlockhash = await connection.getLatestBlockhash();

//   const reward = 1_000_000_000; // 1 SOL (example)
//   const _pretx = new Transaction().add(
//     SystemProgram.transfer({
//       fromPubkey: OwnerWallet.publicKey, // OwnerWallet is your backend wallet
//       toPubkey: userPubKey,
//       lamports: reward,
//     })
//   );
//   _pretx.setSigners(userPubKey, OwnerWallet.publicKey);
//   _pretx.recentBlockhash = latestBlockhash.blockhash;
//   _pretx.partialSign(OwnerWallet);

//   const _tx = _pretx.serialize({
//     requireAllSignatures: false,
//     verifySignatures: false,
//   });
//   res.status(200).json({ tx: Buffer.from(_tx).toString("base64") });
// });

// --------------React------------- //
// import { useWallet } from "@solana/wallet-adapter-react";
// import { Connection, Transaction } from "@solana/web3.js";

// const connection = new Connection("https://api.devnet.solana.com");

// async function handleSignAndSend() {
//   const response = await fetch("/api/create-tx", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ userPublicKey: wallet.publicKey.toString() }),
//   });
//   const { tx } = await response.json();
//   const decodedTx = Buffer.from(tx, "base64");
//   const transaction = Transaction.from(decodedTx);

//   // Use Phantom (or wallet adapter) to sign and send
//   const signature = await sendTransaction(transaction, connection);

//   // Send signature to backend for verification
//   await fetch("/api/verify-signature", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ signature }),
//   });
// }

// Backend Signature Verification Example:
// app.post("/api/verify-signature", async (req, res) => {
//   const { signature } = req.body;
//   const connection = new Connection("https://api.devnet.solana.com");
//   const transactionDetails = await connection.getParsedTransaction(signature, {
//     maxSupportedTransactionVersion: 0,
//   });
//   // Validate transaction details as needed
//   res.status(200).json({ status: "verified", transactionDetails });
// });