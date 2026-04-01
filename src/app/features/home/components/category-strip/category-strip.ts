import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Category } from '../../../../core/models/category.model';
import { ProductsService } from '../../../../core/services/products.service';

const STATIC_CATEGORIES: { label: string; categoryId?: string }[] = [
  { label: 'Living Space' },
  { label: 'Kitchen & Dining' },
  { label: 'Textiles' },
  { label: 'Art & Prints' },
  { label: 'Apothecary' },
  { label: 'Workspaces' },
];

@Component({
  selector: 'app-category-strip',
  imports: [RouterLink],
  templateUrl: './category-strip.html',
  styleUrl: './category-strip.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryStrip {
  private readonly productsService = inject(ProductsService);
  private readonly destroyRef = inject(DestroyRef);

  /** Resolved from API when available; otherwise static labels only. */
  readonly categories = signal<Category[]>([]);

  readonly staticFallback = STATIC_CATEGORIES;

  constructor() {
    this.productsService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => this.categories.set(c),
        error: () => this.categories.set([]),
      });
  }
}
