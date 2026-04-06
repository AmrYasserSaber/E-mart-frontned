import {
  Component,
  DestroyRef,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AdminService,
  type AdminListSellersResponse,
} from '../services/admin.service';
import type { PendingSeller } from '../../../core/models/seller-admin.model';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-sellers',
  imports: [Pagination, ConfirmDialog, TimeAgoPipe, TruncatePipe],
  templateUrl: './sellers.html',
  styleUrl: './sellers.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sellers implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly page = signal(1);
  readonly limit = 10;
  readonly result = signal<AdminListSellersResponse | null>(null);
  readonly loading = signal(false);

  readonly approveOpen = signal(false);
  readonly approving = signal<PendingSeller | null>(null);
  readonly approveLoading = signal(false);
  readonly rejectOpen = signal(false);
  readonly rejecting = signal<PendingSeller | null>(null);
  readonly rejectLoading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.admin
      .listPendingSellers({ page: this.page(), limit: this.limit })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.result.set(r);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onPageChange(p: number): void {
    this.page.set(p);
    this.load();
  }

  openApprove(seller: PendingSeller): void {
    this.approving.set(seller);
    this.approveOpen.set(true);
  }

  closeApprove(): void {
    this.approveLoading.set(false);
    this.approveOpen.set(false);
    this.approving.set(null);
  }

  openReject(seller: PendingSeller): void {
    this.rejecting.set(seller);
    this.rejectOpen.set(true);
  }

  closeReject(): void {
    this.rejectLoading.set(false);
    this.rejectOpen.set(false);
    this.rejecting.set(null);
  }

  confirmApprove(): void {
    const s = this.approving();
    if (!s) return;
    this.approveLoading.set(true);
    this.admin
      .approveSellerStore(s.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.closeApprove();
          this.load();
        },
        error: () => this.approveLoading.set(false),
      });
  }

  confirmReject(): void {
    const s = this.rejecting();
    if (!s) return;
    this.rejectLoading.set(true);
    this.admin
      .rejectSellerStore(s.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.closeReject();
          this.load();
        },
        error: () => this.rejectLoading.set(false),
      });
  }
}
