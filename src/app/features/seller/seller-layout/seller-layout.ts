import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar, type SidebarNavItem } from '../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-seller-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './seller-layout.html',
  styleUrl: './seller-layout.css',
})
export class SellerLayout {
  readonly nav: SidebarNavItem[] = [
    { label: 'Products', path: '/seller/products', icon: 'inventory_2' },
    { label: 'Orders', path: '/seller/orders', icon: 'shopping_cart' },
  ];
}
