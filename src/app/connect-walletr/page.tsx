// src/app/connect-rec-wallet/page.tsx
'use client';

import { useState } from 'react';
import { 
  useSuiClientQuery,
  useCurrentAccount,
  useSignAndExecuteTransaction
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import {
  RiHistoryLine,
  RiArrowRightLine,
  RiEyeLine,
  RiEyeOffLine,
  RiSendPlaneFill,
  RiQrCodeLine,
  RiWallet3Fill,
} from 'react-icons/ri';
import { Spinner } from '@/components/ui/Spinner';
import { useFetchFundedRequests } from '@/hooks/useFetchFundedRequests';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';
import Link from 'next/link';
import { IconConnectWallet } from '@/components/ui/IconConnectWallet';
import { WalletConnect } from '@/components/WalletConnect';

export default function ConnectRecWalletPage() {
  const account = useCurrentAccount();
  const [showBalance, setShowBalance] = useState(false);
  const [activeTab, setActiveTab] = useState<'transfer' | 'receive'>('transfer');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
  const { data: balance, isLoading: isBalanceLoading } = useSuiClientQuery(
    'getBalance',
    { owner: account?.address || '' },
    { enabled: !!account?.address, refetchInterval: 5000 }
  );
  
  const { fundedRequests, isLoading: isFundedRequestsLoading } = useFetchFundedRequests(account?.address);

  const formattedBalance = balance ? 
    (parseInt(balance.totalBalance) / 10**9 ): 
    0;

    const handleTransfer = async () => {
      if (!account) {
        toast.error('Please connect your wallet');
        return;
      }
    
      if (!transferAmount || !recipientAddress) {
        toast.error('Please fill all fields');
        return;
      }
    
      const amount = parseFloat(transferAmount);
      if (amount > formattedBalance) {
        toast.error('Insufficient balance');
        return;
      }
    
      try {
        toast.loading('Processing transfer...');
        
        const tx = new Transaction();
        
        // Convert amount to MIST (1 SUI = 10^9 MIST) and serialize as u64
        const amountInMist = BigInt(Math.floor(amount * 10**9));
        const serializedAmount = tx.pure.u64(amountInMist);
        
        // Serialize recipient address using the new address helper
        const serializedRecipient = tx.pure.address(recipientAddress);
        
        // Split coins with serialized amount
        const [coin] = tx.splitCoins(tx.gas, [serializedAmount]);
        
        // Transfer with serialized objects
        tx.transferObjects([coin], serializedRecipient);
    
        await signAndExecuteTransaction(
          {
            transaction: tx,  // Changed from transactionBlock to transaction
            chain: 'sui:testnet',
          },
          {
            onSuccess: (result) => {
              toast.success(`Transaction successful! Digest: ${result.digest}`);
              setTransferAmount('');
              setRecipientAddress('');
            },
            onError: (error) => {
              toast.error(`Transaction failed: ${error.message}`);
            },
          }
        );
      } catch (error) {
        toast.error('Transaction failed');
        console.error(error);
      } finally {
        toast.dismiss();
      }
    };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      {/* Header with wallet connection */}
      <header className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-purple-400">
          AidLink Wallet
        </h1>
        <div className="flex items-center">
          <IconConnectWallet />
          <div className="ml-5">
            <WalletConnect />
          </div>
        </div>

        {/* {account?.address ? (
          <p>Connected as: {account.address}</p>
        ) : (
          <p>Not connected</p>
        )} */}
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto">
        {/* Wallet Balance Section */}
        {
          <section className="bg-gray-800 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                <RiWallet3Fill className="text-purple-400" />
                Wallet Balance
              </h2>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-gray-400 hover:text-purple-400"
              >
                {showBalance ? (
                  <RiEyeOffLine size={20} />
                ) : (
                  <RiEyeLine size={20} />
                )}
              </button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-gray-400 text-sm">Total Balance</p>
                {isBalanceLoading ? (
                  <Spinner size="md" className="my-2" />
                ) : (
                  <>
                    <p className="text-2xl md:text-3xl font-bold">
                      {showBalance
                        ? `${formattedBalance.toFixed(2)} SUI`
                        : "••••••"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      ≈{" "}
                      {showBalance
                        ? `£${(formattedBalance * 0.5).toFixed(2)}`
                        : "••••••"}
                    </p>
                  </>
                )}
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => setActiveTab("transfer")}
                  className={`flex-1 md:flex-none flex flex-col items-center justify-center gap-1 p-3 rounded-lg ${
                    activeTab === "transfer"
                      ? "bg-purple-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <RiSendPlaneFill className="text-lg" />
                  <span className="text-xs">Transfer</span>
                </button>
                <button
                  onClick={() => setActiveTab("receive")}
                  className={`flex-1 md:flex-none flex flex-col items-center justify-center gap-1 p-3 rounded-lg ${
                    activeTab === "receive"
                      ? "bg-purple-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <RiQrCodeLine className="text-lg" />
                  <span className="text-xs">Receive</span>
                </button>
              </div>
            </div>

            {/* Receive Section */}
            {activeTab === "receive" && account && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 bg-white p-4 mb-4 flex items-center justify-center rounded-lg">
                    <QRCode
                      value={account.address}
                      size={160}
                      level="H"
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                  <p className="text-sm text-gray-300 mb-2">Your SUI Address</p>
                  <div className="bg-gray-800 p-3 rounded-lg text-sm font-mono break-all text-center w-full">
                    {account.address}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(account.address);
                        toast.success("Address copied to clipboard");
                      }}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <RiQrCodeLine /> Copy Address
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: "My SUI Address",
                            text: "Send SUI to this address:",
                            url: account.address,
                          });
                        } else {
                          navigator.clipboard.writeText(account.address);
                          toast.success("Address copied to clipboard");
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <RiSendPlaneFill /> Share
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        }

        {/* Transfer section */}
        {activeTab === "transfer" && (
          <section className="bg-gray-800 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <RiSendPlaneFill className="text-purple-400 text-xl" />
              <h2 className="text-lg md:text-xl font-semibold">
                Transfer Funds
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {/* Transfer form */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full bg-gray-800 rounded-lg p-3 border-none focus:ring-0 text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">
                    Amount (SUI)
                  </label>
                  <div className="flex items-center bg-gray-800 rounded-lg p-3">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-white flex-1"
                    />
                    <button
                      onClick={() =>
                        setTransferAmount(formattedBalance.toFixed(2))
                      }
                      className="text-xs bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded"
                    >
                      MAX
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Balance:{" "}
                    {showBalance
                      ? `${formattedBalance.toFixed(2)} SUI`
                      : "••••••"}
                  </p>
                </div>

                <button
                  onClick={handleTransfer}
                  disabled={!transferAmount || !recipientAddress || !account}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {account ? "Send Transfer" : "Connect Wallet to Transfer"}
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-3 text-purple-300">
                  How to transfer funds
                </h3>
                <ol className="space-y-4">
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                      1
                    </span>
                    <p>
                      {"Enter the recipient's wallet address and the amount of SUI you want to send"}
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                      2
                    </span>
                    <p>
                      Review the transaction details carefully before confirming
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                      3
                    </span>
                    <p>
                      Your wallet will prompt you to approve the transaction
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                      4
                    </span>
                    <p>
                      Wait for the transaction to be confirmed on the blockchain
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </section>
        )}

        {/* Funded Requests History section */}
        <section className="bg-gray-800 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <RiHistoryLine className="text-purple-400 text-xl" />
            <h2 className="text-lg md:text-xl font-semibold">
              Recently Funded Requests
            </h2>
          </div>

          {isFundedRequestsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : fundedRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No funded requests yet</p>
              <p className="text-sm mt-2">
                <Link
                  href="/submit-aid"
                  className="text-purple-400 hover:underline"
                >
                  Create a request
                </Link>{" "}
                to start receiving funds
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-2">Request</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Received</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {fundedRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-gray-700 hover:bg-gray-700/50"
                    >
                      <td className="py-3">{request.title}</td>
                      <td className="py-3">{request.amount} SUI</td>
                      <td className="py-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${request.fundedPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {request.fundedPercent}% funded
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            request.status === "Completed"
                              ? "bg-purple-900 text-purple-300"
                              : request.status === "Pending"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-gray-700"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-purple-400 hover:text-purple-300">
                          <RiArrowRightLine className="text-xl" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}