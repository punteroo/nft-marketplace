export type NftData = {
  id: number;
  uri: string;
};

export type ListingData = {
  seller: string;
  price: bigint;
} & NftData;

export type MarketListing = {
  tokenId: number;
  price: bigint;
  seller: string;
  uri: string;
};
