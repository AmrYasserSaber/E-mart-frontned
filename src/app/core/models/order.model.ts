export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderProductItem {
  productId: string;
  title: string;
  qty: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderProductItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}
