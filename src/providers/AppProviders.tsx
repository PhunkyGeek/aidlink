'use client';

import { ReactNode, useMemo } from 'react';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import ToastProvider from '@/components/ToastProvider';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type AppProvidersProps = {
  children: ReactNode;
};

const queryClient = new QueryClient();

export default function AppProviders({ children }: AppProvidersProps) {
  const networks = useMemo(
    () => ({
      testnet: { name: 'testnet', url: 'https://fullnode.testnet.sui.io:443' },
      devnet: { name: 'devnet', url: 'https://fullnode.devnet.sui.io:443' },
      mainnet: { name: 'mainnet', url: 'https://fullnode.mainnet.sui.io:443' },
    }),
    []
  );

  const defaultNetwork = useMemo(() => {
    if (process.env.NODE_ENV === 'production') return 'testnet';

    const envNetwork = process.env.NEXT_PUBLIC_SUI_NETWORK;
    if (envNetwork === 'testnet' || envNetwork === 'devnet' || envNetwork === 'mainnet') {
      return envNetwork;
    }
    return 'devnet';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork={defaultNetwork}>
        <WalletProvider>
          <ToastProvider />
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
