import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

export async function createWallet(): Promise<{
  phantomPublicKey: string;
  phantomSecretKey: string;
}> {
  const keypair = Keypair.generate();

  const phantomPublicKey = keypair.publicKey.toBase58();
  const phantomSecretKey = bs58.encode(keypair.secretKey);

  console.log("address:", phantomPublicKey);
  console.log("phantomSecretKey:", phantomSecretKey);

  return {
    phantomPublicKey,
    phantomSecretKey,
  };
}

// (async () => {
//   const wallet = await createWallet();
//   console.log("Wallet:", wallet);
// })();