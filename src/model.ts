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
//   const SenderWallet: any = Keypair.fromSecretKey(senderPrivateKeyBytes);
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

// import {
//   Connection,
//   Transaction,
//   SystemProgram,
//   PublicKey,
//   Keypair,
//   LAMPORTS_PER_SOL,
//   sendAndConfirmTransaction,
// } from "@solana/web3.js";
// import bs58 from "bs58";

// (async function loadSplToken() {
//   const userPubKey = new PublicKey(
//     "BkLpQmxqaZWyrQVHDdXzzCYZLZd1nYruvDwQ5kba9Sdf"
//   );
//   // Generate a new keypair (do this ONCE and save the secret key securely)
//   // const SenderWallet = Keypair.generate();

//   // Replace with your exported Phantom private key string
//   const privateKeyBase58Encoded =
//     "2aCrKHCuR5Ni4cuJAvJDYkj784Fwy776twZMRLKJ5KXc18pi5bnD5VUT1nSefpb8yzbQkFB63FbjPBfVRpL2i8Gi"; // from Phantom export
//   const privateKeyBytes = bs58.decode(privateKeyBase58Encoded); // Uint8Array(64)

//   // Create the Keypair
//   const SenderWallet = Keypair.fromSecretKey(privateKeyBytes);

//   const connection = new Connection("https://api.devnet.solana.com");
//   const latestBlockhash = await connection.getLatestBlockhash();

//   // Check balance before transfer
//   const preBalance1 = await connection.getBalance(SenderWallet.publicKey);
//   const preBalance2 = await connection.getBalance(userPubKey);

//   // Define the amount to transfer
//   const transferAmount = 0.01; // 0.01 SOL

//   // const reward = 1_000_000_000; // 1 SOL (example)
//   const reward = transferAmount * LAMPORTS_PER_SOL; // Convert transferAmount to lamports
//   const _pretx = new Transaction().add(
//     SystemProgram.transfer({
//       fromPubkey: SenderWallet.publicKey, // SenderWallet is your backend wallet
//       toPubkey: userPubKey,
//       lamports: reward,
//     })
//   );

//   // Add the transfer instruction to a new transaction
//   const transaction = new Transaction().add(_pretx);

//   // Send the transaction to the network
//   const transactionSignature = await sendAndConfirmTransaction(
//     connection,
//     transaction,
//     [SenderWallet] // signer
//   );

//   // Check balance after transfer
//   const postBalance1 = await connection.getBalance(SenderWallet.publicKey);
//   const postBalance2 = await connection.getBalance(userPubKey);
//   console.log("Sender prebalance:", preBalance1 / LAMPORTS_PER_SOL);
//   console.log("Recipient prebalance:", preBalance2 / LAMPORTS_PER_SOL);
//   console.log("Sender postbalance:", postBalance1 / LAMPORTS_PER_SOL);
//   console.log("Recipient postbalance:", postBalance2 / LAMPORTS_PER_SOL);
//   console.log("Transaction Signature:", transactionSignature);
// })();

// import {
//   Connection,
//   PublicKey,
//   Keypair,
//   sendAndConfirmTransaction,
//   Transaction,
// } from "@solana/web3.js";

// import bs58 from "bs58";

// (async function sendUsdc() {
//   const splToken = await import("@solana/spl-token");
//   const {
//     getOrCreateAssociatedTokenAccount,
//     createTransferInstruction,
//     TOKEN_PROGRAM_ID,
//   } = splToken;

//   const userPubKey = new PublicKey(
//     "BkLpQmxqaZWyrQVHDdXzzCYZLZd1nYruvDwQ5kba9Sdf"
//   );

//   const USDC_DEV_MINT = new PublicKey(
//     "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
//   );

