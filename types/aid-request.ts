import { Timestamp } from 'firebase/firestore';

export interface BaseAidRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  mediaCid?: string;
}

export interface SuiAidRequest extends BaseAidRequest {
  status: number; // Sui numeric status (e.g., 0 = Pending)
}

export interface AidRequest extends BaseAidRequest {
  requestId: string;
  recipientId: string;
  recipientAddress: string;
  amount: number;
  totalFunded: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Funded' | 'Completed' | 'Error';
  suiObjectId: string | null;
  suiTransactionDigest: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  requesterName?: string;
  flagged?: boolean;
}