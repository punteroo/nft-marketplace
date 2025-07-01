import TokenDiploABI from "../abis/TokenDiplo.json";
import MiNFTABI from "../abis/MiNFT.json";
import MercadoNFTABI from "../abis/MercadoNFT.json";

// Replace with your deployed contract addresses
export const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const MARKETPLACE_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

export const TOKEN_ABI = TokenDiploABI.abi;
export const NFT_ABI = MiNFTABI.abi;
export const MARKETPLACE_ABI = MercadoNFTABI.abi;

// Web3Modal Project ID
export const WALLETCONNECT_PROJECT_ID = "5dbc753d2daf120173bd97643b0b80ae"; // Use your own

// Hardhat network details
export const HARDHAT_NETWORK = {
  chainId: 31337,
  name: "Hardhat",
  currency: "ETH",
  rpcUrl: "http://127.0.0.1:8545",
};
