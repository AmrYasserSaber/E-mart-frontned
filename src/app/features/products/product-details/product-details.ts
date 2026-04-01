import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import type { Product } from '../../../core/models/product.model';
import type { Review, PaginatedResponse } from '../../../core/models/review.model';
import { sanitizeReturnUrl } from '../../../core/utils/url.utils';
import { ProductsService } from '../../../core/services/products.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { StarRating } from '../../../shared/components/star-rating/star-rating';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { selectIsAuthenticated } from '../../../shared/store/auth/auth.selectors';
import { CartActions } from '../../../shared/store/cart/cart.actions';

@Component({
  selector: 'app-product-details',
  imports: [
    DatePipe,
    RouterLink,
    CurrencyFormatPipe,
    StarRating,
    EmptyState,
    Pagination,
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  protected readonly imagePlaceholder =
    'https://img.freepik.com/premium-vector/picture-icon-isolated-white-background-vector-illustration_736051-240.jpg?semt=ais_incoming&w=740&q=80';
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly productsService = inject(ProductsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly product = signal<Product | null>(null);
  protected readonly productLoading = signal(true);
  protected readonly productError = signal('');

  protected readonly reviews = signal<Review[]>([]);
  protected readonly reviewsLoading = signal(true);
  protected readonly reviewsError = signal('');
  protected readonly reviewsPage = signal(1);
  protected readonly reviewsPages = signal(1);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((id) => {
        this.resetViewState();
        if (!id) {
          this.productLoading.set(false);
          this.reviewsLoading.set(false);
          this.productError.set('Invalid product id.');
          return;
        }
        this.loadProduct(id);
        this.loadReviews(id, 1);
      });
  }

  protected readonly displayTitle = computed(() => {
    const product = this.product();
    if (!product) return 'Product';
    return product.title ?? product.name ?? 'Product';
  });

  protected readonly displayImage = computed(() => {
    const product = this.product();
    return product?.images?.[0];
  });

  onReviewsPageChange(page: number): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loadReviews(id, page);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (!target) return;
    target.onerror = null;
    target.src = this.imagePlaceholder;
  }

  onAddToCart(): void {
    const product = this.product();
    if (!product) return;
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

  private loadProduct(id: string): void {
    this.productLoading.set(true);
    this.productError.set('');
    this.product.set(null);
    this.productsService
      .getProductById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.product.set(product);
          this.productLoading.set(false);
        },
        error: (error: unknown) => {
          this.productLoading.set(false);
          this.productError.set(
            error && typeof error === 'object' && 'message' in error
              ? String(error.message)
              : 'Failed to load product details.',
          );
        },
      });
  }

  private loadReviews(id: string, page: number): void {
    this.reviewsLoading.set(true);
    this.reviewsError.set('');
    this.productsService
      .getReviews(id, { page, limit: 5 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (payload: PaginatedResponse<Review>) => {
          this.reviews.set(payload.data);
          this.reviewsPage.set(payload.page);
          this.reviewsPages.set(payload.pages);
          this.reviewsLoading.set(false);
        },
        error: (error: unknown) => {
          this.reviewsLoading.set(false);
          this.reviewsError.set(
            error && typeof error === 'object' && 'message' in error
              ? String(error.message)
              : 'Failed to load reviews.',
          );
        },
      });
  }

  private resetViewState(): void {
    this.product.set(null);
    this.productError.set('');
    this.productLoading.set(true);
    this.reviews.set([]);
    this.reviewsError.set('');
    this.reviewsLoading.set(true);
    this.reviewsPage.set(1);
    this.reviewsPages.set(1);
  }
}
