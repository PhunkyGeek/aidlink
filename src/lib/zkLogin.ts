import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SerialTransactionExecutor, Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI, fromBase64 } from '@mysten/sui/utils';
import {
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  getZkLoginSignature,
  genAddressSeed,
  jwtToAddress,
} from '@mysten/sui/zklogin';
import axios from 'axios';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { useUserStore } from '@/store/useUserStore';
import { getUserRole, Role } from '@/utils/getUserRole';

const FULLNODE_URL = 'https://fullnode.testnet.sui.io:443'; // Hardcoded Testnet fullnode
const FAUCET_URL = process.env.NEXT_PUBLIC_SUI_FAUCET_URL || 'https://faucet.testnet.sui.io/v2/gas';
const PROVER_URL = process.env.NEXT_PUBLIC_SUI_PROVER_URL || 'https://prover-dev.mystenlabs.com/v1';
const CLIENT_ID = process.env.NEXT_PUBLIC_ZKLOGIN_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_ZKLOGIN_REDIRECT_URI || 'http://localhost:3000/auth/zklogin/callback';
const KEY_PAIR_SESSION_STORAGE_KEY = 'zk_ephemeral_key_pair';
const USER_SALT_LOCAL_STORAGE_KEY = 'zk_salt';
const RANDOMNESS_SESSION_STORAGE_KEY = 'zk_randomness';
const MAX_EPOCH_LOCAL_STORAGE_KEY = 'zk_max_epoch';

const suiClient = new SuiClient({ url: FULLNODE_URL });

export interface ZkLoginSession {
  ephemeralKeyPair: Ed25519Keypair;
  maxEpoch: number;
  randomness: string;
  userSalt: string;
  zkProof?: PartialZkLoginSignature;
  address?: string;
}

export type PartialZkLoginSignature = Omit<
  Parameters<typeof getZkLoginSignature>['0']['inputs'],
  'addressSeed'
>;

/**
 * Initiates zkLogin by generating an ephemeral key pair, nonce, and redirecting to the OAuth provider.
 */
