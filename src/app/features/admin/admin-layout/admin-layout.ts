import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar, type SidebarNavItem } from '../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  readonly nav: SidebarNavItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Users', path: '/admin/users', icon: 'group' },
    { label: 'Orders', path: '/admin/orders', icon: 'shopping_cart' },
    { label: 'Products', path: '/admin/products', icon: 'inventory_2' },
    { label: 'Categories', path: '/admin/categories', icon: 'category' },
    { label: 'Sellers', path: '/admin/sellers', icon: 'storefront' },
    { label: 'Activity', path: '/admin/activity-feed', icon: 'insights' },
  ];
}
