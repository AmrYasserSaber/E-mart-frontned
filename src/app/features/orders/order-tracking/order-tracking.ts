import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';
import {
  BackendOrderStatus,
  OrderDetailsResponse,
  OrdersListItem,
  OrdersService,
} from '../services/orders.service';
import { SkeletonLoader } from '../../../shared/components/skeleton-loader/skeleton-loader';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

interface TrackingUpdate {
  step: string;
  date: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface TrackingItem {
  name: string;
  collection: string;
  price: number;
  quantity: number;
  status: string;
  deliveryType: string;
  expectedArrival: string;
  imageUrl: string;
}

interface TrackedOrder {
  id: string;
  orderNumber: string;
  status: string;
  expectedArrival: string;
  items: TrackingItem[];
  trackingUpdates: TrackingUpdate[];
  total: number;
  createdAt: string;
}

@Component({
  selector: 'app-order-tracking',
  imports: [RouterLink, CurrencyPipe, DatePipe, NgClass, SkeletonLoader, EmptyState],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTrackingComponent {
  private readonly ordersService = inject(OrdersService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly orders = signal<TrackedOrder[]>([]);
  readonly selectedOrderId = signal<string | null>(null);

  readonly selectedOrder = computed(
    () => this.orders().find((order) => order.id === this.selectedOrderId()) ?? null,
  );

  constructor() {
    this.loadOrders();
  }

  retryLoad(): void {
    this.loadOrders();
  }

  selectOrder(orderId: string): void {
    this.selectedOrderId.set(orderId);
  }

  private loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.ordersService
      .getOrders(1, 20)
      .pipe(
        switchMap((response) => {
          if (!response.data.length) {
            return of([] as TrackedOrder[]);
          }

          return forkJoin(
            response.data.map((listItem) =>
              this.ordersService.getOrderById(listItem.id).pipe(
                catchError(() =>
                  of({
                    ...listItem,
                    id: listItem.id,
                    items: [],
                    shippingAddress: {
                      street: '',
                      city: '',
                      zip: '',
                      country: '',
                    },
                    payment: {
                      provider: 'kashier' as const,
                      status: 'pending',
                    },
                  } satisfies OrderDetailsResponse),
                ),
                map((details) => this.mapOrderToTrackingModel(listItem, details)),
              ),
            ),
          );
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (orders) => {
          this.orders.set(orders);
          this.selectedOrderId.set(orders[0]?.id ?? null);
        },
        error: () => {
          this.error.set('Could not load your orders right now.');
        },
      });
  }

  private mapOrderToTrackingModel(
    order: OrdersListItem,
    details: OrderDetailsResponse,
  ): TrackedOrder {
    const orderNumber = `NX-${order.id.slice(0, 4).toUpperCase()}-${order.id.slice(4, 8).toUpperCase()}`;
    const itemCount = details.items.length;

    return {
      id: order.id,
      orderNumber,
      status: this.statusLabel(order.status),
      expectedArrival: this.expectedArrivalByStatus(order.status),
      total: details.total,
      createdAt: details.createdAt,
      items: details.items.map((item, index) => ({
        name: item.product.title,
        collection: itemCount > 1 ? `Order Bundle #${index + 1}` : 'Earth & Ash Collection',
        price: item.price,
        quantity: item.qty,
        status: this.statusLabel(order.status),
        deliveryType: order.status === 'delivered' ? 'Delivered' : 'Express Delivery',
        expectedArrival: this.expectedArrivalByStatus(order.status),
        imageUrl:
          'https://images.ncsl.org/image/upload/c_fill,g_auto,w_600/f_auto,q_auto/v1666843745/website/1320834676.jpg',
      })),
      trackingUpdates: this.buildTrackingSteps(order.status, details.createdAt),
    };
  }

  private statusLabel(status: BackendOrderStatus): string {
    return status.replace('_', ' ').toUpperCase();
  }


  private expectedArrivalByStatus(status: BackendOrderStatus): string {
    if (status === 'delivered') {
      return 'Delivered';
    }
    if (status === 'cancelled') {
      return 'Order cancelled';
    }
    if (status === 'shipped') {
      return 'Tomorrow, 2:00 PM - 5:00 PM';
    }
    return 'Preparing shipment';
  }

  private buildTrackingSteps(status: BackendOrderStatus, createdAt: string): TrackingUpdate[] {
    const steps: Array<{ key: BackendOrderStatus; step: string; description: string }> = [
      {
        key: 'pending',
        step: 'Order Placed',
        description: 'Your order has been successfully placed and is awaiting confirmation.',
      },
      {
        key: 'confirmed',
        step: 'Confirmed',
        description: 'Nexus Market has verified your order and started preparation.',
      },
      {
        key: 'shipped',
        step: 'Shipped',
        description: 'Package left the regional warehouse and is headed towards your city.',
      },
      {
        key: 'delivered',
        step: 'Delivered',
        description: 'Package was delivered to your address.',
      },
    ];

    const currentIndex = Math.max(
      0,
      steps.findIndex((s) => s.key === status),
    );

    return steps.map((step, index) => {
      const completed = status === 'delivered' ? index <= currentIndex : index < currentIndex;
      const current = index === currentIndex && status !== 'delivered';

      return {
        step: step.step,
        date: this.formatRelativeStepDate(createdAt, index),
        description: step.description,
        completed,
        current,
      };
    });
  }

  private formatRelativeStepDate(createdAt: string, offset: number): string {
    const base = new Date(createdAt);
    base.setHours(base.getHours() + offset * 5);

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(base);
  }
}
