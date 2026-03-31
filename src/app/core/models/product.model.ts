export interface Product {
  id: string;
  title: string;
  price: number;
  description?: string;
  images: string[];
  categoryId?: string;
  sellerId?: string;
  ratingAvg?: number;
  ratingCount?: number;
}
