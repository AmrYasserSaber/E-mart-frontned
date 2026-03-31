import { createAction, props } from '@ngrx/store';
import type { Cart, CartItem } from '../../../core/models/cart.model';

export const CartActions = {
  // Sync
  loadCart: createAction('[Cart] Load'),
  loadCartSuccess: createAction(
    '[Cart] Load Success',
    props<{ cart: Cart }>(),
  ),
  loadCartFailure: createAction(
    '[Cart] Load Failure',
    props<{ error: string }>(),
  ),

  // Add
  addToCart: createAction(
    '[Cart] Add',
    props<{ productId: string; quantity?: number }>(),
  ),
  addToCartSuccess: createAction(
    '[Cart] Add Success',
    props<{ cart: Cart }>(),
  ),
  addToCartFailure: createAction(
    '[Cart] Add Failure',
    props<{ error: string }>(),
  ),

  // Update
  updateQuantity: createAction(
    '[Cart] Update Quantity',
    props<{ itemId: string; quantity: number }>(),
  ),
  updateQuantitySuccess: createAction(
    '[Cart] Update Quantity Success',
    props<{ cart: Cart }>(),
  ),
  updateQuantityFailure: createAction(
    '[Cart] Update Quantity Failure',
    props<{ error: string }>(),
  ),

  // Remove
  removeFromCart: createAction(
    '[Cart] Remove',
    props<{ itemId: string }>(),
  ),
  removeFromCartSuccess: createAction(
    '[Cart] Remove Success',
    props<{ cart: Cart }>(),
  ),
  removeFromCartFailure: createAction(
    '[Cart] Remove Failure',
    props<{ error: string }>(),
  ),

  // Clear
  clearCart: createAction('[Cart] Clear'),
  clearCartSuccess: createAction('[Cart] Clear Success'),
  clearCartFailure: createAction(
    '[Cart] Clear Failure',
    props<{ error: string }>(),
  ),
};
