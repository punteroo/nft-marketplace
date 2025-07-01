// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MiNFT
 * @dev Un contrato de NFT (ERC721) que permite al dueño mintear nuevos tokens
 * con un URI asociado (que apunta a los metadatos del NFT).
 * Hereda de ERC721URIStorage para manejar metadatos y de Ownable para la seguridad.
 */
contract MiNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    /**
     * @dev El constructor inicializa el NFT y transfiere la propiedad.
     */
    constructor() ERC721("NFTDiplo", "DNFT") Ownable(msg.sender) {}

    /**
     * @notice Permite al dueño del contrato crear un nuevo NFT.
     * @dev Llama a _safeMint que es más seguro que _mint.
     * @param to La dirección que recibirá el nuevo NFT.
     * @param tokenURI El enlace a los metadatos del NFT (usualmente un archivo JSON en IPFS).
     * @return El ID del nuevo token creado.
     */
    function safeMint(
        address to,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        uint256 newTokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        return newTokenId;
    }
}
