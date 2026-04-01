import { createReducer, on } from '@ngrx/store';
import type { CartItem } from '../../../core/models/cart.model';
import { CartActions } from './cart.actions';

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
}

export const initialCartState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

export const cartReducer = createReducer(
  initialCartState,
  
  // Loading states
  on(CartActions.loadCart, (state) => ({ ...state, loading: true })),
  on(CartActions.addToCart, (state) => ({ ...state, loading: true })),
  on(CartActions.updateQuantity, (state) => ({ ...state, loading: true })),
  on(CartActions.removeFromCart, (state) => ({ ...state, loading: true })),
  on(CartActions.clearCart, (state) => ({ ...state, loading: true })),

  // Success states (backend returns full cart object)
  on(
    CartActions.loadCartSuccess,
    CartActions.addToCartSuccess,
    CartActions.updateQuantitySuccess,
    CartActions.removeFromCartSuccess,
    (state, { cart }) => ({
      ...state,
      items: cart.items,
      totalQuantity: cart.totalQuantity,
      totalPrice: cart.totalPrice,
      loading: false,
      error: null,
    }),
  ),

  on(CartActions.clearCartSuccess, () => initialCartState),

  // Failure states
  on(
    CartActions.loadCartFailure,
    CartActions.addToCartFailure,
    CartActions.updateQuantityFailure,
    CartActions.removeFromCartFailure,
    CartActions.clearCartFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    }),
  ),
);
