// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Contrato para el mercado de NFTs
contract MercadoNFT {
    // Estructura para guardar info de una venta
    struct Venta {
        address vendedor;
        address contratoNFT;
        uint256 idNFT;
        uint256 precio;
        bool estaActiva;
    }

    IERC20 public tokenPago; // Token usado para pagar
    mapping(uint256 => Venta) public ventas; // Lista de ventas
    uint256 public contadorVentas; // Contador de ventas

    // Eventos para cuando se pone o compra un NFT
    event NFTEnVenta(
        address indexed vendedor,
        address indexed contratoNFT,
        uint256 indexed idNFT,
        uint256 precio
    );
    event NFTComprado(
        address indexed comprador,
        address indexed contratoNFT,
        uint256 indexed idNFT,
        uint256 precio
    );

    // Constructor que define el token de pago
    constructor(address _tokenPago) {
        tokenPago = IERC20(_tokenPago);
    }

    // Función para poner un NFT en venta
    function venderNFT(
        address contratoNFT,
        uint256 idNFT,
        uint256 precio
    ) public {
        IERC721 nft = IERC721(contratoNFT);
        require(nft.ownerOf(idNFT) == msg.sender, "No eres el dueno");
        require(
            nft.isApprovedForAll(msg.sender, address(this)),
            "Mercado no aprobado"
        );

        ventas[contadorVentas] = Venta(
            msg.sender,
            contratoNFT,
            idNFT,
            precio,
            true
        );
        contadorVentas++;
        emit NFTEnVenta(msg.sender, contratoNFT, idNFT, precio);
    }

    // Función para comprar un NFT
    function comprarNFT(uint256 idVenta) public {
        Venta storage venta = ventas[idVenta];
        require(venta.estaActiva, "Venta no activa");

        IERC721 nft = IERC721(venta.contratoNFT);
        tokenPago.transferFrom(msg.sender, venta.vendedor, venta.precio);
        nft.transferFrom(venta.vendedor, msg.sender, venta.idNFT);

        venta.estaActiva = false;
        emit NFTComprado(
            msg.sender,
            venta.contratoNFT,
            venta.idNFT,
            venta.precio
        );
    }
}
