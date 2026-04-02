import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from '../services/profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Modal } from '../../../shared/components/modal/modal';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
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
  imports: [
    ProductCard,
    DatePipe,
    CurrencyPipe,
    Pagination,
    ReactiveFormsModule,
    Modal,
    ConfirmDialog,
  ],
  templateUrl: './profile-home.html',
  styleUrl: './profile-home.css',
})
export class ProfileHome implements OnInit {
  private readonly fb = inject(FormBuilder);

  private static readonly MAX_ADDRESSES = 3;

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
  deleteConfirmationOpen = signal(false);
  addressIdPendingDelete = signal<string | null>(null);
  removingWishlistId = signal<string | null>(null);

  showAddressModal = signal(false);
  editingAddressId = signal<string | null>(null);
  savingAddress = signal(false);

  addressForm = this.fb.group({
    label: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    street: ['', [Validators.required, Validators.minLength(3)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    isPrimary: [false],
  });

  readonly tabs: { key: ProfileTab; label: string; icon: string }[] = [
    { key: 'orders', label: 'Orders', icon: 'shopping_bag' },
    { key: 'wishlist', label: 'Wishlist', icon: 'favorite' },
    { key: 'addresses', label: 'Addresses', icon: 'location_on' },
  ];

  private readonly toast = inject(ToastService);

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
        this.toast.success('Removed from wishlist.');
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
        if (this.addressIdPendingDelete() === id) {
          this.deleteConfirmationOpen.set(false);
          this.addressIdPendingDelete.set(null);
        }
      },
      error: () => this.deletingAddressId.set(null),
    });
  }

  canAddNewAddress(): boolean {
    return this.addresses().length < ProfileHome.MAX_ADDRESSES;
  }

  openAddAddressModal(): void {
    if (!this.canAddNewAddress()) {
      this.toast.error(`You can only save up to ${ProfileHome.MAX_ADDRESSES} addresses.`);
      return;
    }
    this.editingAddressId.set(null);
    this.addressForm.reset({
      isPrimary: false,
      firstName: this.profile()?.firstName || '',
      lastName: this.profile()?.lastName || '',
    });
    this.showAddressModal.set(true);
  }

  requestDeleteAddress(address: Address): void {
    if (this.deletingAddressId()) return;
    this.addressIdPendingDelete.set(address.id);
    this.deleteConfirmationOpen.set(true);
  }

  cancelDeleteAddress(): void {
    if (this.deletingAddressId()) return;
    this.deleteConfirmationOpen.set(false);
    this.addressIdPendingDelete.set(null);
  }

  confirmDeleteAddress(): void {
    const id = this.addressIdPendingDelete();
    if (!id) return;
    this.deleteAddress(id);
  }

  pendingDeleteAddress(): Address | null {
    const id = this.addressIdPendingDelete();
    if (!id) return null;
    return this.addresses().find((a) => a.id === id) ?? null;
  }

  deleteConfirmationMessage(): string {
    const addr = this.pendingDeleteAddress();
    if (!addr) return 'Permanently delete this address? This cannot be undone.';
    return `Permanently delete "${addr.label}" (${addr.street}, ${addr.city})? This cannot be undone.`;
  }

  openEditAddressModal(address: Address): void {
    this.editingAddressId.set(address.id);
    this.addressForm.patchValue({
      label: address.label === 'Address' ? '' : address.label,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      isPrimary: address.isPrimary,
    });
    this.showAddressModal.set(true);
  }

  closeAddressModal(): void {
    this.showAddressModal.set(false);
  }

  saveAddress(): void {
    if (this.addressForm.invalid || this.savingAddress()) return;
    this.savingAddress.set(true);
    const data = this.addressForm.value;
    const req = {
      label: data.label || undefined,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || undefined,
      street: data.street || '',
      city: data.city || '',
      isPrimary: !!data.isPrimary,
    };

    const id = this.editingAddressId();
    if (id) {
      this.profileService.updateAddress(id, req).subscribe({
        next: (addr) => {
          this.addresses.update((list) => list.map((a) => (a.id === id ? addr : a)));
          if (addr.isPrimary) {
            this.loadAddresses();
          }
          this.savingAddress.set(false);
          this.closeAddressModal();
        },
        error: () => this.savingAddress.set(false),
      });
    } else {
      this.profileService.createAddress(req).subscribe({
        next: (addr) => {
          this.addresses.update((list) => [...list, addr]);
          if (addr.isPrimary) {
            this.loadAddresses();
          }
          this.savingAddress.set(false);
          this.closeAddressModal();
        },
        error: () => this.savingAddress.set(false),
      });
    }
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

    this.loadAddresses();

    this.profileService.getWishlist().subscribe((items) => {
      this.wishlist.set(items);
    });
  }

  private loadAddresses(): void {
    this.profileService.getAddresses().subscribe((addresses) => {
      this.addresses.set(addresses);
    });
  }
}
