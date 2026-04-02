import { Routes } from '@angular/router';

export const sellerRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./seller-layout/seller-layout').then((m) => m.SellerLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'products',
      },
      {
        path: 'products',
        loadComponent: () => import('./products/products').then((m) => m.Products),
      },
      {
        path: 'products/new',
        loadComponent: () => import('./product-form/product-form').then((m) => m.ProductForm),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./product-form/product-form').then((m) => m.ProductForm),
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/orders').then((m) => m.Orders),
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./orders/order-details').then((m) => m.OrderDetails),
      },
    ],
  },
];
