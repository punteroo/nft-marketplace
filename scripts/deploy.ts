async function main() {
  // Obtener la cuenta que va a desplegar los contratos
  const [deployer] = await hre.ethers.getSigners();
  console.log("Desplegando contratos con la cuenta:", deployer.address);

  // 1. Desplegar TokenDiplo (ERC20)
  // Le damos un suministro inicial de 1,000,000 tokens al desplegador.
  // Ethers.js maneja los decimales, así que '1000000' se convierte en 1,000,000 con 18 decimales.
  const initialSupply = hre.ethers.parseEther("1000000");
  const TokenDiplo = await hre.ethers.getContractFactory("TokenDiplo");
  const tokenDiplo = await TokenDiplo.deploy(initialSupply);
  await tokenDiplo.waitForDeployment();
  const tokenDiploAddress = await tokenDiplo.getAddress();
  console.log(`✅ TokenDiplo desplegado en: ${tokenDiploAddress}`);

  // 2. Desplegar MiNFT (ERC721)
  const MiNFT = await hre.ethers.getContractFactory("MiNFT");
  const miNFT = await MiNFT.deploy();
  await miNFT.waitForDeployment();
  const miNFTAddress = await miNFT.getAddress();
  console.log(`✅ MiNFT desplegado en: ${miNFTAddress}`);

  // 3. Desplegar MercadoNFT (Marketplace)
  // El constructor del marketplace necesita la dirección del token de pago (TokenDiplo).
  const MercadoNFT = await hre.ethers.getContractFactory("MercadoNFT");
  const mercadoNFT = await MercadoNFT.deploy(tokenDiploAddress);
  await mercadoNFT.waitForDeployment();
  const mercadoNFTAddress = await mercadoNFT.getAddress();
  console.log(`✅ MercadoNFT desplegado en: ${mercadoNFTAddress}`);

  console.log(`const TOKEN_ADDRESS = "${tokenDiploAddress}";`);
  console.log(`const NFT_ADDRESS = "${miNFTAddress}";`);
  console.log(`const MARKETPLACE_ADDRESS = "${mercadoNFTAddress}";`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
