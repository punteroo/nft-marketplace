// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenDiplo
 * @dev Un token ERC20 simple con un suministro inicial.
 * El dueño del contrato (quien lo despliega) puede mintear nuevos tokens.
 * Hereda de ERC20 de OpenZeppelin para la funcionalidad estándar y de
 * Ownable para la gestión de permisos.
 */
contract TokenDiplo is ERC20, Ownable {
    /**
     * @dev El constructor inicializa el token y transfiere la propiedad a quien lo despliega.
     * @param cantidadInicial La cantidad de tokens a crear y asignar al desplegador.
     */
    constructor(
        uint256 cantidadInicial
    ) ERC20("Diplo", "DIP") Ownable(msg.sender) {
        // Se acuñan los tokens iniciales para el creador del contrato.
        _mint(msg.sender, cantidadInicial);
    }

    /**
     * @notice Permite al dueño del contrato crear nuevos tokens.
     * @dev Función restringida solo al 'owner'.
     * @param para La dirección que recibirá los nuevos tokens.
     * @param cantidad La cantidad de tokens a crear.
     */
    function mint(address para, uint256 cantidad) public onlyOwner {
        _mint(para, cantidad);
    }
}
