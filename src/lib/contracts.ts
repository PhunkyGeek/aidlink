// ✅ lib/contract.ts (reverted to call-based format, compatible with SuiClient)
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const client = new SuiClient({
  url: getFullnodeUrl(
    (process.env.NEXT_PUBLIC_SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet') || 'testnet'
  ),
});

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;

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
  return await client.call('sui_moveCall', {
    packageObjectId: PACKAGE_ID,
    module: 'aid_request',
    function: 'create_request',
    arguments: [title, description, media_cid, location, category.toString()],
    sender: walletAddress,
    gasBudget: 10000,
  } as any);
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
  return await client.call('sui_moveCall', {
    packageObjectId: PACKAGE_ID,
    module: 'aid_vault',
    function: 'fund_request',
    arguments: [aidId, amount.toString()],
    sender: walletAddress,
    gasBudget: 10000,
  } as any);
}

export async function approveAidRequest({
  aidId,
  walletAddress,
}: {
  aidId: string;
  walletAddress: string;
}) {
  return await client.call('sui_moveCall', {
    packageObjectId: PACKAGE_ID,
    module: 'aid_request',
    function: 'mark_approved',
    arguments: [aidId],
    sender: walletAddress,
    gasBudget: 10000,
  } as any);
}

export async function rejectAidRequest({
  aidId,
  walletAddress,
}: {
  aidId: string;
  walletAddress: string;
}) {
  return await client.call('sui_moveCall', {
    packageObjectId: PACKAGE_ID,
    module: 'aid_request',
    function: 'mark_rejected',
    arguments: [aidId],
    sender: walletAddress,
    gasBudget: 10000,
  } as any);
}
