import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface CreateOrderResponse {
  id: string;
  userId: string;
  total: number;
  status: string;
  shippingAddress: unknown | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly api = inject(ApiService);

  placeOrder(
    addressId: string,
    paymentMethod: string,
  ): Observable<CreateOrderResponse> {
    return this.api.post<CreateOrderResponse>('/orders', {
      addressId,
      paymentMethod,
    });
  }

  getOrderDetails(id: string): Observable<any> {
    return this.api.get<any>(`/orders/${id}`);
  }
}
