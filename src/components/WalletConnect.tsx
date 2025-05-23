// src/components/WalletConnect.tsx
'use client';

import { useState } from 'react';
import {
  useConnectWallet,
  useCurrentAccount,
  useDisconnectWallet,
  useWallets,
} from '@mysten/dapp-kit';
import { useUserStore } from '@/store/useUserStore';
import toast from 'react-hot-toast';
import { RiWallet3Fill } from 'react-icons/ri';
import { WalletCreationModal } from './WalletCreationalModal';
import { Spinner } from './ui/Spinner';

export function WalletConnect() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: connect, isPending: isConnecting } = useConnectWallet();
  const wallets = useWallets();
  const { role, setAddress } = useUserStore();
  const [showCreationModal, setShowCreationModal] = useState(false);

  const handleConnect = async () => {
    try {
      const suiWallet = wallets.find((w) => w.name === 'Sui Wallet');

      if (suiWallet) {
        await connect({ wallet: suiWallet });
        toast.success('Wallet connected');
      } else {
        setShowCreationModal(true);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
      setAddress(null);
      toast.success('Wallet disconnected');
    } catch (err) {
      console.error(err);
      toast.error('Failed to disconnect');
    }
  };

  const handleWalletCreated = (address: string) => {
    setAddress(address);
    setShowCreationModal(false);
    toast.success('Wallet created and connected!');
  };

  return (
    <div className="relative">
      {!account ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-75"
        >
          {isConnecting ? (
            <Spinner size="sm" className="text-white" />
          ) : (
            <RiWallet3Fill className="text-xl" />
          )}
          Manual Connect
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="font-mono bg-gray-800 px-3 py-1 rounded text-purple-300 text-sm">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </span>
          <span className="text-xs text-purple-300 capitalize">({role})</span>
          <button
            onClick={handleDisconnect}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Disconnect
          </button>
        </div>
      )}

      <WalletCreationModal
        isOpen={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onWalletCreated={handleWalletCreated}
      />
    </div>
  );
}