import { jwtToAddress } from '@mysten/sui/zklogin';
import { useUserStore } from '@/store/useUserStore';
import { getUserRole, Role } from '@/utils/getUserRole';

/**
 * Initiates zkLogin by redirecting to the Sui Wallet login page.
 */
export async function initiateZkLogin() {
  const walletUrl = process.env.NEXT_PUBLIC_SUI_WALLET_URL || 'https://wallet.testnet.mystenlabs.com';
  const provider = process.env.NEXT_PUBLIC_ZKLOGIN_PROVIDER || 'google';
  const redirect = `${window.location.origin}/auth/zklogin/callback`;
  const loginUrl = `${walletUrl}/login?provider=${provider}&redirect_uri=${encodeURIComponent(redirect)}`;
  window.location.href = loginUrl;
}

/**
 * Handles zkLogin callback. Updates user store and returns user's resolved role.
 */
export async function handleZkLoginCallback({
  token,
  salt,
  redirect,
}: {
  token: string;
  salt: string;
  redirect: string;
}): Promise<Role> {
  if (!token || !salt) throw new Error('Missing zkLogin parameters');

  // Derive address from JWT and user salt
  const address = jwtToAddress(token, salt, false); // Explicitly non-legacy

  // Store token and salt
  if (typeof window !== 'undefined') {
    localStorage.setItem('zk_token', token);
    localStorage.setItem('zk_salt', salt);
  }

  // Update Zustand store
  const { setAddress, setRole } = useUserStore.getState();
  setAddress(address);

  const role = await getUserRole(address);
  setRole(role);

  return role;
}