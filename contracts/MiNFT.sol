// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // We keep Ownable for other potential future functions

/**
 * @title MiNFT
 * @dev An NFT contract where any user can mint their own token.
 * Inherits from ERC721URIStorage for metadata and Ownable for security.
 */
contract MiNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    /**
     * @dev The constructor initializes the NFT and transfers ownership.
     */
    constructor() ERC721("NFTDiplo", "DNFT") Ownable(msg.sender) {}

    /**
     * @notice Allows any user to create a new NFT for themselves.
     * @dev The NFT is minted directly to the function caller.
     * @param tokenURI The link to the NFT's metadata (usually a JSON file on IPFS).
     * @return The ID of the new token created.
     */
    function safeMint(string memory tokenURI) public returns (uint256) {
        uint256 newTokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Mint the new NFT to the message sender (`msg.sender`)
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        return newTokenId;
    }
}
