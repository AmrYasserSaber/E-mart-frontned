import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { ProfileService } from '../services/profile.service';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { Pagination } from '../../../shared/components/pagination/pagination';
import type {
  Address,
  ProfileTab,
  RecentOrder,
  UserProfile,
  WishlistItem,
} from '../models/profile.models';
import type { Product } from '../../../core/models/product.model';

const ORDERS_PER_PAGE = 8;

@Component({
  selector: 'app-profile-home',
  imports: [ProductCard, DatePipe, CurrencyPipe, Pagination],
  templateUrl: './profile-home.html',
  styleUrl: './profile-home.css',
})
export class ProfileHome implements OnInit {
  profile = signal<UserProfile | null>(null);
  addresses = signal<Address[]>([]);
  wishlist = signal<WishlistItem[]>([]);
  recentOrders = signal<RecentOrder[]>([]);
  ordersPage = signal(1);
  ordersTotalPages = signal(1);
  ordersTotal = signal(0);
  ordersLoading = signal(true);
  activeTab = signal<ProfileTab>('orders');
  loading = signal(true);
  deletingAddressId = signal<string | null>(null);
  removingWishlistId = signal<string | null>(null);

  readonly tabs: { key: ProfileTab; label: string; icon: string }[] = [
    { key: 'orders', label: 'Orders', icon: 'shopping_bag' },
    { key: 'wishlist', label: 'Wishlist', icon: 'favorite' },
    { key: 'addresses', label: 'Addresses', icon: 'location_on' },
  ];

  constructor(
    private readonly profileService: ProfileService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProfileData();
    this.loadOrders(1);
  }

  setTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  navigateToEditProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  onOrdersPageChange(page: number): void {
    this.loadOrders(page);
  }

  toProduct(item: WishlistItem): Product {
    return {
      id: item.productId,
      title: item.title,
      price: item.price,
      images: item.images,
      ratingAvg: item.ratingAvg ?? undefined,
    };
  }

  removeFromWishlist(event: Event, productId: string): void {
    event.stopPropagation();
    if (this.removingWishlistId()) return;
    this.removingWishlistId.set(productId);
    this.profileService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.wishlist.update((list) => list.filter((w) => w.productId !== productId));
        this.removingWishlistId.set(null);
      },
      error: () => this.removingWishlistId.set(null),
    });
  }

  deleteAddress(id: string): void {
    if (this.deletingAddressId()) return;
    this.deletingAddressId.set(id);
    this.profileService.deleteAddress(id).subscribe({
      next: () => {
        this.addresses.update((list) => list.filter((a) => a.id !== id));
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

  primaryAddress(): Address | null {
    return this.addresses().find((a) => a.isPrimary) ?? null;
  }

  private loadOrders(page: number): void {
    this.ordersLoading.set(true);
    this.profileService.getRecentOrders(page, ORDERS_PER_PAGE).subscribe({
      next: (result) => {
        this.recentOrders.set(result.orders);
        this.ordersPage.set(result.page);
        this.ordersTotalPages.set(result.pages);
        this.ordersTotal.set(result.total);
        this.ordersLoading.set(false);
      },
      error: () => this.ordersLoading.set(false),
    });
  }

  private loadProfileData(): void {
    this.loading.set(true);

    this.profileService.getProfile().subscribe((profile) => {
      this.profile.set(profile);
      this.loading.set(false);
    });

    this.profileService.getAddresses().subscribe((addresses) => {
      this.addresses.set(addresses);
    });

    this.profileService.getWishlist().subscribe((items) => {
      this.wishlist.set(items);
    });
  }
}
