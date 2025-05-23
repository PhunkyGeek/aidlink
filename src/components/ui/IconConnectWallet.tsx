'use client';

import { useConnectWallet, useWallets } from '@mysten/dapp-kit';
import { RiThunderstormsFill, RiThunderstormsLine } from 'react-icons/ri';

export function IconConnectWallet() {
  const wallets = useWallets(); // Get available wallets
  const { mutate: connect } = useConnectWallet();

  const handleConnect = () => {
    if (wallets.length > 0) {
      connect({ wallet: wallets[0] }); // Pick the first wallet or show options
    } else {
      console.error('No wallets found.');
    }
  };

  return (
    <button
      onClick={handleConnect}
      aria-label="autoconnect"
      title="autoconnect"
      className="bg-black border border-gray-700 text-gray-400 p-2.5 rounded-lg hover:border-purple-500 hover:text-purple-500"
    >
      <RiThunderstormsFill size={20} />
    </button>
  );
}
