import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  createWeb3Modal,
  defaultConfig,
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";

import { Header } from "./components/layout/Header";
import { NFTCard } from "./components/nft/NFTCard";
import type { NftData, ListingData, MarketListing } from "./types/NFT";
import { MintNFTModal } from "./components/nft/MintNFTModal";
import { uploadToIPFS } from "./services/ipfs";
import {
  TOKEN_ADDRESS,
  NFT_ADDRESS,
  MARKETPLACE_ADDRESS,
  TOKEN_ABI,
  NFT_ABI,
  MARKETPLACE_ABI,
  WALLETCONNECT_PROJECT_ID,
  HARDHAT_NETWORK,
} from "./constants";

// Web3Modal Configuration
createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata: {
      name: "NFT Marketplace",
      description: "My NFT Marketplace",
      url: "http://localhost:5173",
      icons: [],
    },
  }),
  chains: [HARDHAT_NETWORK],
  projectId: WALLETCONNECT_PROJECT_ID,
});

function App() {
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const [tokenBalance, setTokenBalance] = useState("0");
  const [myNfts, setMyNfts] = useState<NftData[]>([]);
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  // Memoized function to get a signer
  const getSigner = useCallback(async () => {
    if (!walletProvider) return null;
    const provider = new ethers.BrowserProvider(walletProvider);
    return provider.getSigner();
  }, [walletProvider]);

  // Fetches all data
  const fetchAllData = useCallback(async () => {
    if (!address || !walletProvider) return;
    const provider = new ethers.BrowserProvider(walletProvider);

    // Contracts
    const tokenContract = new ethers.Contract(
      TOKEN_ADDRESS,
      TOKEN_ABI,
      provider
    );
    const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);
    const marketplaceContract = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      provider
    );

    // Fetch Token Balance
    const balance = await tokenContract.balanceOf(address);
    setTokenBalance(ethers.formatEther(balance));

    // Fetch My NFTs
    const nftBalance = await nftContract.balanceOf(address);
    const userNfts: NftData[] = [];
    for (let i = 0; i < Number(nftBalance); i++) {
      const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
      const tokenURI = await nftContract.tokenURI(tokenId);
      userNfts.push({ id: Number(tokenId), uri: tokenURI });
    }
    setMyNfts(userNfts);

    // Fetch Market Listings
    const filter = marketplaceContract.filters.NFTListado();
    const events = await marketplaceContract.queryFilter(filter);
    const activeListingsPromises = events.map(async (event: any) => {
      if (event.args) {
        const { idNFT } = event.args;
        const listingData = await marketplaceContract.listados(
          NFT_ADDRESS,
          idNFT
        );
        if (listingData.vendedor !== ethers.ZeroAddress) {
          // This is the new, crucial line!
          const tokenURI = await nftContract.tokenURI(idNFT);

          return {
            tokenId: Number(idNFT),
            price: listingData.precio,
            seller: listingData.vendedor,
            uri: tokenURI,
          };
        }
      }
      return null;
    });

    const activeListings = (await Promise.all(activeListingsPromises)).filter(
      (l) => l !== null
    ) as MarketListing[];

    setMarketListings(activeListings);
  }, [address, walletProvider, chainId]);

  useEffect(() => {
    if (isConnected) {
      fetchAllData();
    } else {
      // Clear state on disconnect
      setTokenBalance("0");
      setMyNfts([]);
      setMarketListings([]);
    }
  }, [isConnected, address, chainId, fetchAllData]);

  const handleMint = async (file: File, name: string, description: string) => {
    const signer = await getSigner();
    if (!signer) return;
    setLoadingMessage("Uploading to IPFS...");
    try {
      const tokenURI = await uploadToIPFS(file, { name, description });

      setLoadingMessage("Waiting for transaction confirmation...");
      const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
      const tx = await nftContract.safeMint(tokenURI);
      await tx.wait();

      alert("NFT Minted Successfully!");
      await fetchAllData();
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Minting Failed!");
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleList = async (tokenId: number, price: string) => {
    const signer = await getSigner();
    if (!signer) return;
    setLoadingMessage("Listing NFT...");
    try {
      const priceInWei = ethers.parseEther(price);
      const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      // Approve marketplace
      const approveTx = await nftContract.approve(MARKETPLACE_ADDRESS, tokenId);
      await approveTx.wait();

      // List NFT
      const listTx = await marketplaceContract.listarNFT(
        NFT_ADDRESS,
        tokenId,
        priceInWei
      );
      await listTx.wait();

      alert("NFT Listed!");
      await fetchAllData();
    } catch (error) {
      console.error("Listing failed:", error);
      alert("Listing Failed!");
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleBuy = async (listing: ListingData) => {
    const signer = await getSigner();
    if (!signer) return;
    setLoadingMessage("Processing purchase...");
    try {
      const tokenContract = new ethers.Contract(
        TOKEN_ADDRESS,
        TOKEN_ABI,
        signer
      );
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      // Approve token spending
      const approveTx = await tokenContract.approve(
        MARKETPLACE_ADDRESS,
        listing.price
      );
      await approveTx.wait();

      // Buy NFT
      const buyTx = await marketplaceContract.comprarNFT(
        NFT_ADDRESS,
        listing.id
      );
      await buyTx.wait();

      alert("Purchase successful!");
      await fetchAllData();
    } catch (error) {
      console.error("Buying failed:", error);
      alert("Purchase Failed!");
    } finally {
      setLoadingMessage(null);
    }
  };

  const handleCancel = async (tokenId: number) => {
    const signer = await getSigner();
    if (!signer) return;
    setLoadingMessage("Cancelling listing...");
    try {
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );
      const tx = await marketplaceContract.cancelarListado(
        NFT_ADDRESS,
        tokenId
      );
      await tx.wait();
      alert("Listing cancelled!");
      await fetchAllData();
    } catch (error) {
      console.error("Cancellation failed:", error);
      alert("Cancellation Failed!");
    } finally {
      setLoadingMessage(null);
    }
  };

  // Combine NFTs and Listings for display
  const allMarketNfts = marketListings.map((l) => ({
    id: l.tokenId,
    uri: "", // You would fetch this if you want to display market NFT details
    listingPrice: l.price,
    isOwned: false,
    isListed: true,
  }));

  return (
    <div className="min-h-screen bg-base-300" data-theme="dark">
      <Header tokenBalance={tokenBalance} />

      {loadingMessage && (
        <div className="toast toast-center z-50">
          <div className="alert alert-info">
            <div className="flex flex-col items-center">
              <span className="loading loading-spinner"></span>
              <span>{loadingMessage}</span>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto p-4 md:p-8">
        {!isConnected ? (
          <div className="hero min-h-[60vh]">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-5xl font-bold">Welcome!</h1>
                <p className="py-6">
                  Connect your wallet to manage your NFTs and explore the
                  marketplace.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="mb-12 p-6 bg-base-100 rounded-box shadow-md">
              <h2 className="text-2xl font-bold mb-4">Actions</h2>
              <div className="flex gap-4">
                <MintNFTModal
                  onMint={handleMint}
                  isMinting={!!loadingMessage}
                />
                <button
                  className="btn"
                  onClick={fetchAllData}
                  disabled={!!loadingMessage}
                >
                  Refresh Data
                </button>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold border-b-2 border-primary pb-2 mb-6">
                My NFTs
              </h2>
              {myNfts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {myNfts.map((nft) => {
                    const listing = marketListings.find(
                      (l) => l.tokenId === nft.id
                    );
                    return (
                      <NFTCard
                        key={nft.id}
                        nft={nft}
                        isOwned={true}
                        isListed={!!listing}
                        listingPrice={listing?.price}
                        onList={handleList}
                        onBuy={handleBuy} // Not applicable here but required by prop
                        onCancel={handleCancel}
                      />
                    );
                  })}
                </div>
              ) : (
                <p>You do not own any NFTs from this collection.</p>
              )}
            </section>

            <section>
              <h2 className="text-3xl font-bold border-b-2 border-primary pb-2 mb-6">
                Marketplace
              </h2>
              {marketListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {marketListings.map((listing) => {
                    if (listing.seller.toLowerCase() === address?.toLowerCase())
                      return null;
                    return (
                      <NFTCard
                        key={listing.tokenId}
                        // This is the updated part
                        nft={{ id: listing.tokenId, uri: listing.uri }}
                        isOwned={false}
                        isListed={true}
                        listingPrice={listing.price}
                        onList={() => Promise.resolve()}
                        onBuy={(nftToBuy) =>
                          handleBuy({ ...nftToBuy, price: listing.price })
                        }
                        onCancel={() => Promise.resolve()}
                      />
                    );
                  })}
                </div>
              ) : (
                <p>There are no NFTs for sale right now.</p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
