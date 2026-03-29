import {
  Component,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../services/admin.service';
import type { User } from '../../../core/models/user.model';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, TimeAgoPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly admin = inject(AdminService);

  readonly totalUsers = signal(0);
  readonly activeUsers = signal(0);
  readonly recentUsers = signal<User[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.admin.listUsers({ page: 1, limit: 1 }).subscribe({
      next: (r) => this.totalUsers.set(r.total),
      error: () => this.totalUsers.set(0),
    });
    this.admin.listUsers({ page: 1, limit: 1, active: true }).subscribe({
      next: (r) => this.activeUsers.set(r.total),
      error: () => this.activeUsers.set(0),
    });
    this.admin.listUsers({ page: 1, limit: 5 }).subscribe({
      next: (r) => {
        this.recentUsers.set(r.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
