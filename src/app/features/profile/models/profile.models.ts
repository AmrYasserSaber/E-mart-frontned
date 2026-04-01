export interface UserPublic {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  active: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface AddressPublic {
  id: string;
  label: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  street: string;
  city: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistApiItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    ratingAvg: number;
    ratingCount: number;
    createdAt: string;
    updatedAt: string;
    category?: { id: string; name: string; slug: string; parentId: string | null };
  };
}

export interface WishlistApiResponse {
  data: WishlistApiItem[];
  total: number;
  page: number;
  pages: number;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface AddressRequest {
  label?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  street: string;
  city: string;
  isPrimary?: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  membershipTier: string;
  memberSince: number;
  createdAt: string;
}

export interface AccountStats {
  totalOrders: number;
  wishlistCount: number;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface Address {
  id: string;
  label: string;
  icon: string;
  street: string;
  city: string;
  phone: string | null;
  isPrimary: boolean;
}

export interface RecentOrder {
  id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  itemsCount: number;
  createdAt: string;
}

export interface RecentOrdersResult {
  orders: RecentOrder[];
  total: number;
  page: number;
  pages: number;
}

export interface WishlistItem {
  wishlistId: string;
  productId: string;
  title: string;
  price: number;
  images: string[];
  ratingAvg: number | null;
}

export type ProfileTab = 'orders' | 'wishlist' | 'addresses';
