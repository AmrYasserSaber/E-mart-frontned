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

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.admin
      .listCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cats) => {
          this.categories.set(cats);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
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
    this.saveLoading.set(false);
    this.formOpen.set(false);
    this.editing.set(null);
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
        this.closeForm();
        this.load();
      },
      error: () => this.saveLoading.set(false),
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
    if (!cat) return;
    this.deleteLoading.set(true);
    this.admin
      .deleteCategory(cat.id)
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
