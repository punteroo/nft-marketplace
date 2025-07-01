# NFT Marketplace - Hardhat y React

Proyecto de un marketplace de NFTs que permite crear, listar y comprar tokens ERC721 usando un token ERC20 personalizado.

## Requisitos Previos

* Node.js (v18 o superior)
* yarn

## 1. Configuración del Backend (Hardhat)

1.  **Navegar al directorio raíz del proyecto.**
2.  **Instalar dependencias**:
    ```bash
    yarn
    ```

## 2. Configuración del Frontend (Vite + React)

1.  **Navegar al directorio `frontend`**:
    ```bash
    cd frontend
    ```
2.  **Instalar dependencias**:
    ```bash
    yarn
    ```
3.  **Crear archivo de entorno**:
    * En el directorio `frontend`, crea un archivo `.env`.
    * Añade tu clave JWT de [Pinata](https://pinata.cloud) para el almacenamiento de imágenes en IPFS.
        ```
        VITE_PINATA_JWT=tu_jwt_token_aqui
        ```

## 3. Despliegue y Ejecución

Sigue estos pasos en orden para ejecutar la aplicación.

### Paso 3.1: Iniciar Blockchain Local

* En una terminal, desde la raíz del proyecto, ejecuta:
    ```bash
    yarn hardhat node
    ```
* Mantén esta terminal abierta.

### Paso 3.2: Desplegar Contratos

* En una **segunda terminal**, desde la raíz del proyecto, ejecuta:
    ```bash
    yarn deploy:local
    ```
* Este comando despliega los contratos y distribuye los tokens.

### Paso 3.3: Actualizar Direcciones en el Frontend

* La salida del comando anterior mostrará las direcciones de los contratos desplegados.
* Copia las constantes `TOKEN_ADDRESS`, `NFT_ADDRESS`, y `MARKETPLACE_ADDRESS`.
* Abre el archivo `frontend/src/constants/index.ts`.
* Pega las nuevas direcciones, reemplazando las existentes. Guarda el archivo.

> **Nota**: Debes repetir los pasos 3.2 y 3.3 cada vez que reinicies la blockchain local (`npx hardhat node`).

### Paso 3.4: Iniciar Aplicación Frontend

* Navega al directorio `frontend` en la terminal.
* Ejecuta el servidor de desarrollo:
    ```bash
    npm run dev
    ```
* Abre tu navegador en la URL proporcionada (ej. `http://localhost:5173`).

## 4. Uso de la Aplicación

1.  **Configurar MetaMask**:
    * Conéctate a la red `Localhost 8545`.
    * Importa las cuentas de prueba (`Account #0` y `Account #1`) usando las claves privadas que muestra la terminal del nodo Hardhat.
2.  **Operar**:
    * **Conectar Billetera**: Conecta MetaMask a la aplicación.
    * **Crear NFT**: Usa la `Account #0` para crear un nuevo NFT a través del formulario.
    * **Listar NFT**: En la sección "My NFTs", establece un precio en DIP y pon el NFT a la venta.
    * **Cambiar de Cuenta**: En MetaMask, cambia a la `Account #1`.
    * **Comprar NFT**: En la sección "Marketplace", compra el NFT listado. Aprueba las dos transacciones requeridas.
