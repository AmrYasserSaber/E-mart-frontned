import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export type BackendOrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrdersListItem {
  id: string;
  total: number;
  status: BackendOrderStatus;
  itemsCount: number;
  createdAt: string;
}

export interface OrdersListResponse {
  data: OrdersListItem[];
  total: number;
  page: number;
}

export interface OrderDetailsItem {
  product: {
    id: string;
    title: string;
  };
  qty: number;
  price: number;
}

export interface OrderShippingAddress {
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

export interface OrderDetailsResponse {
  id: string;
  items: OrderDetailsItem[];
  total: number;
  status: BackendOrderStatus;
  shippingAddressId: string | null;
  shippingAddress: OrderShippingAddress | null;
  payment: {
    method: string;
    provider: 'kashier' | 'cash_on_delivery';
    status: string;
  };
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly api = inject(ApiService);

  getOrders(page = 1, limit = 20): Observable<OrdersListResponse> {
    return this.api.get<OrdersListResponse>('/orders', {
      params: { page, limit },
    });
  }

  getOrderById(orderId: string): Observable<OrderDetailsResponse> {
    return this.api.get<OrderDetailsResponse>(`/orders/${orderId}`);
  }
}
