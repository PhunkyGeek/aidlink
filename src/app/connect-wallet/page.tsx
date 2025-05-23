// src/app/connect-wallet/page.tsx
'use client';

import { useState } from 'react';
import { useSuiClientQuery } from '@mysten/dapp-kit';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserStore } from '@/store/useUserStore';
import {
  RiExchangeLine,
  RiHistoryLine,
  RiArrowRightLine,
  RiEyeLine,
  RiEyeOffLine,
  RiSendPlaneFill,
  RiQrCodeLine,
  RiWallet3Fill,
} from 'react-icons/ri';
import { WalletConnect } from '@/components/WalletConnect';
import { Spinner } from '@/components/ui/Spinner';
import { useFetchRequests } from '@/hooks/useFetchRequest';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';
import { IconConnectWallet } from '@/components/ui/IconConnectWallet';

export default function ConnectWalletPage() {
  const account = useCurrentAccount();
  const [showBalance, setShowBalance] = useState(false);
  const [activeTab, setActiveTab] = useState<'fund' | 'receive'>('fund');
  const { data: balance, isLoading: isBalanceLoading } = useSuiClientQuery(
    'getBalance',
    { owner: account?.address || '' },
    { enabled: !!account?.address, refetchInterval: 5000 }
  );
  const { requests, isLoading: isRequestsLoading } = useFetchRequests();

  const formattedBalance = balance ? 
    (parseInt(balance.totalBalance) / 10**9).toFixed(2) : 
    '0.00';

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
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto">
        {/* Wallet Balance Section - Only shown when wallet is connected */}
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
                      {showBalance ? `${formattedBalance} SUI` : "••••••"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      ≈{" "}
                      {showBalance
                        ? `£${(parseFloat(formattedBalance) * 0.5).toFixed(2)}`
                        : "••••••"}
                    </p>
                  </>
                )}
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => setActiveTab("fund")}
                  className={`flex-1 md:flex-none flex flex-col items-center justify-center gap-1 p-3 rounded-lg ${
                    activeTab === "fund"
                      ? "bg-purple-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <RiSendPlaneFill className="text-lg" />
                  <span className="text-xs">Fund</span>
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
                  <div className="w-32 h-32 bg-white mb-4 flex items-center justify-center rounded">
                    <QRCode value={account.address} size={128} level="H" />
                  </div>
                  <p className="text-sm text-gray-300 mb-2">Your SUI Address</p>
                  <div className="bg-gray-800 p-2 rounded text-sm font-mono break-all text-center">
                    {account.address}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(account.address);
                      toast.success("Address copied to clipboard");
                    }}
                    className="mt-3 text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                  >
                    Copy Address
                  </button>
                </div>
              </div>
            )}
          </section>
        }

        {/* Fund Request section */}
        {activeTab === "fund" && (
          <section className="bg-gray-800 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <RiExchangeLine className="text-purple-400 text-xl" />
              <h2 className="text-lg md:text-xl font-semibold">
                Fund a Request
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {/* Fund form */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">
                    Send
                  </label>
                  <div className="flex items-center bg-gray-800 rounded-lg p-3">
                    <select className="bg-gray-800 border-none focus:ring-0 text-white mr-2">
                      <option>SUI</option>
                      <option>BTC</option>
                      <option>ETH</option>
                      <option>USDT</option>
                    </select>
                    <input
                      type="text"
                      placeholder="0.00"
                      className="bg-transparent border-none focus:ring-0 text-white text-right flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Balance:{" "}
                    {showBalance ? `${formattedBalance} SUI` : "••••••"}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">
                    Select Request
                  </label>
                  <div className="flex items-center bg-gray-800 rounded-lg p-3">
                    <select className="bg-gray-800 border-none focus:ring-0 text-white mr-2 flex-1">
                      <option>Select Request</option>
                      {requests.map((request) => (
                        <option key={request.id} value={request.id}>
                          {request.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4 text-sm text-gray-400">
                  <p>Network Fee Min-Max</p>
                  <p>0.0000... - 0.46907/17 SUI</p>
                </div>

                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition">
                  Review
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-3 text-purple-300">
                  How to fund a request
                </h3>
                <ol className="space-y-4">
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                      1
                    </span>
                    <p>
                      Choose the request you want to fund and the cryptocurrency
                      you want to use, enter the amount, then select "review"
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                      2
                    </span>
                    <p>Send the required amount to the provider's address</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                      3
                    </span>
                    <p>
                      You will receive confirmation once the funds have been
                      allocated to the request
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </section>
        )}

        {/* Popular Requests section */}
        <section className="bg-gray-800 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <RiHistoryLine className="text-purple-400 text-xl" />
            <h2 className="text-lg md:text-xl font-semibold">
              Popular Requests
            </h2>
          </div>

          {isRequestsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-2">Request</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Funded</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-gray-700 hover:bg-gray-700/50"
                    >
                      <td className="py-3">{request.title}</td>
                      <td className="py-3">{request.amount}</td>
                      <td className="py-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: request.funded }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {request.funded}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="bg-gray-700 text-xs px-2 py-1 rounded">
                          {request.category}
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