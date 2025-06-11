'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SuiObjectResponse, SuiParsedData, SuiMoveObject } from '@mysten/sui/client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AidRequestDetails from '@/components/AidRequestDetails';
import SkeletonAidRequest from '@/components/SkeletonAidRequest';
import toast from 'react-hot-toast';
import { useTransactionExecution } from '@/hooks/useTransactionExecution';

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';

interface Request {
  id: string;
  suiObjectId: string | null;
  title: string;
  status: string;
  amount: number;
  totalFunded: number;
  recipientAddress: string;
  description: string;
  mediaCid: string;
  location: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  suiTransactionDigest: string | null;
}

function isSuiCoin(content: SuiParsedData | undefined): content is SuiMoveObject & { fields: { balance: string } } {
  return (
    !!content &&
    content.dataType === 'moveObject' &&
    content.type === '0x2::coin::Coin<0x2::sui::SUI>' &&
    'fields' in content &&
    'balance' in content.fields
  );
}

export default function FundRequestPage() {
  const { objectId } = useParams();
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const executeTransaction = useTransactionExecution();
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch coins for the donor
  const { data: coins } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: currentAccount?.address || '',
      filter: { StructType: '0x2::coin::Coin<0x2::sui::SUI>' },
      options: { showContent: true },
    },
    { enabled: !!currentAccount }
  );

  // Fetch request from Firestore
  useEffect(() => {
    if (!objectId || typeof objectId !== 'string') {
      setLoading(false);
      return;
    }

    const fetchRequest = async () => {
      if (!db) {
        toast.error('Firestore not initialized');
        setLoading(false);
        return;
      }

      try {
        const requestRef = doc(db, 'requests', objectId);
        const requestSnap = await getDoc(requestRef);
        if (requestSnap.exists()) {
          const data = requestSnap.data() as Omit<Request, 'id'>;
          setRequest({ ...data, id: objectId });
        } else {
          toast.error('Request not found');
        }
      } catch (error: any) {
        console.error('Firestore error:', error);
        toast.error('Failed to load request');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [objectId]);

  const handleFund = async () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!objectId || typeof objectId !== 'string') {
      toast.error('Invalid request ID');
      return;
    }

    if (!request?.suiObjectId || !/^0x[0-9a-fA-F]+$/.test(request.suiObjectId)) {
      toast.error('Invalid Sui object ID');
      return;
    }

    if (request.status !== 'Approved') {
      toast.error('Request must be approved to fund');
      return;
    }

    const donationAmount = Number(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    if (donationAmount > request.amount - request.totalFunded) {
      toast.error('Donation exceeds remaining amount needed');
      return;
    }

    if (!coins?.data || coins.data.length === 0) {
      toast.error('No SUI coins available in wallet');
      return;
    }

    if (!PACKAGE_ID) {
      toast.error('Contract configuration missing');
      return;
    }

    if (!db) {
      toast.error('Firestore not initialized');
      setSubmitting(false);
      return;
    }

    setSubmitting(true);

    try {
      // Filter valid coins
      const validCoins = coins.data.filter(
        (coin: SuiObjectResponse): coin is SuiObjectResponse & { data: { objectId: string; content: SuiMoveObject & { fields: { balance: string } } } } =>
          !!coin.data?.objectId && !!coin.data.content && isSuiCoin(coin.data.content)
      );

      if (validCoins.length === 0) {
        throw new Error('No valid SUI coins found in wallet');
      }

      // Select a coin with sufficient balance
      const donationMist = BigInt(donationAmount * 1_000_000_000); // Convert SUI to MIST
      const selectedCoin = validCoins.find((coin) => {
        const balance = BigInt(coin.data.content.fields.balance);
        return balance >= donationMist;
      });

      if (!selectedCoin) {
        throw new Error('No coin with sufficient balance for donation');
      }

      const tx = new Transaction();
      const coinArg = tx.object(selectedCoin.data.objectId);

      // Split coin if necessary
      if (BigInt(selectedCoin.data.content.fields.balance) > donationMist) {
        const [payment] = tx.splitCoins(coinArg, [tx.pure.u64(donationMist)]);
        tx.moveCall({
          target: `${PACKAGE_ID}::aid_request::fund_request`,
          arguments: [tx.object(request.suiObjectId), payment],
        });
      } else {
        tx.moveCall({
          target: `${PACKAGE_ID}::aid_request::fund_request`,
          arguments: [tx.object(request.suiObjectId), coinArg],
        });
      }

      // Log funding event
      tx.moveCall({
        target: `${PACKAGE_ID}::aid_vault::log_funding`,
        arguments: [tx.object(request.suiObjectId), tx.pure.u64(donationMist)],
      });

      const result = await executeTransaction(tx);

      try {
        const requestRef = doc(db, 'requests', objectId);
        const newTotalFunded = request.totalFunded + donationAmount;
        const newStatus = newTotalFunded >= request.amount ? 'Funded' : 'Approved';

        await updateDoc(requestRef, {
          totalFunded: newTotalFunded,
          status: newStatus,
          suiTransactionDigest: result.digest,
          updatedAt: new Date().toISOString(),
        });

        router.push(
          `/fund/success?amount=${donationAmount}&title=${encodeURIComponent(request.title)}`
        );
      } catch (error: any) {
        console.error('Firestore update error:', error);
        toast.error('Failed to update request status');
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast.error(`Transaction failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-900">
        <h1 className="text-2xl font-bold mb-4 text-purple-400">Fund Aid Request</h1>
        <SkeletonAidRequest />
      </div>
    );
  }

  if (!request) {
    return <p className="text-center text-red-400">Request not found.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-purple-400">Fund Aid Request</h1>
      <AidRequestDetails request={request} />

      <label className="block text-sm font-medium text-gray-300 mb-1">
        Amount (SUI)
      </label>
      <input
        type="number"
        placeholder="e.g., 10"
        aria-label="Amount to donate"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-3 py-2 rounded-md border border-gray-700 bg-gray-900 text-gray-100 focus:border-purple-400 focus:ring focus:ring-purple-400/20 mb-4"
        min="0.01"
        step="0.01"
        disabled={submitting}
      />

      <button
        onClick={handleFund}
        disabled={submitting || !currentAccount}
        className={`w-full bg-purple-600 text-white py-2 px-4 rounded-md ${
          submitting || !currentAccount ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
        }`}
      >
        {submitting ? 'Processing...' : 'Fund Now'}
      </button>
    </div>
  );
}