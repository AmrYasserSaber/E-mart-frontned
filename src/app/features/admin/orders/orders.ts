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

  readonly OrderStatus = OrderStatus;
  readonly statuses = Object.values(OrderStatus);

  readonly page = signal(1);
  readonly limit = 10;
  readonly statusFilter = signal<OrderStatus | ''>('');
  readonly result = signal<AdminListOrdersResponse | null>(null);
  readonly loading = signal(false);

  readonly editOpen = signal(false);
  readonly editing = signal<Order | null>(null);
  readonly editStatus = signal<OrderStatus>(OrderStatus.PENDING);
  readonly saveLoading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.admin
      .listOrders({
        page: this.page(),
        limit: this.limit,
        status: this.statusFilter() || undefined,
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
    this.saveLoading.set(true);
    this.admin
      .updateOrderStatus(o.id, this.editStatus())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
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
