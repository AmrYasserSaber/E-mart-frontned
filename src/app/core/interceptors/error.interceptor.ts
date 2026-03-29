import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

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

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // 401s are handled upstream by authRefreshInterceptor (which dispatches
      // logout on refresh failure). Skip toast for 401 to avoid duplicates.
      if (err.status !== 401) {
        toast.error(formatErrorMessage(err));
      }
      return throwError(() => err);
    }),
  );
};
