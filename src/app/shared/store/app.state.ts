import type { AuthState } from './auth/auth.reducer';
import type { CartState } from './cart/cart.reducer';
import type { ProductsState } from './products/products.reducer';

export interface AppState {
  auth: AuthState;
  cart: CartState;
  products: ProductsState;
}

export const appFeatureKeys = {
  auth: 'auth',
  cart: 'cart',
  products: 'products',
} as const;
