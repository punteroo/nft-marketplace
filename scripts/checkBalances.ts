import hre from "hardhat";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

// --- IMPORTANT ---
// This script reads your FRONTEND's configuration to ensure it's debugging the exact same thing.
const constantsPath = path.join(
  __dirname,
  "../frontend/src/constants/index.ts"
);
const abiPath = path.join(__dirname, "../frontend/src/abis/TokenDiplo.json");

async function main() {
  console.log("--- Running Balance Check Script ---");

  // 1. Read the frontend's constants file to get the deployed TOKEN_ADDRESS
  let tokenAddress: string;
  try {
    const constantsFile = fs.readFileSync(constantsPath, "utf8");
    const match = constantsFile.match(
      /export const TOKEN_ADDRESS = "(0x[a-fA-F0-9]{40})";/
    );
    if (!match) {
      throw new Error(
        "Could not find TOKEN_ADDRESS in frontend/src/constants/index.ts"
      );
    }
    tokenAddress = match[1];
    console.log(`Found TOKEN_ADDRESS in frontend config: ${tokenAddress}`);
  } catch (e: any) {
    console.error(
      `\n❌ Error: Could not read frontend config file at ${constantsPath}.`
    );
    console.error("Please ensure the path is correct and the file exists.\n");
    process.exit(1);
  }

  // 2. Read the frontend's ABI file
  let tokenAbi: any;
  try {
    const abiFile = fs.readFileSync(abiPath, "utf8");
    tokenAbi = JSON.parse(abiFile).abi;
  } catch (e: any) {
    console.error(
      `\n❌ Error: Could not read or parse ABI file at ${abiPath}.\n`
    );
    process.exit(1);
  }

  // 3. Define the accounts to check
  const account0 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const account1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  console.log(`Checking balance for Account #0: ${account0}`);
  console.log(`Checking balance for Account #1: ${account1}`);

  // 4. Connect to the local Hardhat node
  //    THIS IS THE CORRECTED LINE: Removed the 'new' keyword.
  const provider = hre.ethers.provider;

  // 5. Create a contract instance and check balances
  const tokenContract = new hre.ethers.Contract(
    tokenAddress,
    tokenAbi,
    provider
  );

  try {
    const balance0 = await tokenContract.balanceOf(account0);
    const balance1 = await tokenContract.balanceOf(account1);

    console.log("\n--- RESULTS ---");
    console.log(
      `✅ Account #0 Balance: ${hre.ethers.formatEther(balance0)} DIP`
    );
    console.log(
      `✅ Account #1 Balance: ${hre.ethers.formatEther(balance1)} DIP`
    );
    console.log("-----------------\n");
  } catch (error: any) {
    console.error("\n❌ An error occurred while fetching balances.");
    console.error(
      "This strongly suggests the TOKEN_ADDRESS in your frontend config is incorrect,"
    );
    console.error(
      "and does not point to a valid TokenDiplo contract on the running network."
    );
    console.error(error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
