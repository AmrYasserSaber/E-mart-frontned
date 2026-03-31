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
import { AdminService, type AdminListUsersResponse } from '../services/admin.service';
import type { User } from '../../../core/models/user.model';
import { Role } from '../../../core/models/user.model';
import { Modal } from '../../../shared/components/modal/modal';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-users',
  imports: [FormsModule, Modal, Pagination, TimeAgoPipe],
  templateUrl: './users.html',
  styleUrl: './users.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly RoleEnum = Role;

  readonly page = signal(1);
  readonly limit = 10;
  readonly searchInput = signal('');
  readonly roleFilter = signal<Role | ''>('');
  readonly activeFilter = signal<'all' | 'true' | 'false'>('all');
  readonly result = signal<AdminListUsersResponse | null>(null);
  readonly loading = signal(false);

  readonly editOpen = signal(false);
  readonly editing = signal<User | null>(null);
  readonly editRole = signal<Role>(Role.USER);
  readonly editActive = signal(true);
  readonly saveLoading = signal(false);

  readonly selectedIds = signal<Set<string>>(new Set());
  readonly selectedCount = computed(() => this.selectedIds().size);
  readonly hasSelection = computed(() => this.selectedIds().size > 0);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const active =
      this.activeFilter() === 'all'
        ? undefined
        : this.activeFilter() === 'true';
    this.admin
      .listUsers({
        page: this.page(),
        limit: this.limit,
        search: this.searchInput().trim() || undefined,
        role: this.roleFilter() || undefined,
        active,
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
    this.selectedIds.set(new Set());
    this.load();
  }

  onPageChange(p: number): void {
    this.page.set(p);
    this.selectedIds.set(new Set());
    this.load();
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelect(id: string): void {
    const next = new Set(this.selectedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selectedIds.set(next);
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  editSelected(): void {
    const items = this.result()?.items ?? [];
    const first = items.find((u) => this.selectedIds().has(u.id));
    if (first) this.openEdit(first);
  }

  verifySelected(): void {
    const ids = [...this.selectedIds()];
    if (!ids.length) return;
    let completed = 0;
    for (const id of ids) {
      this.admin
        .verifyUser(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            completed++;
            if (completed === ids.length) {
              this.selectedIds.set(new Set());
              this.load();
            }
          },
        });
    }
  }

  openEdit(u: User): void {
    this.editing.set(u);
    this.editRole.set(u.role);
    this.editActive.set(u.active ?? true);
    this.editOpen.set(true);
  }

  closeEdit(): void {
    this.saveLoading.set(false);
    this.editOpen.set(false);
    this.editing.set(null);
  }

  saveEdit(): void {
    const u = this.editing();
    if (!u) return;
    this.saveLoading.set(true);
    this.admin
      .manageUser(u.id, {
        role: this.editRole(),
        active: this.editActive(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saveLoading.set(false);
          this.closeEdit();
          this.selectedIds.set(new Set());
          this.load();
        },
        error: () => {
          this.saveLoading.set(false);
        },
      });
  }
}
