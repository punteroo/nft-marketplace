import { useState, type FormEvent } from "react";
import { ethers } from "ethers";
import { useNftMetadata } from "../../hooks/useNftMetadata";
import type { NftData, ListingData } from "../../types/NFT";

interface NFTCardProps {
  nft: NftData;
  isOwned: boolean;
  isListed: boolean;
  listingPrice?: bigint;
  onList: (id: number, price: string) => Promise<void>;
  onBuy: (listing: ListingData) => Promise<void>;
  onCancel: (id: number) => Promise<void>;
}

export function NFTCard({
  nft,
  isOwned,
  isListed,
  listingPrice,
  onList,
  onBuy,
  onCancel,
}: NFTCardProps) {
  const [price, setPrice] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { metadata, isLoading: isMetadataLoading } = useNftMetadata(nft.uri);

  const handleListSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    await onList(nft.id, price);
    setIsActionLoading(false);
  };

  const handleBuyClick = async () => {
    setIsActionLoading(true);
    await onBuy({
      id: nft.id,
      uri: nft.uri,
      price: listingPrice!,
      seller: "",
    });
    setIsActionLoading(false);
  };

  const handleCancelClick = async () => {
    setIsActionLoading(true);
    await onCancel(nft.id);
    setIsActionLoading(false);
  };

  const renderCardContent = () => {
    if (isMetadataLoading) {
      return (
        <>
          <div className="skeleton h-4 w-28"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
        </>
      );
    }

    if (metadata) {
      return (
        <>
          <h2 className="card-title truncate">{metadata.name}</h2>
          <p className="text-xs text-gray-400 truncate">
            {metadata.description}
          </p>
        </>
      );
    }

    return <h2 className="card-title">NFT #{nft.id}</h2>;
  };

  return (
    <div className="card w-full bg-base-200 shadow-xl transition-all hover:scale-105">
      <figure className="aspect-square bg-base-300">
        {isMetadataLoading ? (
          <div className="skeleton w-full h-full"></div>
        ) : (
          metadata?.image && (
            <img
              src={metadata.image}
              alt={metadata.name}
              className="w-full h-full object-cover"
            />
          )
        )}
      </figure>
      <div className="card-body p-4">
        <div className="min-h-[60px]">{renderCardContent()}</div>

        {isListed && listingPrice && (
          <div className="badge badge-lg badge-success font-bold mt-2">
            {ethers.formatEther(listingPrice)} DIP
          </div>
        )}

        <div className="card-actions justify-end mt-4">
          {isOwned && !isListed && (
            <form onSubmit={handleListSubmit} className="w-full space-y-2">
              <input
                type="text"
                placeholder="Price in DIP"
                className="input input-bordered w-full"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <button
                type="submit"
                className={`btn btn-primary w-full ${
                  isActionLoading && "loading"
                }`}
                disabled={isActionLoading}
              >
                List for Sale
              </button>
            </form>
          )}
          {isOwned && isListed && (
            <button
              onClick={handleCancelClick}
              className={`btn btn-warning w-full ${
                isActionLoading && "loading"
              }`}
              disabled={isActionLoading}
            >
              Cancel Listing
            </button>
          )}
          {!isOwned && isListed && (
            <button
              onClick={handleBuyClick}
              className={`btn btn-accent w-full ${
                isActionLoading && "loading"
              }`}
              disabled={isActionLoading}
            >
              Buy NFT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
