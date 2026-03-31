import { createFeatureSelector, createSelector } from '@ngrx/store';
import type { ProductsState } from './products.reducer';

export const selectProductsState =
  createFeatureSelector<ProductsState>('products');

export const selectAllProducts = createSelector(
  selectProductsState,
  (s) => s.products,
);

export const selectProductsTotal = createSelector(
  selectProductsState,
  (s) => s.total,
);

export const selectProductsPage = createSelector(
  selectProductsState,
  (s) => s.page,
);

export const selectProductsPages = createSelector(
  selectProductsState,
  (s) => s.pages,
);

export const selectProductsLoading = createSelector(
  selectProductsState,
  (s) => s.loading,
);

export const selectProductsError = createSelector(
  selectProductsState,
  (s) => s.error,
);
