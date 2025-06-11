export const statusMap = {
  0: 'Pending',
  1: 'Approved',
  2: 'Funded',
  3: 'Rejected',
  4: 'Completed',
  5: 'Error',
} as const;

export type AidStatusCode = keyof typeof statusMap;
export type AidStatusLabel = (typeof statusMap)[AidStatusCode];

export function getStatusLabel(code: number | string): AidStatusLabel {
  if (typeof code === 'string') {
    return code.charAt(0).toUpperCase() + code.slice(1) as AidStatusLabel;
  }
  return statusMap[code as AidStatusCode] || 'Unknown';
}