import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { ProductsState } from './products.reducer';

export const selectProductsState =
  createFeatureSelector<ProductsState>('products');

export const selectAllProducts = createSelector(
  selectProductsState,
  (s) => s.products,
);

export const selectProductsLoading = createSelector(
  selectProductsState,
  (s) => s.loading,
);

export const selectProductsError = createSelector(
  selectProductsState,
  (s) => s.error,
);
