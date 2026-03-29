import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./order-tracking/order-tracking').then((m) => m.OrderTracking),
  },
];
