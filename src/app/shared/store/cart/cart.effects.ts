import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CartService } from '../../../features/cart/services/cart.service';
import { CartActions } from './cart.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class CartEffects {
  private readonly actions$ = inject(Actions);
  private readonly cartService = inject(CartService);

  loadCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.loadCart),
      mergeMap(() =>
        this.cartService.getCart().pipe(
          map((cart) => CartActions.loadCartSuccess({ cart })),
          catchError((error) =>
            of(CartActions.loadCartFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  addToCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.addToCart),
      mergeMap(({ productId, quantity }) =>
        this.cartService.addItem(productId, quantity).pipe(
          map((cart) => CartActions.addToCartSuccess({ cart })),
          catchError((error) =>
            of(CartActions.addToCartFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  updateQuantity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.updateQuantity),
      mergeMap(({ itemId, quantity }) =>
        this.cartService.updateQuantity(itemId, quantity).pipe(
          map((cart) => CartActions.updateQuantitySuccess({ cart })),
          catchError((error) =>
            of(CartActions.updateQuantityFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  removeFromCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.removeFromCart),
      mergeMap(({ itemId }) =>
        this.cartService.removeItem(itemId).pipe(
          map((cart) => CartActions.removeFromCartSuccess({ cart })),
          catchError((error) =>
            of(CartActions.removeFromCartFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  clearCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.clearCart),
      mergeMap(() =>
        this.cartService.clearCart().pipe(
          map(() => CartActions.clearCartSuccess()),
          catchError((error) =>
            of(CartActions.clearCartFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );
}
