// ✅ utils/statusMap.ts

export const statusMap = {
    0: 'Pending',
    1: 'Approved',
    2: 'Funded',
    3: 'Rejected',
  } as const;
  
  export type AidStatusCode = keyof typeof statusMap;
  export type AidStatusLabel = (typeof statusMap)[AidStatusCode];
  
  export function getStatusLabel(code: number): AidStatusLabel {
    return statusMap[code as AidStatusCode] || 'Unknown';
  }