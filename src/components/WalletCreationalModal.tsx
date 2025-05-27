'use client';

import { useState, useEffect } from 'react';
// import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import toast from 'react-hot-toast';
import { RiQrCodeLine, RiDownloadLine, RiClipboardLine } from 'react-icons/ri';
import { FaCheckCircle } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import { Modal } from './ui/Modals';
import { Button } from './ui/Button';
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
  const [mnemonicError, setMnemonicError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCreateWallet = () => {
    setIsCreating(true);
    try {
      const { mnemonic: generatedMnemonic, address } = generateNewWallet();
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
    const trimmedMnemonic = manualMnemonic.trim();
    if (mnemonic === trimmedMnemonic) {
      const tempWallet = sessionStorage.getItem('tempWallet');
      if (tempWallet) {
        const { address } = JSON.parse(tempWallet);
        onWalletCreated(address);
        setStep('complete');
        sessionStorage.removeItem('tempWallet');
      }
    } else {
      toast.error('Recovery phrase does not match. Please try again.');
      setMnemonicError('Incorrect recovery phrase');
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

  const handleCopyMnemonic = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      setIsCopied(true);
      toast.success('Recovery phrase copied!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy recovery phrase');
      console.error(err);
    }
  };

  const handleManualImport = async () => {
    const trimmedMnemonic = manualMnemonic.trim();
    try {
      const { address } = restoreWalletFromMnemonic(trimmedMnemonic);
      onWalletCreated(address);
      onClose();
    } catch (err) {
      toast.error('Invalid recovery phrase or private key. Please check and try again.');
      setMnemonicError('Invalid recovery phrase or private key');
    }
  };

  const validateMnemonicInput = (value: string) => {
    const trimmed = value.trim();
    setManualMnemonic(trimmed);
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    // Allow single-string private keys or 12/24-word mnemonics
    if (trimmed && wordCount !== 1 && wordCount !== 12 && wordCount !== 24) {
      setMnemonicError('Input must be a private key or 12/24-word recovery phrase');
    } else {
      setMnemonicError(null);
    }
  };

  // Reset state on modal close
  useEffect(() => {
    if (!isOpen) {
      setStep('confirm');
      setMnemonic('');
      setManualMnemonic('');
      setMnemonicError(null);
      setShowQR(false);
      setIsCopied(false);
      sessionStorage.removeItem('tempWallet');
    }
  }, [isOpen]);

  // Check if mnemonic is a private key (single string without spaces)
  const isPrivateKey = mnemonic && !mnemonic.includes(' ');

  return (
    <div className="max-w-sm sm:max-w-md w-full mx-4">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          step === 'confirm'
            ? 'No Wallet Detected'
            : step === 'show-mnemonic'
            ? isPrivateKey
              ? 'Secure Your Private Key'
              : 'Secure Your Wallet'
            : step === 'verify'
            ? 'Verify Recovery Phrase or Private Key'
            : 'Wallet Ready!'
        }
      >
        <div className="overflow-y-auto max-h-[80vh] p-4">
          {step === 'confirm' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm sm:text-base">
                {"We couldn’t detect a Sui Wallet extension. Would you like to create a new wallet?"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleCreateWallet}
                  className="bg-purple-600 hover:bg-purple-700 flex-1"
                  disabled={isCreating}
                  aria-label="Create new wallet"
                >
                  {isCreating ? <Spinner size="sm" /> : 'Create New Wallet'}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  aria-label="Cancel wallet creation"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === 'show-mnemonic' && mnemonic && (
            <div className="space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-red-400 font-medium mb-2 text-sm sm:text-base">
                  IMPORTANT: Save this {isPrivateKey ? 'private key' : 'recovery phrase'}
                </p>
                <p className="text-gray-300 mb-4 text-sm sm:text-base">
                  This is the only way to recover your wallet. Store it securely and never share it.
                </p>
                <div className="bg-gray-900 p-3 rounded mb-4 overflow-x-hidden">
                  {isPrivateKey ? (
                    <div
                      className="font-mono text-sm text-gray-200 break-all bg-gray-800 px-2 py-1 rounded"
                      title={mnemonic}
                    >
                      {mnemonic}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-sm text-gray-200">
                      {mnemonic.split(' ').map((word, index) => (
                        <div
                          key={index}
                          className="bg-gray-800 px-2 py-1 rounded text-center"
                        >
                          {index + 1}. {word}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                    aria-label={showQR ? 'Hide QR code' : 'Show QR code'}
                  >
                    <RiQrCodeLine /> {showQR ? 'Hide QR' : 'Show QR'}
                  </button>
                  <button
                    onClick={handleCopyMnemonic}
                    className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                    aria-label="Copy recovery phrase or private key"
                  >
                    {isCopied ? <FaCheckCircle /> : <RiClipboardLine />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={downloadBackup}
                    className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                    aria-label="Download recovery phrase or private key"
                  >
                    <RiDownloadLine /> Download
                  </button>
                </div>
                {showQR && (
                  <div className="mt-4 flex justify-center p-4 bg-white rounded-lg">
                    <QRCode value={mnemonic} size={128} level="H" />
                  </div>
                )}
              </div>
              <Button
                onClick={confirmMnemonicSaved}
                className="w-full bg-purple-600 hover:bg-purple-700"
                aria-label="Confirm recovery phrase or private key saved"
              >
                {"I’ve Saved My"} {isPrivateKey ? 'Private Key' : 'Recovery Phrase'}
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm sm:text-base">
                Please enter your {isPrivateKey ? 'private key' : 'recovery phrase'} {"to verify you’ve saved it correctly"}:
              </p>
              <div className="space-y-2">
                <textarea
                  value={manualMnemonic}
                  onChange={(e) => validateMnemonicInput(e.target.value)}
                  placeholder={`Enter your ${isPrivateKey ? 'private key' : 'recovery phrase (12 or 24 words)'}`}
                  className="w-full h-24 resize-none bg-gray-900 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  aria-invalid={!!mnemonicError}
                  aria-describedby={mnemonicError ? 'mnemonic-error' : undefined}
                />
                {mnemonicError && (
                  <p id="mnemonic-error" className="text-red-400 text-sm">
                    {mnemonicError}
                  </p>
                )}
              </div>
              <Button
                onClick={verifyMnemonic}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={!!mnemonicError || !manualMnemonic}
                aria-label="Verify recovery phrase or private key"
              >
                Verify
              </Button>
              <Button
                onClick={handleManualImport}
                variant="outline"
                className="w-full"
                disabled={!!mnemonicError || !manualMnemonic}
                aria-label="Import existing recovery phrase or private key"
              >
                Import Existing {isPrivateKey ? 'Private Key' : 'Recovery Phrase'}
              </Button>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center space-y-4">
              <div className="text-green-400 flex justify-center">
                <FaCheckCircle size={48} />
              </div>
              <p className="text-lg font-medium">Wallet Setup Complete!</p>
              <p className="text-gray-300 text-sm sm:text-base">
                Your new wallet is ready to use. You can access it anytime using your {isPrivateKey ? 'private key' : 'recovery phrase'}.
              </p>
              <Button
                onClick={onClose}
                className="w-full bg-purple-600 hover:bg-purple-700"
                aria-label="Continue to app"
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}