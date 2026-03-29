import { Routes } from '@angular/router';

export const sellerRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./products/products').then((m) => m.Products),
  },
];
