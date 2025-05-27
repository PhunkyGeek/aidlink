import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const client = new SuiClient({
  url: getFullnodeUrl(
    (process.env.NEXT_PUBLIC_SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet') || 'testnet'
  ),
});

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;

// Type for sui_moveCall arguments, as an array
type MoveCallArgs = [
  packageObjectId: string,
  module: string,
  function: string,
  typeArguments: string[], // Empty for these functions
  arguments: (string | number)[],
  gasBudget: number
];

export async function submitAidRequest({
  title,
  description,
  media_cid,
  location,
  category,
  walletAddress,
}: {
  title: string;
  description: string;
  media_cid: string;
  location: string;
  category: number;
  walletAddress: string;
}) {
  const args: MoveCallArgs = [
    PACKAGE_ID,
    'aid_request',
    'create_request',
    [], // No type arguments
    [title, description, media_cid, location, walletAddress, category.toString()],
    10000,
  ];
  try {
    return await client.call('sui_moveCall', args);
  } catch (error: any) {
    console.error('Failed to submit aid request:', error);
    throw new Error(error.message || 'Failed to submit aid request');
  }
}

export async function fundAid({
  aidId,
  amount,
  walletAddress,
}: {
  aidId: string;
  amount: number;
  walletAddress: string;
}) {
  const args: MoveCallArgs = [
    PACKAGE_ID,
    'aid_vault',
    'fund_request',
    [], // No type arguments
    [aidId, amount.toString()],
    10000,
  ];
  try {
    return await client.call('sui_moveCall', args);
  } catch (error: any) {
    console.error('Failed to fund aid:', error);
    throw new Error(error.message || 'Failed to fund aid');
  }
}

export async function approveAidRequest({
  aidId,
}: {
  aidId: string;
  walletAddress: string;
}) {
  const args: MoveCallArgs = [
    PACKAGE_ID,
    'aid_request',
    'mark_approved',
    [], // No type arguments
    [aidId],
    10000,
  ];
  try {
    return await client.call('sui_moveCall', args);
  } catch (error: any) {
    console.error('Failed to approve aid request:', error);
    throw new Error(error.message || 'Failed to approve aid request');
  }
}

export async function rejectAidRequest({
  aidId,
  walletAddress,
}: {
  aidId: string;
  walletAddress: string;
}) {
  const args: MoveCallArgs = [
    PACKAGE_ID,
    'aid_request',
    'mark_rejected',
    [], // No type arguments
    [aidId],
    10000,
  ];
  try {
    return await client.call('sui_moveCall', args);
  } catch (error: any) {
    console.error('Failed to reject aid request:', error);
    throw new Error(error.message || 'Failed to reject aid request');
  }
}