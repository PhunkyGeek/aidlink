// src/utils/WalletUtils.ts
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/sui/utils';
import CryptoJS from 'crypto-js';

export const generateNewWallet = () => {
  const keypair = new Ed25519Keypair();
  return {
    keypair,
    mnemonic: keypair.getSecretKey(), // Updated method
    address: keypair.getPublicKey().toSuiAddress(),
  };
};

export const encryptKey = (data: string, password: string): string => {
  return CryptoJS.AES.encrypt(data, password).toString();
};

export const decryptKey = (ciphertext: string, password: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, password);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const restoreWalletFromMnemonic = (mnemonic: string) => {
  const keypair = Ed25519Keypair.fromSecretKey(fromBase64(mnemonic));
  return {
    keypair,
    address: keypair.getPublicKey().toSuiAddress(),
  };
};