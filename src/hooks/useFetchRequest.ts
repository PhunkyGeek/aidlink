// src/hooks/useFetchRequests.ts
import { useState, useEffect } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';

interface Request {
  id: string;
  title: string;
  amount: string;
  funded: string;
  category: string;
}

export function useFetchRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const suiClient = useSuiClient();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        // Replace with actual Sui chain query for requests
        // const result = await suiClient.queryEvents({...});
        
        // Mock data - replace with real data from chain
        const mockRequests: Request[] = [
          { id: '1', title: "Medical Supplies for Clinic", amount: "£2,500", funded: "65%", category: "Healthcare" },
          { id: '2', title: "School Renovation Project", amount: "£5,800", funded: "42%", category: "Education" },
          { id: '3', title: "Emergency Food Relief", amount: "£5,000", funded: "0%", category: "Food" },
        ];
        
        setRequests(mockRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [suiClient]);

  return { requests, isLoading };
}