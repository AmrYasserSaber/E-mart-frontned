import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { AdminService } from '../services/admin.service';
import type { User } from '../../../core/models/user.model';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { ToastService } from '../../../core/services/toast.service';

interface DashboardActivity {
  id: string;
  kind: 'user' | 'order';
  title: string;
  detail: string;
  date: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, TimeAgoPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);

  readonly totalUsers = signal(0);
  readonly activeUsers = signal(0);
  readonly totalOrders = signal(0);
  readonly totalProducts = signal(0);
  readonly pendingSellers = signal(0);
  readonly recentUsers = signal<User[]>([]);
  readonly recentActivity = signal<DashboardActivity[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    forkJoin({
      usersTotal: this.admin.listUsers({ page: 1, limit: 1 }).pipe(
        catchError(() => of({ items: [], total: 0, page: 1, limit: 1, totalPages: 0 })),
      ),
      usersActive: this.admin.listUsers({ page: 1, limit: 1, active: true }).pipe(
        catchError(() => of({ items: [], total: 0, page: 1, limit: 1, totalPages: 0 })),
      ),
      orders: this.admin.listOrders({ page: 1, limit: 1 }).pipe(
        catchError(() => of({ data: [], total: 0, page: 1, limit: 1, totalPages: 0 })),
      ),
      products: this.admin.listProducts({ page: 1, limit: 1 }).pipe(
        catchError(() => of({ data: [], total: 0, page: 1, limit: 1, totalPages: 0 })),
      ),
      sellers: this.admin.listPendingSellers({ page: 1, limit: 1 }).pipe(
        catchError(() => of({ data: [], total: 0, page: 1, limit: 1, totalPages: 0 })),
      ),
      recentUsers: this.admin.listUsers({ page: 1, limit: 5 }).pipe(
        catchError(() => of({ items: [] as never[], total: 0, page: 1, limit: 5, totalPages: 0 })),
      ),
      recentOrders: this.admin.listOrders({ page: 1, limit: 5 }).pipe(
        catchError(() => of({ data: [] as never[], total: 0, page: 1, limit: 5, totalPages: 0 })),
      ),
    }).subscribe({
      next: (r) => {
        this.totalUsers.set(r.usersTotal.total);
        this.activeUsers.set(r.usersActive.total);
        this.totalOrders.set(r.orders.total);
        this.totalProducts.set(r.products.total);
        this.pendingSellers.set(r.sellers.total);
        this.recentUsers.set(r.recentUsers.items);

        const activity: DashboardActivity[] = [];
        for (const u of r.recentUsers.items) {
          activity.push({
            id: `user-${u.id}`,
            kind: 'user',
            title: `New user: ${u.firstName} ${u.lastName}`,
            detail: u.email,
            date: u.createdAt,
          });
        }
        for (const o of r.recentOrders.data) {
          activity.push({
            id: `order-${o.id}`,
            kind: 'order',
            title: 'Order placed',
            detail: `$${o.total.toFixed(2)} · ${o.items.length} item(s) · ${o.status}`,
            date: o.createdAt,
          });
        }
        activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.recentActivity.set(activity.slice(0, 8));
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load dashboard data.');
        this.loading.set(false);
      },
    });
  }
}
