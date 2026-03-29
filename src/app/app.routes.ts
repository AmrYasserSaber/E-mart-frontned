import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./features/products/products.routes').then(
        (m) => m.productsRoutes,
      ),
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/cart/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/checkout/checkout.routes').then(
        (m) => m.checkoutRoutes,
      ),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/orders/orders.routes').then((m) => m.ordersRoutes),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/profile/profile.routes').then(
        (m) => m.profileRoutes,
      ),
  },
  {
    path: 'seller',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/seller/seller.routes').then((m) => m.sellerRoutes),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
