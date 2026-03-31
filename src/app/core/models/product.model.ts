export interface Product {
  id: string;
  sellerId?: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  ratingAvg?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
