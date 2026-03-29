import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { Product } from '../../../core/models/product.model';
import { ProductsActions } from './products.actions';

function normalizeProducts(data: unknown): Product[] {
  if (Array.isArray(data)) {
    return data as Product[];
  }
  return [];
}

@Injectable()
export class ProductsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ApiService);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      switchMap(() =>
        this.api.get<unknown>('/products').pipe(
          map((data) =>
            ProductsActions.loadProductsSuccess({
              products: normalizeProducts(data),
            }),
          ),
          catchError((err) =>
            of(
              ProductsActions.loadProductsFailure({
                error:
                  err && typeof err === 'object' && 'message' in err
                    ? String(err.message)
                    : 'Failed to load products',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
