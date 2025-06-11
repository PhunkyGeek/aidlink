'use client';

import { useState, useEffect } from 'react';
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
import { Zap, LogOut } from 'lucide-react';
import { Spinner } from './Spinner';

export function IconConnectWallet() {
  const wallets = useWallets();
  const account = useCurrentAccount();
  const { mutate: connect, isPending: isConnecting } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const { setAddress, setIsConnected } = useUserStore();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsMobile(/mobile|android|ios|iphone|ipad/.test(userAgent));
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (!account && wallets.length > 0 && !isConnecting) {
      const handleAutoConnect = async () => {
        try {
          const targetWallet = wallets.find(
            (w) => w.name === 'Sui Wallet' && 'signTransaction' in w.features
          );

          if (targetWallet) {
            await connect({ wallet: targetWallet });
          } else if (isMobile) {
            window.location.href = 'sui://connect';
          }
        } catch (error: any) {
          console.error('Auto-connect failed:', error);
          toast.error('Auto-connect failed');
        }
      };
      handleAutoConnect();
    }
  }, [wallets, account, isConnecting, connect, isMobile]);

  // Update Firebase on connection
  useEffect(() => {
    const updateFirebase = async () => {
      if (!auth || !db) {
        console.warn('Firebase not initialized');
        toast.error('Cannot sync wallet – Firebase not initialized');
        return;
      }

      if (account && auth.currentUser) {
        try {
          await setDoc(
            doc(db, 'users', auth.currentUser.uid),
            {
              address: account.address,
              isConnected: true,
              updatedAt: new Date(),
            },
            { merge: true }
          );
          setAddress(account.address);
          setIsConnected(true);
          toast.success('Wallet connected');
        } catch (error: any) {
          console.error('Firebase update failed:', error);
          toast.error('Failed to sync connection');
        }
      }
    };

    updateFirebase();
  }, [account, setAddress, setIsConnected]);

  const handleDisconnect = () => {
    try {
      disconnect();
      setAddress(null);
      setIsConnected(false);
      toast.success('Wallet disconnected');
    } catch (error: any) {
      console.error('Disconnect failed:', error);
      toast.error('Failed to disconnect');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!account ? (
        <button
          onClick={() => wallets.length > 0 && connect({ wallet: wallets[0] })}
          disabled={isConnecting || wallets.length === 0}
          aria-label="Auto-connect wallet"
          title="Auto-connect"
          className="bg-black border border-gray-700 text-gray-400 p-2 rounded-lg hover:border-purple-500 hover:text-purple-500 disabled:opacity-50"
        >
          {isConnecting ? <Spinner size="sm" /> : <Zap size={20} />}
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-2 text-sm">
          <span className="font-mono bg-gray-800 px-2 py-1 rounded text-purple-300">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </span>
          <button
            onClick={handleDisconnect}
            className="text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <LogOut size={16} />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}