// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Contrato para los NFTs
contract MiNFT is ERC721 {
    uint256 private _numeroNFTs; // Contador de NFTs
    mapping(uint256 => string) private _urlsNFTs; // Guarda las URLs de los NFTs

    // Constructor con nombre y símbolo
    constructor() ERC721("NFTDiplo", "DNFT") {
        _numeroNFTs = 0; // Iniciar el contador en 0
    }

    // Función para crear un nuevo NFT
    function hacerNFT(
        address paraQuien,
        string memory url
    ) public returns (uint256) {
        _numeroNFTs = _numeroNFTs + 1; // Aumentar el contador
        uint256 idNuevo = _numeroNFTs; // Obtener el nuevo ID
        _mint(paraQuien, idNuevo); // Crear el NFT
        _guardarURL(idNuevo, url); // Guardar la URL
        return idNuevo;
    }

    // Función interna para guardar la URL
    function _guardarURL(uint256 idNFT, string memory urlNFT) internal {
        _urlsNFTs[idNFT] = urlNFT;
    }

    // Función para obtener la URL del NFT
    function obtenerURL(
        uint256 idNFT
    ) public view returns (string memory) {
        // Verificar si el NFT existe usando _ownerOf de ERC721
        require(_ownerOf(idNFT) != address(0), "NFT no existe");
        return _urlsNFTs[idNFT];
    }
}
