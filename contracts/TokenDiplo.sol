// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Contrato para el token Diplo
contract TokenDiplo is ERC20 {
    // Constructor que crea tokens iniciales
    constructor(uint256 cantidadInicial) ERC20("Diplo", "DIP") {
        // Crear tokens para el que despliega el contrato
        _mint(msg.sender, cantidadInicial);
    }

    // Función para crear más tokens (para pruebas)
    function crearTokens(address para, uint256 cantidad) public {
        _mint(para, cantidad);
    }
}
