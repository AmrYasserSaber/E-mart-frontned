import { Injectable, inject } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SUPPRESS_ERROR_TOAST } from '../../../core/tokens/http.tokens';

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

  getOrderDetails(id: string, silentErrors = false): Observable<any> {
    const context = silentErrors
      ? new HttpContext().set(SUPPRESS_ERROR_TOAST, true)
      : undefined;

    return this.api.get<any>(`/orders/${id}`, { context });
  }
}
