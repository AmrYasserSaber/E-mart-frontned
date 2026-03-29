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
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Products', path: '/admin/products' },
    { label: 'Categories', path: '/admin/categories' },
    { label: 'Banners', path: '/admin/banners' },
    { label: 'Activity', path: '/admin/activity-feed' },
  ];
}
