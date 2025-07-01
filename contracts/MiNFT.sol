// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol"; // <-- IMPORT THIS
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MiNFT
 * @dev An NFT contract where any user can mint their own token.
 * Now includes Enumerable to allow on-chain enumeration of tokens.
 */
contract MiNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Ownable // <-- ADD ERC721 and ERC721Enumerable
{
    uint256 private _tokenIdCounter;

    constructor() ERC721("NFTDiplo", "DNFT") Ownable(msg.sender) {}

    function safeMint(string memory tokenURI) public returns (uint256) {
        uint256 newTokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        return newTokenId;
    }

    // The following functions are overrides required by Solidity.

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(
            ERC721,
            ERC721Enumerable,
            ERC721URIStorage // <-- MUST OVERRIDE
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(
            ERC721,
            ERC721Enumerable // <-- MUST OVERRIDE FOR ENUMERABLE
        )
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    )
        internal
        override(
            ERC721,
            ERC721Enumerable // <-- MUST OVERRIDE FOR ENUMERABLE
        )
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(
            ERC721,
            ERC721URIStorage // <-- MUST OVERRIDE
        )
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
