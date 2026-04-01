import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrdersListItem {
  id: string;
  total: number;
  status: OrderStatus;
  itemsCount: number;
  createdAt: string;
  customer?: string;
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

export interface OrderDetailsResponse {
  id: string;
  items: OrderDetailsItem[];
  total: number;
  status: OrderStatus;
  shippingAddressId: string | null;
  payment: {
    provider: string;
    status: string;
  };
  createdAt: string;
}

export interface UpdateOrderStatusResponse {
  id: string;
  status: OrderStatus;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  listOrders(page = 1, limit = 20): Observable<OrdersListResponse> {
    return this.api
      .get<OrdersListResponse>('/orders/seller', {
        params: { page, limit },
      })
      .pipe(
        catchError(() =>
          this.api.get<OrdersListResponse>('/admin/orders', {
            params: { page, limit },
          }),
        ),
      );
  }

  getOrder(id: string): Observable<OrderDetailsResponse> {
    return this.api
      .get<OrderDetailsResponse>(`/orders/seller/${id}`)
      .pipe(catchError(() => this.api.get<OrderDetailsResponse>(`/orders/${id}`)));
  }

  updateOrderStatus(
    id: string,
    status: Exclude<OrderStatus, 'cancelled'>,
  ): Observable<UpdateOrderStatusResponse> {
    return this.api
      .patch<UpdateOrderStatusResponse>(`/orders/seller/${id}/status`, { status })
      .pipe(
        catchError(() =>
          this.api.patch<UpdateOrderStatusResponse>(`/admin/orders/${id}/status`, {
            status,
          }),
        ),
      );
  }
}
