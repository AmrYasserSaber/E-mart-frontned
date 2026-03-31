import { createAction, props } from '@ngrx/store';
import type { Product } from '../../../core/models/product.model';

export const CartActions = {
  addToCart: createAction(
    '[Cart] Add',
    props<{ product: Product; quantity?: number }>(),
  ),
  removeFromCart: createAction(
    '[Cart] Remove',
    props<{ productId: string | number }>(),
  ),
  updateQuantity: createAction(
    '[Cart] Update Quantity',
    props<{ productId: string | number; quantity: number }>(),
  ),
  clearCart: createAction('[Cart] Clear'),
};
