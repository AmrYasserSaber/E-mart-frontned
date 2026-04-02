import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, distinctUntilChanged, map, switchMap } from 'rxjs';
import { OrdersService, type OrderDetailsResponse } from '../../../orders/services/orders.service';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-order-details',
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    NgClass,
    TitleCasePipe,
    SkeletonLoader,
    EmptyState,
  ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersService = inject(OrdersService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly order = signal<OrderDetailsResponse | null>(null);

  readonly orderNumber = computed(() => {
    const id = this.order()?.id;
    if (!id) return '';
    return `#${id.slice(0, 8).toUpperCase()}`;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('orderId')),
        distinctUntilChanged(),
        switchMap((orderId) => {
          this.loading.set(true);
          this.error.set(null);
          this.order.set(null);
          if (!orderId) {
            this.loading.set(false);
            this.error.set('No order ID provided.');
            return EMPTY;
          }
          return this.ordersService.getOrderById(orderId).pipe(
            catchError(() => {
              this.error.set('Could not load this order. Please try again.');
              this.loading.set(false);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (orderData) => {
          this.order.set(orderData);
          this.loading.set(false);
        },
      });
  }

  statusIcon(status: string): string {
    const map: Record<string, string> = {
      pending: 'schedule',
      confirmed: 'task_alt',
      shipped: 'local_shipping',
      delivered: 'check_circle',
      cancelled: 'cancel',
    };
    return map[status] ?? 'info';
  }

  paymentProviderLabel(provider: string): string {
    return provider === 'cash_on_delivery' ? 'Cash on Delivery' : 'Kashier';
  }

  paymentStatusIcon(status: string): string {
    const map: Record<string, string> = {
      paid: 'verified',
      pending: 'hourglass_top',
      failed: 'error',
    };
    return map[status] ?? 'info';
  }

  isActiveOrder(status: string): boolean {
    return status === 'pending' || status === 'confirmed' || status === 'shipped';
  }

  lineTotal(price: number, qty: number): number {
    return price * qty;
  }
}
