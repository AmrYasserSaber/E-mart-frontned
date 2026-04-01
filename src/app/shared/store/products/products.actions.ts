import { createAction, props } from '@ngrx/store';
import type { Product } from '../../../core/models/product.model';

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

export interface ProductsListPayload {
  data: Product[];
  total: number;
  page: number;
  pages: number;
}

export const ProductsActions = {
  loadProducts: createAction('[Products] Load', props<{ query: ProductsQuery }>()),
  loadProductsSuccess: createAction(
    '[Products] Load Success',
    props<{ payload: ProductsListPayload }>(),
  ),
  loadProductsFailure: createAction(
    '[Products] Load Failure',
    props<{ error: string }>(),
  ),
};
