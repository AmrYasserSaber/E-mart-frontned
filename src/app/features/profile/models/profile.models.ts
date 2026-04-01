export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  membershipTier: string;
  memberSince: number;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  bio: string | null;
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
  state: string;
  zip: string;
  country: string;
  phone: string | null;
  isPrimary: boolean;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  shippingType: string | null;
  productImages: string[];
  createdAt: string;
}

export type ProfileTab = 'orders' | 'wishlist' | 'addresses' | 'payment';
