// const options = {
//   query:
//     '"dexscreener", "The Memecoins king", "memecoins", "introvert memes", "Meny Coin | Father of memecoins", "MEMES Community"',
//   username:
//     '"@pumpdotfun", "@dexscreener", "@Thememecoinking", "@mamecoines", "@introvertsmemes", "@Meny_coin", "@memeland_tg"',
//   pastone:
//     '"#memecoin2025" OR "#memes" OR "#memecoins" OR "CA" OR "GMGN" OR "pump token" OR "pumpdotfun" OR "dexscreener" OR "Elon Musk" OR "nft_cryptogang" from:@elonmusk',
// };
// ("Tesla Owners Silicon Valley");
// ('"WallStreetMav" OR "grok" OR "ZelenskyyUa" OR "america" OR "elonmusk" OR "AltcoinGordon" OR "JDVance" OR "TylerDurden" OR "CryptosR_Us" OR "AltcoinDailyio"');

// import {
//   Connection,
//   Keypair,
//   PublicKey,
//   clusterApiUrl,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js";
// import bs58 from "bs58";
// (async function loadSplToken() {
//   const splToken = await import("@solana/spl-token");
//   const { getOrCreateAssociatedTokenAccount, transfer } = splToken;

//   // Replace these with your own keys and desired transfer amount
//   const PRIVATE_KEY =
//     "2sY9VR5izujLmBe9efDhZ3vLScs47iCyf6T2fcV3cnhsuKAkZ1ArDJKSKcw8Y1jFcsqatkWvSJMFP3VTVEXcQUCH"; // Your private key in Base58 encoding
//   const RECEIVER_PUBLIC_KEY = "BkLpQmxqaZWyrQVHDdXzzCYZLZd1nYruvDwQ5kba9Sdf"; // Receiver's public key
//   const TRANSFER_AMOUNT = 10000000; // 10 amount of USDC to transfer (in smallest unit)
//   // The address of the USDC token on Solana Devnet
//   const USDC_DEV_PUBLIC_KEY = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
//   // Convert the private key from Base58 to a byte array and create a Keypair
//   const senderPrivateKeyBytes: Uint8Array = bs58.decode(PRIVATE_KEY);
//   // Generate a Keypair from the decoded secret key
//   const senderKeypair: any = Keypair.fromSecretKey(senderPrivateKeyBytes);
//   // Create a connection to the Solana Devnet
//   const connection: Connection = new Connection(
//     clusterApiUrl("devnet"),
//     "confirmed"
//   );

//   try {
//     // Fetch the sender's USDC token account
//     const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
//       connection,
//       senderKeypair,
//       new PublicKey(USDC_DEV_PUBLIC_KEY),
//       senderKeypair.publicKey
//     );

//     // Fetch or create the receiver's associated token account for USDC
//     const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
//       connection,
//       senderKeypair,
//       new PublicKey(USDC_DEV_PUBLIC_KEY),
//       new PublicKey(RECEIVER_PUBLIC_KEY),
//       true
//     );
//     console.log(receiverTokenAccount);
//     console.log({ sender: senderTokenAccount });
//       console.log({ senderKey: senderKeypair });
//     // Perform the transfer
//     const signature = await transfer(
//       connection,
//       senderKeypair, // ✅ CORRECT
//       senderTokenAccount.address,
//       receiverTokenAccount.address,
//       senderKeypair.publicKey,
//       TRANSFER_AMOUNT
//     );

//     // const signature = await transfer(
//     //   connection,
//     //   senderKeypair._keypair,
//     //   senderTokenAccount.address,
//     //   receiverTokenAccount.address,
//     //   senderKeypair._keypair.publicKey,
//     //   TRANSFER_AMOUNT
//     // );

//     // Log the transaction signature
//     console.log(`Transaction signature: ${signature}`);
//     console.log(
//       `Verify it at: https://explorer.solana.com/tx/${signature}?cluster=devnet`
//     );
//   } catch (error) {
//     console.error("Error performing the transfer:", error);
//   }
// })();

