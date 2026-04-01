import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { Product } from '../../../core/models/product.model';
import { ProductsActions } from './products.actions';

interface ProductsListResponse {
  data: Product[];
  total: number;
  page: number;
  pages: number;
}

function normalizeProductsResponse(data: unknown): ProductsListResponse {
  if (data && typeof data === 'object' && 'data' in data) {
    const payload = data as Partial<ProductsListResponse>;
    return {
      data: Array.isArray(payload.data) ? payload.data : [],
      total: typeof payload.total === 'number' ? payload.total : 0,
      page: typeof payload.page === 'number' ? payload.page : 1,
      pages: typeof payload.pages === 'number' ? payload.pages : 1,
    };
  }
  return {
    data: Array.isArray(data) ? (data as Product[]) : [],
    total: Array.isArray(data) ? data.length : 0,
    page: 1,
    pages: 1,
  };
}

@Injectable()
export class ProductsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ApiService);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      switchMap(({ query }) =>
        this.api
          .get<unknown>('/products', {
            params: {
              page: query.page ?? 1,
              limit: query.limit ?? 12,
              ...(query.search ? { search: query.search } : {}),
              ...(query.categoryId ? { categoryId: query.categoryId } : {}),
            },
          })
          .pipe(
          map((data) => {
            const payload = normalizeProductsResponse(data);
            return ProductsActions.loadProductsSuccess({
              payload,
            });
          }),
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
