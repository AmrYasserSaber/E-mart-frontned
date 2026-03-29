import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { StorageService } from '../../../core/services/storage.service';
import type {
  AuthTokensOnlyResponse,
  AuthTokensResponse,
} from '../../../core/models/user.model';
import type { User } from '../../../core/models/user.model';
import { AuthActions } from './auth.actions';

function errMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'error' in err) {
    const e = err as { error?: { message?: string | string[] } };
    const m = e.error?.message;
    if (Array.isArray(m)) return m.join(', ');
    if (typeof m === 'string') return m;
  }
  return 'Request failed';
}

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.api
          .post<AuthTokensOnlyResponse>('/auth/login', { email, password })
          .pipe(
            map((tokens) => AuthActions.loginSuccess(tokens)),
            catchError((err) =>
              of(AuthActions.loginFailure({ error: errMessage(err) })),
            ),
          ),
      ),
    ),
  );

  persistTokensAndLoadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ accessToken, refreshToken }) => {
        this.storage.setAccessToken(accessToken);
        this.storage.setRefreshToken(refreshToken);
      }),
      map(() => AuthActions.loadUser()),
    ),
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap((body) =>
        this.api.post<AuthTokensResponse>('/auth/register', body).pipe(
          map((res) => AuthActions.registerSuccess(res)),
          catchError((err) =>
            of(AuthActions.registerFailure({ error: errMessage(err) })),
          ),
        ),
      ),
    ),
  );

  persistRegister$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(({ accessToken, refreshToken, user }) => {
        this.storage.setAuthSession(accessToken, refreshToken, user);
      }),
    ),
    { dispatch: false },
  );

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUser),
      switchMap(() =>
        this.api.get<User>('/auth/me').pipe(
          map((user) => AuthActions.loadUserSuccess({ user })),
          catchError((err) =>
            of(AuthActions.loadUserFailure({ error: errMessage(err) })),
          ),
        ),
      ),
    ),
  );

  syncUserToStorage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loadUserSuccess),
        tap(({ user }) => this.storage.setUser(user)),
      ),
    { dispatch: false },
  );

  redirectAfterLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loadUserSuccess),
        tap(() => {
          if (this.router.url.includes('/auth/login')) {
            void this.router.navigateByUrl('/home');
          }
        }),
      ),
    { dispatch: false },
  );

  /** New accounts should verify email */
  redirectAfterRegister$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => {
          if (this.router.url.includes('/auth/register')) {
            void this.router.navigateByUrl('/auth/verify-email');
          }
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() => {
        const refresh = this.storage.getRefreshToken();
        if (!refresh) {
          return of(AuthActions.logoutSuccess());
        }
        return this.api
          .post<{ success: true }>('/auth/logout', { refreshToken: refresh })
          .pipe(
            map(() => AuthActions.logoutSuccess()),
            catchError(() => of(AuthActions.logoutSuccess())),
          );
      }),
    ),
  );

  clearStorageOnLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => this.storage.clearAuth()),
        tap(() => this.router.navigateByUrl('/home')),
      ),
    { dispatch: false },
  );
}
