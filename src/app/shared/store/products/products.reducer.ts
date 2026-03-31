import { createReducer, on } from '@ngrx/store';
import type { Product } from '../../../core/models/product.model';
import { ProductsActions } from './products.actions';

export interface ProductsState {
  products: Product[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  error: string | null;
}

export const initialProductsState: ProductsState = {
  products: [],
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,
};

export const productsReducer = createReducer(
  initialProductsState,
  on(ProductsActions.loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductsActions.loadProductsSuccess, (state, { payload }) => ({
    ...state,
    products: payload.data,
    total: payload.total,
    page: payload.page,
    pages: payload.pages,
    loading: false,
    error: null,
  })),
  on(ProductsActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
