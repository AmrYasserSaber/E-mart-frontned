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
import { finalize } from 'rxjs';
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
    const stock = product.stock > 0 ? 0 : 20;
    this.productService
      .updateProduct(product.id, {
        title: product.title,
        description: product.description,
        price: product.price,
        stock,
        categoryId: product.categoryId,
        images: [],
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => {
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
    const fallback =
      'https://images.ncsl.org/image/upload/c_fill,g_auto,w_600/f_auto,q_auto/v1666843745/website/1320834676.jpg';
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

    this.productService
      .listProducts({ page: 1, limit: 100 })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.products.set(response.data),
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