//   // Phantom private key
//   const privateKeyBase58Encoded =
//     "2aCrKHCuR5Ni4cuJAvJDYkj784Fwy776twZMRLKJ5KXc18pi5bnD5VUT1nSefpb8yzbQkFB63FbjPBfVRpL2i8Gi";
//   const privateKeyBytes = bs58.decode(privateKeyBase58Encoded);
//   const SenderWallet = Keypair.fromSecretKey(privateKeyBytes);

//   const connection = new Connection(
//     "https://api.devnet.solana.com",
//     "confirmed"
//   );

//   try {
//     // 1. Get sender's associated token account for USDC
//     const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
//       connection,
//       SenderWallet,
//       USDC_DEV_MINT,
//       SenderWallet.publicKey
//     );

//     // 2. Get recipient's associated token account for USDC
//     const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
//       connection,
//       SenderWallet, // payer
//       USDC_DEV_MINT,
//       userPubKey,
//       true // allowOwnerOffCurve
//     );

//     console.log("Sender Token Account:", senderTokenAccount.address.toBase58());
//     console.log(
//       "Recipient Token Account:",
//       receiverTokenAccount.address.toBase58()
//     );

//     // 3. Create transfer instruction (1 USDC = 1_000_000 since USDC has 6 decimals)
//     const amount = 1_000_000;

//     const transferInstruction = createTransferInstruction(
//       senderTokenAccount.address,
//       receiverTokenAccount.address,
//       SenderWallet.publicKey,
//       amount,
//       [],
//       TOKEN_PROGRAM_ID
//     );

//     // 4. Build transaction
//     const transaction = new Transaction().add(transferInstruction);

//     // 5. Send transaction
//     const signature = await sendAndConfirmTransaction(connection, transaction, [
//       SenderWallet,
//     ]);

//     console.log(`✅ Transaction Signature: ${signature}`);
//     console.log(
//       `🔗 Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`
//     );
//   } catch (error) {
//     console.error("❌ Error performing the transfer:", error);
//   }
// })();

import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";

import bs58 from "bs58";

(async function main() {
  const splToken = await import("@solana/spl-token");
  const {
    getOrCreateAssociatedTokenAccount,
    createTransferInstruction,
    mintTo,
    createMint,
    TOKEN_PROGRAM_ID,
  } = splToken;
  const privateKeyBase58Encoded =
    "2aCrKHCuR5Ni4cuJAvJDYkj784Fwy776twZMRLKJ5KXc18pi5bnD5VUT1nSefpb8yzbQkFB63FbjPBfVRpL2i8Gi";
  const privateKeyBytes = bs58.decode(privateKeyBase58Encoded);
  const sender = Keypair.fromSecretKey(privateKeyBytes);

  // const keypair = Keypair.generate();
  // console.log("address:", keypair.publicKey.toBase58());
  // // Export the secret key in Phantom-compatible Base58 format
  // const phantomSecretKey = bs58.encode(keypair.secretKey);
  // console.log("phantomSecretKey:", phantomSecretKey);

  // console.log("secretKey:", Buffer.from(keypair.secretKey).toString("base64"));
  // console.log(
  //   "secretKey (hex):",
  //   Buffer.from(keypair.secretKey).toString("hex")
  // );

  const recipient = new PublicKey(
    "BkLpQmxqaZWyrQVHDdXzzCYZLZd1nYruvDwQ5kba9Sdf"
  );

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

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
  const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    usdcMint,
    sender.publicKey
  );

  // 4. Mint 10 USDC to sender
  console.log("💸 Minting 10 USDC to sender...");
  await mintTo(
    connection,
    sender,
    usdcMint,
    senderTokenAccount.address,
    sender,
    10_000_000 // 10 USDC = 10_000_000 since 6 decimals
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
    1_000_000, // 1 USDC
    [],
    TOKEN_PROGRAM_ID
  );

  const tx = new Transaction().add(transferIx);
  const signature = await sendAndConfirmTransaction(connection, tx, [sender]);

  console.log(`✅ Transfer Signature: ${signature}`);
  console.log(
    `🔗 Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`
  );
  console.log({tx: tx})
})();