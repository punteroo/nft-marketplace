import { useWeb3Modal, useWeb3ModalAccount } from "@web3modal/ethers/react";

interface HeaderProps {
  tokenBalance: string;
}

export function Header({ tokenBalance }: HeaderProps) {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useWeb3ModalAccount();

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">DIP NFT Marketplace</a>
      </div>
      <div className="flex-none gap-2">
        {isConnected && address ? (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-mono text-xs">{`${address.slice(
                0,
                6
              )}...${address.slice(-4)}`}</p>
              <p className="font-bold text-accent">
                {parseFloat(tokenBalance).toFixed(2)} DIP
              </p>
            </div>
            <button
              onClick={() => open({ view: "Account" })}
              className="btn btn-secondary"
            >
              Account
            </button>
          </div>
        ) : (
          <button onClick={() => open()} className="btn btn-primary">
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
