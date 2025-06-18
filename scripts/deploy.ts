import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Desplegando contratos con:", deployer.address);

  // Desplegar TokenDiplo
  const TokenDiplo = await ethers.getContractFactory("TokenDiplo");
  const token = await TokenDiplo.deploy(1000000n * 10n ** 18n); // 1M tokens
  console.log("TokenDiplo desplegado en:", await token.getAddress());

  // Desplegar MiNFT
  const MiNFT = await ethers.getContractFactory("MiNFT");
  const nft = await MiNFT.deploy();
  console.log("MiNFT desplegado en:", await nft.getAddress());

  // Desplegar MercadoNFT
  const MercadoNFT = await ethers.getContractFactory("MercadoNFT");
  const marketplace = await MercadoNFT.deploy(token.getAddress());
  console.log("MercadoNFT desplegado en:", await marketplace.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
