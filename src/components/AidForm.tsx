// ✅ components/AidForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

const AidSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  amount: z.number().positive(),
  latitude: z.number(),
  longitude: z.number(),
});

type AidFormData = z.infer<typeof AidSchema>;

interface AidFormProps {
  onSubmitAid: (data: AidFormData) => void;
}

export default function AidForm({ onSubmitAid }: AidFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AidFormData>({ resolver: zodResolver(AidSchema) });

  const [locationSet, setLocationSet] = useState(false);

  const onLocationSelect = (lat: number, lng: number) => {
    setValue('latitude', lat);
    setValue('longitude', lng);
    setLocationSet(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitAid)} className="space-y-4">
      <input {...register('title')} placeholder="Title" className="w-full border p-2 rounded" />
      {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}

      <textarea {...register('description')} placeholder="Description" className="w-full border p-2 rounded" />
      {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}

      <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} placeholder="Amount (SUI)" className="w-full border p-2 rounded" />
      {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}

      <p className="font-semibold">Select Location on Map:</p>
      <div className="border rounded">
        <MapSelector onLocationSelect={onLocationSelect} />
      </div>
      {!locationSet && <p className="text-yellow-500 text-sm">Location is required</p>}

      <button type="submit" className="bg-black text-white px-4 py-2 rounded">
        Submit Aid Request
      </button>
    </form>
  );
}

import dynamic from 'next/dynamic';
const MapSelector = dynamic(() => import('./MapSelector'), { ssr: false });