export async function initiateZkLogin(): Promise<void> {
  try {
    // Validate environment variables
    if (!CLIENT_ID) {
      throw new Error('Missing NEXT_PUBLIC_ZKLOGIN_CLIENT_ID in environment variables');
    }
    if (!REDIRECT_URI) {
      throw new Error('Missing NEXT_PUBLIC_ZKLOGIN_REDIRECT_URI in environment variables');
    }

    // Generate ephemeral key pair
    const ephemeralKeyPair = Ed25519Keypair.generate();
    const randomness = generateRandomness();
    const { epoch } = await suiClient.getLatestSuiSystemState();
    const maxEpoch = Number(epoch) + 2;

    // Generate nonce
    const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);

    // Store in sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(KEY_PAIR_SESSION_STORAGE_KEY, Buffer.from(ephemeralKeyPair.getSecretKey()).toString('base64'));
      sessionStorage.setItem(RANDOMNESS_SESSION_STORAGE_KEY, randomness);
      localStorage.setItem(MAX_EPOCH_LOCAL_STORAGE_KEY, maxEpoch.toString());
    }

    // Construct OAuth URL
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'id_token',
      scope: 'openid',
      nonce,
    });
    const loginURL = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    loginURL.search = params.toString();

    // Log URL for debugging (remove in production)
    console.debug('zkLogin OAuth URL:', loginURL.toString());

    // Perform redirect
    window.location.assign(loginURL.toString());
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to initiate zkLogin: ${errorMessage}`);
  }
}

/**
 * Generates or retrieves user salt (client-side for demo; use backend service in production).
 */
export async function getUserSalt(): Promise<string> {
  if (typeof window !== 'undefined') {
    let salt = localStorage.getItem(USER_SALT_LOCAL_STORAGE_KEY);
    if (!salt) {
      salt = generateRandomness();
      localStorage.setItem(USER_SALT_LOCAL_STORAGE_KEY, salt);
    }
    return salt;
  }
  throw new Error('User salt generation not supported in this environment');
}

/**
 * Fetches ZK proof from the proving service.
 */
export async function getZkProof({
  jwt,
  ephemeralKeyPair,
  maxEpoch,
  randomness,
  userSalt,
}: {
  jwt: string;
  ephemeralKeyPair: Ed25519Keypair;
  maxEpoch: number;
  randomness: string;
  userSalt: string;
}): Promise<PartialZkLoginSignature> {
  try {
    const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(ephemeralKeyPair.getPublicKey());
    const response = await axios.post(PROVER_URL, {
      jwt,
      extendedEphemeralPublicKey,
      maxEpoch: maxEpoch.toString(),
      jwtRandomness: randomness,
      salt: userSalt,
      keyClaimName: 'sub',
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data as PartialZkLoginSignature;
  } catch (error) {
    throw new Error(`Failed to fetch ZK proof: ${String(error)}`);
  }
}

/**
 * Handles zkLogin callback, derives address, fetches ZK proof, and updates user store.
 */
export async function handleZkLoginCallback({
  idToken,
  redirect = '/',
}: {
  idToken: string;
  redirect?: string;
}): Promise<Role> {
  try {
    if (!idToken) throw new Error('Missing id_token in callback');

    // Decode JWT
    const decodedJwt = jwtDecode<JwtPayload>(idToken);
    if (!decodedJwt.sub || !decodedJwt.aud) throw new Error('Invalid JWT payload');

    // Retrieve session data
    const privateKey = sessionStorage.getItem(KEY_PAIR_SESSION_STORAGE_KEY);
    const randomness = sessionStorage.getItem(RANDOMNESS_SESSION_STORAGE_KEY);
    const maxEpoch = localStorage.getItem(MAX_EPOCH_LOCAL_STORAGE_KEY);
    if (!privateKey || !randomness || !maxEpoch) {
      throw new Error('Missing session data. Please initiate zkLogin again.');
    }

    const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(fromBase64(privateKey));
    const userSalt = await getUserSalt();

    // Derive address
    const address = jwtToAddress(idToken, userSalt);

    // Fetch ZK proof
    const zkProof = await getZkProof({
      jwt: idToken,
      ephemeralKeyPair,
      maxEpoch: Number(maxEpoch),
      randomness,
      userSalt,
    });

    // Store in sessionStorage for transaction signing
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('zk_proof', JSON.stringify(zkProof));
      localStorage.setItem('zk_token', idToken);
      localStorage.setItem('zk_address', address);
    }

    // Update user store
    const { setAddress, setRole } = useUserStore.getState();
    setAddress(address);
    const role = await getUserRole(address);
    setRole(role);

    return role;
  } catch (error) {
    throw new Error(`ZkLogin callback failed: ${String(error)}`);
  }
}

/**
 * Signs and executes a transaction using zkLogin with SerialTransactionExecutor.
 */
export async function executeZkLoginTransaction(): Promise<string> {
  try {
    const privateKey = sessionStorage.getItem(KEY_PAIR_SESSION_STORAGE_KEY);
    const zkProofStr = sessionStorage.getItem('zk_proof');
    const idToken = localStorage.getItem('zk_token');
    const userSalt = localStorage.getItem('zk_salt');
    const maxEpoch = localStorage.getItem(MAX_EPOCH_LOCAL_STORAGE_KEY);
    const address = localStorage.getItem('zk_address');

    if (!privateKey || !zkProofStr || !idToken || !userSalt || !maxEpoch || !address) {
      throw new Error('Missing zkLogin session data');
    }

    const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(fromBase64(privateKey));
    const zkProof = JSON.parse(zkProofStr) as PartialZkLoginSignature;
    const decodedJwt = jwtDecode<JwtPayload>(idToken);

    // Use SerialTransactionExecutor to build the transaction
    const executor = new SerialTransactionExecutor({
      client: suiClient,
      signer: ephemeralKeyPair,
    });

    const txb = new Transaction();
    const [coin] = txb.splitCoins(txb.gas, [MIST_PER_SUI * BigInt(1)]);
    txb.transferObjects([coin], '0xfa0f8542f256e669694624aa3ee7bfbde5af54641646a3a05924cf9e329a8a36');
    txb.setSender(address);

    // Sign the transaction to get userSignature
    const { signature: userSignature } = await txb.sign({ client: suiClient, signer: ephemeralKeyPair });

    // Build the transaction to get serialized bytes
    const transactionBytes = await txb.build({ client: suiClient });

    // Construct zkLogin signature
    const addressSeed = genAddressSeed(BigInt(userSalt), 'sub', decodedJwt.sub!, decodedJwt.aud as string).toString();
    const zkLoginSignature = getZkLoginSignature({
      inputs: { ...zkProof, addressSeed },
      maxEpoch: Number(maxEpoch),
      userSignature,
    });

    // Execute the transaction using SuiClient
    const { digest } = await suiClient.executeTransactionBlock({
      transactionBlock: transactionBytes,
      signature: zkLoginSignature,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    return digest;
  } catch (error) {
    throw new Error(`Transaction execution failed: ${String(error)}`);
  }
}

/**
 * Requests test SUI tokens from the faucet.
 */
export async function requestFaucet(address: string): Promise<void> {
  try {
    // Validate faucet URL
    if (!FAUCET_URL.endsWith('/gas')) {
      throw new Error(`Invalid faucet URL: ${FAUCET_URL}. Must end with '/gas'`);
    }

    const response = await axios.post(FAUCET_URL, {
      FixedAmountRequest: { recipient: address },
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status !== 200) {
      throw new Error(`Faucet request failed with status ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Faucet request failed: ${errorMessage}`);
  }
}