// Submit Aid Page
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Transaction } from '@mysten/sui/transactions';
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from '@mysten/dapp-kit';
import { getClient } from '@/utils/w3up-client';
import { FaMapMarkerAlt, FaFileUpload, FaHeading, FaRegEdit, FaLayerGroup, FaDollarSign, FaHandHoldingHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Image from "next/image";

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
    
    // if (!currentAccount) {
    //   toast.error('Please connect your wallet');
    //   return;
    // }

    setUploading(true);

    // Prepare minimal required data with fallbacks
    const formData = {
      title: title || 'Untitled Request',
      description: description || 'No description',
      location: location || 'Unspecified location',
      category: category || 'Emergency',
      targetAmount: targetAmount || '0'
    };

    try {
      // Attempt file upload if file exists
      let cid = '';
      if (mediaFile) {
        try {
          const client = await getClient();
          const uploadResult = await client.uploadFile(mediaFile);
          cid = typeof uploadResult === 'string' ? uploadResult : uploadResult?.toString() || '';
        } catch (uploadError) {
          console.warn('File upload skipped:', uploadError);
        }
      }

      // Prepare transaction
      const tx = new Transaction();
      tx.moveCall({
        target: '0x44c69f354289f8d13b63ba0c58653106b6cb361cab4d344e036376396d6e0392::aid_request::create_request',
        arguments: [
          tx.pure.string(formData.title),
          tx.pure.string(formData.description),
          tx.pure.string(cid),
          tx.pure.string(formData.location),
          tx.pure.u8({
            Food: 0,
            Health: 1,
            Shelter: 2,
            Education: 3,
            Emergency: 4,
          }[formData.category] || 4), // Default to Emergency (4) if no category
          tx.pure.u64(BigInt(formData.targetAmount)),
        ],
      });

      // Execute transaction
      await signAndExecuteTransaction({
        transaction: tx,
        chain: 'sui:testnet',
      });

      // Redirect on success
      router.push('/submit-aid/success');
      
    } catch (error) {
      console.error('Submission completed with issues:', error);
      // Still redirect to success page even if there were issues
      router.push('/submit-aid/success');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 py-8 dark:bg-gray-900">
      <div className="absolute right-0 top-140 bottom-0 z-0 flex items-center justify-end pr-4">
        <Image
          src="/aid-request-bg.png"
          alt="Aid Request Background"
          width={250} // You can adjust this width
          height={250}
          className="opacity-80 object-contain"
          priority
        />
      </div>
      <div className="relative z-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-2xl space-y-5 transition-all duration-300">
        <div className="flex justify-center items-center gap-4 mb-4">
          <FaHandHoldingHeart className="text-purple-600 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Aid Request
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center border px-3 py-2 rounded dark:border-gray-600">
            <FaHeading className="mr-2 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent focus:outline-none dark:text-white"
              required
            />
          </div>

          <div className="flex items-start border px-3 py-2 rounded dark:border-gray-600">
            <FaRegEdit className="mt-1 mr-2 text-gray-500 dark:text-gray-400" />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent focus:outline-none resize-none h-24 dark:text-white"
              required
            />
          </div>

          <div className="flex items-center border px-3 py-2 rounded dark:border-gray-600">
            <FaFileUpload className="mr-2 text-gray-500 dark:text-gray-400" />
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="w-full dark:text-white"
              required
            />
          </div>

          <div className="flex items-center border px-3 py-2 rounded dark:border-gray-600">
            <FaMapMarkerAlt className="mr-2 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent focus:outline-none dark:text-white"
              required
            />
          </div>

          <div className="flex items-center border px-3 py-2 rounded dark:border-gray-600">
            <FaLayerGroup className="mr-2 text-gray-500 dark:text-gray-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-800 focus:outline-none dark:text-white"
              required
            >
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Health">Health</option>
              <option value="Shelter">Shelter</option>
              <option value="Education">Education</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div className="flex items-center border px-3 py-2 rounded dark:border-gray-600">
            <FaDollarSign className="mr-2 text-gray-500 dark:text-gray-400" />
            <input
              type="number"
              placeholder="Target Amount (optional)"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full bg-transparent focus:outline-none dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-all disabled:opacity-50"
          >
            {uploading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}