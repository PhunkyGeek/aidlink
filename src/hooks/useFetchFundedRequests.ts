// src/hooks/useFetchFundedRequests.ts
import { useState, useEffect } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';

interface FundedRequest {
  id: string;
  title: string;
  amount: string;
  fundedPercent: number;
  status: 'Pending' | 'Partially Funded' | 'Completed' | 'Withdrawn';
  timestamp: string;
  category: string;
}

export function useFetchFundedRequests(recipientAddress?: string) {
  const [fundedRequests, setFundedRequests] = useState<FundedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const suiClient = useSuiClient();

  useEffect(() => {
    const fetchFundedRequests = async () => {
      try {
        setIsLoading(true);
        
        if (!recipientAddress) {
          setFundedRequests([]);
          return;
        }

        // Replace with actual Sui chain query for recipient's funded requests
        // This would query your smart contract for requests associated with this address
        // const result = await suiClient.queryEvents({
        //   query: {
        //     MoveEventType: 'your_package::your_module::RequestCreated',
        //     Sender: recipientAddress
        //   }
        // });
        
        // Mock data - replace with real data from chain
        const mockFundedRequests: FundedRequest[] = [
          { 
            id: '1', 
            title: "Medical Supplies for Clinic", 
            amount: "2500 SUI", 
            fundedPercent: 100, 
            status: "Completed", 
            timestamp: "2023-10-15", 
            category: "Healthcare" 
          },
          { 
            id: '2', 
            title: "School Renovation Project", 
            amount: "5800 SUI", 
            fundedPercent: 65, 
            status: "Partially Funded", 
            timestamp: "2023-11-02", 
            category: "Education" 
          },
          { 
            id: '3', 
            title: "Emergency Food Relief", 
            amount: "1200 SUI", 
            fundedPercent: 30, 
            status: "Partially Funded", 
            timestamp: "2023-11-10", 
            category: "Food" 
          },
          { 
            id: '4', 
            title: "Clean Water Initiative", 
            amount: "3200 SUI", 
            fundedPercent: 0, 
            status: "Pending", 
            timestamp: "2023-11-12", 
            category: "Environment" 
          },
        ];
        
        setFundedRequests(mockFundedRequests);
      } catch (error) {
        console.error('Error fetching funded requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFundedRequests();
  }, [suiClient, recipientAddress]);

  return { fundedRequests, isLoading };
}