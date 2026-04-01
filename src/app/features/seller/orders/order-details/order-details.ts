import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap } from 'rxjs';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { OrderDetailsResponse, OrderService, OrderStatus } from '../../services/order.service';

interface TrackingStep {
  label: string;
  description: string;
  completed: boolean;
  current: boolean;
}

@Component({
  selector: 'app-order-details',
  imports: [RouterLink, CurrencyPipe, DatePipe, NgClass, EmptyState],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly updating = signal(false);
  readonly error = signal<string | null>(null);
  readonly order = signal<OrderDetailsResponse | null>(null);

  readonly selectedStatus = signal<Exclude<OrderStatus, 'cancelled'>>('confirmed');

  readonly orderNumber = computed(() => {
    const id = this.order()?.id;
    return id ? `NX-${id.slice(0, 4).toUpperCase()}-${id.slice(4, 8).toUpperCase()}` : '';
  });

  readonly trackingSteps = computed(() => {
    const status = this.order()?.status ?? 'pending';

    const states: Array<{ key: OrderStatus; label: string; description: string }> = [
      {
        key: 'pending',
        label: 'Order Placed',
        description: 'Your order has been successfully placed and is awaiting confirmation.',
      },
      {
        key: 'confirmed',
        label: 'Confirmed',
        description: 'The order has been verified and is now being prepared.',
      },
      {
        key: 'shipped',
        label: 'Shipped',
        description: 'Package left the regional warehouse and is headed towards your city.',
      },
      {
        key: 'delivered',
        label: 'Delivered',
        description: 'Package was delivered successfully.',
      },
    ];

    const currentIndex = Math.max(
      0,
      states.findIndex((step) => step.key === status),
    );

    return states.map(
      (step, index): TrackingStep => ({
        label: step.label,
        description: step.description,
        completed: status === 'delivered' ? index <= currentIndex : index < currentIndex,
        current: index === currentIndex && status !== 'delivered',
      }),
    );
  });

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            throw new Error('Missing order id');
          }
          this.loading.set(true);
          this.error.set(null);
          return this.orderService.getOrder(id).pipe(finalize(() => this.loading.set(false)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (order) => {
          this.order.set(order);
          if (order.status !== 'cancelled') {
            this.selectedStatus.set(order.status as Exclude<OrderStatus, 'cancelled'>);
          }
        },
        error: () => {
          this.error.set('Failed to load order details.');
        },
      });
  }

  updateStatus(): void {
    const order = this.order();
    if (!order || order.status === 'cancelled') {
      return;
    }

    this.updating.set(true);

    this.orderService
      .updateOrderStatus(order.id, this.selectedStatus())
      .pipe(
        finalize(() => this.updating.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updated) => {
          this.order.update((old) =>
            old
              ? {
                  ...old,
                  status: updated.status,
                }
              : old,
          );
        },
        error: () => {
          this.error.set('Failed to update order status.');
        },
      });
  }
}
