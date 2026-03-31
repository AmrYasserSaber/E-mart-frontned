import {
  Component,
  DestroyRef,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of, catchError } from 'rxjs';
import { AdminService } from '../services/admin.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

export interface ActivityItem {
  id: string;
  kind: 'user' | 'order';
  title: string;
  detail: string;
  date: string;
}

@Component({
  selector: 'app-activity-feed',
  imports: [TimeAgoPipe],
  templateUrl: './activity-feed.html',
  styleUrl: './activity-feed.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFeed implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = signal<ActivityItem[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    forkJoin({
      users: this.admin.listUsers({ page: 1, limit: 10 }).pipe(
        catchError(() => of({ items: [] as never[] })),
      ),
      orders: this.admin.listOrders({ page: 1, limit: 10 }).pipe(
        catchError(() => of({ data: [] as never[] })),
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ users, orders }) => {
          const activity: ActivityItem[] = [];

          for (const u of users.items) {
            activity.push({
              id: `user-${u.id}`,
              kind: 'user',
              title: `New user: ${u.firstName} ${u.lastName}`,
              detail: u.email,
              date: u.createdAt,
            });
          }

          for (const o of orders.data) {
            activity.push({
              id: `order-${o.id}`,
              kind: 'order',
              title: `Order placed`,
              detail: `$${o.total.toFixed(2)} · ${o.items.length} item(s) · ${o.status}`,
              date: o.createdAt,
            });
          }

          activity.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

          this.items.set(activity.slice(0, 20));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
