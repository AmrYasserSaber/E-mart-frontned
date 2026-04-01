import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import type { Product } from '../../../../core/models/product.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { StarRating } from '../../../../shared/components/star-rating/star-rating';
import { CartActions } from '../../../../shared/store/cart/cart.actions';
import { ProductsActions } from '../../../../shared/store/products/products.actions';
import {
  selectAllProducts,
  selectProductsLoading,
} from '../../../../shared/store/products/products.selectors';

@Component({
  selector: 'app-featured-products',
  imports: [AsyncPipe, RouterLink, CurrencyFormatPipe, StarRating],
  templateUrl: './featured-products.html',
  styleUrl: './featured-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedProducts {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly imagePlaceholder =
    'https://img.freepik.com/premium-vector/picture-icon-isolated-white-background-vector-illustration_736051-240.jpg?semt=ais_incoming&w=740&q=80';

  readonly loading$ = this.store.select(selectProductsLoading);
  readonly featured$ = this.store
    .select(selectAllProducts)
    .pipe(map((products) => products.slice(0, 3)));

  constructor() {
    this.store.dispatch(
      ProductsActions.loadProducts({ query: { page: 1, limit: 3 } }),
    );
  }

  openProduct(product: Product): void {
    void this.router.navigate(['/products', product.id]);
  }

  addToCart(event: Event, product: Product): void {
    event.stopPropagation();
    this.store.dispatch(
      CartActions.addToCart({ productId: product.id, quantity: 1 }),
    );
  }

  rating(product: Product): number {
    return product.ratingAvg ?? product.rating ?? 0;
  }

  reviewCount(product: Product): number {
    return product.ratingCount ?? 0;
  }

  title(product: Product): string {
    return product.title || product.name || 'Untitled';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (!target) return;
    target.onerror = null;
    target.src = this.imagePlaceholder;
  }
}
