// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
async function main() {
  // Get the account that will deploy the contracts
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy TokenDiplo (ERC20)
  // We give an initial supply of 1,000,000 tokens to the deployer.
  // ethers.parseEther handles the 18 decimal places automatically.
  const initialSupply = hre.ethers.parseEther("1000000");
  const TokenDiplo = await hre.ethers.getContractFactory("TokenDiplo");
  const tokenDiplo = await TokenDiplo.deploy(initialSupply);
  await tokenDiplo.waitForDeployment();
  const tokenDiploAddress = await tokenDiplo.getAddress();
  console.log(`✅ TokenDiplo deployed to: ${tokenDiploAddress}`);

  // 2. Deploy MiNFT (ERC721)
  // This uses the modified contract where anyone can mint.
  const MiNFT = await hre.ethers.getContractFactory("MiNFT");
  const miNFT = await MiNFT.deploy();
  await miNFT.waitForDeployment();
  const miNFTAddress = await miNFT.getAddress();
  console.log(`✅ MiNFT deployed to: ${miNFTAddress}`);

  // 3. Deploy MercadoNFT (Marketplace)
  // The marketplace constructor requires the address of the payment token (TokenDiplo).
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
