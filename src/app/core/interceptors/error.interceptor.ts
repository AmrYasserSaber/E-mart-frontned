import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import { ToastService } from '../services/toast.service';
import { AuthActions } from '../../shared/store/auth/auth.actions';

function formatErrorMessage(err: HttpErrorResponse): string {
  const body = err.error as
    | { message?: string | string[] }
    | string
    | undefined;
  if (typeof body === 'string') return body;
  const m = body?.message;
  if (Array.isArray(m)) return m.join(', ');
  if (typeof m === 'string') return m;
  return err.message || 'Something went wrong';
}

function shouldClearSessionOn401(url: string): boolean {
  const path = url.toLowerCase();
  if (path.includes('/auth/login')) return false;
  if (path.includes('/auth/register')) return false;
  if (path.includes('/auth/logout')) return false;
  return true;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const store = inject(Store);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && shouldClearSessionOn401(req.url)) {
        store.dispatch(AuthActions.logout());
      }
      toast.error(formatErrorMessage(err));
      return throwError(() => err);
    }),
  );
};
