import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Product } from '../../../core/models/product.model';
import type { Category } from '../../../core/models/category.model';
import { sanitizeReturnUrl } from '../../../core/utils/url.utils';
import { ProductsService } from '../../../core/services/products.service';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { selectIsAuthenticated } from '../../../shared/store/auth/auth.selectors';
import { CartActions } from '../../../shared/store/cart/cart.actions';
import { ProductsActions } from '../../../shared/store/products/products.actions';
import {
  selectAllProducts,
  selectProductsError,
  selectProductsLoading,
  selectProductsPage,
  selectProductsPages,
} from '../../../shared/store/products/products.selectors';
import { appIcons } from '../../../shared/icons/font-awesome-icons';

interface ProductsFilters {
  page: number;
  search: string;
  categoryId: string;
}

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

@Component({
  selector: 'app-product-list',
  imports: [
    AsyncPipe,
    FontAwesomeModule,
    ProductCard,
    Pagination,
    EmptyState,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly products$ = this.store.select(selectAllProducts);
  readonly loading$ = this.store.select(selectProductsLoading);
  readonly error$ = this.store.select(selectProductsError);
  readonly page$ = this.store.select(selectProductsPage);
  readonly pages$ = this.store.select(selectProductsPages);

  protected searchValue = '';
  protected selectedCategoryId = '';
  protected categories: Category[] = [];
  protected readonly checkCircleIcon = appIcons['checkCircle'];
  protected readonly chevronRightIcon = appIcons['chevronRight'];
  protected readonly chevronDownIcon = appIcons['chevronDown'];

  constructor() {
    this.productsService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => {
        this.categories = categories;
      });

    this.route.queryParamMap
      .pipe(
        map((params) => ({
          page: parsePage(params.get('page')),
          search: (params.get('search') ?? '').trim(),
          categoryId: params.get('categoryId') ?? '',
        })),
        distinctUntilChanged(
          (a, b) =>
            a.page === b.page &&
            a.search === b.search &&
            a.categoryId === b.categoryId,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((filters) => {
        this.syncFormState(filters);
        this.store.dispatch(
          ProductsActions.loadProducts({
            query: {
              page: filters.page,
              limit: 12,
              search: filters.search || undefined,
              categoryId: filters.categoryId || undefined,
            },
          }),
        );
      });
  }

  onSearchSubmit(searchInput: string): void {
    this.updateQueryParams({
      search: searchInput.trim(),
      page: 1,
    });
  }

  onCategorySelect(categoryId: string): void {
    this.updateQueryParams({
      categoryId,
      page: 1,
    });
  }

  onPageChange(page: number): void {
    this.updateQueryParams({ page });
  }

  clearFilters(): void {
    this.updateQueryParams({
      search: '',
      categoryId: '',
      page: 1,
    });
  }

  onAddToCart(product: Product): void {
    this.store
      .select(selectIsAuthenticated)
      .pipe(take(1))
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.store.dispatch(CartActions.addToCart({ productId: product.id }));
          return;
        }
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: sanitizeReturnUrl(this.router.url) },
        });
      });
  }

  openProductDetails(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  trackByCategory(_: number, category: Category): string {
    return category.id;
  }

  private syncFormState(filters: ProductsFilters): void {
    this.searchValue = filters.search;
    this.selectedCategoryId = filters.categoryId;
  }

  private updateQueryParams(patch: Partial<ProductsFilters>): void {
    const queryParams = {
      ...(this.searchValue ? { search: this.searchValue } : {}),
      ...(this.selectedCategoryId
        ? { categoryId: this.selectedCategoryId }
        : {}),
      page: 1,
      ...patch,
    };

    this.searchValue = queryParams.search ?? '';
    this.selectedCategoryId = queryParams.categoryId ?? '';

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: queryParams.search || null,
        categoryId: queryParams.categoryId || null,
        page: queryParams.page > 1 ? queryParams.page : null,
      },
      queryParamsHandling: '',
    });
  }
}
