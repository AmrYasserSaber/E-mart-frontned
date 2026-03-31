import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map } from 'rxjs/operators';
import type { Product } from '../../../core/models/product.model';
import type { Review, PaginatedResponse } from '../../../core/models/review.model';
import { ProductsService } from '../../../core/services/products.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { StarRating } from '../../../shared/components/star-rating/star-rating';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Pagination } from '../../../shared/components/pagination/pagination';

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
  private readonly productsService = inject(ProductsService);
  private readonly destroyRef = inject(DestroyRef);

  protected product: Product | null = null;
  protected productLoading = true;
  protected productError = '';

  protected reviews: Review[] = [];
  protected reviewsLoading = true;
  protected reviewsError = '';
  protected reviewsPage = 1;
  protected reviewsPages = 1;

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
          this.productLoading = false;
          this.reviewsLoading = false;
          this.productError = 'Invalid product id.';
          return;
        }
        this.loadProduct(id);
        this.loadReviews(id, 1);
      });
  }

  get displayTitle(): string {
    if (!this.product) return 'Product';
    return this.product.title ?? this.product.name ?? 'Product';
  }

  get displayImage(): string | undefined {
    return this.product?.images?.[0] ?? this.product?.imageUrl;
  }

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

  private loadProduct(id: string): void {
    this.productLoading = true;
    this.productError = '';
    this.product = null;
    this.productsService
      .getProductById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.productLoading = false;
        },
        error: (error: unknown) => {
          this.productLoading = false;
          this.productError =
            error && typeof error === 'object' && 'message' in error
              ? String(error.message)
              : 'Failed to load product details.';
        },
      });
  }

  private loadReviews(id: string, page: number): void {
    this.reviewsLoading = true;
    this.reviewsError = '';
    this.productsService
      .getReviews(id, { page, limit: 5 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (payload: PaginatedResponse<Review>) => {
          this.reviews = payload.data;
          this.reviewsPage = payload.page;
          this.reviewsPages = payload.pages;
          this.reviewsLoading = false;
        },
        error: (error: unknown) => {
          this.reviewsLoading = false;
          this.reviewsError =
            error && typeof error === 'object' && 'message' in error
              ? String(error.message)
              : 'Failed to load reviews.';
        },
      });
  }

  private resetViewState(): void {
    this.product = null;
    this.productError = '';
    this.productLoading = true;
    this.reviews = [];
    this.reviewsError = '';
    this.reviewsLoading = true;
    this.reviewsPage = 1;
    this.reviewsPages = 1;
  }
}
