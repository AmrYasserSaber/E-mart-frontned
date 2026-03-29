import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { sanitizeReturnUrl } from '../../../core/utils/url.utils';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { StorageService } from '../../../core/services/storage.service';
import type { User } from '../../../core/models/user.model';
import { AuthActions } from './auth.actions';
import {
  authTokensOnlySchema,
  authTokensWithUserSchema,
} from '../../../core/validation/auth.schemas';
import { parseHttpAuthError } from '../../../core/validation/auth-error.utils';

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
          .post<unknown>('/auth/login', { email, password })
          .pipe(
            map((raw) => {
              const result = authTokensOnlySchema.safeParse(raw);
              if (!result.success) {
                throw new Error('Invalid login response from server.');
              }
              return AuthActions.loginSuccess(result.data);
            }),
            catchError((err) =>
              of(AuthActions.loginFailure({ error: parseHttpAuthError(err) })),
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
        this.api.post<unknown>('/auth/register', body).pipe(
          map((raw) => {
            const result = authTokensWithUserSchema.safeParse(raw);
            if (!result.success) {
              throw new Error('Invalid register response from server.');
            }
            return AuthActions.registerSuccess(result.data);
          }),
          catchError((err) =>
            of(AuthActions.registerFailure({ error: parseHttpAuthError(err) })),
          ),
        ),
      ),
    ),
  );

  persistRegister$ = createEffect(
    () =>
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
            of(AuthActions.loadUserFailure({ error: parseHttpAuthError(err) })),
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
          if (!this.router.url.startsWith('/auth')) return;
          const tree = this.router.parseUrl(this.router.url);
          const returnUrl = sanitizeReturnUrl(tree.queryParams['returnUrl']);
          void this.router.navigateByUrl(returnUrl);
        }),
      ),
    { dispatch: false },
  );

  /** New accounts should verify email before accessing the app.
   *  The email is passed as a query param so it survives a page refresh
   *  on the lazy-loaded verify-email route. */
  redirectAfterRegister$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(({ user }) => {
          void this.router.navigate(['/auth/verify-email'], {
            queryParams: { email: user.email },
          });
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
        tap(() => void this.router.navigateByUrl('/auth/login')),
      ),
    { dispatch: false },
  );
}
