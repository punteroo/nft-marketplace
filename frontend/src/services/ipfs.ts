const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

type NftMetadata = {
  name: string;
  description: string;
  image: string; // This will be an IPFS CID
};

export const uploadToIPFS = async (
  file: File,
  metadata: { name: string; description: string }
): Promise<string> => {
  // 1. Upload the image file
  const imageFormData = new FormData();
  imageFormData.append("file", file);

  const imageRes = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: imageFormData,
    }
  );
  const imageResData = await imageRes.json();
  const imageCid = imageResData.IpfsHash;
  const imageUrl = `ipfs://${imageCid}`;

  // 2. Upload the metadata JSON
  const jsonMetadata: NftMetadata = {
    ...metadata,
    image: imageUrl,
  };

  const jsonRes = await fetch(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify(jsonMetadata),
    }
  );
  const jsonResData = await jsonRes.json();
  const metadataCid = jsonResData.IpfsHash;

  return `ipfs://${metadataCid}`;
};
