// types/aid-request.ts

export type AidRequest = {
  id: string;
  title: string;
  location?: string;
  category?: string;
  description?: string;
  mediaCid?: string;
  requesterName?: string;
  status?: number;
  fundedAmount?: number;
  createdAt?: { seconds: number; nanoseconds: number };
  flagged?: boolean;
};
