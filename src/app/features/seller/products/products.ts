import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, expand, finalize, last } from 'rxjs';
import { ProductCategory, ProductService, SellerProduct } from '../services/product.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { SkeletonLoader } from '../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-products',
  imports: [RouterLink, CurrencyPipe, NgClass, EmptyState, SkeletonLoader],
  templateUrl: './products.html',
  styleUrl: './products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  private readonly productService = inject(ProductService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly stockBackup = new Map<string, number>();

  readonly loading = signal(true);
  readonly deletingId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly products = signal<SellerProduct[]>([]);
  readonly categories = signal<ProductCategory[]>([]);

  readonly searchTerm = signal('');
  readonly selectedCategory = signal('');
  readonly selectedStock = signal<'all' | 'healthy' | 'low' | 'out'>('all');

  readonly filteredProducts = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();
    const stock = this.selectedStock();

    return this.products().filter((product) => {
      const matchesSearch =
        !search ||
        product.title.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        this.toSku(product.id).toLowerCase().includes(search);

      const matchesCategory = !category || product.categoryId === category;

      const matchesStock =
        stock === 'all' ||
        (stock === 'healthy' && product.stock > 10) ||
        (stock === 'low' && product.stock > 0 && product.stock <= 10) ||
        (stock === 'out' && product.stock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  });

  constructor() {
    this.loadProducts();
    this.loadCategories();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
  }

  onStock(status: 'all' | 'healthy' | 'low' | 'out'): void {
    this.selectedStock.set(status);
  }

  retryLoad(): void {
    this.loadProducts();
  }

  toggleActive(product: SellerProduct): void {
    const isCurrentlyActive = product.stock > 0;

    let nextStock: number;
    if (isCurrentlyActive) {
      // Turning off: preserve existing stock in memory, then set to 0.
      this.stockBackup.set(product.id, product.stock);
      nextStock = 0;
    } else {
      // Turning on: restore previous stock if available; otherwise prompt for restock qty.
      nextStock = this.stockBackup.get(product.id) ?? 0;

      if (nextStock <= 0) {
        const input = window.prompt(
          `Enter restock quantity for "${product.title}"`,
          '1',
        );
        if (input === null) return;

        const parsed = Number(input);
        if (!Number.isFinite(parsed) || parsed <= 0) return;

        nextStock = Math.floor(parsed);
      }
    }

    this.productService
      .updateProduct(product.id, {
        title: product.title,
        description: product.description,
        price: product.price,
        stock: nextStock,
        categoryId: product.categoryId,
        images: [],
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => {
        if (updated.stock > 0) {
          this.stockBackup.set(updated.id, updated.stock);
        }
        this.products.update((items) => items.map((p) => (p.id === updated.id ? updated : p)));
      });
  }

  deleteProduct(productId: string): void {
    this.deletingId.set(productId);

    this.productService
      .deleteProduct(productId)
      .pipe(
        finalize(() => this.deletingId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.products.update((items) => items.filter((p) => p.id !== productId));
        },
        error: () => {
          this.error.set('Failed to delete product.');
        },
      });
  }

  toSku(id: string): string {
    return `SKU-${id.slice(0, 8).toUpperCase()}`;
  }

  productImage(product: SellerProduct): string {
    const fallback = '/product-placeholder.svg';
    const first = product.images?.[0]?.trim();

    if (!first) {
      return fallback;
    }

    if (first.includes('cdn.seed.local')) {
      return fallback;
    }

    return first;
  }

  stockState(stock: number): 'Healthy' | 'Low Stock' | 'Out of Stock' {
    if (stock === 0) {
      return 'Out of Stock';
    }
    if (stock <= 10) {
      return 'Low Stock';
    }
    return 'Healthy';
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    const limit = 100;
    const aggregated: SellerProduct[] = [];

    this.productService
      .listProducts({ page: 1, limit })
      .pipe(
        expand((response, index) => {
          aggregated.push(...response.data);

          const shouldContinue =
            aggregated.length < response.total && response.data.length === limit;

          if (!shouldContinue) {
            return EMPTY;
          }

          // index is 0-based; page 1 was emitted as index 0.
          const nextPage = index + 2;
          return this.productService.listProducts({ page: nextPage, limit });
        }),
        last(),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => this.products.set(aggregated),
        error: () => this.error.set('Unable to load products.'),
      });
  }

  private loadCategories(): void {
    this.productService
      .listCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => this.categories.set(categories),
      });
  }
}
