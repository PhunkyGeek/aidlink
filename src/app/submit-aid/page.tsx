'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Transaction, Commands, BuildTransactionOptions, TransactionDataBuilder } from '@mysten/sui/transactions';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getClient } from '@/utils/w3up-client';
import { FaMapMarkerAlt, FaFileUpload, FaHeading, FaRegEdit, FaLayerGroup, FaDollarSign, FaHandHoldingHeart } from 'react-icons/fa';
import Image from 'next/image';
import toast from 'react-hot-toast';

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';

// Simple object cache plugin for transaction building
const objectCache = new Map<string, { objectId: string; version: string; digest: string }>();
function objectCachePlugin(
  transactionData: TransactionDataBuilder,
  _options: BuildTransactionOptions,
  next: () => Promise<void>,
) {
  for (const input of transactionData.inputs) {
    if (!input.UnresolvedObject) continue;

    const cached = objectCache.get(input.UnresolvedObject.objectId);
    if (!cached) continue;

    if (cached.version && !input.UnresolvedObject.version) {
      input.UnresolvedObject.version = cached.version;
    }

    if (cached.digest && !input.UnresolvedObject.digest) {
      input.UnresolvedObject.digest = cached.digest;
    }
  }

  return next();
}

export default function SubmitAidPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAccount) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (!mediaFile) {
      toast.error('Media file is required');
      return;
    }

    if (!location.trim()) {
      toast.error('Location is required');
      return;
    }

    if (!category || !['Food', 'Health', 'Shelter', 'Education', 'Emergency'].includes(category)) {
      toast.error('Valid category is required');
      return;
    }

    const targetAmountNum = Number(targetAmount);
    if (targetAmount && (isNaN(targetAmountNum) || targetAmountNum < 0)) {
      toast.error('Valid target amount is required');
      return;
    }

    if (!PACKAGE_ID) {
      toast.error('Contract configuration missing');
      return;
    }

    setUploading(true);

    try {
      // Upload file to Web3.Storage
      let cid = '';
      try {
        const client = await getClient();
        const uploadResult = await client.uploadFile(mediaFile);
        cid = uploadResult?.toString() || '';
      } catch (uploadError: any) {
        console.error('File upload failed:', uploadError);
        toast.error('Media upload failed, proceeding without media');
      }

      // Prepare transaction
      const tx = new Transaction();
      tx.addBuildPlugin(objectCachePlugin);

      const categoryMap: Record<string, number> = {
        Food: 0,
        Health: 1,
        Shelter: 2,
        Education: 3,
        Emergency: 4,
      };

      tx.add(Commands.MoveCall({
        target: `${PACKAGE_ID}::aid_request::create_request`,
        arguments: [
          tx.pure.string(title.trim()),
          tx.pure.string(description.trim()),
          tx.pure.string(cid),
          tx.pure.string(location.trim()),
          tx.pure.u8(categoryMap[category]),
          tx.pure.u64(BigInt(targetAmountNum * 1_000_000_000 || 0)), // Convert SUI to MIST
        ],
      }));

      signAndExecuteTransaction(
        {
          transaction: tx as any, // Temporary cast to bypass TS2322; remove after dependency fix
          chain: 'sui:testnet',
          account: currentAccount,
        },
        {
          onSuccess: () => {
            toast.success('Aid request submitted successfully!');
            router.push('/submit-aid/success');
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            toast.error('Submission failed: ' + error.message);
            // router.push('/submit-aid/success');
          },
          onSettled: () => setUploading(false),
        }
      );
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error('Submission failed: ' + error.message);
      // router.push('/submit-aid/success');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 py-8 dark:bg-gray-900">
      <div className="absolute right-0 top-140 bottom-0 z-0 flex items-center justify-end pr-4">
        <Image
          src="/aid-request-bg.png"
          alt="Aid Request Background"
          width={250}
          height={250}
          className="opacity-80 object-contain"
          priority
        />
      </div>
      <div className="relative z-10 bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-2xl space-y-5 transition-all duration-300">
        <div className="flex justify-center items-center gap-4 mb-4">
          <FaHandHoldingHeart className="text-purple-600 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-100">
            Create Aid Request
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center border border-gray-700 px-3 py-2 rounded">
            <FaHeading className="mr-2 text-gray-400" />
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-gray-100"
              required
            />
          </div>

          <div className="flex items-start border border-gray-700 px-3 py-2 rounded">
            <FaRegEdit className="mt-1 mr-2 text-gray-400" />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent focus:outline-none resize-none h-24 text-gray-100"
              required
            />
          </div>

          <div className="flex items-center border border-gray-700 px-3 py-2 rounded">
            <FaFileUpload className="mr-2 text-gray-400" />
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="w-full text-gray-100"
              required
            />
          </div>

          <div className="flex items-center border border-gray-700 px-3 py-2 rounded">
            <FaMapMarkerAlt className="mr-2 text-gray-400" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-gray-100"
              required
            />
          </div>

          <div className="flex items-center border border-gray-700 px-3 py-2 rounded">
            <FaLayerGroup className="mr-2 text-gray-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent text-gray-100 focus:outline-none"
              required
            >
              <option value="" className="text-gray-100 bg-gray-400">Select Category</option>
              <option value="Food">Food</option>
              <option value="Health">Healthcare</option>
              <option value="Shelter">Shelter</option>
              <option value="Education">Education</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div className="flex items-center border border-gray-700 px-3 py-2 rounded">
            <FaDollarSign className="mr-2 text-gray-400" />
            <input
              type="number"
              placeholder="Target Amount (SUI)"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-gray-100"
              min="0"
              step="0.01"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !currentAccount}
            className={`w-full bg-purple-600 text-white font-semibold py-2 rounded transition-all ${
              uploading || !currentAccount ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
            }`}
          >
            {uploading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}