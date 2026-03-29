import { createAction, props } from '@ngrx/store';
import type { Product } from '../../../core/models/product.model';

export const CartActions = {
  addToCart: createAction(
    '[Cart] Add',
    props<{ product: Product; quantity?: number }>(),
  ),
  removeFromCart: createAction(
    '[Cart] Remove',
    props<{ productId: number }>(),
  ),
  updateQuantity: createAction(
    '[Cart] Update Quantity',
    props<{ productId: number; quantity: number }>(),
  ),
  clearCart: createAction('[Cart] Clear'),
};
