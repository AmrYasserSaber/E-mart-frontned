export interface Product {
  id: string | number;
  name?: string;
  title?: string;
  price: number;
  description?: string;
  stock?: number;
  imageUrl?: string;
  images?: string[];
  categoryId?: string | number;
  sellerId?: string | number;
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
