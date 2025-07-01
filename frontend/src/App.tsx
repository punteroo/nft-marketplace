import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  createWeb3Modal,
  defaultConfig,
  useWeb3Modal,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";

// ABIs
import TokenDiploABI from "./abis/TokenDiplo.json";
import MiNFTABI from "./abis/MiNFT.json";
import MercadoNFTABI from "./abis/MercadoNFT.json";

// 1. Web3Modal Configuration (moved outside the component)
const projectId = "5dbc753d2daf120173bd97643b0b80ae"; // Reemplaza con tu Project ID de WalletConnect

const hardhat = {
  chainId: 31337,
  name: "Hardhat",
  currency: "ETH",
  rpcUrl: "http://127.0.0.1:8545",
};

const metadata = {
  name: "NFT Marketplace",
  description: "A simple NFT Marketplace DApp",
  url: "http://localhost:5173", // URL de tu DApp
  icons: [],
};

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [hardhat],
  projectId,
  themeMode: "light",
});

// 2. Contract Addresses (updated)
const TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const NFT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const MARKETPLACE_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

// Types
type NFT = {
  id: number;
  uri: string;
};

type Listing = {
  nftContract: string;
  tokenId: number;
  seller: string;
  price: bigint;
};

function App() {
  // Web3 State
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  // App State
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [myNfts, setMyNfts] = useState<NFT[]>([]);
  const [marketListings, setMarketListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);
      ethersProvider.getSigner().then(setSigner);
    } else {
      setProvider(null);
      setSigner(null);
    }
  }, [isConnected, address, chainId]);

  const fetchAccountData = useCallback(async () => {
    if (!provider || !address) return;
    try {
      const tokenContract = new ethers.Contract(
        TOKEN_ADDRESS,
        TokenDiploABI.abi,
        provider
      );
      const balance = await tokenContract.balanceOf(address);
      setTokenBalance(ethers.formatEther(balance));

      const nftContract = new ethers.Contract(
        NFT_ADDRESS,
        MiNFTABI.abi,
        provider
      );
      const balanceNFT = await nftContract.balanceOf(address);
      const userNfts: NFT[] = [];
      for (let i = 0; i < Number(balanceNFT); i++) {
        const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
        const tokenURI = await nftContract.tokenURI(tokenId);
        userNfts.push({ id: Number(tokenId), uri: tokenURI });
      }
      setMyNfts(userNfts);
    } catch (err) {
      console.error("Error fetching account data:", err);
      setError("Fallo al cargar datos de la cuenta.");
    }
  }, [provider, address]);

  const fetchMarketListings = useCallback(async () => {
    if (!provider) return;
    try {
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MercadoNFTABI.abi,
        provider
      );
      const listings: Listing[] = [];
      const filter = marketplaceContract.filters.NFTListado();
      const events = await marketplaceContract.queryFilter(filter, 0, "latest");

      const activeListingsPromises = events.map(async (event) => {
        if (event.args) {
          const { contratoNFT, idNFT } = event.args;
          const listingData = await marketplaceContract.listados(
            contratoNFT,
            idNFT
          );
          if (listingData.vendedor !== ethers.ZeroAddress) {
            return {
              nftContract: contratoNFT,
              tokenId: Number(idNFT),
              seller: listingData.vendedor,
              price: listingData.precio,
            };
          }
        }
        return null;
      });

      const results = (await Promise.all(activeListingsPromises)).filter(
        (l) => l !== null
      );
      setMarketListings(results as Listing[]);
    } catch (err) {
      console.error("Error fetching market listings:", err);
      setError("Fallo al cargar los listados del mercado.");
    }
  }, [provider]);

  const refreshAllData = useCallback(async () => {
    if (provider && address) {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchAccountData(), fetchMarketListings()]);
      } catch (err) {
        setError("Error al refrescar los datos.");
      } finally {
        setLoading(false);
      }
    }
  }, [provider, address, fetchAccountData, fetchMarketListings]);

  useEffect(() => {
    if (provider && address) {
      refreshAllData();
    }
  }, [provider, address, refreshAllData]);

  // --- Contract Interactions ---

  const handleMint = async () => {
    if (!signer || !address) return;
    setLoading(true);
    setError(null);
    try {
      const nftContract = new ethers.Contract(
        NFT_ADDRESS,
        MiNFTABI.abi,
        signer
      );
      const tx = await nftContract.safeMint(
        address,
        `ipfs://NEW_NFT_${Date.now()}`
      );
      await tx.wait();
      alert("¡NFT creado con éxito!");
      await refreshAllData();
    } catch (err) {
      console.error("Minting failed:", err);
      setError("La creación del NFT falló.");
    } finally {
      setLoading(false);
    }
  };

  const handleList = async (tokenId: number, price: string) => {
    if (!signer || !price || isNaN(Number(price))) {
      setError("Precio inválido");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const priceInWei = ethers.parseEther(price);
      const nftContract = new ethers.Contract(
        NFT_ADDRESS,
        MiNFTABI.abi,
        signer
      );
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MercadoNFTABI.abi,
        signer
      );

      const approval = await nftContract.getApproved(tokenId);
      if (approval.toLowerCase() !== MARKETPLACE_ADDRESS.toLowerCase()) {
        const approveTx = await nftContract.approve(
          MARKETPLACE_ADDRESS,
          tokenId
        );
        await approveTx.wait();
      }

      const listTx = await marketplaceContract.listarNFT(
        NFT_ADDRESS,
        tokenId,
        priceInWei
      );
      await listTx.wait();

      alert("¡NFT listado para la venta!");
      await refreshAllData();
    } catch (err) {
      console.error("Listing failed:", err);
      setError("Fallo al listar el NFT.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (listing: Listing) => {
    if (!signer) return;
    setLoading(true);
    setError(null);
    try {
      const tokenContract = new ethers.Contract(
        TOKEN_ADDRESS,
        TokenDiploABI.abi,
        signer
      );
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MercadoNFTABI.abi,
        signer
      );

      const approveTx = await tokenContract.approve(
        MARKETPLACE_ADDRESS,
        listing.price
      );
      await approveTx.wait();

      const buyTx = await marketplaceContract.comprarNFT(
        listing.nftContract,
        listing.tokenId
      );
      await buyTx.wait();

      alert("¡Compra exitosa!");
      await refreshAllData();
    } catch (err) {
      console.error("Buying failed:", err);
      setError("La compra del NFT falló.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (tokenId: number) => {
    if (!signer) return;
    setLoading(true);
    setError(null);
    try {
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MercadoNFTABI.abi,
        signer
      );
      const tx = await marketplaceContract.cancelarListado(
        NFT_ADDRESS,
        tokenId
      );
      await tx.wait();

      alert("¡Listado cancelado!");
      await refreshAllData();
    } catch (err) {
      console.error("Cancellation failed:", err);
      setError("Fallo al cancelar el listado.");
    } finally {
      setLoading(false);
    }
  };

  // --- JSX Render ---

  const renderMyNfts = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {myNfts.map((nft) => {
        const isListed = marketListings.some((l) => l.tokenId === nft.id);
        return (
          <div
            key={nft.id}
            className="bg-white rounded-lg shadow p-4 border flex flex-col justify-between"
          >
            <div>
              <div className="aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center">
                <p className="text-gray-500 text-sm">NFT Image</p>
              </div>
              <p className="font-bold text-lg">Token ID: {nft.id}</p>
              <p className="text-xs text-gray-500 truncate mb-4">
                URI: {nft.uri}
              </p>
            </div>
            {!isListed ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const price = (e.target as HTMLFormElement).price.value;
                  handleList(nft.id, price);
                }}
              >
                <input
                  name="price"
                  type="text"
                  placeholder="Precio en DIP"
                  required
                  className="w-full border rounded px-2 py-1 mb-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 text-white rounded py-1 text-sm font-semibold hover:bg-blue-600 disabled:bg-gray-400"
                >
                  Listar
                </button>
              </form>
            ) : (
              <div className="bg-green-100 text-green-800 text-center text-sm font-semibold py-1 rounded">
                Listado
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderMarketListings = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {marketListings.map((listing) => (
        <div
          key={`${listing.nftContract}-${listing.tokenId}`}
          className="bg-white rounded-lg shadow p-4 border flex flex-col justify-between"
        >
          <div>
            <div className="aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center">
              <p className="text-gray-500 text-sm">NFT Image</p>
            </div>
            <p className="font-bold text-lg">Token ID: {listing.tokenId}</p>
            <p className="text-md font-semibold text-green-600">
              {ethers.formatEther(listing.price)} DIP
            </p>
            <p className="text-xs text-gray-500 truncate mb-4">
              Vendedor: {listing.seller.slice(0, 6)}...
              {listing.seller.slice(-4)}
            </p>
          </div>
          {address?.toLowerCase() === listing.seller.toLowerCase() ? (
            <button
              onClick={() => handleCancel(listing.tokenId)}
              disabled={loading}
              className="w-full bg-red-500 text-white rounded py-1 text-sm font-semibold hover:bg-red-600 disabled:bg-gray-400"
            >
              Cancelar Listado
            </button>
          ) : (
            <button
              onClick={() => handleBuy(listing)}
              disabled={loading}
              className="w-full bg-purple-500 text-white rounded py-1 text-sm font-semibold hover:bg-purple-600 disabled:bg-gray-400"
            >
              Comprar
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800">NFT Marketplace</h1>
        <div>
          {isConnected && address ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-mono text-sm">{`${address.slice(
                  0,
                  6
                )}...${address.slice(-4)}`}</p>
                <p className="font-semibold text-green-600">
                  {parseFloat(tokenBalance).toFixed(2)} DIP
                </p>
              </div>
              <button
                onClick={() => open({ view: "Account" })}
                className="bg-gray-200 px-4 py-2 rounded font-semibold text-sm hover:bg-gray-300"
              >
                Cuenta
              </button>
            </div>
          ) : (
            <button
              onClick={() => open()}
              className="bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600"
            >
              Conectar Billetera
            </button>
          )}
        </div>
      </header>

      <main className="p-4 sm:p-8">
        {loading && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
            <p className="text-white text-xl animate-pulse">Procesando...</p>
          </div>
        )}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
            onClick={() => setError(null)}
          >
            {error}{" "}
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer">
              x
            </span>
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-gray-700">
              Conecta tu billetera para comenzar
            </h2>
          </div>
        ) : (
          <>
            <section className="mb-8 p-4 bg-white rounded-lg shadow border">
              <h2 className="text-xl font-semibold mb-3">Acciones</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleMint}
                  disabled={loading}
                  className="bg-indigo-500 text-white px-4 py-2 rounded font-semibold hover:bg-indigo-600 disabled:bg-gray-400"
                >
                  Crear Nuevo NFT
                </button>
                <button
                  onClick={refreshAllData}
                  disabled={loading}
                  className="bg-gray-500 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600 disabled:bg-gray-400"
                >
                  Refrescar Datos
                </button>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold border-b pb-2 mb-4">
                Mis NFTs
              </h2>
              {myNfts.length > 0 ? (
                renderMyNfts()
              ) : (
                <p className="text-gray-500">
                  No posees ningún NFT de esta colección.
                </p>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-semibold border-b pb-2 mb-4">
                Mercado
              </h2>
              {marketListings.length > 0 ? (
                renderMarketListings()
              ) : (
                <p className="text-gray-500">
                  No hay NFTs a la venta en este momento.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
