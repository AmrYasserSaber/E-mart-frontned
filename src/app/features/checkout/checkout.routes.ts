import { Routes } from '@angular/router';

export const checkoutRoutes: Routes = [
  {
    path: 'confirmation',
    loadComponent: () =>
      import('./checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./checkout.component').then((m) => m.CheckoutComponent),
  },
];
