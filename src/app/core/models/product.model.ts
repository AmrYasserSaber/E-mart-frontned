export interface Product {
  id: string;
  name?: string;
  title?: string;
  price: number;
  description?: string;
  stock?: number;
  images?: string[];
  categoryId?: string;
  sellerId?: string;
  ratingAvg?: number;
  ratingCount?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
  category?: {
    id: string;
    name: string;
    slug?: string;
  };
}
