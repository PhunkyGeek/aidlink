// ✅ lib/zkLogin.ts
import { jwtToAddress } from '@mysten/sui/zklogin';
import { useUserStore } from '@/store/useUserStore';
import { getUserRole, Role } from '@/utils/getUserRole';

/**
 * Initiates zkLogin by redirecting to Sui Wallet login page.
 */
export async function initiateZkLogin() {
  const redirect = `${window.location.origin}/auth/zklogin/callback`;
  const loginUrl = `https://wallet.testnet.mystenlabs.com/login?provider=google&redirect_uri=${encodeURIComponent(redirect)}`;
  window.location.href = loginUrl;
}

/**
 * Handles zkLogin callback. Returns user's resolved role.
 */
export async function handleZkLoginCallback({
  token,
  salt,
}: {
  token: string;
  salt: string;
}): Promise<Role> {
  if (!token || !salt) throw new Error('Missing zkLogin parameters');

  // 🔑 Derive address from JWT and user salt
  const address = jwtToAddress(token, salt);

  // Update Zustand store
  const { setAddress, setRole } = useUserStore.getState();
  setAddress(address);

  const role = await getUserRole(address);
  setRole(role);

  return role;
}
