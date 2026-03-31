import {
  Component,
  DestroyRef,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import type { Category } from '../../../core/models/category.model';
import { Modal } from '../../../shared/components/modal/modal';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-categories',
  imports: [FormsModule, Modal, ConfirmDialog],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categories implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly formOpen = signal(false);
  readonly formTitle = signal('Create category');
  readonly editing = signal<Category | null>(null);
  readonly formName = signal('');
  readonly formSlug = signal('');
  readonly formParentId = signal<string | null>(null);
  readonly saveLoading = signal(false);

  readonly isCategoryFormValid = computed(
    () => this.formName().trim().length > 0 && this.formSlug().trim().length > 0,
  );

  readonly deleteOpen = signal(false);
  readonly deleting = signal<Category | null>(null);
  readonly deleteLoading = signal(false);

  private getErrorMessage(err: unknown): string {
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object' && 'message' in err) {
      const msg = (err as { message?: unknown }).message;
      if (typeof msg === 'string') return msg;
    }
    return 'Please try again.';
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.admin
      .listCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cats) => {
          this.categories.set(cats);
          this.loadError.set(null);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set('Failed to load categories. Please try again.');
          this.loading.set(false);
        },
      });
  }

  parentName(parentId: string | null): string {
    if (!parentId) return '—';
    const p = this.categories().find((c) => c.id === parentId);
    return p ? p.name : parentId;
  }

  openCreate(): void {
    this.editing.set(null);
    this.formTitle.set('Create category');
    this.formName.set('');
    this.formSlug.set('');
    this.formParentId.set(null);
    this.formOpen.set(true);
  }

  openEdit(cat: Category): void {
    this.editing.set(cat);
    this.formTitle.set('Edit category');
    this.formName.set(cat.name);
    this.formSlug.set(cat.slug);
    this.formParentId.set(cat.parentId);
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saveLoading()) return;
    this.saveLoading.set(false);
    this.formOpen.set(false);
    this.editing.set(null);
  }

  isDescendant(childId: string, ancestorId: string | null | undefined): boolean {
    if (!ancestorId || childId === ancestorId) return false;
    const byId = new Map(this.categories().map((c) => [c.id, c] as const));
    let current = byId.get(childId);
    while (current?.parentId) {
      if (current.parentId === ancestorId) return true;
      current = byId.get(current.parentId);
    }
    return false;
  }

  onNameInput(value: string): void {
    this.formName.set(value);
    if (!this.editing()) {
      this.formSlug.set(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      );
    }
  }

  saveForm(): void {
    const name = this.formName().trim();
    const slug = this.formSlug().trim();
    if (!name || !slug) return;

    this.saveLoading.set(true);
    const body = { name, slug, parentId: this.formParentId() || null };
    const cat = this.editing();

    const op$ = cat
      ? this.admin.updateCategory(cat.id, body)
      : this.admin.createCategory(body);

    op$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saveLoading.set(false);
        this.formOpen.set(false);
        this.editing.set(null);
        this.load();
      },
      error: (err) => {
        this.loadError.set(`Failed to save category. ${this.getErrorMessage(err)}`);
        this.saveLoading.set(false);
      },
    });
  }

  openDelete(cat: Category): void {
    this.deleting.set(cat);
    this.deleteOpen.set(true);
  }

  closeDelete(): void {
    this.deleteLoading.set(false);
    this.deleteOpen.set(false);
    this.deleting.set(null);
  }

  confirmDelete(): void {
    const cat = this.deleting();
    if (!cat || this.deleteLoading()) return;
    this.deleteLoading.set(true);
    this.admin
      .deleteCategory(cat.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.closeDelete();
          this.load();
        },
        error: (err) => {
          this.loadError.set(`Failed to delete category. ${this.getErrorMessage(err)}`);
          this.deleteLoading.set(false);
        },
      });
  }
}
