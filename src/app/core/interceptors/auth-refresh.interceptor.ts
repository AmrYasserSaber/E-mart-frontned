import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Subject, catchError, map, switchMap, take, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import { API_BASE_URL } from '../tokens/app.tokens';
import { StorageService } from '../services/storage.service';
import { AuthActions } from '../../shared/store/auth/auth.actions';
import type { ApiResponse } from '../models/api-response.model';
import { authTokensOnlySchema } from '../validation/auth.schemas';

const AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/verify-email',
  '/auth/resend-verification',
];

function isAuthPath(url: string): boolean {
  const lower = url.toLowerCase();
  const path = extractPathname(lower);
  return AUTH_PATHS.some((p) => path === p);
}

function extractPathname(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  const queryIdx = url.indexOf('?');
  return queryIdx === -1 ? url : url.slice(0, queryIdx);
}

let isRefreshing = false;
let refreshToken$ = new Subject<string>();

function addAuthHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  if (isAuthPath(req.url)) {
    return next(req);
  }

  const storage = inject(StorageService);
  const store = inject(Store);
  const http = inject(HttpClient);
  const baseUrl = inject(API_BASE_URL);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }

      const refresh = storage.getRefreshToken();
      if (!refresh) {
        store.dispatch(AuthActions.logout());
        return throwError(() => err);
      }

      if (isRefreshing) {
        return refreshToken$.pipe(
          take(1),
          switchMap((newToken) => next(addAuthHeader(req, newToken))),
        );
      }

      isRefreshing = true;
      refreshToken$ = new Subject<string>();

      return http
        .post<ApiResponse<unknown>>(`${baseUrl}/auth/refresh`, { refreshToken: refresh })
        .pipe(
          map((res) => res.data),
          switchMap((raw) => {
            const result = authTokensOnlySchema.safeParse(raw);
            if (!result.success) {
              throw new Error('Invalid refresh response.');
            }
            storage.setAccessToken(result.data.accessToken);
            storage.setRefreshToken(result.data.refreshToken);
            isRefreshing = false;
            refreshToken$.next(result.data.accessToken);
            refreshToken$.complete();
            return next(addAuthHeader(req, result.data.accessToken));
          }),
          catchError((refreshErr: unknown) => {
            isRefreshing = false;
            refreshToken$.error(refreshErr);
            store.dispatch(AuthActions.logout());
            return throwError(() => refreshErr);
          }),
        );
    }),
  );
};
