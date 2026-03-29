import { Routes } from '@angular/router';

export const checkoutRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/address-step/address-step').then((m) => m.AddressStep),
  },
];
