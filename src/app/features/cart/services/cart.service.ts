import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/app.tokens';
import type { Cart, CartItem } from '../../../core/models/cart.model';

interface CartResponse {
  success: boolean;
  data: Cart;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getCart(): Observable<Cart> {
    return this.http
      .get<CartResponse>(`${this.baseUrl}/cart`)
      .pipe(map((res) => res.data));
  }

  addItem(productId: string, quantity: number = 1): Observable<Cart> {
    return this.http
      .post<CartResponse>(`${this.baseUrl}/cart`, { productId, quantity })
      .pipe(map((res) => res.data));
  }

  updateQuantity(itemId: string, quantity: number): Observable<Cart> {
    return this.http
      .put<CartResponse>(`${this.baseUrl}/cart/items/${itemId}`, { quantity })
      .pipe(map((res) => res.data));
  }

  removeItem(itemId: string): Observable<Cart> {
    return this.http
      .delete<CartResponse>(`${this.baseUrl}/cart/items/${itemId}`)
      .pipe(map((res) => res.data));
  }

  clearCart(): Observable<void> {
    return this.http
      .delete<any>(`${this.baseUrl}/cart`)
      .pipe(map(() => undefined));
  }
}
