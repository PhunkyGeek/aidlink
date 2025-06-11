'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { getClient } from '@/utils/w3up-client';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaFileUpload, FaHeading, FaRegEdit, FaLayerGroup, FaDollarSign, FaHandHoldingHeart } from 'react-icons/fa';
import Image from 'next/image';
import { useUserStore } from '@/store/useUserStore';

export default function SubmitAidPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { id, role } = useUserStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [uploading, setUploading] = useState(false);

  // Validate authentication and role
  useEffect(() => {
    if (!auth || !db) {
      toast.error('Firebase not initialized');
      return;
    }

    if (!id || !currentAccount || role !== 'recipient') {
      toast.error('Please connect a wallet');
      return;
    }
  }, [id, currentAccount, role, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.match(/image\/.*|video\/.*/)) {
        toast.error('Only images or videos are allowed');
        return;
      }
      setMediaFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAccount || !id || role !== 'recipient' || !db || !auth) {
      toast.error('Please connect your wallet as a recipient');
      return;
    }

    if (!title.trim() || !description.trim() || !mediaFile || !location.trim() || !category || !targetAmount) {
      toast.error('All fields are required');
      return;
    }

    const targetAmountNum = Number(targetAmount);
    if (isNaN(targetAmountNum) || targetAmountNum <= 0 || targetAmountNum > 1_000_000) {
      toast.error('Target amount must be between 0.01 and 1,000,000 SUI');
      return;
    }

    if (!['Food', 'Healthcare', 'Shelter', 'Education', 'Emergency'].includes(category)) {
      toast.error('Valid category is required');
      return;
    }

    setUploading(true);
    const requestId = uuidv4();

    try {
      // Upload media to Web3.Storage
      let cid = null;
      try {
        const client = await getClient();
        const uploadResult = await client.uploadFile(mediaFile);
        cid = uploadResult?.toString() || null;
      } catch (uploadError) {
        console.error('File upload failed:', uploadError);
        toast.error('Media upload failed, proceeding without media');
      }

      // Create request in Firestore
      const requestRef = doc(db, 'requests', requestId);
      const requestData = {
        requestId,
        recipientId: id,
        recipientAddress: currentAccount.address,
        title: title.trim(),
        description: description.trim(),
        mediaCid: cid,
        location: location.trim(),
        category,
        amount: targetAmountNum,
        totalFunded: 0,
        status: 'Pending',
        suiObjectId: null,
        suiTransactionDigest: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(requestRef, requestData);

      toast.success('Aid request submitted successfully!');
      router.push('/submit-aid/success');
    } catch (error: any) {
      console.error('Submission error:', error);
      try {
        await setDoc(doc(db, 'requests', requestId), { status: 'Error', updatedAt: new Date().toISOString() }, { merge: true });
      } catch (setError) {
        console.error('Failed to update request status:', setError);
      }
      toast.error('Submission failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 py-8 dark:bg-gray-900">
      <div className="absolute right-4 top-4 bottom-0 z-0 flex items-center justify-end">
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
        <div className="flex justify-center items-center gap-4 mb-6">
          <FaHandHoldingHeart className="text-purple-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-100">
            Create Aid Request
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center border border-gray-600 px-3 py-2 rounded-lg">
            <FaHeading className="mr-2 text-gray-400" />
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-gray-100 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-start border border-gray-600 px-3 py-2 rounded-lg">
            <FaRegEdit className="mt-1 mr-4 text-gray-400" />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-gray-100 focus:outline-none resize-none h-24"
              required
            />
          </div>

          <div className="flex items-center border border-gray-600 px-3 py-2 rounded-lg">
            <FaFileUpload className="mr-4 text-gray-400" />
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="w-full text-gray-100 text-sm"
              required
            />
          </div>

          <div className="flex items-center border border-gray-600 px-3 py-2 rounded-lg">
            <FaMapMarkerAlt className="mr-4 text-gray-400" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent text-gray-100 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center border border-gray-600 px-3 py-2 rounded-lg">
            <FaLayerGroup className="mr-4 text-gray-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-800 text-gray-100 focus:outline-none"
              required
            >
              <option value="" className="text-gray-400">
                Select Category
              </option>
              <option value="Food">Food</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Shelter">Shelter</option>
              <option value="Education">Education</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div className="flex items-center border border-gray-600 px-3 py-2 rounded-lg">
            <FaDollarSign className="mr-4 text-gray-400" />
            <input
              type="number"
              placeholder="Target Amount (SUI)"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full bg-transparent text-gray-100 focus:outline-none"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !currentAccount || role !== "recipient"}
            className={`w-full bg-purple-600 text-white font-semibold py-2 rounded-lg transition-all duration-200 ${
              uploading || !currentAccount || role !== "recipient"
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-purple-700"
            }`}
          >
            {uploading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}