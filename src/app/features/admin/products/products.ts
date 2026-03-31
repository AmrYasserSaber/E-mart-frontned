import {
  Component,
  DestroyRef,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  type AdminListProductsResponse,
} from '../services/admin.service';
import type { Product } from '../../../core/models/product.model';
import type { Category } from '../../../core/models/category.model';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-products',
  imports: [FormsModule, Pagination, ConfirmDialog, CurrencyFormatPipe, TruncatePipe, TimeAgoPipe],
  templateUrl: './products.html',
  styleUrl: './products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly page = signal(1);
  readonly limit = 10;
  readonly searchInput = signal('');
  readonly categoryFilter = signal('');
  readonly sortFilter = signal<'price_asc' | 'price_desc' | 'newest' | ''>('');
  readonly result = signal<AdminListProductsResponse | null>(null);
  readonly loading = signal(false);
  readonly categories = signal<Category[]>([]);

  readonly deleteOpen = signal(false);
  readonly deleting = signal<Product | null>(null);
  readonly deleteLoading = signal(false);

  ngOnInit(): void {
    this.loadCategories();
    this.load();
  }

  loadCategories(): void {
    this.admin
      .listCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (cats) => this.categories.set(cats) });
  }

  load(): void {
    this.loading.set(true);
    this.admin
      .listProducts({
        page: this.page(),
        limit: this.limit,
        search: this.searchInput().trim() || undefined,
        categoryId: this.categoryFilter() || undefined,
        sort: this.sortFilter() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.result.set(r);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  onPageChange(p: number): void {
    this.page.set(p);
    this.load();
  }

  categoryName(id: string): string {
    const c = this.categories().find((cat) => cat.id === id);
    return c ? c.name : '—';
  }

  openDelete(p: Product): void {
    this.deleting.set(p);
    this.deleteOpen.set(true);
  }

  closeDelete(): void {
    this.deleteLoading.set(false);
    this.deleteOpen.set(false);
    this.deleting.set(null);
  }

  confirmDelete(): void {
    const p = this.deleting();
    if (!p) return;
    this.deleteLoading.set(true);
    this.admin
      .deleteProduct(p.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.closeDelete();
          this.load();
        },
        error: () => this.deleteLoading.set(false),
      });
  }
}
