// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MercadoNFT
 * @dev Un marketplace para comprar y vender NFTs (ERC721) usando un token ERC20 específico.
 * Incluye funcionalidades para listar, deslistar, actualizar precio y comprar.
 */
contract MercadoNFT is ReentrancyGuard {
    // El token ERC20 que se usará para todas las transacciones.
    IERC20 public immutable tokenPago;

    // Estructura para un listado en el mercado.
    struct Listado {
        address vendedor;
        uint256 precio;
    }

    // Mapping anidado para guardar los listados.
    // mapping(dirección del contrato NFT => mapping(ID del token => Listado))
    mapping(address => mapping(uint256 => Listado)) public listados;

    // --- Eventos ---
    event NFTListado(
        address indexed vendedor,
        address indexed contratoNFT,
        uint256 indexed idNFT,
        uint256 precio
    );

    event NFTComprado(
        address indexed comprador,
        address indexed contratoNFT,
        uint256 indexed idNFT,
        address vendedor,
        uint256 precio
    );

    event ListadoCancelado(
        address indexed vendedor,
        address indexed contratoNFT,
        uint256 indexed idNFT
    );

    event PrecioActualizado(
        address indexed vendedor,
        address indexed contratoNFT,
        uint256 indexed idNFT,
        uint256 nuevoPrecio
    );

    /**
     * @dev El constructor establece el token de pago para el marketplace.
     * @param _tokenPago La dirección del contrato del token ERC20 para los pagos.
     */
    constructor(address _tokenPago) {
        tokenPago = IERC20(_tokenPago);
    }

    /**
     * @notice Pone un NFT a la venta en el marketplace.
     * @dev El vendedor debe primero aprobar que este contrato maneje su NFT.
     * @param contratoNFT La dirección del contrato del NFT.
     * @param idNFT El ID del token a vender.
     * @param precio El precio de venta en la unidad más pequeña del token de pago.
     */
    function listarNFT(
        address contratoNFT,
        uint256 idNFT,
        uint256 precio
    ) external {
        require(precio > 0, "Mercado: El precio debe ser mayor a cero");

        IERC721 nft = IERC721(contratoNFT);
        require(
            nft.ownerOf(idNFT) == msg.sender,
            "Mercado: No eres el dueno de este NFT"
        );
        require(
            nft.getApproved(idNFT) == address(this) ||
                nft.isApprovedForAll(msg.sender, address(this)),
            "Mercado: El contrato no esta aprobado para transferir este NFT"
        );

        listados[contratoNFT][idNFT] = Listado(msg.sender, precio);

        emit NFTListado(msg.sender, contratoNFT, idNFT, precio);
    }

    /**
     * @notice Compra un NFT que está listado en el marketplace.
     * @dev El comprador debe primero aprobar que este contrato gaste sus tokens de pago.
     * @param contratoNFT La dirección del contrato del NFT.
     * @param idNFT El ID del token a comprar.
     */
    function comprarNFT(
        address contratoNFT,
        uint256 idNFT
    ) external nonReentrant {
        Listado memory listado = listados[contratoNFT][idNFT];
        require(
            listado.vendedor != address(0),
            "Mercado: Este NFT no esta a la venta"
        );
        require(
            listado.vendedor != msg.sender,
            "Mercado: No puedes comprar tu propio NFT"
        );

        IERC721 nft = IERC721(contratoNFT);

        // Se transfiere el pago del comprador al vendedor.
        tokenPago.transferFrom(msg.sender, listado.vendedor, listado.precio);

        // Se elimina el listado ANTES de la transferencia del NFT para prevenir re-entradas.
        delete listados[contratoNFT][idNFT];

        // Se transfiere el NFT del vendedor al comprador.
        nft.safeTransferFrom(listado.vendedor, msg.sender, idNFT, "");

        emit NFTComprado(
            msg.sender,
            contratoNFT,
            idNFT,
            listado.vendedor,
            listado.precio
        );
    }

    /**
     * @notice Cancela un listado de NFT en el marketplace.
     * @dev Solo el vendedor original puede cancelar su listado.
     * @param contratoNFT La dirección del contrato del NFT.
     * @param idNFT El ID del token a deslistar.
     */
    function cancelarListado(address contratoNFT, uint256 idNFT) external {
        Listado memory listado = listados[contratoNFT][idNFT];
        require(
            listado.vendedor == msg.sender,
            "Mercado: No eres el vendedor de este NFT"
        );

        delete listados[contratoNFT][idNFT];

        emit ListadoCancelado(msg.sender, contratoNFT, idNFT);
    }

    /**
     * @notice Actualiza el precio de un NFT ya listado.
     * @param contratoNFT La dirección del contrato del NFT.
     * @param idNFT El ID del token.
     * @param nuevoPrecio El nuevo precio para el NFT.
     */
    function actualizarPrecio(
        address contratoNFT,
        uint256 idNFT,
        uint256 nuevoPrecio
    ) external {
        require(nuevoPrecio > 0, "Mercado: El precio debe ser mayor a cero");

        Listado storage listado = listados[contratoNFT][idNFT];
        require(
            listado.vendedor == msg.sender,
            "Mercado: No eres el vendedor de este NFT"
        );

        listado.precio = nuevoPrecio;

        emit PrecioActualizado(msg.sender, contratoNFT, idNFT, nuevoPrecio);
    }

    /**
     * @notice Obtiene la información de un listado.
     * @return El vendedor y el precio.
     */
    function obtenerListado(
        address contratoNFT,
        uint256 idNFT
    ) external view returns (Listado memory) {
        return listados[contratoNFT][idNFT];
    }
}
