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

type CartApiPayload = CartResponse | Cart;

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private normalizeCart(payload: CartApiPayload): Cart {
    const raw = ('data' in payload ? payload.data : payload) as Omit<
      Cart,
      'totalQuantity' | 'totalPrice'
    > & {
      totalQuantity?: number;
      totalPrice?: number;
    };

    const items = raw.items ?? [];
    const totalQuantity =
      raw.totalQuantity ??
      items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
    const totalPrice =
      raw.totalPrice ??
      items.reduce(
        (sum, item) => sum + (item.quantity ?? 0) * (item.product?.price ?? 0),
        0,
      );

    return {
      ...raw,
      items,
      totalQuantity,
      totalPrice,
    };
  }

  getCart(): Observable<Cart> {
    return this.http
      .get<CartApiPayload>(`${this.baseUrl}/cart`)
      .pipe(map((res) => this.normalizeCart(res)));
  }

  addItem(productId: string, quantity: number = 1): Observable<Cart> {
    return this.http
      .post<CartApiPayload>(`${this.baseUrl}/cart`, { productId, quantity })
      .pipe(map((res) => this.normalizeCart(res)));
  }

  updateQuantity(itemId: string, quantity: number): Observable<Cart> {
    return this.http
      .put<CartApiPayload>(`${this.baseUrl}/cart/items/${itemId}`, { quantity })
      .pipe(map((res) => this.normalizeCart(res)));
  }

  removeItem(itemId: string): Observable<Cart> {
    return this.http
      .delete<CartApiPayload>(`${this.baseUrl}/cart/items/${itemId}`)
      .pipe(map((res) => this.normalizeCart(res)));
  }

  clearCart(): Observable<void> {
    return this.http
      .delete<any>(`${this.baseUrl}/cart`)
      .pipe(map(() => undefined));
  }
}
