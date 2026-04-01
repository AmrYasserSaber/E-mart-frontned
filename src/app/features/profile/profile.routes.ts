import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile-home/profile-home').then((m) => m.ProfileHome),
  },
  {
    path: 'edit',
    loadComponent: () => import('./edit-profile/edit-profile').then((m) => m.EditProfile),
  },
];
