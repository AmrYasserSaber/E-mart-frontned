import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile-home/profile-home').then((m) => m.ProfileHome),
  },
];
