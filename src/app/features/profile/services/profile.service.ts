import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { OrdersService, type OrdersListResponse } from '../../orders/services/orders.service';
import type {
  Address,
  AddressPublic,
  AddressRequest,
  RecentOrder,
  RecentOrdersResult,
  UpdateProfileRequest,
  UserProfile,
  UserPublic,
  WishlistApiResponse,
  WishlistItem,
} from '../models/profile.models';

function toUserProfile(u: UserPublic): UserProfile {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    isVerified: u.emailVerifiedAt !== null,
    membershipTier: u.role === 'ADMIN' ? 'E-Mart Admin' : 'E-Mart Member',
    memberSince: new Date(u.createdAt).getFullYear(),
    createdAt: u.createdAt,
  };
}

function toAddress(a: AddressPublic): Address {
  return {
    id: a.id,
    label: a.label ?? 'Address',
    icon: 'home',
    street: a.street,
    city: a.city,
    phone: a.phone,
    isPrimary: a.isPrimary,
  };
}

function toWishlistItem(w: WishlistApiResponse['data'][number]): WishlistItem {
  return {
    wishlistId: w.id,
    productId: w.productId,
    title: w.product.title,
    price: Number(w.product.price),
    images: w.product.images,
    ratingAvg: w.product.ratingAvg ?? null,
  };
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);
  private readonly orders = inject(OrdersService);

  getProfile(): Observable<UserProfile> {
    return this.api.get<UserPublic>('/auth/me').pipe(map(toUserProfile));
  }

  updateProfile(data: UpdateProfileRequest): Observable<UserProfile> {
    return this.api.patch<UserPublic>('/users/profile', data).pipe(map(toUserProfile));
  }

  getAddresses(): Observable<Address[]> {
    return this.api
      .get<{ data: AddressPublic[] }>('/addresses')
      .pipe(map((r) => r.data.map(toAddress)));
  }

  createAddress(data: AddressRequest): Observable<Address> {
    return this.api.post<AddressPublic>('/addresses', data).pipe(map(toAddress));
  }

  updateAddress(id: string, data: AddressRequest): Observable<Address> {
    return this.api.patch<AddressPublic>(`/addresses/${id}`, data).pipe(map(toAddress));
  }

  setPrimaryAddress(id: string): Observable<Address> {
    return this.api.patch<AddressPublic>(`/addresses/${id}/primary`, {}).pipe(map(toAddress));
  }

  deleteAddress(id: string): Observable<void> {
    return this.api.deleteRaw(`/addresses/${id}`);
  }

  getWishlist(page = 1, limit = 20): Observable<WishlistItem[]> {
    return this.api
      .get<WishlistApiResponse>('/wishlist', { params: { page, limit } })
      .pipe(map((r) => r.data.map(toWishlistItem)));
  }

  removeFromWishlist(productId: string): Observable<void> {
    return this.api.deleteRaw(`/wishlist/${productId}`);
  }

  getRecentOrders(page = 1, limit = 8): Observable<RecentOrdersResult> {
    return this.orders
      .getOrders(page, limit)
      .pipe(map((r): RecentOrdersResult => ({
        orders: r.data as RecentOrder[],
        total: r.total,
        page: r.page,
        pages: Math.ceil(r.total / limit),
      })));
  }
}
