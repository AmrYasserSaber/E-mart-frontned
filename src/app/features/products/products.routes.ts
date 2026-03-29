import { Routes } from '@angular/router';

export const productsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./product-list/product-list').then((m) => m.ProductList),
  },
];
