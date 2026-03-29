export interface Order {
  id: number;
  userId?: string;
  status: string;
  total: number;
  createdAt?: string;
}
