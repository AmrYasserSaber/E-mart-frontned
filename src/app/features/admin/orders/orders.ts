import {
  Component,
  DestroyRef,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, of, switchMap, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  AdminService,
  type AdminListOrdersResponse,
} from '../services/admin.service';
import type { Order } from '../../../core/models/order.model';
import { OrderStatus } from '../../../core/models/order.model';
import { Modal } from '../../../shared/components/modal/modal';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-orders',
  imports: [FormsModule, Modal, Pagination, TimeAgoPipe, CurrencyFormatPipe, TruncatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Orders implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();

  readonly OrderStatus = OrderStatus;
  readonly statuses = Object.values(OrderStatus);

  readonly page = signal(1);
  readonly limit = 10;
  readonly statusFilter = signal<OrderStatus | ''>('');
  readonly result = signal<AdminListOrdersResponse | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly editOpen = signal(false);
  readonly editing = signal<Order | null>(null);
  readonly editStatus = signal<OrderStatus>(OrderStatus.PENDING);
  readonly saveLoading = signal(false);

  ngOnInit(): void {
    this.reload$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.loadError.set(null);
        }),
        switchMap(() =>
          this.admin.listOrders({
            page: this.page(),
            limit: this.limit,
            status: this.statusFilter() || undefined,
          }).pipe(
            catchError(() => {
              this.result.set(null);
              this.loadError.set('Failed to load orders. Please try again.');
              this.loading.set(false);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (r) => {
          if (!r) return;
          this.result.set(r);
          this.loadError.set(null);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    this.reload$.next();
  }

  load(): void {
    this.reload$.next();
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  onPageChange(p: number): void {
    this.page.set(p);
    this.load();
  }

  openEdit(o: Order): void {
    this.editing.set(o);
    this.editStatus.set(o.status);
    this.editOpen.set(true);
  }

  closeEdit(): void {
    this.saveLoading.set(false);
    this.editOpen.set(false);
    this.editing.set(null);
  }

  saveEdit(): void {
    const o = this.editing();
    if (!o) return;
    if (o.status === this.editStatus()) {
      this.closeEdit();
      return;
    }
    this.saveLoading.set(true);
    this.admin
      .updateOrderStatus(o.id, this.editStatus())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          const current = this.result();
          if (current) {
            this.result.set({
              ...current,
              data: current.data.map((order) =>
                order.id === o.id
                  ? {
                      ...order,
                      status: updated.status,
                      updatedAt: updated.updatedAt,
                    }
                  : order,
              ),
            });
          }
          this.saveLoading.set(false);
          this.closeEdit();
          this.load();
        },
        error: () => this.saveLoading.set(false),
      });
  }

  statusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.SHIPPED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  }
}
