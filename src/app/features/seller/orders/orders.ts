import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { OrderService, OrdersListItem } from '../services/order.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { SkeletonLoader } from '../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, CurrencyPipe, DatePipe, NgClass, EmptyState, SkeletonLoader],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Orders {
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly orders = signal<OrdersListItem[]>([]);

  constructor() {
    this.loadOrders();
  }

  retry(): void {
    this.loadOrders();
  }

  orderNumber(id: string): string {
    return `NX-${id.slice(0, 4).toUpperCase()}-${id.slice(4, 8).toUpperCase()}`;
  }

  statusLabel(status: string): string {
    return status.toUpperCase();
  }

  private loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService
      .listOrders(1, 30)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.orders.set(response.data),
        error: () => this.error.set('Unable to load orders.'),
      });
  }
}
