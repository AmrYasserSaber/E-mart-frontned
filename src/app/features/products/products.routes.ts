import { Routes } from '@angular/router';

export const productsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./product-list/product-list').then((m) => m.ProductList),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./product-details/product-details').then((m) => m.ProductDetails),
  },
];
