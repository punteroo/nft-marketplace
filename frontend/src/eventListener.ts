import { ethers } from "ethers";
import MercadoNFTABI from "./abis/MercadoNFT.json";

export const setupEventListener = (
  provider: ethers.BrowserProvider,
  marketplaceAddress: string,
  callback: (listing: any) => void
) => {
  const marketplace = new ethers.Contract(
    marketplaceAddress,
    MercadoNFTABI.abi,
    provider
  );
  marketplace.on("NFTEnVenta", (vendedor, contratoNFT, idNFT, precio) => {
    console.log(
      `NFT en venta: Vendedor=${vendedor}, ID=${idNFT.toString()}, Precio=${ethers.formatEther(
        precio
      )}`
    );
    callback({ vendedor, contratoNFT, idNFT, precio, estaActiva: true });
  });
};
