'use client';

import { useState } from 'react';
import {
  useConnectWallet,
  useCurrentAccount,
  useDisconnectWallet,
  useWallets,
} from '@mysten/dapp-kit';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
import toast from 'react-hot-toast';
import { WalletCreationModal } from './WalletCreationalModal';
import { Spinner } from './ui/Spinner';
import { RiWallet3Fill } from 'react-icons/ri';

export function WalletConnect() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: connect, isPending: isConnecting } = useConnectWallet();
  const wallets = useWallets();
  const { role, setAddress, setIsConnected } = useUserStore();
  const [showCreationModal, setShowCreationModal] = useState(false);

  const handleConnect = async () => {
    try {
      const suiWallet = wallets.find((w) => w.name === 'Sui Wallet');
      if (!suiWallet) {
        setShowCreationModal(true);
        return;
      }

      await connect({ wallet: suiWallet });

      const currentUser = auth?.currentUser;
      if (currentUser && db) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(
          userRef,
          {
            address: suiWallet.accounts[0].address,
            isConnected: true,
            updatedAt: new Date(),
          },
          { merge: true }
        );
        setAddress(suiWallet.accounts[0].address);
        setIsConnected(true);
      }
    } catch (error: any) {
      console.error('Connect failed:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleDisconnect = async () => {
    try {
      disconnect();
      setAddress(null);
      setIsConnected(false);

      const currentUser = auth?.currentUser;
      if (currentUser && db) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(
          userRef,
          { isConnected: false, updatedAt: new Date() },
          { merge: true }
        );
      }

      toast.success('Wallet disconnected');
    } catch (error: any) {
      console.error('Disconnect failed:', error);
      toast.error('Failed to disconnect');
    }
  };

  const handleWalletCreated = async (address: string) => {
    setAddress(address);
    setIsConnected(true);
    setShowCreationModal(false);

    const currentUser = auth?.currentUser;
    if (currentUser && db) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(
        userRef,
        {
          address,
          isConnected: true,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    }

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
