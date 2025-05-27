// src/types/validator.ts
import { Timestamp } from 'firebase/firestore';

export interface Validator {
  id: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt?: Timestamp;
}
