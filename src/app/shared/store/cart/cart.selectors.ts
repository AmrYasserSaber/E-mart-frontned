import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { CartState } from './cart.reducer';

export const selectCartState = createFeatureSelector<CartState>('cart');

export const selectCartItems = createSelector(
  selectCartState,
  (s) => s.items,
);

export const selectCartCount = createSelector(
  selectCartState,
  (s) => s.totalQuantity,
);

export const selectCartTotal = createSelector(
  selectCartState,
  (s) => s.totalPrice,
);

export const selectCartLoading = createSelector(
  selectCartState,
  (s) => s.loading,
);

export const selectCartError = createSelector(
  selectCartState,
  (s) => s.error,
);
