export enum SellerStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface PendingSeller {
  id: string;
  userId: string;
  storeName: string;
  description: string;
  status: SellerStatus;
  rating: number;
  createdAt: string;
}
