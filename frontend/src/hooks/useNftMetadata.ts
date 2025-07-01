import { useState, useEffect } from "react";

// This is the structure of our metadata JSON file
export interface NftMetadata {
  name: string;
  description: string;
  image: string;
}

// A public IPFS gateway
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

const formatIpfsUrl = (ipfsUrl: string): string => {
  if (!ipfsUrl || !ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl; // Return original if not a valid IPFS URL
  }
  const cid = ipfsUrl.substring(7);
  return `${IPFS_GATEWAY}${cid}`;
};

export const useNftMetadata = (tokenUri: string) => {
  const [metadata, setMetadata] = useState<NftMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenUri) return;

    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);
      const metadataUrl = formatIpfsUrl(tokenUri);

      try {
        const response = await fetch(metadataUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch metadata");
        }
        const data: NftMetadata = await response.json();

        // Also format the image URL to be a usable HTTP link
        if (data.image) {
          data.image = formatIpfsUrl(data.image);
        }

        setMetadata(data);
      } catch (e) {
        console.error("Failed to fetch NFT metadata:", e);
        setError("Could not load metadata.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenUri]);

  return { metadata, isLoading, error };
};
