async function main() {
  // Get the deployer and a second account for testing
  const [deployer, buyerAccount] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Test buyer account:", buyerAccount.address);

  // 1. Deploy TokenDiplo (ERC20) with a total supply of 1,000,000
  const initialSupply = hre.ethers.parseEther("1000000");
  const TokenDiplo = await hre.ethers.getContractFactory("TokenDiplo");
  const tokenDiplo = await TokenDiplo.deploy(initialSupply);
  await tokenDiplo.waitForDeployment();
  const tokenDiploAddress = await tokenDiplo.getAddress();
  console.log(`✅ TokenDiplo deployed to: ${tokenDiploAddress}`);

  // --- MODIFIED LOGIC: Distribute funds equally ---
  console.log(`\nDistributing DIP supply equally...`);
  // Define half of the total supply to send to the buyer
  const amountToShare = hre.ethers.parseEther("500000"); // 500,000 DIP
  await tokenDiplo.transfer(buyerAccount.address, amountToShare);
  console.log(`✅ Sent 500,000 DIP to ${buyerAccount.address}`);
  // --- END OF MODIFIED LOGIC ---

  // 2. Deploy MiNFT (ERC721)
  const MiNFT = await hre.ethers.getContractFactory("MiNFT");
  const miNFT = await MiNFT.deploy();
  await miNFT.waitForDeployment();
  const miNFTAddress = await miNFT.getAddress();
  console.log(`✅ MiNFT deployed to: ${miNFTAddress}`);

  // 3. Deploy MercadoNFT (Marketplace)
  const MercadoNFT = await hre.ethers.getContractFactory("MercadoNFT");
  const mercadoNFT = await MercadoNFT.deploy(tokenDiploAddress);
  await mercadoNFT.waitForDeployment();
  const mercadoNFTAddress = await mercadoNFT.getAddress();
  console.log(`✅ MercadoNFT deployed to: ${mercadoNFTAddress}`);

  // --- Log addresses for frontend ---
  console.log("\n----------------------------------------------------");
  console.log(
    "COPY THESE ADDRESSES INTO YOUR FRONTEND's .env OR constants.ts FILE"
  );
  console.log(`export const TOKEN_ADDRESS = "${tokenDiploAddress}";`);
  console.log(`export const NFT_ADDRESS = "${miNFTAddress}";`);
  console.log(`export const MARKETPLACE_ADDRESS = "${mercadoNFTAddress}";`);
  console.log("----------------------------------------------------\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
