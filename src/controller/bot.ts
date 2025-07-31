import { Request, Response, NextFunction } from "express";
import BotConfig from "../model/bot";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import bs58 from "bs58";
import {
  Connection,
  Keypair,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import axios from "axios";

interface SwapResult {
  success: boolean;
  message: string;
  txid?: string;
  error?: any;
}

// Create a connection for the RPC to interact with the blockchain
const connection = new Connection(
  "https://solana-mainnet.g.alchemy.com/v2/ZUqRVosoLDBhtuOebrhqZSIqy-2G0kUp"
);

// BOT WALLET SETTER
// setBotWalletConfig — Set Bot Wallet for Authenticated User
const setBotWalletConfig = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        publicKey,
        privateKey,
        autoBuy,
        buyAmount,
        stopLoss,
        takeProfit,
      } = req.body;
      if (!publicKey || !privateKey) {
        return next(
          new ErrorHandler("Public and Private keys are required", 400)
        );
      }
      const userId = (req as any).user.id;
      console.log(userId);

      // Check if config already exists for this user
      const existingConfig = await BotConfig.findOne({ userId: userId });
      if (existingConfig) {
        return next(
          new ErrorHandler(
            "Bot wallet already set. Use update endpoint instead.",
            409
          )
        );
      }

      const config = await BotConfig.create({
        userId: userId,
        publicKey,
        privateKey,
        autoBuy,
        buyAmount,
        stopLoss,
        takeProfit,
      });

      res.status(201).json({
        success: true,
        message: "Bot wallet configured successfully",
        config,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// BOT GENERAL SETTINGS
// updateBotWalletConfig — Update Bot Wallet for Authenticated User
const updateBotWalletConfig = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        publicKey,
        privateKey,
        autoBuy,
        buyAmount,
        stopLoss,
        takeProfit,
      } = req.body;
      const userId = (req as any).user.id;
      const config = await BotConfig.findOne({ userId: userId });

      if (!config) {
        return next(
          new ErrorHandler(
            "No existing bot wallet config found. Please set it first.",
            404
          )
        );
      }

      // Only update provided fields
      if (publicKey) config.publicKey = publicKey;
      if (privateKey) config.privateKey = privateKey;
      if (typeof autoBuy === "boolean") config.autoBuy = autoBuy;
      if (buyAmount !== undefined) config.buyAmount = buyAmount;
      if (stopLoss !== undefined) config.stopLoss = stopLoss;
      if (takeProfit !== undefined) config.takeProfit = takeProfit;
      await config.save();

      res.status(200).json({
        success: true,
        message: "Bot wallet config updated successfully",
        config,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

async function botSwap(
  tokenAddress: string,
  fromAmount: number,
  payer: string,
  slippage: number,
  privateKey: string
): Promise<SwapResult> {
  try {
    const response = await axios.get("https://swap-v2.solanatracker.io/swap", {
      params: {
        from: "So11111111111111111111111111111111111111112",
        to: tokenAddress,
        fromAmount: fromAmount,
        slippage: slippage,
        payer: payer, // replace with actual payer address
      },
    });

    console.log("Swap response:", response.data);

    // Loading the Transaction
    const res: any = response;
    const serializedTransactionBuffer = Buffer.from(res.txn, "base64");
    let txn;

    if (res.type === "v0") {
      txn = VersionedTransaction.deserialize(serializedTransactionBuffer);
    } else {
      txn = Transaction.from(serializedTransactionBuffer);
    }

    // if (!txn) return false;
    if (!txn) return { success: false, message: "Invalid transaction" };

    //   Sending the Transaction
    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

    let txid;

    if (res.type === "v0") {
      const txn = VersionedTransaction.deserialize(serializedTransactionBuffer);
      txn.sign([keypair]);

      txid = await connection.sendRawTransaction(txn.serialize(), {
        skipPreflight: true,
      });
    } else {
      const txn = Transaction.from(serializedTransactionBuffer);
      txn.sign(keypair);
      const rawTransaction = txn.serialize();
      txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });
    }

    return {
      success: true,
      txid,
      message: "Swap transaction sent successfully",
    };
  } catch (error: any) {
    const errMessage = error.response?.data?.error || error.message;
    console.error(
      "Error fetching swap:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message: "Swap failed",
      error: errMessage,
    };
  }
}

export { setBotWalletConfig, updateBotWalletConfig, botSwap };


// async function callBotSwap() {
//   const tokenAddress = "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"; // USDC on Solana
//   const fromAmount = 1000000; // 1 SOL in lamports (assuming it's base unit)
//   const payer = "BkLpQmxqaZWyrQVHDdXzzCYZLZd1nYruvDwQ5kba9Sdf"; // your wallet address

//   const slippage = 10; // 10%

//   // ⚠️ PRIVATE KEY must be base58-encoded secret key (never expose in production)
//   const privateKey =
//     "2sY9VR5izujLmBe9efDhZ3vLScs47iCyf6T2fcV3cnhsuKAkZ1ArDJKSKcw8Y1jFcsqatkWvSJMFP3VTVEXcQUCH";

//   const result = await botSwap(
//     tokenAddress,
//     fromAmount,
//     payer,
//     slippage,
//     privateKey
//   );

//   console.log("Swap Result:", result);
// }
// callBotSwap();