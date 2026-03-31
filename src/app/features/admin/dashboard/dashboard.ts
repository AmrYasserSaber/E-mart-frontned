import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService } from '../services/admin.service';
import type { User } from '../../../core/models/user.model';
import type { Order } from '../../../core/models/order.model';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, TimeAgoPipe, CurrencyFormatPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly admin = inject(AdminService);

  readonly totalUsers = signal(0);
  readonly activeUsers = signal(0);
  readonly totalOrders = signal(0);
  readonly totalProducts = signal(0);
  readonly pendingSellers = signal(0);
  readonly recentUsers = signal<User[]>([]);
  readonly recentOrders = signal<Order[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    forkJoin({
      usersTotal: this.admin.listUsers({ page: 1, limit: 1 }),
      usersActive: this.admin.listUsers({ page: 1, limit: 1, active: true }),
      orders: this.admin.listOrders({ page: 1, limit: 1 }),
      products: this.admin.listProducts({ page: 1, limit: 1 }),
      sellers: this.admin.listPendingSellers({ page: 1, limit: 1 }),
      recentUsers: this.admin.listUsers({ page: 1, limit: 5 }),
      recentOrders: this.admin.listOrders({ page: 1, limit: 5 }),
    }).subscribe({
      next: (r) => {
        this.totalUsers.set(r.usersTotal.total);
        this.activeUsers.set(r.usersActive.total);
        this.totalOrders.set(r.orders.total);
        this.totalProducts.set(r.products.total);
        this.pendingSellers.set(r.sellers.total);
        this.recentUsers.set(r.recentUsers.items);
        this.recentOrders.set(r.recentOrders.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
