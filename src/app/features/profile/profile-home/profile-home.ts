import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import type {
  AccountStats,
  Address,
  PaymentMethod,
  ProfileTab,
  RecentOrder,
  UserProfile,
} from '../models/profile.models';

@Component({
  selector: 'app-profile-home',
  imports: [],
  templateUrl: './profile-home.html',
  styleUrl: './profile-home.css',
})
export class ProfileHome implements OnInit {
  profile = signal<UserProfile | null>(null);
  stats = signal<AccountStats | null>(null);
  paymentMethods = signal<PaymentMethod[]>([]);
  primaryAddress = signal<Address | null>(null);
  addresses = signal<Address[]>([]);
  recentOrders = signal<RecentOrder[]>([]);
  activeTab = signal<ProfileTab>('orders');
  loading = signal(true);
  deletingAddressId = signal<string | null>(null);

  readonly tabs: { key: ProfileTab; label: string; icon: string }[] = [
    { key: 'orders', label: 'Orders', icon: 'shopping_bag' },
    { key: 'wishlist', label: 'Wishlist', icon: 'favorite' },
    { key: 'addresses', label: 'Addresses', icon: 'location_on' },
    { key: 'payment', label: 'Payment', icon: 'payments' },
  ];

  constructor(
    private readonly profileService: ProfileService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProfileData();
  }

  setTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  navigateToEditProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  deleteAddress(id: string): void {
    if (this.deletingAddressId()) return;
    this.deletingAddressId.set(id);
    this.profileService.deleteAddress(id).subscribe({
      next: () => {
        this.addresses.update((list) => list.filter((a) => a.id !== id));
        if (this.primaryAddress()?.id === id) this.primaryAddress.set(null);
        this.deletingAddressId.set(null);
      },
      error: () => this.deletingAddressId.set(null),
    });
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      pending: 'schedule',
      confirmed: 'task_alt',
      shipped: 'local_shipping',
      delivered: 'check_circle',
      cancelled: 'cancel',
    };
    return map[status] ?? 'info';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'In Transit',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return map[status] ?? status;
  }

  isActiveOrder(status: string): boolean {
    return status === 'pending' || status === 'confirmed' || status === 'shipped';
  }

  private loadProfileData(): void {
    this.loading.set(true);

    this.profileService.getProfile().subscribe((profile) => {
      this.profile.set(profile);
      this.loading.set(false);
    });

    this.profileService.getAccountStats().subscribe((stats) => {
      this.stats.set(stats);
    });

    this.profileService.getPaymentMethods().subscribe((methods) => {
      this.paymentMethods.set(methods);
    });

    this.profileService.getPrimaryAddress().subscribe((address) => {
      this.primaryAddress.set(address);
    });

    this.profileService.getAddresses().subscribe((addresses) => {
      this.addresses.set(addresses);
    });

    this.profileService.getRecentOrders().subscribe((orders) => {
      this.recentOrders.set(orders);
    });
  }
}
