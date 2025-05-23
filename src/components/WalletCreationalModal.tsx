// src/components/WalletCreationModal.tsx
'use client';

import { useState } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/sui/utils';
import toast from 'react-hot-toast';
import { RiQrCodeLine, RiDownloadLine } from 'react-icons/ri';
import { FaCheckCircle } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import { Modal } from './ui/Modals';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Spinner } from './ui/Spinner';
import { generateNewWallet, restoreWalletFromMnemonic } from '@/utils/WalletUtils';

type WalletCreationStep = 'confirm' | 'show-mnemonic' | 'verify' | 'complete';

interface WalletCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletCreated: (address: string) => void;
}

export function WalletCreationModal({
  isOpen,
  onClose,
  onWalletCreated,
}: WalletCreationModalProps) {
  const [step, setStep] = useState<WalletCreationStep>('confirm');
  const [mnemonic, setMnemonic] = useState('');
  const [manualMnemonic, setManualMnemonic] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWallet = () => {
    setIsCreating(true);
    try {
      const { keypair, mnemonic: generatedMnemonic, address } = generateNewWallet();
      setMnemonic(generatedMnemonic);
      setStep('show-mnemonic');
      sessionStorage.setItem('tempWallet', JSON.stringify({ address }));
    } catch (err) {
      toast.error('Failed to generate wallet');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const confirmMnemonicSaved = () => {
    setStep('verify');
  };

  const verifyMnemonic = () => {
    if (mnemonic === manualMnemonic) {
      const tempWallet = sessionStorage.getItem('tempWallet');
      if (tempWallet) {
        const { address } = JSON.parse(tempWallet);
        onWalletCreated(address);
        setStep('complete');
        sessionStorage.removeItem('tempWallet');
      }
    } else {
      toast.error('Recovery phrase does not match. Please try again.');
    }
  };

  const downloadBackup = () => {
    if (!mnemonic) return;
    
    const element = document.createElement('a');
    const file = new Blob([mnemonic], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'sui-wallet-recovery.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleManualImport = async () => {
    try {
      const { address } = restoreWalletFromMnemonic(manualMnemonic);
      onWalletCreated(address);
      onClose();
    } catch (err) {
      toast.error('Invalid recovery phrase. Please check and try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 'confirm' ? 'No Wallet Detected' :
        step === 'show-mnemonic' ? 'Secure Your Wallet' :
        step === 'verify' ? 'Verify Recovery Phrase' :
        'Wallet Ready!'
      }
    >
      {step === 'confirm' && (
        <div className="space-y-4">
          <p className="text-gray-300">
            We couldn't detect a Sui Wallet extension. Would you like to create a new wallet?
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleCreateWallet}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isCreating}
            >
              {isCreating ? <Spinner size="sm" /> : 'Create New Wallet'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {step === 'show-mnemonic' && mnemonic && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-red-400 font-medium mb-2">IMPORTANT: Save this recovery phrase</p>
            <p className="text-gray-300 mb-4">
              This is the only way to recover your wallet. Store it securely and never share it.
            </p>
            <div className="font-mono bg-gray-900 p-3 rounded text-center text-lg mb-4">
              {mnemonic}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-1 text-sm text-purple-400"
              >
                <RiQrCodeLine /> {showQR ? 'Hide QR' : 'Show QR'}
              </button>
              <button
                onClick={downloadBackup}
                className="flex items-center gap-1 text-sm text-purple-400"
              >
                <RiDownloadLine /> Download
              </button>
            </div>
            {showQR && (
              <div className="mt-4 flex justify-center p-2 bg-white rounded">
                <QRCode
                  value={mnemonic}
                  size={128}
                  level="H"
                />
              </div>
            )}
          </div>
          <Button
            onClick={confirmMnemonicSaved}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            I've Saved My Recovery Phrase
          </Button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <p className="text-gray-300">
            Please enter your recovery phrase to verify you've saved it correctly:
          </p>
          <Input
            value={manualMnemonic}
            onChange={(e) => setManualMnemonic(e.target.value)}
            placeholder="Enter your recovery phrase"
            className="w-full"
          />
          <Button
            onClick={verifyMnemonic}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Verify
          </Button>
          <button
            onClick={handleManualImport}
            className="w-full text-center text-sm text-purple-400 hover:text-purple-300 mt-2"
          >
            Or import existing recovery phrase
          </button>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center space-y-4">
          <div className="text-green-400 flex justify-center">
            <FaCheckCircle size={48} />
          </div>
          <p className="text-lg font-medium">Wallet Setup Complete!</p>
          <p className="text-gray-300">
            Your new wallet is ready to use. You can access it anytime using your recovery phrase.
          </p>
          <Button
            onClick={onClose}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Continue
          </Button>
        </div>
      )}
    </Modal>
  );
}