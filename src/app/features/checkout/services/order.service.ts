import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/app.tokens';

export interface ShippingAddress {
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
  shippingAddress: ShippingAddress;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  placeOrder(shippingAddress: ShippingAddress, paymentMethod: string): Observable<CreateOrderResponse> {
    return this.http
      .post<any>(`${this.baseUrl}/orders`, { shippingAddress, paymentMethod })
      .pipe(map((res) => res.data));
  }

  getOrderDetails(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/orders/${id}`)
      .pipe(map((res) => res.data));
  }
}
