import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, finalize, switchMap } from 'rxjs';
import { ProductCategory, ProductService } from '../services/product.service';
import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductForm {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly categories = signal<ProductCategory[]>([]);
  readonly imagePreview = signal<string[]>([]);
  readonly selectedFiles = signal<File[]>([]);

  readonly productId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.productId());

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', [Validators.required]],
    description: ['', [Validators.required]],
    stock: [0, [Validators.required, Validators.min(0)]],
    featured: [false],
    visible: [true],
  });

  constructor() {
    this.loadCategories();

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          this.productId.set(id);

          if (!id) {
            this.imagePreview.set([]);
            return EMPTY;
          }

          this.loading.set(true);
          return this.productService.getProduct(id).pipe(finalize(() => this.loading.set(false)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((product) => {
        if (!product) return;

        this.form.patchValue({
          title: product.title,
          price: product.price,
          categoryId: product.categoryId,
          description: product.description,
          stock: product.stock,
          featured: false,
          visible: product.stock > 0,
        });
        this.imagePreview.set(this.normalizePreviewUrls(product.images));
      });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.selectedFiles.set(files);

    if (files.length) {
      const previews = files.map((file) => URL.createObjectURL(file));
      this.imagePreview.set(previews);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();
    const payload = {
      title: value.title.trim(),
      price: Number(value.price),
      categoryId: value.categoryId,
      description: value.description.trim(),
      stock: value.visible ? Number(value.stock) : 0,
      images: this.selectedFiles(),
    };

    const request$ = this.productId()
      ? this.productService.updateProduct(this.productId()!, payload)
      : this.productService.createProduct(payload);

    request$
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.router.navigate(this.targetProductsRoute()),
        error: (err: unknown) => this.error.set(this.toErrorMessage(err)),
      });
  }

  discard(): void {
    this.router.navigate(this.targetProductsRoute());
  }

  private targetProductsRoute(): string[] {
    return this.router.url.startsWith('/admin') ? ['/admin/products'] : ['/seller/products'];
  }

  private normalizePreviewUrls(urls: string[]): string[] {
    const fallback =
      'https://images.ncsl.org/image/upload/c_fill,g_auto,w_600/f_auto,q_auto/v1666843745/website/1320834676.jpg';

    return (urls ?? []).map((url) => {
      const value = (url ?? '').trim();
      if (!value || value.includes('cdn.seed.local')) {
        return fallback;
      }
      return value;
    });
  }

  private toErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'Backend not reachable on localhost:3001. Please start the backend server.';
      }

      if (err.status === 404) {
        return 'Product not found for your current account.';
      }

      if (err.status === 403) {
        return 'You are not allowed to manage this product.';
      }

      const message = err.error?.message;
      if (Array.isArray(message)) {
        return message.join(', ');
      }
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }

    return 'Failed to save product. Please check your data.';
  }

  private loadCategories(): void {
    this.productService
      .listCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((categories) => {
        this.categories.set(categories);
        if (!this.form.controls.categoryId.value && categories[0]) {
          this.form.controls.categoryId.setValue(categories[0].id);
        }
      });
  }
}
