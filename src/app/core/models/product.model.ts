export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  categoryId?: number;
  sellerId?: number;
  rating?: number;
}