// import {
//   LAMPORTS_PER_SOL,
//   SystemProgram,
//   Transaction,
//   sendAndConfirmTransaction,
//   Keypair,
//   Connection,
//   clusterApiUrl,
// } from "@solana/web3.js";

// (async function loadSplToken() {
//   // Create a connection to cluster
//   // const connection = new Connection("http://localhost:8899", "confirmed");
//   const connection: Connection = new Connection(
//     clusterApiUrl("devnet"),
//     "confirmed"
//   );

//   // Generate sender and recipient keypairs
//   const sender = Keypair.generate();
//   const recipient = new Keypair();

//   // Fund sender with airdrop
//   const airdropSignature = await connection.requestAirdrop(
//     sender.publicKey,
//     LAMPORTS_PER_SOL
//   );
//   await connection.confirmTransaction(airdropSignature, "confirmed");

//   // Check balance before transfer
//   const preBalance1 = await connection.getBalance(sender.publicKey);
//   const preBalance2 = await connection.getBalance(recipient.publicKey);

//   // Define the amount to transfer
//   const transferAmount = 0.01; // 0.01 SOL

//   // Create a transfer instruction for transferring SOL from sender to recipient
//   const transferInstruction = SystemProgram.transfer({
//     fromPubkey: sender.publicKey,
//     toPubkey: recipient.publicKey,
//     lamports: transferAmount * LAMPORTS_PER_SOL, // Convert transferAmount to lamports
//   });

//   // Add the transfer instruction to a new transaction
//   const transaction = new Transaction().add(transferInstruction);

//   // Send the transaction to the network
//   const transactionSignature = await sendAndConfirmTransaction(
//     connection,
//     transaction,
//     [sender] // signer
//   );

//   // Check balance after transfer
//   const postBalance1 = await connection.getBalance(sender.publicKey);
//   const postBalance2 = await connection.getBalance(recipient.publicKey);

//   console.log("Sender prebalance:", preBalance1 / LAMPORTS_PER_SOL);
//   console.log("Recipient prebalance:", preBalance2 / LAMPORTS_PER_SOL);
//   console.log("Sender postbalance:", postBalance1 / LAMPORTS_PER_SOL);
//   console.log("Recipient postbalance:", postBalance2 / LAMPORTS_PER_SOL);
//   console.log("Transaction Signature:", transactionSignature);
// })();

import {
  Connection,
  Transaction,
  SystemProgram,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import bs58 from "bs58";

(async function loadSplToken() {
  const userPubKey = new PublicKey(
    "BkLpQmxqaZWyrQVHDdXzzCYZLZd1nYruvDwQ5kba9Sdf"
  );
  // Generate a new keypair (do this ONCE and save the secret key securely)
  // const OwnerWallet = Keypair.generate();

  // Replace with your exported Phantom private key string
  const privateKeyBase58Encoded =
    "2aCrKHCuR5Ni4cuJAvJDYkj784Fwy776twZMRLKJ5KXc18pi5bnD5VUT1nSefpb8yzbQkFB63FbjPBfVRpL2i8Gi"; // from Phantom export
  const privateKeyBytes = bs58.decode(privateKeyBase58Encoded); // Uint8Array(64)

  // Create the Keypair
  const OwnerWallet = Keypair.fromSecretKey(privateKeyBytes);

  const connection = new Connection("https://api.devnet.solana.com");
  const latestBlockhash = await connection.getLatestBlockhash();

  const reward = 1_000_000_000; // 1 SOL (example)
  const _pretx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: OwnerWallet.publicKey, // OwnerWallet is your backend wallet
      toPubkey: userPubKey,
      lamports: reward,
    })
  );
  _pretx.setSigners(userPubKey, OwnerWallet.publicKey);
  _pretx.recentBlockhash = latestBlockhash.blockhash;
  _pretx.partialSign(OwnerWallet);

  const _tx = _pretx.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });
  console.log({ tx: Buffer.from(_tx).toString("base64") });
})();