import { createAction, props } from '@ngrx/store';
import type { Product } from '../../../core/models/product.model';

export const ProductsActions = {
  loadProducts: createAction('[Products] Load'),
  loadProductsSuccess: createAction(
    '[Products] Load Success',
    props<{ products: Product[] }>(),
  ),
  loadProductsFailure: createAction(
    '[Products] Load Failure',
    props<{ error: string }>(),
  ),
};
