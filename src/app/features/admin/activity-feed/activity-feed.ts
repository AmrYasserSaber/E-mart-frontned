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
import type { User } from '../../../core/models/user.model';
import type { Order } from '../../../core/models/order.model';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

export interface ActivityItem {
  id: string;
  kind: 'user' | 'order';
  title: string;
  detail: string;
  date: string;
}

type UsersFeedResult = {
  items: User[];
  __error?: boolean;
  __errorDetail?: unknown;
};

type OrdersFeedResult = {
  data: Order[];
  __error?: boolean;
  __errorDetail?: unknown;
};

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
  readonly feedLoadError = signal<string | null>(null);

  ngOnInit(): void {
    forkJoin({
      users: this.admin.listUsers({ page: 1, limit: 10 }).pipe(
        catchError((err) =>
          of({
            items: [] as User[],
            __error: true,
            __errorDetail: err,
          } satisfies UsersFeedResult),
        ),
      ),
      orders: this.admin.listOrders({ page: 1, limit: 10 }).pipe(
        catchError((err) =>
          of({
            data: [] as Order[],
            __error: true,
            __errorDetail: err,
          } satisfies OrdersFeedResult),
        ),
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
          const hasSourceError =
            ('__error' in users && !!users.__error) ||
            ('__error' in orders && !!orders.__error);
          this.feedLoadError.set(
            hasSourceError && activity.length === 0
              ? 'Failed to load activity right now. Please try again.'
              : null,
          );
          this.loading.set(false);
        },
        error: () => {
          this.feedLoadError.set('Failed to load activity right now. Please try again.');
          this.loading.set(false);
        },
      });
  }
}
