// create-wallet.ts

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import {
  registerEntitySecretCiphertext,
  initiateDeveloperControlledWalletsClient,
} from "@circle-fin/developer-controlled-wallets";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "output");

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    throw new Error("CIRCLE_API_KEY is required.");
  }

  // Register Entity Secret
  console.log("Registering Entity Secret...");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const entitySecret = crypto.randomBytes(32).toString("hex");
  await registerEntitySecretCiphertext({
    apiKey,
    entitySecret,
    recoveryFileDownloadPath: OUTPUT_DIR,
  });

  console.log("\n✅ Entity Secret:", entitySecret);
  console.log("⚠️  SAVE THIS! You need it for .env.local\n");

  // Create Wallet Set
  console.log("Creating Wallet Set...");
  const client = initiateDeveloperControlledWalletsClient({
    apiKey,
    entitySecret,
  });
  const walletSet = (
    await client.createWalletSet({ name: "AgentHire Wallets" })
  ).data?.walletSet;

  if (!walletSet?.id) {
    throw new Error("Wallet Set creation failed");
  }
  console.log("✅ Wallet Set ID:", walletSet.id);

  // Create Wallet on ARC-TESTNET
  console.log("\nCreating Wallet on ARC-TESTNET...");
  const wallet = (
    await client.createWallets({
      walletSetId: walletSet.id,
      blockchains: ["ARC-TESTNET"],
      count: 1,
      accountType: "EOA",
    })
  ).data?.wallets?.[0];

  if (!wallet) {
    throw new Error("Wallet creation failed");
  }

  console.log("✅ Wallet ID:", wallet.id);
  console.log("✅ Wallet Address:", wallet.address);
  console.log("✅ Blockchain:", wallet.blockchain);

  // Save wallet info
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "wallet-info.json"),
    JSON.stringify(wallet, null, 2)
  );

  // Print what to put in .env.local
  console.log("\n" + "=".repeat(60));
  console.log("📋 COPY THESE INTO YOUR .env.local FILE:");
  console.log("=".repeat(60));
  console.log(`CIRCLE_API_KEY=${apiKey}`);
  console.log(`CIRCLE_ENTITY_SECRET=${entitySecret}`);
  console.log(`CIRCLE_WALLET_SET_ID=${walletSet.id}`);
  console.log(`CIRCLE_WALLET_ADDRESS=${wallet.address}`);
  console.log("=".repeat(60));

  // Faucet instructions
  console.log("\n🚰 NOW GET FREE TESTNET USDC:");
  console.log("  1. Go to https://faucet.circle.com");
  console.log('  2. Select "Arc Testnet"');
  console.log(`  3. Paste: ${wallet.address}`);
  console.log('  4. Click "Send USDC"');

  // Wait for faucet
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  await new Promise((resolve) =>
    rl.question(
      "\nPress Enter after you've sent USDC from faucet... ",
      () => {
        rl.close();
        resolve(undefined);
      }
    )
  );

  // Check balance
  console.log("\nChecking wallet balance...");
  const balances = (
    await client.getWalletTokenBalance({ id: wallet.id })
  ).data?.tokenBalances;

  for (const b of balances ?? []) {
    console.log(`  ${b.token?.symbol ?? "Unknown"}: ${b.amount}`);
  }

  console.log("\n🎉 ALL DONE! Your wallet is funded and ready.");
  console.log("Now update your .env.local with the values above.");
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
  process.exit(1);
});