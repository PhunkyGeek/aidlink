// ✅ lib/suiClient.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const SUI_NETWORK = 'testnet'; // Change to "mainnet" or "devnet" if needed

export const suiClient = new SuiClient({
  url: getFullnodeUrl(SUI_NETWORK),
});
