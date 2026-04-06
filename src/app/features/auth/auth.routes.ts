import { Routes } from '@angular/router';
import { AuthShellComponent } from './auth-shell/auth-shell.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
        data: { animation: 'authLogin' },
      },
      {
        path: 'register',
        loadComponent: () => import('./register/register').then((m) => m.Register),
        data: { animation: 'authRegister' },
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./forgot-password/forgot-password').then((m) => m.ForgotPassword),
        data: { animation: 'authPlain' },
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./verify-email/verify-email').then((m) => m.VerifyEmail),
        data: { animation: 'authPlain' },
      },
      {
        path: 'oauth-callback',
        loadComponent: () =>
          import('./oauth-callback/oauth-callback.component').then((m) => m.OAuthCallbackComponent),
        data: { animation: 'authPlain' },
      },
    ],
  },
];
