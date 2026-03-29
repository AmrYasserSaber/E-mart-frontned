import { createReducer, on } from '@ngrx/store';
import type { CartItem } from '../../../core/models/cart.model';
import { CartActions } from './cart.actions';

export interface CartState {
  items: CartItem[];
}

export const initialCartState: CartState = {
  items: [],
};

/** Used by addToCart and updateQuantity: non-finite or non-positive → 1, then floor to integer ≥ 1. */
function sanitizeQuantity(quantity: number): number {
  let n = quantity;
  if (!Number.isFinite(n) || n <= 0) n = 1;
  return Math.max(1, Math.floor(n));
}

export const cartReducer = createReducer(
  initialCartState,
  on(CartActions.addToCart, (state, { product, quantity = 1 }) => {
    const q = sanitizeQuantity(quantity);
    const idx = state.items.findIndex((i) => i.product.id === product.id);
    if (idx >= 0) {
      const next = [...state.items];
      next[idx] = {
        ...next[idx],
        quantity: next[idx].quantity + q,
      };
      return { ...state, items: next };
    }
    return {
      ...state,
      items: [...state.items, { product, quantity: q }],
    };
  }),
  on(CartActions.removeFromCart, (state, { productId }) => ({
    ...state,
    items: state.items.filter((i) => i.product.id !== productId),
  })),
  on(CartActions.updateQuantity, (state, { productId, quantity }) => {
    const q = sanitizeQuantity(quantity);
    return {
      ...state,
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, quantity: q } : i,
      ),
    };
  }),
  on(CartActions.clearCart, () => initialCartState),
);
